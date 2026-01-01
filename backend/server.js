const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'pds_requests.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create Table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_key TEXT UNIQUE NOT NULL,
        operator_name TEXT,
        character_name TEXT,
        series_source TEXT,
        sourcing_vibe TEXT,
        contact_method TEXT,
        contact_handle TEXT,
        notes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Requests table ready.');
        }
    });
});

// API Routes

// Health Check
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

// Submit Request
app.post('/api/request', (req, res) => {
    const {
        access_key,
        operator_name,
        character_name,
        series_source,
        sourcing_vibe,
        contact_method,
        contact_handle,
        notes
    } = req.body;

    if (!access_key) {
        return res.status(400).json({ error: 'Access Key is required' });
    }

    const sql = `INSERT INTO requests (
        access_key, operator_name, character_name, series_source, 
        sourcing_vibe, contact_method, contact_handle, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        access_key,
        operator_name,
        character_name,
        series_source,
        JSON.stringify(sourcing_vibe), // Store array as JSON string
        contact_method,
        contact_handle,
        notes
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error inserting request:', err.message);
            // Check for duplicate key
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Access Key collision. Please try again.' });
            }
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`New request added with ID: ${this.lastID}`);
        res.status(201).json({
            message: 'Request submitted successfully',
            id: this.lastID,
            access_key: access_key
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful Custom Shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
