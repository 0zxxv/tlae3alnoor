const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tlae3 Alnoor API is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Import routes after database is ready
    const authRoutes = require('./routes/auth');
    const studentsRoutes = require('./routes/students');
    const parentsRoutes = require('./routes/parents');
    const teachersRoutes = require('./routes/teachers');
    const slideshowRoutes = require('./routes/slideshow');
    const eventsRoutes = require('./routes/events');
    const announcementsRoutes = require('./routes/announcements');
    const gradesRoutes = require('./routes/grades');
    const evaluationsRoutes = require('./routes/evaluations');

    // Use routes
    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentsRoutes);
    app.use('/api/parents', parentsRoutes);
    app.use('/api/teachers', teachersRoutes);
    app.use('/api/slideshow', slideshowRoutes);
    app.use('/api/events', eventsRoutes);
    app.use('/api/announcements', announcementsRoutes);
    app.use('/api/grades', gradesRoutes);
    app.use('/api/evaluations', evaluationsRoutes);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 For mobile access, use your computer's IP address`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

