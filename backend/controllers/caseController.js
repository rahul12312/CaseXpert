// ============================================================================
// Case Controller - Business logic for case operations
// ============================================================================

const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const path = require('path');
const fs = require('fs').promises;
const { askAiLegalAssistant } = require('../services/aiLegalAssistantGroq');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

/**
 * Create a new case
 */
exports.createCase = async (req, res) => {
  try {
    console.log('\n📋 CREATE CASE REQUEST');
    console.log('   User:', req.user ? `${req.user.name} (${req.user.id})` : 'UNDEFINED');
    console.log('   Request Body:', JSON.stringify(req.body, null, 2));

    // CRITICAL: Ensure User ID exists
    if (!req.user || !req.user.id) {
      console.error('   ❌ CRITICAL ERROR: User ID missing from token');
      return res.status(401).json({
        success: false,
        errorCode: 'AUTH_ERROR',
        message: 'User authentication failed: ID missing from token'
      });
    }

    const {
      title, description, case_number, case_type, lawyer_id, priority,
      court_name, filing_date, opponent_name, opponent_lawyer
    } = req.body;

    // STEP 1: Field existence validation
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!case_number) missingFields.push('case_number');
    // case_type has a default 'other' if missing, so not strictly required but good to have
    // priority has a default 'medium'

    if (missingFields.length > 0) {
      console.error('   ❌ Validation Error: Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fieldErrors: missingFields.reduce((acc, field) => {
          acc[field] = 'This field is required';
          return acc;
        }, {})
      });
    }

    // STEP 2: Field format validation
    const fieldErrors = {};

    // Title validation (max 200 chars) -> Updated schema supports 500, but checking reasonable limit
    if (title.length > 500) {
      fieldErrors.title = 'Title must be less than 500 characters';
    }

    // Case type validation
    const validCaseTypes = ['civil', 'criminal', 'corporate', 'family', 'property', 'labor', 'consumer', 'other'];
    if (case_type && !validCaseTypes.includes(case_type.toLowerCase())) {
      // Just invalid entry, fallback to 'other' or warn? Let's warn.
      console.warn(`   ⚠️ Invalid case type '${case_type}', defaulting to 'other' if needed.`);
    }

    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Please check the following fields',
        fieldErrors
      });
    }

    // STEP 3: Validate lawyer if provided - AND STRICT CONSULTATION CHECK
    let verifiedLawyerId = null;
    if (lawyer_id) {
      const { getDatabase } = require('../config/database');
      const [lawyers] = await getDatabase().execute(`
        SELECT l.id, u.name, u.email, u.is_verified, u.is_active 
        FROM lawyers l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = ? AND u.user_type = 'lawyer'
      `, [lawyer_id]);

      if (lawyers.length > 0) {
        const lawyer = lawyers[0];
        if (lawyer.is_verified && lawyer.is_active) {

          // CRITICAL CHECK: Has the user completed a consultation with this lawyer?
          const [bookings] = await getDatabase().execute(`
             SELECT id FROM bookings 
             WHERE user_id = ? AND lawyer_id = ? AND status IN ('completed', 'confirmed')
             LIMIT 1
          `, [req.user.id, lawyer.id]);

          if (bookings.length > 0) {
            verifiedLawyerId = lawyer.id;
            console.log('   ✅ Lawyer verified AND Consultation Completed:', lawyer.name);
          } else {
            console.warn('   ⛔ Lawyer Assignment Rejected: No completed consultation found.');
            return res.status(403).json({
              success: false,
              errorCode: 'NO_COMPLETED_CONSULTATION',
              message: 'You cannot assign a case to this lawyer without a completed consultation first. Please book a consultation.'
            });
          }

        } else {
          console.warn('   ⚠️ Lawyer assigned but not verified/active. Ignoring lawyer assignment.');
        }
      } else {
        console.warn('   ⚠️ Lawyer ID provided but not found. Ignoring.');
      }
    }

    // STEP 4: Prepare case data - FORCE DEFAULTS
    const safeDescription = description && description.trim().length > 0
      ? description.trim()
      : `Case: ${title.trim()} (No description provided)`;

    const caseData = {
      user_id: req.user.id,
      lawyer_id: verifiedLawyerId,
      // If a lawyer is verified (meaning consultation completed), set status to REQUESTED so they see it
      // Otherwise default schema handles 'UNASSIGNED' (if lawyer_id is null)
      assignment_status: verifiedLawyerId ? 'REQUESTED' : 'UNASSIGNED',
      title: title.trim(),
      description: safeDescription, // description is NOT NULL in DB
      case_number: case_number.trim(),
      case_type: (case_type && validCaseTypes.includes(case_type.toLowerCase())) ? case_type.toLowerCase() : 'other',
      priority: (priority && ['low', 'medium', 'high', 'urgent'].includes(priority.toLowerCase())) ? priority.toLowerCase() : 'medium',
      court_name: court_name || null,
      filing_date: filing_date || null,
      opponent_name: opponent_name || null,
      opponent_lawyer: opponent_lawyer || null
    };

    console.log('   📝 Processed Case Data (With Assignment Status):', JSON.stringify(caseData, null, 2));

    // STEP 5: Create case in database
    // Note: Case.create needs to be updated to accept assignment_status or we need to pass it explicitly
    // Since Case.create currently uses a fixed INSERT list, we might need to update it or update the record immediately after.
    // For now, let's create it, then if lawyer_id is set, update the status.

    // Actually, Case.create model method defined in Step 44 only inserts specific fields.
    // We should update Case.create model to handle assignment_status OR update it right after.
    // Let's use the update approach to be safe without changing Model signature heavily right now.

    const caseId = await Case.create(caseData, req.user.name || 'User');

    if (verifiedLawyerId) {
      // Explicitly set assignment status since create() might fallback to default
      const { getDatabase } = require('../config/database');
      await getDatabase().execute(
        `UPDATE cases SET assignment_status = 'REQUESTED' WHERE id = ?`,
        [caseId]
      );
    }

    console.log('   ✅ Case created successfully with ID:', caseId);

    res.status(201).json({
      success: true,
      message: verifiedLawyerId ? 'Case created and request sent to lawyer' : 'Case created successfully',
      data: {
        case_id: caseId,
        case_number: caseData.case_number,
        title: caseData.title
      }
    });

  } catch (error) {
    console.error('   ❌ Error creating case:', error);
    // ... error handling code ...
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        errorCode: 'DUPLICATE_ENTRY',
        message: 'Case number already exists. Please use a unique case number.',
        fieldErrors: {
          case_number: 'This case number is already in use'
        }
      });
    }
    // Handle NOT NULL violations
    if (error.code === 'ER_BAD_NULL_ERROR') {
      // ... existing error logic ...
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get list of cases
 */
exports.getCaseList = async (req, res) => {
  try {
    console.log('\n📋 GET CASE LIST');
    console.log('   User:', req.user.id, 'Role:', req.user.role);

    let cases = [];
    if (req.user.role === 'lawyer') {
      const { getDatabase } = require('../config/database');
      const [lawyers] = await getDatabase().execute('SELECT id FROM lawyers WHERE user_id = ?', [req.user.id]);
      if (lawyers.length > 0) {
        cases = await Case.getLawyerAcceptedCases(lawyers[0].id);
      }
    } else {
      cases = await Case.getUserCases(req.user.id);
    }
    res.json({ success: true, data: cases });
  } catch (error) {
    console.error('   ❌ Error getting case list:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get case details
 */
exports.getCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    console.log('\n📋 GET CASE DETAILS');
    console.log('   Case ID:', caseId);

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const caseData = await Case.getById(caseId);
    if (!caseData) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    res.json({ success: true, data: caseData });
  } catch (error) {
    console.error('   ❌ Error getting case details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update case details
 */
exports.updateCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const updates = req.body;

    console.log('\n📋 UPDATE CASE');
    console.log('   Case ID:', caseId);
    console.log('   Updates:', req.body);

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    // IF ASSIGNING A LAWYER (lawyer_id is present and not null)
    if (updates.lawyer_id) {
      const { getDatabase } = require('../config/database');

      // Check for completed consultation
      const [bookings] = await getDatabase().execute(`
             SELECT id FROM bookings 
             WHERE user_id = ? AND lawyer_id = ? AND status = 'completed'
             LIMIT 1
        `, [req.user.id, updates.lawyer_id]);

      if (bookings.length === 0) {
        console.warn('   ⛔ Lawyer Assignment Rejected: No completed consultation found.');
        return res.status(403).json({
          success: false,
          errorCode: 'NO_COMPLETED_CONSULTATION',
          message: 'You cannot assign a case to this lawyer without a completed consultation first.'
        });
      }

      // If passed, we can allow the update. 
      // Also ensure assignment_status is set to REQUESTED if not already
      // But Case.update model might not handle assignment_status. 
      // We should execute a direct query for status update if lawyer is being changed.
      await getDatabase().execute(
        `UPDATE cases SET assignment_status = 'REQUESTED' WHERE id = ?`,
        [caseId]
      );
    }

    await Case.update(caseId, req.body, req.user.name, req.user.role);

    console.log('   ✅ Case updated');

    res.json({
      success: true,
      message: 'Case updated successfully'
    });

  } catch (error) {
    console.error('   ❌ Error updating case:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case',
      error: error.message
    });
  }
};

/**
 * Update case status
 */
exports.updateStatus = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { status } = req.body;

    console.log('\n📋 UPDATE CASE STATUS');
    console.log('   Case ID:', caseId);
    console.log('   New Status:', status);

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    await Case.updateStatus(caseId, status, req.user.name, req.user.role);

    // Trigger Twilio SMS and SendGrid Email notifications
    try {
      const caseDetails = await Case.getById(caseId);
      if (caseDetails) {
        await notificationService.triggerUpdateNotifications(
          caseDetails, 
          status, 
          `The status of your case has been updated to ${status} by ${req.user.name}.`
        );
      }
    } catch (notifyErr) {
      console.warn('   ⚠️ Notifications skipped:', notifyErr.message);
    }

    console.log('   ✅ Status updated and notifications triggered');

    res.json({
      success: true,
      message: 'Case status updated successfully and notifications sent'
    });

  } catch (error) {
    console.error('   ❌ Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update case status',
      error: error.message
    });
  }
};

/**
 * Add case update
 */
exports.addUpdate = async (req, res) => {
  try {
    const { case_id, update_title, update_description, update_type } = req.body;

    console.log('\n📋 ADD CASE UPDATE');
    console.log('   Case ID:', case_id);
    console.log('   Title:', update_title);

    if (!case_id || !update_title) {
      return res.status(400).json({
        success: false,
        message: 'Case ID and update title are required'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(case_id, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    await Case.addUpdate(
      case_id,
      { update_title, update_description, update_type },
      req.user.name,
      req.user.role
    );

    console.log('   ✅ Update added');

    res.json({
      success: true,
      message: 'Case update added successfully'
    });

  } catch (error) {
    console.error('   ❌ Error adding update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add case update',
      error: error.message
    });
  }
};

/**
 * Update case status and notify (Special endpoint requested)
 */
exports.updateStatusAndNotify = async (req, res) => {
  try {
    const { caseId, status, message } = req.body;

    console.log('\n📋 UPDATE STATUS AND NOTIFY');
    console.log('   Case ID:', caseId);
    console.log('   Status:', status);

    if (!caseId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Case ID and Status are required'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    // 1. Update status in database
    await Case.updateStatus(caseId, status, req.user.name, req.user.role);

    // 2. Fetch details for notification
    const caseDetails = await Case.getById(caseId);

    if (!caseDetails) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // 3. Send notifications (SMS & Email)
    if (caseDetails) {
      await notificationService.triggerUpdateNotifications(
        caseDetails,
        status,
        message || `Status updated to ${status}`
      );
    }

    res.json({
      success: true,
      message: 'Case status updated and notifications sent via SMS and Email',
      data: {
        caseId,
        newStatus: status
      }
    });

  } catch (error) {
    console.error('   ❌ Error in status notification update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status and notify',
      error: error.message
    });
  }
};

/**
 * Upload document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { case_id } = req.body;

    console.log('\n📋 UPLOAD DOCUMENT');
    console.log('   Case ID:', case_id);
    console.log('   File:', req.file);

    if (!case_id) {
      return res.status(400).json({
        success: false,
        message: 'Case ID is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(case_id, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    const documentData = {
      file_name: req.file.filename,
      original_name: req.file.originalname,
      file_url: `/uploads/cases/${req.file.filename}`,
      file_type: path.extname(req.file.originalname).substring(1),
      file_size: req.file.size
    };

    await Case.addDocument(case_id, documentData, req.user.name, req.user.role);

    console.log('   ✅ Document uploaded');

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: documentData
    });

  } catch (error) {
    console.error('   ❌ Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

/**
 * Delete document
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.params;

    console.log('\n🗑️ DELETE DOCUMENT');
    console.log('   Case ID:', caseId);
    console.log('   Document ID:', documentId);

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    await Case.deleteDocument(documentId, caseId, req.user.name, req.user.role);

    console.log('   ✅ Document deleted');

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('   ❌ Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

/**
 * Rename document
 */
exports.renameDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.params;
    const { newName } = req.body;

    console.log('\n📝 RENAME DOCUMENT');
    console.log('   Case ID:', caseId);
    console.log('   Document ID:', documentId);
    console.log('   New Name:', newName);

    if (!newName) {
      return res.status(400).json({
        success: false,
        message: 'New name is required'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    await Case.renameDocument(documentId, caseId, newName, req.user.name, req.user.role);

    console.log('   ✅ Document renamed');

    res.json({
      success: true,
      message: 'Document renamed successfully'
    });

  } catch (error) {
    console.error('   ❌ Error renaming document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rename document',
      error: error.message
    });
  }
};

/**
 * Summarize document
 */
exports.summarizeDocument = async (req, res) => {
  try {
    const { documentId, caseId } = req.body;

    console.log('\n🤖 SUMMARIZE DOCUMENT');
    console.log('   Case ID:', caseId);
    console.log('   Document ID:', documentId);

    // Get document content (simulate OCR for now or read text file)
    const doc = await Case.getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let extractedText = '';
    // Basic text extraction for demo purposes
    // In production, integrate Tesseract.js or similar for PDF/Images
    if (doc.file_type === 'txt') {
      const filePath = path.join(__dirname, '../../', doc.file_url);
      // Note: fs.promises.readFile is used, so await is correct
      extractedText = await fs.readFile(filePath, 'utf8').catch(err => {
        console.error('File read error:', err);
        return '(Content unavailable)';
      });
    } else {
      // Fallback or placeholder for non-text files without OCR
      extractedText = `(Content of document ${doc.original_name} - PDF/Image OCR not fully enabled in this demo)`;
    }

    // Call AI
    const prompt = `
      Please summarize this document:
      Name: ${doc.original_name}
      Content: ${extractedText.substring(0, 5000)}
    `;

    const aiResponse = await askAiLegalAssistant(
      [{ role: 'user', content: prompt }],
      'DOCUMENT_SUMMARIZER'
    );

    res.json({
      success: true,
      summary: aiResponse.answer
    });

  } catch (error) {
    console.error('   ❌ Error summarizing document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize document',
      error: error.message
    });
  }
};



/**
 * Add timeline event
 */
exports.addTimelineEvent = async (req, res) => {
  try {
    const { case_id, event_title, event_description, event_type, event_date } = req.body;

    console.log('\n📋 ADD TIMELINE EVENT');
    console.log('   Case ID:', case_id);
    console.log('   Event:', event_title);

    if (!case_id || !event_title || !event_date) {
      return res.status(400).json({
        success: false,
        message: 'Case ID, event title, and event date are required'
      });
    }

    // Check access
    const hasAccess = await Case.hasAccess(case_id, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    await Case.addTimelineEvent(
      case_id,
      { event_title, event_description, event_type, event_date },
      req.user.name,
      req.user.role
    );

    console.log('   ✅ Timeline event added');

    res.json({
      success: true,
      message: 'Timeline event added successfully'
    });

  } catch (error) {
    console.error('   ❌ Error adding timeline event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add timeline event',
      error: error.message
    });
  }
};

/**
 * Get case activities
 */
exports.getActivities = async (req, res) => {
  try {
    const caseId = req.params.case_id;

    console.log('\n📋 GET ACTIVITIES');
    console.log('   Case ID:', caseId);

    // Check access
    const hasAccess = await Case.hasAccess(caseId, req.user.id, req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this case'
      });
    }

    const activities = await Case.getActivities(caseId);

    console.log('   ✅ Found', activities.length, 'activities');

    res.json({
      success: true,
      message: 'Activities retrieved successfully',
      data: activities
    });

  } catch (error) {
    console.error('   ❌ Error getting activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activities',
      error: error.message
    });
  }
};

/**
 * Delete (archive) case
 */
exports.deleteCase = async (req, res) => {
  console.log('\n🛑 DELETE CASE REQUEST RECEIVED');

  try {
    const caseId = req.params.id;
    console.log('   Target Case ID:', caseId);

    // 1. Validate Authentication
    if (!req.user) {
      console.error('   ❌ CRITICAL: req.user is undefined! Auth middleware failed.');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User information missing.'
      });
    }

    // Safety checks for ID
    if (!req.user.id) {
      console.error('   ❌ CRITICAL: User ID missing in token payload', req.user);
      return res.status(400).json({ success: false, message: 'Invalid token: User ID missing' });
    }

    const userId = req.user.id;
    const userRole = req.user.role || req.user.user_type || 'user';
    const userName = req.user.name || 'Unknown User';

    console.log('   User Context:', { userId, userRole, userName });

    // 2. Validate Case Existence
    console.log('   🔍 Checking if case exists in DB...');
    let caseData;
    try {
      caseData = await Case.getById(caseId);
    } catch (dbError) {
      console.error('   ❌ Database error checking case:', dbError);
      return res.status(500).json({ success: false, message: 'Database error fetching case' });
    }

    if (!caseData) {
      console.warn('   ⚠️ Case not found');
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // 3. Validate Access
    console.log(`   🔐 Verifying access...`);
    let hasAccess = false;
    try {
      if (userRole === 'lawyer') {
        hasAccess = await Case.hasAccess(caseId, userId, 'lawyer');
      } else {
        // Direct ID comparison (handle string vs int)
        if (parseInt(userId) === parseInt(caseData.user_id)) {
          hasAccess = true;
        } else {
          hasAccess = await Case.hasAccess(caseId, userId);
        }
      }
    } catch (accessError) {
      console.error('   ❌ Access check error:', accessError);
      return res.status(500).json({ success: false, message: 'Error checking permission' });
    }

    if (!hasAccess) {
      console.warn('   ⛔ Access denied!');
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    // 4. Archive
    console.log('   ✅ Archiving...');
    try {
      await Case.archive(caseId, userName, userRole);
      console.log('   ✅ Archived!');
    } catch (archiveError) {
      console.error('   ❌ Archive failed:', archiveError);
      return res.status(500).json({ success: false, message: 'Archive failed', error: archiveError.message });
    }

    res.status(200).json({ success: true, message: 'Case deleted successfully' });

  } catch (error) {
    console.error('   ❌ CONTROLLER CRASH:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Add Hearing
 */
exports.addHearing = async (req, res) => {
  try {
    const {
      case_id, hearing_date, purpose, courtroom, judge_name,
      notes, next_hearing_date, next_hearing_purpose, adjournment_reason
    } = req.body;

    console.log('\n📋 ADD HEARING');
    console.log('   Case ID:', case_id);
    console.log('   Date:', hearing_date);

    // Check access (could be stricter, only lawyer/admin)
    const hasAccess = await Case.hasAccess(case_id, req.user.id, req.user.role);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to add hearings for this case'
      });
    }

    const hearingData = {
      case_id, hearing_date, purpose, courtroom, judge_name,
      notes, next_hearing_date, next_hearing_purpose, adjournment_reason
    };

    const hearingId = await Hearing.create(hearingData);

    // Also add to timeline automatically
    await Case.addTimelineEvent(
      case_id,
      {
        event_title: `Hearing - ${purpose}`,
        event_description: `Hearing scheduled at ${courtroom}.Judge: ${judge_name}`,
        event_type: 'hearing',
        event_date: hearing_date.split('T')[0] // simplified
      },
      req.user.name,
      req.user.role
    );

    res.status(201).json({
      success: true,
      message: 'Hearing added successfully',
      data: { hearing_id: hearingId }
    });

  } catch (error) {
    console.error('   ❌ Error adding hearing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add hearing',
      error: error.message
    });
  }
};

exports.updateHearing = async (req, res) => {
  try {
    const hearingId = req.params.hearing_id;
    const updates = req.body;

    // TODO: Access check for hearing (complex because hearing doesn't have direct user_id, need to check case)
    // Simplified for now assuming middleware checks general auth

    await Hearing.update(hearingId, updates);
    res.json({ success: true, message: "Hearing updated" });
  } catch (error) {
    console.error('   ❌ Error updating hearing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hearing',
      error: error.message
    });
  }
}

/**
 * Seed 20 sample cases if DB is empty
 */
exports.seedSampleCases = async (req, res) => {
  try {
    const sampleCases = [
      { 
        "caseId": "C001", "caseTitle": "Property Ownership Dispute", "caseType": "Property", "clientName": "Rohit Sharma", "clientEmail": "rohit.sharma@example.com", "assignedLawyer": "Adv. Priya Mehta", "courtName": "Pune District Court", "caseStatus": "Hearing Scheduled", "filingDate": "2026-01-15", "nextHearingDate": "2026-04-10", "caseDescription": "Dispute between two brothers over inherited residential property.",
        "opponentName": "Suresh Sharma", "opponentLawyer": "Adv. Anil Deshpande"
      },
      { 
        "caseId": "C002", "caseTitle": "Divorce Petition Case", "caseType": "Family", "clientName": "Sneha Patil", "clientEmail": "sneha.patil@example.com", "assignedLawyer": "Adv. Rahul Deshmukh", "courtName": "Mumbai Family Court", "caseStatus": "In Progress", "filingDate": "2026-02-01", "nextHearingDate": "2026-03-28", "caseDescription": "Mutual divorce petition due to irreconcilable differences.",
        "opponentName": "Rohan Patil", "opponentLawyer": "Adv. Megha Kulkarni"
      },
      { 
        "caseId": "C003", "caseTitle": "Cyber Fraud Complaint", "caseType": "Criminal", "clientName": "Amit Verma", "clientEmail": "amit.verma@example.com", "assignedLawyer": "Adv. Neha Joshi", "courtName": "Delhi Cyber Cell Court", "caseStatus": "Filed", "filingDate": "2026-03-05", "nextHearingDate": "2026-04-02", "caseDescription": "Online banking fraud resulting in financial loss.",
        "opponentName": "ICICI Bank Ltd.", "opponentLawyer": "Adv. Vikram Sethi"
      },
      { 
        "caseId": "C004", "caseTitle": "Employment Termination Dispute", "caseType": "Corporate", "clientName": "Karan Singh", "clientEmail": "karan.singh@example.com", "assignedLawyer": "Adv. Pooja Shah", "courtName": "Bangalore Labour Court", "caseStatus": "Under Review", "filingDate": "2026-02-20", "nextHearingDate": "2026-03-30", "caseDescription": "Unlawful termination from job without notice period.",
        "opponentName": "TechSol Systems", "opponentLawyer": "Adv. Rajesh Hegde"
      },
      { 
        "caseId": "C005", "caseTitle": "Loan Recovery Case", "caseType": "Civil", "clientName": "Vikas Yadav", "clientEmail": "vikas.yadav@example.com", "assignedLawyer": "Adv. Sandeep Kulkarni", "courtName": "Nagpur Civil Court", "caseStatus": "In Progress", "filingDate": "2026-01-25", "nextHearingDate": "2026-03-22", "caseDescription": "Recovery of unpaid personal loan.",
        "opponentName": "Mayank Agarwal", "opponentLawyer": "Adv. Kavita Jain"
      },
      { 
        "caseId": "C006", "caseTitle": "Land Encroachment Case", "caseType": "Property", "clientName": "Meena Reddy", "clientEmail": "meena.reddy@example.com", "assignedLawyer": "Adv. Arjun Nair", "courtName": "Hyderabad District Court", "caseStatus": "Hearing Scheduled", "filingDate": "2026-02-10", "nextHearingDate": "2026-04-05", "caseDescription": "Illegal encroachment of agricultural land.",
        "opponentName": "Govind Rao", "opponentLawyer": "Adv. P. Srinivas"
      },
      { 
        "caseId": "C007", "caseTitle": "Consumer Complaint Against Builder", "caseType": "Civil", "clientName": "Anjali Gupta", "clientEmail": "anjali.gupta@example.com", "assignedLawyer": "Adv. Ritesh Jain", "courtName": "Consumer Court Mumbai", "caseStatus": "Filed", "filingDate": "2026-03-01", "nextHearingDate": "2026-04-12", "caseDescription": "Delay in possession of flat by builder.",
        "opponentName": "Skyline Developers", "opponentLawyer": "Adv. Sameer Merchant"
      },
      { 
        "caseId": "C008", "caseTitle": "Theft Case", "caseType": "Criminal", "clientName": "Deepak Kumar", "clientEmail": "deepak.kumar@example.com", "assignedLawyer": "Adv. Kavita Sharma", "courtName": "Patna Criminal Court", "caseStatus": "In Progress", "filingDate": "2026-02-15", "nextHearingDate": "2026-03-25", "caseDescription": "Reported theft of valuables from residence.",
        "opponentName": "State of Bihar (Police)", "opponentLawyer": "Public Prosecutor"
      },
      { 
        "caseId": "C009", "caseTitle": "Trademark Infringement Case", "caseType": "Corporate", "clientName": "Rakesh Agarwal", "clientEmail": "rakesh.agarwal@example.com", "assignedLawyer": "Adv. Nidhi Kapoor", "courtName": "Delhi High Court", "caseStatus": "Under Review", "filingDate": "2026-02-28", "nextHearingDate": "2026-04-15", "caseDescription": "Unauthorized use of registered trademark.",
        "opponentName": "Global Brands Inc.", "opponentLawyer": "Adv. Rohan Mehra"
      },
      { 
        "caseId": "C010", "caseTitle": "Domestic Violence Case", "caseType": "Family", "clientName": "Pooja Singh", "clientEmail": "pooja.singh@example.com", "assignedLawyer": "Adv. Shalini Verma", "courtName": "Lucknow Family Court", "caseStatus": "Hearing Scheduled", "filingDate": "2026-01-30", "nextHearingDate": "2026-03-29", "caseDescription": "Complaint of domestic violence and protection request.",
        "opponentName": "Manish Singh", "opponentLawyer": "Adv. Gaurav Trivedi"
      },
      { 
        "caseId": "C011", "caseTitle": "Business Contract Dispute", "caseType": "Corporate", "clientName": "Suresh Jain", "clientEmail": "suresh.jain@example.com", "assignedLawyer": "Adv. Amit Khanna", "courtName": "Ahmedabad Civil Court", "caseStatus": "In Progress", "filingDate": "2026-02-05", "nextHearingDate": "2026-03-27", "caseDescription": "Breach of contract between two companies.",
        "opponentName": "Reliance Logistics", "opponentLawyer": "Adv. Jignesh Dave"
      },
      { 
        "caseId": "C012", "caseTitle": "Cheque Bounce Case", "caseType": "Criminal", "clientName": "Nitin Joshi", "clientEmail": "nitin.joshi@example.com", "assignedLawyer": "Adv. Rekha Patil", "courtName": "Pune Magistrate Court", "caseStatus": "Filed", "filingDate": "2026-03-10", "nextHearingDate": "2026-04-20", "caseDescription": "Cheque bounce due to insufficient funds.",
        "opponentName": "Akash Thonse", "opponentLawyer": "Adv. Sunil Shetty"
      },
      { 
        "caseId": "C013", "caseTitle": "Child Custody Case", "caseType": "Family", "clientName": "Neha Kulkarni", "clientEmail": "neha.kulkarni@example.com", "assignedLawyer": "Adv. Rajesh Pawar", "courtName": "Pune Family Court", "caseStatus": "In Progress", "filingDate": "2026-02-18", "nextHearingDate": "2026-03-31", "caseDescription": "Custody battle for minor child.",
        "opponentName": "Vinay Kulkarni", "opponentLawyer": "Adv. Swati Sahni"
      },
      { 
        "caseId": "C014", "caseTitle": "Intellectual Property Dispute", "caseType": "Corporate", "clientName": "Vivek Malhotra", "clientEmail": "vivek.malhotra@example.com", "assignedLawyer": "Adv. Meera Iyer", "courtName": "Chennai High Court", "caseStatus": "Under Review", "filingDate": "2026-02-25", "nextHearingDate": "2026-04-18", "caseDescription": "Patent rights violation dispute.",
        "opponentName": "MedTech Solutions", "opponentLawyer": "Adv. K. Balachander"
      },
      { 
        "caseId": "C015", "caseTitle": "Property Rent Dispute", "caseType": "Property", "clientName": "Rahul Patil", "clientEmail": "rahul.patil@example.com", "assignedLawyer": "Adv. Sunita Desai", "courtName": "Mumbai Civil Court", "caseStatus": "In Progress", "filingDate": "2026-01-20", "nextHearingDate": "2026-03-26", "caseDescription": "Dispute over unpaid rent and eviction notice.",
        "opponentName": "Kishore Bhave", "opponentLawyer": "Adv. Ajay Gupa"
      },
      { 
        "caseId": "C016", "caseTitle": "Medical Negligence Case", "caseType": "Civil", "clientName": "Alok Mishra", "clientEmail": "alok.mishra@example.com", "assignedLawyer": "Adv. Pankaj Verma", "courtName": "Delhi Consumer Court", "caseStatus": "Filed", "filingDate": "2026-03-02", "nextHearingDate": "2026-04-14", "caseDescription": "Negligence during medical treatment.",
        "opponentName": "City Hospital Delhi", "opponentLawyer": "Adv. Rajiv Bansal"
      },
      { 
        "caseId": "C017", "caseTitle": "Road Accident Claim Case", "caseType": "Civil", "clientName": "Sanjay Kumar", "clientEmail": "sanjay.kumar@example.com", "assignedLawyer": "Adv. Deepa Menon", "courtName": "Motor Accident Tribunal Pune", "caseStatus": "Hearing Scheduled", "filingDate": "2026-02-12", "nextHearingDate": "2026-03-30", "caseDescription": "Compensation claim for road accident injury.",
        "opponentName": "New India Assurance", "opponentLawyer": "Adv. Milind Soman"
      },
      { 
        "caseId": "C018", "caseTitle": "Cyber Harassment Case", "caseType": "Criminal", "clientName": "Riya Sharma", "clientEmail": "riya.sharma@example.com", "assignedLawyer": "Adv. Ankit Sinha", "courtName": "Cyber Court Mumbai", "caseStatus": "Under Review", "filingDate": "2026-03-08", "nextHearingDate": "2026-04-16", "caseDescription": "Online harassment through social media.",
        "opponentName": "Unknown (Under Investigation)", "opponentLawyer": "Cyber Cell Counsel"
      },
      { 
        "caseId": "C019", "caseTitle": "Builder Fraud Case", "caseType": "Property", "clientName": "Mohit Arora", "clientEmail": "mohit.arora@example.com", "assignedLawyer": "Adv. Kunal Shah", "courtName": "Consumer Court Pune", "caseStatus": "In Progress", "filingDate": "2026-02-22", "nextHearingDate": "2026-03-29", "caseDescription": "Fraudulent practices by real estate developer.",
        "opponentName": "Signature Homes", "opponentLawyer": "Adv. Rahul Vaidya"
      },
      { 
        "caseId": "C020", "caseTitle": "Income Tax Dispute Case", "caseType": "Corporate", "clientName": "Anil Mehta", "clientEmail": "anil.mehta@example.com", "assignedLawyer": "Adv. Rohan Bansal", "courtName": "Income Tax Tribunal Delhi", "caseStatus": "Filed", "filingDate": "2026-03-12", "nextHearingDate": "2026-04-25", "caseDescription": "Dispute regarding tax assessment and penalties.",
        "opponentName": "Income Tax Department", "opponentLawyer": "Standing Counsel IT"
      }
    ];

    const result = await Case.seedSampleCases(sampleCases, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('   ❌ Error seeding cases:', error);
    res.status(500).json({ success: false, message: 'Failed to seed cases', error: error.message });
  }
};

/**
 * Get all cases regardless of assignment
 */
exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.getAll();
    res.json({ success: true, data: cases });
  } catch (error) {
    console.error('   ❌ Error getting all cases:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all cases' });
  }
};

/**
 * Permanent Delete
 */
exports.deleteCasePermanently = async (req, res) => {
  try {
    const caseId = req.params.id;
    const deleted = await Case.deletePermanently(caseId);
    
    if (deleted) {
      res.json({ success: true, message: 'Case deleted permanently' });
    } else {
      res.status(404).json({ success: false, message: 'Case not found' });
    }
  } catch (error) {
    console.error('   ❌ Error deleting case permanently:', error);
    res.status(500).json({ success: false, message: 'Failed to delete case' });
  }
};

/**
 * Assign an existing case to a lawyer
 */
exports.assignCase = async (req, res) => {
  try {
    const caseId = req.params.id;
    const { lawyer_id } = req.body;
    const userId = req.user.id;

    console.log('\n📋 ASSIGN CASE REQUEST');
    console.log(`   Case ID: ${caseId}, Lawyer ID: ${lawyer_id}, User ID: ${userId}`);

    if (!lawyer_id) {
      return res.status(400).json({ success: false, message: 'Lawyer ID is required' });
    }

    const { getDatabase } = require('../config/database');

    // 1. Verify the user owns the case and it is unassigned
    const [cases] = await getDatabase().execute(
      'SELECT id, assignment_status FROM cases WHERE id = ? AND user_id = ?',
      [caseId, userId]
    );

    if (cases.length === 0) {
      return res.status(403).json({ success: false, message: 'You do not have access to this case.' });
    }

    if (cases[0].assignment_status !== 'UNASSIGNED') {
      return res.status(400).json({ success: false, message: 'This case is already assigned or requested.' });
    }

    // 2. Verify the lawyer exists and the user has a completed consultation
    const [lawyers] = await getDatabase().execute(`
      SELECT l.id, u.name 
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.user_type = 'lawyer'
    `, [lawyer_id]);

    if (lawyers.length === 0) {
      return res.status(404).json({ success: false, message: 'Lawyer not found.' });
    }

    const [bookings] = await getDatabase().execute(`
       SELECT id FROM bookings 
       WHERE user_id = ? AND lawyer_id = ? AND status IN ('completed', 'confirmed')
       LIMIT 1
    `, [userId, lawyer_id]);

    if (bookings.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You cannot assign a case to this lawyer without a completed consultation first.'
      });
    }

    // 3. Update the case
    await getDatabase().execute(
      `UPDATE cases SET lawyer_id = ?, assignment_status = 'REQUESTED' WHERE id = ?`,
      [lawyer_id, caseId]
    );

    // 4. Activity Log
    await getDatabase().execute(
      `INSERT INTO case_activities (case_id, activity, actor_name, actor_role, activity_type)
       VALUES (?, ?, ?, 'user', 'update')`,
      [caseId, `Assigned case to ${lawyers[0].name}`, req.user.name || 'User']
    );

    console.log('   ✅ Case successfully assigned.');

    res.json({ success: true, message: 'Case assigned successfully!' });
  } catch (error) {
    console.error('   ❌ Error assigning case:', error);
    res.status(500).json({ success: false, message: 'Failed to assign case' });
  }
};

