import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, EventCard } from '../../components';
import { mockEvents } from '../../data/mockData';

type EventFilter = 'all' | 'upcoming' | 'current' | 'previous';

export const ParentEvents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<EventFilter>('all');

  const filters: { key: EventFilter; labelAr: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', labelAr: 'الكل', icon: 'apps' },
    { key: 'upcoming', labelAr: 'قادمة', icon: 'time-outline' },
    { key: 'current', labelAr: 'حالية', icon: 'play-circle-outline' },
    { key: 'previous', labelAr: 'سابقة', icon: 'checkmark-circle-outline' },
  ];

  const filteredEvents = filter === 'all'
    ? mockEvents
    : mockEvents.filter((e) => e.type === filter);

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, isRTL && styles.headerRowRTL]}>
          <Ionicons name="calendar" size={28} color={colors.primary} />
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('events')}
          </Text>
        </View>

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
              <Ionicons 
                name={f.icon} 
                size={16} 
                color={filter === f.key ? colors.textLight : colors.text} 
              />
              <Text
                style={[
                  styles.filterText,
                  filter === f.key && styles.filterTextActive,
                ]}
              >
                {f.labelAr}
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
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
              لا توجد فعاليات
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
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
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
