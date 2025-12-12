import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { LanguageToggle, Button } from '../../components';
import { Student } from '../../types';

export const SelectChildScreen: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { getChildrenForParent, selectChild, logout } = useAuth();
  const navigation = useNavigation<any>();

  const children = getChildrenForParent();

  const handleSelectChild = (child: Student) => {
    selectChild(child);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LanguageToggle />
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('selectChild')}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {language === 'ar'
              ? 'اختر طفلك لعرض معلوماته'
              : 'Choose your child to view their information'}
          </Text>
        </View>

        <View style={styles.childrenGrid}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => handleSelectChild(child)}
              activeOpacity={0.8}
            >
              <View style={styles.childAvatarContainer}>
                {child.avatar ? (
                  <Image source={{ uri: child.avatar }} style={styles.childAvatar} />
                ) : (
                  <View style={styles.childAvatarPlaceholder}>
                    <Text style={styles.childInitial}>
                      {(language === 'ar' ? child.nameAr : child.name).charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.childName, isRTL && styles.textRTL]}>
                {language === 'ar' ? child.nameAr : child.name}
              </Text>
              <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                {language === 'ar' ? child.gradeAr : child.grade}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  logoutText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'center',
  },
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  childCard: {
    width: 150,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  childAvatarContainer: {
    marginBottom: 12,
  },
  childAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  childAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  childGrade: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.secondary,
    bottom: -100,
    left: -50,
    opacity: 0.5,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    bottom: -80,
    right: -30,
    opacity: 0.2,
  },
});

