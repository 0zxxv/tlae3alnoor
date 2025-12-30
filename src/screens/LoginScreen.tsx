import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { UserRole } from '../types';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      Alert.alert('خطأ', 'فشل تسجيل الدخول. تأكد من اتصال الخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative circles at bottom - positioned absolutely */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
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
    bottom: -50,
    left: -50,
    opacity: 0.5,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    bottom: -30,
    right: -30,
    opacity: 0.2,
    zIndex: -1,
  },
});
