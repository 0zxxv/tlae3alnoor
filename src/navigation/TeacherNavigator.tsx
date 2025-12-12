import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import {
  TeacherDashboard,
  TeacherGrades,
  TeacherAnnouncements,
  TeacherChat,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Text style={styles.icon}>{icon}</Text>
  </View>
);

const TeacherStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
    <Stack.Screen name="TeacherGrades" component={TeacherGrades} />
    <Stack.Screen name="TeacherAnnouncements" component={TeacherAnnouncements} />
    <Stack.Screen name="TeacherChat" component={TeacherChat} />
  </Stack.Navigator>
);

export const TeacherNavigator: React.FC = () => {
  const { t, isRTL } = useLanguage();

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
        component={TeacherStack}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Grades"
        component={TeacherGrades}
        options={{
          tabBarLabel: t('grades'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📝" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={TeacherAnnouncements}
        options={{
          tabBarLabel: t('announcements'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📢" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={TeacherChat}
        options={{
          tabBarLabel: t('chat'),
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: colors.secondary,
  },
  icon: {
    fontSize: 22,
  },
});

