import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, EventCard } from '../../components';
import { mockEvents } from '../../data/mockData';
import { Event } from '../../types';

type EventFilter = 'all' | 'upcoming' | 'current' | 'previous';

export const ParentEvents: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [filter, setFilter] = useState<EventFilter>('all');

  const filters: { key: EventFilter; label: string; labelAr: string }[] = [
    { key: 'all', label: 'All', labelAr: 'الكل' },
    { key: 'upcoming', label: 'Upcoming', labelAr: 'قادمة' },
    { key: 'current', label: 'Current', labelAr: 'حالية' },
    { key: 'previous', label: 'Previous', labelAr: 'سابقة' },
  ];

  const filteredEvents = filter === 'all'
    ? mockEvents
    : mockEvents.filter((e) => e.type === filter);

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>
          {t('events')}
        </Text>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                filter === f.key && styles.filterTabActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {language === 'ar' ? f.labelAr : f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataIcon}>📅</Text>
            <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
              {language === 'ar' ? 'لا توجد فعاليات' : 'No events found'}
            </Text>
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: colors.textLight,
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

