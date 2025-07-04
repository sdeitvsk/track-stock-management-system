
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
      searchFilter = dateFilter ? searchCondition : `WHERE (m.name LIKE '%${search}%' OR t.invoice_no LIKE '%${search}%' OR ir.purpose LIKE '%${search}%')`;
    }

    const query = `
      WITH t1 AS (
        SELECT t.id, t.member_id, m.name, t.invoice_no, t.type, t.invoice_date 
        FROM inventory_management.transactions t 
        JOIN inventory_management.members m ON t.member_id = m.id 
        UNION
        SELECT id, member_id, department, purpose as invoice_no, status as type, approved_date as invoice_date 
        FROM inventory_management.indent_requests ir
        WHERE status='approved'
      ) 
      SELECT * FROM t1 
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
      WITH tiu AS (
        SELECT i.purchase_id, i.quantity FROM issue i
        ${as_on_date ? `WHERE i.issue_date <= '${as_on_date}'` : ''}
        UNION 
        SELECT iri.purchase_id, iri.approved_quantity 
        FROM indent_request_items iri
        JOIN indent_requests ir ON iri.indent_request_id = ir.id
        ${as_on_date ? `WHERE ir.approved_date <= '${as_on_date}'` : ''}
      ), 
      TotalIssues AS (
        SELECT purchase_id, SUM(quantity) as Total_issues 
        FROM tiu 
        GROUP BY purchase_id
      ) 
      SELECT p.id, p.item_name, p.quantity as Purchase, 
             COALESCE(ti.Total_issues, 0) as Total_issues, 
             p.remaining_quantity  
      FROM TotalIssues ti 
      RIGHT JOIN purchase p ON ti.purchase_id = p.id
      ${dateFilter} ${searchFilter}
      ORDER BY p.item_name
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
      WITH tiu AS (
        SELECT i.purchase_id, i.quantity 
        FROM issue i
        ${as_on_date ? `WHERE i.issue_date <= '${as_on_date}'` : ''}
        UNION 
        SELECT iri.purchase_id, iri.approved_quantity 
        FROM indent_request_items iri
        JOIN indent_requests ir ON iri.indent_request_id = ir.id
        ${as_on_date ? `WHERE ir.approved_date <= '${as_on_date}'` : ''}
      ), 
      TotalIssues AS (
        SELECT purchase_id, SUM(quantity) AS total_issues 
        FROM tiu 
        GROUP BY purchase_id
      )
      SELECT 
        p.item_name,
        SUM(p.quantity) AS total_purchase,
        SUM(COALESCE(ti.total_issues, 0)) AS total_issued,
        SUM(p.remaining_quantity) AS total_balance
      FROM purchase p
      LEFT JOIN TotalIssues ti ON ti.purchase_id = p.id
      ${dateFilter} ${searchFilter}
      GROUP BY p.item_name
      ORDER BY p.item_name
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

module.exports = {
  getTotalTransactions,
  getStockBalanceDetailed,
  getStockBalanceSummary
};
