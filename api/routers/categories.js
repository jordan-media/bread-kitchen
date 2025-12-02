// routers/categories.js
const express = require('express');
const categoryRouter = express.Router();
const db = require('../db');

// GET all categories
categoryRouter.get('/', (req, res) => {
    const sql = 'SELECT * FROM categories ORDER BY category_id ASC';

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// GET single category by ID
categoryRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM categories WHERE category_id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Category not found" });
        res.json(results[0]);
    });
});

// GET category by slug
categoryRouter.get('/slug/:slug', (req, res) => {
    const { slug } = req.params;
    const sql = 'SELECT * FROM categories WHERE slug = ?';

    db.query(sql, [slug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Category not found" });
        res.json(results[0]);
    });
});

// POST new category
categoryRouter.post('/', (req, res) => {
    const { name_ja, name_en, slug } = req.body;

    // Validation
    if (!name_ja || !name_en || !slug) {
        return res.status(400).json({ error: "Required fields: name_ja, name_en, slug" });
    }

    const sql = 'INSERT INTO categories (name_ja, name_en, slug) VALUES (?, ?, ?)';

    db.query(sql, [name_ja, name_en, slug], (err, results) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Category slug already exists" });
            }
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: 'Category added successfully',
            id: results.insertId
        });
    });
});

// UPDATE category
categoryRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name_ja, name_en, slug } = req.body;

    // Validation
    if (!name_ja || !name_en || !slug) {
        return res.status(400).json({ error: "Required fields: name_ja, name_en, slug" });
    }

    const sql = 'UPDATE categories SET name_ja = ?, name_en = ?, slug = ? WHERE category_id = ?';

    db.query(sql, [name_ja, name_en, slug, id], (err, results) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "Category slug already exists" });
            }
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category updated successfully" });
    });
});

// DELETE category
categoryRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categories WHERE category_id = ?';

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    error: "Cannot delete category with existing products"
                });
            }
            return res.status(500).json({ error: err.message });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    });
});

module.exports = categoryRouter;
