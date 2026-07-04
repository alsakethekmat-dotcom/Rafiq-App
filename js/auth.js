import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 1. إنشاء حساب جديد
export async function registerUser(role) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (password !== confirmPassword) {
        message.style.color = "red";
        message.innerHTML = "كلمتا المرور غير متطابقتين.";
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name,
            email: email,
            role: role,
            createdAt: serverTimestamp()
        });
        message.style.color = "green";
        message.innerHTML = "تم إنشاء الحساب بنجاح... جاري التحويل.";
        setTimeout(() => window.location.href = (role === 'parent') ? "parent.html" : "mentor.html", 1500);
    } catch (error) {
        message.style.color = "red";
        message.innerHTML = "خطأ: " + error.message;
    }
}

// 2. تسجيل الدخول العادي
export async function loginUser(expectedRole) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const snap = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (snap.data().role !== expectedRole && snap.data().role !== "admin") {
            throw new Error("هذا الحساب غير مسجل ضمن هذه الفئة.");
        }
        window.location.href = (snap.data().role === 'admin') ? "admin.html" : (expectedRole === 'parent' ? "parent.html" : "mentor.html");
    } catch (error) {
        message.style.color = "red";
        message.innerHTML = error.message;
    }
}

// 3. تسجيل الدخول بجوجل
const provider = new GoogleAuthProvider();
export async function loginWithGoogle(role) {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) {
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                role: role,
                createdAt: new Date()
            });
        }
        window.location.href = (role === 'parent') ? "parent.html" : "mentor.html";
    } catch (error) {
        alert("خطأ في تسجيل الدخول بجوجل: " + error.message);
    }
}
