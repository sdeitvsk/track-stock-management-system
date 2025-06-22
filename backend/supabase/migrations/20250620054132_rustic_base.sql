-- =====================================================
-- Inventory Management System - Views Creation
-- =====================================================

USE inventory_management;

-- =====================================================
-- 1. INVENTORY SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
    p.item_name,
    SUM(p.quantity) as total_purchased,
    SUM(p.remaining_quantity) as current_stock,
    SUM(p.quantity - p.remaining_quantity) as total_issued,
    ROUND(AVG(p.rate), 2) as average_rate,
    ROUND(SUM(p.quantity * p.rate), 2) as total_value,
    ROUND(SUM(p.remaining_quantity * p.rate), 2) as current_value,
    MIN(p.purchase_date) as first_purchase_date,
    MAX(p.purchase_date) as last_purchase_date,
    COUNT(DISTINCT p.id) as purchase_batches,
    ROUND((SUM(p.remaining_quantity) / SUM(p.quantity)) * 100, 2) as stock_percentage
FROM purchase p
GROUP BY p.item_name
ORDER BY p.item_name;

-- =====================================================
-- 2. LOW STOCK ALERTS VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    item_name,
    total_purchased,
    current_stock,
    stock_percentage,
    CASE 
        WHEN stock_percentage < 5 THEN 'Critical'
        WHEN stock_percentage < 10 THEN 'Low'
        WHEN stock_percentage < 20 THEN 'Warning'
        ELSE 'Normal'
    END as alert_level
FROM v_inventory_summary
WHERE stock_percentage < 20
ORDER BY stock_percentage ASC;

-- =====================================================
-- 3. PURCHASE SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_purchase_summary AS
SELECT 
    p.id,
    p.item_name,
    p.quantity,
    p.rate,
    p.remaining_quantity,
    (p.quantity - p.remaining_quantity) as issued_quantity,
    ROUND(p.quantity * p.rate, 2) as total_value,
    ROUND(p.remaining_quantity * p.rate, 2) as remaining_value,
    p.purchase_date,
    t.transaction_date,
    t.description as transaction_description,
    m.name as supplier_name,
    m.contact_info as supplier_contact,
    CASE 
        WHEN p.remaining_quantity = 0 THEN 'Fully Consumed'
        WHEN p.remaining_quantity < p.quantity * 0.1 THEN 'Nearly Consumed'
        ELSE 'Available'
    END as status
FROM purchase p
JOIN transactions t ON p.transaction_id = t.id
JOIN members m ON t.member_id = m.id
ORDER BY p.purchase_date DESC;

-- =====================================================
-- 4. ISSUE SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_issue_summary AS
SELECT 
    i.id,
    i.item_name,
    i.quantity,
    i.issue_date,
    t.transaction_date,
    t.description as transaction_description,
    m.name as issued_to,
    m.type as member_type,
    m.department,
    p.rate as purchase_rate,
    ROUND(i.quantity * p.rate, 2) as issue_value,
    p.purchase_date,
    supplier.name as original_supplier
FROM issue i
JOIN transactions t ON i.transaction_id = t.id
JOIN members m ON i.member_id = m.id
JOIN purchase p ON i.purchase_id = p.id
JOIN transactions pt ON p.transaction_id = pt.id
JOIN members supplier ON pt.member_id = supplier.id
ORDER BY i.issue_date DESC;

-- =====================================================
-- 5. MEMBER TRANSACTION SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_member_transactions AS
SELECT 
    m.id as member_id,
    m.name as member_name,
    m.type as member_type,
    m.department,
    COUNT(t.id) as total_transactions,
    SUM(CASE WHEN t.type = 'purchase' THEN 1 ELSE 0 END) as purchase_count,
    SUM(CASE WHEN t.type = 'issue' THEN 1 ELSE 0 END) as issue_count,
    MIN(t.transaction_date) as first_transaction,
    MAX(t.transaction_date) as last_transaction,
    -- Purchase totals (for suppliers)
    COALESCE(SUM(CASE WHEN t.type = 'purchase' THEN p.quantity * p.rate END), 0) as total_purchase_value,
    COALESCE(SUM(CASE WHEN t.type = 'purchase' THEN p.quantity END), 0) as total_items_supplied,
    -- Issue totals (for employees/stations)
    COALESCE(SUM(CASE WHEN t.type = 'issue' THEN i.quantity * purchase.rate END), 0) as total_issue_value,
    COALESCE(SUM(CASE WHEN t.type = 'issue' THEN i.quantity END), 0) as total_items_received
FROM members m
LEFT JOIN transactions t ON m.id = t.member_id
LEFT JOIN purchase p ON t.id = p.transaction_id AND t.type = 'purchase'
LEFT JOIN issue i ON t.id = i.transaction_id AND t.type = 'issue'
LEFT JOIN purchase purchase ON i.purchase_id = purchase.id
WHERE m.is_active = TRUE
GROUP BY m.id, m.name, m.type, m.department
ORDER BY m.name;

-- =====================================================
-- 6. DAILY TRANSACTION SUMMARY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_daily_transactions AS
SELECT 
    DATE(t.transaction_date) as transaction_date,
    t.type,
    COUNT(*) as transaction_count,
    -- Purchase metrics
    SUM(CASE WHEN t.type = 'purchase' THEN p.quantity END) as items_purchased,
    SUM(CASE WHEN t.type = 'purchase' THEN p.quantity * p.rate END) as purchase_value,
    -- Issue metrics
    SUM(CASE WHEN t.type = 'issue' THEN i.quantity END) as items_issued,
    SUM(CASE WHEN t.type = 'issue' THEN i.quantity * purchase.rate END) as issue_value,
    -- Unique counts
    COUNT(DISTINCT CASE WHEN t.type = 'purchase' THEN p.item_name END) as unique_items_purchased,
    COUNT(DISTINCT CASE WHEN t.type = 'issue' THEN i.item_name END) as unique_items_issued,
    COUNT(DISTINCT t.member_id) as unique_members
FROM transactions t
LEFT JOIN purchase p ON t.id = p.transaction_id AND t.type = 'purchase'
LEFT JOIN issue i ON t.id = i.transaction_id AND t.type = 'issue'
LEFT JOIN purchase purchase ON i.purchase_id = purchase.id
GROUP BY DATE(t.transaction_date), t.type
ORDER BY transaction_date DESC, t.type;

-- =====================================================
-- 7. ITEM MOVEMENT HISTORY VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_item_movement_history AS
SELECT 
    'purchase' as movement_type,
    p.item_name,
    p.quantity,
    0 as quantity_out,
    p.quantity as quantity_in,
    p.rate,
    p.quantity * p.rate as value,
    p.purchase_date as movement_date,
    m.name as member_name,
    m.type as member_type,
    t.description,
    p.id as reference_id
FROM purchase p
JOIN transactions t ON p.transaction_id = t.id
JOIN members m ON t.member_id = m.id

UNION ALL

SELECT 
    'issue' as movement_type,
    i.item_name,
    i.quantity,
    i.quantity as quantity_out,
    0 as quantity_in,
    p.rate,
    i.quantity * p.rate as value,
    i.issue_date as movement_date,
    m.name as member_name,
    m.type as member_type,
    t.description,
    i.id as reference_id
FROM issue i
JOIN transactions t ON i.transaction_id = t.id
JOIN members m ON i.member_id = m.id
JOIN purchase p ON i.purchase_id = p.id

ORDER BY movement_date DESC, movement_type;

-- =====================================================
-- 8. FIFO TRACKING VIEW
-- =====================================================
CREATE OR REPLACE VIEW v_fifo_tracking AS
SELECT 
    p.id as purchase_id,
    p.item_name,
    p.quantity as original_quantity,
    p.remaining_quantity,
    p.quantity - p.remaining_quantity as consumed_quantity,
    p.rate,
    p.purchase_date,
    ROUND((p.quantity - p.remaining_quantity) / p.quantity * 100, 2) as consumption_percentage,
    supplier.name as supplier_name,
    -- Next items to be consumed (FIFO order)
    ROW_NUMBER() OVER (PARTITION BY p.item_name ORDER BY p.purchase_date ASC) as fifo_order,
    CASE 
        WHEN p.remaining_quantity = 0 THEN 'Fully Consumed'
        WHEN p.remaining_quantity > 0 AND 
             p.purchase_date = (
                 SELECT MIN(p2.purchase_date) 
                 FROM purchase p2 
                 WHERE p2.item_name = p.item_name 
                 AND p2.remaining_quantity > 0
             ) THEN 'Next to Issue'
        ELSE 'In Queue'
    END as fifo_status
FROM purchase p
JOIN transactions t ON p.transaction_id = t.id
JOIN members supplier ON t.member_id = supplier.id
WHERE p.remaining_quantity > 0 OR p.quantity - p.remaining_quantity > 0
ORDER BY p.item_name, p.purchase_date;