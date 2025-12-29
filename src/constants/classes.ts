// Academy courses (دورة) with their subclasses (صف)
export const ACADEMY_COURSES = [
  { 
    id: 'baraem', 
    name: 'دورة البراعم', 
    nameAr: 'دورة البراعم', 
    icon: 'flower',
    subclasses: [
      { id: 'baraem-mustafa', name: 'صف المصطفى', nameAr: 'صف المصطفى' },
      { id: 'baraem-zahra', name: 'صف الزهراء', nameAr: 'صف الزهراء' },
    ]
  },
  { 
    id: 'takleef', 
    name: 'دورة التكليف', 
    nameAr: 'دورة التكليف', 
    icon: 'star',
    subclasses: [
      { id: 'takleef-mustafa', name: 'صف المصطفى', nameAr: 'صف المصطفى' },
      { id: 'takleef-zahra', name: 'صف الزهراء', nameAr: 'صف الزهراء' },
      { id: 'takleef-hussein', name: 'صف الحسين', nameAr: 'صف الحسين' },
      { id: 'takleef-murtada', name: 'صف المرتضى', nameAr: 'صف المرتضى' },
      { id: 'takleef-mujtaba', name: 'صف المجتبى', nameAr: 'صف المجتبى' },
    ]
  },
  { 
    id: 'yasmin', 
    name: 'دورة الياسمين', 
    nameAr: 'دورة الياسمين', 
    icon: 'rose',
    subclasses: [
      { id: 'yasmin-hussein', name: 'صف الحسين', nameAr: 'صف الحسين' },
      { id: 'yasmin-murtada', name: 'صف المرتضى', nameAr: 'صف المرتضى' },
      { id: 'yasmin-mujtaba', name: 'صف المجتبى', nameAr: 'صف المجتبى' },
    ]
  },
  { 
    id: 'rayaheen', 
    name: 'دورة الرياحين', 
    nameAr: 'دورة الرياحين', 
    icon: 'leaf',
    subclasses: [
      { id: 'rayaheen-mustafa', name: 'صف المصطفى', nameAr: 'صف المصطفى' },
      { id: 'rayaheen-zahra', name: 'صف الزهراء', nameAr: 'صف الزهراء' },
    ]
  },
];

// Flat list of all classes for backward compatibility
export const ACADEMY_CLASSES = ACADEMY_COURSES.map(course => ({
  id: course.id,
  name: course.name,
  nameAr: course.nameAr,
  icon: course.icon,
}));

// Get all subclasses for a course
export const getSubclassesForCourse = (courseId: string) => {
  const course = ACADEMY_COURSES.find(c => c.id === courseId);
  return course?.subclasses || [];
};

// Evaluation categories for students
export const EVALUATION_CATEGORIES = [
  { id: 'wudu', name: 'الوضوء', nameAr: 'الوضوء', icon: 'water' },
  { id: 'salah', name: 'الصلاة', nameAr: 'الصلاة', icon: 'moon' },
  { id: 'behavior', name: 'السلوك', nameAr: 'السلوك', icon: 'heart' },
  { id: 'participation', name: 'المشاركة', nameAr: 'المشاركة', icon: 'hand-left' },
  { id: 'hijab', name: 'الحجاب', nameAr: 'الحجاب', icon: 'shirt' },
];

export type AcademyCourse = typeof ACADEMY_COURSES[number];
export type AcademyClass = typeof ACADEMY_CLASSES[number];
export type EvaluationCategory = typeof EVALUATION_CATEGORIES[number];
