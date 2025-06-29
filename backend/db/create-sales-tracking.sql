-- Use gym_db database
USE gym_db;

-- Drop existing sales_tracking table if it exists
DROP TABLE IF EXISTS sales_tracking;

-- Create sales tracking table for inventory analytics
CREATE TABLE sales_tracking (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    profit DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) DEFAULT 'Cash'
);

-- Add index for better performance
CREATE INDEX idx_sales_tracking_product_name ON sales_tracking(product_name);
CREATE INDEX idx_sales_tracking_date ON sales_tracking(sale_date); 