import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { LanguageToggle } from '../components';
import { UserRole } from '../types';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { login } = useAuth();

  const roles: { role: UserRole; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { role: 'teacher', icon: 'school', label: t('teacher') },
    { role: 'parent', icon: 'people', label: t('parent') },
    { role: 'admin', icon: 'shield-checkmark', label: t('admin') },
  ];

  return (
    <View style={styles.container}>
      {/* Decorative circles at bottom - positioned absolutely */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <LanguageToggle />
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.tagline}>
              {isRTL ? 'تعليم بلا حدود' : 'Education Without Limits'}
            </Text>
          </View>

          <View style={styles.roleSection}>
            <Text style={[styles.selectRole, isRTL && styles.textRTL]}>
              {t('selectRole')}
            </Text>

            <View style={styles.rolesGrid}>
              {roles.map(({ role, icon, label }) => (
                <TouchableOpacity
                  key={role}
                  style={styles.roleCard}
                  onPress={() => login(role)}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleIcon}>
                    <Ionicons name={icon} size={32} color={colors.primary} />
                  </View>
                  <Text style={styles.roleText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    width: (width - 80) / 3,
    aspectRatio: 0.9,
    backgroundColor: colors.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
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
