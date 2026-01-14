const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get attendance records
router.get('/', (req, res) => {
  try {
    const { student_id, date, teacher_id } = req.query;
    
    let query = `
      SELECT a.*, s.name as student_name, s.name_ar as student_name_ar,
             t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];
    
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    
    if (teacher_id) {
      query += ' AND a.teacher_id = ?';
      params.push(teacher_id);
    }
    
    query += ' ORDER BY a.date DESC, s.name';
    
    const attendance = params.length > 0
      ? prepare(query).all(...params)
      : prepare(query).all();
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attendance for a specific date
router.get('/date/:date', (req, res) => {
  try {
    const { date } = req.params;
    const attendance = prepare(`
      SELECT a.*, s.name as student_name, s.name_ar as student_name_ar,
             s.class_name, s.subclass_name
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.date = ?
      ORDER BY s.name
    `).all(date);
    
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attendance statistics for a student
router.get('/student/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const attendance = prepare(`
      SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC
    `).all(studentId);
    
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const absentDays = attendance.filter(a => a.status === 'absent').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : 0;
    
    res.json({
      totalDays,
      presentDays,
      absentDays,
      attendanceRate,
      records: attendance,
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update attendance record
router.post('/', (req, res) => {
  try {
    const { student_id, teacher_id, date, status, notes } = req.body;
    
    if (!student_id || !teacher_id || !date || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['present', 'absent', 'late', 'excused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: present, absent, late, or excused' });
    }
    
    // Check if attendance already exists for this student and date
    const existing = prepare('SELECT id FROM attendance WHERE student_id = ? AND date = ?').get(student_id, date);
    
    if (existing) {
      // Update existing record
      prepare(`
        UPDATE attendance 
        SET status = ?, notes = ?, teacher_id = ?
        WHERE id = ?
      `).run(status, notes || null, teacher_id, existing.id);
      
      res.json({ 
        id: existing.id,
        student_id,
        teacher_id,
        date,
        status,
        notes: notes || null,
        message: 'Attendance updated successfully'
      });
    } else {
      // Create new record
      const id = uuidv4();
      prepare(`
        INSERT INTO attendance (id, student_id, teacher_id, date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, student_id, teacher_id, date, status, notes || null);
      
      res.status(201).json({
        id,
        student_id,
        teacher_id,
        date,
        status,
        notes: notes || null,
        message: 'Attendance recorded successfully'
      });
    }
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Bulk create attendance (for multiple students on same date)
router.post('/bulk', (req, res) => {
  try {
    const { teacher_id, date, attendance_records } = req.body;
    
    if (!teacher_id || !date || !attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const results = [];
    
    attendance_records.forEach((record) => {
      const { student_id, status, notes } = record;
      
      if (!student_id || !status) {
        return;
      }
      
      // Check if attendance already exists
      const existing = prepare('SELECT id FROM attendance WHERE student_id = ? AND date = ?').get(student_id, date);
      
      if (existing) {
        // Update existing
        prepare(`
          UPDATE attendance 
          SET status = ?, notes = ?, teacher_id = ?
          WHERE id = ?
        `).run(status, notes || null, teacher_id, existing.id);
        results.push({ student_id, status, updated: true });
      } else {
        // Create new
        const id = uuidv4();
        prepare(`
          INSERT INTO attendance (id, student_id, teacher_id, date, status, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, student_id, teacher_id, date, status, notes || null);
        results.push({ student_id, status, created: true });
      }
    });
    
    res.status(201).json({
      message: `Attendance recorded for ${results.length} students`,
      results
    });
  } catch (error) {
    console.error('Bulk create attendance error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete attendance record
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    prepare('DELETE FROM attendance WHERE id = ?').run(id);
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

