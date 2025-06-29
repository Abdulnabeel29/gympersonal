const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

// GET all settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM settings LIMIT 1');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE settings
router.post('/', async (req, res) => {
  const { gym_name, contact_email, contact_phone, opening_hours, notifications_enabled } = req.body;
  try {
    const [existing] = await db.query('SELECT COUNT(*) as count FROM settings');
    if (existing[0].count > 0) {
      await db.query(
        'UPDATE settings SET gym_name=?, contact_email=?, contact_phone=?, opening_hours=?, notifications_enabled=?, updated_at=NOW()',
        [gym_name, contact_email, contact_phone, opening_hours, notifications_enabled]
      );
    } else {
      await db.query(
        'INSERT INTO settings (gym_name, contact_email, contact_phone, opening_hours, notifications_enabled) VALUES (?, ?, ?, ?, ?)',
        [gym_name, contact_email, contact_phone, opening_hours, notifications_enabled]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK IF ADMIN EXISTS
router.get('/admin/exists', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM admin');
    res.json({ exists: rows[0].count > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE ADMIN
router.post('/admin/create', async (req, res) => {
  const { username, passkey } = req.body;
  if (!username || !passkey) {
    return res.status(400).json({ error: 'Username and pass key are required.' });
  }
  try {
    // Check if admin already exists
    const [existing] = await db.query('SELECT COUNT(*) as count FROM admin');
    if (existing[0].count > 0) {
      return res.status(400).json({ error: 'Admin already exists.' });
    }
    
    // Hash the passkey
    const hashedPasskey = await bcrypt.hash(passkey, 10);
    
    // Create admin
    await db.query('INSERT INTO admin (username, passkey_hash) VALUES (?, ?)', [username, hashedPasskey]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET ADMIN (Delete existing admin)
router.delete('/admin/reset', async (req, res) => {
  try {
    await db.query('DELETE FROM admin');
    res.json({ success: true, message: 'Admin has been reset. You can now create a new admin.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE ADMIN PASSKEY
router.post('/admin/change-passkey', async (req, res) => {
  const { username, old_passkey, new_passkey } = req.body;
  if (!username || !old_passkey || !new_passkey) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username=?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    const admin = rows[0];
    const match = await bcrypt.compare(old_passkey, admin.passkey_hash);
    if (!match) {
      return res.status(401).json({ error: 'Old pass key is incorrect.' });
    }
    const newHash = await bcrypt.hash(new_passkey, 10);
    await db.query('UPDATE admin SET passkey_hash=?, updated_at=NOW() WHERE id=?', [newHash, admin.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RESET ADMIN PASSKEY (Simple reset without token)
router.post('/admin/reset-passkey', async (req, res) => {
  const { username, new_passkey } = req.body;
  if (!username || !new_passkey) {
    return res.status(400).json({ error: 'Username and new passkey are required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username=?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Admin not found.' });
    }
    const admin = rows[0];
    const newHash = await bcrypt.hash(new_passkey, 10);
    await db.query('UPDATE admin SET passkey_hash=?, updated_at=NOW() WHERE id=?', [newHash, admin.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY ADMIN PASSKEY
router.post('/admin/verify-passkey', async (req, res) => {
  const { username, passkey } = req.body;
  if (!username || !passkey) {
    return res.status(400).json({ success: false, error: 'Username and passkey required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username=?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found.' });
    }
    const admin = rows[0];
    const match = await bcrypt.compare(passkey, admin.passkey_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Invalid passkey.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get low stock threshold
router.get("/low-stock-threshold", async (req, res) => {
    try {
        // For now, return a hardcoded default value
        // Later you can add this to the inventory table or create a separate settings table
        res.json({ threshold: 5 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching low stock threshold." });
    }
});

// Update low stock threshold
router.put("/low-stock-threshold", async (req, res) => {
    const { threshold } = req.body;
    
    if (!threshold || threshold < 1) {
        return res.status(400).json({ message: "Threshold must be at least 1." });
    }

    try {
        // For now, just return success
        // Later you can implement actual storage in database
        res.json({ message: "Low stock threshold updated successfully.", threshold });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating low stock threshold." });
    }
});

// GET expense limit
router.get('/expense-limit', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT expense_limit FROM settings LIMIT 1');
    res.json({ limit: rows[0]?.expense_limit || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE expense limit
router.post('/expense-limit', async (req, res) => {
  const { limit } = req.body;
  if (limit === undefined || limit < 0) {
    return res.status(400).json({ error: 'Invalid expense limit amount.' });
  }
  try {
    const [result] = await db.query('UPDATE settings SET expense_limit=?, updated_at=NOW() LIMIT 1', [limit]);
    if (result.affectedRows === 0) {
      await db.query('INSERT INTO settings (expense_limit) VALUES (?)', [limit]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET dashboard layout
router.get('/dashboard-layout', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT dashboard_layout FROM settings LIMIT 1');
    res.json(rows[0]?.dashboard_layout || { lg: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST dashboard layout
router.post('/dashboard-layout', async (req, res) => {
  const { layout } = req.body;
  try {
    const layoutString = JSON.stringify(layout);
    await db.query('UPDATE settings SET dashboard_layout=?, updated_at=NOW() LIMIT 1', [layoutString]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 