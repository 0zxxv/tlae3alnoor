# Tlae3 Alnoor Backend API

Backend server for the Tlae3 Alnoor Academy mobile app.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Server will run on:**
   - Default: `http://localhost:3000`
   - The server listens on all network interfaces (`0.0.0.0`)

## Default Credentials

### Admin
- Username: `admin`
- Password: `admin123`

### Demo Parent
- Mobile: `0501234567`
- Password: `123456`

### Demo Teacher
- Mobile: `0509876543`
- Password: `123456`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login for all user types
- `POST /api/auth/demo-login` - Demo login (no password required)

### Parents
- `GET /api/parents` - Get all parents
- `GET /api/parents/:id` - Get parent by ID
- `POST /api/parents` - Create parent
- `PUT /api/parents/:id` - Update parent
- `DELETE /api/parents/:id` - Delete parent

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/parent/:parentId` - Get students by parent
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Slideshow
- `GET /api/slideshow` - Get active slides
- `GET /api/slideshow?all=true` - Get all slides
- `POST /api/slideshow` - Create slide
- `PUT /api/slideshow/:id` - Update slide
- `DELETE /api/slideshow/:id` - Delete slide

### Events
- `GET /api/events` - Get all events
- `GET /api/events?type=upcoming` - Get events by type
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades?student_id=xxx` - Get grades by student
- `POST /api/grades` - Create grade
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Evaluation Forms
- `GET /api/evaluations/forms` - Get all forms
- `GET /api/evaluations/forms/:id` - Get form with questions
- `POST /api/evaluations/forms` - Create form with questions
- `PUT /api/evaluations/forms/:id` - Update form
- `DELETE /api/evaluations/forms/:id` - Delete form
- `POST /api/evaluations/forms/:formId/questions` - Add question to form

### Student Evaluations
- `GET /api/evaluations/student/:studentId` - Get evaluations for student
- `GET /api/evaluations/:id` - Get evaluation details
- `POST /api/evaluations` - Create evaluation
- `DELETE /api/evaluations/:id` - Delete evaluation

## Database

The SQLite database is automatically created in the `data/` folder when the server starts.

## Connecting Mobile App

1. Find your computer's local IP address
2. Update `src/config/api.ts` in the mobile app with your IP:
   ```typescript
   return 'http://YOUR_IP_ADDRESS:3000/api';
   ```

3. Make sure your phone and computer are on the same network

## Features

- **Parent Management**: Admin can create parent accounts with mobile number and password
- **Student Management**: Link students to parents (parents can have multiple students)
- **Teacher Management**: Admin can create teacher accounts
- **Evaluation Forms**: Admin creates forms with customizable answer types
- **Student Evaluations**: Teachers evaluate students using forms
- **Slideshow Management**: Add/edit/delete slideshow images
- **Events & Announcements**: Manage school events and announcements

