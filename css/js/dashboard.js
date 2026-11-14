// نفس رابط السيرفر
const API_URL = 'http://localhost:5000/api/auth';

// دالة لجلب بيانات المستخدم الحالي
async function getUserProfile() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            credentials: 'include' // إرسال الكوكيز (JWT) للسيرفر للتحقق
        });

        if (!response.ok) {
            // لو التوكن مش موجود أو انتهى، نرجعه لصفحة الدخول
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        
        // عرض البيانات في الصفحة
        document.getElementById('userName').textContent = data.data.user.name || 'غير محدد';
        document.getElementById('userEmail').textContent = data.data.user.email || data.data.user.phone || 'غير محدد';
        document.getElementById('userRole').textContent = data.data.user.role === 'admin' ? 'مدير' : 'مستخدم عادي';

    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'login.html';
    }
}

// تشغيل الدالة أول ما الصفحة تفتح
getUserProfile();

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed');
    }
});
