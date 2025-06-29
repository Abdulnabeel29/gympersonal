CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(15),
  join_date DATE,
  expiry_date DATE,
  package VARCHAR(100),
  total_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  pending_amount DECIMAL(10,2),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  biceps DECIMAL(5,2),
  thighs DECIMAL(5,2),
  address VARCHAR(255),
  health_issues VARCHAR(255),
  blood_group VARCHAR(10),
  extra_details TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(15),
  email VARCHAR(100),
  address TEXT,
  photo VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Active',
  salary DECIMAL(10,2) DEFAULT 0.00,
  bonus DECIMAL(10,2) DEFAULT 0.00,
  salary_status VARCHAR(20) DEFAULT 'Pending'
);


CREATE TABLE IF NOT EXISTS finances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(10) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  payment VARCHAR(50) NOT NULL,
  description TEXT
);


CREATE TABLE IF NOT EXISTS schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  trainer VARCHAR(100),
  time TIME NOT NULL
);


CREATE TABLE IF NOT EXISTS recurring_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  payment VARCHAR(50) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  last_processed DATE,
  next_due_date DATE NOT NULL,
  staff_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS staff_salary_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  finance_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
  FOREIGN KEY (finance_id) REFERENCES finances(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  stock INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  dealer_contact VARCHAR(255),
  low_stock_threshold INT DEFAULT 5
);

CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gym_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(15),
  opening_hours TEXT,
  theme VARCHAR(50) DEFAULT 'default',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL,
  expense_limit DECIMAL(10,2) DEFAULT 100000.00,
  dashboard_layout TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  passkey_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(100),
  interest VARCHAR(100),
  status VARCHAR(50) DEFAULT 'New',
  follow_up_date DATE,
  notes TEXT,
  enquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT NULL,
  updated_at DATETIME DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS sales_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS owner_notes (
  id INT PRIMARY KEY DEFAULT 1,
  note TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS otp_verification (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS admin_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  passkey VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL
);