import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Button, EventCard } from '../../components';
import { mockEvents as initialEvents } from '../../data/mockData';
import { Event } from '../../types';

export const AdminEvents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [modalVisible, setModalVisible] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState<'upcoming' | 'current' | 'previous'>('upcoming');

  const eventTypes: { key: 'upcoming' | 'current' | 'previous'; labelAr: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'upcoming', labelAr: 'قادم', icon: 'time-outline' },
    { key: 'current', labelAr: 'حالي', icon: 'play-circle-outline' },
    { key: 'previous', labelAr: 'سابق', icon: 'checkmark-circle-outline' },
  ];

  const handleAddEvent = () => {
    if (!titleAr || !descriptionAr || !date) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const newEvent: Event = {
      id: `event${Date.now()}`,
      title: titleAr,
      titleAr: titleAr,
      description: descriptionAr,
      descriptionAr: descriptionAr,
      date,
      type: eventType,
    };

    setEvents([newEvent, ...events]);
    Alert.alert('نجاح', 'تمت إضافة الفعالية بنجاح');

    // Reset form
    setTitleAr('');
    setDescriptionAr('');
    setDate('');
    setEventType('upcoming');
    setModalVisible(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الفعالية؟',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            setEvents(events.filter((e) => e.id !== eventId));
            Alert.alert('نجاح', 'تم حذف الفعالية بنجاح');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="calendar" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('events')}
            </Text>
          </View>
          <Button
            title={t('addEvent')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={18} color={colors.textLight} />}
          />
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {events.length} فعالية
        </Text>

        {/* Events List */}
        {events.map((event) => (
          <View key={event.id} style={styles.eventWrapper}>
            <EventCard event={event} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEvent(event.id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Ionicons name="calendar" size={28} color={colors.primary} />
                <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                  {t('addEvent')}
                </Text>
              </View>

              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="عنوان الفعالية"
                value={titleAr}
                onChangeText={setTitleAr}
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[styles.input, styles.inputRTL, styles.textArea]}
                placeholder="وصف الفعالية"
                value={descriptionAr}
                onChangeText={setDescriptionAr}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="التاريخ (YYYY-MM-DD)"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={colors.textSecondary}
              />

              {/* Event Type Selection */}
              <Text style={[styles.label, isRTL && styles.textRTL]}>
                نوع الفعالية
              </Text>
              <View style={styles.typeContainer}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeButton,
                      eventType === type.key && styles.typeButtonActive,
                    ]}
                    onPress={() => setEventType(type.key)}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={16} 
                      color={eventType === type.key ? colors.textLight : colors.text} 
                    />
                    <Text
                      style={[
                        styles.typeText,
                        eventType === type.key && styles.typeTextActive,
                      ]}
                    >
                      {type.labelAr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title={t('cancel')}
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={t('submit')}
                  onPress={handleAddEvent}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRowRTL: {
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
    marginBottom: 16,
    textAlign: 'right',
  },
  textRTL: {
    textAlign: 'right',
  },
  eventWrapper: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputRTL: {
    textAlign: 'right',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  typeTextActive: {
    color: colors.textLight,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
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
});
