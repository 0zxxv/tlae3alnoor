const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all parents
router.get('/', (req, res) => {
  try {
    const parents = prepare(`
      SELECT id, mobile, name, name_ar, relationship, created_at FROM parents ORDER BY name
    `).all();

    // Get children count for each parent
    const parentsWithChildren = parents.map(parent => {
      const childrenCount = prepare(`
        SELECT COUNT(*) as count FROM students WHERE parent_id = ?
      `).get(parent.id);
      return { ...parent, children_count: childrenCount.count };
    });

    res.json(parentsWithChildren);
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get parent by ID with children
router.get('/:id', (req, res) => {
  try {
    const parent = prepare(`
      SELECT id, mobile, name, name_ar, relationship, created_at FROM parents WHERE id = ?
    `).get(req.params.id);
    
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    const children = prepare(`
      SELECT * FROM students WHERE parent_id = ?
    `).all(parent.id);

    res.json({ ...parent, children });
  } catch (error) {
    console.error('Get parent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create parent - no password required
router.post('/', (req, res) => {
  const { mobile, name, name_ar, relationship } = req.body;
  
  if (!mobile || !name || !name_ar) {
    return res.status(400).json({ error: 'رقم الجوال والاسم مطلوبان' });
  }

  try {
    // Check if mobile already exists
    const existing = prepare('SELECT id FROM parents WHERE mobile = ?').get(mobile);
    if (existing) {
      return res.status(400).json({ error: 'رقم الجوال مسجل مسبقاً' });
    }

    const id = uuidv4();
    // Default password is the mobile number
    const hashedPassword = bcrypt.hashSync(mobile, 10);
    
    prepare(`
      INSERT INTO parents (id, mobile, password, name, name_ar, relationship) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, mobile, hashedPassword, name, name_ar, relationship || 'ولي أمر');

    const newParent = prepare(`
      SELECT id, mobile, name, name_ar, relationship, created_at FROM parents WHERE id = ?
    `).get(id);
    
    res.status(201).json(newParent);
  } catch (error) {
    console.error('Create parent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update parent
router.put('/:id', (req, res) => {
  const { mobile, password, name, name_ar, relationship } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM parents WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Check if new mobile is already used by another parent
    if (mobile && mobile !== existing.mobile) {
      const mobileExists = prepare('SELECT id FROM parents WHERE mobile = ? AND id != ?').get(mobile, req.params.id);
      if (mobileExists) {
        return res.status(400).json({ error: 'Mobile number already in use' });
      }
    }

    let hashedPassword = existing.password;
    if (password) {
      hashedPassword = bcrypt.hashSync(password, 10);
    }

    prepare(`
      UPDATE parents 
      SET mobile = ?, password = ?, name = ?, name_ar = ?, relationship = ?
      WHERE id = ?
    `).run(
      mobile || existing.mobile,
      hashedPassword,
      name || existing.name,
      name_ar || existing.name_ar,
      relationship || existing.relationship || 'ولي أمر',
      req.params.id
    );

    const updated = prepare(`
      SELECT id, mobile, name, name_ar, relationship, created_at FROM parents WHERE id = ?
    `).get(req.params.id);
    
    res.json(updated);
  } catch (error) {
    console.error('Update parent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete parent (will also delete their students due to CASCADE)
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM parents WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    prepare('DELETE FROM parents WHERE id = ?').run(req.params.id);
    res.json({ message: 'Parent and their students deleted successfully' });
  } catch (error) {
    console.error('Delete parent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
