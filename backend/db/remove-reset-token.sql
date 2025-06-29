USE gym_db;

ALTER TABLE inventory
ADD COLUMN cost_price DECIMAL(10, 2),
ADD COLUMN selling_price DECIMAL(10, 2),
ADD COLUMN dealer_contact VARCHAR(255);