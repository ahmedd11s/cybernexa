// بيانات عرض تجريبي (Demo): الأحداث دي مولّدة عشوائياً وليست من السيرفر
const API_BASE = 'https://s7e7sfnablec-production-12fbya08.us-central1.suga.run/api';
const MAX_LOGS = 200;

const logs = [
    { text: 'تم حظر محاولة اختراق من IP: 192.168.1.105', type: 'danger' },
    { text: 'تحديث قواعد جدار الحماية بنجاح.', type: 'success' },
    { text: 'نشاط مشبوه: محاولة DDoS على السيرفر الرئيسي.', type: 'warning' },
    { text: 'تم تسجيل دخول جديد من جهاز غير معروف.', type: 'warning' },
    { text: 'فحص دوري: لا توجد ثغرات.', type: 'success' },
    { text: 'تم صد 150 طلب مشبوه في الثانية.', type: 'danger' }
];

// الصفحة للمستخدمين المسجلين فقط
(async function guard() {
    try {
        const r = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
        if (!r.ok) window.location.href = 'login.html';
    } catch (_) {
        window.location.href = 'login.html';
    }
})();

function addLog() {
    const container = document.getElementById('logContainer');
    const randomLog = logs[Math.floor(Math.random() * logs.length)];
    const time = new Date().toLocaleTimeString('ar-EG');

    const div = document.createElement('div');
    div.className = `log-entry log-${randomLog.type}`;
    div.textContent = `[${time}] ${randomLog.text}`;

    container.prepend(div);
    while (container.children.length > MAX_LOGS) container.lastChild.remove(); // نمنع الصفحة من التضخم
}

// سجل كل 3 ثواني، ويقف لما التاب يتخبّى
let timer = null;
function start() { if (!timer) timer = setInterval(addLog, 3000); }
function stop() { clearInterval(timer); timer = null; }
document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

addLog();
start();
