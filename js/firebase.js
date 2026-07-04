import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyAZNTWIVHAPn-IIXtzd1_G_aqlsyuAJIzg",

authDomain: "rafiq-db1b9.firebaseapp.com",

projectId: "rafiq-db1b9",

storageBucket: "rafiq-db1b9.firebasestorage.app",

messagingSenderId: "718212041226",

appId: "1:718212041226:web:2e1d743ce140b5342aedf3"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };