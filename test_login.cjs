const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle' });
    
    // Fill the login form
    await page.fill('input[name="email"]', 'admin@template.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    console.log('Current URL after login:', page.url());
    
    // Wait a bit to see if any delayed errors pop up
    await new Promise(r => setTimeout(r, 2000));
    
    // Take a screenshot just to see what it looks like
    await page.screenshot({ path: 'playwright-screenshot.png' });
    
  } catch (e) {
    console.log('Script Error:', e.message);
  }
  
  await browser.close();
})();
