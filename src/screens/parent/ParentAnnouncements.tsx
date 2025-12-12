import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, AnnouncementCard } from '../../components';
import { mockAnnouncements } from '../../data/mockData';

export const ParentAnnouncements: React.FC = () => {
  const { t, isRTL, language } = useLanguage();

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {t('announcements')}
        </Text>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {language === 'ar'
            ? 'ابقَ على اطلاع بآخر الأخبار والتحديثات'
            : 'Stay updated with the latest news and updates'}
        </Text>

        {mockAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            expanded
          />
        ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
});

