import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { LanguageToggle } from './LanguageToggle';

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
  showLogout?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showLanguageToggle = true,
  showLogout = false,
}) => {
  const { t, isRTL, language } = useLanguage();
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const userName = language === 'ar' ? user?.nameAr : user?.name;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.container, isRTL && styles.containerRTL]}>
        <View style={styles.leftSection}>
          {user && (
            <View style={styles.userInfo}>
              {user.avatar && (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              )}
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
          )}
          {title && !user && <Text style={styles.title}>{title}</Text>}
        </View>

        <View style={styles.rightSection}>
          {showLanguageToggle && <LanguageToggle />}
          {showLogout && (
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  logoutText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

