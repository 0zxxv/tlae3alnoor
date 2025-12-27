const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'database.sqlite');

let db = null;

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Parents table
  db.run(`
    CREATE TABLE IF NOT EXISTS parents (
      id TEXT PRIMARY KEY,
      mobile TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      parent_id TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      grade TEXT NOT NULL,
      grade_ar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
    )
  `);

  // Teachers table
  db.run(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      mobile TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Slideshow table
  db.run(`
    CREATE TABLE IF NOT EXISTS slideshow (
      id TEXT PRIMARY KEY,
      uri TEXT NOT NULL,
      title TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events table
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description TEXT,
      description_ar TEXT,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Announcements table
  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  // Grades table
  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      subject_ar TEXT NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      date TEXT NOT NULL,
      teacher_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  // Evaluation Forms
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluation_forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      description TEXT,
      description_ar TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Evaluation Form Questions
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluation_questions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      question TEXT NOT NULL,
      question_ar TEXT NOT NULL,
      answer_type TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (form_id) REFERENCES evaluation_forms(id) ON DELETE CASCADE
    )
  `);

  // Answer Options
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluation_answer_options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      option_text_ar TEXT NOT NULL,
      option_value INTEGER NOT NULL,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES evaluation_questions(id) ON DELETE CASCADE
    )
  `);

  // Student Evaluations
  db.run(`
    CREATE TABLE IF NOT EXISTS student_evaluations (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      form_id TEXT NOT NULL,
      teacher_id TEXT NOT NULL,
      evaluation_date TEXT NOT NULL,
      notes TEXT,
      notes_ar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (form_id) REFERENCES evaluation_forms(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  // Evaluation Answers
  db.run(`
    CREATE TABLE IF NOT EXISTS evaluation_answers (
      id TEXT PRIMARY KEY,
      evaluation_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_option_id TEXT NOT NULL,
      FOREIGN KEY (evaluation_id) REFERENCES student_evaluations(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES evaluation_questions(id),
      FOREIGN KEY (selected_option_id) REFERENCES evaluation_answer_options(id)
    )
  `);

  // Chat messages
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender_type TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_type TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin if not exists
  const adminResult = db.exec("SELECT id FROM admins WHERE username = 'admin'");
  if (adminResult.length === 0 || adminResult[0].values.length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`
      INSERT INTO admins (id, username, password, name, name_ar) 
      VALUES (?, ?, ?, ?, ?)
    `, [uuidv4(), 'admin', hashedPassword, 'Amal Alnashaba', 'أمل النشابة']);
  }

  // Insert sample data for demo
  insertSampleData();
  
  // Save database
  saveDatabase();
  
  console.log('✅ Database initialized successfully');
  return db;
}

function insertSampleData() {
  // Check if we already have sample data
  const hasParents = db.exec('SELECT COUNT(*) as count FROM parents');
  if (hasParents.length > 0 && hasParents[0].values[0][0] > 0) return;

  const hashedPassword = bcrypt.hashSync('123456', 10);

  // Sample Parents
  const parent1Id = uuidv4();
  const parent2Id = uuidv4();
  
  db.run(`INSERT INTO parents (id, mobile, password, name, name_ar) VALUES (?, ?, ?, ?, ?)`,
    [parent1Id, '0501234567', hashedPassword, 'Ahmed Mohammed', 'أحمد محمد']);
  
  db.run(`INSERT INTO parents (id, mobile, password, name, name_ar) VALUES (?, ?, ?, ?, ?)`,
    [parent2Id, '0507654321', hashedPassword, 'Khalid Ali', 'خالد علي']);

  // Sample Students
  const student1Id = uuidv4();
  const student2Id = uuidv4();
  const student3Id = uuidv4();

  db.run(`INSERT INTO students (id, parent_id, name, name_ar, grade, grade_ar) VALUES (?, ?, ?, ?, ?, ?)`,
    [student1Id, parent1Id, 'Fatima Ahmed', 'فاطمة أحمد', 'Grade 5', 'الصف الخامس']);
  
  db.run(`INSERT INTO students (id, parent_id, name, name_ar, grade, grade_ar) VALUES (?, ?, ?, ?, ?, ?)`,
    [student2Id, parent1Id, 'Maryam Ahmed', 'مريم أحمد', 'Grade 3', 'الصف الثالث']);
  
  db.run(`INSERT INTO students (id, parent_id, name, name_ar, grade, grade_ar) VALUES (?, ?, ?, ?, ?, ?)`,
    [student3Id, parent2Id, 'Nora Khalid', 'نورة خالد', 'Grade 4', 'الصف الرابع']);

  // Sample Teacher
  const teacher1Id = uuidv4();
  db.run(`INSERT INTO teachers (id, mobile, password, name, name_ar) VALUES (?, ?, ?, ?, ?)`,
    [teacher1Id, '0509876543', hashedPassword, 'Sara Abdullah', 'سارة عبدالله']);

  // Sample Slideshow
  db.run(`INSERT INTO slideshow (id, uri, title, title_ar, display_order) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800', 'Welcome to Our Academy', 'مرحباً بكم في أكاديميتنا', 1]);
  
  db.run(`INSERT INTO slideshow (id, uri, title, title_ar, display_order) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 'Excellence in Education', 'التميز في التعليم', 2]);

  // Sample Events
  db.run(`INSERT INTO events (id, title, title_ar, description, description_ar, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), 'Parent Meeting', 'اجتماع أولياء الأمور', 'Annual parent-teacher meeting', 'الاجتماع السنوي للمعلمات وأولياء الأمور', '2025-01-15', 'upcoming']);
  
  db.run(`INSERT INTO events (id, title, title_ar, description, description_ar, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), 'Science Fair', 'معرض العلوم', 'Annual science exhibition', 'المعرض العلمي السنوي', '2025-02-01', 'upcoming']);

  // Sample Announcements
  db.run(`INSERT INTO announcements (id, title, title_ar, content, content_ar, teacher_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), 'Welcome Back', 'أهلاً بعودتكم', 'Welcome back to the new semester!', 'أهلاً بكم في الفصل الدراسي الجديد!', teacher1Id]);

  // Sample Evaluation Form
  const formId = uuidv4();
  db.run(`INSERT INTO evaluation_forms (id, name, name_ar, description, description_ar) VALUES (?, ?, ?, ?, ?)`,
    [formId, 'Monthly Behavior Evaluation', 'تقييم السلوك الشهري', 'Monthly student behavior assessment', 'التقييم الشهري لسلوك الطالبة']);

  const q1Id = uuidv4();
  const q2Id = uuidv4();
  
  db.run(`INSERT INTO evaluation_questions (id, form_id, question, question_ar, answer_type, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [q1Id, formId, 'Classroom Participation', 'المشاركة في الصف', 'scale', 1]);
  
  db.run(`INSERT INTO evaluation_questions (id, form_id, question, question_ar, answer_type, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [q2Id, formId, 'Homework Completion', 'إكمال الواجبات', 'pass_fail', 2]);

  // Answer options for question 1 (scale)
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q1Id, 'Excellent', 'ممتاز', 5, 1]);
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q1Id, 'Very Good', 'جيد جداً', 4, 2]);
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q1Id, 'Good', 'جيد', 3, 3]);
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q1Id, 'Needs Improvement', 'يحتاج تحسين', 2, 4]);

  // Answer options for question 2 (pass/fail)
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q2Id, 'Pass', 'ناجح', 1, 1]);
  db.run(`INSERT INTO evaluation_answer_options (id, question_id, option_text, option_text_ar, option_value, display_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [uuidv4(), q2Id, 'Fail', 'راسب', 0, 2]);

  console.log('✅ Sample data inserted successfully');
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDb() {
  return db;
}

// Helper functions to match better-sqlite3 API
function prepare(sql) {
  return {
    get: (...params) => {
      const result = db.exec(sql, params);
      if (result.length === 0 || result[0].values.length === 0) return undefined;
      const columns = result[0].columns;
      const values = result[0].values[0];
      const row = {};
      columns.forEach((col, i) => { row[col] = values[i]; });
      return row;
    },
    all: (...params) => {
      const result = db.exec(sql, params);
      if (result.length === 0) return [];
      const columns = result[0].columns;
      return result[0].values.map(values => {
        const row = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        return row;
      });
    },
    run: (...params) => {
      db.run(sql, params);
      saveDatabase();
      return { changes: db.getRowsModified() };
    }
  };
}

module.exports = { 
  initializeDatabase, 
  getDb, 
  saveDatabase,
  prepare
};
