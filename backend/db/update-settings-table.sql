-- Use gym_db database
USE gym_db;

-- Create settings table if it doesn't exist with proper structure for key-value pairs
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default low stock threshold if it doesn't exist
INSERT IGNORE INTO settings (`key`, value) VALUES ('low_stock_threshold', '5'); 