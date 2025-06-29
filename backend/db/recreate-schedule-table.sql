-- Backup and recreate schedule table with correct structure
USE gym_db;

-- Backup existing data (if any)
CREATE TABLE schedule_backup AS SELECT * FROM schedule;

-- Drop the existing table
DROP TABLE IF EXISTS schedule;

-- Create the correct schedule table
CREATE TABLE schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  trainer VARCHAR(100),
  time TIME NOT NULL
);

-- Verify the new table structure
DESCRIBE schedule; 