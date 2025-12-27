const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all teachers
router.get('/', (req, res) => {
  try {
    const teachers = prepare(`
      SELECT id, mobile, name, name_ar, created_at FROM teachers ORDER BY name
    `).all();
    res.json(teachers);
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get teacher by ID
router.get('/:id', (req, res) => {
  try {
    const teacher = prepare(`
      SELECT id, mobile, name, name_ar, created_at FROM teachers WHERE id = ?
    `).get(req.params.id);
    
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create teacher
router.post('/', (req, res) => {
  const { mobile, password, name, name_ar } = req.body;
  
  if (!mobile || !password || !name || !name_ar) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = prepare('SELECT id FROM teachers WHERE mobile = ?').get(mobile);
    if (existing) {
      return res.status(400).json({ error: 'Mobile number already registered' });
    }

    const id = uuidv4();
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    prepare(`
      INSERT INTO teachers (id, mobile, password, name, name_ar) 
      VALUES (?, ?, ?, ?, ?)
    `).run(id, mobile, hashedPassword, name, name_ar);

    const newTeacher = prepare(`
      SELECT id, mobile, name, name_ar, created_at FROM teachers WHERE id = ?
    `).get(id);
    
    res.status(201).json(newTeacher);
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update teacher
router.put('/:id', (req, res) => {
  const { mobile, password, name, name_ar } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (mobile && mobile !== existing.mobile) {
      const mobileExists = prepare('SELECT id FROM teachers WHERE mobile = ? AND id != ?').get(mobile, req.params.id);
      if (mobileExists) {
        return res.status(400).json({ error: 'Mobile number already in use' });
      }
    }

    let hashedPassword = existing.password;
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 10);
    }

    prepare(`
      UPDATE teachers 
      SET mobile = ?, password = ?, name = ?, name_ar = ?
      WHERE id = ?
    `).run(
      mobile || existing.mobile,
      hashedPassword,
      name || existing.name,
      name_ar || existing.name_ar,
      req.params.id
    );

    const updated = prepare(`
      SELECT id, mobile, name, name_ar, created_at FROM teachers WHERE id = ?
    `).get(req.params.id);
    
    res.json(updated);
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete teacher
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    prepare('DELETE FROM teachers WHERE id = ?').run(req.params.id);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

