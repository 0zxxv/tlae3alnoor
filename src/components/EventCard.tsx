import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event } from '../types';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { language, isRTL } = useLanguage();

  const title = language === 'ar' ? event.titleAr : event.title;
  const description = language === 'ar' ? event.descriptionAr : event.description;

  const getTypeColor = () => {
    switch (event.type) {
      case 'upcoming':
        return colors.primary;
      case 'current':
        return colors.success;
      case 'previous':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'upcoming':
        return language === 'ar' ? 'قادم' : 'Upcoming';
      case 'current':
        return language === 'ar' ? 'حالي' : 'Current';
      case 'previous':
        return language === 'ar' ? 'سابق' : 'Previous';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
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
      <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
        <Text style={styles.typeText}>{getTypeLabel()}</Text>
      </View>
      
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      <Text style={[styles.date, isRTL && styles.textRTL]}>
        {formatDate(event.date)}
      </Text>
      <Text
        style={[styles.description, isRTL && styles.textRTL]}
        numberOfLines={2}
      >
        {description}
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
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
});

