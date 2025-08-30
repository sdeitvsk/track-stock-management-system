
const jwt = require('jsonwebtoken');
const { LoginUser, Member } = require('../models');
const bcrypt = require('bcryptjs');
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const register = async (req, res) => {
  try {
    const { username, password, role = 'staff', member_id } = req.body;

    // Check if user already exists
    const existingUser = await LoginUser.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // If member_id is provided, validate it
    if (member_id) {
      const member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: 'Member not found'
        });
      }
    }

    // Create new user
    const user = await LoginUser.create({
      username,
      password_hash: password, // Will be hashed by the model hook
      member_id: member_id || null,
      role
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          member_id: user.member_id,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username with member details
    const user = await LoginUser.findOne({ 
      where: { 
        username,
        is_active: true
      },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'type', 'department']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          member_id: user.member_id,
          role: user.role,
          last_login: user.last_login,
          member: user.member
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await LoginUser.findByPk(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    await user.update({ password_hash: newPassword });
    await user.updateLastLogin();
    const token = generateToken(user.id);
    res.json({
      success: true,
      message: 'Password changed successfully',
      data: {
        token
      }
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await LoginUser.findByPk(req.user.id, {
      attributes: ['id', 'username', 'member_id', 'role', 'is_active', 'last_login', 'created_at'],
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'type', 'department']
        }
      ]
    });

    res.json({
      success: true,
      data: { 
        user: {
          id: user.id,
          username: user.username,
          member_id: user.member_id,
          role: user.role,
          is_active: user.is_active,
          last_login: user.last_login,
          created_at: user.created_at,
          member: user.member
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  changePassword,
 

};
