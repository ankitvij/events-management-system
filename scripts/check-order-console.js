import puppeteer from 'puppeteer';
(async () => {
  const url = process.argv[2] || 'http://events.test/orders/15?booking_code=7533012419';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    try {
      const loc = msg.location ? msg.location() : null;
      const locStr = loc ? `${loc.url}:${loc.lineNumber}:${loc.columnNumber}` : '';
      if (msg.type() === 'error') errors.push((msg.text() || '') + (locStr ? ` (${locStr})` : ''));
      console.log(`[console:${msg.type()}] ${msg.text()} ${locStr}`);
    } catch (e) {
      console.log('[console] error reading message', e.message);
    }
  });
  page.on('pageerror', err => {
    const s = err.stack || err.message || String(err);
    errors.push(s);
    console.log('[pageerror]', s);
  });
  try {
    await page.evaluateOnNewDocument(() => {
      const _origKeys = Object.keys;
      Object.keys = function(obj) {
        if (obj === null || obj === undefined) {
          console.error('Object.keys called with', obj);
          try { console.error('typeof:', typeof obj, 'toString:', Object.prototype.toString.call(obj)); } catch(e) {}
          console.trace();
        }
        return _origKeys.call(Object, obj);
      };
    });
    await page.goto(url, { waitUntil: 'networkidle2' , timeout: 30000});
    // wait a bit for Inertia JS to run
    await page.waitForTimeout(2000);
  } catch (e) {
    console.error('Navigation failed:', e.message);
  }
  if (errors.length === 0) {
    console.log('No console errors captured.');
  } else {
    console.log('Captured console errors:');
    errors.forEach((e, i) => console.log(`${i+1}. ${e}`));
  }
  await browser.close();
})();
