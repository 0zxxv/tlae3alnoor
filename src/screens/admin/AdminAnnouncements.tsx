import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header, Button, AnnouncementCard } from '../../components';
import { announcementsApi } from '../../services/api';
import { Announcement } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

export const AdminAnnouncements: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [contentAr, setContentAr] = useState('');

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
      Alert.alert('خطأ', 'فشل تحميل الإعلانات');
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

  const handleSendAnnouncement = async () => {
    if (!titleAr || !contentAr) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    setSaving(true);
    try {
      // Admin can send announcements without teacher_id
      const newAnnouncement = await announcementsApi.create({
        title: titleAr,
        title_ar: titleAr,
        content: contentAr,
        content_ar: contentAr,
        teacher_id: null,
      });

      Alert.alert('نجاح', 'تم إرسال الإعلان بنجاح');

      // Reset form
      setTitleAr('');
      setContentAr('');
      setModalVisible(false);

      // Refresh announcements
      await fetchAnnouncements();
    } catch (error: any) {
      console.error('Error sending announcement:', error);
      Alert.alert('خطأ', error.message || 'فشل إرسال الإعلان');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا الإعلان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await announcementsApi.delete(announcementId);
              await fetchAnnouncements();
              Alert.alert('نجاح', 'تم حذف الإعلان بنجاح');
            } catch (error: any) {
              Alert.alert('خطأ', error.message || 'فشل حذف الإعلان');
            }
          },
        },
      ]
    );
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
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="megaphone" size={28} color={colors.accentBlue} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('announcements')}
            </Text>
          </View>
          <Button
            title={t('sendAnnouncement')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textLight} />}
          />
        </View>

        {/* Announcements List */}
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
            <View key={announcement.id} style={styles.announcementWrapper}>
              <AnnouncementCard announcement={announcement} expanded />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteAnnouncement(announcement.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={styles.deleteText}>حذف</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
              <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="arrow-forward" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.modalHeaderCenter}>
                  <Ionicons name="megaphone" size={28} color={colors.accentBlue} />
                  <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                    {t('sendAnnouncement')}
                  </Text>
                </View>
                <View style={{ width: 40 }} />
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
                  title={saving ? 'جاري الإرسال...' : t('submit')}
                  onPress={handleSendAnnouncement}
                  style={styles.modalButton}
                  disabled={saving}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  textRTL: {
    textAlign: 'right',
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
  announcementWrapper: {
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
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
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  modalBackButton: {
    padding: 8,
  },
  modalHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
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

