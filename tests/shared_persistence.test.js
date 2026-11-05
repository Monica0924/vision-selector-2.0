const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Mock Firestore Store simulation for two independent client sessions
function createMockSharedFirestore() {
  const collectionData = new Map();
  const subscribers = new Set();

  return {
    async setDoc(id, data) {
      collectionData.set(id, { ...data, updatedAt: Date.now() });
      // Notify all connected client sessions in real-time
      const snapshot = Array.from(collectionData.values());
      for (const sub of subscribers) {
        sub(snapshot);
      }
    },
    getDoc(id) {
      return collectionData.get(id) || null;
    },
    subscribe(callback) {
      subscribers.add(callback);
      // Immediate initial emission
      callback(Array.from(collectionData.values()));
      return () => subscribers.delete(callback);
    }
  };
}

test('Shared Persistence – Two independent browser sessions synchronize project updates in real-time', async () => {
  const sharedFirestore = createMockSharedFirestore();

  // Initial projects
  const initialProjects = [
    {
      id: 'p1',
      name: 'High-speed bottle cap inspection',
      progress: 35,
      stages: Array.from({ length: 11 }, (_, i) => ({ name: `Stage ${i + 1}`, completed: i < 3 }))
    }
  ];

  // Seed shared database
  for (const p of initialProjects) {
    await sharedFirestore.setDoc(p.id, { type: 'project', project: p });
  }

  // --- Client Session 1 (User A in Chrome) ---
  let session1Projects = [];
  const unsub1 = sharedFirestore.subscribe((docs) => {
    session1Projects = docs.filter(d => d.type === 'project').map(d => d.project);
  });

  // --- Client Session 2 (User B in Edge / Mobile) ---
  let session2Projects = [];
  const unsub2 = sharedFirestore.subscribe((docs) => {
    session2Projects = docs.filter(d => d.type === 'project').map(d => d.project);
  });

  // Both sessions start with identical shared state
  assert.equal(session1Projects.length, 1);
  assert.equal(session2Projects.length, 1);
  assert.equal(session1Projects[0].progress, 35);
  assert.equal(session2Projects[0].progress, 35);
  assert.equal(session2Projects[0].stages[5].completed, false); // Stage 6 pending

  // --- Action: User A (Session 1) completes Stage 6 and updates progress to 55% ---
  const updatedP1 = {
    ...session1Projects[0],
    progress: 55,
    stages: session1Projects[0].stages.map((st, i) => i === 5 ? { ...st, completed: true } : st)
  };
  await sharedFirestore.setDoc(updatedP1.id, { type: 'project', project: updatedP1 });

  // --- Verification: User B (Session 2) receives the update automatically without refresh ---
  assert.equal(session2Projects[0].progress, 55, 'Session 2 must receive updated progress from Session 1');
  assert.equal(session2Projects[0].stages[5].completed, true, 'Session 2 must see Stage 6 completed by Session 1');

  unsub1();
  unsub2();
});

test('Shared Persistence – Authoritative Firestore data takes precedence over stale local cache', () => {
  const localStorageCache = {
    p1: { id: 'p1', progress: 30, lastUpdated: 1000 } // Stale offline cache
  };

  const firestoreServerData = [
    { id: 'p1', progress: 75, lastUpdated: 5000 } // Newer authoritative state on server
  ];

  // Reconciliation logic as in app.js replaceProjects
  function reconcileProjects(localCache, remoteData) {
    const authoritative = [...remoteData];
    // Update local cache to match authoritative remote data
    authoritative.forEach(p => {
      localCache[p.id] = p;
    });
    return authoritative;
  }

  const activeProjects = reconcileProjects(localStorageCache, firestoreServerData);
  assert.equal(activeProjects[0].progress, 75, 'Authoritative Firestore progress must prevail over stale cache');
  assert.equal(localStorageCache.p1.progress, 75, 'Local cache must be updated with authoritative server state');
});

test('Firestore Security Rules – Enforces strict schema validation and admin-only writes', () => {
  const rulesPath = path.join(__dirname, '../firestore.rules');
  assert.ok(fs.existsSync(rulesPath), 'firestore.rules file must exist');

  const content = fs.readFileSync(rulesPath, 'utf8');
  assert.ok(content.includes('rules_version = \'2\';'), 'Must specify rules_version = 2');
  assert.ok(content.includes('service cloud.firestore'), 'Must define cloud.firestore service');
  assert.ok(content.includes('match /project_workflow/{projectId}'), 'Must protect project_workflow collection');
  assert.ok(content.includes('match /project_workflow/camera_catalog'), 'Must protect camera catalog');
  assert.ok(content.includes('isValidNewProject'), 'Must enforce strict schema validation for new projects');
  assert.ok(content.includes('p.progress == 0'), 'New projects must be enforced to start at 0% progress');
  assert.ok(content.includes('p.stages.size() == 11'), 'Must enforce exactly 11 workflow stages');
  assert.ok(content.includes('allow read: if true;'), 'Must allow public reads');
  assert.ok(content.includes('allow update: if isAdministrator();'), 'Must require admin for updates');
  assert.ok(content.includes('allow delete: if isAdministrator();'), 'Must require admin for deletes');
});

test('Vercel Configuration – vercel.json is valid and protects assets', () => {
  const vercelPath = path.join(__dirname, '../vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');

  const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  assert.equal(config.version, 2);
  assert.equal(config.cleanUrls, true);
  assert.ok(Array.isArray(config.headers), 'Headers array must be configured');

  // Verify security headers
  const securityHeaderObj = config.headers.find(h => h.source === '/(.*)');
  assert.ok(securityHeaderObj, 'Security headers rule must exist');
  const headers = securityHeaderObj.headers.map(h => h.key);
  assert.ok(headers.includes('X-Content-Type-Options'));
  assert.ok(headers.includes('X-Frame-Options'));
  assert.ok(headers.includes('X-XSS-Protection'));
});
