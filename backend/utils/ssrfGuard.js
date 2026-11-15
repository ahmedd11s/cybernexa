const dns = require('dns');
const { promisify } = require('util');
const net = require('net');

const lookup = promisify(dns.lookup);

/**
 * يتحقق من أن الرابط آمن للفحص (ليس IP داخلي)
 * @param {string} url - الرابط المطلوب فحصه
 * @returns {Promise<boolean>}
 */
const isSafeUrl = async (url) => {
  try {
    const parsed = new URL(url);
    
    // 1. منع البروتوكولات غير الآمنة (فقط http و https)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('البروتوكول غير مسموح. يُسمح فقط بـ HTTP و HTTPS.');
    }

    const hostname = parsed.hostname;

    // 2. منع أسماء النطاقات الداخلية المعروفة
    if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      throw new Error('لا يمكن فحص العناوين الداخلية.');
    }

    // 3. تحليل الـ DNS للحصول على عنوان IP الفعلي
    const addresses = await lookup(hostname, { all: true });
    
    for (const addr of addresses) {
      // 4. منع عناوين IP الداخلية (Private IPs)
      if (net.isIP(addr.address)) {
        // IPv4: 10.x.x.x, 172.16.x.x - 172.31.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x
        if (
          addr.address.startsWith('10.') ||
          addr.address.startsWith('127.') ||
          addr.address.startsWith('169.254.') ||
          (addr.address.startsWith('172.') && parseInt(addr.address.split('.')[1]) >= 16 && parseInt(addr.address.split('.')[1]) <= 31) ||
          addr.address.startsWith('192.168.')
        ) {
          throw new Error('لا يمكن فحص العناوين الداخلية (SSRF Protection).');
        }
        // IPv6: ::1, fc00::/7, fe80::/10
        if (addr.address === '::1' || addr.address.startsWith('fc') || addr.address.startsWith('fd') || addr.address.startsWith('fe80')) {
          throw new Error('لا يمكن فحص العناوين الداخلية (SSRF Protection).');
        }
      }
    }

    return true;
  } catch (error) {
    throw new Error(`فشل التحقق من الرابط: ${error.message}`);
  }
};

module.exports = { isSafeUrl };
