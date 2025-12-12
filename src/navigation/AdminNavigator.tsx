import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import {
  AdminDashboard,
  AdminStudents,
  AdminEvents,
  AdminSlideshow,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Text style={styles.icon}>{icon}</Text>
  </View>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    <Stack.Screen name="AdminStudents" component={AdminStudents} />
    <Stack.Screen name="AdminEvents" component={AdminEvents} />
    <Stack.Screen name="AdminSlideshow" component={AdminSlideshow} />
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
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Students"
        component={AdminStudents}
        options={{
          tabBarLabel: t('students'),
          tabBarIcon: ({ focused }) => <TabIcon icon="👨‍🎓" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Events"
        component={AdminEvents}
        options={{
          tabBarLabel: t('events'),
          tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Slideshow"
        component={AdminSlideshow}
        options={{
          tabBarLabel: t('slideshow'),
          tabBarIcon: ({ focused }) => <TabIcon icon="🖼️" focused={focused} />,
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

