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
import { Header, Slideshow, Card, GradeCard, AnnouncementCard, EventCard } from '../../components';
import { mockSlideshow, mockGrades, mockAnnouncements, mockEvents } from '../../data/mockData';

export const ParentDashboard: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { selectedChild, selectChild } = useAuth();
  const navigation = useNavigation<any>();

  // Get grades for selected child
  const childGrades = mockGrades.filter((g) => g.studentId === selectedChild?.id);
  
  // Get upcoming and current events
  const upcomingEvents = mockEvents.filter((e) => e.type === 'upcoming');
  const currentEvents = mockEvents.filter((e) => e.type === 'current');

  const handleChangeChild = () => {
    selectChild(null as any);
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Info & Change Button */}
        <View style={[styles.childHeader, isRTL && styles.childHeaderRTL]}>
          <View style={styles.childInfo}>
            <View style={styles.childAvatar}>
              <Text style={styles.childInitial}>
                {(language === 'ar' ? selectedChild?.nameAr : selectedChild?.name)?.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={[styles.childName, isRTL && styles.textRTL]}>
                {language === 'ar' ? selectedChild?.nameAr : selectedChild?.name}
              </Text>
              <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                {language === 'ar' ? selectedChild?.gradeAr : selectedChild?.grade}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleChangeChild} style={styles.changeButton}>
            <Text style={styles.changeText}>
              {language === 'ar' ? 'تغيير' : 'Change'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Slideshow */}
        <Slideshow images={mockSlideshow} />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{childGrades.length}</Text>
            <Text style={styles.statLabel}>{t('grades')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockAnnouncements.length}</Text>
            <Text style={styles.statLabel}>{t('announcements')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{upcomingEvents.length}</Text>
            <Text style={styles.statLabel}>{t('events')}</Text>
          </View>
        </View>

        {/* Recent Grades */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('grades')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ParentGrades')}>
              <Text style={styles.seeAll}>
                {language === 'ar' ? 'عرض الكل' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          {childGrades.slice(0, 2).map((grade) => (
            <GradeCard key={grade.id} grade={grade} />
          ))}
          {childGrades.length === 0 && (
            <Text style={[styles.noData, isRTL && styles.textRTL]}>{t('noData')}</Text>
          )}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('announcements')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ParentAnnouncements')}>
              <Text style={styles.seeAll}>
                {language === 'ar' ? 'عرض الكل' : 'See All'}
              </Text>
            </TouchableOpacity>
          </View>
          {mockAnnouncements.slice(0, 2).map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </View>

        {/* Current Events */}
        {currentEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('currentEvents')}
            </Text>
            {currentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
              <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
                {t('upcomingEvents')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ParentEvents')}>
                <Text style={styles.seeAll}>
                  {language === 'ar' ? 'عرض الكل' : 'See All'}
                </Text>
              </TouchableOpacity>
            </View>
            {upcomingEvents.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
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
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  childGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 20,
  },
  changeText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
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
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
  },
  noData: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 20,
  },
});

