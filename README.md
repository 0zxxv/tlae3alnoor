# طالع النور | Tlae3 Alnoor

A bilingual (Arabic/English) educational React Native app built with Expo SDK 54.

## 🎨 Design

- **Primary Color:** Pink (#fc0390)
- **Bilingual Support:** Arabic and English with easy toggle button
- **RTL Support:** Full right-to-left layout support for Arabic

## 👥 User Roles

### 👩‍🏫 Teacher
- View dashboard with statistics
- Add grades to students
- Send announcements (bilingual)
- Chat with parents, admin, and other teachers

### 👨‍👩‍👧 Parent
- Select which child to view
- Dashboard with slideshow at top
- View child's grades
- View announcements
- View events (upcoming, current, previous)

### 👨‍💼 Admin
- Manage students (add/delete)
- Manage events (add/delete with date and type)
- Manage slideshow images
- View dashboard with statistics

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- Expo CLI
- Expo Go app on your mobile device

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

1. Scan the QR code with Expo Go (Android) or Camera app (iOS)
2. Select your role (Teacher, Parent, or Admin) on the login screen
3. Use the language toggle (EN/عربي) to switch between English and Arabic

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── Slideshow.tsx
│   ├── LanguageToggle.tsx
│   ├── GradeCard.tsx
│   ├── EventCard.tsx
│   └── AnnouncementCard.tsx
├── context/          # React Context providers
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── data/             # Mock data
│   └── mockData.ts
├── i18n/             # Translations
│   └── translations.ts
├── navigation/       # Navigation configuration
│   ├── AppNavigator.tsx
│   ├── TeacherNavigator.tsx
│   ├── ParentNavigator.tsx
│   └── AdminNavigator.tsx
├── screens/          # Screen components
│   ├── LoginScreen.tsx
│   ├── teacher/
│   ├── parent/
│   └── admin/
├── theme/            # Theme configuration
│   └── colors.ts
└── types/            # TypeScript types
    └── index.ts
```

## 🌟 Features

### Bilingual Support
- Toggle between Arabic and English with one tap
- Full RTL layout support for Arabic
- All content available in both languages

### Teacher Features
- **Dashboard:** Overview of students, announcements, and messages
- **Grades:** Add and view grades for all students by subject
- **Announcements:** Create bilingual announcements
- **Chat:** Real-time messaging with parents and admin

### Parent Features
- **Child Selection:** Choose which child's information to view
- **Dashboard:** Slideshow, quick stats, grades preview, announcements
- **Grades:** Detailed view of child's grades with averages
- **Events:** Filter by upcoming, current, or previous events

### Admin Features
- **Dashboard:** Statistics and quick access to management
- **Students:** Add new students, delete existing ones
- **Events:** Create events with type (upcoming/current/previous)
- **Slideshow:** Add and manage slideshow images

## 📱 Screenshots

The app features a modern, pink-themed design with:
- Clean card-based layouts
- Intuitive navigation
- Smooth animations
- Professional typography

## 🛠️ Tech Stack

- **React Native** with TypeScript
- **Expo SDK 54**
- **React Navigation** v7
- **Async Storage** for persistence
- **Expo Image Picker** for slideshow management
- **Expo Localization** for i18n support

## 📄 License

This project is private and proprietary.

---

Made with ❤️ for **Tlae3 Alnoor** (طالع النور)

