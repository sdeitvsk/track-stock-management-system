-- =====================================================
-- Inventory Management System - Table Creation
-- =====================================================

USE inventory_management;

-- =====================================================
-- 1. LOGIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS login_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('employee', 'supplier', 'station') DEFAULT 'employee',
    category VARCHAR(100) NULL,
    department VARCHAR(100) NULL,
    contact_info VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_type (type),
    INDEX idx_category (category),
    INDEX idx_department (department),
    INDEX idx_is_active (is_active),
    INDEX idx_type_active (type, is_active),
    INDEX idx_created_at (created_at),
    
    -- Full-text search index for name and contact_info
    FULLTEXT idx_search (name, contact_info)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('purchase', 'issue') NOT NULL,
    member_id INT NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_type (type),
    INDEX idx_member_id (member_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_type_date (type, transaction_date),
    INDEX idx_member_type (member_id, type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. PURCHASE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    rate DECIMAL(10,2) NOT NULL CHECK (rate >= 0),
    remaining_quantity INT NOT NULL CHECK (remaining_quantity >= 0),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CHECK (remaining_quantity <= quantity),
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_item_name (item_name),
    INDEX idx_purchase_date (purchase_date),
    INDEX idx_remaining_quantity (remaining_quantity),
    INDEX idx_item_remaining (item_name, remaining_quantity),
    INDEX idx_item_date (item_name, purchase_date),
    INDEX idx_fifo_lookup (item_name, remaining_quantity, purchase_date),
    INDEX idx_created_at (created_at),
    
    -- Full-text search index for item names
    FULLTEXT idx_item_search (item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. ISSUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS issue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT NOT NULL,
    member_id INT NOT NULL,
    purchase_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (purchase_id) REFERENCES purchase(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_member_id (member_id),
    INDEX idx_purchase_id (purchase_id),
    INDEX idx_item_name (item_name),
    INDEX idx_issue_date (issue_date),
    INDEX idx_member_item (member_id, item_name),
    INDEX idx_item_date (item_name, issue_date),
    INDEX idx_purchase_item (purchase_id, item_name),
    INDEX idx_created_at (created_at),
    
    -- Full-text search index for item names
    FULLTEXT idx_item_search (item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;