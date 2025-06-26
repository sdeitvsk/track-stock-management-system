
const { LoginUser, Member } = require('../models');
const bcrypt = require('bcryptjs');

const getAllLoginUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.username = {
        [require('sequelize').Op.like]: `%${search}%`
      };
    }
    if (role) {
      whereClause.role = role;
    }

    const { count, rows: users } = await LoginUser.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'type', 'department']
        }
      ],
      attributes: ['id', 'username', 'member_id', 'role', 'is_active', 'last_login', 'created_at'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_records: count,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching login users',
      error: error.message
    });
  }
};

const createLoginUser = async (req, res) => {
  try {
    const { username, password, member_id, role = 'staff' } = req.body;

    // Check if username already exists
    const existingUser = await LoginUser.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // If member_id is provided, check if member exists
    if (member_id) {
      const member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: 'Member not found'
        });
      }

      // Check if member already has a login user
      const existingMemberLogin = await LoginUser.findOne({ where: { member_id } });
      if (existingMemberLogin) {
        return res.status(400).json({
          success: false,
          message: 'Member already has a login account'
        });
      }
    }

    const user = await LoginUser.create({
      username,
      password_hash: password,
      member_id: member_id || null,
      role
    });

    // Fetch the created user with member details
    const createdUser = await LoginUser.findByPk(user.id, {
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'type', 'department']
        }
      ],
      attributes: ['id', 'username', 'member_id', 'role', 'is_active', 'created_at']
    });

    res.status(201).json({
      success: true,
      message: 'Login user created successfully',
      data: { user: createdUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating login user',
      error: error.message
    });
  }
};

const updateLoginUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, member_id, role, is_active } = req.body;

    const user = await LoginUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Login user not found'
      });
    }

    // Check if username is being changed and if it already exists
    if (username && username !== user.username) {
      const existingUser = await LoginUser.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // If member_id is being changed, validate it
    if (member_id && member_id !== user.member_id) {
      const member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: 'Member not found'
        });
      }

      const existingMemberLogin = await LoginUser.findOne({ 
        where: { 
          member_id,
          id: { [require('sequelize').Op.ne]: id }
        }
      });
      if (existingMemberLogin) {
        return res.status(400).json({
          success: false,
          message: 'Member already has a login account'
        });
      }
    }

    await user.update({
      username: username || user.username,
      member_id: member_id !== undefined ? member_id : user.member_id,
      role: role || user.role,
      is_active: is_active !== undefined ? is_active : user.is_active
    });

    // Fetch updated user with member details
    const updatedUser = await LoginUser.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'type', 'department']
        }
      ],
      attributes: ['id', 'username', 'member_id', 'role', 'is_active', 'last_login', 'created_at']
    });

    res.json({
      success: true,
      message: 'Login user updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating login user',
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    const user = await LoginUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Login user not found'
      });
    }

    await user.update({
      password_hash: new_password // Will be hashed by the model hook
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

const deleteLoginUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await LoginUser.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Login user not found'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Login user deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting login user',
      error: error.message
    });
  }
};

module.exports = {
  getAllLoginUsers,
  createLoginUser,
  updateLoginUser,
  resetPassword,
  deleteLoginUser
};
