const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all announcements
router.get('/', (req, res) => {
  try {
    const announcements = prepare(`
      SELECT a.*, t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM announcements a
      LEFT JOIN teachers t ON a.teacher_id = t.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get announcement by ID
router.get('/:id', (req, res) => {
  try {
    const announcement = prepare(`
      SELECT a.*, t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM announcements a
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE a.id = ?
    `).get(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post('/', (req, res) => {
  const { title, title_ar, content, content_ar, teacher_id } = req.body;
  
  if (!title || !title_ar || !content || !content_ar) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const id = uuidv4();
    prepare(`
      INSERT INTO announcements (id, title, title_ar, content, content_ar, teacher_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title, title_ar, content, content_ar, teacher_id || null);

    const newAnnouncement = prepare(`
      SELECT a.*, t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM announcements a
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE a.id = ?
    `).get(id);
    
    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update announcement
router.put('/:id', (req, res) => {
  const { title, title_ar, content, content_ar } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    prepare(`
      UPDATE announcements 
      SET title = ?, title_ar = ?, content = ?, content_ar = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      title_ar || existing.title_ar,
      content || existing.content,
      content_ar || existing.content_ar,
      req.params.id
    );

    const updated = prepare(`
      SELECT a.*, t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM announcements a
      LEFT JOIN teachers t ON a.teacher_id = t.id
      WHERE a.id = ?
    `).get(req.params.id);
    
    res.json(updated);
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

