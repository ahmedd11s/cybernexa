hereconst https = require('https');
const { isSafeUrl } = require('../../utils/ssrfGuard');

/**
 * فحص شهادة SSL/TLS لموقع
 * @param {string} url
 * @returns {Promise<Object>}
 */
const scanSSL = async (url) => {
  // 1. التأكد من أمان الرابط أولاً (SSRF)
  await isSafeUrl(url);

  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') {
    return {
      status: 'error',
      message: 'الموقع لا يستخدم HTTPS. الشهادة غير موجودة.',
      score: 100, // خطورة عالية
      details: []
    };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: parsed.hostname,
      port: 443,
      method: 'GET',
      path: '/',
      rejectUnauthorized: false, // عشان نقدر نقرأ الشهادة حتى لو فيها مشكلة
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        resolve({ status: 'error', message: 'لم يتم العثور على شهادة.', score: 100 });
        return;
      }

      const now = new Date();
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const daysLeft = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));

      const findings = [];
      let riskScore = 0;

      // فحص الصلاحية
      if (now < validFrom || now > validTo) {
        findings.push({ issue: 'الشهادة منتهية الصلاحية أو غير صالحة حالياً.', severity: 'High' });
        riskScore += 80;
      } else if (daysLeft < 30) {
        findings.push({ issue: `الشهادة ستنتهي قريباً (متبقي ${daysLeft} يوم).`, severity: 'Medium' });
        riskScore += 30;
      }

      // فحص الإصدار
      if (cert.protocol && cert.protocol.includes('TLSv1.0')) {
        findings.push({ issue: 'يستخدم الموقع بروتوكول TLS 1.0 القديم والغير آمن.', severity: 'High' });
        riskScore += 70;
      }
      if (cert.protocol && cert.protocol.includes('TLSv1.1')) {
        findings.push({ issue: 'يستخدم الموقع بروتوكول TLS 1.1 القديم.', severity: 'Medium' });
        riskScore += 40;
      }

      resolve({
        status: 'success',
        data: {
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysLeft: daysLeft > 0 ? daysLeft : 0,
          protocol: cert.protocol || 'Unknown',
          findings,
          riskScore: Math.min(riskScore, 100)
        }
      });
    });

    req.on('error', (err) => {
      resolve({ status: 'error', message: `فشل الاتصال: ${err.message}`, score: 50 });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'error', message: 'انتهت مهلة الاتصال.', score: 50 });
    });

    req.end();
  });
};

module.exports = { scanSSL };
