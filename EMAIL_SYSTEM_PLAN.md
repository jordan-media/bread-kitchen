# Bread Kitchen Email System Plan

## Overview
Build an in-house email system for weekly bread announcements using Nodemailer.
Designed for a non-technical user to easily compose and send emails.

---

## Email Design Strategy

### The Problem
Email clients render HTML differently:
- Gmail strips `<style>` tags
- Outlook ignores padding/margin in some cases
- Apple Mail handles most things well
- Yahoo has its own quirks

### Our Solution: Bulletproof Email Design
1. **Table-based layout** - Not divs (oldest, most reliable method)
2. **Inline styles only** - No external CSS, no `<style>` blocks
3. **System fonts** - Arial, Georgia (no custom fonts)
4. **Max width 600px** - Standard email width, works on mobile
5. **Images with alt text** - Fallback if images blocked
6. **Simple color palette** - Use the bakery's existing colors

### Email Template Structure
```
┌──────────────────────────────────────────────────┐
│  HEADER                                          │
│  - Logo (hosted image)                           │
│  - "焼きたてパン - Fresh Bread This Week"          │
│  - Warm beige background (#EFE3C3)               │
├──────────────────────────────────────────────────┤
│  INTRO                                           │
│  - Personal greeting                             │
│  - Pickup date/time                              │
│  - Location reminder                             │
├──────────────────────────────────────────────────┤
│  BREAD ITEMS (repeatable)                        │
│  ┌────────────┬─────────────────────────────┐    │
│  │   Image    │  Name (EN)                  │    │
│  │   150x150  │  Name (JA)                  │    │
│  │            │  ¥ Price                    │    │
│  │            │  Short description          │    │
│  └────────────┴─────────────────────────────┘    │
├──────────────────────────────────────────────────┤
│  CALL TO ACTION                                  │
│  - "Reply to reserve your bread!"               │
│  - Or contact method                             │
├──────────────────────────────────────────────────┤
│  FOOTER                                          │
│  - Bread Kitchen                                 │
│  - Address                                       │
│  - Unsubscribe link                              │
│  - Muted colors, small text                      │
└──────────────────────────────────────────────────┘
```

---

## Database Changes

### New Tables Needed

```sql
-- Already created
newsletter_subscribers (id, email, subscribed_at)

-- Need to create
email_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    intro_text TEXT,
    pickup_date VARCHAR(100),
    pickup_time VARCHAR(100),
    created_at DATETIME,
    sent_at DATETIME NULL,
    recipient_count INT DEFAULT 0
)

email_campaign_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    bread_name_en VARCHAR(255),
    bread_name_ja VARCHAR(255),
    price VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id)
)
```

---

## Admin Interface

### Pages to Build

#### 1. Admin Login (`/admin`)
- Simple password protection
- No user accounts needed (single admin)
- Session-based auth

#### 2. Dashboard (`/admin/dashboard`)
- Quick stats: Total subscribers, emails sent
- Recent campaigns list
- "New Campaign" button

#### 3. Subscribers List (`/admin/subscribers`)
- Table: Email, Subscribed Date
- Delete button (with confirmation)
- Export to CSV button
- Search/filter

#### 4. New Campaign (`/admin/campaign/new`)
**Form fields:**
- Subject line (auto-suggest: "Fresh Bread - [Date]")
- Intro text (textarea, optional personal message)
- Pickup date (date picker)
- Pickup time (text, e.g., "10am - 2pm")

**Bread items section:**
- "Add Bread" button
- For each item:
  - Name (EN)
  - Name (JA)
  - Price
  - Description (short)
  - Image upload or select from existing

**Actions:**
- Save Draft
- Preview
- Send (with confirmation modal)

#### 5. Preview (`/admin/campaign/preview/:id`)
- Shows exactly how email will look
- "Send to myself first" button (test)
- "Send to all subscribers" button

---

## Technical Architecture

### Frontend (React)
```
/src/admin/
  ├── AdminLogin.jsx
  ├── AdminLayout.jsx (shared nav/header)
  ├── Dashboard.jsx
  ├── Subscribers.jsx
  ├── CampaignNew.jsx
  ├── CampaignPreview.jsx
  └── admin.module.css
```

### Backend (Express API)
```
/api/routers/
  └── admin.js
      POST   /admin/login
      GET    /admin/stats
      GET    /admin/subscribers
      DELETE /admin/subscribers/:id
      GET    /admin/subscribers/export

      POST   /admin/campaigns
      GET    /admin/campaigns
      GET    /admin/campaigns/:id
      PUT    /admin/campaigns/:id
      DELETE /admin/campaigns/:id

      POST   /admin/campaigns/:id/send-test
      POST   /admin/campaigns/:id/send
```

### Email Service
```
/api/services/
  └── emailService.js
      - generateEmailHTML(campaign, items)
      - sendEmail(to, subject, html)
      - sendCampaign(campaignId)
```

---

## Email Sending Details

### Nodemailer Setup
```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'breadkitchen@gmail.com',
        pass: 'app-specific-password'  // Not regular password!
    }
});
```

### Gmail App Password
1. Enable 2-factor auth on Gmail account
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use this in Nodemailer (not the regular password)

### Sending Strategy
- Send one at a time with small delay (avoid spam flags)
- 100ms delay between each email
- Log success/failure for each
- Update campaign with sent_at and recipient_count

### Unsubscribe Flow
1. Each email includes: `http://yoursite.com/unsubscribe?token=UNIQUE_TOKEN`
2. Token is encoded email (or database ID)
3. Clicking link → removes from database → shows confirmation page

---

## Security Considerations

1. **Admin password** - Stored hashed, not plain text
2. **Session secret** - Environment variable
3. **Unsubscribe tokens** - Signed/encoded to prevent abuse
4. **Rate limiting** - Prevent spam on subscribe endpoint
5. **Gmail credentials** - Environment variables, never in code

---

## Development Phases

### Phase 1: Foundation
- [ ] Create database tables
- [ ] Build email template (HTML)
- [ ] Set up Nodemailer with test account
- [ ] Create email service with sendEmail function

### Phase 2: Admin Backend
- [ ] Admin authentication routes
- [ ] Subscriber CRUD routes
- [ ] Campaign CRUD routes
- [ ] Send email routes

### Phase 3: Admin Frontend
- [ ] Login page
- [ ] Dashboard
- [ ] Subscribers list
- [ ] Campaign composer
- [ ] Preview page

### Phase 4: Polish
- [ ] Unsubscribe page
- [ ] Error handling
- [ ] Test on multiple email clients
- [ ] Mobile responsive admin

---

## Questions to Confirm

1. **Reply method** - Should customers reply to email, or use a form/LINE/phone?
2. **Frequency** - Weekly? Or as-needed?
3. **Sender email** - Use existing email or create new one?
4. **Admin password** - What should it be? (I won't store in code)
5. **Bakery address** - For email footer

---

## Files to Create

```
API:
  /api/routers/admin.js
  /api/services/emailService.js
  /api/templates/emailTemplate.js
  /api/middleware/adminAuth.js

Frontend:
  /web/src/pages/admin/Login.jsx
  /web/src/pages/admin/Dashboard.jsx
  /web/src/pages/admin/Subscribers.jsx
  /web/src/pages/admin/CampaignNew.jsx
  /web/src/pages/admin/CampaignPreview.jsx
  /web/src/pages/admin/Admin.module.css
  /web/src/pages/Unsubscribe.jsx
```

---

## Estimated Effort

| Phase | Components | Complexity |
|-------|------------|------------|
| Phase 1 | DB + Email template + Nodemailer | Medium |
| Phase 2 | Admin API routes | Medium |
| Phase 3 | Admin React pages | Medium-High |
| Phase 4 | Polish + Testing | Low-Medium |

This is a solid real-world project that covers:
- Full-stack development
- Database design
- Authentication
- Third-party integration (Gmail)
- HTML email (legacy web skills)
- User experience design
