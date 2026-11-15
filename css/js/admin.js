const API_BASE = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api';
const API_URL = `${API_BASE}/admin`;

// يحوّل المستخدم غير المصرح له (والتحقق الحقيقي لازم يفضل على السيرفر)
function denyAccess() {
    alert('غير مصرح لك بالدخول هنا');
    window.location.href = 'dashboard.html';
}

function msgRow(tbody, text) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.style.textAlign = 'center';
    td.textContent = text;
    tr.appendChild(td);
    tbody.replaceChildren(tr);
}

// جلب الإحصائيات
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`, { credentials: 'include' });
        if (response.status === 403 || response.status === 401) return denyAccess();
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !body.data) return;

        document.getElementById('totalUsers').textContent = body.data.totalUsers ?? '-';
        document.getElementById('totalScans').textContent = body.data.totalScans ?? '-';
        document.getElementById('threatsDetected').textContent = body.data.threatsDetected ?? '-';
    } catch (error) {
        console.error('Error loading stats');
    }
}

function userRow(user) {
    const tr = document.createElement('tr');
    const isAdmin = user.role === 'admin';

    const name = document.createElement('td');
    name.textContent = user.name ?? '';

    const contact = document.createElement('td');
    contact.textContent = user.email || user.phone || 'غير محدد';

    const roleTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge ' + (isAdmin ? 'badge-admin' : 'badge-user');
    badge.textContent = isAdmin ? 'مدير' : 'مستخدم';
    roleTd.appendChild(badge);

    const date = document.createElement('td');
    date.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : '-';

    const action = document.createElement('td');
    if (isAdmin) {
        action.textContent = '-';
    } else {
        const btn = document.createElement('button');
        btn.className = 'btn-delete';
        btn.textContent = 'حذف';
        btn.addEventListener('click', () => deleteUser(user._id, btn));
        action.appendChild(btn);
    }

    tr.append(name, contact, roleTd, date, action);
    return tr;
}

// جلب جدول المستخدمين
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    try {
        const response = await fetch(`${API_URL}/users`, { credentials: 'include' });
        if (response.status === 403 || response.status === 401) return denyAccess();
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(body.data)) {
            msgRow(tbody, 'تعذر تحميل المستخدمين حالياً.');
            return;
        }
        if (body.data.length === 0) {
            msgRow(tbody, 'لا يوجد مستخدمين.');
            return;
        }
        tbody.replaceChildren(...body.data.map(userRow));
    } catch (error) {
        msgRow(tbody, 'تعذر الاتصال بالسيرفر.');
    }
}

// حذف مستخدم
async function deleteUser(id, btn) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    if (btn) btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadUsers();
            loadStats();
        } else {
            const body = await response.json().catch(() => ({}));
            alert(body.message || 'حدث خطأ أثناء الحذف');
            if (btn) btn.disabled = false;
        }
    } catch (error) {
        alert('تعذر الاتصال بالسيرفر');
        if (btn) btn.disabled = false;
    }
}

// ---------- التذاكر ----------
function ticketBlock(ticket) {
    const open = ticket.status === 'open';
    const wrap = document.createElement('div');
    wrap.className = 'admin-ticket';

    const top = document.createElement('div');
    top.className = 'admin-ticket-top';
    const title = document.createElement('strong');
    title.textContent = `${ticket.subject ?? ''} - (${(ticket.user && ticket.user.name) || 'مستخدم محذوف'})`;
    const status = document.createElement('span');
    status.className = open ? 'ticket-open' : 'ticket-closed';
    status.textContent = open ? 'مفتوحة' : 'مغلقة';
    top.append(title, status);

    const msg = document.createElement('p');
    msg.className = 'admin-ticket-msg';
    msg.textContent = ticket.message ?? '';
    wrap.append(top, msg);

    if (open) {
        const row = document.createElement('div');
        row.className = 'reply-row';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'اكتب الرد هنا...';
        input.setAttribute('aria-label', 'رد على التذكرة');
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.textContent = 'رد';
        btn.addEventListener('click', () => replyTicket(ticket._id, input, btn));
        row.append(input, btn);
        wrap.appendChild(row);
    } else if (ticket.adminReply) {
        const reply = document.createElement('p');
        reply.className = 'ticket-closed';
        reply.style.marginTop = '10px';
        reply.textContent = 'الرد: ' + ticket.adminReply;
        wrap.appendChild(reply);
    }
    return wrap;
}

async function loadAdminTickets() {
    const list = document.getElementById('adminTicketsList');
    if (!list) return;
    const note = (t) => { const p = document.createElement('p'); p.style.cssText = 'text-align:center;color:#94a3b8;'; p.textContent = t; list.replaceChildren(p); };
    try {
        const response = await fetch(`${API_BASE}/tickets/all`, { credentials: 'include' });
        if (response.status === 403 || response.status === 401) return denyAccess();
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(body.data)) return note('تعذر تحميل التذاكر حالياً.');
        if (body.data.length === 0) return note('لا توجد تذاكر.');
        list.replaceChildren(...body.data.map(ticketBlock));
    } catch (e) {
        note('تعذر الاتصال بالسيرفر.');
    }
}

async function replyTicket(id, input, btn) {
    const reply = input.value.trim();
    if (!reply) return alert('اكتب الرد أولاً');
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/tickets/${encodeURIComponent(id)}/reply`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminReply: reply }),
            credentials: 'include'
        });
        if (response.ok) {
            loadAdminTickets();
        } else {
            const body = await response.json().catch(() => ({}));
            alert(body.message || 'تعذر إرسال الرد');
            btn.disabled = false;
        }
    } catch (e) {
        alert('تعذر الاتصال بالسيرفر');
        btn.disabled = false;
    }
}

loadStats();
loadUsers();
loadAdminTickets();
