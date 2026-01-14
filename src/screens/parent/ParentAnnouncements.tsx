import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, AnnouncementCard } from '../../components';
import { announcementsApi } from '../../services/api';
import { Announcement } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

export const ParentAnnouncements: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await announcementsApi.getAll();
      setAnnouncements(data.map((a: any) => ({
        id: a.id.toString(),
        title: a.title || '',
        titleAr: a.title_ar || '',
        content: a.content || '',
        contentAr: a.content_ar || '',
        date: a.created_at || a.date || new Date().toISOString().split('T')[0],
        authorId: a.teacher_id?.toString() || '',
        authorName: a.teacher_name || '',
        authorNameAr: a.teacher_name_ar || '',
      })));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [fetchAnnouncements])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة الرئيسية</Text>
        </TouchableOpacity>

        <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
          <Ionicons name="megaphone" size={28} color={colors.accentBlue} />
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('announcements')}
          </Text>
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          ابقَ على اطلاع بآخر الأخبار والتحديثات
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
              لا توجد إعلانات
            </Text>
          </View>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              expanded
            />
          ))
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'right',
  },
  textRTL: {
    textAlign: 'right',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
