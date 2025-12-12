import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { mockStudents, mockEvents, mockSlideshow } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const navigation = useNavigation<any>();

  const quickActions = [
    { id: 'students', title: t('students'), titleAr: 'الطلاب', icon: '👨‍🎓', screen: 'AdminStudents' },
    { id: 'events', title: t('events'), titleAr: 'الفعاليات', icon: '📅', screen: 'AdminEvents' },
    { id: 'slideshow', title: t('slideshow'), titleAr: 'عرض الصور', icon: '🖼️', screen: 'AdminSlideshow' },
  ];

  const stats = [
    { label: language === 'ar' ? 'الطلاب' : 'Students', value: mockStudents.length, icon: '👨‍🎓', color: colors.primary },
    { label: language === 'ar' ? 'الفعاليات' : 'Events', value: mockEvents.length, icon: '📅', color: colors.success },
    { label: language === 'ar' ? 'الصور' : 'Slides', value: mockSlideshow.length, icon: '🖼️', color: colors.warning },
  ];

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEmoji}>👨‍💼</Text>
          <Text style={[styles.welcomeText, isRTL && styles.textRTL]}>
            {language === 'ar' ? 'مرحباً بك في لوحة التحكم' : 'Welcome to Admin Panel'}
          </Text>
          <Text style={[styles.welcomeSubtext, isRTL && styles.textRTL]}>
            {language === 'ar'
              ? 'إدارة الطلاب والفعاليات وعرض الصور'
              : 'Manage students, events, and slideshow'}
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {language === 'ar' ? 'إدارة سريعة' : 'Quick Management'}
        </Text>
        
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>{action.icon}</Text>
              </View>
              <Text style={[styles.actionText, isRTL && styles.textRTL]}>
                {language === 'ar' ? action.titleAr : action.title}
              </Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Card title={language === 'ar' ? 'الطلاب المسجلين' : 'Registered Students'}>
          {mockStudents.slice(0, 3).map((student) => (
            <View key={student.id} style={[styles.studentItem, isRTL && styles.studentItemRTL]}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentInitial}>
                  {(language === 'ar' ? student.nameAr : student.name).charAt(0)}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? student.nameAr : student.name}
                </Text>
                <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                  {language === 'ar' ? student.gradeAr : student.grade}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Upcoming Events Preview */}
        <Card title={language === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}>
          {mockEvents.filter(e => e.type === 'upcoming').slice(0, 2).map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <Text style={[styles.eventTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? event.titleAr : event.title}
              </Text>
              <Text style={[styles.eventDate, isRTL && styles.textRTL]}>
                {new Date(event.date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
              </Text>
            </View>
          ))}
        </Card>
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
  welcomeEmoji: {
    fontSize: 48,
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
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
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
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionArrow: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  studentItemRTL: {
    flexDirection: 'row-reverse',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  studentGrade: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  eventItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: colors.primary,
  },
});

