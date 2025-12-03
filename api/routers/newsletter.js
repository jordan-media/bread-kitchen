// routers/newsletter.js
const express = require('express');
const router = express.Router();
const pool = require('../db').promise;

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

        res.json({ success: true, message: 'Successfully subscribed!' });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
