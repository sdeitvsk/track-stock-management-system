-- =====================================================
-- Inventory Management System - Sample Data
-- =====================================================

USE inventory_management;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample login users
INSERT INTO login_users (username, password_hash, role) VALUES
('admin', '$2a$12$q3HTPaxlPwO3IxTwgAwD5Oxl9K8wyW39dHddboxudED96lDP9f5K2', 'admin'), -- password: admin123
('VHF', '$2a$12$q3HTPaxlPwO3IxTwgAwD5Oxl9K8wyW39dHddboxudED96lDP9f5K2', 'staff'), -- password: staff123
('NAV AIDS', '$2a$12$q3HTPaxlPwO3IxTwgAwD5Oxl9K8wyW39dHddboxudED96lDP9f5K2', 'staff'); -- password: staff123

-- Insert sample members
INSERT INTO members (name, type, category, department, contact_info) VALUES
-- Suppliers
('ABC Electronics Ltd', 'supplier', 'Electronics', 'Procurement', 'contact@abcelectronics.com'),
('Tech Solutions Inc', 'supplier', 'IT Equipment', 'Procurement', 'sales@techsolutions.com'),
('Office Supplies Co', 'supplier', 'Stationery', 'Procurement', 'orders@officesupplies.com'),
('Industrial Parts Ltd', 'supplier', 'Hardware', 'Procurement', 'info@industrialparts.com'),

-- Employees
('Jessy', 'employee', 'Manager', 'IT Department', 'john.smith@company.com'),
('Suresj', 'employee', 'Developer', 'IT Department', 'sarah.johnson@company.com'),
('Mohan', 'employee', 'Analyst', 'Finance Department', 'mike.wilson@company.com'),
-- ('Lisa Brown', 'employee', 'Coordinator', 'HR Department', 'lisa.brown@company.com'),
-- ('David Lee', 'employee', 'Technician', 'Maintenance', 'david.lee@company.com'),

-- Stations
('VHF', 'station', 'Service', 'IT Department', 'helpdesk@company.com'),
('NAV AIDS', 'station', 'Service', 'Administration', 'reception@company.com'),
('Surveillance', 'station', 'Meeting', 'Administration', 'booking@company.com'),
('Automation', 'station', 'Production', 'Manufacturing', 'workshop@company.com');

-- Insert sample transactions and purchases
INSERT INTO transactions (type, member_id, description) VALUES
(1, 'purchase', 1, 'Monthly laptop procurement'),
(2, 'purchase', 2, 'Network equipment purchase'),
(3, 'purchase', 3, 'Office supplies bulk order'),


INSERT INTO purchase (transaction_id, item_name, quantity, rate, remaining_quantity) VALUES
(1, 'Ball Pens', 10, 10.00, 10),
(1, 'AAA Battery', 10, 15.00, 10),
(2, '1 QR Register', 5, 450.00, 5),
(2, 'Ethernet Cable Cat6', 50, 12.00, 50),
(3, 'A4 Paper Ream', 100, 8.50, 100),
(3, 'Ballpoint Pen Blue', 200, 1.25, 200),
(3, 'Stapler Heavy Duty', 20, 15.00, 20),


-- Insert sample issue transactions
INSERT INTO transactions (type, member_id, description) VALUES
(6, 'issue', 5, 'Laptop assignment for new developer'),
(7, 'issue', 6, 'Network setup for new office'),
(8, 'issue', 10, 'VHF equipment'),
(9, 'issue', 7, 'Office supplies for finance team'),
(10, 'issue', 9, 'Maintenance tools');

-- Insert sample issues (following FIFO logic)
INSERT INTO issue (transaction_id, member_id, purchase_id, item_name, quantity) VALUES
(6, 5, 1, 'Ball Pens', 2),
(6, 5, 2, 'AAA Battery', 2),
(7, 6, 3, '1 QR Register', 1),
(7, 6, 4, 'Ethernet Cable Cat6', 10),
(8, 10, 4, 'Ethernet Cable Cat6', 5),
(9, 7, 5, 'A4 Paper Ream', 10),
(9, 7, 6, 'Ballpoint Pen Blue', 50),
(10, 9, 7, 'Screwdriver Set', 3),
(10, 9, 1, 'Cable Ties Pack', 5);

-- Update purchase remaining quantities after issues
UPDATE purchase SET remaining_quantity = 8 WHERE id = 1; -- Laptop Dell XPS 13
UPDATE purchase SET remaining_quantity = 8 WHERE id = 2; -- Laptop Charger
UPDATE purchase SET remaining_quantity = 4 WHERE id = 3; -- Network Switch 24-port
UPDATE purchase SET remaining_quantity = 35 WHERE id = 4; -- Ethernet Cable Cat6
UPDATE purchase SET remaining_quantity = 90 WHERE id = 5; -- A4 Paper Ream
UPDATE purchase SET remaining_quantity = 150 WHERE id = 6; -- Ballpoint Pen Blue
UPDATE purchase SET remaining_quantity = 12 WHERE id = 9; -- Screwdriver Set
UPDATE purchase SET remaining_quantity = 25 WHERE id = 10; -- Cable Ties Pack