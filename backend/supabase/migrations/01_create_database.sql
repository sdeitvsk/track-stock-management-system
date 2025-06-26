-- =====================================================
-- Inventory Management System - Database Creation
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS inventory_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE inventory_management;

-- Set SQL mode for better compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';