// services/emailService.js
const { Resend } = require('resend');
const { generateEmailHTML, generatePlainText } = require('../templates/emailTemplate');

// ============================================
// EMAIL CONFIGURATION
// Uses Resend API for transactional emails
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_NAME = 'Bread Kitchen';
const SENDER_EMAIL = 'hello@bread-kitchen.jordanasseff.ca';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bread-kitchen.jordanasseff.ca';
// ============================================

// Generate unsubscribe URL with encoded email
function getUnsubscribeUrl(email) {
    const token = Buffer.from(email).toString('base64');
    return `${FRONTEND_URL}/unsubscribe?token=${token}`;
}

// Send a single email using Resend
async function sendEmail(to, subject, html, text) {
    try {
        const { data, error } = await resend.emails.send({
            from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
            to: [to],
            subject,
            html,
            text
        });

        if (error) {
            console.error(`❌ Failed to send to ${to}:`, error);
            return { success: false, error: error.message };
        }

        console.log(`✅ Email sent to ${to}`, data);
        return { success: true, messageId: data.id };
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
