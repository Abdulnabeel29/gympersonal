const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all recurring transactions
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT rt.*, s.name as staff_name 
      FROM recurring_transactions rt 
      LEFT JOIN staff s ON rt.staff_id = s.id 
      ORDER BY rt.next_due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    res.status(500).json({ error: "Failed to fetch recurring transactions." });
  }
});

// POST new recurring transaction
router.post("/", async (req, res) => {
  const {
    name,
    type,
    amount,
    category,
    payment,
    description,
    frequency,
    start_date,
    end_date,
    staff_id
  } = req.body;

  if (!name || !type || !amount || !category || !payment || !frequency || !start_date) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(start_date, frequency);
    
    // Handle empty end_date by converting to NULL
    const processedEndDate = end_date && end_date.trim() !== '' ? end_date : null;
    const processedStaffId = staff_id && staff_id !== '' ? staff_id : null;
    
    const [result] = await db.execute(`
      INSERT INTO recurring_transactions 
      (name, type, amount, category, payment, description, frequency, start_date, end_date, next_due_date, staff_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, type, amount, category, payment, description, frequency, start_date, processedEndDate, nextDueDate, processedStaffId]);

    const [inserted] = await db.execute(`
      SELECT rt.*, s.name as staff_name 
      FROM recurring_transactions rt 
      LEFT JOIN staff s ON rt.staff_id = s.id 
      WHERE rt.id = ?
    `, [result.insertId]);

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("Error adding recurring transaction:", error);
    res.status(500).json({ error: "Failed to add recurring transaction." });
  }
});

// PUT update recurring transaction
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    amount,
    category,
    payment,
    description,
    frequency,
    start_date,
    end_date,
    is_active,
    staff_id
  } = req.body;

  try {
    // Format dates properly to avoid timestamp issues
    const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : null;
    const formattedEndDate = end_date && end_date.trim() !== '' ? new Date(end_date).toISOString().split('T')[0] : null;
    
    const nextDueDate = calculateNextDueDate(formattedStartDate, frequency);
    
    // Handle empty end_date and staff_id by converting to NULL
    const processedStaffId = staff_id && staff_id !== '' ? staff_id : null;
    
    await db.execute(`
      UPDATE recurring_transactions 
      SET name=?, type=?, amount=?, category=?, payment=?, description=?, 
          frequency=?, start_date=?, end_date=?, is_active=?, next_due_date=?, staff_id=?, updated_at=NOW()
      WHERE id=?
    `, [name, type, amount, category, payment, description, frequency, formattedStartDate, formattedEndDate, is_active, nextDueDate, processedStaffId, id]);

    res.json({ message: "Recurring transaction updated successfully." });
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    res.status(500).json({ error: "Failed to update recurring transaction." });
  }
});

// DELETE recurring transaction
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute("DELETE FROM recurring_transactions WHERE id = ?", [id]);
    res.json({ message: "Recurring transaction deleted successfully." });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    res.status(500).json({ error: "Failed to delete recurring transaction." });
  }
});

// POST process due transactions (run this daily via cron job or manually)
router.post("/process-due", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all due transactions - fix date comparison to handle timestamp format
    const [dueTransactions] = await db.execute(`
      SELECT * FROM recurring_transactions 
      WHERE is_active = TRUE 
      AND DATE(next_due_date) <= ? 
      AND (end_date IS NULL OR DATE(end_date) >= ?)
    `, [today, today]);

    const processed = [];

    for (const transaction of dueTransactions) {
      // Create description that identifies this as a recurring transaction
      const recurringDescription = `Auto-generated from recurring transaction: ${transaction.name}`;
      
      // Add to finances table
      const [financeResult] = await db.execute(`
        INSERT INTO finances (date, type, amount, category, payment, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [today, transaction.type, transaction.amount, transaction.category, transaction.payment, recurringDescription]);

      // If it's a staff salary, add to staff_salary_transactions
      if (transaction.staff_id) {
        await db.execute(`
          INSERT INTO staff_salary_transactions (staff_id, amount, payment_date, payment_method, finance_id, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [transaction.staff_id, transaction.amount, today, transaction.payment, financeResult.insertId, recurringDescription]);
        
        // Update staff salary status to 'Paid'
        await db.execute(
          "UPDATE staff SET salary_status = 'Paid' WHERE id = ?",
          [transaction.staff_id]
        );
      }

      // Update next due date
      const nextDueDate = calculateNextDueDate(today, transaction.frequency);
      await db.execute(`
        UPDATE recurring_transactions 
        SET last_processed = ?, next_due_date = ?
        WHERE id = ?
      `, [today, nextDueDate, transaction.id]);

      processed.push({
        id: transaction.id,
        name: transaction.name,
        amount: transaction.amount,
        finance_id: financeResult.insertId
      });
    }

    res.json({ 
      message: `Processed ${processed.length} transactions.`,
      processed 
    });
  } catch (error) {
    console.error("Error processing due transactions:", error);
    res.status(500).json({ error: "Failed to process due transactions." });
  }
});

// GET staff salary transactions
router.get("/staff-salaries", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT sst.*, s.name as staff_name, s.role
      FROM staff_salary_transactions sst
      JOIN staff s ON sst.staff_id = s.id
      ORDER BY sst.payment_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching staff salaries:", error);
    res.status(500).json({ error: "Failed to fetch staff salaries." });
  }
});

// POST process individual recurring transaction by ID
router.post("/process/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const today = new Date().toISOString().split('T')[0];
    // Get the transaction by ID - fix date comparison to handle timestamp format
    const [rows] = await db.execute(
      `SELECT * FROM recurring_transactions WHERE id = ? AND is_active = TRUE AND (end_date IS NULL OR DATE(end_date) >= ?)`,
      [id, today]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Recurring transaction not found or not due." });
    }
    const transaction = rows[0];
    if (new Date(transaction.next_due_date).toISOString().split('T')[0] > today) {
      return res.status(400).json({ error: "Transaction is not due yet." });
    }
    // Create description that identifies this as a recurring transaction
    const recurringDescription = `Auto-generated from recurring transaction: ${transaction.name}`;
    // Add to finances table
    const [financeResult] = await db.execute(
      `INSERT INTO finances (date, type, amount, category, payment, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [today, transaction.type, transaction.amount, transaction.category, transaction.payment, recurringDescription]
    );
    // If it's a staff salary, add to staff_salary_transactions
    if (transaction.staff_id) {
      await db.execute(
        `INSERT INTO staff_salary_transactions (staff_id, amount, payment_date, payment_method, finance_id, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [transaction.staff_id, transaction.amount, today, transaction.payment, financeResult.insertId, recurringDescription]
      );
    }
    // Update next due date
    const nextDueDate = calculateNextDueDate(today, transaction.frequency);
    await db.execute(
      `UPDATE recurring_transactions SET last_processed = ?, next_due_date = ? WHERE id = ?`,
      [today, nextDueDate, id]
    );
    res.json({ message: `Processed transaction: ${transaction.name}`, finance_id: financeResult.insertId });
  } catch (error) {
    console.error("Error processing individual transaction:", error);
    res.status(500).json({ error: "Failed to process transaction." });
  }
});

// Helper function to calculate next due date
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}

module.exports = router; 