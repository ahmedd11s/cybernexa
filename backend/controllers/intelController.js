exports.getIntelFeed = async (req, res) => {
    // في الحقيقة دي بتتجاب من API خارجي، هنا هنحاكيها
    const feed = [
        {
            title: "ثغرة خطيرة في نظام Windows",
            description: "تم اكتشاف ثغرة تسمح بتنفيذ أكواد عن بعد (RCE) في أنظمة Windows 11. نوصي بتحديث الأنظمة فوراً.",
            severity: "High"
        },
        {
            title: "اختراق بيانات شركة كبرى",
            description: "تم تسريب بيانات ملايين المستخدمين من أحد البنوك. تأكد من تغيير كلمات المرور.",
            severity: "High"
        },
        {
            title: "تحديث أمني جديد من Google",
            description: "أصدرت Google تحديثاً أمنياً لمتصفح Chrome لسد ثغرات خطيرة.",
            severity: "Medium"
        },
        {
            title: "حملة تصيد جديدة",
            description: "تم رصد حملات تصيد تستهدف مستخدمي منصات التواصل الاجتماعي عبر رسائل وهمية.",
            severity: "Low"
        }
    ];
    
    res.status(200).json({ status: 'success', data: feed });
};