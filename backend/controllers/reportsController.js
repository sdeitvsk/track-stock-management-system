
const { sequelize } = require('../config/database');

const getTotalTransactions = async (req, res) => {
  try {
    const { start_date, end_date, search } = req.query;

    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `WHERE (t.invoice_date BETWEEN '${start_date}' AND '${end_date}' OR ir.approved_date BETWEEN '${start_date}' AND '${end_date}')`;
    }

    let searchFilter = '';
    if (search) {
      const searchCondition = `AND (m.name LIKE '%${search}%' OR t.invoice_no LIKE '%${search}%' OR ir.purpose LIKE '%${search}%')`;
      searchFilter = dateFilter ? searchCondition : `WHERE (m.name LIKE '%${search}%' OR t.invoice_no LIKE '%${search}%')`;
    }

    const query = `
      SELECT t.id, t.member_id, m.name, t.invoice_no, t.type, t.invoice_date
        FROM inventory_management.transactions t
        JOIN inventory_management.members m ON t.member_id = m.id
      ${dateFilter} ${searchFilter}
      ORDER BY invoice_date DESC
    `;

    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: {
        transactions: results,
        total_count: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching total transactions report',
      error: error.message
    });
  }
};

const getStockBalanceDetailed = async (req, res) => {
  try {
    const { as_on_date, search } = req.query;

    let dateFilter = '';
    if (as_on_date) {
      dateFilter = `WHERE p.purchase_date <= '${as_on_date}'`;
    }

    let searchFilter = '';
    if (search) {
      const searchCondition = `${dateFilter ? 'AND' : 'WHERE'} p.item_name LIKE '%${search}%'`;
      searchFilter = searchCondition;
    }

    const query = `
      SELECT id, item_name, total_purchased as Purchase, 
              total_issued  as Total_issues, 
             if(remaining_quantity<0,0,remaining_quantity)   as  remaining_quantity 
      FROM v_Current_StockBalance 
       ${searchFilter}
      ORDER BY item_name
    `;

    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: {
        stock_details: results,
        total_count: results.length,
        as_on_date: as_on_date || new Date().toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stock balance detailed report',
      error: error.message
    });
  }
};

const getStockBalanceSummary = async (req, res) => {
  try {
    const { as_on_date, search } = req.query;

    let dateFilter = '';
    if (as_on_date) {
      dateFilter = `WHERE p.purchase_date <= '${as_on_date}'`;
    }

    let searchFilter = '';
    if (search) {
      const searchCondition = `${dateFilter ? 'AND' : 'WHERE'} p.item_name LIKE '%${search}%'`;
      searchFilter = searchCondition;
    }

    const query = `     

       SELECT  item_name, total_purchased  as total_purchase, 
              total_issued , 
             if(remaining_quantity<0,0,remaining_quantity)   as total_balance
      FROM v_Current_StockBalance 
       ${searchFilter}
       ORDER BY item_name
    `;

    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: {
        stock_summary: results,
        total_count: results.length,
        as_on_date: as_on_date || new Date().toISOString().split('T')[0]
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stock balance summary report',
      error: error.message
    });
  }
};

const getItemsIssued = async (req, res) => {
  try {
    const { start_date, end_date, search } = req.query;

    let dateFilter = '';
    if (start_date && end_date) {
      dateFilter = `WHERE (i.issue_date BETWEEN '${start_date}' AND '${end_date}')`;
    }

    let searchFilter = '';
    if (search) {
      const searchCondition = `${dateFilter ? 'AND' : 'WHERE'} i.item_name LIKE '%${search}%' OR m.name LIKE '%${search}%'`;
      searchFilter = searchCondition;
    }

    const query = `
      SELECT i.item_name, i.quantity, i.issue_date, m.name from issue i JOIN members m ON i.member_id = m.id ${dateFilter} ${searchFilter}
      ORDER BY i.issue_date DESC

      SELECT
        iri.item_id,
        iri.item_name,
        SUM(iri.approved_quantity) AS issued
    FROM
        indent_request_items iri
    WHERE
        iri.approved_quantity > 0
    GROUP BY
        iri.item_id,
        iri.item_name
    UNION ALL
    SELECT
        item_id,
        item_name,
        SUM(quantity) AS issued
    FROM
        issue
    GROUP BY
        item_id,
        item_name
    `

    console.log(query);

    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: {
        items_issued: results,
        total_count: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items issued report',
      error: error.message
    });
  }
}

const getPendingItems = async (req, res) => {
  try {
    const { start_date, end_date, search } = req.query;

    const query = `
    
    WITH Tissues AS (
      SELECT  i.quantity, i.purchase_id, t.indent_request_id,  p.item_id, t.transaction_date
        FROM issue i JOIN transactions t ON i.transaction_id = t.id
        JOIN purchase p ON i.purchase_id = p.id
      ) SELECT  iri.indent_request_id, ir.department, ir.requested_date, iri.item_name, iri.quantity requested, T.quantity  Issued,  iri.quantity - IFNULL(T.quantity,0) pending, T.transaction_date 
          FROM indent_request_items iri LEFT JOIN Tissues T ON iri.indent_request_id = T.indent_request_id AND iri.item_id = T.item_id
          join indent_requests ir ON iri.indent_request_id = ir.id
    `
    const [results] = await sequelize.query(query);

    res.json({
      success: true,
      data: {
        pending_items: results,
        total_count: results.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending items report',
      error: error.message
    });
  }
}

module.exports = {
  getTotalTransactions,
  getStockBalanceDetailed,
  getStockBalanceSummary,
  getItemsIssued,
  getPendingItems
};
