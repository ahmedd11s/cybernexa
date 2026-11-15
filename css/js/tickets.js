const API_BASE = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api';
const TICKETS_URL = `${API_BASE}/tickets`;

function listMessage(list, text) {
    const p = document.createElement('p');
    p.style.color = '#94a3b8';
    p.textContent = text;
    list.replaceChildren(p);
}

function ticketItem(ticket) {
    const open = ticket.status === 'open';

    const item = document.createElement('div');
    item.className = 'ticket-item';

    const top = document.createElement('div');
    top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:10px;';
    const subject = document.createElement('strong');
    subject.textContent = ticket.subject ?? '';
    const badge = document.createElement('span');
    badge.className = 'badge ' + (open ? 'badge-open' : 'badge-closed');
    badge.textContent = open ? 'مفتوحة' : 'مغلقة';
    top.append(subject, badge);

    const message = document.createElement('p');
    message.style.cssText = 'color:#94a3b8;margin:5px 0;';
    message.textContent = ticket.message ?? '';

    item.append(top, message);

    if (ticket.adminReply) {
        const box = document.createElement('div');
        box.className = 'reply-box';
        const label = document.createElement('strong');
        label.textContent = 'رد الإدارة:';
        box.append(label, document.createElement('br'), document.createTextNode(ticket.adminReply));
        item.appendChild(box);
    }
    return item;
}

async function loadTickets() {
    const list = document.getElementById('myTicketsList');
    try {
        const response = await fetch(`${TICKETS_URL}/my-tickets`, { credentials: 'include' });
        if (response.status === 401) { window.location.href = 'login.html'; return; }
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(body.data)) {
            listMessage(list, 'تعذر تحميل التذاكر حالياً.');
            return;
        }
        if (body.data.length === 0) {
            listMessage(list, 'لا توجد تذاكر حتى الآن.');
            return;
        }
        list.replaceChildren(...body.data.map(ticketItem));
    } catch (e) {
        listMessage(list, 'تعذر الاتصال بالسيرفر.');
    }
}

async function createTicket() {
    const subjectEl = document.getElementById('ticketSubject');
    const messageEl = document.getElementById('ticketMessage');
    const btn = document.querySelector('.btn-action');
    const subject = subjectEl.value.trim();
    const message = messageEl.value.trim();
    if (!subject || !message) return alert('الرجاء ملء الحقول');

    btn.disabled = true;
    try {
        const response = await fetch(TICKETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message }),
            credentials: 'include'
        });
        if (response.status === 401) { window.location.href = 'login.html'; return; }
        if (response.ok) {
            subjectEl.value = '';
            messageEl.value = '';
            loadTickets();
        } else {
            const body = await response.json().catch(() => ({}));
            alert(body.message || 'تعذر إرسال التذكرة');
        }
    } catch (e) {
        alert('تعذر الاتصال بالسيرفر');
    } finally {
        btn.disabled = false;
    }
}

loadTickets();
