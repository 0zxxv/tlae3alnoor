import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Student, UserRole } from '../types';
import { mockUsers, mockStudents } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  selectedChild: Student | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  selectChild: (student: Student) => void;
  getChildrenForParent: () => Student[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  const login = (role: UserRole) => {
    const foundUser = mockUsers.find((u) => u.role === role);
    if (foundUser) {
      setUser(foundUser);
      // If parent, don't auto-select child - let them choose
      if (role !== 'parent') {
        setSelectedChild(null);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedChild(null);
  };

  const selectChild = (student: Student) => {
    setSelectedChild(student);
  };

  const getChildrenForParent = (): Student[] => {
    if (!user || user.role !== 'parent') return [];
    return mockStudents.filter((s) => s.parentId === user.id);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedChild,
        isAuthenticated,
        login,
        logout,
        selectChild,
        getChildrenForParent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

