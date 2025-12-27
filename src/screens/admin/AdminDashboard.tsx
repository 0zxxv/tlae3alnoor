import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { mockStudents, mockEvents, mockSlideshow } from '../../data/mockData';

export const AdminDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<any>();

  const quickActions = [
    { id: 'parents', titleAr: 'أولياء الأمور', icon: 'people' as const, screen: 'AdminParents' },
    { id: 'teachers', titleAr: 'المعلمات', icon: 'person' as const, screen: 'AdminTeachers' },
    { id: 'students', titleAr: 'الطالبات', icon: 'school' as const, screen: 'AdminStudents' },
    { id: 'evaluations', titleAr: 'نماذج التقييم', icon: 'clipboard' as const, screen: 'AdminEvaluationForms' },
    { id: 'events', titleAr: 'الفعاليات', icon: 'calendar' as const, screen: 'AdminEvents' },
    { id: 'slideshow', titleAr: 'عرض الصور', icon: 'images' as const, screen: 'AdminSlideshow' },
  ];

  const stats = [
    { label: 'الطالبات', value: mockStudents.length, icon: 'school' as const, color: colors.primary },
    { label: 'الفعاليات', value: mockEvents.length, icon: 'calendar' as const, color: colors.success },
    { label: 'الصور', value: mockSlideshow.length, icon: 'images' as const, color: colors.warning },
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
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          إدارة سريعة
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
                <Ionicons name={action.icon} size={24} color={colors.primary} />
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
          ))}
        </View>

        {/* Recent Activity */}
        <Card title="الطالبات المسجلات" titleAr="الطالبات المسجلات">
          {mockStudents.slice(0, 3).map((student) => (
            <View key={student.id} style={[styles.studentItem, isRTL && styles.studentItemRTL]}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={20} color={colors.textLight} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {student.nameAr || student.name}
                </Text>
                <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                  {student.gradeAr || student.grade}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Upcoming Events Preview */}
        <Card title="الفعاليات القادمة" titleAr="الفعاليات القادمة">
          {mockEvents.filter(e => e.type === 'upcoming').slice(0, 2).map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={[styles.eventRow, isRTL && styles.eventRowRTL]}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={[styles.eventTitle, isRTL && styles.textRTL]}>
                  {event.titleAr || event.title}
                </Text>
              </View>
              <Text style={[styles.eventDate, isRTL && styles.textRTL]}>
                {new Date(event.date).toLocaleDateString('ar-SA')}
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
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventRowRTL: {
    flexDirection: 'row-reverse',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    flex: 1,
  },
  eventDate: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 24,
  },
});
