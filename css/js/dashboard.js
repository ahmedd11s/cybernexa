const API_URL = 'http://localhost:5000/api';

// دالة لجلب بيانات المستخدم
async function getUserProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!response.ok) return window.location.href = 'login.html';
        
        const data = await response.json();
        document.getElementById('userName').textContent = data.data.user.name;
    } catch (error) {
        window.location.href = 'login.html';
    }
}

// دالة لجلب سجل الفحوصات
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
                <td>${scan.type === 'url' ? 'رابط' : 'كلمة مرور'}</td>
                <td>${scan.target}</td>
                <td style="color: ${scan.riskScore > 50 ? '#ff4444' : '#00ffaa'}">${scan.result}</td>
                <td>${new Date(scan.createdAt).toLocaleDateString('ar-EG')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading history');
    }
}

// دالة فحص الروابط
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
        loadHistory(); // تحديث السجل
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}

// دالة فحص كلمة المرور
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
        loadHistory(); // تحديث السجل
    } catch (error) {
        resultBox.textContent = 'حدث خطأ';
    }
}

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
});

// تشغيل الدوال عند فتح الصفحة
getUserProfile();
loadHistory();