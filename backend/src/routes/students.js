const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Get all students
router.get('/', (req, res) => {
  try {
    const students = prepare(`
      SELECT s.*, p.name as parent_name, p.name_ar as parent_name_ar, p.mobile as parent_mobile
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      ORDER BY s.name
    `).all();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student by ID
router.get('/:id', (req, res) => {
  try {
    const student = prepare(`
      SELECT s.*, p.name as parent_name, p.name_ar as parent_name_ar, p.mobile as parent_mobile
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      WHERE s.id = ?
    `).get(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students by parent ID
router.get('/parent/:parentId', (req, res) => {
  try {
    const students = prepare(`
      SELECT * FROM students WHERE parent_id = ? ORDER BY name
    `).all(req.params.parentId);
    res.json(students);
  } catch (error) {
    console.error('Get students by parent error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create student
router.post('/', (req, res) => {
  console.log('📝 Create student request body:', JSON.stringify(req.body, null, 2));
  
  const { parent_id, name, name_ar, grade, grade_ar, class_name, subclass_name } = req.body;
  
  if (!parent_id || !name || !name_ar || !grade || !grade_ar) {
    console.log('❌ Missing required fields:', { parent_id: !!parent_id, name: !!name, name_ar: !!name_ar, grade: !!grade, grade_ar: !!grade_ar });
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if parent exists
    const parent = prepare('SELECT id FROM parents WHERE id = ?').get(parent_id);
    if (!parent) {
      console.log('❌ Parent not found:', parent_id);
      return res.status(404).json({ error: 'Parent not found' });
    }

    const id = uuidv4();
    console.log('✅ Creating student with ID:', id);
    
    prepare(`
      INSERT INTO students (id, parent_id, name, name_ar, grade, grade_ar, class_name, subclass_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, parent_id, name, name_ar, grade, grade_ar, class_name || grade_ar, subclass_name || '');

    const newStudent = prepare('SELECT * FROM students WHERE id = ?').get(id);
    console.log('✅ Student created:', newStudent);
    res.status(201).json(newStudent);
  } catch (error) {
    console.error('❌ Create student error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update student
router.put('/:id', (req, res) => {
  const { name, name_ar, grade, grade_ar, parent_id, class_name, subclass_name } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    prepare(`
      UPDATE students 
      SET name = ?, name_ar = ?, grade = ?, grade_ar = ?, parent_id = ?, class_name = ?, subclass_name = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      name_ar || existing.name_ar,
      grade || existing.grade,
      grade_ar || existing.grade_ar,
      parent_id || existing.parent_id,
      class_name || existing.class_name,
      subclass_name !== undefined ? subclass_name : existing.subclass_name,
      req.params.id
    );

    const updated = prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete student
router.delete('/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

