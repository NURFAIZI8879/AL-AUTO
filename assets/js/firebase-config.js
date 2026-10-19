// =========================================================
// AL AUTO — Firebase Configuration
// Ganti nilai di bawah dengan config dari Firebase Console.
// Firebase Console -> Project Settings -> Your apps -> Web app.
// =========================================================
window.firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
// Set true setelah Anda mengisi config di atas.
window.firebaseReady = false;