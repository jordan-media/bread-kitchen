// services/emailService.js
const nodemailer = require('nodemailer');
const { generateEmailHTML, generatePlainText } = require('../templates/emailTemplate');

// ============================================
// EMAIL CONFIGURATION
// Uses environment variables from .env file
// ============================================
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

const SENDER_NAME = 'Bread Kitchen';
const SENDER_EMAIL = process.env.EMAIL_USER;
const BASE_URL = 'http://localhost:5173';  // Your frontend URL
// ============================================

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email service error:', error.message);
        console.log('   Make sure to set up Gmail App Password');
    } else {
        console.log('✅ Email service ready');
    }
});

// Generate unsubscribe URL with encoded email
function getUnsubscribeUrl(email) {
    const token = Buffer.from(email).toString('base64');
    return `${BASE_URL}/unsubscribe?token=${token}`;
}

// Send a single email
async function sendEmail(to, subject, html, text) {
    const mailOptions = {
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to,
        subject,
        html,
        text
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Failed to send to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
}

// Send campaign to a single recipient (for testing)
async function sendTestEmail(campaign, items, testEmail) {
    const unsubscribeUrl = getUnsubscribeUrl(testEmail);
    const html = generateEmailHTML(campaign, items, unsubscribeUrl);
    const text = generatePlainText(campaign, items, unsubscribeUrl);

    return await sendEmail(testEmail, campaign.subject, html, text);
}

// Send campaign to all subscribers
async function sendCampaign(campaign, items, subscribers) {
    const results = {
        total: subscribers.length,
        sent: 0,
        failed: 0,
        errors: []
    };

    for (const subscriber of subscribers) {
        const unsubscribeUrl = getUnsubscribeUrl(subscriber.email);
        const html = generateEmailHTML(campaign, items, unsubscribeUrl);
        const text = generatePlainText(campaign, items, unsubscribeUrl);

        const result = await sendEmail(subscriber.email, campaign.subject, html, text);

        if (result.success) {
            results.sent++;
        } else {
            results.failed++;
            results.errors.push({ email: subscriber.email, error: result.error });
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
}

// Decode unsubscribe token back to email
function decodeUnsubscribeToken(token) {
    try {
        return Buffer.from(token, 'base64').toString('utf-8');
    } catch {
        return null;
    }
}

module.exports = {
    sendEmail,
    sendTestEmail,
    sendCampaign,
    decodeUnsubscribeToken,
    getUnsubscribeUrl
};
