// routers/products.js
const express = require('express');
const productsRouter = express.Router();
const upload = require('../storage');
const db = require('../db');

// GET all products with category info
productsRouter.get("/", (req, res) => {
    console.log("📦 GET /products called");

    const sql = `
        SELECT
            p.*,
            c.name_en AS category_name_en,
            c.name_ja AS category_name_ja,
            c.slug AS category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        ORDER BY p.product_id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Products query error:", err);
            return res.status(500).json({ error: err.message, code: err.code });
        }
        console.log(`✅ Found ${results.length} products`);
        res.json(results);
    });
});

// GET available products only (for customer view)
productsRouter.get("/available", (req, res) => {
    const sql = `
        SELECT
            p.*,
            c.name_en AS category_name_en,
            c.name_ja AS category_name_ja,
            c.slug AS category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.is_available = TRUE
        ORDER BY c.category_id, p.name_en ASC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET single product by ID
productsRouter.get("/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            p.*,
            c.name_en AS category_name_en,
            c.name_ja AS category_name_ja,
            c.slug AS category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Product not found" });
        res.json(results[0]);
    });
});

// GET products by category
productsRouter.get("/category/:categoryId", (req, res) => {
    const { categoryId } = req.params;

    const sql = `
        SELECT
            p.*,
            c.name_en AS category_name_en,
            c.name_ja AS category_name_ja
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.category_id = ?
        ORDER BY p.name_en ASC
    `;

    db.query(sql, [categoryId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET products filtered by allergens
productsRouter.get("/filter/allergens", (req, res) => {
    const { dairy, eggs, nuts } = req.query;

    let sql = `
        SELECT
            p.*,
            c.name_en AS category_name_en,
            c.name_ja AS category_name_ja
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.is_available = TRUE
    `;

    // Filter OUT products containing these allergens
    if (dairy === 'false' || dairy === '0') {
        sql += " AND p.contains_dairy = FALSE";
    }
    if (eggs === 'false' || eggs === '0') {
        sql += " AND p.contains_eggs = FALSE";
    }
    if (nuts === 'false' || nuts === '0') {
        sql += " AND p.contains_nuts = FALSE";
    }

    sql += " ORDER BY c.category_id, p.name_en ASC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST new product
productsRouter.post("/", upload.single("image"), (req, res) => {
    const {
        category_id,
        name_ja,
        name_en,
        description_ja,
        description_en,
        price,
        contains_dairy,
        contains_eggs,
        contains_nuts,
        contains_wheat,
        is_available
    } = req.body;

    // Validation
    if (!name_ja || !name_en || !category_id || !price) {
        return res.status(400).json({ error: "Required fields: name_ja, name_en, category_id, price" });
    }

    const sql = `
        INSERT INTO products (
            category_id, name_ja, name_en, description_ja, description_en,
            price, image, contains_dairy, contains_eggs, contains_nuts,
            contains_wheat, is_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        category_id,
        name_ja,
        name_en,
        description_ja || null,
        description_en || null,
        price,
        req.file ? req.file.filename : null,
        contains_dairy === 'true' || contains_dairy === true ? 1 : 0,
        contains_eggs === 'true' || contains_eggs === true ? 1 : 0,
        contains_nuts === 'true' || contains_nuts === true ? 1 : 0,
        contains_wheat === 'true' || contains_wheat === true ? 1 : 1,
        is_available === 'false' || is_available === false ? 0 : 1
    ];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Product added successfully",
            id: results.insertId
        });
    });
});

// UPDATE product
productsRouter.put("/:id", upload.single("image"), (req, res) => {
    const { id } = req.params;
    const {
        category_id,
        name_ja,
        name_en,
        description_ja,
        description_en,
        price,
        contains_dairy,
        contains_eggs,
        contains_nuts,
        contains_wheat,
        is_available
    } = req.body;

    // Build update query dynamically
    let sql = `
        UPDATE products SET
            category_id = ?,
            name_ja = ?,
            name_en = ?,
            description_ja = ?,
            description_en = ?,
            price = ?,
            contains_dairy = ?,
            contains_eggs = ?,
            contains_nuts = ?,
            contains_wheat = ?,
            is_available = ?
    `;

    const params = [
        category_id,
        name_ja,
        name_en,
        description_ja || null,
        description_en || null,
        price,
        contains_dairy === 'true' || contains_dairy === true ? 1 : 0,
        contains_eggs === 'true' || contains_eggs === true ? 1 : 0,
        contains_nuts === 'true' || contains_nuts === true ? 1 : 0,
        contains_wheat === 'true' || contains_wheat === true ? 1 : 0,
        is_available === 'true' || is_available === true ? 1 : 0
    ];

    // If new image uploaded, update it
    if (req.file) {
        sql += ", image = ?";
        params.push(req.file.filename);
    }

    sql += " WHERE product_id = ?";
    params.push(id);

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    });
});

// PATCH product availability (quick toggle)
productsRouter.patch("/:id/availability", (req, res) => {
    const { id } = req.params;
    const { is_available } = req.body;

    const sql = "UPDATE products SET is_available = ? WHERE product_id = ?";

    db.query(sql, [is_available ? 1 : 0, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Availability updated successfully" });
    });
});

// DELETE product
productsRouter.delete("/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE product_id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    });
});

module.exports = productsRouter;
