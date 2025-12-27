const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all slides (active only by default)
router.get('/', (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const query = showAll 
      ? 'SELECT * FROM slideshow ORDER BY display_order'
      : 'SELECT * FROM slideshow WHERE is_active = 1 ORDER BY display_order';
    
    const slides = prepare(query).all();
    res.json(slides);
  } catch (error) {
    console.error('Get slideshow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get slide by ID
router.get('/:id', (req, res) => {
  try {
    const slide = prepare('SELECT * FROM slideshow WHERE id = ?').get(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    res.json(slide);
  } catch (error) {
    console.error('Get slide error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create slide
router.post('/', (req, res) => {
  const { uri, image_url, title, title_ar, display_order, is_active } = req.body;
  const slideUri = uri || image_url;
  const slideTitle = title || title_ar;
  const slideTitleAr = title_ar || title;
  
  if (!slideUri || !slideTitle) {
    return res.status(400).json({ error: 'Image and title are required' });
  }

  try {
    const id = uuidv4();
    const maxOrder = prepare('SELECT MAX(display_order) as max FROM slideshow').get();
    const order = display_order || (maxOrder?.max || 0) + 1;
    
    prepare(`
      INSERT INTO slideshow (id, image_url, title, title_ar, display_order, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, slideUri, slideTitle, slideTitleAr, order, is_active !== false ? 1 : 0);

    const newSlide = prepare('SELECT * FROM slideshow WHERE id = ?').get(id);
    res.status(201).json(newSlide);
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update slide
router.put('/:id', (req, res) => {
  const { uri, image_url, title, title_ar, display_order, is_active } = req.body;
  const slideUri = uri || image_url;
  
  try {
    const existing = prepare('SELECT * FROM slideshow WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    prepare(`
      UPDATE slideshow 
      SET image_url = ?, title = ?, title_ar = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `).run(
      slideUri || existing.image_url,
      title || existing.title,
      title_ar || existing.title_ar,
      display_order !== undefined ? display_order : existing.display_order,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    );

    const updated = prepare('SELECT * FROM slideshow WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete slide
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM slideshow WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    prepare('DELETE FROM slideshow WHERE id = ?').run(req.params.id);
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder slides
router.post('/reorder', (req, res) => {
  const { order } = req.body; // Array of { id, display_order }
  
  try {
    const stmt = prepare('UPDATE slideshow SET display_order = ? WHERE id = ?');
    order.forEach(({ id, display_order }) => {
      stmt.run(display_order, id);
    });

    const slides = prepare('SELECT * FROM slideshow ORDER BY display_order').all();
    res.json(slides);
  } catch (error) {
    console.error('Reorder slides error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

