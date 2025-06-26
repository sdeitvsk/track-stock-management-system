
-- =====================================================
-- Add member_id column to login_users table
-- =====================================================

USE inventory_management;

-- Add member_id column to login_users table
ALTER TABLE login_users 
ADD COLUMN member_id INT NULL,
ADD CONSTRAINT fk_login_users_member_id 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for member_id
CREATE INDEX idx_login_users_member_id ON login_users(member_id);
