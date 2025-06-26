-- =====================================================
-- Inventory Management System - Triggers
-- =====================================================

USE inventory_management;

-- =====================================================
-- AUDIT TRIGGERS
-- =====================================================

-- Create audit table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    record_id INT NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    changed_by VARCHAR(50) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_table_operation (table_name, operation),
    INDEX idx_record_id (record_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PURCHASE TRIGGERS
-- =====================================================

DELIMITER $$

-- Trigger to validate purchase data before insert
CREATE TRIGGER tr_purchase_before_insert
BEFORE INSERT ON purchase
FOR EACH ROW
BEGIN
    -- Ensure remaining_quantity equals quantity for new purchases
    IF NEW.remaining_quantity IS NULL OR NEW.remaining_quantity != NEW.quantity THEN
        SET NEW.remaining_quantity = NEW.quantity;
    END IF;
    
    -- Validate that remaining_quantity doesn't exceed quantity
    IF NEW.remaining_quantity > NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Remaining quantity cannot exceed total quantity';
    END IF;
END$$

-- Trigger to log purchase changes
CREATE TRIGGER tr_purchase_after_insert
AFTER INSERT ON purchase
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, record_id, new_values)
    VALUES ('purchase', 'INSERT', NEW.id, JSON_OBJECT(
        'item_name', NEW.item_name,
        'quantity', NEW.quantity,
        'rate', NEW.rate,
        'remaining_quantity', NEW.remaining_quantity,
        'purchase_date', NEW.purchase_date
    ));
END$$

-- Trigger to log purchase updates
CREATE TRIGGER tr_purchase_after_update
AFTER UPDATE ON purchase
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values)
    VALUES ('purchase', 'UPDATE', NEW.id, 
        JSON_OBJECT(
            'item_name', OLD.item_name,
            'quantity', OLD.quantity,
            'rate', OLD.rate,
            'remaining_quantity', OLD.remaining_quantity
        ),
        JSON_OBJECT(
            'item_name', NEW.item_name,
            'quantity', NEW.quantity,
            'rate', NEW.rate,
            'remaining_quantity', NEW.remaining_quantity
        )
    );
END$$

-- =====================================================
-- ISSUE TRIGGERS
-- =====================================================

-- Trigger to validate issue data before insert
CREATE TRIGGER tr_issue_before_insert
BEFORE INSERT ON issue
FOR EACH ROW
BEGIN
    DECLARE available_qty INT DEFAULT 0;
    
    -- Check if enough stock is available in the referenced purchase
    SELECT remaining_quantity INTO available_qty
    FROM purchase 
    WHERE id = NEW.purchase_id;
    
    -- Validate stock availability
    IF available_qty < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock in referenced purchase batch';
    END IF;
END$$

-- Trigger to update purchase remaining quantity after issue
CREATE TRIGGER tr_issue_after_insert
AFTER INSERT ON issue
FOR EACH ROW
BEGIN
    -- Update the purchase remaining quantity
    UPDATE purchase 
    SET remaining_quantity = remaining_quantity - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.purchase_id;
    
    -- Log the issue
    INSERT INTO audit_log (table_name, operation, record_id, new_values)
    VALUES ('issue', 'INSERT', NEW.id, JSON_OBJECT(
        'item_name', NEW.item_name,
        'quantity', NEW.quantity,
        'member_id', NEW.member_id,
        'purchase_id', NEW.purchase_id,
        'issue_date', NEW.issue_date
    ));
END$$

-- =====================================================
-- MEMBER TRIGGERS
-- =====================================================

-- Trigger to log member changes
CREATE TRIGGER tr_member_after_insert
AFTER INSERT ON members
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, record_id, new_values)
    VALUES ('members', 'INSERT', NEW.id, JSON_OBJECT(
        'name', NEW.name,
        'type', NEW.type,
        'category', NEW.category,
        'department', NEW.department,
        'contact_info', NEW.contact_info
    ));
END$$

CREATE TRIGGER tr_member_after_update
AFTER UPDATE ON members
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, operation, record_id, old_values, new_values)
    VALUES ('members', 'UPDATE', NEW.id,
        JSON_OBJECT(
            'name', OLD.name,
            'type', OLD.type,
            'category', OLD.category,
            'department', OLD.department,
            'contact_info', OLD.contact_info,
            'is_active', OLD.is_active
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'type', NEW.type,
            'category', NEW.category,
            'department', NEW.department,
            'contact_info', NEW.contact_info,
            'is_active', NEW.is_active
        )
    );
END$$

-- =====================================================
-- TRANSACTION TRIGGERS
-- =====================================================

-- Trigger to validate transaction data
CREATE TRIGGER tr_transaction_before_insert
BEFORE INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE member_type VARCHAR(20);
    DECLARE member_active BOOLEAN DEFAULT FALSE;
    
    -- Get member details
    SELECT type, is_active INTO member_type, member_active
    FROM members 
    WHERE id = NEW.member_id;
    
    -- Validate member exists and is active
    IF member_active IS NULL OR member_active = FALSE THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Member not found or inactive';
    END IF;
    
    -- Validate member type for transaction type
    IF NEW.type = 'purchase' AND member_type != 'supplier' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase transactions can only be made with suppliers';
    END IF;
    
    IF NEW.type = 'issue' AND member_type = 'supplier' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Issue transactions cannot be made to suppliers';
    END IF;
END$$

DELIMITER ;