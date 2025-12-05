// routers/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../db').promise;
const { sendTestEmail, sendCampaign, decodeUnsubscribeToken } = require('../services/emailService');

// ============================================
// ADMIN PASSWORD - From environment variable
// ============================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// ============================================

// Simple session storage (in production, use Redis or database)
const sessions = new Map();

// Generate simple session token
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Auth middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

// ============================================
// AUTH ROUTES
// ============================================

// POST /admin/login
router.post('/login', (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        const token = generateToken();
        sessions.set(token, { createdAt: Date.now() });

        // Clean old sessions (older than 24 hours)
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        for (const [key, value] of sessions) {
            if (value.createdAt < dayAgo) sessions.delete(key);
        }

        res.json({ success: true, token });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// POST /admin/logout
router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) sessions.delete(token);
    res.json({ success: true });
});

// GET /admin/verify - Check if token is valid
router.get('/verify', requireAuth, (req, res) => {
    res.json({ valid: true });
});

// ============================================
// STATS ROUTES
// ============================================

// GET /admin/stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const [subscribers] = await pool.query(
            'SELECT COUNT(*) as count FROM newsletter_subscribers'
        );
        const [campaigns] = await pool.query(
            'SELECT COUNT(*) as count FROM email_campaigns WHERE sent_at IS NOT NULL'
        );
        const [lastCampaign] = await pool.query(
            'SELECT sent_at, recipient_count FROM email_campaigns WHERE sent_at IS NOT NULL ORDER BY sent_at DESC LIMIT 1'
        );

        res.json({
            subscriberCount: subscribers[0].count,
            campaignsSent: campaigns[0].count,
            lastCampaign: lastCampaign[0] || null
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SUBSCRIBER ROUTES
// ============================================

// GET /admin/subscribers
router.get('/subscribers', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /admin/subscribers/:id
router.delete('/subscribers/:id', requireAuth, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM newsletter_subscribers WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /admin/subscribers/export - Export as CSV
router.get('/subscribers/export', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        );

        const csv = 'email,subscribed_at\n' +
            rows.map(r => `${r.email},${r.subscribed_at}`).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CAMPAIGN ROUTES
// ============================================

// GET /admin/campaigns
router.get('/campaigns', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM email_campaigns ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /admin/campaigns/:id
router.get('/campaigns/:id', requireAuth, async (req, res) => {
    try {
        const [campaigns] = await pool.query(
            'SELECT * FROM email_campaigns WHERE id = ?',
            [req.params.id]
        );

        if (campaigns.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get campaign items with product details
        const [items] = await pool.query(`
            SELECT
                eci.*,
                p.name_en,
                p.name_ja,
                p.price,
                p.description_en,
                p.description_ja,
                p.image
            FROM email_campaign_items eci
            JOIN products p ON eci.product_id = p.product_id
            WHERE eci.campaign_id = ?
            ORDER BY eci.sort_order ASC
        `, [req.params.id]);

        res.json({
            ...campaigns[0],
            items
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /admin/campaigns
router.post('/campaigns', requireAuth, async (req, res) => {
    const { subject, intro_text, pickup_date, pickup_time, items } = req.body;

    if (!subject || !pickup_date || !pickup_time) {
        return res.status(400).json({ error: 'Subject, pickup date and time are required' });
    }

    try {
        // Create campaign
        const [result] = await pool.query(
            'INSERT INTO email_campaigns (subject, intro_text, pickup_date, pickup_time, created_at) VALUES (?, ?, ?, ?, NOW())',
            [subject, intro_text || null, pickup_date, pickup_time]
        );

        const campaignId = result.insertId;

        // Add items
        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                await pool.query(
                    'INSERT INTO email_campaign_items (campaign_id, product_id, sort_order) VALUES (?, ?, ?)',
                    [campaignId, items[i].product_id, i]
                );
            }
        }

        res.status(201).json({ success: true, id: campaignId });
    } catch (error) {
        console.error('Create campaign error:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /admin/campaigns/:id
router.put('/campaigns/:id', requireAuth, async (req, res) => {
    const { subject, intro_text, pickup_date, pickup_time, items } = req.body;

    try {
        // Check if campaign exists and hasn't been sent
        const [existing] = await pool.query(
            'SELECT sent_at FROM email_campaigns WHERE id = ?',
            [req.params.id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (existing[0].sent_at) {
            return res.status(400).json({ error: 'Cannot edit a sent campaign' });
        }

        // Update campaign
        await pool.query(
            'UPDATE email_campaigns SET subject = ?, intro_text = ?, pickup_date = ?, pickup_time = ? WHERE id = ?',
            [subject, intro_text || null, pickup_date, pickup_time, req.params.id]
        );

        // Update items - delete old, insert new
        await pool.query('DELETE FROM email_campaign_items WHERE campaign_id = ?', [req.params.id]);

        if (items && items.length > 0) {
            for (let i = 0; i < items.length; i++) {
                await pool.query(
                    'INSERT INTO email_campaign_items (campaign_id, product_id, sort_order) VALUES (?, ?, ?)',
                    [req.params.id, items[i].product_id, i]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /admin/campaigns/:id
router.delete('/campaigns/:id', requireAuth, async (req, res) => {
    try {
        // Delete items first (foreign key)
        await pool.query('DELETE FROM email_campaign_items WHERE campaign_id = ?', [req.params.id]);
        await pool.query('DELETE FROM email_campaigns WHERE id = ?', [req.params.id]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// SEND ROUTES
// ============================================

// POST /admin/campaigns/:id/send-test
router.post('/campaigns/:id/send-test', requireAuth, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Test email address required' });
    }

    try {
        // Get campaign with items
        const [campaigns] = await pool.query(
            'SELECT * FROM email_campaigns WHERE id = ?',
            [req.params.id]
        );

        if (campaigns.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Use frontend URL for images (hosted on HostPapa)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const [items] = await pool.query(`
            SELECT
                p.name_en,
                p.name_ja,
                p.price,
                p.description_en,
                CONCAT('${frontendUrl}/assets/', p.image) as image_url
            FROM email_campaign_items eci
            JOIN products p ON eci.product_id = p.product_id
            WHERE eci.campaign_id = ?
            ORDER BY eci.sort_order ASC
        `, [req.params.id]);

        const result = await sendTestEmail(campaigns[0], items, email);

        if (result.success) {
            res.json({ success: true, message: 'Test email sent!' });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        console.error('Send test error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /admin/campaigns/:id/send
router.post('/campaigns/:id/send', requireAuth, async (req, res) => {
    try {
        // Get campaign
        const [campaigns] = await pool.query(
            'SELECT * FROM email_campaigns WHERE id = ?',
            [req.params.id]
        );

        if (campaigns.length === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        if (campaigns[0].sent_at) {
            return res.status(400).json({ error: 'Campaign already sent' });
        }

        // Get items with product details
        // Use frontend URL for images (hosted on HostPapa)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const [items] = await pool.query(`
            SELECT
                p.name_en,
                p.name_ja,
                p.price,
                p.description_en,
                CONCAT('${frontendUrl}/assets/', p.image) as image_url
            FROM email_campaign_items eci
            JOIN products p ON eci.product_id = p.product_id
            WHERE eci.campaign_id = ?
            ORDER BY eci.sort_order ASC
        `, [req.params.id]);

        // Get subscribers
        const [subscribers] = await pool.query(
            'SELECT email FROM newsletter_subscribers'
        );

        if (subscribers.length === 0) {
            return res.status(400).json({ error: 'No subscribers to send to' });
        }

        // Send campaign
        const result = await sendCampaign(campaigns[0], items, subscribers);

        // Update campaign as sent
        await pool.query(
            'UPDATE email_campaigns SET sent_at = NOW(), recipient_count = ? WHERE id = ?',
            [result.sent, req.params.id]
        );

        res.json({
            success: true,
            sent: result.sent,
            failed: result.failed,
            total: result.total
        });
    } catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// UNSUBSCRIBE ROUTE (public)
// ============================================

// POST /admin/unsubscribe
router.post('/unsubscribe', async (req, res) => {
    const { token } = req.body;

    const email = decodeUnsubscribeToken(token);

    if (!email) {
        return res.status(400).json({ error: 'Invalid unsubscribe token' });
    }

    try {
        const [result] = await pool.query(
            'DELETE FROM newsletter_subscribers WHERE email = ?',
            [email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Email not found or already unsubscribed' });
        }

        res.json({ success: true, message: 'Successfully unsubscribed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /admin/products - Get all products for dropdown
router.get('/products', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                p.product_id,
                p.name_en,
                p.name_ja,
                p.price,
                p.image,
                c.name_en as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_available = TRUE
            ORDER BY c.name_en, p.name_en
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
