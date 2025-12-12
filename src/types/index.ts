// User Types
export type UserRole = 'teacher' | 'parent' | 'admin';

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  nameAr: string;
  grade: string;
  gradeAr: string;
  parentId: string;
  avatar?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  subjectAr: string;
  score: number;
  maxScore: number;
  date: string;
  teacherId: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr: string;
  date: string;
  authorId: string;
  authorName: string;
  authorNameAr: string;
}

export interface Event {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  date: string;
  type: 'upcoming' | 'current' | 'previous';
  image?: string;
}

export interface SlideShowImage {
  id: string;
  uri: string;
  title: string;
  titleAr: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderNameAr: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

