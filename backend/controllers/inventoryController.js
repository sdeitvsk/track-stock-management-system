const { Purchase, Issue, Member, Transaction } = require('../models');
const { sequelize } = require('../config/database');

const getInventorySummary = async (req, res) => {
  try {
    const { item_name } = req.query;

    let whereClause = {};
    if (item_name) {
      whereClause.item_name = { [sequelize.Sequelize.Op.like]: `%${item_name}%` };
    }

    // Get inventory summary using raw SQL for better performance
    const inventoryQuery = `
      SELECT 
        p.item_name,
        SUM(p.quantity) as total_purchased,
        SUM(p.remaining_quantity) as current_stock,
        SUM(p.quantity - p.remaining_quantity) as total_issued,
        AVG(p.rate) as average_rate,
        SUM(p.quantity * p.rate) as total_value,
        SUM(p.remaining_quantity * p.rate) as current_value,
        MIN(p.purchase_date) as first_purchase_date,
        MAX(p.purchase_date) as last_purchase_date,
        COUNT(DISTINCT p.id) as purchase_batches
      FROM purchase p
      ${item_name ? `WHERE p.item_name LIKE '%${item_name}%'` : ''}
      GROUP BY p.item_name
      ORDER BY p.item_name
    `;

    const [inventorySummary] = await sequelize.query(inventoryQuery);

    // Get low stock items (items with remaining quantity < 10% of total purchased)
    const lowStockQuery = `
      SELECT 
        p.item_name,
        SUM(p.quantity) as total_purchased,
        SUM(p.remaining_quantity) as current_stock,
        ROUND((SUM(p.remaining_quantity) / SUM(p.quantity)) * 100, 2) as stock_percentage
      FROM purchase p
      GROUP BY p.item_name
      HAVING stock_percentage < 10
      ORDER BY stock_percentage ASC
    `;

    const [lowStockItems] = await sequelize.query(lowStockQuery);

    res.json({
      success: true,
      data: {
        inventory_summary: inventorySummary,
        low_stock_alerts: lowStockItems,
        summary_stats: {
          total_items: inventorySummary.length,
          low_stock_items: lowStockItems.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory summary',
      error: error.message
    });
  }
};

const getItemHistory = async (req, res) => {
  try {
    const { item_name } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!item_name) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      });
    }

    const offset = (page - 1) * limit;

    // Get purchase history
    const purchases = await Purchase.findAll({
      where: { item_name },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    // Get issue history
    const issues = await Issue.findAll({
      where: { item_name },
      include: [
        {
          model: Transaction,
          as: 'transaction',
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        },
        {
          model: Purchase,
          as: 'purchase'
        },
        {
          model: Member,
          as: 'member'
        }
      ],
      order: [['issue_date', 'DESC']]
    });

    // Combine and sort all transactions
    const allTransactions = [
      ...purchases.map(p => ({
        type: 'purchase',
        date: p.purchase_date,
        quantity: p.quantity,
        remaining_quantity: p.remaining_quantity,
        rate: p.rate,
        member: p.transaction.member,
        details: p
      })),
      ...issues.map(i => ({
        type: 'issue',
        date: i.issue_date,
        quantity: i.quantity,
        member: i.member,
        purchase_info: i.purchase,
        details: i
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Paginate results
    const paginatedTransactions = allTransactions.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        item_name,
        transactions: paginatedTransactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(allTransactions.length / limit),
          total_records: allTransactions.length,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching item history',
      error: error.message
    });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;

    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `AND t.transaction_date BETWEEN '${start_date}' AND '${end_date}'`;
    }

    let typeFilter = '';
    if (type && ['purchase', 'issue'].includes(type)) {
      typeFilter = `AND t.type = '${type}'`;
    }

    // Get transaction summary
    const summaryQuery = `
      SELECT 
        t.type,
        COUNT(*) as transaction_count,
        DATE(t.transaction_date) as transaction_date,
        m.name as member_name,
        m.type as member_type
      FROM transactions t
      JOIN members m ON t.member_id = m.id
      WHERE 1=1 ${dateFilter} ${typeFilter}
      GROUP BY t.type, DATE(t.transaction_date), m.id
      ORDER BY t.transaction_date DESC, t.type
    `;

    const [transactionSummary] = await sequelize.query(summaryQuery);

    // Get value summary for purchases
    const valueQuery = `
      SELECT 
        DATE(p.purchase_date) as purchase_date,
        SUM(p.quantity * p.rate) as total_value,
        COUNT(*) as purchase_count
      FROM purchase p
      JOIN transactions t ON p.transaction_id = t.id
      WHERE 1=1 ${dateFilter.replace('t.transaction_date', 'p.purchase_date')}
      GROUP BY DATE(p.purchase_date)
      ORDER BY p.purchase_date DESC
    `;

    const [valueSummary] = await sequelize.query(valueQuery);

    res.json({
      success: true,
      data: {
        transaction_summary: transactionSummary,
        value_summary: valueSummary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction summary',
      error: error.message
    });
  }
};

const getStockCombo = async (req, res) => {
  try {
    // Get value summary for purchases
    const valueQuery = `     
		SELECT 
            0 as id,
            item_name,
            sum(remaining_quantity) as remaining_quantity
        FROM
            inventory_management.purchase
        group by
            item_name
            having sum(remaining_quantity) > 0
        ORDER BY
            item_name,  id

    `;

    const [valueSummary] = await sequelize.query(valueQuery);

    res.json({
      success: true,
      data: {
        stock_combo: valueSummary,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating stock combo',
      error: error.message
    });
  }
};

module.exports = {
  getInventorySummary,
  getItemHistory,
  getTransactionSummary,
  getStockCombo
};