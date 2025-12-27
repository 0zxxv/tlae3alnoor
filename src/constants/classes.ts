// Academy classes
export const ACADEMY_CLASSES = [
  { id: 'baraem', name: 'البراعم', nameAr: 'البراعم' },
  { id: 'takleef', name: 'التكليف', nameAr: 'التكليف' },
  { id: 'yasmin', name: 'الياسمين', nameAr: 'الياسمين' },
  { id: 'rayaheen', name: 'الرياحين', nameAr: 'الرياحين' },
];

// Evaluation categories for students
export const EVALUATION_CATEGORIES = [
  { id: 'wudu', name: 'الوضوء', nameAr: 'الوضوء', icon: 'water' },
  { id: 'salah', name: 'الصلاة', nameAr: 'الصلاة', icon: 'moon' },
  { id: 'behavior', name: 'السلوك', nameAr: 'السلوك', icon: 'heart' },
  { id: 'participation', name: 'المشاركة', nameAr: 'المشاركة', icon: 'hand-left' },
  { id: 'hijab', name: 'الحجاب', nameAr: 'الحجاب', icon: 'shirt' },
];

export type AcademyClass = typeof ACADEMY_CLASSES[number];
export type EvaluationCategory = typeof EVALUATION_CATEGORIES[number];

