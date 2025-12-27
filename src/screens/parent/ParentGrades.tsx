import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, GradeCard } from '../../components';
import { mockGrades } from '../../data/mockData';

export const ParentGrades: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { selectedChild } = useAuth();

  // Get grades for selected child
  const childGrades = mockGrades.filter((g) => g.studentId === selectedChild?.id);

  // Calculate average
  const average = childGrades.length > 0
    ? Math.round(
        childGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
        childGrades.length
      )
    : 0;

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {t('grades')}
        </Text>

        {/* Child Info */}
        <View style={[styles.childInfo, isRTL && styles.childInfoRTL]}>
          <View style={styles.childAvatar}>
            <Ionicons name="person" size={28} color={colors.textLight} />
          </View>
          <View style={styles.childDetails}>
            <Text style={[styles.childName, isRTL && styles.textRTL]}>
              {selectedChild?.nameAr || selectedChild?.name}
            </Text>
            <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
              {selectedChild?.gradeAr || selectedChild?.grade}
            </Text>
          </View>
        </View>

        {/* Average Score */}
        <View style={styles.averageCard}>
          <Text style={styles.averageLabel}>المعدل العام</Text>
          <View style={styles.averageCircle}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={styles.averageValue}>{average}%</Text>
          </View>
          <Text style={styles.averageSubtext}>
            من {childGrades.length} مواد
          </Text>
        </View>

        {/* Grades List */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          جميع الدرجات
        </Text>
        
        {childGrades.length > 0 ? (
          childGrades.map((grade) => (
            <GradeCard key={grade.id} grade={grade} />
          ))
        ) : (
          <View style={styles.noData}>
            <Ionicons name="stats-chart-outline" size={48} color={colors.border} />
            <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
              {t('noData')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childInfoRTL: {
    flexDirection: 'row-reverse',
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  childGrade: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  averageCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  averageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  averageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  averageSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
