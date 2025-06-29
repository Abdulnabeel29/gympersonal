const express = require("express");
const router = express.Router();
const db = require("../db"); // assumes db is set up with mysql2/promise

// GET all staff
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM staff");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff", details: err.message });
  }
});

// GET single staff by ID (optional)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM staff WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Staff not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff", details: err.message });
  }
});

// POST add new staff
router.post("/", async (req, res) => {
  const { name, role, phone, email, address, photo, status, salary } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO staff (name, role, phone, email, address, photo, status, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, role, phone, email, address, photo, status, salary || 0]
    );
    const [newStaff] = await db.query("SELECT * FROM staff WHERE id = ?", [result.insertId]);
    const { id: newStaffId } = newStaff[0];

    // If salary is provided, create a recurring transaction
    if (salary && Number(salary) > 0) {
      const today = new Date();
      // Helper to format date to YYYY-MM-DD
      const toSQLDate = (date) => date.toISOString().slice(0, 10);
      const nextDueDate = new Date(new Date().setMonth(today.getMonth() + 1));

      const recurringTransaction = {
        name: `Salary for ${name}`,
        type: 'expense',
        amount: salary,
        category: 'Staff Salary',
        payment: 'Bank Transfer',
        description: `Monthly salary for ${name} (Staff ID: ${newStaffId})`,
        frequency: 'monthly',
        start_date: toSQLDate(today),
        next_due_date: toSQLDate(nextDueDate),
        staff_id: newStaffId,
        is_active: true,
      };

      const columns = Object.keys(recurringTransaction);
      const values = Object.values(recurringTransaction);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO recurring_transactions (${columns.join(', ')}) VALUES (${placeholders})`;
      await db.query(sql, values);

      // Immediately register the first salary payment in finances
      const financeTransaction = {
        date: toSQLDate(today),
        type: 'expense',
        amount: salary,
        category: 'Staff Salary',
        payment: 'Bank Transfer',
        description: `Salary for ${name} (Staff ID: ${newStaffId}) [Auto-generated from recurring transaction]`
      };
      const fCols = Object.keys(financeTransaction);
      const fVals = Object.values(financeTransaction);
      const fPlaceholders = fCols.map(() => '?').join(', ');
      const fSql = `INSERT INTO finances (${fCols.join(', ')}) VALUES (${fPlaceholders})`;
      await db.query(fSql, fVals);
    }

    res.status(201).json(newStaff[0]);
  } catch (err) {
    console.error("Error in POST /staff:", err);
    res.status(500).json({ error: "Failed to add staff", details: err.message });
  }
});

// PUT update existing staff
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, email, address, photo, status, salary } = req.body;
  try {
    await db.query(
      "UPDATE staff SET name = ?, role = ?, phone = ?, email = ?, address = ?, photo = ?, status = ?, salary = ?, updated_at = NOW() WHERE id = ?",
      [name, role, phone, email, address, photo, status, salary || 0, id]
    );

    // If salary was updated, also update the corresponding recurring transaction
    if (salary !== undefined) {
      await db.query(
        "UPDATE recurring_transactions SET amount = ? WHERE staff_id = ? AND category = 'Staff Salary'",
        [salary || 0, id]
      );
    }

    const [updatedStaff] = await db.query("SELECT * FROM staff WHERE id = ?", [id]);
    res.json(updatedStaff[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff", details: err.message });
  }
});

// DELETE staff
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM staff WHERE id = ?", [id]);
    res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete staff", details: err.message });
  }
});

module.exports = router;
