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

// Add sample grades for all students who don't have any
router.post('/add-sample-grades', (req, res) => {
  try {
    console.log('📊 Adding sample grades for all students...');
    
    // Get all students
    const students = prepare('SELECT id FROM students').all();
    console.log(`Found ${students.length} students`);
    
    if (students.length === 0) {
      return res.json({ message: 'No students found', gradesAdded: 0 });
    }

    // Get first teacher (or create one if none exists)
    let teacher = prepare('SELECT id FROM teachers LIMIT 1').get();
    if (!teacher) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('123456', 10);
      const teacherId = uuidv4();
      prepare(`INSERT INTO teachers (id, mobile, password, name, name_ar) VALUES (?, ?, ?, ?, ?)`).run(
        teacherId, '0509999999', hashedPassword, 'Default Teacher', 'معلمة افتراضية'
      );
      teacher = { id: teacherId };
    }

    const subjects = [
      { en: 'Quran', ar: 'القرآن الكريم' },
      { en: 'Hadith', ar: 'الحديث الشريف' },
      { en: 'Fiqh', ar: 'الفقه' },
      { en: 'Aqeedah', ar: 'العقيدة' },
      { en: 'Seerah', ar: 'السيرة النبوية' },
      { en: 'Arabic', ar: 'اللغة العربية' },
    ];

    const getDateString = (daysAgo) => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split('T')[0];
    };

    let gradesAdded = 0;

    students.forEach((student, studentIndex) => {
      // Check if student already has grades
      const existingCount = prepare('SELECT COUNT(*) as count FROM grades WHERE student_id = ?').get(student.id);
      if (existingCount && existingCount.count > 0) {
        console.log(`Student ${student.id} already has ${existingCount.count} grades, skipping...`);
        return;
      }

      // Determine performance level
      let minScore, maxScore;
      const performanceLevel = studentIndex % 4;
      switch (performanceLevel) {
        case 0: minScore = 90; maxScore = 100; break;
        case 1: minScore = 85; maxScore = 100; break;
        case 2: minScore = 70; maxScore = 90; break;
        default: minScore = 60; maxScore = 95;
      }

      // Add grades for each subject
      subjects.forEach((subject, subjectIndex) => {
        const score = minScore + Math.floor(Math.random() * (maxScore - minScore + 1));
        const date = getDateString(30 - subjectIndex * 5);
        
        prepare(`INSERT INTO grades (id, student_id, subject, subject_ar, score, max_score, date, teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
          uuidv4(), student.id, subject.en, subject.ar, score, 100, date, teacher.id
        );
        gradesAdded++;
      });
    });

    console.log(`✅ Added ${gradesAdded} grades`);
    res.json({ message: `Successfully added ${gradesAdded} grades for ${students.length} students`, gradesAdded });
  } catch (error) {
    console.error('Add sample grades error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;

