const API_URL = 'http://localhost:5000/api/admin';

// جلب الإحصائيات
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`, { credentials: 'include' });
        if (response.status === 403 || response.status === 401) {
            alert('غير مصرح لك بالدخول هنا');
            return window.location.href = 'dashboard.html';
        }
        const data = await response.json();
        
        document.getElementById('totalUsers').textContent = data.data.totalUsers;
        document.getElementById('totalScans').textContent = data.data.totalScans;
        document.getElementById('threatsDetected').textContent = data.data.threatsDetected;
    } catch (error) {
        console.error('Error loading stats');
    }
}

// جلب جدول المستخدمين
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, { credentials: 'include' });
        const data = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا يوجد مستخدمين.</td></tr>';
            return;
        }

        tbody.innerHTML = data.data.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email || user.phone || 'غير محدد'}</td>
                <td>
                    <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                        ${user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                <td>
                    ${user.role !== 'admin' ? `<button class="btn-delete" onclick="deleteUser('${user._id}')">حذف</button>` : '-'}
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users');
    }
}

// دالة حذف مستخدم
async function deleteUser(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadUsers();
            loadStats();
        } else {
            alert('حدث خطأ أثناء الحذف');
        }
    } catch (error) {
        console.error('Delete failed');
    }
}

// تشغيل الدوال
loadStats();
loadUsers();