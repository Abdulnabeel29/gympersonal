const express = require("express");
const router = express.Router();
const db = require("../db"); // Must be mysql2/promise-based pool

// ✅ GET all finances
router.get("/", async (req, res) => {
  try {
    const { limit, page } = req.query;

    if (limit && page) {
      // Handle paginated requests
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const limitNum = parseInt(limit, 10);

      const [[{ 'COUNT(*)': totalItems }]] = await db.execute("SELECT COUNT(*) FROM finances");
      const [rows] = await db.execute(
        "SELECT * FROM finances ORDER BY date DESC LIMIT ? OFFSET ?",
        [String(limitNum), String(offset)]
      );
      
      res.json({ finances: rows, totalItems });
    } else {
      // Handle non-paginated requests for backward compatibility
      const [rows] = await db.execute("SELECT * FROM finances ORDER BY date DESC");
      res.json(rows);
    }
  } catch (error) {
    console.error("❌ Error fetching finances:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch finances." });
  }
});

// ✅ ADD new finance entry
router.post("/", async (req, res) => {
  let { date, type, amount, category, payment, description } = req.body;
  // Add one day to the date to compensate for timezone issues
  if (date) {
    let d = new Date(date);
    d.setDate(d.getDate() + 1);
    date = d.toISOString().slice(0, 10);
  }

  if (!date || !type || !amount || !category || !payment) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO finances (date, type, amount, category, payment, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, type, amount, category, payment, description || null]
    );

    const [inserted] = await db.execute("SELECT * FROM finances WHERE id = ?", [result.insertId]);
    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error("❌ Error adding finance entry:", error.message);
    res.status(500).json({ error: "Failed to add finance entry." });
  }
});

// ✅ UPDATE finance
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  let { date, type, amount, category, payment, description } = req.body;
  // Add one day to the date to compensate for timezone issues
  if (date) {
    let d = new Date(date);
    d.setDate(d.getDate() + 1);
    date = d.toISOString().slice(0, 10);
  }

  try {
    await db.execute(
      `UPDATE finances SET date=?, type=?, amount=?, category=?, payment=?, description=? WHERE id=?`,
      [date, type, amount, category, payment, description || null, id]
    );

    res.json({ message: "Finance entry updated successfully." });
  } catch (error) {
    console.error("❌ Error updating entry:", error.message);
    res.status(500).json({ error: "Failed to update entry." });
  }
});

// ✅ DELETE finance
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute("DELETE FROM finances WHERE id = ?", [id]);
    res.json({ message: "Finance entry deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting entry:", error.message);
    res.status(500).json({ error: "Failed to delete entry." });
  }
});

module.exports = router;
