const  API_URL = 'http://localhost:5000/api/admin';

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
async function loadAdminTickets() {
    try {
        const response = await fetch('http://localhost:5000/api/tickets/all', { credentials: 'include' });
        const data = await response.json();
        const list = document.getElementById('adminTicketsList');
        
        if (data.data.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #94a3b8;">لا توجد تذاكر.</p>';
            return;
        }

        list.innerHTML = data.data.map(ticket => `
            <div style="border-bottom: 1px solid #334155; padding: 15px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>${ticket.subject} - (${ticket.user.name})</strong>
                    <span style="color: ${ticket.status === 'open' ? '#ffaa00' : '#00ffaa'};">
                        ${ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                </div>
                <p style="color: #94a3b8; margin: 5px 0;">${ticket.message}</p>
                ${ticket.status === 'open' ? `
                    <input type="text" id="reply-${ticket._id}" placeholder="اكتب الرد هنا..." style="padding:8px; background:#070b16; border:1px solid #334155; color:#fff; border-radius:6px; width:70%; margin-top:10px;">
                    <button onclick="replyTicket('${ticket._id}')" class="btn-action" style="padding: 8px 15px; margin-top: 10px;">رد</button>
                ` : `<p style="color: #00ffaa; margin-top: 10px;">الرد: ${ticket.adminReply}</p>`}
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

async function replyTicket(id) {
    const reply = document.getElementById(`reply-${id}`).value;
    if (!reply) return alert('اكتب الرد أولاً');
    
    try {
        await fetch(`http://localhost:5000/api/tickets/${id}/reply`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminReply: reply }),
            credentials: 'include'
        });
        loadAdminTickets();
    } catch (e) { alert('حدث خطأ'); }
}

loadAdminTickets(); // تشغيلها مع تحميل الصفحة