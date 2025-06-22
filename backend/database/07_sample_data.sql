-- =====================================================
-- Inventory Management System - Sample Data
-- =====================================================

USE inventory_management;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample login users
INSERT INTO login_users (username, password_hash, role) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'admin'), -- password: admin123
('staff1', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'staff'), -- password: staff123
('staff2', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'staff'); -- password: staff123

-- Insert sample members
INSERT INTO members (name, type, category, department, contact_info) VALUES
-- Suppliers
('ABC Electronics Ltd', 'supplier', 'Electronics', 'Procurement', 'contact@abcelectronics.com'),
('Tech Solutions Inc', 'supplier', 'IT Equipment', 'Procurement', 'sales@techsolutions.com'),
('Office Supplies Co', 'supplier', 'Stationery', 'Procurement', 'orders@officesupplies.com'),
('Industrial Parts Ltd', 'supplier', 'Hardware', 'Procurement', 'info@industrialparts.com'),

-- Employees
('John Smith', 'employee', 'Manager', 'IT Department', 'john.smith@company.com'),
('Sarah Johnson', 'employee', 'Developer', 'IT Department', 'sarah.johnson@company.com'),
('Mike Wilson', 'employee', 'Analyst', 'Finance Department', 'mike.wilson@company.com'),
('Lisa Brown', 'employee', 'Coordinator', 'HR Department', 'lisa.brown@company.com'),
('David Lee', 'employee', 'Technician', 'Maintenance', 'david.lee@company.com'),

-- Stations
('IT Help Desk', 'station', 'Service', 'IT Department', 'helpdesk@company.com'),
('Reception Desk', 'station', 'Service', 'Administration', 'reception@company.com'),
('Conference Room A', 'station', 'Meeting', 'Administration', 'booking@company.com'),
('Workshop Station', 'station', 'Production', 'Manufacturing', 'workshop@company.com');

-- Insert sample transactions and purchases
INSERT INTO transactions (type, member_id, description) VALUES
('purchase', 1, 'Monthly laptop procurement'),
('purchase', 2, 'Network equipment purchase'),
('purchase', 3, 'Office supplies bulk order'),
('purchase', 1, 'Additional laptop order'),
('purchase', 4, 'Hardware components');

INSERT INTO purchase (transaction_id, item_name, quantity, rate, remaining_quantity) VALUES
(1, 'Laptop Dell XPS 13', 10, 1200.00, 10),
(1, 'Laptop Charger', 10, 65.00, 10),
(2, 'Network Switch 24-port', 5, 450.00, 5),
(2, 'Ethernet Cable Cat6', 50, 12.00, 50),
(3, 'A4 Paper Ream', 100, 8.50, 100),
(3, 'Ballpoint Pen Blue', 200, 1.25, 200),
(3, 'Stapler Heavy Duty', 20, 15.00, 20),
(4, 'Laptop Dell XPS 13', 5, 1250.00, 5),
(5, 'Screwdriver Set', 15, 25.00, 15),
(5, 'Cable Ties Pack', 30, 5.00, 30);

-- Insert sample issue transactions
INSERT INTO transactions (type, member_id, description) VALUES
('issue', 5, 'Laptop assignment for new developer'),
('issue', 6, 'Network setup for new office'),
('issue', 10, 'IT Help Desk equipment'),
('issue', 7, 'Office supplies for finance team'),
('issue', 9, 'Maintenance tools');

-- Insert sample issues (following FIFO logic)
INSERT INTO issue (transaction_id, member_id, purchase_id, item_name, quantity) VALUES
(6, 5, 1, 'Laptop Dell XPS 13', 2),
(6, 5, 2, 'Laptop Charger', 2),
(7, 6, 3, 'Network Switch 24-port', 1),
(7, 6, 4, 'Ethernet Cable Cat6', 10),
(8, 10, 4, 'Ethernet Cable Cat6', 5),
(9, 7, 5, 'A4 Paper Ream', 10),
(9, 7, 6, 'Ballpoint Pen Blue', 50),
(10, 9, 9, 'Screwdriver Set', 3),
(10, 9, 10, 'Cable Ties Pack', 5);

-- Update purchase remaining quantities after issues
UPDATE purchase SET remaining_quantity = 8 WHERE id = 1; -- Laptop Dell XPS 13
UPDATE purchase SET remaining_quantity = 8 WHERE id = 2; -- Laptop Charger
UPDATE purchase SET remaining_quantity = 4 WHERE id = 3; -- Network Switch 24-port
UPDATE purchase SET remaining_quantity = 35 WHERE id = 4; -- Ethernet Cable Cat6
UPDATE purchase SET remaining_quantity = 90 WHERE id = 5; -- A4 Paper Ream
UPDATE purchase SET remaining_quantity = 150 WHERE id = 6; -- Ballpoint Pen Blue
UPDATE purchase SET remaining_quantity = 12 WHERE id = 9; -- Screwdriver Set
UPDATE purchase SET remaining_quantity = 25 WHERE id = 10; -- Cable Ties Pack