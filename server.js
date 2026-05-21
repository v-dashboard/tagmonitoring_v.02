const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Ambil config dari Environment Variables Railway
const dbConfig = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT) || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { rejectUnauthorized: true }
};

console.log('Connecting to TiDB with host:', dbConfig.host);

let pool = null;

async function getDb() {
    if (!pool) {
        pool = await mysql.createPool(dbConfig);
        // Test koneksi
        const [rows] = await pool.query('SELECT 1 as connected');
        console.log('✅ TiDB Connected!');
    }
    return pool;
}

// API endpoints
app.get('/api/tags', async (req, res) => {
    try {
        const db = await getDb();
        const [rows] = await db.query('SELECT * FROM tags ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tags', async (req, res) => {
    try {
        const db = await getDb();
        const tag = req.body;
        await db.query(
            `INSERT INTO tags 
            (id, date, initial, tag_type, location, machine, abnormality, impact, risk, action, status, wr_number, progress_note, foto_before, foto_after, closed_by, closed_at, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tag.id, tag.date, tag.initial, tag.tag_type, tag.location,
                tag.machine, tag.abnormality, tag.impact, tag.risk,
                tag.action, tag.status, tag.wr_number || '',
                tag.progress_note || '', tag.foto_before || null,
                tag.foto_after || null, tag.closed_by || null,
                tag.closed_at || null, tag.created_at, tag.updated_at
            ]
        );
        res.json({ success: true, id: tag.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tags/:id', async (req, res) => {
    try {
        const db = await getDb();
        const tag = req.body;
        await db.query(
            `UPDATE tags SET 
            status=?, wr_number=?, progress_note=?, foto_after=?,
            closed_by=?, closed_at=?, updated_at=?
            WHERE id=?`,
            [
                tag.status, tag.wr_number, tag.progress_note,
                tag.foto_after, tag.closed_by, tag.closed_at,
                tag.updated_at, req.params.id
            ]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tags/:id', async (req, res) => {
    try {
        const db = await getDb();
        await db.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server jalan di port ${PORT}`);
});
