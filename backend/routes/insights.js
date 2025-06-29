const express = require('express');
const router = express.Router();
const db = require('../db');

// Endpoint to get key stats
router.get('/key-stats', async (req, res) => {
  try {
    const [membersResult] = await db.execute("SELECT COUNT(*) as totalMembers FROM members");
    const [revenueResult] = await db.execute("SELECT SUM(amount) as monthlyRevenue FROM finances WHERE type = 'income' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
    const [expenseResult] = await db.execute("SELECT SUM(amount) as monthlyExpense FROM finances WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");

    const totalMembers = membersResult && membersResult.length > 0 ? parseInt(membersResult[0].totalMembers) : 0;
    const monthlyRevenue = revenueResult && revenueResult.length > 0 ? parseFloat(revenueResult[0].monthlyRevenue) || 0 : 0;
    const monthlyExpense = expenseResult && expenseResult.length > 0 ? parseFloat(expenseResult[0].monthlyExpense) || 0 : 0;

    res.json({
      totalMembers: totalMembers,
      monthlyRevenue: monthlyRevenue,
      monthlyExpense: monthlyExpense,
    });
  } catch (error) {
    console.error('Error fetching key stats:', error);
    res.status(500).json({ error: 'Failed to fetch key stats', details: error.message });
  }
});

// Endpoint for income vs expense history
router.get('/income-expense-history', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
      FROM finances
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income/expense history', details: error.message });
  }
});

// Endpoint for member distribution
router.get('/member-distribution', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        SUM(CASE WHEN expiry_date >= CURDATE() THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired
      FROM members;
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member distribution', details: error.message });
  }
});

// Endpoint for expense breakdown
router.get('/expense-breakdown', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        category,
        SUM(amount) as total
      FROM finances
      WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
      GROUP BY category
      ORDER BY total DESC
      LIMIT 10;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense breakdown', details: error.message });
  }
});

// GET note
router.get('/notes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT note FROM settings LIMIT 1');
    res.json({ note: rows[0]?.note || '' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note', details: error.message });
  }
});

// POST note
router.post('/notes', async (req, res) => {
  const { note } = req.body;
  try {
    const [result] = await db.query('UPDATE settings SET note=? LIMIT 1', [note]);
    if (result.affectedRows === 0) {
      // No settings row exists, create one.
      await db.query('INSERT INTO settings (note) VALUES (?)', [note]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save note', details: error.message });
  }
});

// POST financial metrics
router.post('/financial-metrics', async (req, res) => {
  try {
    // Get revenue for last 30 days
    const [revenueRes] = await db.query("SELECT SUM(amount) as revenue FROM finances WHERE type = 'income' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
    const revenue = revenueRes[0].revenue || 0;

    // Get total expense for last 30 days
    const [expenseRes] = await db.query("SELECT SUM(amount) as totalExpense FROM finances WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
    const totalExpense = expenseRes[0].totalExpense || 0;

    // Auto-calculate COGS, depreciation, interest, tax from finances table
    const [metricsRes] = await db.query(`
      SELECT
        SUM(CASE WHEN category = 'COGS' THEN amount ELSE 0 END) as cogs,
        SUM(CASE WHEN category = 'Depreciation' THEN amount ELSE 0 END) as depreciation,
        SUM(CASE WHEN category = 'Interest' THEN amount ELSE 0 END) as interest,
        SUM(CASE WHEN category = 'Tax' THEN amount ELSE 0 END) as tax
      FROM finances
      WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    const { cogs, depreciation, interest, tax } = metricsRes[0];

    // Calculations
    const grossProfit = revenue - cogs;
    const ebitda = revenue - (totalExpense - depreciation - interest - tax);
    const netProfit = revenue - totalExpense;

    res.json({
      revenue,
      expense: totalExpense,
      cogs,
      grossProfit,
      ebitda,
      netProfit,
      depreciation,
      interest,
      tax
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate financial metrics', details: error.message });
  }
});

// Endpoint for today's schedule
router.get('/todays-schedule', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT category as class_name, time as start_time, trainer as instructor, member_name
      FROM schedule
      WHERE date = CURDATE()
      ORDER BY time ASC;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch today's schedule", details: error.message });
  }
});

// Endpoint for recent members
router.get('/recent-members', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT name, join_date
      FROM members
      ORDER BY join_date DESC
      LIMIT 5;
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent members:', error);
    res.status(500).json({ error: 'Failed to fetch recent members', details: error.message });
  }
});

// Endpoint for dashboard alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = [];
    
    // Check for members expiring in next 3 days
    const [expiringMembers] = await db.query(`
      SELECT COUNT(*) as count FROM members 
      WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    `);
    if (expiringMembers[0].count > 0) {
      alerts.push({
        type: 'warning',
        message: `${expiringMembers[0].count} member(s) expiring in next 3 days`,
        icon: 'FaUserClock'
      });
    }
    
    // Check for expired members
    const [expiredMembers] = await db.query(`
      SELECT COUNT(*) as count FROM members 
      WHERE expiry_date < CURDATE()
    `);
    if (expiredMembers[0].count > 0) {
      alerts.push({
        type: 'error',
        message: `${expiredMembers[0].count} member(s) have expired memberships`,
        icon: 'FaExclamationTriangle'
      });
    }
    
    // Check for low inventory (items with stock < 5)
    const [lowInventory] = await db.query(`
      SELECT COUNT(*) as count FROM inventory 
      WHERE stock < 5
    `);
    if (lowInventory[0].count > 0) {
      alerts.push({
        type: 'warning',
        message: `${lowInventory[0].count} inventory item(s) running low`,
        icon: 'FaBoxOpen'
      });
    }
    
    // Check for pending payments
    const [pendingPayments] = await db.query(`
      SELECT COUNT(*) as count FROM members 
      WHERE pending_amount > 0
    `);
    if (pendingPayments[0].count > 0) {
      alerts.push({
        type: 'info',
        message: `${pendingPayments[0].count} member(s) have pending payments`,
        icon: 'FaMoneyBillWave'
      });
    }
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts', details: error.message });
  }
});

// Endpoint for profit & loss summary
router.get('/profit-loss', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
      FROM finances
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY month ASC;
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch P&L data', details: error.message });
  }
});

module.exports = router; 