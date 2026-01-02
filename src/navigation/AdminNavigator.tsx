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
  AdminChat,
  AdminAttendance,
  AdminAverageGrades,
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
    <Stack.Screen name="AdminChat" component={AdminChat} />
    <Stack.Screen name="AdminAttendance" component={AdminAttendance} />
    <Stack.Screen name="AdminAverageGrades" component={AdminAverageGrades} />
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
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminStack}
        options={{
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
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'images' : 'images-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={AdminChat}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
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
    height: 60,
  },
});
