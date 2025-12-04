// routers/newsletter.js
const express = require('express');
const router = express.Router();
const pool = require('../db').promise;
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Frontend URL for unsubscribe link
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bread-kitchen.jordanasseff.ca';

// reCAPTCHA secret key from environment
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Verify reCAPTCHA v3 token with Google
// Returns { success: boolean, score: number } for v3
async function verifyRecaptcha(token) {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    });

    const data = await response.json();

    // For reCAPTCHA v3, check success AND score
    // Score ranges from 0.0 (bot) to 1.0 (human)
    // Using 0.5 as threshold (Google's recommended default)
    if (data.success && data.score !== undefined) {
        return data.score >= 0.5;
    }

    // Fallback for v2 or if score not present
    return data.success;
}

// POST /newsletter/subscribe
router.post('/subscribe', async (req, res) => {
    const { email, captchaToken } = req.body;

    // Validate input
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Verify reCAPTCHA if token provided (skip for simple form or localhost dev)
        if (captchaToken && captchaToken !== 'skip') {
            // Skip reCAPTCHA verification in development (localhost)
            const isLocalhost = req.get('origin')?.includes('localhost') ||
                               req.get('host')?.includes('localhost');

            if (!isLocalhost) {
                const isHuman = await verifyRecaptcha(captchaToken);
                if (!isHuman) {
                    return res.status(400).json({ error: 'reCAPTCHA verification failed' });
                }
            }
        }

        // Check if email already exists
        const [existing] = await pool.query(
            'SELECT id FROM newsletter_subscribers WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already subscribed' });
        }

        // Insert new subscriber
        await pool.query(
            'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())',
            [email]
        );

        // Send confirmation email
        const unsubscribeToken = Buffer.from(email).toString('base64');
        const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

        try {
            console.log('Attempting to send confirmation email to:', email);
            const emailResult = await resend.emails.send({
                from: 'Bread Kitchen <onboarding@resend.dev>',
                to: [email],
                subject: 'Welcome to Bread Kitchen!',
                html: `
                    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #5a4a32; border-bottom: 2px solid #CFD8B3; padding-bottom: 10px;">
                            Welcome to Bread Kitchen!
                        </h2>

                        <p style="color: #5a4a32; line-height: 1.6;">
                            This is just a confirmation email to show a successful email sign up for Bread Kitchen.
                        </p>

                        <p style="color: #5a4a32; line-height: 1.6;">
                            <strong>You do not need to reply to this email.</strong>
                        </p>

                        <p style="color: #5a4a32; line-height: 1.6;">
                            We will send regular emails for fresh bread available for pick up.
                        </p>

                        <p style="color: #8B5A2B; font-size: 1.1em; margin-top: 20px;">
                            Stay tuned and stay hungry! 🍞
                        </p>

                        <hr style="border: none; border-top: 1px solid #CFD8B3; margin: 30px 0;" />

                        <p style="color: #999; font-size: 0.85em;">
                            If you did not sign up for this, please
                            <a href="${unsubscribeUrl}" style="color: #C58E56;">unsubscribe here</a>.
                        </p>
                    </div>
                `
            });
            console.log('Confirmation email sent to:', email, 'Result:', JSON.stringify(emailResult));
        } catch (emailError) {
            // Don't fail the signup if email fails - they're still subscribed
            console.error('Failed to send confirmation email:', emailError.message || emailError);
        }

        res.json({ success: true, message: 'Successfully subscribed!' });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
