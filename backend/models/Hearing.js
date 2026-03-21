const { getDatabase } = require('../config/database');

class Hearing {
    /**
     * Add a new hearing
     */
    static async create(hearingData) {
        const pool = getDatabase();

        // Insert hearing
        const [result] = await pool.query(
            `INSERT INTO case_hearings (
        case_id, hearing_date, purpose, courtroom, judge_name, 
        notes, next_hearing_date, next_hearing_purpose, adjournment_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                hearingData.case_id,
                hearingData.hearing_date,
                hearingData.purpose || 'Other',
                hearingData.courtroom,
                hearingData.judge_name,
                hearingData.notes,
                hearingData.next_hearing_date || null,
                hearingData.next_hearing_purpose || null,
                hearingData.adjournment_reason || null
            ]
        );

        return result.insertId;
    }

    /**
     * Get hearings for a case
     */
    static async getByCaseId(caseId) {
        const [hearings] = await getDatabase().query(
            `SELECT * FROM case_hearings WHERE case_id = ? ORDER BY hearing_date DESC`,
            [caseId]
        );
        return hearings;
    }

    /**
     * Get upcoming hearings for a user/lawyer
     */
    static async getUpcoming(userId, role = 'lawyer') {
        const column = role === 'lawyer' ? 'l.id' : 'u.id'; // Assuming join logic
        // We need to join with cases table to filter by user/lawyer

        const [hearings] = await getDatabase().query(
            `SELECT h.*, c.title as case_title, c.case_number 
       FROM case_hearings h
       JOIN cases c ON h.case_id = c.id
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN lawyers l ON c.lawyer_id = l.id
       WHERE ${column} = ? AND h.hearing_date >= NOW()
       ORDER BY h.hearing_date ASC`,
            [userId]
        );

        return hearings;
    }

    /**
     * Update hearing outcome/details
     */
    static async update(hearingId, updates) {
        const fields = [];
        const values = [];

        const updateableFields = [
            'hearing_date', 'purpose', 'courtroom', 'judge_name',
            'outcome', 'next_hearing_date', 'next_hearing_purpose',
            'adjournment_reason', 'notes'
        ];

        for (const field of updateableFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (fields.length === 0) return true;

        values.push(hearingId);

        await getDatabase().query(
            `UPDATE case_hearings SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return true;
    }
}

module.exports = Hearing;
