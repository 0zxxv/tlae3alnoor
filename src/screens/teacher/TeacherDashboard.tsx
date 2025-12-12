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
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { mockStudents, mockAnnouncements } from '../../data/mockData';

export const TeacherDashboard: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const quickActions = [
    { id: 'grades', title: t('addGrade'), titleAr: 'إضافة درجة', icon: '📝', screen: 'TeacherGrades' },
    { id: 'announcements', title: t('sendAnnouncement'), titleAr: 'إرسال إعلان', icon: '📢', screen: 'TeacherAnnouncements' },
    { id: 'chat', title: t('chat'), titleAr: 'المحادثات', icon: '💬', screen: 'TeacherChat' },
  ];

  const stats = [
    { label: language === 'ar' ? 'الطلاب' : 'Students', value: mockStudents.length, icon: '👨‍🎓' },
    { label: language === 'ar' ? 'الإعلانات' : 'Announcements', value: mockAnnouncements.length, icon: '📣' },
    { label: language === 'ar' ? 'الرسائل' : 'Messages', value: 3, icon: '✉️' },
  ];

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Card title={language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}>
          <View style={[styles.actionsGrid, isRTL && styles.actionsGridRTL]}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionButton}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.actionText}>
                  {language === 'ar' ? action.titleAr : action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Recent Announcements */}
        <Card title={language === 'ar' ? 'آخر الإعلانات' : 'Recent Announcements'}>
          {mockAnnouncements.slice(0, 2).map((announcement) => (
            <View key={announcement.id} style={styles.announcementItem}>
              <Text style={[styles.announcementTitle, isRTL && styles.textRTL]}>
                {language === 'ar' ? announcement.titleAr : announcement.title}
              </Text>
              <Text style={[styles.announcementDate, isRTL && styles.textRTL]}>
                {new Date(announcement.date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
              </Text>
            </View>
          ))}
        </Card>

        {/* Students Overview */}
        <Card title={language === 'ar' ? 'الطلاب' : 'Students'}>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionsGridRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  announcementItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textRTL: {
    textAlign: 'right',
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
});

