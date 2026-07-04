import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ==============================
// إنشاء حساب
// ==============================
export async function registerUser(role) {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");
    const spinner = document.getElementById("loadingSpinner");
    const submitBtn = document.querySelector("button[type='submit']");

    message.innerHTML = "";
    
    if (password !== confirmPassword) {
        message.style.color = "red";
        message.innerHTML = "كلمتا المرور غير متطابقتين.";
        return;
    }

    // إظهار التحميل وتعطيل الزر
    spinner.style.display = "block";
    submitBtn.disabled = true;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: role,
            createdAt: serverTimestamp()
        });

        message.style.color = "green";
        message.innerHTML = "تم إنشاء الحساب بنجاح... جاري تحويلك.";
        
        setTimeout(() => {
            if (role === "parent") {
                window.location.href = "parent.html";
            } else {
                window.location.href = "mentor.html";
            }
        }, 1500);

    } catch (error) {
        message.style.color = "red";
        switch (error.code) {
            case "auth/email-already-in-use":
                message.innerHTML = "هذا البريد الإلكتروني مستخدم بالفعل.";
                break;
            case "auth/invalid-email":
                message.innerHTML = "البريد الإلكتروني غير صحيح.";
                break;
            case "auth/weak-password":
                message.innerHTML = "يجب أن تكون كلمة المرور 6 أحرف على الأقل.";
                break;
            default:
                message.innerHTML = "حدث خطأ: " + error.message;
        }
        // إخفاء التحميل وإعادة تفعيل الزر في حالة الخطأ
        spinner.style.display = "none";
        submitBtn.disabled = false;
    }
}

// ==============================
// تسجيل الدخول
// ==============================
export async function loginUser(expectedRole) {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");
    const spinner = document.getElementById("loadingSpinner");
    const submitBtn = document.querySelector("button[type='submit']");

    message.innerHTML = "";
    spinner.style.display = "block";
    submitBtn.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
            message.style.color = "red";
            message.innerHTML = "تعذر العثور على بيانات المستخدم.";
            spinner.style.display = "none";
            submitBtn.disabled = false;
            return;
        }

        const data = snap.data();
        
        if (data.role !== expectedRole && data.role !== "admin") {
            message.style.color = "red";
            message.innerHTML = "هذا الحساب غير مسجل ضمن هذه الفئة.";
            spinner.style.display = "none";
            submitBtn.disabled = false;
            return;
        }

        message.style.color = "green";
        message.innerHTML = "تم تسجيل الدخول... جاري التحويل.";

        setTimeout(() => {
            if (data.role === "parent") {
                window.location.href = "parent.html";
            } else if (data.role === "mentor") {
                window.location.href = "mentor.html";
            } else if (data.role === "admin") {
                window.location.href = "admin.html";
            }
        }, 1000);

    } catch (error) {
        message.style.color = "red";
        switch (error.code) {
            case "auth/invalid-credential":
                message.innerHTML = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
                break;
            case "auth/user-not-found":
                message.innerHTML = "المستخدم غير موجود.";
                break;
            case "auth/wrong-password":
                message.innerHTML = "كلمة المرور غير صحيحة.";
                break;
            case "auth/invalid-email":
                message.innerHTML = "البريد الإلكتروني غير صالح.";
                break;
            default:
                message.innerHTML = "حدث خطأ: " + error.message;
        }
        spinner.style.display = "none";
        submitBtn.disabled = false;
    }
}
