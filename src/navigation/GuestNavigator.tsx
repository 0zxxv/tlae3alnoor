import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';
import { Header, Slideshow } from '../components';
import { ParentEvents, ParentAnnouncements } from '../screens';
import { slideshowApi } from '../services/api';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Guest Home Screen - shows welcome and general info
const GuestHomeScreen: React.FC = () => {
  const { isRTL } = useLanguage();
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const data = await slideshowApi.getAll();
      const formattedSlides = data.map((slide: any) => ({
        id: slide.id,
        uri: slide.image_url,
        title: slide.title,
        titleAr: slide.title_ar,
      }));
      setSlides(formattedSlides);
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/97336555634');
  };

  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/tlae3.alnoor?igsh=MXNxejNncWlwMjhndw==');
  };

  return (
    <View style={styles.container}>
      <Header title="أهلاً بك" showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Bar - Logo, Name, Social Icons */}
        <View style={styles.headerBar}>
          <View style={styles.socialIconsLeft}>
            <TouchableOpacity style={styles.socialButtonSmall} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButtonSmall} onPress={openInstagram}>
              <Ionicons name="logo-instagram" size={22} color="#E4405F" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>طلائع النور</Text>
            <Text style={styles.headerSubtitle}>مركز تعليمي ديني للفتيات</Text>
          </View>
          
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logoSmall}
          />
        </View>

        {/* Slideshow */}
        {slides.length > 0 && <Slideshow images={slides} />}

        {/* About Section */}
        <View style={styles.infoCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            من نحن؟
          </Text>
          <Text style={[styles.aboutText, isRTL && styles.textRTL]}>
            مركز تعليم ديني للفتيات في منطقة اسكان عالي - البحرين
          </Text>
          <Text style={[styles.aboutSubText, isRTL && styles.textRTL]}>
            تحت مظلة مجلس طلبة العلوم الدينية
          </Text>
        </View>

        {/* Programs Section */}
        <View style={styles.infoCard}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            دورات المركز
          </Text>
          
          <View style={styles.classItem}>
            <Ionicons name="flower" size={24} color={colors.primary} />
            <Text style={styles.className}>برنامج البراعم</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={styles.className}>برنامج التكليف</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="rose" size={24} color={colors.primary} />
            <Text style={styles.className}>برنامج الياسمين</Text>
          </View>
          
          <View style={styles.classItem}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.className}>برنامج الرياحين</Text>
          </View>
        </View>
        
        <View style={styles.bottomSpacer} />
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
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={GuestStack}
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
        name="Events"
        component={ParentEvents}
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
        name="Announcements"
        component={ParentAnnouncements}
        options={{
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
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  socialIconsLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textRTL: {
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
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
  aboutText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
    lineHeight: 26,
    marginBottom: 12,
  },
  aboutSubText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  classItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'flex-start',
  },
  className: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  bottomSpacer: {
    height: 24,
  },
});

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    height: 60,
  },
});

