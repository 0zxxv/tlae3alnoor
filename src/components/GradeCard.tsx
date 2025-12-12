import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Grade } from '../types';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

interface GradeCardProps {
  grade: Grade;
}

export const GradeCard: React.FC<GradeCardProps> = ({ grade }) => {
  const { language, isRTL } = useLanguage();

  const subject = language === 'ar' ? grade.subjectAr : grade.subject;
  const percentage = Math.round((grade.score / grade.maxScore) * 100);

  const getGradeColor = () => {
    if (percentage >= 90) return colors.success;
    if (percentage >= 70) return colors.primary;
    if (percentage >= 50) return colors.warning;
    return colors.error;
  };

  const getGradeIcon = (): keyof typeof Ionicons.glyphMap => {
    if (percentage >= 90) return 'trophy';
    if (percentage >= 70) return 'ribbon';
    if (percentage >= 50) return 'checkmark-circle';
    return 'alert-circle';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.card}>
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={[styles.subjectRow, isRTL && styles.subjectRowRTL]}>
          <MaterialCommunityIcons name="book-open-variant" size={18} color={colors.primary} />
          <Text style={[styles.subject, isRTL && styles.textRTL]}>{subject}</Text>
        </View>
        <Text style={styles.date}>{formatDate(grade.date)}</Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Ionicons name={getGradeIcon()} size={20} color={getGradeColor()} />
          <Text style={[styles.score, { color: getGradeColor() }]}>
            {grade.score}
          </Text>
          <Text style={styles.maxScore}>/{grade.maxScore}</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%`, backgroundColor: getGradeColor() },
              ]}
            />
          </View>
          <Text style={[styles.percentage, { color: getGradeColor() }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectRowRTL: {
    flexDirection: 'row-reverse',
  },
  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textRTL: {
    textAlign: 'right',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  maxScore: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
});
