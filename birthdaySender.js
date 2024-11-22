const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Path for storing session data
const SESSION_FILE_PATH = path.join(__dirname, "whatsapp-session.json");

// Template for birthday wish message
const TEMPLATE = "Happy Birthday, Kanzurr! 🎉 Wishing you a fantastic day filled with joy and success.";

// Function to send the message to WhatsApp contact
const sendMessageToContact = async (phone, message) => {
    let browser;
    try {
        const launchOptions = {
            headless: false,  // Set to false for debugging (see the browser)
            args: ["--start-maximized"],
        };

        // Launch the browser with the session if it exists
        if (fs.existsSync(SESSION_FILE_PATH)) {
            const session = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, "utf-8"));
            launchOptions.userDataDir = session.userDataDir;
        }

        browser = await puppeteer.launch(launchOptions);
        const page = await browser.newPage();
        
        // Go to WhatsApp Web
        await page.goto("https://web.whatsapp.com", { waitUntil: 'domcontentloaded' });

        // Wait for WhatsApp Web to load fully (look for the first chat container or app elements)
        await page.waitForSelector('div[role="textbox"]', { timeout: 120000 });

        // Construct the URL for the specific phone number
        const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait for the textbox to appear and send the message
        await page.waitForSelector('div[role="textbox"]', { timeout: 120000 });
        await page.click('div[role="textbox"]');
        await page.keyboard.type(message);
        await page.keyboard.press("Enter");

        console.log(`Message sent to ${phone}: ${message}`);

        // Save session data to avoid scanning QR code again
        const context = page.context(); // Get the page context
        const session = await context.storageState(); // Get session state
        fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(session)); // Save session state to file

    } catch (error) {
        console.error("Error while sending message to contact:", error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

// Main function to send the message after login
const main = async () => {
    const phone = "+94767215442";  // Kanzurr's phone number
    const message = "Happy Birthday, Kanzurr! 🎉 Wishing you a fantastic day filled with joy and success.";

    // Send the message immediately after login
    await sendMessageToContact(phone, message);
};

main().catch((error) => {
    console.error("Error in script execution:", error);
});
