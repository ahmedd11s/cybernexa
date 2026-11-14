const logs = [
    { text: 'تم حظر محاولة اختراق من IP: 192.168.1.105', type: 'danger' },
    { text: 'تحديث قواعد جدار الحماية بنجاح.', type: 'success' },
    { text: 'نشاط مشبوه: محاولة DDoS على السيرفر الرئيسي.', type: 'warning' },
    { text: 'تم تسجيل دخول جديد من جهاز غير معروف.', type: 'warning' },
    { text: 'فحص دوري: لا توجد ثغرات.', type: 'success' },
    { text: 'تم صد 150 طلب مشبوه في الثانية.', type: 'danger' }
];

function addLog() {
    const container = document.getElementById('logContainer');
    const randomLog = logs[Math.floor(Math.random() * logs.length)];
    const time = new Date().toLocaleTimeString('ar-EG');
    
    const div = document.createElement('div');
    div.className = `log-entry log-${randomLog.type}`;
    div.textContent = `[${time}] ${randomLog.text}`;
    
    container.prepend(div); // إضافة فوق
}

// إضافة سجل كل 3 ثواني
setInterval(addLog, 3000);
addLog(); // أول سجل