import { User, Student, Grade, Announcement, Event, SlideShowImage, ChatMessage } from '../types';

// Users
export const mockUsers: User[] = [
  {
    id: 'teacher1',
    name: 'Sarah Ahmed',
    nameAr: 'سارة أحمد',
    email: 'teacher@tlae3alnoor.com',
    role: 'teacher',
  },
  {
    id: 'parent1',
    name: 'Mohammed Ali',
    nameAr: 'محمد علي',
    email: 'parent@tlae3alnoor.com',
    role: 'parent',
  },
  {
    id: 'admin1',
    name: 'Amal Alnashaba',
    nameAr: 'أمل النشابة',
    email: 'admin@tlae3alnoor.com',
    role: 'admin',
  },
];

// Students
export const mockStudents: Student[] = [
  {
    id: 'student1',
    name: 'Layla Mohammed',
    nameAr: 'ليلى محمد',
    grade: 'Grade 3',
    gradeAr: 'الصف الثالث',
    parentId: 'parent1',
  },
  {
    id: 'student2',
    name: 'Omar Mohammed',
    nameAr: 'عمر محمد',
    grade: 'Grade 1',
    gradeAr: 'الصف الأول',
    parentId: 'parent1',
  },
  {
    id: 'student3',
    name: 'Noor Khalid',
    nameAr: 'نور خالد',
    grade: 'Grade 2',
    gradeAr: 'الصف الثاني',
    parentId: 'parent2',
  },
];

// Grades
export const mockGrades: Grade[] = [
  {
    id: 'grade1',
    studentId: 'student1',
    subject: 'Mathematics',
    subjectAr: 'الرياضيات',
    score: 95,
    maxScore: 100,
    date: '2024-12-10',
    teacherId: 'teacher1',
  },
  {
    id: 'grade2',
    studentId: 'student1',
    subject: 'Science',
    subjectAr: 'العلوم',
    score: 88,
    maxScore: 100,
    date: '2024-12-09',
    teacherId: 'teacher1',
  },
  {
    id: 'grade3',
    studentId: 'student1',
    subject: 'Arabic',
    subjectAr: 'اللغة العربية',
    score: 92,
    maxScore: 100,
    date: '2024-12-08',
    teacherId: 'teacher1',
  },
  {
    id: 'grade4',
    studentId: 'student2',
    subject: 'Mathematics',
    subjectAr: 'الرياضيات',
    score: 85,
    maxScore: 100,
    date: '2024-12-10',
    teacherId: 'teacher1',
  },
  {
    id: 'grade5',
    studentId: 'student2',
    subject: 'English',
    subjectAr: 'اللغة الإنجليزية',
    score: 90,
    maxScore: 100,
    date: '2024-12-09',
    teacherId: 'teacher1',
  },
];

// Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    title: 'School Holiday Notice',
    titleAr: 'إشعار إجازة المدرسة',
    content: 'Dear parents, please note that the school will be closed on December 25th for the holiday season. Classes will resume on January 2nd.',
    contentAr: 'أعزائي أولياء الأمور، يرجى العلم أن المدرسة ستكون مغلقة في 25 ديسمبر لموسم الأعياد. ستستأنف الدراسة في 2 يناير.',
    date: '2024-12-12',
    authorId: 'teacher1',
    authorName: 'Sarah Ahmed',
    authorNameAr: 'سارة أحمد',
  },
  {
    id: 'ann2',
    title: 'Exam Schedule Released',
    titleAr: 'تم إصدار جدول الامتحانات',
    content: 'The final exam schedule has been released. Please check your child\'s grade portal for specific dates and subjects.',
    contentAr: 'تم إصدار جدول الامتحانات النهائية. يرجى التحقق من بوابة درجات طفلك للتواريخ والمواد المحددة.',
    date: '2024-12-11',
    authorId: 'admin1',
    authorName: 'Amal Alnashaba',
    authorNameAr: 'أمل النشابة',
  },
  {
    id: 'ann3',
    title: 'Parent-Teacher Meeting',
    titleAr: 'اجتماع أولياء الأمور والمعلمين',
    content: 'We invite all parents to attend the parent-teacher meeting on December 20th at 3:00 PM. Your presence is important for your child\'s progress.',
    contentAr: 'ندعو جميع أولياء الأمور لحضور اجتماع أولياء الأمور والمعلمين في 20 ديسمبر الساعة 3:00 مساءً. حضورك مهم لتقدم طفلك.',
    date: '2024-12-10',
    authorId: 'teacher1',
    authorName: 'Sarah Ahmed',
    authorNameAr: 'سارة أحمد',
  },
];

// Events
export const mockEvents: Event[] = [
  {
    id: 'event1',
    title: 'Winter Festival',
    titleAr: 'مهرجان الشتاء',
    description: 'Join us for our annual winter festival featuring performances, crafts, and refreshments!',
    descriptionAr: 'انضموا إلينا في مهرجان الشتاء السنوي الذي يضم عروضاً وأعمالاً يدوية ومرطبات!',
    date: '2024-12-20',
    type: 'upcoming',
  },
  {
    id: 'event2',
    title: 'Science Fair',
    titleAr: 'معرض العلوم',
    description: 'Students will showcase their amazing science projects. All parents are welcome!',
    descriptionAr: 'سيعرض الطلاب مشاريعهم العلمية المذهلة. نرحب بجميع أولياء الأمور!',
    date: '2024-12-15',
    type: 'current',
  },
  {
    id: 'event3',
    title: 'Sports Day',
    titleAr: 'يوم الرياضة',
    description: 'A fun-filled day of sports and activities for all students.',
    descriptionAr: 'يوم مليء بالمرح والرياضة والأنشطة لجميع الطلاب.',
    date: '2024-12-05',
    type: 'previous',
  },
  {
    id: 'event4',
    title: 'Art Exhibition',
    titleAr: 'معرض الفنون',
    description: 'Come see the beautiful artwork created by our talented students.',
    descriptionAr: 'تعالوا لرؤية الأعمال الفنية الجميلة التي أبدعها طلابنا الموهوبون.',
    date: '2024-11-28',
    type: 'previous',
  },
];

// Slideshow Images
export const mockSlideshow: SlideShowImage[] = [
  {
    id: 'slide1',
    uri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    title: 'Welcome to Tlae3 Alnoor',
    titleAr: 'مرحباً بكم في طالع النور',
  },
  {
    id: 'slide2',
    uri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
    title: 'Learning Together',
    titleAr: 'نتعلم معاً',
  },
  {
    id: 'slide3',
    uri: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    title: 'Building Bright Futures',
    titleAr: 'نبني مستقبلاً مشرقاً',
  },
];

// Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg1',
    senderId: 'parent1',
    senderName: 'Mohammed Ali',
    senderNameAr: 'محمد علي',
    receiverId: 'teacher1',
    content: 'Hello, I wanted to ask about Layla\'s progress in Math.',
    timestamp: '2024-12-12T10:30:00',
    read: true,
  },
  {
    id: 'msg2',
    senderId: 'teacher1',
    senderName: 'Sarah Ahmed',
    senderNameAr: 'سارة أحمد',
    receiverId: 'parent1',
    content: 'Hello! Layla is doing great in Math. She scored 95 in the recent test.',
    timestamp: '2024-12-12T10:35:00',
    read: true,
  },
  {
    id: 'msg3',
    senderId: 'parent1',
    senderName: 'Mohammed Ali',
    senderNameAr: 'محمد علي',
    receiverId: 'teacher1',
    content: 'That\'s wonderful! Thank you for the update.',
    timestamp: '2024-12-12T10:40:00',
    read: false,
  },
];

// Subjects list
export const subjects = [
  { id: 'math', name: 'Mathematics', nameAr: 'الرياضيات' },
  { id: 'science', name: 'Science', nameAr: 'العلوم' },
  { id: 'arabic', name: 'Arabic', nameAr: 'اللغة العربية' },
  { id: 'english', name: 'English', nameAr: 'اللغة الإنجليزية' },
  { id: 'islamic', name: 'Islamic Studies', nameAr: 'التربية الإسلامية' },
];

