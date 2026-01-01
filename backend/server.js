const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-prod'; // TODO: Move to env var

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

// Auth Database Setup
const authDbPath = path.resolve(__dirname, 'pds_auth.db');
const authDb = new sqlite3.Database(authDbPath, (err) => {
    if (err) {
        return console.error('Error opening auth database:', err.message);
    }
    console.log('Connected to the Auth SQLite database.');
});

// Create Tables & Seed Data
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
        status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Ensure status column exists (migration for existing dbs)
    db.run("ALTER TABLE requests ADD COLUMN status TEXT DEFAULT 'pending'", (err) => {
        // Ignore duplicate column error
    });
});

authDb.serialize(() => {
    // Users Table Update: Add role
    authDb.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        referral_code TEXT,
        role TEXT DEFAULT 'user', -- 'user' or 'admin'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) console.log('Users table ready.');
    });

    // Try adding role column if not exists (migration)
    authDb.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
        // Ignore duplicate column error
    });

    // Referral Codes Table
    authDb.run(`CREATE TABLE IF NOT EXISTS referral_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        created_by TEXT, -- admin username
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            console.log('Referral Codes table ready.');
            // Seed default codes
            const seedCodes = [
                ['PDS2026', 'Legacy Default Code'],
                ['ADMIN', 'System Admin Code'],
                ['VIP', 'VIP Access Code']
            ];
            seedCodes.forEach(([code, desc]) => {
                authDb.run(`INSERT OR IGNORE INTO referral_codes (code, description, created_by) VALUES (?, ?, 'system')`, [code, desc]);
            });
        }
    });

    // Ensure Admin User Exists
    const adminUsername = 'admin';
    const adminPassword = 'adminpassword123'; // Change this!
    const adminRole = 'admin';

    bcrypt.hash(adminPassword, 10, (err, hash) => {
        if (!err) {
            authDb.run(`INSERT OR IGNORE INTO users (username, password_hash, referral_code, role) 
                VALUES (?, ?, 'ADMIN', ?)`,
                [adminUsername, hash, adminRole]
            );
        }
    });
});

// --- Middleware ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
};

// --- API Routes ---

// Health Check
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

// Submit Request (Public)
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
        JSON.stringify(sourcing_vibe),
        contact_method,
        contact_handle,
        notes
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error inserting request:', err.message);
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

// --- Auth Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { username, password, referral_code } = req.body;

    if (!username || !password || !referral_code) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check Referral Code in DB
    const codeSql = `SELECT * FROM referral_codes WHERE code = ?`;
    authDb.get(codeSql, [referral_code], async (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error checking referral' });

        if (!row) {
            return res.status(403).json({ error: 'Invalid Referral Code' });
        }

        try {
            const password_hash = await bcrypt.hash(password, 10);
            // Default role is 'user'
            const sql = `INSERT INTO users (username, password_hash, referral_code, role) VALUES (?, ?, ?, 'user')`;
            authDb.run(sql, [username, password_hash, referral_code], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: 'Database error during signup' });
                }
                res.status(201).json({ message: 'User created successfully', userId: this.lastID });
            });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    authDb.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            // Generate JWT
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role || 'user' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role || 'user'
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// --- ADMIN ROUTES (Protected) ---

// Stats Dashboard
app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
    const stats = {};

    const reqPromise = new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM requests", (err, row) => {
            if (err) reject(err); else resolve(row.count);
        });
    });

    const userPromise = new Promise((resolve, reject) => {
        authDb.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (err) reject(err); else resolve(row.count);
        });
    });

    const referralPromise = new Promise((resolve, reject) => {
        authDb.get("SELECT COUNT(*) as count FROM referral_codes", (err, row) => {
            if (err) reject(err); else resolve(row.count);
        });
    });

    Promise.all([reqPromise, userPromise, referralPromise])
        .then(([reqCount, userCount, refCount]) => {
            res.json({
                requests: reqCount,
                users: userCount,
                referral_codes: refCount
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        });
});

// Requests Management
app.get('/api/admin/requests', authenticateToken, isAdmin, (req, res) => {
    db.all("SELECT * FROM requests ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/admin/requests/:id/status', authenticateToken, isAdmin, (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.run("UPDATE requests SET status = ? WHERE id = ?", [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated', changes: this.changes });
    });
});

// Users Management
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    authDb.all("SELECT id, username, referral_code, role, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Referral Codes Management
app.get('/api/admin/referrals', authenticateToken, isAdmin, (req, res) => {
    // Get all codes
    authDb.all("SELECT * FROM referral_codes", [], async (err, codes) => {
        if (err) return res.status(500).json({ error: err.message });

        // Calculate usage for each code
        const usagePromises = codes.map(code => {
            return new Promise((resolve) => {
                authDb.get("SELECT COUNT(*) as count FROM users WHERE referral_code = ?", [code.code], (err, row) => {
                    resolve({ ...code, usage_count: row ? row.count : 0 });
                });
            });
        });

        const result = await Promise.all(usagePromises);
        res.json(result);
    });
});

app.post('/api/admin/referrals', authenticateToken, isAdmin, (req, res) => {
    const { code, description } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    authDb.run("INSERT INTO referral_codes (code, description, created_by) VALUES (?, ?, ?)",
        [code, description, req.user.username],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Code already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, code, description });
        }
    );
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful Custom Shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Error closing request db:', err.message);
        else console.log('Request DB closed.');
    });
    authDb.close((err) => {
        if (err) console.error('Error closing auth db:', err.message);
        else console.log('Auth DB closed.');
    });
    process.exit(0);
});
