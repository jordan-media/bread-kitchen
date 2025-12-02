// routers/contact.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// reCAPTCHA secret key from environment
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Email transporter (same config as admin campaigns)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify reCAPTCHA v3 token with Google
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
    if (data.success && data.score !== undefined) {
        return data.score >= 0.5;
    }

    return data.success;
}

// POST /contact/send
router.post('/send', async (req, res) => {
    const { name, email, subject, message, captchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        // Verify reCAPTCHA if token provided
        if (captchaToken) {
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

        // Subject line mapping
        const subjectMap = {
            'order': 'Bread Order Inquiry',
            'course': 'Course Inquiry',
            'private': 'Private Lesson Inquiry',
            'other': 'General Inquiry'
        };

        const subjectLine = subjectMap[subject] || 'Contact Form Message';

        // Send email to bakery
        await transporter.sendMail({
            from: `"Bread Kitchen Website" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `[Bread Kitchen] ${subjectLine}`,
            html: `
                <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #5a4a32; border-bottom: 2px solid #CFD8B3; padding-bottom: 10px;">
                        New Contact Form Message
                    </h2>

                    <table style="width: 100%; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px 0; color: #8B5A2B; font-weight: bold; width: 100px;">From:</td>
                            <td style="padding: 8px 0; color: #5a4a32;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #8B5A2B; font-weight: bold;">Email:</td>
                            <td style="padding: 8px 0; color: #5a4a32;">
                                <a href="mailto:${email}" style="color: #C58E56;">${email}</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #8B5A2B; font-weight: bold;">Subject:</td>
                            <td style="padding: 8px 0; color: #5a4a32;">${subjectLine}</td>
                        </tr>
                    </table>

                    <div style="background-color: #FEFBE3; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #5a4a32; margin: 0 0 10px 0;">Message:</h3>
                        <p style="color: #5a4a32; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>

                    <p style="color: #8B5A2B; font-size: 0.9em; margin-top: 30px;">
                        You can reply directly to this email to respond to ${name}.
                    </p>
                </div>
            `
        });

        res.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
