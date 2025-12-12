import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens';
import { TeacherNavigator } from './TeacherNavigator';
import { ParentNavigator } from './ParentNavigator';
import { AdminNavigator } from './AdminNavigator';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  const getNavigator = () => {
    switch (user.role) {
      case 'teacher':
        return <TeacherNavigator />;
      case 'parent':
        return <ParentNavigator />;
      case 'admin':
        return <AdminNavigator />;
      default:
        return <LoginScreen />;
    }
  };

  return <NavigationContainer>{getNavigator()}</NavigationContainer>;
};

