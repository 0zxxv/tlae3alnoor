import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../types';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { isRTL } = useLanguage();

  const title = event.titleAr || event.title;
  const description = event.descriptionAr || event.description;

  const getTypeColor = () => {
    switch (event.type) {
      case 'upcoming':
        return colors.primary;
      case 'current':
        return colors.accentBlue; // Current events get accent blue
      case 'previous':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const getTypeLabel = () => {
    switch (event.type) {
      case 'upcoming':
        return 'قادم';
      case 'current':
        return 'حالي';
      case 'previous':
        return 'سابق';
      default:
        return '';
    }
  };

  const getTypeIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (event.type) {
      case 'upcoming':
        return 'time-outline';
      case 'current':
        return 'play-circle-outline';
      case 'previous':
        return 'checkmark-circle-outline';
      default:
        return 'calendar-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
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
        <Ionicons name={getTypeIcon()} size={12} color={colors.textLight} />
        <Text style={styles.typeText}>{getTypeLabel()}</Text>
      </View>
      
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      
      <View style={[styles.dateRow, isRTL && styles.dateRowRTL]}>
        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
        <Text style={styles.date}>{formatDate(event.date)}</Text>
      </View>
      
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  dateRowRTL: {
    flexDirection: 'row-reverse',
  },
  date: {
    fontSize: 14,
    color: colors.primary,
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
