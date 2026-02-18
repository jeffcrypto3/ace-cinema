// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbDcMP3s3tgncwDBA2zEoMMrgBvAro8Fc",
  authDomain: "acecinema-51068.firebaseapp.com",
  projectId: "acecinema-51068",
  storageBucket: "acecinema-51068.firebasestorage.app",
  messagingSenderId: "5582685149",
  appId: "1:5582685149:web:9348cdb7a498b6726fec34"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Make db available globally
window.db = db;

console.log('Firebase initialized successfully');
