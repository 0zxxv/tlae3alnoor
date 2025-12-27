import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import {
  AdminDashboard,
  AdminStudents,
  AdminEvents,
  AdminSlideshow,
  AdminParents,
  AdminTeachers,
  AdminEvaluationForms,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminStudents" component={AdminStudents} />
    <Stack.Screen name="AdminEvents" component={AdminEvents} />
    <Stack.Screen name="AdminSlideshow" component={AdminSlideshow} />
    <Stack.Screen name="AdminParents" component={AdminParents} />
    <Stack.Screen name="AdminTeachers" component={AdminTeachers} />
    <Stack.Screen name="AdminEvaluationForms" component={AdminEvaluationForms} />
  </Stack.Navigator>
);

export const AdminNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminStack}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Students"
        component={AdminStudents}
        options={{
          tabBarLabel: t('students'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'school' : 'school-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={AdminEvents}
        options={{
          tabBarLabel: t('events'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Slideshow"
        component={AdminSlideshow}
        options={{
          tabBarLabel: t('slideshow'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'images' : 'images-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
