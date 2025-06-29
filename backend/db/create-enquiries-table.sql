-- Use the correct database
USE gym_db;

-- Create the enquiries table for CRM
CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    enquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(100), -- e.g., 'Walk-in', 'Phone Call', 'Website'
    interest VARCHAR(100), -- e.g., 'Membership', 'Personal Training', 'Zumba'
    status VARCHAR(50) DEFAULT 'New', -- e.g., 'New', 'Follow-up', 'Converted', 'Lost'
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for faster queries
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_follow_up_date ON enquiries(follow_up_date); 