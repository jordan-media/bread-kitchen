# Bread Kitchen - Email System Documentation

## Project Overview

This documentation covers the implementation and troubleshooting of the email system for Bread Kitchen, a Japanese bakery website with newsletter subscriptions and email campaign functionality.

**Tech Stack:**
- Frontend: React + Vite (hosted on HostPapa)
- Backend: Express.js API (hosted on Railway)
- Database: MySQL (hosted on Railway)
- Email Service: Resend API

---

## Part 1: Detailed Timeline & Issue Resolution

### Issue 1: Newsletter Confirmation Emails Not Sending

**Problem:** Users could subscribe to the newsletter, but no confirmation email was received.

**Root Cause:**
- The newsletter code existed locally but was never pushed to GitHub/Railway
- Resend's free tier only allows sending to your own email without domain verification

**Solution:**
1. Verified domain `bread-kitchen.jordanasseff.ca` with Resend
2. Added DNS records to HostPapa:
   - DKIM record (for email authentication)
   - SPF MX record
   - SPF TXT record
3. Updated email sender from `onboarding@resend.dev` to `hello@bread-kitchen.jordanasseff.ca`
4. Added logging to `newsletter.js` for debugging
5. Pushed changes to GitHub for Railway deployment

**Files Modified:**
- `api/routers/newsletter.js`
- `api/routers/contact.js`

---

### Issue 2: Admin Panel 500 Error

**Problem:** Admin API returned "pool.promise is not a function" error.

**Root Cause:** Database connection syntax mismatch between files.

**Solution:**
Changed from:
```javascript
const db = require('../db');
db.promise().query(...)
```
To:
```javascript
const pool = require('../db').promise;
pool.query(...)
```

**Files Modified:**
- `api/routers/admin.js`

---

### Issue 3: Admin Page 404 on HostPapa

**Problem:** Navigating directly to `/admin` returned a 404 error.

**Root Cause:** HostPapa wasn't configured for client-side routing (React Router).

**Solution:**
Created `.htaccess` file in the `dist` folder:
```apache
RewriteEngine On
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**Important Note:** The `.htaccess` file gets deleted when running `npm run build`. Must be re-added after each build or copied from a backup.

---

### Issue 4: Missing Database Tables on Railway

**Problem:** Tables existed locally but not on Railway production database.

**Root Cause:**
- `DB_NAME` was set to `bread` instead of `railway`
- Tables were never created on Railway

**Solution:**
1. Changed `DB_NAME` environment variable from `bread` to `railway` on Railway
2. Connected to Railway MySQL and created missing tables:
   - `newsletter_subscribers`
   - `email_campaigns`
   - `email_campaign_items`
   - `categories`
   - `products`

**Connection Command:**
```bash
export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
mysql -h turntable.proxy.rlwy.net -P 18587 -u root -p[PASSWORD] railway
```

---

### Issue 5: Campaign Test Emails Failing

**Problem:** Campaign test emails returned "Connection timeout" error.

**Root Cause:** `emailService.js` was using Nodemailer with Gmail SMTP (not configured on Railway), while newsletter/contact used Resend.

**Solution:**
Rewrote `emailService.js` to use Resend API:

```javascript
// Before (Nodemailer)
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({...});

// After (Resend)
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
```

**Files Modified:**
- `api/services/emailService.js`

---

### Issue 6: Product Images Not Showing on Menu

**Problem:** Menu page showed placeholder images instead of actual product photos.

**Root Cause:**
1. `image` field was `NULL` in the database for all products
2. Frontend was looking for images at wrong URL path

**Solution:**
1. Updated database with image filenames:
```sql
UPDATE products SET image = 'melon-bread.jpg' WHERE name_en = 'Melon Pan';
UPDATE products SET image = 'anpan.jpg' WHERE name_en = 'Anpan';
-- etc for all products
```

2. Changed image path in `AllProducts.jsx`:
```javascript
// Before
src={`${API_BASE_URL}/products/images/${product.image}`}

// After
src={`/assets/${product.image}`}
```

**Files Modified:**
- `web/src/pages/AllProducts.jsx`
- `web/src/pages/Product.jsx`
- `web/src/pages/admin/Admin.jsx`
- `web/src/components/AddProductModalContent.js`

---

### Issue 7: Images Not Showing in Campaign Emails

**Problem:** Emails sent successfully but images appeared broken.

**Root Cause:**
1. Backend was using wrong URL for images
2. `FRONTEND_URL` environment variable not set on Railway

**Solution:**
1. Updated `admin.js` to use `FRONTEND_URL` for image paths:
```javascript
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
// Images: ${frontendUrl}/assets/${image}
```

2. Added environment variable to Railway:
```
FRONTEND_URL = https://bread-kitchen.jordanasseff.ca
```

**Files Modified:**
- `api/routers/admin.js`

---

### Issue 8: Hardcoded Localhost URLs

**Problem:** Various frontend files had hardcoded `localhost` URLs that wouldn't work in production.

**Files with issues:**
- `Product.jsx` - hardcoded `localhost:5000`
- `AddProductModalContent.js` - hardcoded `localhost:3000`

**Solution:**
Changed all hardcoded URLs to use either:
- `API_BASE_URL` constant (for API calls)
- `/assets/` path (for images)

---

## Part 2: Simple Overview

### A + B + C = Complete Email System

```
A: Domain Verification (Resend)
   + DNS records on HostPapa
   + Verified sender domain
   ─────────────────────────────

B: Backend Configuration (Railway)
   + Environment variables set
   + Resend API integration
   + Database tables created
   ─────────────────────────────

C: Frontend Configuration (HostPapa)
   + .htaccess for routing
   + Correct image paths
   + API_BASE_URL configured
   ─────────────────────────────

= Working Email System
   ✓ Newsletter subscriptions
   ✓ Confirmation emails
   ✓ Contact form emails
   ✓ Campaign emails with images
```

---

## Part 3: Quick Reference Checklists

### Checklist: Pain Points to Watch For

- [ ] **Resend free tier limitation** - Must verify domain to send to any email
- [ ] **`.htaccess` deleted on build** - Re-add after every `npm run build`
- [ ] **Railway DB name** - Use `railway`, not custom name like `bread`
- [ ] **Environment variables** - Must be on correct Railway service (API, not MySQL)
- [ ] **Hidden files in FileZilla** - Enable "Force showing hidden files" for `.htaccess`
- [ ] **Image paths** - Frontend uses `/assets/`, emails need full URL with domain
- [ ] **Localhost references** - Search codebase for `localhost` before deploying
- [ ] **Database sync** - Local tables don't auto-sync to Railway

---

### Checklist: Starting a New Project From Scratch

#### Step 1: Set Up Resend Email Service
- [ ] Create account at resend.com
- [ ] Add and verify your domain
- [ ] Add DNS records to your domain host:
  - [ ] DKIM record
  - [ ] SPF MX record
  - [ ] SPF TXT record
- [ ] Get API key
- [ ] Wait for domain verification (can take a few minutes)

#### Step 2: Set Up Railway Backend
- [ ] Create Railway project
- [ ] Add MySQL database service
- [ ] Connect GitHub repo for auto-deploy
- [ ] Add environment variables to API service:
  ```
  DB_HOST=mysql.railway.internal
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=[from Railway MySQL]
  DB_NAME=railway
  RESEND_API_KEY=[from Resend]
  ADMIN_PASSWORD=[your choice]
  FRONTEND_URL=https://[your-domain]
  RECAPTCHA_SECRET_KEY=[if using reCAPTCHA]
  ```
- [ ] Create database tables via Railway CLI or MySQL client

#### Step 3: Set Up Frontend Hosting (HostPapa or similar)
- [ ] Create subdomain for your project
- [ ] Configure DNS to point to hosting
- [ ] Create `.htaccess` for client-side routing
- [ ] Set `VITE_API_URL` in `.env` or build config:
  ```
  VITE_API_URL=https://[your-railway-url]
  ```

#### Step 4: Configure Frontend Code
- [ ] Use environment variable for API URL:
  ```javascript
  export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  ```
- [ ] Use relative paths for images: `/assets/[image]`
- [ ] Search for and remove any `localhost` hardcoding

#### Step 5: Configure Backend Code
- [ ] Use Resend for all transactional emails
- [ ] Use `FRONTEND_URL` env var for email image URLs
- [ ] Use parameterized queries for database (prevent SQL injection)

#### Step 6: Build and Deploy
- [ ] Run `npm run build` in frontend
- [ ] Add `.htaccess` to dist folder
- [ ] Upload dist contents to hosting via FTP/FileZilla
- [ ] Push backend changes to GitHub (Railway auto-deploys)
- [ ] Verify environment variables are set on Railway

#### Step 7: Test Everything
- [ ] Test newsletter subscription
- [ ] Check for confirmation email
- [ ] Test contact form
- [ ] Test admin login
- [ ] Create test campaign
- [ ] Send test campaign email
- [ ] Verify images appear in email

---

## Environment Variables Reference

### Railway API Service
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL internal host | `mysql.railway.internal` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `[auto-generated]` |
| `DB_NAME` | Database name | `railway` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxx` |
| `ADMIN_PASSWORD` | Admin panel password | `[your choice]` |
| `FRONTEND_URL` | Frontend domain for emails | `https://bread-kitchen.jordanasseff.ca` |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret | `[from Google]` |

### Frontend Build (.env or Vite config)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Railway API URL | `https://bread-kitchen-production.up.railway.app` |

---

## File Structure Reference

```
project/
├── api/                          # Backend (Railway)
│   ├── routers/
│   │   ├── admin.js              # Admin panel API
│   │   ├── contact.js            # Contact form API
│   │   ├── newsletter.js         # Newsletter subscription API
│   │   └── products.js           # Products API
│   ├── services/
│   │   └── emailService.js       # Resend email functions
│   ├── templates/
│   │   └── emailTemplate.js      # HTML email templates
│   ├── db.js                     # Database connection
│   └── server.js                 # Express server
│
└── web/                          # Frontend (HostPapa)
    ├── src/
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── Admin.jsx     # Admin panel
    │   │   ├── AllProducts.jsx   # Menu page
    │   │   └── ...
    │   └── api.js                # API_BASE_URL config
    ├── public/
    │   └── assets/               # Product images
    └── dist/                     # Built files (upload to HostPapa)
        ├── .htaccess             # Must add after build!
        ├── index.html
        └── assets/
```

---

## Useful Commands

```bash
# Connect to Railway MySQL
export PATH="/opt/homebrew/opt/mysql-client/bin:$PATH"
mysql -h turntable.proxy.rlwy.net -P 18587 -u root -p[PASSWORD] railway

# Build frontend
cd web && npm run build

# Check for localhost references
grep -r "localhost" web/src/

# Railway CLI
railway login
railway link
railway variables
railway logs
```

---

*Documentation created: December 4, 2025*
*Project: Bread Kitchen - bread-kitchen.jordanasseff.ca*
