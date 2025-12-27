const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  try {
    const type = req.query.type;
    const query = type 
      ? 'SELECT * FROM events WHERE type = ? ORDER BY date'
      : 'SELECT * FROM events ORDER BY date';
    
    const events = type 
      ? prepare(query).all(type)
      : prepare(query).all();
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', (req, res) => {
  try {
    const event = prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event
router.post('/', (req, res) => {
  const { title, title_ar, description, description_ar, date, type } = req.body;
  
  if (!title || !title_ar || !date) {
    return res.status(400).json({ error: 'Title, title_ar, and date are required' });
  }

  try {
    const id = uuidv4();
    prepare(`
      INSERT INTO events (id, title, title_ar, description, description_ar, date, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, title_ar, description || '', description_ar || '', date, type || 'upcoming');

    const newEvent = prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event
router.put('/:id', (req, res) => {
  const { title, title_ar, description, description_ar, date, type } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    prepare(`
      UPDATE events 
      SET title = ?, title_ar = ?, description = ?, description_ar = ?, date = ?, type = ?
      WHERE id = ?
    `).run(
      title || existing.title,
      title_ar || existing.title_ar,
      description !== undefined ? description : existing.description,
      description_ar !== undefined ? description_ar : existing.description_ar,
      date || existing.date,
      type || existing.type,
      req.params.id
    );

    const updated = prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

