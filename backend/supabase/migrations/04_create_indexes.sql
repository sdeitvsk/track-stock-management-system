-- =====================================================
-- Inventory Management System - Additional Indexes
-- =====================================================

USE inventory_management;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_purchase_item_date_remaining ON purchase (item_name, purchase_date, remaining_quantity);
CREATE INDEX idx_issue_member_item_date ON issue (member_id, item_name, issue_date);
CREATE INDEX idx_transaction_member_type_date ON transactions (member_id, type, transaction_date);

-- Indexes for reporting queries
CREATE INDEX idx_purchase_date_item ON purchase (purchase_date, item_name);
CREATE INDEX idx_issue_date_item ON issue (issue_date, item_name);

-- Indexes for value calculations
CREATE INDEX idx_purchase_rate_quantity ON purchase (rate, quantity);
CREATE INDEX idx_purchase_remaining_rate ON purchase (remaining_quantity, rate);

-- =====================================================
-- COVERING INDEXES (Include frequently accessed columns)
-- =====================================================

-- For inventory summary calculations
CREATE INDEX idx_purchase_summary_covering ON purchase (item_name, quantity, remaining_quantity, rate, purchase_date);

-- For member transaction summaries
CREATE INDEX idx_transaction_member_covering ON transactions (member_id, type, transaction_date);

-- For FIFO operations
CREATE INDEX idx_fifo_covering ON purchase (item_name, remaining_quantity, purchase_date);

-- =====================================================
-- FUNCTIONAL INDEXES (MySQL 8.0+)
-- =====================================================

-- Index for case-insensitive searches
CREATE INDEX idx_members_name_lower ON members ((LOWER(name)));
CREATE INDEX idx_purchase_item_lower ON purchase ((LOWER(item_name)));
CREATE INDEX idx_issue_item_lower ON issue ((LOWER(item_name)));

-- Index for date-based queries
CREATE INDEX idx_purchase_year_month ON purchase ((YEAR(purchase_date)), (MONTH(purchase_date)));
CREATE INDEX idx_issue_year_month ON issue ((YEAR(issue_date)), (MONTH(issue_date)));
CREATE INDEX idx_transaction_year_month ON transactions ((YEAR(transaction_date)), (MONTH(transaction_date)));