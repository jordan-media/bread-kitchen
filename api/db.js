// db.js - MySQL Database Connection Pool
const mysql = require("mysql2");

// Use a pool instead of single connection (more reliable)
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "bread",
    port: process.env.DB_PORT || 8889,
    waitForConnections: true,
    connectionLimit: 10
});

// Test the connection on startup
db.query("SELECT 1", (err) => {
    if (err) {
        console.log("❌ DATABASE CONNECTION ERROR:", err.code, err.message);
        console.log("   Check that MAMP is running and MySQL is on port 8889");
        return;
    }

    console.log("✅ Database connected successfully");

    // Verify tables exist
    db.query("SHOW TABLES", (err, results) => {
        if (err) {
            console.log("❌ Error checking tables:", err.message);
            return;
        }

        const tables = results.map(row => Object.values(row)[0]);
        console.log("📋 Tables found:", tables.join(", ") || "(none)");

        const required = ['categories', 'products'];
        const missing = required.filter(t => !tables.includes(t));

        if (missing.length > 0) {
            console.log("⚠️  Missing tables:", missing.join(", "));
            console.log("   Import bread.sql into phpMyAdmin to create them");
        } else {
            console.log("✅ All required tables found");
        }
    });
});

// Export both callback and promise versions
module.exports = db;
module.exports.promise = db.promise();
