import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import {
  SelectChildScreen,
  ParentDashboard,
  ParentGrades,
  ParentAnnouncements,
  ParentEvents,
  ParentEvaluations,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ParentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
    <Stack.Screen name="ParentGrades" component={ParentGrades} />
    <Stack.Screen name="ParentAnnouncements" component={ParentAnnouncements} />
    <Stack.Screen name="ParentEvents" component={ParentEvents} />
    <Stack.Screen name="ParentEvaluations" component={ParentEvaluations} />
  </Stack.Navigator>
);

const ParentTabs: React.FC = () => {
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
        component={ParentStack}
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
        name="Grades"
        component={ParentGrades}
        options={{
          tabBarLabel: t('grades'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'stats-chart' : 'stats-chart-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={ParentAnnouncements}
        options={{
          tabBarLabel: t('announcements'),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'megaphone' : 'megaphone-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={ParentEvents}
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
        name="Evaluations"
        component={ParentEvaluations}
        options={{
          tabBarLabel: 'Evaluations',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'clipboard' : 'clipboard-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const ParentNavigator: React.FC = () => {
  const { selectedChild } = useAuth();

  // If no child selected, show selection screen
  if (!selectedChild) {
    return <SelectChildScreen />;
  }

  return <ParentTabs />;
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
