
const { IndentRequest, IndentRequestItem, Member } = require('../models');
const { Op } = require('sequelize');

// Create a new indent request
const createIndentRequest = async (req, res) => {
  
  try {
    const { department, purpose, priority = 'normal', items } = req.body;
    const requested_by = req.user.username;

    // Validate required fields
    if (!department || !purpose || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Department, purpose, and items are required'
      });
    }

    // Find the member record for the requesting user
    const member = await Member.findOne({ 
      where: { name: requested_by } 
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'Member profile not found for the requesting user'
      });
    }

    // Create the main indent request
    const indentRequest = await IndentRequest.create({
      member_id: member.id,
      department,
      purpose,
      priority,
      requested_by
    });

    // Create the associated items
    const itemsWithRequestId = items.map(item => ({
      indent_request_id: indentRequest.id,
      item_name: item.item_name,
      quantity: item.quantity,
      remarks: item.remarks
    }));

    await IndentRequestItem.bulkCreate(itemsWithRequestId);

    // Fetch the complete request with items
    const completeRequest = await IndentRequest.findByPk(indentRequest.id, {
      include: [{
        model: IndentRequestItem,
        as: 'items'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Indent request created successfully',
      data: completeRequest
    });

  } catch (error) {
    console.error('Error creating indent request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating indent request',
      error: error.message
    });
  }
};

// Get all indent requests with filtering and role-based access
const getIndentRequests = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      department, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    const where = {};
    
    // Role-based filtering: non-admins can only see their own requests
    if (req.user.role !== 'admin') {
      // Find the member record for the current user
      const member = await Member.findOne({ 
        where: { name: req.user.username } 
      });
      
      if (member) {
        where.member_id = member.id;
      } else {
        // If no member record found, return empty result
        return res.json({
          success: true,
          data: {
            indent_requests: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: 0
            }
          }
        });
      }
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority;
    }
    
    if (department) {
      where.department = { [Op.like]: `%${department}%` };
    }
    
    if (search) {
      where[Op.or] = [
        { department: { [Op.like]: `%${search}%` } },
        { purpose: { [Op.like]: `%${search}%` } },
        { requested_by: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await IndentRequest.findAndCountAll({
      where,
      include: [
        {
          model: IndentRequestItem,
          as: 'items'
        },
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'department']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        indent_requests: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching indent requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching indent requests',
      error: error.message
    });
  }
};

// Get a specific indent request by ID
const getIndentRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const where = { id };
    
    // Role-based filtering: non-admins can only see their own requests
    if (req.user.role !== 'admin') {
      const member = await Member.findOne({ 
        where: { name: req.user.username } 
      });
      
      if (member) {
        where.member_id = member.id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Indent request not found'
        });
      }
    }

    const indentRequest = await IndentRequest.findOne({
      where,
      include: [
        {
          model: IndentRequestItem,
          as: 'items'
        },
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'department']
        }
      ]
    });

    if (!indentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Indent request not found'
      });
    }

    res.json({
      success: true,
      data: indentRequest
    });

  } catch (error) {
    console.error('Error fetching indent request:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching indent request',
      error: error.message
    });
  }
};

// Update indent request status
const updateIndentRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, approved_quantities } = req.body;
    const approved_by = req.user.username;

    const indentRequest = await IndentRequest.findByPk(id);
    
    if (!indentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Indent request not found'
      });
    }

    // Update the main request
    const updateData = { status, remarks };
    if (status === 'approved' || status === 'partial') {
      updateData.approved_by = approved_by;
      updateData.approved_date = new Date();
    }

    await indentRequest.update(updateData);

    // Update approved quantities for items if provided
    if (approved_quantities && Array.isArray(approved_quantities)) {
      for (const item of approved_quantities) {
        await IndentRequestItem.update(
          { approved_quantity: item.approved_quantity },
          { where: { id: item.item_id, indent_request_id: id } }
        );
      }
    }

    // Fetch updated request
    const updatedRequest = await IndentRequest.findByPk(id, {
      include: [
        {
          model: IndentRequestItem,
          as: 'items'
        },
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'department']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Indent request updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error updating indent request:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating indent request',
      error: error.message
    });
  }
};

// Delete indent request
const deleteIndentRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const indentRequest = await IndentRequest.findByPk(id);
    
    if (!indentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Indent request not found'
      });
    }

    // Check if request can be deleted (only pending requests)
    if (indentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending indent requests can be deleted'
      });
    }

    await indentRequest.destroy();

    res.json({
      success: true,
      message: 'Indent request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting indent request:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting indent request',
      error: error.message
    });
  }
};

module.exports = {
  createIndentRequest,
  getIndentRequests,
  getIndentRequestById,
  updateIndentRequestStatus,
  deleteIndentRequest
};
