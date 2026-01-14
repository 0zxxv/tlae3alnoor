import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { studentsApi, gradesApi } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [averageGrades, setAverageGrades] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const [studentsData, gradesData] = await Promise.all([
        studentsApi.getAll(),
        gradesApi.getAll(),
      ]);

      // Total students count
      setTotalStudents(studentsData.length);

      // Calculate average grades percentage
      if (gradesData.length > 0) {
        const totalPercentage = gradesData.reduce((sum: number, grade: any) => {
          if (grade.max_score && grade.max_score > 0) {
            return sum + (grade.score / grade.max_score) * 100;
          }
          return sum;
        }, 0);
        const avg = Math.round(totalPercentage / gradesData.length);
        setAverageGrades(avg);
      } else {
        setAverageGrades(0);
      }

      // TODO: Calculate average attendance when attendance API is available
      // For now, using a placeholder percentage
      setAverageAttendance(85); // Placeholder value
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const quickActions = [
    { id: 'parents', titleAr: 'أولياء الأمور', icon: 'people' as const, screen: 'AdminParents' },
    { id: 'teachers', titleAr: 'المعلمات', icon: 'person' as const, screen: 'AdminTeachers' },
    { id: 'students', titleAr: 'الطالبات', icon: 'school' as const, screen: 'AdminStudents' },
    { id: 'evaluations', titleAr: 'نماذج التقييم', icon: 'clipboard' as const, screen: 'AdminEvaluationForms' },
    { id: 'events', titleAr: 'الفعاليات', icon: 'calendar' as const, screen: 'AdminEvents' },
    { id: 'slideshow', titleAr: 'عرض الصور', icon: 'images' as const, screen: 'AdminSlideshow' },
  ];

  const stats = [
    { 
      label: 'الحضور', 
      value: `${averageAttendance}%`, 
      icon: 'calendar' as const, 
      color: colors.accentBlue,
      onPress: () => navigation.navigate('AdminAttendance'),
      pressable: true,
    },
    { 
      label: 'متوسط الدرجات', 
      value: `${averageGrades}%`, 
      icon: 'stats-chart' as const, 
      color: colors.accentYellow,
      onPress: () => navigation.navigate('AdminAverageGrades'),
      pressable: true,
    },
    { 
      label: 'الطالبات', 
      value: totalStudents, 
      icon: 'school' as const, 
      color: colors.primary,
      onPress: () => navigation.navigate('AdminStudents'),
      pressable: true,
    },
  ];

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.welcomeLogo}
            resizeMode="contain"
          />
          <Text style={[styles.welcomeText, isRTL && styles.textRTL]}>
            مرحباً بك في لوحة التحكم
          </Text>
          <Text style={[styles.welcomeSubtext, isRTL && styles.textRTL]}>
            إدارة الطالبات والفعاليات وعرض الصور
          </Text>
        </View>

        {/* Stats Section */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => {
              const StatComponent = stat.pressable ? TouchableOpacity : View;
              return (
                <StatComponent
                  key={index}
                  style={[styles.statCard, stat.pressable && styles.statCardPressable]}
                  onPress={stat.pressable ? stat.onPress : undefined}
                  activeOpacity={stat.pressable ? 0.7 : 1}
                >
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </StatComponent>
              );
            })}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          إدارة سريعة
        </Text>
        
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => {
            const iconColor = index % 3 === 1 ? colors.accentBlue : index % 3 === 2 ? colors.accentYellow : colors.primary;
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon} size={24} color={iconColor} />
                </View>
                <Text style={[styles.actionText, isRTL && styles.textRTL]}>
                  {action.titleAr}
                </Text>
                <Ionicons 
                  name={isRTL ? 'chevron-back' : 'chevron-forward'} 
                  size={20} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            );
          })}
        </View>
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
  welcomeCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  textRTL: {
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardPressable: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
