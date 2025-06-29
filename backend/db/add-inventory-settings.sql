-- Use gym_db database
USE gym_db;

-- Option 1: Add low_stock_threshold column to inventory table
ALTER TABLE inventory ADD COLUMN low_stock_threshold INT DEFAULT 5;

-- Option 2: Create a simple inventory_settings table (alternative approach)
-- CREATE TABLE IF NOT EXISTS inventory_settings (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     setting_name VARCHAR(100) UNIQUE NOT NULL,
--     setting_value TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- INSERT IGNORE INTO inventory_settings (setting_name, setting_value) VALUES ('low_stock_threshold', '5'); 