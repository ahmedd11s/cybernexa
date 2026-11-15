// رابط السيرفر على Suga
const API_URL = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api';

const SCAN_TYPES = { url: 'رابط', file: 'ملف', password: 'كلمة مرور' };

// طلب عام: يحوّل لصفحة الدخول لو الجلسة انتهت، ويرجّع { ok, data }
async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options });
    if (response.status === 401) {
        window.location.href = 'login.html';
        throw new Error('unauthorized');
    }
    let body = {};
    try { body = await response.json(); } catch (_) { /* الرد مش JSON */ }
    return { ok: response.ok, status: response.status, body };
}

function postJSON(path, payload) {
    return api(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// 1. جلب بيانات المستخدم
async function getUserProfile() {
    try {
        const { ok, body } = await api('/auth/me');
        const user = body && body.data && body.data.user;
        if (!ok || !user) return (window.location.href = 'login.html');

        document.getElementById('userName').textContent = user.name;
        if (user.role === 'admin') {
            document.getElementById('adminCard').style.display = 'flex';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// صف في الجدول (textContent فقط عشان نمنع حقن HTML من المدخلات)
function historyRow(scan) {
    const tr = document.createElement('tr');
    const cells = [
        SCAN_TYPES[scan.type] || scan.type || '-',
        // مانعرضش كلمة المرور نفسها أبداً حتى لو السيرفر رجّعها
        scan.type === 'password' ? '••••••••' : (scan.target ?? '-'),
        scan.result ?? '-',
        scan.createdAt ? new Date(scan.createdAt).toLocaleDateString('ar-EG') : '-'
    ];
    cells.forEach((text, i) => {
        const td = document.createElement('td');
        td.textContent = text;
        if (i === 2) td.style.color = Number(scan.riskScore) > 50 ? '#ff8a8a' : 'var(--accent)';
        tr.appendChild(td);
    });
    return tr;
}

function historyMessage(tbody, text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.style.textAlign = 'center';
    td.textContent = text;
    tr.appendChild(td);
    tbody.replaceChildren(tr);
}

// 2. جلب سجل الفحوصات
async function loadHistory() {
    const tbody = document.getElementById('historyBody');
    try {
        const { ok, body } = await api('/scans/history');
        if (!ok || !Array.isArray(body.data)) {
            historyMessage(tbody, 'تعذر تحميل السجل حالياً.');
            return;
        }
        if (body.data.length === 0) {
            historyMessage(tbody, 'لا يوجد سجل فحوصات حتى الآن.');
            return;
        }
        tbody.replaceChildren(...body.data.map(historyRow));
    } catch (error) {
        if (error.message !== 'unauthorized') historyMessage(tbody, 'تعذر الاتصال بالسيرفر.');
    }
}

// تشغيل فحص عام (يقفل الزرار أثناء الفحص ويعرض رسالة الخطأ الحقيقية)
async function runScan({ path, payload, resultId, busyText }) {
    const resultBox = document.getElementById(resultId);
    const btn = resultBox.previousElementSibling; // الزرار قبل صندوق النتيجة مباشرة

    resultBox.style.display = 'block';
    resultBox.className = 'result-box';
    resultBox.textContent = busyText;
    if (btn && btn.tagName === 'BUTTON') btn.disabled = true;

    try {
        const { ok, status, body } = await postJSON(path, payload);
        if (!ok || !body.data) {
            resultBox.className = 'result-box result-danger';
            resultBox.textContent = body.message || (status >= 500 ? 'حصلت مشكلة في السيرفر، حاول تاني.' : 'تعذر إتمام الفحص');
            return;
        }
        resultBox.className = `result-box ${Number(body.data.riskScore) > 50 ? 'result-danger' : 'result-safe'}`;
        resultBox.textContent = body.data.result;
        loadHistory();
    } catch (error) {
        if (error.message !== 'unauthorized') {
            resultBox.className = 'result-box result-danger';
            resultBox.textContent = 'تعذر الاتصال بالسيرفر.';
        }
    } finally {
        if (btn && btn.tagName === 'BUTTON') btn.disabled = false;
    }
}

function needInput(resultId, text) {
    const box = document.getElementById(resultId);
    box.style.display = 'block';
    box.className = 'result-box result-danger';
    box.textContent = text;
}

// 3. فحص الروابط
function scanUrl() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) return needInput('urlResult', 'الرجاء إدخال رابط');
    return runScan({ path: '/scans/url', payload: { url }, resultId: 'urlResult', busyText: 'جاري الفحص...' });
}

// 4. فحص كلمة المرور
function scanPassword() {
    const input = document.getElementById('passInput');
    const password = input.value;
    if (!password) return needInput('passResult', 'الرجاء إدخال كلمة المرور');
    return runScan({ path: '/scans/password', payload: { password }, resultId: 'passResult', busyText: 'جاري التحليل...' })
        .finally(() => { input.value = ''; }); // نمسح الحقل بعد الإرسال
}

// 5. فحص الملفات
function scanFile() {
    const fileName = document.getElementById('fileInput').value.trim();
    if (!fileName) return needInput('fileResult', 'الرجاء إدخال اسم الملف');
    return runScan({ path: '/scans/file', payload: { fileName, fileSize: 10 }, resultId: 'fileResult', busyText: 'جاري فحص الملف...' });
}

// تسجيل الخروج (يحوّل لصفحة الدخول حتى لو الطلب فشل)
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) { /* نكمل على أي حال */ }
    window.location.href = 'login.html';
});

// تشغيل الدوال أول ما الصفحة تفتح
getUserProfile();
loadHistory();
