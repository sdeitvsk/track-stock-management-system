-- =====================================================
-- Inventory Management System - Complete Setup Script
-- =====================================================

-- Execute all scripts in order
SOURCE 01_create_database.sql;
SOURCE 02_create_tables.sql;
SOURCE 03_create_views.sql;
SOURCE 04_create_indexes.sql;
SOURCE 05_create_triggers.sql;
SOURCE 06_create_procedures.sql;
SOURCE 07_sample_data.sql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

USE inventory_management;

-- Check table creation
SHOW TABLES;

-- Check sample data
SELECT 'Login Users' as table_name, COUNT(*) as record_count FROM login_users
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Purchases', COUNT(*) FROM purchase
UNION ALL
SELECT 'Issues', COUNT(*) FROM issue;

-- Test views
SELECT 'Inventory Summary' as view_name, COUNT(*) as record_count FROM v_inventory_summary
UNION ALL
SELECT 'Low Stock Alerts', COUNT(*) FROM v_low_stock_alerts
UNION ALL
SELECT 'Purchase Summary', COUNT(*) FROM v_purchase_summary
UNION ALL
SELECT 'Issue Summary', COUNT(*) FROM v_issue_summary;

-- Test stored procedures
CALL sp_get_low_stock_items(50.00);
CALL sp_get_item_summary('Laptop Dell XPS 13');

-- Show database size
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'inventory_management'
ORDER BY (data_length + index_length) DESC;