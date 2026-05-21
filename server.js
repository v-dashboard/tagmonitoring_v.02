// server.js - API Gateway untuk TiDB Cloud
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

// Konfigurasi TiDB Cloud (GANTI DENGAN PUNYA KAMU!)
const dbConfig = {
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com', // Host TiDB kamu
    port: 4000,
    user: 'root', // User kamu
    password: 'PASSWORD_ANDA', // GANTI!
    database: 'test'
};

// ============ ENDPOINT GET /api/tags ============
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

// ============ ENDPOINT POST /api/tags ============
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

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
