const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all grades
router.get('/', (req, res) => {
  try {
    const studentId = req.query.student_id;
    const query = studentId
      ? `SELECT g.*, s.name as student_name, s.name_ar as student_name_ar
         FROM grades g
         LEFT JOIN students s ON g.student_id = s.id
         WHERE g.student_id = ?
         ORDER BY g.date DESC`
      : `SELECT g.*, s.name as student_name, s.name_ar as student_name_ar
         FROM grades g
         LEFT JOIN students s ON g.student_id = s.id
         ORDER BY g.date DESC`;
    
    const grades = studentId
      ? prepare(query).all(studentId)
      : prepare(query).all();
    
    res.json(grades);
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get grades by student ID
router.get('/student/:studentId', (req, res) => {
  try {
    const grades = prepare(`
      SELECT * FROM grades WHERE student_id = ? ORDER BY date DESC
    `).all(req.params.studentId);
    res.json(grades);
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create grade
router.post('/', (req, res) => {
  const { student_id, subject, subject_ar, score, max_score, date, teacher_id } = req.body;
  
  if (!student_id || !subject || !subject_ar || score === undefined || !max_score || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const id = uuidv4();
    prepare(`
      INSERT INTO grades (id, student_id, subject, subject_ar, score, max_score, date, teacher_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, student_id, subject, subject_ar, score, max_score, date, teacher_id || null);

    const newGrade = prepare('SELECT * FROM grades WHERE id = ?').get(id);
    res.status(201).json(newGrade);
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update grade
router.put('/:id', (req, res) => {
  const { subject, subject_ar, score, max_score, date } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM grades WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    prepare(`
      UPDATE grades 
      SET subject = ?, subject_ar = ?, score = ?, max_score = ?, date = ?
      WHERE id = ?
    `).run(
      subject || existing.subject,
      subject_ar || existing.subject_ar,
      score !== undefined ? score : existing.score,
      max_score || existing.max_score,
      date || existing.date,
      req.params.id
    );

    const updated = prepare('SELECT * FROM grades WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete grade
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM grades WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    prepare('DELETE FROM grades WHERE id = ?').run(req.params.id);
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

