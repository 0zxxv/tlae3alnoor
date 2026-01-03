import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { UserRole } from '../types';

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Animation values for circles
  const circle1X = useRef(new Animated.Value(0)).current;
  const circle1Y = useRef(new Animated.Value(0)).current;
  const circle2X = useRef(new Animated.Value(0)).current;
  const circle2Y = useRef(new Animated.Value(0)).current;
  const circle3X = useRef(new Animated.Value(0)).current;
  const circle3Y = useRef(new Animated.Value(0)).current;
  const circle4X = useRef(new Animated.Value(0)).current;
  const circle4Y = useRef(new Animated.Value(0)).current;
  const circle5X = useRef(new Animated.Value(0)).current;
  const circle5Y = useRef(new Animated.Value(0)).current;
  const circle6X = useRef(new Animated.Value(0)).current;
  const circle6Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Circle 1: Slow horizontal movement
    const animateCircle1 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle1X, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(circle1X, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Circle 2: Vertical movement
    const animateCircle2 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle2Y, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(circle2Y, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Circle 3: Diagonal movement
    const animateCircle3 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(circle3X, {
              toValue: 1,
              duration: 7000,
              useNativeDriver: true,
            }),
            Animated.timing(circle3X, {
              toValue: 0,
              duration: 7000,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(circle3Y, {
              toValue: 1,
              duration: 5000,
              useNativeDriver: true,
            }),
            Animated.timing(circle3Y, {
              toValue: 0,
              duration: 5000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Circle 4: Fast horizontal movement
    const animateCircle4 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle4X, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(circle4X, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Circle 5: Slow vertical movement
    const animateCircle5 = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(circle5Y, {
            toValue: 1,
            duration: 9000,
            useNativeDriver: true,
          }),
          Animated.timing(circle5Y, {
            toValue: 0,
            duration: 9000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Circle 6: Circular/elliptical movement
    const animateCircle6 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(circle6X, {
              toValue: 1,
              duration: 6500,
              useNativeDriver: true,
            }),
            Animated.timing(circle6X, {
              toValue: 0,
              duration: 6500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(3250),
            Animated.timing(circle6Y, {
              toValue: 1,
              duration: 6500,
              useNativeDriver: true,
            }),
            Animated.timing(circle6Y, {
              toValue: 0,
              duration: 6500,
              useNativeDriver: true,
            }),
            Animated.delay(3250),
          ]),
        ])
      ).start();
    };

    animateCircle1();
    animateCircle2();
    animateCircle3();
    animateCircle4();
    animateCircle5();
    animateCircle6();
  }, []);

  const roles: { role: UserRole; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { role: 'teacher', icon: 'school', label: t('teacher') },
    { role: 'parent', icon: 'people', label: t('parent') },
    { role: 'admin', icon: 'shield-checkmark', label: t('admin') },
    { role: 'guest', icon: 'person-outline', label: 'زائر' },
  ];

  const handleLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      await login(role);
    } catch (error: any) {
      console.error('Login error details:', error);
      const errorMessage = error?.message || 'فشل تسجيل الدخول';
      
      // Show the error message directly (it already contains helpful instructions)
      Alert.alert(
        'خطأ في الاتصال', 
        errorMessage.includes('Cannot connect') || errorMessage.includes('timeout')
          ? errorMessage
          : `فشل تسجيل الدخول:\n${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Interpolate animation values to actual positions
  const circle1TranslateX = circle1X.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, width - 150],
  });
  const circle1TranslateY = circle1Y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const circle2TranslateX = circle2X.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });
  const circle2TranslateY = circle2Y.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, height - 200],
  });

  const circle3TranslateX = circle3X.interpolate({
    inputRange: [0, 1],
    outputRange: [width - 200, 50],
  });
  const circle3TranslateY = circle3Y.interpolate({
    inputRange: [0, 1],
    outputRange: [height - 300, 100],
  });

  const circle4TranslateX = circle4X.interpolate({
    inputRange: [0, 1],
    outputRange: [50, width - 250],
  });
  const circle4TranslateY = circle4Y.interpolate({
    inputRange: [0, 1],
    outputRange: [height - 150, height - 150],
  });

  const circle5TranslateX = circle5X.interpolate({
    inputRange: [0, 1],
    outputRange: [width - 180, width - 180],
  });
  const circle5TranslateY = circle5Y.interpolate({
    inputRange: [0, 1],
    outputRange: [50, height - 250],
  });

  const circle6TranslateX = circle6X.interpolate({
    inputRange: [0, 1],
    outputRange: [width / 2 - 100, width / 2 + 100],
  });
  const circle6TranslateY = circle6Y.interpolate({
    inputRange: [0, 1],
    outputRange: [height / 2 - 50, height / 2 + 50],
  });

  return (
    <View style={styles.container}>
      {/* Animated decorative circles */}
      <Animated.View
        style={[
          styles.decorativeCircle1,
          {
            transform: [
              { translateX: circle1TranslateX },
              { translateY: circle1TranslateY },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle2,
          {
            transform: [
              { translateX: circle2TranslateX },
              { translateY: circle2TranslateY },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle3,
          {
            transform: [
              { translateX: circle3TranslateX },
              { translateY: circle3TranslateY },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle4,
          {
            transform: [
              { translateX: circle4TranslateX },
              { translateY: circle4TranslateY },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle5,
          {
            transform: [
              { translateX: circle5TranslateX },
              { translateY: circle5TranslateY },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.decorativeCircle6,
          {
            transform: [
              { translateX: circle6TranslateX },
              { translateY: circle6TranslateY },
            ],
          },
        ]}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header} />

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.tagline}>ننشر النور في كل مكان</Text>
          </View>

          <View style={styles.roleSection}>
            <Text style={[styles.selectRole, isRTL && styles.textRTL]}>
              {t('selectRole')}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <View style={styles.rolesGrid}>
                {roles.map(({ role, icon, label }) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.roleCard}
                    onPress={() => handleLogin(role)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.roleIcon}>
                      <Ionicons name={icon} size={26} color={colors.primary} />
                    </View>
                    <Text style={styles.roleText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  roleSection: {
    marginBottom: 32,
  },
  selectRole: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  textRTL: {
    textAlign: 'center',
  },
  rolesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  roleCard: {
    width: Math.min((width - 80) / 4, 90),
    aspectRatio: 0.85,
    backgroundColor: colors.card,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    opacity: 0.4,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    opacity: 0.25,
    zIndex: -1,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.secondary,
    opacity: 0.3,
    zIndex: -1,
  },
  decorativeCircle4: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.2,
    zIndex: -1,
  },
  decorativeCircle5: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.secondary,
    opacity: 0.35,
    zIndex: -1,
  },
  decorativeCircle6: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    opacity: 0.3,
    zIndex: -1,
  },
});
