const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', 'admin@template.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Click Supply Chain
    await page.click('text=Supply Chain');
    
    await page.waitForLoadState('networkidle');
    console.log('Current URL after click:', page.url());
    
    await page.screenshot({ path: 'playwright-supply-chain.png' });
    
  } catch (e) {
    console.log('Script Error:', e.message);
  }
  
  await browser.close();
})();
