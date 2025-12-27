import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, Slideshow, GradeCard, AnnouncementCard, EventCard } from '../../components';
import { slideshowApi, gradesApi, announcementsApi, eventsApi } from '../../services/api';
import { SlideShowImage, Grade, Announcement, Event } from '../../types';

export const ParentDashboard: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { selectedChild, selectChild } = useAuth();
  const navigation = useNavigation<any>();

  const [slides, setSlides] = useState<SlideShowImage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [slidesData, gradesData, announcementsData, eventsData] = await Promise.all([
        slideshowApi.getAll(),
        selectedChild ? gradesApi.getByStudent(selectedChild.id) : Promise.resolve([]),
        announcementsApi.getAll(),
        eventsApi.getAll(),
      ]);

      setSlides(slidesData.map((s: any) => ({
        id: s.id.toString(),
        uri: s.image_url,
        title: s.title,
        titleAr: s.title_ar,
      })));

      setGrades(gradesData.map((g: any) => ({
        id: g.id.toString(),
        studentId: g.student_id?.toString(),
        subject: g.subject,
        subjectAr: g.subject_ar,
        score: g.score,
        maxScore: g.max_score,
        date: g.date,
        teacherId: g.teacher_id?.toString(),
      })));

      setAnnouncements(announcementsData.map((a: any) => ({
        id: a.id.toString(),
        title: a.title,
        titleAr: a.title_ar,
        content: a.content,
        contentAr: a.content_ar,
        date: a.date,
        authorId: a.author_id?.toString(),
        authorName: a.author_name,
        authorNameAr: a.author_name_ar,
      })));

      setEvents(eventsData.map((e: any) => ({
        id: e.id.toString(),
        title: e.title,
        titleAr: e.title_ar,
        description: e.description,
        descriptionAr: e.description_ar,
        date: e.date,
        type: e.type,
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedChild])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleChangeChild = () => {
    selectChild(null as any);
  };

  const upcomingEvents = events.filter((e) => e.type === 'upcoming');
  const currentEvents = events.filter((e) => e.type === 'current');

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showLogout />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Child Info & Change Button */}
        <View style={[styles.childHeader, isRTL && styles.childHeaderRTL]}>
          <View style={[styles.childInfo, isRTL && styles.childInfoRTL]}>
            <View style={styles.childAvatar}>
              <Ionicons name="person" size={24} color={colors.textLight} />
            </View>
            <View>
              <Text style={[styles.childName, isRTL && styles.textRTL]}>
                {selectedChild?.nameAr || selectedChild?.name}
              </Text>
              <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                {selectedChild?.gradeAr || selectedChild?.grade}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleChangeChild} style={styles.changeButton}>
            <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
            <Text style={styles.changeText}>تغيير</Text>
          </TouchableOpacity>
        </View>

        {/* Slideshow */}
        {slides.length > 0 && <Slideshow images={slides} />}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="school" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{grades.length}</Text>
            <Text style={styles.statLabel}>{t('grades')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="megaphone" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{announcements.length}</Text>
            <Text style={styles.statLabel}>{t('announcements')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
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
            <TouchableOpacity 
              onPress={() => navigation.navigate('ParentGrades')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAll}>عرض الكل</Text>
              <Ionicons 
                name={isRTL ? 'chevron-back' : 'chevron-forward'} 
                size={16} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          {grades.slice(0, 2).map((grade) => (
            <GradeCard key={grade.id} grade={grade} />
          ))}
          {grades.length === 0 && (
            <Text style={[styles.noData, isRTL && styles.textRTL]}>{t('noData')}</Text>
          )}
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, isRTL && styles.sectionHeaderRTL]}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('announcements')}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('ParentAnnouncements')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAll}>عرض الكل</Text>
              <Ionicons 
                name={isRTL ? 'chevron-back' : 'chevron-forward'} 
                size={16} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>
          {announcements.slice(0, 2).map((announcement) => (
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
              <TouchableOpacity 
                onPress={() => navigation.navigate('ParentEvents')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAll}>عرض الكل</Text>
                <Ionicons 
                  name={isRTL ? 'chevron-back' : 'chevron-forward'} 
                  size={16} 
                  color={colors.primary} 
                />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  childInfoRTL: {
    flexDirection: 'row-reverse',
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginTop: 4,
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
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
