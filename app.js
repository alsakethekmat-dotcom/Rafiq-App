// 1. استدعاء مكتبات فايربيس (تم استخدام الإصدار 11.6.1 لضمان استقرار التطبيق)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 2. إعدادات فايربيس الخاصة بمشروع رفيق
const firebaseConfig = {
    apiKey: "AIzaSyAZNTWIVHAPn-IIXtzd1_G_aqlsyuAJIzg",
    authDomain: "rafiq-db1b9.firebaseapp.com",
    projectId: "rafiq-db1b9",
    storageBucket: "rafiq-db1b9.firebasestorage.app",
    messagingSenderId: "718212041226",
    appId: "1:718212041226:web:2e1d743ce140b5342aedf3",
    measurementId: "G-YFWXXQW1ZY"
};

// 3. تهيئة فايربيس وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// --- باقي بيانات التطبيق والدوال ---
const guidesData = [
    { id: 'g1', name: 'لمى حسن', grade: 'الصف العاشر', rating: 5, reviews: 15, available: true },
    { id: 'g2', name: 'سارة أحمد', grade: 'الصف العاشر', rating: 5, reviews: 12, available: true },
    { id: 'g3', name: 'نور الهدى', grade: 'الصف التاسع', rating: 5, reviews: 8, available: true },
    { id: 'g4', name: 'ريم خالد', grade: 'الصف العاشر', rating: 4, reviews: 8, available: false },
    { id: 'g5', name: 'دانا يوسف', grade: 'الصف التاسع', rating: 4, reviews: 3, available: true },
    { id: 'g6', name: 'هبة محمد', grade: 'الصف الثامن', rating: 0, reviews: 0, available: true }
];

// لأننا نستخدم type="module"، يجب جعل الدوال متاحة على مستوى (window) لكي تعمل أزرار الـ HTML
window.navigate = function(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });
    
    const targetView = document.getElementById(`view-${viewName}`);
    targetView.classList.remove('hidden');
    targetView.classList.add('block');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('text-gray-400', 'md:text-gray-500');
    });
    
    const activeBtns = document.querySelectorAll(`.nav-item[data-target="view-${viewName}"]`);
    activeBtns.forEach(btn => {
        btn.classList.add('active');
        btn.classList.remove('text-gray-400', 'md:text-gray-500');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showToast = function(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.className = `fixed top-10 left-1/2 text-white px-8 py-4 rounded-2xl shadow-xl z-[100] flex items-center gap-3 font-bold text-lg border-2 ${isError ? 'bg-red-600 border-red-500' : 'bg-green-600 border-green-500'} transition-all duration-400 transform -translate-x-1/2`;
    
    const icon = isError ? '<i class="fa-solid fa-triangle-exclamation text-white text-2xl"></i>' : '<i class="fa-solid fa-circle-check text-white text-2xl"></i>';
    
    toast.innerHTML = `${icon} <span id="toast-message">${message}</span>`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
};

// دالة إرسال طلب الجلسة لفايربيس
window.handleRequestSubmit = async function(e) {
    e.preventDefault();
    
    const serviceType = document.querySelector('input[name="service_type"]:checked');
    if(!serviceType) {
        window.showToast('الرجاء اختيار نوع الخدمة الموجهة.', true);
        return;
    }

    const studentName = e.target.querySelector('input[type="text"]').value;
    const grade = e.target.querySelectorAll('select')[0].value;
    const period = e.target.querySelectorAll('select')[1].value;
    const guideId = document.getElementById('guideSelectDropdown').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "requests"), {
            studentName: studentName,
            grade: grade,
            period: period,
            serviceType: serviceType.value,
            guideId: guideId,
            status: "pending", 
            timestamp: serverTimestamp()
        });

        window.showToast('تم إرسال طلب الجلسة بنجاح! سيتم إشعارك قريباً.');
        e.target.reset();
        setTimeout(() => window.navigate('home'), 2000);

    } catch (error) {
        console.error("خطأ في فايربيس:", error);
        window.showToast('حدث خطأ في الاتصال بقاعدة البيانات. حاولي مرة أخرى.', true);
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
};

// دالة حفظ التقييم في فايربيس
window.handleEvalSubmit = async function(e) {
    e.preventDefault();
    const rating = document.getElementById('ratingValue').value;
    if(!rating) {
        window.showToast('الرجاء تحديد التقييم بالنجوم أولاً.', true);
        return;
    }

    const guideId = document.getElementById('evalGuideSelect').value;
    const comment = e.target.querySelector('textarea').value;
    let activeChips = [];
    document.querySelectorAll('.feedback-chip.active').forEach(chip => {
        activeChips.push(chip.innerText);
    });

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "evaluations"), {
            guideId: guideId,
            rating: parseInt(rating),
            comment: comment,
            quickFeedback: activeChips,
            timestamp: serverTimestamp()
        });

        window.showToast('شكراً لك! تم استلام تقييمك بنجاح.');
        e.target.reset();
        
        document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('active'));
        document.getElementById('ratingValue').value = '';
        document.querySelectorAll('.feedback-chip').forEach(c => c.classList.remove('active'));
        
        setTimeout(() => window.navigate('home'), 2000);

    } catch(error) {
        console.error("خطأ في فايربيس:", error);
        window.showToast('حدث خطأ أثناء حفظ التقييم.', true);
    } finally {
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
};

// --- تهيئة واجهة المستخدم ---
const stars = document.querySelectorAll('.star-rating i');
const ratingInput = document.getElementById('ratingValue');

stars.forEach(star => {
    star.addEventListener('click', function() {
        const val = this.getAttribute('data-value');
        ratingInput.value = val;
        
        stars.forEach(s => {
            if(s.getAttribute('data-value') <= val) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

const chips = document.querySelectorAll('.feedback-chip');
chips.forEach(chip => {
    chip.addEventListener('click', function() {
        this.classList.toggle('active');
    });
});

function generateStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += `<i class="fa-solid fa-star text-rafeeq-yellow"></i>`;
        } else {
            starsHTML += `<i class="fa-regular fa-star text-gray-300"></i>`;
        }
    }
    return starsHTML;
}

function renderGuidesAndDropdowns() {
    const gridContainer = document.getElementById('guidesGrid');
    const requestDropdown = document.getElementById('guideSelectDropdown');
    const evalDropdown = document.getElementById('evalGuideSelect');
    
    gridContainer.innerHTML = ''; 
    let dropdownOptions = '<option value="" disabled selected>اختاري المرشدة (اختياري)</option>';

    guidesData.forEach(guide => {
        if(guide.available) {
            dropdownOptions += `<option value="${guide.id}">${guide.name} - ${guide.grade}</option>`;
        }

        const statusBadge = guide.available 
            ? `<div class="bg-green-100 text-green-700 border border-green-200 px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2 shadow-sm">
                <span class="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                متاحة الآن
               </div>` 
            : `<div class="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-sm font-black flex items-center gap-2 shadow-sm">
                <span class="w-2.5 h-2.5 bg-red-400 rounded-full"></span>
                غير متاحة
               </div>`;

        const card = `
            <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft hover-card flex flex-col h-full relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-2 ${guide.available ? 'bg-green-400' : 'bg-red-400'}"></div>
                <div class="flex justify-between items-start mb-6 mt-2">
                    ${statusBadge}
                    <div class="w-14 h-14 bg-blue-50 text-blue-400 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-blue-100">
                        <i class="fa-solid fa-user-graduate"></i>
                    </div>
                </div>
                <div class="mt-auto">
                    <h3 class="font-black text-rafeeq-blue text-xl mb-1">${guide.name}</h3>
                    <p class="text-rafeeq-teal font-bold text-sm mb-4"><i class="fa-solid fa-book-open mr-1"></i> ${guide.grade}</p>
                    <div class="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                        <div class="flex text-sm" dir="ltr">
                            ${generateStarsHTML(guide.rating)}
                        </div>
                        <span class="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                            (${guide.reviews} تقييم)
                        </span>
                    </div>
                </div>
            </div>
        `;
        gridContainer.innerHTML += card;
    });

    requestDropdown.innerHTML = dropdownOptions;
    evalDropdown.innerHTML = dropdownOptions;
}

window.onload = () => {
    renderGuidesAndDropdowns();
    window.navigate('home');
};