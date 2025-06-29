-- This file is for reference and contains the queries used in the insights API.

-- Query for Key Stats
-- 1. Total Members
SELECT COUNT(*) as totalMembers FROM members;

-- 2. Monthly Revenue (last 30 days)
SELECT SUM(amount) as monthlyRevenue FROM finances WHERE type = 'income' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- 3. Monthly Expense (last 30 days)
SELECT SUM(amount) as monthlyExpense FROM finances WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

-- Query for Income vs. Expense History (last 6 months)
SELECT
  DATE_FORMAT(date, '%Y-%m') as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as totalExpense
FROM finances
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY month
ORDER BY month ASC;

-- Query for Member Distribution
SELECT
  SUM(CASE WHEN expiry_date >= CURDATE() THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) as expired
FROM members;
-- Note: 'inactive' status is not explicitly tracked in the members table schema, so we derive it based on expiry_date.

-- Query for Expense Breakdown (last 90 days)
SELECT
  category,
  SUM(amount) as total
FROM finances
WHERE type = 'expense' AND date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
GROUP BY category
ORDER BY total DESC
LIMIT 10;

-- Table for Owner Notepad/Leads
CREATE TABLE IF NOT EXISTS owner_notes (
  id INT PRIMARY KEY DEFAULT 1,
  note TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 