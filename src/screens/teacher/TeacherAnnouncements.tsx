import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, Button, AnnouncementCard } from '../../components';
import { mockAnnouncements } from '../../data/mockData';
import { Announcement } from '../../types';

export const TeacherAnnouncements: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [modalVisible, setModalVisible] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [contentAr, setContentAr] = useState('');

  const handleSendAnnouncement = () => {
    if (!titleAr || !contentAr) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann${Date.now()}`,
      title: titleAr,
      titleAr: titleAr,
      content: contentAr,
      contentAr: contentAr,
      date: new Date().toISOString().split('T')[0],
      authorId: user?.id || '',
      authorName: user?.name || '',
      authorNameAr: user?.nameAr || '',
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    Alert.alert('نجاح', 'تم إرسال الإعلان بنجاح');

    // Reset form
    setTitleAr('');
    setContentAr('');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('announcements')}
          </Text>
          <Button
            title={t('sendAnnouncement')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textLight} />}
          />
        </View>

        {/* Announcements List */}
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </ScrollView>

      {/* Add Announcement Modal */}
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
                <Ionicons name="megaphone" size={28} color={colors.primary} />
                <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                  {t('sendAnnouncement')}
                </Text>
              </View>

              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="العنوان"
                value={titleAr}
                onChangeText={setTitleAr}
                placeholderTextColor={colors.textSecondary}
              />

              <TextInput
                style={[styles.input, styles.inputRTL, styles.textArea]}
                placeholder="المحتوى"
                value={contentAr}
                onChangeText={setContentAr}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.modalButtons}>
                <Button
                  title={t('cancel')}
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  title={t('submit')}
                  onPress={handleSendAnnouncement}
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
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  textRTL: {
    textAlign: 'right',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});
