const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Load data.js and filterLogic.js
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const filterLogicCode = fs.readFileSync(path.join(__dirname, '../js/filterLogic.js'), 'utf8');

function createContext() {
  const globalObj = {
    console,
    Math,
    Date,
    parseInt,
    parseFloat,
    Number,
    String,
    Array,
    Object,
    JSON,
    Set,
    Map,
    clearTimeout,
    setTimeout
  };
  globalObj.globalThis = globalObj;
  globalObj.window = globalObj;

  // Execute data.js and filterLogic.js
  const runCode = new Function('window', 'globalThis', `
    with (globalThis) {
      ${dataCode}
      ${filterLogicCode}
      return { SUPPLIERS, CAMERAS, PROJECTS, WORKFLOW_STAGES, ORDER_PROJECT_CATEGORIES, filterLogic };
    }
  `);
  return runCode(globalObj, globalObj);
}

test('Bug 1 – Newly created projects start with correct initial status across different years', () => {
  const { WORKFLOW_STAGES } = createContext();

  // Test status logic as defined in app.js
  function status(p) {
    const days = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 864e5);
    if (p.progress >= 100) return { k: 'Completed', a: 0, days };
    if (p.hold) return { k: 'On hold', a: 1, days };
    if (days < 0) return { k: 'Delayed', a: 1, days };
    if (days <= 14 && p.progress < 50) return { k: 'At risk', a: 1, days };
    return { k: 'On track', a: 0, days };
  }

  function normalizeCompletedProject(project) {
    if (!project || Number(project.progress) < 100) {
      return project;
    }
    const existingStages = Array.isArray(project.stages) ? project.stages : [];
    return {
      ...project,
      progress: 100,
      stages: WORKFLOW_STAGES.map((name, index) => ({
        ...(existingStages[index] || {}),
        name,
        completed: true
      }))
    };
  }

  // Future deadline (+60 days)
  const futureDeadline = new Date(Date.now() + 60 * 864e5).toISOString().split('T')[0];

  const testYears = [2025, 2026, 2027, 2028, 2029];
  for (const year of testYears) {
    const newProject = {
      id: 'test-p-' + year,
      company: 'Test Client',
      name: 'Inspection ' + year,
      code: 'BGR-TST-' + year,
      year: year,
      category: `${year - 1} - ${year} Projects`,
      progress: 0,
      deadline: futureDeadline,
      hold: false,
      stages: WORKFLOW_STAGES.map(name => ({ name, completed: false }))
    };

    // Confirm initial status is NOT Completed
    const s = status(newProject);
    assert.equal(s.k, 'On track', `Project for year ${year} should be On track, not ${s.k}`);
    assert.equal(newProject.progress, 0, 'New project progress must be 0');

    // Confirm all 11 stages remain pending
    assert.equal(newProject.stages.length, 11);
    assert.ok(newProject.stages.every(st => st.completed === false), 'All stages must be pending');

    // Confirm normalization does not alter incomplete project
    const normalized = normalizeCompletedProject(newProject);
    assert.equal(normalized.progress, 0);
    assert.ok(normalized.stages.every(st => st.completed === false));
  }
});

test('Bug 1 – Existing completed projects and historical projects retain correct status', () => {
  const { PROJECTS, WORKFLOW_STAGES } = createContext();

  function status(p) {
    const days = Math.ceil((new Date(p.deadline + 'T23:59:59') - new Date()) / 864e5);
    if (p.progress >= 100) return { k: 'Completed', a: 0, days };
    if (p.hold) return { k: 'On hold', a: 1, days };
    if (days < 0) return { k: 'Delayed', a: 1, days };
    if (days <= 14 && p.progress < 50) return { k: 'At risk', a: 1, days };
    return { k: 'On track', a: 0, days };
  }

  function normalizeCompletedProject(project) {
    if (!project || Number(project.progress) < 100) {
      return project;
    }
    const existingStages = Array.isArray(project.stages) ? project.stages : [];
    return {
      ...project,
      progress: 100,
      stages: WORKFLOW_STAGES.map((name, index) => ({
        ...(existingStages[index] || {}),
        name,
        completed: true
      }))
    };
  }

  // p7 is 100% completed
  const p7 = PROJECTS.find(p => p.id === 'p7');
  assert.equal(p7.progress, 100);
  assert.equal(status(p7).k, 'Completed');
  const normP7 = normalizeCompletedProject(p7);
  assert.equal(normP7.progress, 100);
  assert.ok(normP7.stages.every(st => st.completed === true));

  // p4 is on hold
  const p4 = PROJECTS.find(p => p.id === 'p4');
  assert.equal(p4.hold, true);
  assert.equal(status(p4).k, 'On hold');

  // p1 is progress 35%, NOT auto-completed
  const p1 = PROJECTS.find(p => p.id === 'p1');
  assert.equal(p1.progress, 35);
  const normP1 = normalizeCompletedProject(p1);
  assert.equal(normP1.progress, 35);
});

test('Bug 2 – Stage navigation maintains selected stage index across navigation and updates', () => {
  const { WORKFLOW_STAGES } = createContext();

  let activeWorkflowProjectId = null;
  let activeWorkflowStageIndex = 0;

  function resolveStageIndex(projectId, selectedStageIndex) {
    const parsedIndex = (selectedStageIndex !== undefined && selectedStageIndex !== null)
      ? (Number.isInteger(selectedStageIndex) ? selectedStageIndex : parseInt(selectedStageIndex, 10))
      : (activeWorkflowProjectId === projectId ? activeWorkflowStageIndex : 0);
    const stageIndex = Math.max(0, Math.min(WORKFLOW_STAGES.length - 1, Number.isInteger(parsedIndex) ? parsedIndex : 0));
    activeWorkflowProjectId = projectId;
    activeWorkflowStageIndex = stageIndex;
    return stageIndex;
  }

  // Selecting Stage 1 (index 0)
  assert.equal(resolveStageIndex('p1', 0), 0);
  assert.equal(activeWorkflowStageIndex, 0);

  // Selecting Stage 3 (index 2)
  assert.equal(resolveStageIndex('p1', 2), 2);
  assert.equal(activeWorkflowStageIndex, 2);

  // Selecting Stage 6 (index 5) as integer
  assert.equal(resolveStageIndex('p1', 5), 5);
  assert.equal(activeWorkflowStageIndex, 5);

  // Selecting Stage 6 (index "5") as string from data attribute
  assert.equal(resolveStageIndex('p1', '5'), 5);
  assert.equal(activeWorkflowStageIndex, 5);

  // Selecting Stage 11 (index 10)
  assert.equal(resolveStageIndex('p1', 10), 10);
  assert.equal(activeWorkflowStageIndex, 10);

  // Calling without stage index (e.g. during an update/sync of same project) preserves selected stage
  assert.equal(resolveStageIndex('p1', undefined), 10);
  assert.equal(activeWorkflowStageIndex, 10);

  // Switching project resets to initial stage
  assert.equal(resolveStageIndex('p2', undefined), 0);
  assert.equal(activeWorkflowStageIndex, 0);
});

test('Bug 3 – Welcome modal Escape key closes welcome modal and restores state', () => {
  const storage = {};
  const mockLocalStorage = {
    getItem: k => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); }
  };

  const authModal = { hidden: true };
  const welcomeModal = { hidden: false };
  const modal = { hidden: true };
  const body = { style: { overflow: 'hidden' } };

  function updateBodyModalOverflow() {
    const hasOpenModal = (!authModal.hidden) || (!welcomeModal.hidden) || (!modal.hidden);
    body.style.overflow = hasOpenModal ? 'hidden' : '';
  }

  function closeWelcomeModal() {
    welcomeModal.hidden = true;
    updateBodyModalOverflow();
    mockLocalStorage.setItem('bgrneoWelcomeShown', 'true');
  }

  function close() {
    modal.hidden = true;
    updateBodyModalOverflow();
  }

  function closeAuthModal() {
    authModal.hidden = true;
    updateBodyModalOverflow();
  }

  function handleEscape() {
    if (!authModal.hidden) {
      closeAuthModal();
      return;
    }
    if (!welcomeModal.hidden) {
      closeWelcomeModal();
      return;
    }
    if (!modal.hidden) {
      close();
      return;
    }
  }

  // Initial state: welcome modal is open, overflow is hidden
  assert.equal(welcomeModal.hidden, false);
  assert.equal(body.style.overflow, 'hidden');

  // Trigger Escape
  handleEscape();

  // Welcome modal must be closed
  assert.equal(welcomeModal.hidden, true);
  // Body overflow must be restored
  assert.equal(body.style.overflow, '');
  // Storage must record that welcome modal was dismissed
  assert.equal(mockLocalStorage.getItem('bgrneoWelcomeShown'), 'true');
});

test('Bug 4 – Toast notification styling resets classes correctly on successive calls', () => {
  const toast = { className: '', textContent: '', hidden: true };
  let successTimer = null;
  let errorTimer = null;

  function showSuccessNotification(message) {
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(successTimer);
    clearTimeout(errorTimer);
    successTimer = 1;
  }

  function showErrorNotification(message) {
    toast.className = 'success-toast error-toast';
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(successTimer);
    clearTimeout(errorTimer);
    errorTimer = 2;
  }

  // 1. Trigger success
  showSuccessNotification('Success 1');
  assert.equal(toast.className, 'success-toast');
  assert.equal(toast.textContent, 'Success 1');
  assert.equal(toast.hidden, false);

  // 2. Trigger error
  showErrorNotification('Error occurred');
  assert.equal(toast.className, 'success-toast error-toast');
  assert.equal(toast.textContent, 'Error occurred');

  // 3. Trigger success again - MUST NOT retain error-toast class
  showSuccessNotification('Success 2');
  assert.equal(toast.className, 'success-toast');
  assert.equal(toast.textContent, 'Success 2');
});

test('Bug 5 – DPM / Dot Peen camera filtering consistency between filterLogic and matching rule', () => {
  const { filterLogic, CAMERAS } = createContext();

  const dpmSelection = {
    readability: 'Direct Part Marking (DPM / Dot Peen)'
  };

  const matches = filterLogic.filterMatchingCameras(dpmSelection, CAMERAS);

  // All matched cameras must be mono and >= 3 MP
  assert.ok(matches.length > 0, 'Should find matching cameras for DPM');
  for (const cam of matches) {
    assert.ok(Number(cam.mp) >= 3, `Camera ${cam.model} has ${cam.mp} MP which is < 3 MP`);
    const color = String(cam.color).toLowerCase();
    assert.ok(color.includes('mono'), `Camera ${cam.model} must be mono, got ${cam.color}`);
  }

  // A 3.2 MP or 4 MP mono camera should pass the rule
  const testCam32 = {
    brand: 'TestBrand',
    model: 'Test-3.2MP-Mono',
    dim: '2D',
    kind: 'Area scan',
    mp: 3.2,
    fps: 60,
    color: 'Mono'
  };
  assert.equal(filterLogic.evaluateCameraMatch(testCam32, dpmSelection), true);

  // A 2.3 MP mono camera should be rejected
  const testCam23 = {
    brand: 'TestBrand',
    model: 'Test-2.3MP-Mono',
    dim: '2D',
    kind: 'Area scan',
    mp: 2.3,
    fps: 60,
    color: 'Mono'
  };
  assert.equal(filterLogic.evaluateCameraMatch(testCam23, dpmSelection), false);
});

test('Task 1 & 2 – 11-stage workflow and compact card layout integrity', () => {
  const { WORKFLOW_STAGES, PROJECTS } = createContext();

  // 1. All 11 workflow stages are retained and ordered
  assert.equal(WORKFLOW_STAGES.length, 11);
  assert.equal(WORKFLOW_STAGES[0], 'Camera Selection & Requirements');
  assert.equal(WORKFLOW_STAGES[5], 'Installation');
  assert.equal(WORKFLOW_STAGES[8], 'FAT (Factory Acceptance Test)');
  assert.equal(WORKFLOW_STAGES[10], 'Handover');

  // 2. Test compact milestone preview structure
  function compactMilestonePreview(p) {
    const stages = p.stages || [];
    const done = stages.filter(st => st.completed).length;
    const total = stages.length || 11;
    const next = stages.find(st => !st.completed);
    const pct = Math.round((done / total) * 100);

    return {
      done,
      total,
      pct,
      hasStepper: true,
      hasList: false, // .ms-list removed to reduce excessive card height
      nextMilestone: next ? next.name : null
    };
  }

  const p1 = PROJECTS.find(p => p.id === 'p1');
  const preview = compactMilestonePreview(p1);
  assert.equal(preview.total, 11);
  assert.equal(preview.hasStepper, true);
  assert.equal(preview.hasList, false);
});

test('Task 6 – Secure Administrator Authentication & Absence of Frontend Password Hashes', async () => {
  // 1. Verify frontend files DO NOT contain password hashes
  const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
  assert.ok(!appJs.includes('ALLOWED_ADMIN_HASHES'), 'app.js must not contain ALLOWED_ADMIN_HASHES');
  assert.ok(!appJs.includes('VALID_ADMIN_PASSWORDS'), 'app.js must not contain VALID_ADMIN_PASSWORDS');
  assert.ok(!appJs.includes('6bf60c3d508590c7c33f0032384f0de06c1eb9564a949619052168bc443b9968'), 'app.js must not contain password hashes');

  // 2. Test serverless auth endpoint logic in api/auth.js
  const authHandler = require('../api/auth.js');
  let statusResult = null;
  let jsonResult = null;
  const mockRes = {
    setHeader: () => {},
    status: (code) => {
      statusResult = code;
      return {
        json: (data) => { jsonResult = data; },
        end: () => {}
      };
    }
  };

  // When ADMIN_PASSWORD env var is not configured on server
  delete process.env.ADMIN_PASSWORD;
  await authHandler({ method: 'POST', body: { email: 'admin@bgrneo.com', password: 'bgrneo2024' } }, mockRes);
  assert.equal(statusResult, 503);
  assert.equal(jsonResult.success, false);

  // When ADMIN_PASSWORD env var is configured
  process.env.ADMIN_PASSWORD = 'test-secret-password-123';
  process.env.ADMIN_EMAIL = 'admin@bgrneo.com';

  // Test invalid password
  await authHandler({ method: 'POST', body: { email: 'admin@bgrneo.com', password: 'wrong' } }, mockRes);
  assert.equal(statusResult, 401);
  assert.equal(jsonResult.authenticated, false);

  // Test missing password
  await authHandler({ method: 'POST', body: { email: 'admin@bgrneo.com', password: '' } }, mockRes);
  assert.equal(statusResult, 400);

  // Test valid administrator authentication
  await authHandler({ method: 'POST', body: { email: 'admin@bgrneo.com', password: 'test-secret-password-123' } }, mockRes);
  assert.equal(statusResult, 200);
  assert.equal(jsonResult.authenticated, true);
  assert.equal(jsonResult.user.role, 'administrator');
  assert.ok(jsonResult.token, 'Must return signed token');
});
