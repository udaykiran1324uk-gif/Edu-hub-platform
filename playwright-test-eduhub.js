const { chromium } = require('playwright');
const path = require('path');

const TARGET_URL = 'https://edu-hub-platform.onrender.com';
const PDF_PATH = 'C:\\Users\\udayk\\webproject major2\\NLP study materila].pdf';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  const randomId = Math.floor(Math.random() * 10000);
  const email = `testuser${randomId}@example.com`;
  const password = 'Password123!';
  const mobile = '9' + Math.floor(Math.random() * 900000000).toString().padStart(9, '0');
  const name = `Test User ${randomId}`;

  try {
    console.log(`Starting test on ${TARGET_URL}`);
    
    // 1. Signup
    console.log('Navigating to signup...');
    await page.goto(`${TARGET_URL}/signup`, { waitUntil: 'networkidle' });
    
    // Try different possible selectors for signup
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]');
    const emailInput = page.locator('input[name="email"], input[placeholder*="Email"]');
    const mobileInput = page.locator('input[name="mobile"], input[placeholder*="Mobile"], input[name="phone"]');
    const passwordInput = page.locator('input[name="password"], input[placeholder*="Password"]');
    
    await nameInput.first().fill(name);
    await emailInput.first().fill(email);
    await mobileInput.first().fill(mobile);
    await passwordInput.first().fill(password);
    
    console.log('Submitting signup form...');
    await page.click('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")');
    
    // Wait for navigation or success message
    try {
        await page.waitForURL('**/login', { timeout: 15000 });
        console.log('Signup successful, redirected to login');
    } catch (e) {
        console.log('Signup redirection failed or slow. Checking for success message or manual redirect...');
        const content = await page.content();
        if (content.includes('Success') || content.includes('Account created')) {
            console.log('Signup seems successful based on page content');
            await page.goto(`${TARGET_URL}/login`);
        } else {
            console.log('Signup failed or unknown state. Current URL:', page.url());
        }
    }

    // 2. Login
    console.log('Navigating to login...');
    await page.goto(`${TARGET_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"], input[placeholder*="Email"]', email);
    await page.fill('input[name="password"], input[placeholder*="Password"]', password);
    await page.click('button[type="submit"], button:has-text("Login")');
    
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
        console.log('Login successful. Current URL:', page.url());
    } catch (e) {
        console.log('Login navigation timed out. checking current state...');
    }

    // 3. Upload File
    console.log('Navigating to upload...');
    await page.goto(`${TARGET_URL}/upload`).catch(() => console.log('/upload goto failed'));
    
    console.log(`Uploading file: ${PDF_PATH}`);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(PDF_PATH);
    
    // Fill title
    const titleInput = page.locator('input[name="title"], input[placeholder*="Title"]');
    if (await titleInput.count() > 0) {
        await titleInput.fill('NLP Study Material Test');
    }
    
    // Fill description if exists
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="Description"]');
    if (await descInput.count() > 0) {
        await descInput.fill('Automated test upload');
    }

    await page.click('button[type="submit"], button:has-text("Upload"), button:has-text("Submit")');
    console.log('Upload submitted');
    
    // Wait for upload to complete
    await page.waitForTimeout(5000);

    // 4. Verify in /browse
    console.log('Navigating to /browse...');
    await page.goto(`${TARGET_URL}/browse`, { waitUntil: 'networkidle' });
    const fileExists = await page.locator('text=NLP Study Material Test').count() > 0;
    console.log(`File appears in browse: ${fileExists}`);

    // 5. Test Forgot Password
    console.log('Testing Forgot Password flow...');
    await page.goto(`${TARGET_URL}/login`);
    const forgotLink = page.locator('text=Forgot Password, a[href*="forgot"]');
    if (await forgotLink.count() > 0) {
        await forgotLink.first().click();
        await page.waitForURL('**/forgot-password');
        await page.fill('input[name="mobile"], input[placeholder*="Mobile"]', mobile);
        await page.click('button:has-text("Send OTP"), button:has-text("Get OTP")');
        
        console.log('OTP request submitted. Checking for OTP field...');
        try {
            await page.waitForSelector('input[name="otp"], input[placeholder*="OTP"]', { timeout: 10000 });
            console.log('OTP field appeared');
        } catch (e) {
            console.error('OTP field did not appear or request failed');
        }
    } else {
        console.log('Forgot Password link not found on login page');
    }

  } catch (error) {
    console.error('Test failed with error:', error.message);
  } finally {
    console.log('Final URL:', page.url());
    await browser.close();
  }
})();
