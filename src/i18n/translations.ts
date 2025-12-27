export const translations = {
  en: {
    // App
    appName: "Tlae3 Alnoor",
    
    // Auth
    login: "Login",
    logout: "Logout",
    email: "Email",
    password: "Password",
    welcomeBack: "Welcome Back",
    selectRole: "Select Your Role",
    
    // Roles
    teacher: "Teacher",
    parent: "Parent",
    admin: "Admin",
    
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    grades: "Grades",
    announcements: "Announcements",
    chat: "Chat",
    events: "Events",
    students: "Students",
    slideshow: "Slideshow",
    settings: "Settings",
    profile: "Profile",
    
    // Teacher
    addGrade: "Add Grade",
    selectStudent: "Select Student",
    selectSubject: "Select Subject",
    score: "Score",
    maxScore: "Max Score",
    submit: "Submit",
    sendAnnouncement: "Send Announcement",
    announcementTitle: "Announcement Title",
    announcementContent: "Announcement Content",
    
    // Parent
    selectChild: "Select Your Child",
    viewGrades: "View Grades",
    viewAnnouncements: "View Announcements",
    upcomingEvents: "Upcoming Events",
    currentEvents: "Current Events",
    previousEvents: "Previous Events",
    
    // Admin
    addEvent: "Add Event",
    addStudent: "Add Student",
    deleteStudent: "Delete Student",
    addSlide: "Add Slide",
    eventTitle: "Event Title",
    eventDescription: "Event Description",
    eventDate: "Event Date",
    studentName: "Student Name",
    studentGrade: "Student Grade",
    
    // Chat
    typeMessage: "Type a message...",
    send: "Send",
    noMessages: "No messages yet",
    conversations: "Conversations",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    loading: "Loading...",
    noData: "No data available",
    language: "Language",
    arabic: "Arabic",
    english: "English",
    
    // Subjects
    math: "Mathematics",
    science: "Science",
    arabic_lang: "Arabic",
    english_lang: "English",
    islamicStudies: "Islamic Studies",
    
    // Greetings
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
  },
  
  ar: {
    // App
    appName: "طلائع النور",
    
    // Auth
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    welcomeBack: "مرحباً بعودتك",
    selectRole: "اختر دورك",
    
    // Roles
    teacher: "معلمة",
    parent: "ولي أمر",
    admin: "مدير",
    
    // Navigation
    home: "الرئيسية",
    dashboard: "لوحة التحكم",
    grades: "الدرجات",
    announcements: "الإعلانات",
    chat: "المحادثات",
    events: "الفعاليات",
    students: "الطالبات",
    slideshow: "عرض الصور",
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    
    // Teacher
    addGrade: "إضافة درجة",
    selectStudent: "اختر الطالبة",
    selectSubject: "اختر المادة",
    score: "الدرجة",
    maxScore: "الدرجة القصوى",
    submit: "إرسال",
    sendAnnouncement: "إرسال إعلان",
    announcementTitle: "عنوان الإعلان",
    announcementContent: "محتوى الإعلان",
    
    // Parent
    selectChild: "اختر طفلك",
    viewGrades: "عرض الدرجات",
    viewAnnouncements: "عرض الإعلانات",
    upcomingEvents: "الفعاليات القادمة",
    currentEvents: "الفعاليات الحالية",
    previousEvents: "الفعاليات السابقة",
    
    // Admin
    addEvent: "إضافة فعالية",
    addStudent: "إضافة طالبة",
    deleteStudent: "حذف طالبة",
    addSlide: "إضافة صورة",
    eventTitle: "عنوان الفعالية",
    eventDescription: "وصف الفعالية",
    eventDate: "تاريخ الفعالية",
    studentName: "اسم الطالبة",
    studentGrade: "صف الطالبة",
    
    // Chat
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
    noMessages: "لا توجد رسائل بعد",
    conversations: "المحادثات",
    
    // Common
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    confirm: "تأكيد",
    success: "نجاح",
    error: "خطأ",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    language: "اللغة",
    arabic: "العربية",
    english: "الإنجليزية",
    
    // Subjects
    math: "الرياضيات",
    science: "العلوم",
    arabic_lang: "اللغة العربية",
    english_lang: "اللغة الإنجليزية",
    islamicStudies: "التربية الإسلامية",
    
    // Greetings
    goodMorning: "صباح الخير",
    goodAfternoon: "مساء الخير",
    goodEvening: "مساء الخير",
  },
};

export type TranslationKey = keyof typeof translations.en;

