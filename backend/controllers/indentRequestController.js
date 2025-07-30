const { IndentRequest, IndentRequestItem, Member } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { createIssue } = require('./issueController'); // Import the createOrUpdateIssue function

// Create a new indent request
const createIndentRequest = async (req, res) => {
  
  try {
    const { department, purpose, priority = 'normal', items, member_id } = req.body;
    const requested_by = req.user.username;

    // Validate required fields
    if (!department || !purpose || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Department, purpose, and items are required'
      });
    }

    // Find the member record for the requesting user
    /*
    const member = await Member.findOne({ 
      where: { name: department } 
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: 'Member profile not found for the requesting user'
      });
    }
    */
   
    // Create the main indent request   
    const indentRequest = await IndentRequest.create({
      member_id,
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
      remarks: item.remarks,
      item_id: item.item_id || null // Optional field
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
        where.requested_by = member.name;
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
        where.requested_by = req.user.username;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Member profile not found for the current user'
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
      // Run the custom query
      const availablePurchases = await sequelize.query(
        `SELECT p.id, p.item_id, p.item_name, p.remaining_quantity, i.indent_request_id
         FROM purchase p
         JOIN indent_request_items i ON p.item_id = i.item_id
         WHERE i.indent_request_id = :id AND p.remaining_quantity > 0`,
        { replacements: { id: indentRequest.id }, type: sequelize.QueryTypes.SELECT }
      );

      console.log(availablePurchases);

    res.json({
      success: true,
      data: indentRequest,
      availablePurchases
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

// Helper function to create issue transaction from approved indent request
const createIssueFromIndentRequest = async (indentRequest, approved_quantities) => {
  try {
    // Get available purchases for the indent request items
    const availablePurchases = await sequelize.query(
      `SELECT p.id, p.item_id, p.item_name, p.remaining_quantity, i.indent_request_id, i.id as item_request_id
       FROM purchase p
       JOIN indent_request_items i ON p.item_id = i.item_id
       WHERE i.indent_request_id = :id AND p.remaining_quantity > 0
       ORDER BY p.purchase_date ASC`,
      { 
        replacements: { id: indentRequest.id }, 
        type: sequelize.QueryTypes.SELECT 
      }
    );

    // Prepare items for issue creation
    const issueItems = [];
    
    for (const approvedItem of approved_quantities) {
      const matchingPurchases = availablePurchases.filter(
        p => p.item_request_id === approvedItem.item_id
      );

      let tobeIssued = approvedItem.approved_quantity;

      if (matchingPurchases.length > 0) {

        for (const purchase of matchingPurchases) {

          if (tobeIssued === 0) break;

          const issueQuantity = Math.min(tobeIssued, purchase.remaining_quantity);

          issueItems.push({
            item_name: purchase.item_name,
            quantity: issueQuantity,
            purchase_id: purchase.id
          });

          tobeIssued -= issueQuantity;
        }
      }
    }

    if (issueItems.length === 0) {
      throw new Error('No matching purchases found for approved items');
    }

    // Create the issue request payload
    const issuePayload = {
      member_id: indentRequest.member_id,
      items: issueItems,
      description: `Indent Request #${indentRequest.id} - ${indentRequest.purpose}`,
      invoice_no: `IR-${indentRequest.id}`,
      invoice_date: new Date().toISOString().split('T')[0],
      indent_request_id: indentRequest.id
    };

    // Create mock request and response objects for the createIssue function
    const mockReq = {
      body: issuePayload
    };

    const mockRes = {
      status: (code) => ({
        json: (data) => {
          if (code >= 400) {
            throw new Error(data.message || 'Error creating issue');
          }
          return data;
        }
      }),
      json: (data) => data
    };

    // Call the createIssue function
    const result = await createIssue(mockReq, mockRes);
    
    return result;

  } catch (error) {
    console.error('Error creating issue from indent request:', error);
    throw error;
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

    // Auto-create issue transaction when indent is approved
    let issueResult = null;
    if (status === 'approved' && approved_quantities && approved_quantities.length > 0) {
      try {
        issueResult = await createIssueFromIndentRequest(indentRequest, approved_quantities);
        console.log('Auto-created issue transaction:', issueResult);
      } catch (issueError) {
        console.error('Error auto-creating issue:', issueError);
        // Don't fail the indent approval if issue creation fails
        // You might want to add a flag or notification about this
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

    const response = {
      success: true,
      message: 'Indent request updated successfully',
      data: updatedRequest
    };

    // Include issue creation result if it was created
    if (issueResult) {
      response.issue_created = true;
      response.issue_data = issueResult;
      response.message += ' and issue transaction created automatically';
    }

    res.json(response);

  } catch (error) {
    console.error('Error updating indent request:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating indent request',
      error: error.message
    });
  }
};

// Update (edit) an indent request (only if pending, only by creator or admin)
const updateIndentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, purpose, priority = 'normal', items, member_id } = req.body;
    const username = req.user.username;
    const userRole = req.user.role;

    // Find the indent request
    const indentRequest = await IndentRequest.findByPk(id, {
      include: [{ model: IndentRequestItem, as: 'items' }]
    });

    if (!indentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Indent request not found'
      });
    }

    // Only allow editing if pending
    if (indentRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending indent requests can be edited'
      });
    }

    // Only creator or admin can edit
    if (userRole !== 'admin' && indentRequest.requested_by !== username) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this indent request'
      });
    }

    // Update main fields
    indentRequest.member_id = member_id;
    indentRequest.department = department;
    indentRequest.purpose = purpose;
    indentRequest.priority = priority;
    await indentRequest.save();

    // Update items: remove old, add new
    await IndentRequestItem.destroy({ where: { indent_request_id: id } });
    if (items && items.length > 0) {
      const itemsWithRequestId = items.map(item => ({
        indent_request_id: id,
        item_name: item.item_name,
        quantity: item.quantity,
        remarks: item.remarks,
        item_id: item.item_id || null
      }));
      await IndentRequestItem.bulkCreate(itemsWithRequestId);
    }

    // Fetch updated request
    const updatedRequest = await IndentRequest.findByPk(id, {
      include: [
        { model: IndentRequestItem, as: 'items' },
        { model: Member, as: 'member', attributes: ['id', 'name', 'department'] }
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
  updateIndentRequest, // Export the new function
  deleteIndentRequest
};