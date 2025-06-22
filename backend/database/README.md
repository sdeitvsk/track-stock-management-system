# Inventory Management System - Database Setup

This directory contains all the MySQL scripts needed to set up the complete database structure for the Inventory Management System.

## 📁 File Structure

```
database/
├── 01_create_database.sql    # Database creation and configuration
├── 02_create_tables.sql      # All table definitions with constraints
├── 03_create_views.sql       # Views for reporting and analytics
├── 04_create_indexes.sql     # Performance indexes
├── 05_create_triggers.sql    # Data validation and audit triggers
├── 06_create_procedures.sql  # Stored procedures for common operations
├── 07_sample_data.sql        # Sample data for testing
├── 08_run_all.sql           # Master script to run everything
└── README.md                # This file
```

## 🚀 Quick Setup

### Option 1: Run All Scripts at Once
```bash
mysql -u root -p < database/08_run_all.sql
```

### Option 2: Run Scripts Individually
```bash
mysql -u root -p < database/01_create_database.sql
mysql -u root -p < database/02_create_tables.sql
mysql -u root -p < database/03_create_views.sql
mysql -u root -p < database/04_create_indexes.sql
mysql -u root -p < database/05_create_triggers.sql
mysql -u root -p < database/06_create_procedures.sql
mysql -u root -p < database/07_sample_data.sql
```

### Option 3: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open and execute each script file in order (01 through 07)

## 📊 Database Schema Overview

### Core Tables
- **`login_users`** - System users with authentication
- **`members`** - Suppliers, employees, and stations
- **`transactions`** - Transaction records (purchase/issue)
- **`purchase`** - Purchase records with FIFO tracking
- **`issue`** - Issue records linked to purchases

### Views for Reporting
- **`v_inventory_summary`** - Complete inventory overview
- **`v_low_stock_alerts`** - Items below stock thresholds
- **`v_purchase_summary`** - Purchase history with supplier info
- **`v_issue_summary`** - Issue history with member details
- **`v_member_transactions`** - Member transaction summaries
- **`v_daily_transactions`** - Daily transaction metrics
- **`v_item_movement_history`** - Complete item movement tracking
- **`v_fifo_tracking`** - FIFO consumption tracking

### Stored Procedures
- **`sp_get_available_stock_fifo`** - Get available stock for FIFO issuing
- **`sp_get_item_summary`** - Get inventory summary for specific item
- **`sp_get_low_stock_items`** - Get items below stock threshold
- **`sp_get_member_history`** - Get transaction history for member
- **`sp_process_fifo_issue`** - Process FIFO issue transaction
- **`sp_get_stock_valuation`** - Get stock valuation report
- **`sp_get_transaction_summary`** - Get transaction summary by date range

## 🔧 Key Features

### FIFO Implementation
The system implements First-In-First-Out inventory management:
- `remaining_quantity` field in `purchase` table tracks available stock
- Issues are processed against oldest purchases first
- Triggers automatically update remaining quantities
- Views provide FIFO tracking and status

### Audit Trail
- Complete audit logging with `audit_log` table
- Triggers capture all data changes
- JSON format for old/new values
- Timestamp and user tracking

### Performance Optimization
- Comprehensive indexing strategy
- Composite indexes for common query patterns
- Full-text search indexes for item names
- Covering indexes for frequently accessed data

### Data Validation
- Check constraints for data integrity
- Triggers for business rule validation
- Foreign key constraints for referential integrity
- Automatic data consistency maintenance

## 📈 Sample Queries

### Get Inventory Summary
```sql
SELECT * FROM v_inventory_summary;
```

### Get Low Stock Items
```sql
CALL sp_get_low_stock_items(10.00);
```

### Get FIFO Available Stock
```sql
CALL sp_get_available_stock_fifo('Laptop Dell XPS 13');
```

### Get Member Transaction History
```sql
CALL sp_get_member_history(5, '2024-01-01', '2024-12-31');
```

### Process FIFO Issue
```sql
CALL sp_process_fifo_issue(5, 'Laptop Dell XPS 13', 2, 'Issue to developer');
```

## 🔒 Security Considerations

### User Privileges
Create dedicated database users with minimal required privileges:

```sql
-- Create application user
CREATE USER 'inventory_app'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant necessary privileges
GRANT SELECT, INSERT, UPDATE ON inventory_management.* TO 'inventory_app'@'localhost';
GRANT EXECUTE ON inventory_management.* TO 'inventory_app'@'localhost';

-- Create read-only reporting user
CREATE USER 'inventory_reports'@'localhost' IDENTIFIED BY 'report_password';
GRANT SELECT ON inventory_management.* TO 'inventory_reports'@'localhost';
```

### Backup Strategy
```sql
-- Create backup
mysqldump -u root -p inventory_management > backup_$(date +%Y%m%d).sql

-- Restore backup
mysql -u root -p inventory_management < backup_20241201.sql
```

## 🧪 Testing

### Verify Installation
```sql
USE inventory_management;

-- Check all tables exist
SHOW TABLES;

-- Check sample data
SELECT COUNT(*) FROM members;
SELECT COUNT(*) FROM purchase;
SELECT COUNT(*) FROM issue;

-- Test views
SELECT COUNT(*) FROM v_inventory_summary;
SELECT COUNT(*) FROM v_low_stock_alerts;

-- Test procedures
CALL sp_get_low_stock_items(50.00);
```

### Performance Testing
```sql
-- Check index usage
EXPLAIN SELECT * FROM purchase WHERE item_name = 'Laptop Dell XPS 13';

-- Check query performance
SELECT 
    table_name,
    index_name,
    cardinality
FROM information_schema.statistics 
WHERE table_schema = 'inventory_management';
```

## 🔄 Maintenance

### Regular Maintenance Tasks
```sql
-- Optimize tables
OPTIMIZE TABLE purchase, issue, transactions;

-- Update table statistics
ANALYZE TABLE purchase, issue, transactions;

-- Check table integrity
CHECK TABLE purchase, issue, transactions;
```

### Monitoring Queries
```sql
-- Check database size
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'inventory_management';

-- Check recent activity
SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 10;

-- Check slow queries (if slow query log is enabled)
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

## 📝 Notes

1. **MySQL Version**: Optimized for MySQL 8.0+, but compatible with 5.7+
2. **Character Set**: Uses utf8mb4 for full Unicode support
3. **Storage Engine**: InnoDB for ACID compliance and foreign keys
4. **Time Zone**: All timestamps use server time zone
5. **Collation**: utf8mb4_unicode_ci for proper sorting

## 🆘 Troubleshooting

### Common Issues

**Issue**: Foreign key constraint errors
```sql
-- Check foreign key constraints
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'inventory_management';
```

**Issue**: Trigger errors
```sql
-- Check trigger definitions
SHOW TRIGGERS FROM inventory_management;
```

**Issue**: Performance problems
```sql
-- Check index usage
SHOW INDEX FROM purchase;
SHOW INDEX FROM issue;
```

**Issue**: Data inconsistency
```sql
-- Verify FIFO integrity
SELECT 
    p.item_name,
    p.quantity,
    p.remaining_quantity,
    SUM(i.quantity) as total_issued
FROM purchase p
LEFT JOIN issue i ON p.id = i.purchase_id
GROUP BY p.id
HAVING p.quantity - p.remaining_quantity != COALESCE(total_issued, 0);
```

For additional support, refer to the main project README or contact the development team.