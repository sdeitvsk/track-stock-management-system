-- =====================================================
-- Inventory Management System - Stored Procedures
-- =====================================================

USE inventory_management;

DELIMITER $$

-- =====================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Procedure to get available stock for FIFO issuing
CREATE PROCEDURE sp_get_available_stock_fifo(
    IN p_item_name VARCHAR(100)
)
BEGIN
    SELECT 
        id as purchase_id,
        item_name,
        remaining_quantity,
        rate,
        purchase_date,
        ROUND(remaining_quantity * rate, 2) as remaining_value
    FROM purchase 
    WHERE item_name = p_item_name 
    AND remaining_quantity > 0
    ORDER BY purchase_date ASC;
END$$

-- Procedure to get inventory summary for specific item
CREATE PROCEDURE sp_get_item_summary(
    IN p_item_name VARCHAR(100)
)
BEGIN
    SELECT * FROM v_inventory_summary 
    WHERE item_name = p_item_name;
END$$

-- Procedure to get low stock items with threshold
CREATE PROCEDURE sp_get_low_stock_items(
    IN p_threshold DECIMAL(5,2) DEFAULT 10.00
)
BEGIN
    SELECT * FROM v_low_stock_alerts 
    WHERE stock_percentage < p_threshold
    ORDER BY stock_percentage ASC;
END$$

-- Procedure to get member transaction history
CREATE PROCEDURE sp_get_member_history(
    IN p_member_id INT,
    IN p_start_date DATE DEFAULT NULL,
    IN p_end_date DATE DEFAULT NULL
)
BEGIN
    SELECT 
        t.type,
        t.transaction_date,
        t.description,
        CASE 
            WHEN t.type = 'purchase' THEN p.item_name
            WHEN t.type = 'issue' THEN i.item_name
        END as item_name,
        CASE 
            WHEN t.type = 'purchase' THEN p.quantity
            WHEN t.type = 'issue' THEN i.quantity
        END as quantity,
        CASE 
            WHEN t.type = 'purchase' THEN p.rate
            WHEN t.type = 'issue' THEN purchase.rate
        END as rate,
        CASE 
            WHEN t.type = 'purchase' THEN ROUND(p.quantity * p.rate, 2)
            WHEN t.type = 'issue' THEN ROUND(i.quantity * purchase.rate, 2)
        END as total_value
    FROM transactions t
    LEFT JOIN purchase p ON t.id = p.transaction_id AND t.type = 'purchase'
    LEFT JOIN issue i ON t.id = i.transaction_id AND t.type = 'issue'
    LEFT JOIN purchase purchase ON i.purchase_id = purchase.id
    WHERE t.member_id = p_member_id
    AND (p_start_date IS NULL OR DATE(t.transaction_date) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(t.transaction_date) <= p_end_date)
    ORDER BY t.transaction_date DESC;
END$$

-- Procedure to process FIFO issue
CREATE PROCEDURE sp_process_fifo_issue(
    IN p_member_id INT,
    IN p_item_name VARCHAR(100),
    IN p_quantity INT,
    IN p_description TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_purchase_id INT;
    DECLARE v_available_qty INT;
    DECLARE v_rate DECIMAL(10,2);
    DECLARE v_remaining_to_issue INT DEFAULT p_quantity;
    DECLARE v_quantity_to_issue INT;
    DECLARE v_transaction_id INT;
    
    -- Cursor to get available purchases in FIFO order
    DECLARE fifo_cursor CURSOR FOR
        SELECT id, remaining_quantity, rate
        FROM purchase 
        WHERE item_name = p_item_name 
        AND remaining_quantity > 0
        ORDER BY purchase_date ASC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Check if enough total stock is available
    SELECT SUM(remaining_quantity) INTO @total_available
    FROM purchase 
    WHERE item_name = p_item_name 
    AND remaining_quantity > 0;
    
    IF @total_available < p_quantity THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient total stock available';
    END IF;
    
    -- Create transaction record
    INSERT INTO transactions (type, member_id, description)
    VALUES ('issue', p_member_id, p_description);
    
    SET v_transaction_id = LAST_INSERT_ID();
    
    -- Process FIFO logic
    OPEN fifo_cursor;
    
    fifo_loop: LOOP
        FETCH fifo_cursor INTO v_purchase_id, v_available_qty, v_rate;
        
        IF done OR v_remaining_to_issue <= 0 THEN
            LEAVE fifo_loop;
        END IF;
        
        -- Calculate quantity to issue from this purchase
        SET v_quantity_to_issue = LEAST(v_remaining_to_issue, v_available_qty);
        
        -- Create issue record
        INSERT INTO issue (transaction_id, member_id, purchase_id, item_name, quantity)
        VALUES (v_transaction_id, p_member_id, v_purchase_id, p_item_name, v_quantity_to_issue);
        
        -- Update purchase remaining quantity
        UPDATE purchase 
        SET remaining_quantity = remaining_quantity - v_quantity_to_issue
        WHERE id = v_purchase_id;
        
        -- Update remaining quantity to issue
        SET v_remaining_to_issue = v_remaining_to_issue - v_quantity_to_issue;
        
    END LOOP;
    
    CLOSE fifo_cursor;
    
    -- Commit transaction
    COMMIT;
    
    -- Return transaction details
    SELECT 
        v_transaction_id as transaction_id,
        p_quantity as total_quantity_issued,
        (p_quantity - v_remaining_to_issue) as actual_quantity_issued,
        v_remaining_to_issue as remaining_quantity
    ;
    
END$$

-- Procedure to get stock valuation report
CREATE PROCEDURE sp_get_stock_valuation(
    IN p_as_of_date DATE DEFAULT NULL
)
BEGIN
    IF p_as_of_date IS NULL THEN
        SET p_as_of_date = CURDATE();
    END IF;
    
    SELECT 
        p.item_name,
        SUM(p.remaining_quantity) as current_stock,
        ROUND(AVG(p.rate), 2) as average_rate,
        ROUND(SUM(p.remaining_quantity * p.rate), 2) as total_value,
        COUNT(DISTINCT p.id) as active_batches,
        MIN(p.purchase_date) as oldest_batch_date,
        MAX(p.purchase_date) as newest_batch_date
    FROM purchase p
    WHERE p.remaining_quantity > 0
    AND DATE(p.purchase_date) <= p_as_of_date
    GROUP BY p.item_name
    ORDER BY total_value DESC;
END$$

-- Procedure to get transaction summary by date range
CREATE PROCEDURE sp_get_transaction_summary(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_transaction_type VARCHAR(20) DEFAULT NULL
)
BEGIN
    SELECT 
        DATE(t.transaction_date) as transaction_date,
        t.type,
        COUNT(*) as transaction_count,
        SUM(CASE 
            WHEN t.type = 'purchase' THEN p.quantity * p.rate
            WHEN t.type = 'issue' THEN i.quantity * purchase.rate
        END) as total_value,
        SUM(CASE 
            WHEN t.type = 'purchase' THEN p.quantity
            WHEN t.type = 'issue' THEN i.quantity
        END) as total_quantity,
        COUNT(DISTINCT t.member_id) as unique_members,
        COUNT(DISTINCT CASE 
            WHEN t.type = 'purchase' THEN p.item_name
            WHEN t.type = 'issue' THEN i.item_name
        END) as unique_items
    FROM transactions t
    LEFT JOIN purchase p ON t.id = p.transaction_id AND t.type = 'purchase'
    LEFT JOIN issue i ON t.id = i.transaction_id AND t.type = 'issue'
    LEFT JOIN purchase purchase ON i.purchase_id = purchase.id
    WHERE DATE(t.transaction_date) BETWEEN p_start_date AND p_end_date
    AND (p_transaction_type IS NULL OR t.type = p_transaction_type)
    GROUP BY DATE(t.transaction_date), t.type
    ORDER BY transaction_date DESC, t.type;
END$$

DELIMITER ;