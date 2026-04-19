import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7' });

  let targetUrl = 'https://maps.app.goo.gl/hjAUhZQTRhSKPnbXA';
  console.log('Navigating to:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  if (page.url().includes('consent.google.com')) {
    console.log('Consent page detected! Trying to accept...');
    const buttons = await page.$$('button');
    for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && (text.includes('Accept all') || text.includes('Tümünü kabul et') || text.includes('I agree'))) {
        await btn.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
        break;
      }
    }
  }

  console.log('Current URL after consent handling:', page.url());
  const title = await page.title();
  console.log('Page Title:', title);
  
  await browser.close();
})();
