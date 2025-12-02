# Bread Kitchen

A full-stack bakery website for The City Bakery featuring artisan breads, baking courses, and newsletter signup.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express.js API
- **Database:** MySQL

## Features

- Course booking with inquiry form
- Newsletter subscription
- Contact form with reCAPTCHA v3
- Responsive masonry image gallery

## Getting Started

### Prerequisites
- Node.js
- MySQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd web && npm install
   cd ../api && npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Start the development servers:
   ```bash
   # API
   cd api && npm run dev

   # Web
   cd web && npm run dev
   ```
