import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Student, UserRole } from '../types';
import { authApi, studentsApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  selectedChild: Student | null;
  isAuthenticated: boolean;
  childrenList: Student[];
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
  selectChild: (student: Student) => void;
  getChildrenForParent: () => Student[];
  refreshChildren: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [childrenList, setChildrenList] = useState<Student[]>([]);

  const fetchChildrenForParent = useCallback(async (parentId: string) => {
    try {
      const children = await studentsApi.getByParent(parentId);
      setChildrenList(children.map((child: any) => ({
        id: child.id.toString(),
        name: child.name,
        nameAr: child.name_ar,
        grade: child.grade,
        gradeAr: child.grade_ar,
        parentId: child.parent_id?.toString(),
      })));
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildrenList([]);
    }
  }, []);

  const login = async (role: UserRole) => {
    try {
      // Guest login doesn't need API call
      if (role === 'guest') {
        const guestUser: User = {
          id: 'guest',
          name: 'Guest',
          nameAr: 'زائر',
          email: '',
          role: 'guest',
        };
        setUser(guestUser);
        return;
      }

      const response = await authApi.demoLogin(role);
      const userData = response.user;
      
      const formattedUser: User = {
        id: userData.id.toString(),
        name: userData.name,
        nameAr: userData.name_ar || userData.name,
        email: userData.email || userData.mobile || '',
        role: role,
      };
      
      setUser(formattedUser);
      
      // If parent, fetch their children
      if (role === 'parent') {
        await fetchChildrenForParent(formattedUser.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedChild(null);
    setChildrenList([]);
  };

  const selectChild = (student: Student) => {
    setSelectedChild(student);
  };

  const getChildrenForParent = (): Student[] => {
    if (!user || user.role !== 'parent') return [];
    return childrenList;
  };

  const refreshChildren = async () => {
    if (user && user.role === 'parent') {
      await fetchChildrenForParent(user.id);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedChild,
        isAuthenticated,
        childrenList,
        login,
        logout,
        selectChild,
        getChildrenForParent,
        refreshChildren,
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
