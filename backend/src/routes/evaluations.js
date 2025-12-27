const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// ==================== EVALUATION FORMS ====================

// Get all evaluation forms
router.get('/forms', (req, res) => {
  try {
    const forms = prepare(`
      SELECT * FROM evaluation_forms ORDER BY created_at DESC
    `).all();
    res.json(forms);
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get form by ID with questions and options
router.get('/forms/:id', (req, res) => {
  try {
    const form = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(req.params.id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const questions = prepare(`
      SELECT * FROM evaluation_questions WHERE form_id = ? ORDER BY display_order
    `).all(form.id);

    // Get options for each question
    const questionsWithOptions = questions.map(q => {
      const options = prepare(`
        SELECT * FROM evaluation_answer_options WHERE question_id = ? ORDER BY display_order
      `).all(q.id);
      return { ...q, options };
    });

    res.json({ ...form, questions: questionsWithOptions });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create evaluation form
router.post('/forms', (req, res) => {
  const { name, name_ar, description, description_ar, questions } = req.body;
  
  if (!name || !name_ar) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const formId = uuidv4();
    prepare(`
      INSERT INTO evaluation_forms (id, name, name_ar, description, description_ar) 
      VALUES (?, ?, ?, ?, ?)
    `).run(formId, name, name_ar, description || '', description_ar || '');

    // Insert questions if provided
    if (questions && questions.length > 0) {
      questions.forEach((q, qIndex) => {
        const questionId = uuidv4();
        prepare(`
          INSERT INTO evaluation_questions (id, form_id, question, question_ar, answer_type, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(questionId, formId, q.question, q.question_ar, q.answer_type, qIndex + 1);

        // Insert options for this question
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt, optIndex) => {
            prepare(`
              INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(uuidv4(), questionId, opt.option_text, opt.option_text_ar, opt.option_value, optIndex + 1);
          });
        }
      });
    }

    // Return the complete form
    const newForm = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(formId);
    res.status(201).json(newForm);
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update evaluation form
router.put('/forms/:id', (req, res) => {
  const { name, name_ar, description, description_ar, is_active } = req.body;
  
  try {
    const existing = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Form not found' });
    }

    prepare(`
      UPDATE evaluation_forms 
      SET name = ?, name_ar = ?, description = ?, description_ar = ?, is_active = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      name_ar || existing.name_ar,
      description !== undefined ? description : existing.description,
      description_ar !== undefined ? description_ar : existing.description_ar,
      is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
      req.params.id
    );

    const updated = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete evaluation form
router.delete('/forms/:id', (req, res) => {
  try {
    const existing = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Form not found' });
    }

    prepare('DELETE FROM evaluation_forms WHERE id = ?').run(req.params.id);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add question to form
router.post('/forms/:formId/questions', (req, res) => {
  const { question, question_ar, answer_type, options } = req.body;
  
  if (!question || !question_ar || !answer_type) {
    return res.status(400).json({ error: 'Question, question_ar, and answer_type are required' });
  }

  try {
    const form = prepare('SELECT * FROM evaluation_forms WHERE id = ?').get(req.params.formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const maxOrder = prepare('SELECT MAX(display_order) as max FROM evaluation_questions WHERE form_id = ?').get(req.params.formId);
    const questionId = uuidv4();
    
    prepare(`
      INSERT INTO evaluation_questions (id, form_id, question, question_ar, answer_type, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(questionId, req.params.formId, question, question_ar, answer_type, (maxOrder.max || 0) + 1);

    // Insert options
    if (options && options.length > 0) {
      options.forEach((opt, index) => {
        prepare(`
          INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), questionId, opt.option_text, opt.option_text_ar, opt.option_value, index + 1);
      });
    }

    const newQuestion = prepare('SELECT * FROM evaluation_questions WHERE id = ?').get(questionId);
    const questionOptions = prepare('SELECT * FROM evaluation_answer_options WHERE question_id = ?').all(questionId);
    
    res.status(201).json({ ...newQuestion, options: questionOptions });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question
router.delete('/questions/:id', (req, res) => {
  try {
    prepare('DELETE FROM evaluation_questions WHERE id = ?').run(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== STUDENT EVALUATIONS ====================

// Get evaluations for a student
router.get('/student/:studentId', (req, res) => {
  try {
    const evaluations = prepare(`
      SELECT se.*, 
             ef.name as form_name, ef.name_ar as form_name_ar,
             t.name as teacher_name, t.name_ar as teacher_name_ar
      FROM student_evaluations se
      LEFT JOIN evaluation_forms ef ON se.form_id = ef.id
      LEFT JOIN teachers t ON se.teacher_id = t.id
      WHERE se.student_id = ?
      ORDER BY se.evaluation_date DESC
    `).all(req.params.studentId);
    res.json(evaluations);
  } catch (error) {
    console.error('Get student evaluations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get evaluation details by ID
router.get('/:id', (req, res) => {
  try {
    const evaluation = prepare(`
      SELECT se.*, 
             ef.name as form_name, ef.name_ar as form_name_ar,
             t.name as teacher_name, t.name_ar as teacher_name_ar,
             s.name as student_name, s.name_ar as student_name_ar
      FROM student_evaluations se
      LEFT JOIN evaluation_forms ef ON se.form_id = ef.id
      LEFT JOIN teachers t ON se.teacher_id = t.id
      LEFT JOIN students s ON se.student_id = s.id
      WHERE se.id = ?
    `).get(req.params.id);

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    // Get answers with question details
    const answers = prepare(`
      SELECT ea.id, ea.question_id, ea.answer_type, ea.notes,
             eq.question, eq.question_ar
      FROM evaluation_answers ea
      LEFT JOIN evaluation_questions eq ON ea.question_id = eq.id
      WHERE ea.evaluation_id = ?
    `).all(req.params.id);

    res.json({ ...evaluation, answers });
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create student evaluation
router.post('/', (req, res) => {
  const { student_id, form_id, teacher_id, evaluation_date, notes, notes_ar, answers } = req.body;
  
  if (!student_id || !form_id || !teacher_id || !evaluation_date) {
    return res.status(400).json({ error: 'student_id, form_id, teacher_id, and evaluation_date are required' });
  }

  try {
    const evaluationId = uuidv4();
    
    prepare(`
      INSERT INTO student_evaluations (id, student_id, form_id, teacher_id, evaluation_date, notes, notes_ar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(evaluationId, student_id, form_id, teacher_id, evaluation_date, notes || '', notes_ar || '');

    // Insert answers - now with answer_type (completed, needs_followup, notes) and optional notes
    if (answers && answers.length > 0) {
      answers.forEach(answer => {
        prepare(`
          INSERT INTO evaluation_answers (id, evaluation_id, question_id, answer_type, notes)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          uuidv4(), 
          evaluationId, 
          answer.question_id, 
          answer.answer_type || 'completed',
          answer.notes || null
        );
      });
    }

    const newEvaluation = prepare(`
      SELECT se.*, ef.name as form_name, ef.name_ar as form_name_ar
      FROM student_evaluations se
      LEFT JOIN evaluation_forms ef ON se.form_id = ef.id
      WHERE se.id = ?
    `).get(evaluationId);
    
    res.status(201).json(newEvaluation);
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete evaluation
router.delete('/:id', (req, res) => {
  try {
    prepare('DELETE FROM student_evaluations WHERE id = ?').run(req.params.id);
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

