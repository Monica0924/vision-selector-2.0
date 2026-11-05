// Firebase Firestore persistence and Authentication for BGR NEO Vision Selector.
(function (root) {
  'use strict';

  const config = root.firebaseConfig || root.VISION_SELECTOR_FIREBASE || {};
  const hasConfig = !!(config.apiKey && config.authDomain && config.projectId && config.appId);
  const firebase = root.firebase;
  if (hasConfig && firebase && !firebase.apps.length) firebase.initializeApp(config);

  const db = hasConfig && firebase && typeof firebase.firestore === 'function'
    ? firebase.firestore()
    : null;
  const auth = hasConfig && firebase && typeof firebase.auth === 'function'
    ? firebase.auth()
    : null;
  const collection = 'project_workflow';

  function requireDatabase() {
    if (!db) {
      throw new Error('Firebase Firestore is not configured. Check firebase-config.js and Firebase SDK loading.');
    }
    return db;
  }

  function report(error) {
    if (error && error.code === 'permission-denied') {
      console.error('[VisionSelector] Firestore permission denied. Check published Firestore rules and administrator authorization:', error.message);
    } else if (error && error.message && error.message.includes('has not been used')) {
      console.error('[VisionSelector] Cloud Firestore API is disabled or not provisioned:', error.message);
    } else {
      console.error('[VisionSelector] Firebase operation failed:', error);
    }
  }

  function projectDocument(project) {
    if (!project || typeof project.id !== 'string' || !project.id.trim()) {
      throw new Error('A valid project ID is required.');
    }
    return {
      type: 'project',
      project,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
  }

  async function signInAdmin(email, password) {
    if (!auth) throw new Error('Firebase Authentication is not available or not loaded.');
    const cleanEmail = email && email.includes('@')
      ? email.trim()
      : `${(email || 'admin').trim()}@bgrneo.com`;
    const credential = await auth.signInWithEmailAndPassword(cleanEmail, password);
    return credential.user;
  }

  async function signOutAdmin() {
    if (auth) await auth.signOut();
  }

  function onAuthStateChanged(callback) {
    if (!auth) return () => {};
    return auth.onAuthStateChanged(callback);
  }

  function getCurrentUser() {
    return auth ? auth.currentUser : null;
  }

  // Public creation uses Firestore create(), never set()/merge(), so it cannot overwrite.
  async function createProject(project) {
    const database = requireDatabase();
    try {
      const reference = database.collection(collection).doc(project.id);
      await database.runTransaction(async transaction => {
        const existing = await transaction.get(reference);
        if (existing.exists) {
          throw new Error('A project with this ID already exists. Please submit again.');
        }
        transaction.set(reference, projectDocument(project));
      });
      return true;
    } catch (error) {
      report(error);
      throw error;
    }
  }

  // Existing project updates are restricted by Firestore rules to administrators.
  async function saveProject(project) {
    const database = requireDatabase();
    try {
      await database.collection(collection).doc(project.id).set(projectDocument(project));
      return true;
    } catch (error) {
      report(error);
      throw error;
    }
  }

  async function deleteProject(id) {
    const database = requireDatabase();
    if (!id || id === 'camera_catalog') throw new Error('Invalid project ID.');
    try {
      await database.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      report(error);
      throw error;
    }
  }

  // The camera catalogue is bundled with the app and is intentionally read-only.
  function subscribe(onChange, onError) {
    const database = requireDatabase();
    if (typeof onChange !== 'function') throw new Error('A snapshot callback is required.');
    return database.collection(collection).onSnapshot(snapshot => {
      const projects = [];
      snapshot.forEach(document => {
        if (document.id === 'camera_catalog') return;
        const data = document.data() || {};
        if (data.type === 'project' && data.project) projects.push(data.project);
      });
      onChange({ projects });
    }, error => {
      report(error);
      if (typeof onError === 'function') onError(error);
    });
  }

  root.VisionFirebaseStore = {
    configured: !!db,
    hasAuth: !!auth,
    projectId: config.projectId || 'visionselector',
    signInAdmin,
    signOutAdmin,
    onAuthStateChanged,
    getCurrentUser,
    createProject,
    saveProject,
    deleteProject,
    subscribe
  };
}(typeof globalThis !== 'undefined' ? globalThis : window));
