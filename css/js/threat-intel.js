const API_BASE = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api';

const SEVERITY = {
    High:   { card: 'severity-high', badge: 'badge-high', label: 'عالية' },
    Medium: { card: 'severity-med',  badge: 'badge-med',  label: 'متوسطة' },
    Low:    { card: 'severity-low',  badge: 'badge-low',  label: 'منخفضة' }
};

function feedMessage(feed, text) {
    const p = document.createElement('p');
    p.style.cssText = 'text-align:center;color:#94a3b8;';
    p.textContent = text;
    feed.replaceChildren(p);
}

function intelCard(item) {
    const s = SEVERITY[item.severity] || SEVERITY.Low;

    const card = document.createElement('div');
    card.className = 'intel-card ' + s.card;

    const header = document.createElement('div');
    header.className = 'intel-header';
    const title = document.createElement('h3');
    title.textContent = item.title ?? '';
    const badge = document.createElement('span');
    badge.className = 'badge ' + s.badge;
    badge.textContent = s.label;
    header.append(title, badge);

    const desc = document.createElement('p');
    desc.className = 'intel-desc';
    desc.textContent = item.description ?? '';

    card.append(header, desc);
    return card;
}

async function loadIntel() {
    const feed = document.getElementById('intelFeed');
    feedMessage(feed, 'جاري التحميل...');
    try {
        const response = await fetch(`${API_BASE}/intel`, { credentials: 'include' });
        if (response.status === 401) { window.location.href = 'login.html'; return; }
        const body = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(body.data)) {
            feedMessage(feed, 'تعذر تحميل الأخبار حالياً.');
            return;
        }
        if (body.data.length === 0) {
            feedMessage(feed, 'لا توجد تهديدات مسجلة حالياً.');
            return;
        }
        feed.replaceChildren(...body.data.map(intelCard));
    } catch (e) {
        feedMessage(feed, 'تعذر الاتصال بالسيرفر.');
    }
}

loadIntel();
