// Firebase Web App configuration for BGR NEO Vision Selector
// Project ID: visionselector
const firebaseConfig = {
  apiKey: "AIzaSyBNzMDra02uXr66xkONIflgssS_S6XQ4h8",
  authDomain: "visionselector.firebaseapp.com",
  projectId: "visionselector",
  storageBucket: "visionselector.firebasestorage.app",
  messagingSenderId: "280341943205",
  appId: "1:280341943205:web:6b1a9df843ba3099298e4c",
  measurementId: "G-4NREKXZ8XN"
};

// Browser window exports
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.VISION_SELECTOR_FIREBASE = firebaseConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}
