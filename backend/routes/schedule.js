const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all bookings, grouped as { "Mon-6:00 AM": [...] }
router.get("/", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM schedule");
    const bookings = {};
    results.forEach(row => {
      // Convert date to day name and time to readable format
      const date = new Date(row.date);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const day = days[date.getDay()];
      const time = row.time.slice(0, 5); // "14:00:00" to "14:00"
      const time12hr = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const key = `${day}-${time12hr}`;
      if (!bookings[key]) bookings[key] = [];
      bookings[key].push({
        id: row.id,
        member: row.member_name,
        category: row.category,
        trainer: row.trainer || "",
      });
    });
    res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST a new booking
router.post("/", async (req, res) => {
  const { day, time, member, category, trainer } = req.body;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = days.indexOf(day);
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
  const time24hr = new Date(`2000-01-01 ${time}`).toTimeString().slice(0, 8);
  const sql = "INSERT INTO schedule (date, member_name, category, trainer, time) VALUES (?, ?, ?, ?, ?)";
  const values = [targetDate.toISOString().slice(0, 10), member, category, trainer, time24hr];
  try {
    const [result] = await db.query(sql, values);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT update a booking
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { day, time, member, category, trainer } = req.body;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = days.indexOf(day);
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + (dayIndex - today.getDay() + 7) % 7);
  const time24hr = new Date(`2000-01-01 ${time}`).toTimeString().slice(0, 8);
  const sql = "UPDATE schedule SET date = ?, member_name = ?, category = ?, trainer = ?, time = ? WHERE id = ?";
  const values = [targetDate.toISOString().slice(0, 10), member, category, trainer, time24hr, id];
  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE individual booking
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM schedule WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE all bookings (reset schedule)
router.delete("/", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM schedule");
    res.json({ success: true, deleted: result.affectedRows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
