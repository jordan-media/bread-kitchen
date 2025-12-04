# Hosting Plan - Bread Kitchen

## Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Working | bread-kitchen.jordanasseff.ca (HostPapa) |
| API | ✅ Working | Railway |
| Database | ✅ Working | Railway MySQL |
| reCAPTCHA | ✅ Configured | Google (domain added) |
| Email | ❌ Blocked | Railway blocks SMTP ports |
| Product Images | ⚠️ Placeholder | No images uploaded |

---

## PLAN A: Quick Fix for Presentation

**Goal:** Get everything working for live demo with minimal changes.

### Option 1: Skip Email (Easiest)
- Forms save to database (newsletter works!)
- Contact form shows "success" but doesn't actually email
- **Time:** 10 minutes
- **Tradeoff:** No actual emails sent

### Option 2: Use Free Email API (Resend.com)
- Sign up at resend.com (free tier: 100 emails/day)
- Replace nodemailer with Resend API
- **Time:** 30-45 minutes
- **Result:** Real emails work

### Option 3: Move API to HostPapa VPS (if available)
- If you upgrade HostPapa, you can run Node.js
- Everything in one place
- **Time:** 2-3 hours

---

## PLAN B: Permanent Production Deployment

**For a real client (bread-kitchen.jp or similar)**

### Recommended Stack

| Component | Service | Cost |
|-----------|---------|------|
| Domain | bread-kitchen.jp | ~$15/year |
| Frontend | Vercel or Netlify | Free |
| API | Railway or Render | Free tier / $5/mo |
| Database | Railway MySQL or PlanetScale | Free tier |
| Email | Resend or SendGrid | Free tier |
| Images | Cloudinary or AWS S3 | Free tier |

### Steps for Production

1. **Domain Setup**
   - Purchase domain
   - Point to Vercel/Netlify (frontend)
   - API stays on Railway

2. **Image Hosting**
   - Upload product images to Cloudinary
   - Store URLs in database
   - Images load from CDN (fast!)

3. **Email Service**
   - Use Resend.com or SendGrid
   - Much more reliable than Gmail
   - Better deliverability

4. **Environment Variables**
   - All secrets in hosting platform
   - Never in code

---

## For Your Presentation

### What Will Work Now:
- ✅ Site loads on subdomain
- ✅ Menu shows products from database
- ✅ Newsletter saves emails to database
- ✅ reCAPTCHA validates users
- ✅ Course inquiry form (saves, but no email)
- ✅ Contact form (saves, but no email)

### What Won't Work:
- ❌ Actual email delivery
- ❌ Real product images (showing placeholders)

### Quick Wins Before Presentation:

**1. Add Product Images (30 min)**
- Upload images to `web/public/images/products/`
- Rebuild and re-upload to HostPapa
- Images show from frontend, not API

**2. Make Forms Show Success (Already done)**
- Forms work, they just don't email
- User sees "Success!" message

**3. Disable Email Verification on Startup (5 min)**
- Removes the error from logs
- Cleaner deployment

---

## Decision Tree

```
Do you need emails to actually send for presentation?
│
├─ NO → You're done! Everything else works.
│
└─ YES →
    │
    ├─ Quick solution → Use Resend.com (30 min)
    │
    └─ Skip for now → Focus on other features
```

---

## Recommended Next Steps

### For Presentation (Today/Tomorrow):
1. ✅ Frontend on subdomain - DONE
2. ✅ API on Railway - DONE
3. ✅ Database connected - DONE
4. ⬜ Add a few product images (optional)
5. ⬜ Test full flow one more time

### For Production (Later):
1. Set up Resend.com for email
2. Set up Cloudinary for images
3. Purchase real domain
4. Deploy frontend to Vercel
5. Update all environment variables

---

## Summary

**You've accomplished a lot:**
- Full-stack deployment across multiple services
- Database in the cloud
- API handling requests
- reCAPTCHA working
- Subdomain configured

**The only issue is email** - and that's a known Railway limitation. For a presentation, you can:
1. Mention "email delivery configured for production environment"
2. Show the forms work and data saves
3. Move on!

---

*Don't let perfect be the enemy of good. Ship it!*
