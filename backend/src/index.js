const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tlae3 Alnoor API is running' });
});

// Image upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { image } = req.body; // base64 image data
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Extract base64 data (remove data:image/xxx;base64, prefix if present)
    let base64Data = image;
    let extension = 'jpg';
    
    if (image.startsWith('data:image/')) {
      const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        base64Data = matches[2];
      }
    }

    // Generate unique filename
    const filename = `${uuidv4()}.${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, base64Data, 'base64');

    // Return the URL path
    res.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
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
    const attendanceRoutes = require('./routes/attendance');

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
    app.use('/api/attendance', attendanceRoutes);

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

