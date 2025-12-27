const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../database/init');

const router = express.Router();

// Login for all user types
router.post('/login', (req, res) => {
  const { userType, identifier, password } = req.body;

  try {
    let user;
    let table;

    switch (userType) {
      case 'admin':
        table = 'admins';
        user = prepare(`SELECT * FROM ${table} WHERE username = ?`).get(identifier);
        break;
      case 'teacher':
        table = 'teachers';
        user = prepare(`SELECT * FROM ${table} WHERE mobile = ?`).get(identifier);
        break;
      case 'parent':
        table = 'parents';
        user = prepare(`SELECT * FROM ${table} WHERE mobile = ?`).get(identifier);
        break;
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Remove password from response
    delete user.password;

    // If parent, get their children
    if (userType === 'parent') {
      const children = prepare(`
        SELECT id, name, name_ar, grade, grade_ar 
        FROM students WHERE parent_id = ?
      `).all(user.id);
      user.children = children;
    }

    res.json({ user, userType });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Demo login (no password required)
router.post('/demo-login', (req, res) => {
  const { userType } = req.body;

  try {
    let user;

    switch (userType) {
      case 'admin':
        user = prepare('SELECT id, username, name, name_ar FROM admins LIMIT 1').get();
        break;
      case 'teacher':
        user = prepare('SELECT id, mobile, name, name_ar FROM teachers LIMIT 1').get();
        break;
      case 'parent':
        user = prepare('SELECT id, mobile, name, name_ar FROM parents LIMIT 1').get();
        if (user) {
          const children = prepare(`
            SELECT id, name, name_ar, grade, grade_ar 
            FROM students WHERE parent_id = ?
          `).all(user.id);
          user.children = children;
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ error: 'No demo user available' });
    }

    res.json({ user, userType });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

