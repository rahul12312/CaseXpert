// ============================================================================
// Case Model - Database operations for cases
// ============================================================================

const { getDatabase } = require('../config/database');

class Case {
  /**
   * Create a new case with initial timeline and activity
   */
  static async create(caseData, userName) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert case
      // Insert case - ONLY fields that exist in actual database schema
      const [result] = await connection.query(
        `INSERT INTO cases (
            user_id, lawyer_id, title, description, case_number, 
            case_type, priority, status, court_name, filing_date, 
            opponent_name, opponent_lawyer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        caseData.user_id,
        caseData.lawyer_id || null,
        caseData.title,
        caseData.description || 'Case description', // description is NOT NULL in DB
        caseData.case_number,
        caseData.case_type || 'other',
        caseData.priority || 'medium',
        'pending', // Status
        caseData.court_name || null,
        caseData.filing_date || null,
        caseData.opponent_name || null,
        caseData.opponent_lawyer || null
      ]
      );

      const caseId = result.insertId;

      // Add initial timeline entry
      await connection.query(
        `INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
         VALUES (?, ?, ?, 'case-created', CURDATE())`,
        [caseId, 'Case Created', `Case "${caseData.title}" was created`]
      );

      // Add initial activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, 'user', 'create')`,
        [caseId, `Case created: ${caseData.title}`, userName || 'User']
      );

      await connection.commit();
      return caseId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all cases for a USER (their private case tracker)
   * Returns ALL cases created by the user regardless of assignment_status
   */
  static async getUserCases(userId) {
    console.log(`🔍 Fetching USER cases for user_id = ${userId}`);

    try {
      const [cases] = await getDatabase().query(
        `SELECT 
          c.*,
          u.name AS user_name,
          lu.name AS lawyer_name,
          (SELECT COUNT(*) FROM case_documents WHERE case_id = c.id) AS document_count,
          (SELECT COUNT(*) FROM case_updates WHERE case_id = c.id) AS update_count,
          (SELECT timestamp FROM case_activities WHERE case_id = c.id ORDER BY timestamp DESC LIMIT 1) AS last_activity,
          (SELECT hearing_date FROM case_hearings WHERE case_id = c.id AND hearing_date >= NOW() ORDER BY hearing_date ASC LIMIT 1) AS next_hearing
         FROM cases c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN lawyers l ON c.lawyer_id = l.id
         LEFT JOIN users lu ON l.user_id = lu.id
         WHERE c.user_id = ? AND c.status != 'archived'
         ORDER BY c.updated_at DESC`,
        [parseInt(userId)]
      );

      console.log(`✅ Found ${cases.length} USER cases (all personal tracking cases)`);
      return cases;
    } catch (error) {
      console.error('❌ Error fetching user cases:', error.message);
      throw error;
    }
  }

  /**
   * Get ACCEPTED cases for a LAWYER (professional work only)
   * CRITICAL: Only returns cases where assignment_status = 'ACCEPTED'
   */
  static async getLawyerAcceptedCases(lawyerId) {
    console.log(`🔍 Fetching ACCEPTED cases for lawyer_id = ${lawyerId}`);

    try {
      const [cases] = await getDatabase().query(
        `SELECT 
          c.*,
          u.name AS user_name,
          u.email AS user_email,
          u.phone AS user_phone,
          (SELECT COUNT(*) FROM case_documents WHERE case_id = c.id) AS document_count,
          (SELECT COUNT(*) FROM case_updates WHERE case_id = c.id) AS update_count,
          (SELECT timestamp FROM case_activities WHERE case_id = c.id ORDER BY timestamp DESC LIMIT 1) AS last_activity,
          (SELECT hearing_date FROM case_hearings WHERE case_id = c.id AND hearing_date >= NOW() ORDER BY hearing_date ASC LIMIT 1) AS next_hearing
         FROM cases c
         JOIN users u ON c.user_id = u.id
         WHERE c.lawyer_id = ? 
         AND c.assignment_status = 'ACCEPTED'
         AND c.status != 'archived'
         ORDER BY c.updated_at DESC`,
        [parseInt(lawyerId)]
      );

      console.log(`✅ Found ${cases.length} ACCEPTED lawyer cases (professional work only)`);
      return cases;
    } catch (error) {
      console.error('❌ Error fetching lawyer accepted cases:', error.message);
      throw error;
    }
  }

  /**
   * Get PENDING case requests for a lawyer to accept/reject
   */
  static async getLawyerCaseRequests(lawyerId) {
    console.log(`🔍 Fetching PENDING case requests for lawyer_id = ${lawyerId}`);

    try {
      const [cases] = await getDatabase().query(
        `SELECT 
          c.*,
          u.name AS user_name,
          u.email AS user_email,
          u.phone AS user_phone
         FROM cases c
         JOIN users u ON c.user_id = u.id
         WHERE c.lawyer_id = ? 
         AND c.assignment_status = 'REQUESTED'
         AND c.status != 'archived'
         ORDER BY c.created_at DESC`,
        [parseInt(lawyerId)]
      );

      console.log(`✅ Found ${cases.length} PENDING case requests`);
      return cases;
    } catch (error) {
      console.error('❌ Error fetching case requests:', error.message);
      throw error;
    }
  }

  /**
   * Get all cases in the system (for admin/testing)
   */
  static async getAll() {
    try {
      const [cases] = await getDatabase().query(
        `SELECT 
          c.*,
          u.name AS user_name,
          u.email AS user_email,
          lu.name AS lawyer_name
         FROM cases c
         LEFT JOIN users u ON c.user_id = u.id
         LEFT JOIN lawyers l ON c.lawyer_id = l.id
         LEFT JOIN users lu ON l.user_id = lu.id
         WHERE c.status != 'archived'
         ORDER BY c.created_at DESC`
      );
      return cases;
    } catch (error) {
      console.error('❌ Error fetching all cases:', error.message);
      throw error;
    }
  }

  /**
   * Seed sample cases (frontend-focused testing)
   */
  static async seedSampleCases(sampleCases, defaultUserId = 2, defaultLawyerId = 1) {
    const pool = getDatabase();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let insertedCount = 0;
        for (const c of sampleCases) {
            // Check if this specific case already exists to avoid duplicates
            const [existing] = await connection.query('SELECT id FROM cases WHERE case_number = ?', [c.caseId]);
            if (existing.length > 0) continue;
            // Map Status
            let dbStatus = 'open';
            if (c.caseStatus.toLowerCase().includes('hearing')) dbStatus = 'hearing-scheduled';
            else if (c.caseStatus.toLowerCase().includes('progress')) dbStatus = 'in-progress';
            else if (c.caseStatus.toLowerCase().includes('review')) dbStatus = 'pending';
            else if (c.caseStatus.toLowerCase().includes('filed')) dbStatus = 'open';

            await connection.query(
                `INSERT INTO cases (
                    user_id, lawyer_id, case_number, title, description, 
                    case_type, priority, status, assignment_status, 
                    court_name, filing_date, next_hearing_date, 
                    opponent_name, opponent_lawyer,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    defaultUserId,
                    defaultLawyerId,
                    c.caseId,
                    c.caseTitle,
                    c.caseDescription,
                    c.caseType.toLowerCase(),
                    'medium',
                    dbStatus,
                    'ACCEPTED',
                    c.courtName,
                    c.filingDate,
                    c.nextHearingDate,
                    c.opponentName || 'N/A',
                    c.opponentLawyer || 'N/A'
                ]
            );
        }

        await connection.commit();
        return { success: true, count: sampleCases.length };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  /**
   * Delete a case permanently (Hard Delete)
   */
  static async deletePermanently(caseId) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      
      // Delete child records first to satisfy foreign key constraints if any
      await connection.query('DELETE FROM case_timeline WHERE case_id = ?', [caseId]);
      await connection.query('DELETE FROM case_activities WHERE case_id = ?', [caseId]);
      await connection.query('DELETE FROM case_updates WHERE case_id = ?', [caseId]);
      await connection.query('DELETE FROM case_documents WHERE case_id = ?', [caseId]);
      await connection.query('DELETE FROM case_hearings WHERE case_id = ?', [caseId]);
      
      // Delete the case itself
      const [result] = await connection.query('DELETE FROM cases WHERE id = ?', [caseId]);
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


  /**
   * DEPRECATED: Old method - use getUserCases() or getLawyerAcceptedCases() instead
   * Kept for backward compatibility but will be removed
   */
  static async getByUserId(userId, role = 'user') {
    console.warn('⚠️  getByUserId is deprecated. Use getUserCases() or getLawyerAcceptedCases() instead');

    if (role === 'user' || role === 'client') {
      return this.getUserCases(userId);
    } else if (role === 'lawyer') {
      // For lawyers, this needs the lawyer record ID, not user ID
      // This method is being phased out
      const [lawyers] = await getDatabase().query(
        'SELECT id FROM lawyers WHERE user_id = ?',
        [userId]
      );

      if (lawyers.length > 0) {
        return this.getLawyerAcceptedCases(lawyers[0].id);
      }
      return [];
    }

    return [];
  }

  /**
   * Get case details with all related data
   */
  static async getById(caseId) {
    const [cases] = await getDatabase().query(
      `SELECT 
        c.*,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        lu.name AS lawyer_name,
        lu.email AS lawyer_email,
        lu.phone AS lawyer_phone,
        l.specialization AS lawyer_specialization
       FROM cases c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN lawyers l ON c.lawyer_id = l.id
       LEFT JOIN users lu ON l.user_id = lu.id
       WHERE c.id = ?`,
      [caseId]
    );

    if (cases.length === 0) {
      return null;
    }

    const caseData = cases[0];

    // Get timeline
    const [timeline] = await getDatabase().query(
      `SELECT * FROM case_timeline WHERE case_id = ? ORDER BY event_date DESC, created_at DESC`,
      [caseId]
    );

    // Get updates
    const [updates] = await getDatabase().query(
      `SELECT * FROM case_updates WHERE case_id = ? ORDER BY created_at DESC`,
      [caseId]
    );

    // Get documents
    const [documents] = await getDatabase().query(
      `SELECT * FROM case_documents WHERE case_id = ? ORDER BY uploaded_at DESC`,
      [caseId]
    );

    // Get activities
    const [activities] = await getDatabase().query(
      `SELECT * FROM case_activities WHERE case_id = ? ORDER BY timestamp DESC LIMIT 50`,
      [caseId]
    );

    // Get hearings
    const [hearings] = await getDatabase().query(
      `SELECT * FROM case_hearings WHERE case_id = ? ORDER BY hearing_date DESC`,
      [caseId]
    );

    return {
      ...caseData,
      timeline,
      updates,
      documents,
      activities,
      hearings
    };
  }

  /**
   * Update case details
   */
  static async update(caseId, updates, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const fields = [];
      const values = [];

      // Allow updating all fields
      const updateableFields = [
        'title', 'description', 'lawyer_id', 'priority', 'case_type',
        'court_name', 'filing_date', 'opponent_name', 'opponent_lawyer', 'case_number'
      ];

      for (const field of updateableFields) {
        if (updates[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      }

      if (fields.length === 0) {
        // No updates, just return true
        connection.release();
        return true;
      }

      values.push(caseId);

      await connection.query(
        `UPDATE cases SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'update')`,
        [caseId, 'Case details updated', actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ... existing methods for status update, etc need similar DB fix ...
  // To avoid cutting off the file, I will rewrite the rest of the file as well, assuming standard behavior from previous file content but with corrected DB calls.

  /**
   * Update case status
   */
  static async updateStatus(caseId, newStatus, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get current status
      const [cases] = await connection.query(
        'SELECT status, title FROM cases WHERE id = ?',
        [caseId]
      );

      if (cases.length === 0) {
        throw new Error('Case not found');
      }

      const oldStatus = cases[0].status;

      // Update status
      await connection.query(
        'UPDATE cases SET status = ? WHERE id = ?',
        [newStatus, caseId]
      );

      // Add timeline entry
      await connection.query(
        `INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
         VALUES (?, ?, ?, 'status-change', CURDATE())`,
        [caseId, 'Status Changed', `Status changed from "${oldStatus}" to "${newStatus}"`]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'status-change')`,
        [caseId, `Status changed to: ${newStatus}`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Add case update
   */
  static async addUpdate(caseId, updateData, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO case_updates (case_id, update_title, update_description, update_type, created_by, created_by_role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          caseId,
          updateData.update_title,
          updateData.update_description,
          updateData.update_type || 'general-update',
          actorName,
          actorRole
        ]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'update')`,
        [caseId, `Added update: ${updateData.update_title}`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Add document
   */
  static async addDocument(caseId, documentData, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO case_documents (case_id, file_name, original_name, file_url, file_type, file_size, uploaded_by, uploaded_by_role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          caseId,
          documentData.file_name,
          documentData.original_name,
          documentData.file_url,
          documentData.file_type,
          documentData.file_size,
          actorName,
          actorRole
        ]
      );

      // Add timeline entry
      await connection.query(
        `INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
         VALUES (?, ?, ?, 'document-upload', CURDATE())`,
        [caseId, 'Document Uploaded', `Document "${documentData.original_name}" was uploaded`]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'document-upload')`,
        [caseId, `Uploaded document: ${documentData.original_name}`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(documentId, caseId, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get document info for logging
      const [documents] = await connection.query(
        'SELECT original_name FROM case_documents WHERE id = ? AND case_id = ?',
        [documentId, caseId]
      );

      if (documents.length === 0) {
        throw new Error('Document not found');
      }

      const originalName = documents[0].original_name;

      await connection.query(
        'DELETE FROM case_documents WHERE id = ? AND case_id = ?',
        [documentId, caseId]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'document-delete')`,
        [caseId, `Deleted document: ${originalName}`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Rename document
   */
  static async renameDocument(documentId, caseId, newName, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get old name for log
      const [documents] = await connection.query(
        'SELECT original_name FROM case_documents WHERE id = ? AND case_id = ?',
        [documentId, caseId]
      );

      if (documents.length === 0) {
        throw new Error('Document not found');
      }

      const oldName = documents[0].original_name;

      await connection.query(
        'UPDATE case_documents SET original_name = ? WHERE id = ? AND case_id = ?',
        [newName, documentId, caseId]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'document-rename')`,
        [caseId, `Renamed document from "${oldName}" to "${newName}"`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(documentId) {
    const [documents] = await getDatabase().query(
      'SELECT * FROM case_documents WHERE id = ?',
      [documentId]
    );
    return documents.length > 0 ? documents[0] : null;
  }

  /**
   * Add timeline event
   */
  static async addTimelineEvent(caseId, eventData, actorName, actorRole) {
    const pool = getDatabase();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO case_timeline (case_id, event_title, event_description, event_type, event_date)
         VALUES (?, ?, ?, ?, ?)`,
        [
          caseId,
          eventData.event_title,
          eventData.event_description,
          eventData.event_type || 'other',
          eventData.event_date
        ]
      );

      // Add activity log
      await connection.query(
        `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'timeline-add')`,
        [caseId, `Added timeline event: ${eventData.event_title}`, actorName || 'User', actorRole]
      );

      await connection.commit();
      return true;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get activities for a case
   */
  static async getActivities(caseId, limit = 100) {
    const [activities] = await getDatabase().query(
      `SELECT * FROM case_activities WHERE case_id = ? ORDER BY timestamp DESC LIMIT ?`,
      [caseId, limit]
    );

    return activities;
  }

  /**
 * Archive (soft delete) a case
 */
  static async archive(caseId, actorName, actorRole) {
    const pool = getDatabase();

    try {
      // Simply update the status to archived
      await pool.query(
        'UPDATE cases SET status = "archived" WHERE id = ?',
        [caseId]
      );

      // Try to add activity log, but don't fail if it doesn't work
      try {
        await pool.query(
          `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
         VALUES (?, ?, ?, ?, 'delete')`,
          [caseId, 'Case archived', actorName || 'User', actorRole || 'user']
        );
      } catch (activityError) {
        console.log('   ⚠️ Could not log activity (non-critical):', activityError.message);
      }

      return true;

    } catch (error) {
      console.error('   ❌ Error in archive method:', error);
      throw error;
    }
  }

  /**
   * Check if user has access to case
   * Validates both ID matching and assignment status for lawyers
   */
  static async hasAccess(caseId, userId, role = 'user') {
    if (role === 'lawyer') {
      // 1. Get lawyer_id for this user
      const [lawyers] = await getDatabase().query(
        'SELECT id FROM lawyers WHERE user_id = ?',
        [userId]
      );
      
      if (lawyers.length === 0) return false;
      const lawyerId = lawyers[0].id;

      // 2. Check if case is assigned to this lawyer
      const [cases] = await getDatabase().query(
        `SELECT id FROM cases 
         WHERE id = ? 
         AND lawyer_id = ? 
         AND assignment_status IN ('ACCEPTED', 'REQUESTED')`,
        [caseId, lawyerId]
      );
      return cases.length > 0;
    } else {
      // Users can access their own cases
      const [cases] = await getDatabase().query(
        `SELECT id FROM cases WHERE id = ? AND user_id = ?`,
        [caseId, userId]
      );
      return cases.length > 0;
    }
  }
}

module.exports = Case;
