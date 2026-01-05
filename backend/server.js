require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { z } = require('zod');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-this';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpassword123';

// --- Middleware ---
app.use(helmet()); // Security Headers
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logging

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// --- Validation Schemas ---
const signupSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8),
    referral_code: z.string().min(1)
});

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
});

const requestSchema = z.object({
    access_key: z.string().min(1),
    operator_name: z.string().optional(),
    character_name: z.string().optional(),
    series_source: z.string().optional(),
    sourcing_vibe: z.any().optional(), // Can be string or array/object depending on frontend
    contact_method: z.string().optional(),
    contact_handle: z.string().optional(),
    notes: z.string().optional()
});

const referralSchema = z.object({
    code: z.string().min(3).regex(/^[A-Za-z0-9_-]+$/),
    description: z.string().optional(),
    usage_limit: z.number().int().positive().optional(),
    expiration_date: z.string().datetime().nullable().optional() // Expect ISO string
});

const statusUpdateSchema = z.object({
    status: z.enum(['pending', 'reviewing', 'approved', 'production', 'shipping', 'completed', 'on_hold', 'rejected']),
    reason: z.string().optional()
});

// --- Database Setup ---
const dbPath = path.resolve(__dirname, 'pds_requests.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error('Error opening database:', err.message);
    console.log('Connected to the SQLite database.');
});

const authDbPath = path.resolve(__dirname, 'pds_auth.db');
const authDb = new sqlite3.Database(authDbPath, (err) => {
    if (err) return console.error('Error opening auth database:', err.message);
    console.log('Connected to the Auth SQLite database.');
});

// --- Migrations & Seeding ---
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
        status TEXT DEFAULT 'pending',
        rejection_reason TEXT,
        updated_at DATETIME,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run("ALTER TABLE requests ADD COLUMN status TEXT DEFAULT 'pending'", (err) => { /* Ignore duplicate column error */ });
    db.run("ALTER TABLE requests ADD COLUMN rejection_reason TEXT", (err) => { /* Ignore duplicate column error */ });
    db.run("ALTER TABLE requests ADD COLUMN updated_at DATETIME", (err) => { /* Ignore duplicate column error */ });
    db.run("ALTER TABLE requests ADD COLUMN user_id INTEGER", (err) => { /* Ignore duplicate column error */ });
});

authDb.serialize(() => {
    authDb.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        referral_code TEXT,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    authDb.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => { /* Ignore duplicate column error */ });

    authDb.run(`CREATE TABLE IF NOT EXISTS referral_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        usage_limit INTEGER,
        expiration_date DATETIME,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            const seedCodes = [
                ['PDS2026', 'Legacy Default Code', null, null],
                ['ADMIN', 'System Admin Code', null, null],
                ['VIP', 'VIP Access Code', 100, '2027-01-01']
            ];
            seedCodes.forEach(([code, desc, limit, exp]) => {
                authDb.run(`INSERT OR IGNORE INTO referral_codes (code, description, usage_limit, expiration_date, created_by) VALUES (?, ?, ?, ?, 'system')`, [code, desc, limit, exp]);
            });
        }
    });

    authDb.run("ALTER TABLE referral_codes ADD COLUMN usage_limit INTEGER", () => { });
    authDb.run("ALTER TABLE referral_codes ADD COLUMN expiration_date DATETIME", () => { });

    // Ensure Admin User
    const adminUsername = 'admin';
    const adminRole = 'admin';

    bcrypt.hash(ADMIN_PASSWORD, 10, (err, hash) => {
        if (!err) {
            authDb.run(`INSERT OR IGNORE INTO users (username, password_hash, referral_code, role) 
                VALUES (?, ?, 'ADMIN', ?)`,
                [adminUsername, hash, adminRole]
            );
        }
    });
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
};

// --- API Routes ---

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

app.get('/api/tracking/:access_key', (req, res) => {
    const { access_key } = req.params;
    const sql = `SELECT id, character_name, series_source, status, timestamp, updated_at, rejection_reason, operator_name FROM requests WHERE access_key = ?`;
    db.get(sql, [access_key], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Invalid Access Key' });
        res.json(row);
    });
});

app.post('/api/request', authenticateToken, validate(requestSchema), (req, res) => {
    // Sanitized body available via req.body (express.json is safe, but zod validates type)
    const {
        access_key, operator_name, character_name, series_source,
        sourcing_vibe, contact_method, contact_handle, notes
    } = req.body;

    const sql = `INSERT INTO requests (
        access_key, operator_name, character_name, series_source, 
        sourcing_vibe, contact_method, contact_handle, notes,
        updated_at, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`;

    const params = [
        access_key, operator_name, character_name, series_source,
        JSON.stringify(sourcing_vibe), contact_method, contact_handle, notes,
        req.user.id
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error inserting request:', err.message);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Access Key collision. Please try again.' });
            }
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({
            message: 'Request submitted successfully',
            id: this.lastID,
            access_key: access_key
        });
    });
});

app.get('/api/user/requests', authenticateToken, (req, res) => {
    const sql = `SELECT * FROM requests WHERE user_id = ? ORDER BY timestamp DESC`;
    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// --- Auth Routes ---

app.post('/api/auth/signup', validate(signupSchema), (req, res) => {
    const { username, password, referral_code } = req.body;

    const codeSql = `SELECT * FROM referral_codes WHERE code = ?`;
    authDb.get(codeSql, [referral_code], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error checking referral' });
        if (!row) return res.status(403).json({ error: 'Invalid Referral Code' });

        if (row.expiration_date && new Date() > new Date(row.expiration_date)) {
            return res.status(403).json({ error: 'Referral Code has expired' });
        }

        if (row.usage_limit) {
            authDb.get(`SELECT COUNT(*) as count FROM users WHERE referral_code = ?`, [referral_code], (err, usageRow) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                if (usageRow.count >= row.usage_limit) return res.status(403).json({ error: 'Referral Code usage limit reached' });
                createAccount();
            });
        } else {
            createAccount();
        }
    });

    async function createAccount() {
        try {
            const password_hash = await bcrypt.hash(password, 10);
            const sql = `INSERT INTO users (username, password_hash, referral_code, role) VALUES (?, ?, ?, 'user')`;
            authDb.run(sql, [username, password_hash, referral_code], function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'Username already exists' });
                    return res.status(500).json({ error: 'Database error' });
                }
                res.status(201).json({ message: 'User created successfully', userId: this.lastID });
            });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }
});

app.post('/api/auth/login', validate(loginSchema), (req, res) => {
    const { username, password } = req.body;
    authDb.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role || 'user' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, role: user.role || 'user' }
            });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// --- ADMIN ROUTES ---

app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
    Promise.all([
        new Promise((resolve, reject) => db.get("SELECT COUNT(*) as count FROM requests", (e, r) => e ? reject(e) : resolve(r.count))),
        new Promise((resolve, reject) => authDb.get("SELECT COUNT(*) as count FROM users", (e, r) => e ? reject(e) : resolve(r.count))),
        new Promise((resolve, reject) => authDb.get("SELECT COUNT(*) as count FROM referral_codes", (e, r) => e ? reject(e) : resolve(r.count)))
    ]).then(([requests, users, referral_codes]) => res.json({ requests, users, referral_codes }))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch stats' });
        });
});

app.get('/api/admin/requests', authenticateToken, isAdmin, (req, res) => {
    db.all("SELECT * FROM requests ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.put('/api/admin/requests/:id/status', authenticateToken, isAdmin, validate(statusUpdateSchema), (req, res) => {
    const { status, reason } = req.body;
    const { id } = req.params;

    // Only update rejection_reason if strictly provided (even empty string), otherwise leave as is ?? 
    // Actually, user might want to CLEAR it if not rejected. 
    // Simpler logic: Update reason if provided.

    let sql = "UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP";
    let params = [status];

    if (reason !== undefined) {
        sql += ", rejection_reason = ?";
        params.push(reason);
    }

    // Create new list so we don't mess up params order
    // Actually wait, simple append works.

    sql += " WHERE id = ?";
    params.push(id);

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Status updated', changes: this.changes });
    });
});

app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    authDb.all("SELECT id, username, referral_code, role, created_at FROM users ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/referrals', authenticateToken, isAdmin, (req, res) => {
    authDb.all("SELECT * FROM referral_codes ORDER BY created_at DESC", [], async (err, codes) => {
        if (err) return res.status(500).json({ error: err.message });
        const usagePromises = codes.map(code => new Promise(resolve => {
            authDb.get("SELECT COUNT(*) as count FROM users WHERE referral_code = ?", [code.code], (err, row) => {
                resolve({ ...code, usage_count: row ? row.count : 0 });
            });
        }));
        res.json(await Promise.all(usagePromises));
    });
});

app.post('/api/admin/referrals', authenticateToken, isAdmin, validate(referralSchema), (req, res) => {
    const { code, description, usage_limit, expiration_date } = req.body;
    authDb.run("INSERT INTO referral_codes (code, description, usage_limit, expiration_date, created_by) VALUES (?, ?, ?, ?, ?)",
        [code, description, usage_limit || null, expiration_date || null, req.user.username],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) return res.status(409).json({ error: 'Code already exists' });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, code, description, usage_limit, expiration_date });
        }
    );
});

app.delete('/api/admin/referrals/:id', authenticateToken, isAdmin, (req, res) => {
    authDb.run("DELETE FROM referral_codes WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Referral code deleted', changes: this.changes });
    });
});

app.get('/api/admin/referrals/:id/users', authenticateToken, isAdmin, (req, res) => {
    authDb.get("SELECT code FROM referral_codes WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!row) return res.status(404).json({ error: "Code not found" });
        authDb.all("SELECT id, username, created_at FROM users WHERE referral_code = ? ORDER BY created_at DESC", [row.code], (err, users) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(users);
        });
    });
});

// --- Global Error Handlers ---

app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// --- Server Startup ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Graceful Custom Shutdown
process.on('SIGINT', () => {
    db.close((err) => console.log(err ? 'Error closing request db' : 'Request DB closed'));
    authDb.close((err) => console.log(err ? 'Error closing auth db' : 'Auth DB closed'));
    process.exit(0);
});

module.exports = app; // For testing
