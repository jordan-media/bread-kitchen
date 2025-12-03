# Deployment Guide - Bread Kitchen

A step-by-step guide for deploying a React + Express + MySQL project to Railway (backend) and shared hosting (frontend).

---

## What We Did (Summary)

### Backend Deployment (Railway)
1. Created Railway account (login with GitHub)
2. Provisioned MySQL database
3. Connected GitHub repo to Railway
4. Configured environment variables
5. Fixed port configuration
6. Imported database tables

### Frontend Preparation
1. Updated API URL to use environment variable
2. Created production environment file
3. Built the React app for production

---

## Step-by-Step: Railway Deployment

### 1. Create Railway Account
- Go to https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create New Project
- Click "New Project"
- Select "MySQL" to provision a database

### 3. Deploy Your API
- Click "New" → "GitHub Repo"
- Select your repository
- Go to **Settings** → Set **Root Directory** to `api`

### 4. Configure Environment Variables

Go to your API service → **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `DB_HOST` | (from MySQL service - use PUBLIC host) |
| `DB_PORT` | (from MySQL service - use PUBLIC port) |
| `DB_USER` | (from MySQL service) |
| `DB_PASSWORD` | (from MySQL service) |
| `DB_NAME` | `bread` (or your database name) |
| `PORT` | `8080` |

**Important:** Use the PUBLIC host and port from MySQL, not the internal/private ones.

### 5. Configure Networking

Go to **Settings** → **Networking** → **Public Networking**

Make sure the port matches your `PORT` variable (e.g., 8080).

### 6. Import Database Tables

Install MySQL client locally:
```bash
brew install mysql-client
```

Import your SQL file:
```bash
/opt/homebrew/opt/mysql-client/bin/mysql -h YOUR_HOST -u root -pYOUR_PASSWORD --port YOUR_PORT --protocol=TCP railway < your-database.sql
```

---

## Common Problems & Solutions

### Problem: "Application failed to respond" (502 Error)

**Cause 1: Port mismatch**
- Check Settings → Networking → Port number
- Check Variables → PORT value
- These MUST match

**Solution:** Set both to the same value (e.g., 8080)

---

**Cause 2: Server not listening on all interfaces**

Your server.js needs:
```javascript
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
```

NOT just:
```javascript
app.listen(port, () => { ... });
```

---

### Problem: "Cannot find module '/app/index.js'"

**Cause:** package.json has wrong entry point

**Solution:** Check package.json:
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

---

### Problem: Database connection error (ENOTFOUND)

**Cause 1:** Using internal hostname from outside Railway's network

**Solution:** Use the PUBLIC hostname and port:
- `turntable.proxy.rlwy.net` (example)
- Port: `18587` (example - use your actual port)

---

**Cause 2:** Space or typo in hostname

**Solution:** Delete and re-add the variable, copying fresh from MySQL service

---

### Problem: Hardcoded database credentials

**Cause:** db.js has hardcoded localhost values

**Solution:** Use environment variables:
```javascript
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "bread",
    port: process.env.DB_PORT || 8889
});
```

---

## Must-Do Checklist (Before Deployment)

### Backend (API) Preparation

- [ ] **package.json** has correct `main` and `start` script:
  ```json
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
  ```

- [ ] **server.js** uses environment PORT:
  ```javascript
  const port = process.env.PORT || 3001;
  ```

- [ ] **server.js** listens on all interfaces:
  ```javascript
  app.listen(port, '0.0.0.0', () => { ... });
  ```

- [ ] **db.js** uses environment variables for all connection settings

- [ ] **.gitignore** includes `.env` (never commit secrets!)

### Frontend Preparation

- [ ] **api.js** uses environment variable:
  ```javascript
  export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  ```

- [ ] **.env.production** exists with Railway API URL:
  ```
  VITE_API_URL=https://your-app.up.railway.app
  ```

### Railway Configuration

- [ ] Root Directory set to `api` in Settings
- [ ] All DB_ variables added (HOST, PORT, USER, PASSWORD, NAME)
- [ ] PORT variable set (e.g., 8080)
- [ ] Networking port matches PORT variable

---

## Next Steps (TODO)

1. **Upload frontend to HostPapa subdomain**
   - Create subdomain in HostPapa cPanel
   - Upload contents of `web/dist` folder via FTP or File Manager
   - Test the live site

2. **Set up email service (optional)**
   - Create Gmail App Password
   - Add `EMAIL_USER` and `EMAIL_PASS` to Railway variables

3. **Add custom domain (optional)**
   - In Railway Settings → Networking → Custom Domain
   - Add DNS records to your domain provider

---

## Useful Commands

### Build frontend for production
```bash
cd web && npm run build
```

### Test API locally
```bash
cd api && npm run dev
```

### Check Railway deployment logs
- Go to Railway dashboard → Your service → Deployments → View logs

### Import database to Railway
```bash
/opt/homebrew/opt/mysql-client/bin/mysql -h HOST -u USER -pPASSWORD --port PORT --protocol=TCP DATABASE < file.sql
```

---

## Project Structure

```
project/
├── api/                    # Backend (Express)
│   ├── server.js          # Entry point
│   ├── db.js              # Database connection
│   ├── package.json       # Must have "start" script
│   └── routers/           # API routes
├── web/                    # Frontend (React)
│   ├── src/
│   │   └── api.js         # API URL configuration
│   ├── .env.production    # Production environment
│   └── dist/              # Built files (upload this)
└── docs/                   # Documentation
```

---

## Quick Reference

| What | Where |
|------|-------|
| Railway Dashboard | https://railway.app/dashboard |
| Your API URL | https://bread-kitchen-production.up.railway.app |
| GitHub Repo | https://github.com/jordan-media/bread-kitchen |
| MySQL Public Host | turntable.proxy.rlwy.net |
| MySQL Public Port | 18587 |

---

*Created: December 2024*
*Last Updated: December 2024*
