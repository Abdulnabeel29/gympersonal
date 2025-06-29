const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all enquiries
router.get("/", async (req, res) => {
  try {
    const [enquiries] = await db.query("SELECT * FROM enquiries ORDER BY enquiry_date DESC");
    res.json(enquiries);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ message: "Failed to fetch enquiries." });
  }
});

// POST a new enquiry
router.post("/", async (req, res) => {
  const { name, phone, email, source, interest, status, follow_up_date, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone number are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO enquiries (name, phone, email, source, interest, status, follow_up_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, phone, email, source, interest, status || 'New', follow_up_date, notes]
    );
    res.status(201).json({ id: result.insertId, message: "Enquiry added successfully." });
  } catch (err) {
    console.error("Error adding enquiry:", err);
    res.status(500).json({ message: "Failed to add enquiry." });
  }
});

// PUT (update) an existing enquiry
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, source, interest, status, follow_up_date, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone number are required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE enquiries SET name = ?, phone = ?, email = ?, source = ?, interest = ?, status = ?, follow_up_date = ?, notes = ?, updated_at = NOW() WHERE id = ?",
      [name, phone, email, source, interest, status, follow_up_date, notes, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enquiry not found." });
    }
    res.json({ message: "Enquiry updated successfully." });
  } catch (err) {
    console.error("Error updating enquiry:", err);
    res.status(500).json({ message: "Failed to update enquiry." });
  }
});

// DELETE an enquiry
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM enquiries WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Enquiry not found." });
    }
    res.json({ message: "Enquiry deleted successfully." });
  } catch (err) {
    console.error("Error deleting enquiry:", err);
    res.status(500).json({ message: "Failed to delete enquiry." });
  }
});

module.exports = router; 