import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, Button, Input, AnnouncementCard } from '../../components';
import { mockAnnouncements } from '../../data/mockData';
import { Announcement } from '../../types';

export const TeacherAnnouncements: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [content, setContent] = useState('');
  const [contentAr, setContentAr] = useState('');

  const handleSendAnnouncement = () => {
    if (!title || !content) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'
      );
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann${Date.now()}`,
      title,
      titleAr: titleAr || title,
      content,
      contentAr: contentAr || content,
      date: new Date().toISOString().split('T')[0],
      authorId: user?.id || '',
      authorName: user?.name || '',
      authorNameAr: user?.nameAr || '',
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    Alert.alert(
      language === 'ar' ? 'نجاح' : 'Success',
      language === 'ar' ? 'تم إرسال الإعلان بنجاح' : 'Announcement sent successfully'
    );

    // Reset form
    setTitle('');
    setTitleAr('');
    setContent('');
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

              <Input
                label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                value={title}
                onChangeText={setTitle}
                placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter title'}
              />

              <Input
                label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                value={titleAr}
                onChangeText={setTitleAr}
                placeholder={language === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
              />

              <Input
                label={language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                value={content}
                onChangeText={setContent}
                placeholder={language === 'ar' ? 'أدخل المحتوى' : 'Enter content'}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />

              <Input
                label={language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                value={contentAr}
                onChangeText={setContentAr}
                placeholder={language === 'ar' ? 'أدخل المحتوى بالعربية' : 'Enter content in Arabic'}
                multiline
                numberOfLines={4}
                style={styles.textArea}
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
