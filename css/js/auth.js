// عنوان السيرفر بتاعك (الـ Backend)
// ملاحظة: لو شغال على جهازك خليه localhost، لو مرفوع على استضافة هتغير الرابط ده
const API_URL = 'http://localhost:5000/api/auth'; 

// --- تسجيل حساب جديد ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        const name = document.getElementById('name').value;
        const identifier = document.getElementById('email').value; // ممكن يكون إيميل أو موبايل
        const password = document.getElementById('password').value;

        // تجهيز البيانات
        const payload = { name, password };
        if (identifier.includes('@')) {
            payload.email = identifier;
        } else {
            payload.phone = identifier;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include' // مهم جداً لاستقبال الكوكيز (JWT)
            });

            const data = await response.json();

            if (response.ok) {
                successDiv.textContent = 'تم إنشاء الحساب بنجاح! جاري تحويلك...';
                successDiv.style.display = 'block';
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } else {
                errorDiv.textContent = data.message || 'حدث خطأ أثناء التسجيل';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'تعذر الاتصال بالسيرفر. تأكد من تشغيله.';
            errorDiv.style.display = 'block';
        }
    });
}

// --- تسجيل الدخول ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        errorDiv.style.display = 'none';

        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;

        const payload = { password };
        if (identifier.includes('@')) {
            payload.email = identifier;
        } else {
            payload.phone = identifier;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = 'dashboard.html'; // تحويل للوحة التحكم
            } else {
                errorDiv.textContent = data.message || 'بيانات الدخول غير صحيحة';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'تعذر الاتصال بالسيرفر. تأكد من تشغيله.';
            errorDiv.style.display = 'block';
        }
    });
}
