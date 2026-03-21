const { getDatabase } = require('../config/database');
const { askAiLegalAssistant } = require('../services/aiLegalAssistantGroq');

const getFilters = (req) => {

  const { role, id } = req.user;
  const { status, date_from, date_to, case_type, priority, lawyer_id } = req.query;

  // STRICT REQUIREMENT: Only show live data. Exclude Deleted/Archived.
  let whereClause = "status NOT IN ('Archived', 'Deleted')";
  const params = [];

  // Role Constraints
  if (role === 'lawyer') {
    whereClause += ' AND lawyer_id = ?';
    params.push(id);
  } else if (role === 'user') {
    whereClause += ' AND user_id = ?';
    params.push(id);
  }

  // Advanced Filters
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  if (case_type) {
    whereClause += ' AND case_type LIKE ?';
    params.push(`%${case_type}%`);
  }
  if (priority) {
    whereClause += ' AND priority = ?';
    params.push(priority);
  }
  if (date_from) {
    whereClause += ' AND created_at >= ?';
    params.push(date_from);
  }
  if (date_to) {
    whereClause += ' AND created_at <= ?';
    params.push(date_to);
  }
  // Admin filtering by lawyer
  if (lawyer_id && role === 'admin') {
    whereClause += ' AND lawyer_id = ?';
    params.push(lawyer_id);
  }

  return { whereClause, params };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) throw new Error("Database disconnected");

    const { whereClause, params } = getFilters(req);

    // 1. Total Cases (Live only)
    const [totalCases] = await db.query(`SELECT COUNT(*) as count FROM cases WHERE ${whereClause}`, params);

    // 2. Active Cases (Pending, In Progress, etc - Not closed)
    const [activeCases] = await db.query(`SELECT COUNT(*) as count FROM cases WHERE ${whereClause} AND status NOT IN ('Closed', 'Resolved')`, params);

    // 3. Pending Hearings
    const [pendingHearings] = await db.query(`
            SELECT COUNT(*) as count 
            FROM case_hearings h
            JOIN cases c ON h.case_id = c.id
            WHERE h.hearing_date >= CURDATE() AND ${whereClause}
        `, params);

    // 4. Closed Cases
    const [closedCases] = await db.query(`SELECT COUNT(*) as count FROM cases WHERE ${whereClause} AND status = 'Closed'`, params);

    // 5. New Cases This Month
    const [newCases] = await db.query(`
             SELECT COUNT(*) as count 
             FROM cases 
             WHERE ${whereClause} 
             AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        `, params);

    res.json({
      success: true,
      data: {
        total_cases: totalCases[0].count,
        active_cases: activeCases[0].count,
        pending_hearings: pendingHearings[0].count,
        closed_cases: closedCases[0].count,
        new_cases_this_month: newCases[0].count
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCaseReports = async (req, res) => {
  try {
    const db = getDatabase();
    const { whereClause, params } = getFilters(req);

    // 1. Cases by Status
    const [byStatus] = await db.query(`SELECT status, COUNT(*) as count FROM cases WHERE ${whereClause} GROUP BY status`, params);

    // 2. Cases by Type
    const [byType] = await db.query(`SELECT case_type, COUNT(*) as count FROM cases WHERE ${whereClause} GROUP BY case_type`, params);

    // 3. Cases by Court
    const [byCourt] = await db.query(`SELECT court_name, COUNT(*) as count FROM cases WHERE ${whereClause} GROUP BY court_name`, params);

    // 4. Aging Report
    const [aging] = await db.query(`
            SELECT 
                CASE 
                    WHEN DATEDIFF(NOW(), created_at) < 30 THEN '< 30 Days'
                    WHEN DATEDIFF(NOW(), created_at) BETWEEN 30 AND 90 THEN '30-90 Days'
                    WHEN DATEDIFF(NOW(), created_at) BETWEEN 91 AND 180 THEN '90-180 Days'
                    ELSE '> 180 Days'
                END as age_bucket,
                COUNT(*) as count
            FROM cases
            WHERE ${whereClause}
            GROUP BY age_bucket
        `, params);

    // 5. Monthly Created Cases Trend
    const [monthlyCreated] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
            FROM cases
            WHERE ${whereClause} AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month ASC
        `, params);

    res.json({
      success: true,
      data: {
        by_status: byStatus,
        by_type: byType,
        by_court: byCourt,
        aging: aging,
        monthly_created: monthlyCreated
      }
    });

  } catch (error) {
    console.error('Error fetching case reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRawCases = async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) throw new Error("Database disconnected");

    const { whereClause, params } = getFilters(req);

    // Fetch raw cases with counts for updates and documents using subqueries for accuracy
    const sql = `
            SELECT 
                c.id, 
                c.title, 
                c.case_number, 
                c.status, 
                c.priority, 
                c.created_at,
                c.lawyer_id,
                (SELECT COUNT(*) FROM case_updates WHERE case_id = c.id) as total_updates,
                (SELECT COUNT(*) FROM case_documents WHERE case_id = c.id) as total_documents
            FROM cases c
            WHERE ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT 500
        `;

    const [rows] = await db.query(sql, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching raw cases:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getHearingReports = async (req, res) => {
  try {
    const db = getDatabase();
    const { whereClause, params } = getFilters(req);

    // 1. Upcoming Hearings
    const [upcoming] = await db.query(`
            SELECT h.id, h.hearing_date, h.purpose, c.case_number, c.title
            FROM case_hearings h
            JOIN cases c ON h.case_id = c.id
            WHERE h.hearing_date >= CURDATE() AND ${whereClause}
            ORDER BY h.hearing_date ASC
            LIMIT 10
        `, params);

    // 2. Monthly Trend
    const [monthlyTrend] = await db.query(`
            SELECT DATE_FORMAT(hearing_date, '%Y-%m') as month, COUNT(*) as count
            FROM case_hearings h
            JOIN cases c ON h.case_id = c.id
            WHERE h.hearing_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND ${whereClause}
            GROUP BY month
            ORDER BY month ASC
        `, params);

    res.json({
      success: true,
      data: {
        upcoming,
        monthly_trend: monthlyTrend
      }
    });
  } catch (error) {
    console.error('Error fetching hearing reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAdvocatePerformance = async (req, res) => {
  try {
    const db = getDatabase();
    const { role, id } = req.user;
    const params = [];

    // Filter Deleted/Archived cases from stats
    let sql = `
            SELECT 
                u.name as advocate_name,
                u.id as lawyer_id,
                COUNT(c.id) as total_cases,
                SUM(CASE WHEN c.status = 'Closed' THEN 1 ELSE 0 END) as closed_cases,
                SUM(CASE WHEN c.status NOT IN ('Closed', 'Resolved', 'Archived', 'Deleted') THEN 1 ELSE 0 END) as active_cases,
                0 as rating -- Rating system not yet implemented, explicitly returning 0 to avoid fake data
            FROM users u
            JOIN cases c ON u.id = c.lawyer_id
            WHERE u.role = 'lawyer' AND c.status NOT IN ('Archived', 'Deleted')
        `;

    if (role === 'lawyer') {
      sql += ` AND u.id = ?`;
      params.push(id);
    }

    sql += ` GROUP BY u.id`;

    const [performance] = await db.query(sql, params);

    res.json({
      success: true,
      data: performance // Now returns real DB counts only
    });

  } catch (error) {
    console.error('Error fetching advocate reports:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const db = getDatabase();
    if (!db) throw new Error("Database disconnected");

    const userId = req.user.id;

    // 1. Cases Created
    const [cases] = await db.query(`
      SELECT 'case_created' as activity_type, title as description, created_at as timestamp 
      FROM cases 
      WHERE user_id = ? AND status NOT IN ('Archived', 'Deleted')
    `, [userId]);

    // 2. Bookings Made
    const [bookings] = await db.query(`
      SELECT 'booking_created' as activity_type, CONCAT(booking_type, ' Consultation') as description, created_at as timestamp 
      FROM bookings 
      WHERE user_id = ?
    `, [userId]);

    // 3. User Documents (Vault)
    let docs = [];
    try {
      const [d] = await db.query(`
          SELECT 'document_uploaded' as activity_type, title as description, created_at as timestamp 
          FROM user_documents 
          WHERE user_id = ?
        `, [userId]);
      docs = d;
    } catch (e) {
      console.warn("User documents fetch failed", e.message);
    }

    // Combine and Sort
    const allActivity = [...cases, ...bookings, ...docs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: allActivity
    });

  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCaseIntelligenceReport = async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const [existingReports] = await db.query(
      'SELECT * FROM case_intelligence WHERE case_id = ? ORDER BY analysis_date DESC LIMIT 1',
      [id]
    );

    let reportData = null;
    let generatedAt = new Date();

    if (existingReports.length > 0) {
      reportData = existingReports[0].report_data;
      generatedAt = existingReports[0].analysis_date;

      if (typeof reportData === 'string') {
        try { reportData = JSON.parse(reportData); } catch (e) { }
      }
    }

    // Get basic stats anyway
    const [hearings] = await db.query('SELECT hearing_date, purpose, notes FROM case_hearings WHERE case_id = ?', [id]);
    const [documents] = await db.query('SELECT file_name FROM case_documents WHERE case_id = ?', [id]);

    const stats = {
      total_hearings: hearings.length,
      total_documents: documents.length,
      adjournment_count: hearings.filter(h => h.notes && h.notes.toLowerCase().includes('adjourn')).length
    };

    if (reportData) {
      return res.json({
        success: true,
        data: {
          case_id: id,
          generated_at: generatedAt,
          report: reportData,
          stats
        }
      });
    }

    return res.json({
      success: false,
      message: 'No report generated yet',
      data: {
        case_id: id,
        report: null,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching intelligence report:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.generateCaseIntelligenceReport = async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    let { data } = req.body;

    let additionalData = {};
    try {
      additionalData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      console.error("Failed to parse request body data", e);
    }

    const [cases] = await db.query('SELECT * FROM cases WHERE id = ?', [id]);
    if (cases.length === 0) return res.status(404).json({ success: false, message: 'Case not found' });
    const caseDetails = cases[0];

    const [hearings] = await db.query('SELECT hearing_date, purpose, notes FROM case_hearings WHERE case_id = ?', [id]);
    const [documents] = await db.query('SELECT file_name, file_type FROM case_documents WHERE case_id = ?', [id]);

    const newFiles = req.files ? req.files.map(f => f.originalname).join(', ') : '';

    const aiInput = [
      {
        role: 'user',
        content: `
          CASE CONTEXT:
          Title: ${caseDetails.title}
          Type: ${caseDetails.case_type}
          Court: ${caseDetails.court_name}
          Details: ${caseDetails.description}
          Background: ${additionalData.summary || 'N/A'}
          Key Issues: ${additionalData.key_issues || 'N/A'}
          
          PARTIES:
          Opponent: ${caseDetails.opponent_name}
          Opponent Lawyer: ${caseDetails.opponent_lawyer}
          Plaintiff Details: ${additionalData.plaintiff_details || 'N/A'}
          Defendant Details: ${additionalData.defendant_details || 'N/A'}

          EVIDENCE & DOCUMENTS:
          Existing Documents: ${documents.map(d => d.file_name).join(', ')}
          Newly Uploaded: ${newFiles}

          HEARING HISTORY:
          ${hearings.map(h => {
          const d = h.hearing_date instanceof Date ? h.hearing_date : new Date(h.hearing_date);
          return `${d.toISOString().split('T')[0]}: ${h.purpose}`;
        }).join('\n')}
          
          STAGE: ${additionalData.current_stage || caseDetails.status}
        `
      }
    ];

    console.log("SENDING TO AI...", aiInput[0].content.substring(0, 200));

    const aiResponse = await askAiLegalAssistant(aiInput, 'CASE_INTELLIGENCE_REPORT');
    let aiReportStr = aiResponse.reply || "";
    aiReportStr = aiReportStr.replace(/```json/g, '').replace(/```/g, '').trim();

    let aiReport;
    try {
      // Find JSON block if it exists
      const jsonMatch = aiReportStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiReport = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (e) {
      console.error("AI JSON parse error:", e.message);
      aiReport = {
        case_overview_summary: aiReportStr || "Analysis failed to parse correctly.",
        risk_analysis: { risk_level: "High", risk_score: 80, risk_factors: ["Complexity High", "Parsing Error"] }
      };
    }

    const riskScore = aiReport.risk_analysis?.risk_score || 0;
    const summary = aiReport.case_overview_summary || 'No summary generated';

    await db.query(`
      INSERT INTO case_intelligence (case_id, report_data, risk_score, summary, analysis_date)
      VALUES (?, ?, ?, ?, NOW())
    `, [id, JSON.stringify(aiReport), riskScore, summary]);

    res.json({
      success: true,
      data: {
        case_id: id,
        generated_at: new Date(),
        report: aiReport
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
