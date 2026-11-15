// عنوان السيرفر على Suga
const API_URL = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api/auth';

// يرسل الطلب ويرجّع { ok, data } أو يرمي خطأ اتصال حقيقي فقط
async function postJSON(path, payload) {
    const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include' // لاستقبال كوكي الـ JWT
    });
    let data = {};
    try { data = await response.json(); } catch (_) { /* الرد مش JSON */ }
    return { ok: response.ok, status: response.status, data };
}

function show(el, text) {
    el.textContent = text;
    el.style.display = 'block';
}

function buildPayload(identifier, password, name) {
    const id = identifier.trim();
    const payload = { password };
    if (name !== undefined) payload.name = name.trim();
    if (id.includes('@')) payload.email = id.toLowerCase();
    else payload.phone = id;
    return payload;
}

function setBusy(btn, busy, label) {
    btn.disabled = busy;
    btn.textContent = busy ? 'جاري التنفيذ...' : label;
}

function serverError(status, data, fallback) {
    if (data && data.message) return data.message;
    if (status >= 500) return 'حصلت مشكلة في السيرفر، حاول تاني بعد شوية.';
    return fallback;
}

// --- تسجيل حساب جديد ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        const btn = registerForm.querySelector('button[type="submit"]');
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        const name = document.getElementById('name').value;
        const identifier = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (password.length < 8) {
            show(errorDiv, 'كلمة المرور لازم تكون 8 أحرف على الأقل');
            return;
        }

        setBusy(btn, true, 'إنشاء الحساب');
        try {
            const { ok, status, data } = await postJSON('/register', buildPayload(identifier, password, name));
            if (ok) {
                show(successDiv, 'تم إنشاء الحساب بنجاح! جاري تحويلك...');
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
                return;
            }
            show(errorDiv, serverError(status, data, 'حدث خطأ أثناء التسجيل'));
        } catch (err) {
            show(errorDiv, 'تعذر الاتصال بالسيرفر. تأكد من تشغيله.');
        }
        setBusy(btn, false, 'إنشاء الحساب');
    });
}

// --- تسجيل الدخول ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        const btn = loginForm.querySelector('button[type="submit"]');
        errorDiv.style.display = 'none';

        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;

        setBusy(btn, true, 'تسجيل الدخول');
        try {
            const { ok, status, data } = await postJSON('/login', buildPayload(identifier, password));
            if (ok) {
                window.location.href = 'dashboard.html';
                return;
            }
            show(errorDiv, serverError(status, data, 'بيانات الدخول غير صحيحة'));
        } catch (err) {
            show(errorDiv, 'تعذر الاتصال بالسيرفر. تأكد من تشغيله.');
        }
        setBusy(btn, false, 'تسجيل الدخول');
    });
}
