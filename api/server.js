// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routers
const categoriesRouter = require('./routers/categories');
const productsRouter = require('./routers/products');
const newsletterRouter = require('./routers/newsletter');
const adminRouter = require('./routers/admin');
const contactRouter = require('./routers/contact');

const app = express();
const port = 3001;

// ----------------------------
// CORS Configuration
// ----------------------------
// For development - allow all origins
app.use(cors());

// ----------------------------
// Middleware
// ----------------------------
app.use(express.json());                     // Parse JSON request bodies
app.use('/images', express.static(path.join(__dirname, 'public'))); // Serve static images from /public
app.use('/products/images', express.static(path.join(__dirname, '../web/public/assets'))); // Product images from assets folder

// ----------------------------
// Routes
// ----------------------------
app.use('/categories', categoriesRouter);
app.use('/products', productsRouter);
app.use('/newsletter', newsletterRouter);
app.use('/admin', adminRouter);
app.use('/contact', contactRouter);

// ----------------------------
// Start Server
// ----------------------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});