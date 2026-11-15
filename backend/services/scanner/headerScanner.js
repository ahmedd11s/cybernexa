const axios = require('axios');
const { isSafeUrl } = require('../../utils/ssrfGuard');

const scanHeaders = async (url) => {
  await isSafeUrl(url);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 0, // منع الـ SSRF عن طريق الـ redirects
      validateStatus: () => true, // ما يرميش error لو الرد 4xx أو 5xx
      headers: { 'User-Agent': 'CYBERNEXA-Scanner/1.0' }
    });

    const headers = response.headers;
    const findings = [];
    let riskScore = 0;

    // قائمة الهيدرز الأمنية المطلوبة
    const requiredHeaders = {
      'content-security-policy': { name: 'Content-Security-Policy (CSP)', severity: 'High', score: 25 },
      'strict-transport-security': { name: 'Strict-Transport-Security (HSTS)', severity: 'Medium', score: 15 },
      'x-frame-options': { name: 'X-Frame-Options', severity: 'Medium', score: 15 },
      'x-content-type-options': { name: 'X-Content-Type-Options', severity: 'Low', score: 10 },
      'referrer-policy': { name: 'Referrer-Policy', severity: 'Low', score: 10 },
      'permissions-policy': { name: 'Permissions-Policy', severity: 'Low', score: 10 },
    };

    for (const [key, info] of Object.entries(requiredHeaders)) {
      if (!headers[key]) {
        findings.push({
          issue: `الهيدر الأمني ${info.name} غير موجود.`,
          severity: info.severity,
          recommendation: `إضافة الهيدر: ${key}`
        });
        riskScore += info.score;
      }
    }

    // فحص تسريب معلومات السيرفر
    if (headers['x-powered-by']) {
      findings.push({
        issue: `الموقع يكشف عن التقنية المستخدمة: ${headers['x-powered-by']}`,
        severity: 'Low',
        recommendation: 'إزالة هيدر X-Powered-By'
      });
      riskScore += 5;
    }

    if (headers['server']) {
      findings.push({
        issue: `الموقع يكشف عن نوع السيرفر: ${headers['server']}`,
        severity: 'Low',
        recommendation: 'إخفاء أو تعديل هيدر Server'
      });
      riskScore += 5;
    }

    return {
      status: 'success',
      data: {
        statusCode: response.status,
        presentHeaders: Object.keys(headers).filter(h => requiredHeaders[h]),
        findings,
        riskScore: Math.min(riskScore, 100)
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: `فشل الاتصال: ${error.message}`,
      riskScore: 50
    };
  }
};

module.exports = { scanHeaders };