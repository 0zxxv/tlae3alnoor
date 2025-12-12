import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Announcement } from '../types';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
  expanded?: boolean;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
  expanded = false,
}) => {
  const { language, isRTL } = useLanguage();

  const title = language === 'ar' ? announcement.titleAr : announcement.title;
  const content = language === 'ar' ? announcement.contentAr : announcement.content;
  const authorName = language === 'ar' ? announcement.authorNameAr : announcement.authorName;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <View style={styles.iconContainer}>
          <Ionicons name="megaphone" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
          <Text style={[styles.meta, isRTL && styles.textRTL]}>
            {authorName} • {formatDate(announcement.date)}
          </Text>
        </View>
      </View>
      
      <Text
        style={[styles.content, isRTL && styles.textRTL]}
        numberOfLines={expanded ? undefined : 2}
      >
        {content}
      </Text>
    </TouchableOpacity>
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
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  textRTL: {
    textAlign: 'right',
  },
});
