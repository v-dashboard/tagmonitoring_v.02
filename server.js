const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Ambil konfigurasi dari Environment Variables
const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// ============ GET /api/tags ============
app.get('/api/tags', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM tags ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.end();
    }
});

// ============ POST /api/tags ============
app.post('/api/tags', async (req, res) => {
    const tag = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            `INSERT INTO tags (id, date, initial, tag_type, location, machine, 
                               abnormality, impact, risk, action, status, 
                               created_at, updated_at) 
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [tag.date, tag.initial, tag.tag_type, tag.location, tag.machine,
             tag.abnormality, tag.impact, tag.risk, tag.action || '', tag.status]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.end();
    }
});

// Health check untuk Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
