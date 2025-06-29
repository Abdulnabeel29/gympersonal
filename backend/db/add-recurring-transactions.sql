-- Add recurring transactions and staff salary support
USE gym_db;

-- Add salary field to staff table
ALTER TABLE staff ADD COLUMN salary DECIMAL(10,2) DEFAULT 0.00;

-- Create recurring transactions table
CREATE TABLE recurring_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  payment VARCHAR(50) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_processed DATE NULL,
  next_due_date DATE NOT NULL,
  staff_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

-- Create staff salary transactions table for tracking
CREATE TABLE staff_salary_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  finance_id INT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (finance_id) REFERENCES finances(id) ON DELETE SET NULL
);

-- Add indexes for better performance
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active, next_due_date);
CREATE INDEX idx_staff_salary_date ON staff_salary_transactions(payment_date);
CREATE INDEX idx_staff_salary_staff ON staff_salary_transactions(staff_id); 