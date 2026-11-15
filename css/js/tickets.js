const API_URL = 'http://localhost:5000/api/tickets';

async function loadTickets() {
    try {
        const response = await fetch(`${API_URL}/my-tickets`, { credentials: 'include' });
        const data = await response.json();
        const list = document.getElementById('myTicketsList');
        
        if (data.data.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8;">لا توجد تذاكر حتى الآن.</p>';
            return;
        }

        list.innerHTML = data.data.map(ticket => `
            <div class="ticket-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong>${ticket.subject}</strong>
                    <span class="badge ${ticket.status === 'open' ? 'badge-open' : 'badge-closed'}">
                        ${ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                </div>
                <p style="color: #94a3b8; margin: 5px 0;">${ticket.message}</p>
                ${ticket.adminReply ? `<div class="reply-box"><strong>رد الإدارة:</strong><br>${ticket.adminReply}</div>` : ''}
            </div>
        `).join('');
    } catch (e) { console.error('Error'); }
}

async function createTicket() {
    const subject = document.getElementById('ticketSubject').value;
    const message = document.getElementById('ticketMessage').value;
    if (!subject || !message) return alert('الرجاء ملء الحقول');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, message }),
            credentials: 'include'
        });
        if (response.ok) {
            document.getElementById('ticketSubject').value = '';
            document.getElementById('ticketMessage').value = '';
            loadTickets();
        }
    } catch (e) { alert('حدث خطأ'); }
}

loadTickets();