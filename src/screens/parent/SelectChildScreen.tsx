import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { LanguageToggle } from '../../components';
import { Student } from '../../types';

export const SelectChildScreen: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { getChildrenForParent, selectChild, logout } = useAuth();

  const children = getChildrenForParent();

  const handleSelectChild = (child: Student) => {
    selectChild(child);
  };

  return (
    <View style={styles.container}>
      {/* Decorative circles at bottom - positioned absolutely */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <LanguageToggle />
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={40} color={colors.primary} />
            </View>
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
                  <View style={styles.childAvatarPlaceholder}>
                    <Ionicons name="person" size={40} color={colors.textLight} />
                  </View>
                </View>
                <Text style={[styles.childName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? child.nameAr : child.name}
                </Text>
                <View style={styles.gradeRow}>
                  <Ionicons name="school-outline" size={14} color={colors.primary} />
                  <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                    {language === 'ar' ? child.gradeAr : child.grade}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  childAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childGrade: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
