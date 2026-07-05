import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {

apiKey: "AIzaSyDpVIinPrAxXYuIUNLfOWOMKVfKUmo-r6E",

authDomain: "rafeeqapp-83caf.firebaseapp.com",

projectId: "rafeeqapp-83caf",

storageBucket: "rafeeqapp-83caf.firebasestorage.app",

messagingSenderId: "925088444548",

appId: "1:925088444548:web:bdbac993bbf910435052d1"

};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
