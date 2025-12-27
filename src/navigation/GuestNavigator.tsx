import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { Header } from '../components';
import { ParentEvents, ParentAnnouncements } from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Guest Home Screen - shows welcome and general info
const GuestHomeScreen: React.FC = () => {
  const { isRTL } = useLanguage();

  return (
    <View style={styles.container}>
      <Header title="أهلاً بك" showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Ionicons name="school" size={64} color={colors.primary} />
          <Text style={[styles.welcomeTitle, isRTL && styles.textRTL]}>
            مرحباً بك في طلائع النور
          </Text>
          <Text style={[styles.welcomeText, isRTL && styles.textRTL]}>
            أكاديمية تعليمية متميزة للبنات
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            صفوف الأكاديمية
          </Text>
          
          <View style={styles.classItem}>
            <Ionicons name="flower" size={24} color={colors.primary} />
            <Text style={styles.className}>البراعم</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={styles.className}>التكليف</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="rose" size={24} color={colors.primary} />
            <Text style={styles.className}>الياسمين</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.className}>الرياحين</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            معايير التقييم
          </Text>
          
          <View style={styles.evalItem}>
            <Ionicons name="water" size={20} color={colors.primary} />
            <Text style={styles.evalName}>الوضوء</Text>
          </View>
          
          <View style={styles.evalItem}>
            <Ionicons name="moon" size={20} color={colors.primary} />
            <Text style={styles.evalName}>الصلاة</Text>
          </View>
          
          <View style={styles.evalItem}>
            <Ionicons name="heart" size={20} color={colors.primary} />
            <Text style={styles.evalName}>السلوك</Text>
          </View>
          
          <View style={styles.evalItem}>
            <Ionicons name="hand-left" size={20} color={colors.primary} />
            <Text style={styles.evalName}>المشاركة</Text>
          </View>
          
          <View style={styles.evalItem}>
            <Ionicons name="shirt" size={20} color={colors.primary} />
            <Text style={styles.evalName}>الحجاب</Text>
          </View>
        </View>

        <View style={styles.contactCard}>
          <Ionicons name="call" size={24} color={colors.primary} />
          <Text style={[styles.contactText, isRTL && styles.textRTL]}>
            للتواصل والتسجيل يرجى الاتصال بإدارة الأكاديمية
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const GuestStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
    <Stack.Screen name="GuestEvents" component={ParentEvents} />
    <Stack.Screen name="GuestAnnouncements" component={ParentAnnouncements} />
  </Stack.Navigator>
);

export const GuestNavigator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: tabStyles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={GuestStack}
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  className: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  evalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  evalName: {
    fontSize: 15,
    color: colors.text,
  },
  contactCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
});

const tabStyles = StyleSheet.create({
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

