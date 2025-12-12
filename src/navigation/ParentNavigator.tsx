import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import {
  SelectChildScreen,
  ParentDashboard,
  ParentGrades,
  ParentAnnouncements,
  ParentEvents,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Text style={styles.icon}>{icon}</Text>
  </View>
);

const ParentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
    <Stack.Screen name="ParentGrades" component={ParentGrades} />
    <Stack.Screen name="ParentAnnouncements" component={ParentAnnouncements} />
    <Stack.Screen name="ParentEvents" component={ParentEvents} />
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
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Grades"
        component={ParentGrades}
        options={{
          tabBarLabel: t('grades'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={ParentAnnouncements}
        options={{
          tabBarLabel: t('announcements'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📢" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={ParentEvents}
        options={{
          tabBarLabel: t('events'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
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

