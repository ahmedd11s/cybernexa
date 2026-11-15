const API_URL = 'http://localhost:5000/api';

// 1. جلب بيانات المستخدم
async function getUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!response.ok) return window.location.href = 'login.html';
        
        const data = await response.json();
        document.getElementById('userName').textContent = data.data.user.name;

        // إظهار لوحة المدير لو المستخدم أدمن
        if (data.data.user.role === 'admin') {
            document.getElementById('adminCard').style.display = 'flex';
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// 2. جلب سجل الفحوصات
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/scans/history`, { credentials: 'include' });
        const data = await response.json();
        
        const tbody = document.getElementById('historyBody');
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">لا يوجد سجل فحوصات حتى الآن.</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(scan => `
            <tr>
                <td>${scan.type === 'url' ? 'رابط' : (scan.type === 'file' ? 'ملف' : 'كلمة مرور')}</td>
                <td>${scan.target}</td>
                <td style="color: ${scan.riskScore > 50 ? '#ff4444' : '#00ffaa'}">${scan.result}</td>
                <td>${new Date(scan.createdAt).toLocaleDateString('ar-EG')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history');
    }
}

// 3. فحص الروابط
async function scanUrl() {
    const url = document.getElementById('urlInput').value;
    const resultBox = document.getElementById('urlResult');
    if (!url) return alert('الرجاء إدخال رابط');

    resultBox.style.display = 'block';
    resultBox.className = 'result-box';
    resultBox.textContent = 'جاري الفحص...';

    try {
        const response = await fetch(`${API_URL}/scans/url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            credentials: 'include'
        });
        const data = await response.json();
        
        resultBox.className = `result-box ${data.data.riskScore > 50 ? 'result-danger' : 'result-safe'}`;
        resultBox.textContent = data.data.result;
        loadHistory();
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}

// 4. فحص كلمة المرور
async function scanPassword() {
    const password = document.getElementById('passInput').value;
    const resultBox = document.getElementById('passResult');
    if (!password) return alert('الرجاء إدخال كلمة المرور');

    resultBox.style.display = 'block';
    resultBox.className = 'result-box';
    resultBox.textContent = 'جاري التحليل...';

    try {
        const response = await fetch(`${API_URL}/scans/password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        const data = await response.json();
        
        resultBox.className = `result-box ${data.data.riskScore > 50 ? 'result-danger' : 'result-safe'}`;
        resultBox.textContent = data.data.result;
        loadHistory();
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}

// 5. فحص الملفات
async function scanFile() {
    const fileName = document.getElementById('fileInput').value;
    const resultBox = document.getElementById('fileResult');
    if (!fileName) return alert('الرجاء إدخال اسم الملف');

    resultBox.style.display = 'block';
    resultBox.className = 'result-box';
    resultBox.textContent = 'جاري فحص الملف...';

    try {
        const response = await fetch(`${API_URL}/scans/file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, fileSize: 10 }),
            credentials: 'include'
        });
        const data = await response.json();
        
        resultBox.className = `result-box ${data.data.riskScore > 50 ? 'result-danger' : 'result-safe'}`;
        resultBox.textContent = data.data.result;
        loadHistory();
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
});

// تشغيل الدوال
getUserProfile();
loadHistory();
// دالة فحص الملفات
async function scanFile() {
    const fileName = document.getElementById('fileInput').value;
    const resultBox = document.getElementById('fileResult');
    if (!fileName) return alert('الرجاء إدخال اسم الملف');

    resultBox.style.display = 'block';
    resultBox.className = 'result-box';
    resultBox.textContent = 'جاري فحص الملف...';

    try {
        const response = await fetch(`${API_URL}/scans/file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, fileSize: 10 }), // بنبعت حجم وهمي
            credentials: 'include'
        });
        const data = await response.json();
        
        resultBox.className = `result-box ${data.data.riskScore > 50 ? 'result-danger' : 'result-safe'}`;
        resultBox.textContent = data.data.result;
        if (typeof loadHistory === 'function') loadHistory();
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}