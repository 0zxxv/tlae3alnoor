import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Slideshow, Card } from '../../components';
import { slideshowApi, uploadImage } from '../../services/api';
import { SlideShowImage } from '../../types';
import * as FileSystem from 'expo-file-system';

export const AdminSlideshow: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [slides, setSlides] = useState<SlideShowImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      const data = await slideshowApi.getAll(true);
      setSlides(data.map((s: any) => ({
        id: s.id.toString(),
        uri: s.image_url,
        title: s.title || s.title_ar,
        titleAr: s.title_ar || s.title,
      })));
    } catch (error) {
      console.error('Error fetching slides:', error);
      Alert.alert('خطأ', 'فشل في تحميل الصور');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlides();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('إذن مطلوب', 'نحتاج إذن الوصول إلى الصور');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddSlide = async () => {
    if (!imageUri) {
      Alert.alert('خطأ', 'يرجى اختيار صورة');
      return;
    }

    setUploading(true);
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Get file extension
      const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      const base64WithPrefix = `data:${mimeType};base64,${base64}`;
      
      // Upload to server
      const serverUrl = await uploadImage(base64WithPrefix);
      
      // Create slideshow entry with server URL
      await slideshowApi.create({
        title: 'صورة',
        title_ar: 'صورة',
        image_url: serverUrl,
        is_active: true,
      });
      
      Alert.alert('نجاح', 'تمت إضافة الصورة بنجاح');
      setImageUri('');
      setModalVisible(false);
      fetchSlides();
    } catch (error: any) {
      console.error('Add slide error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSlide = (slideId: string) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الصورة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await slideshowApi.delete(slideId);
              Alert.alert('نجاح', 'تم حذف الصورة بنجاح');
              fetchSlides();
            } catch (error: any) {
              Alert.alert('خطأ', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showLogout />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="images" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('slideshow')}
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={18} color={colors.textLight} />
            <Text style={styles.addButtonText}>{t('addSlide')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {slides.length} صورة في العرض
        </Text>

        {/* Preview */}
        {slides.length > 0 && (
          <Card title="معاينة العرض" titleAr="معاينة العرض">
            <Slideshow images={slides} />
          </Card>
        )}

        {/* Slides Management */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          إدارة الصور
        </Text>

        {slides.map((slide) => (
          <Card key={slide.id}>
            <View style={[styles.slideItem, isRTL && styles.slideItemRTL]}>
              <Image source={{ uri: slide.uri }} style={styles.slideImage} />
              <View style={styles.slideInfo}>
                <Text style={[styles.slideTitle, isRTL && styles.textRTL]}>
                  {slide.titleAr || slide.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSlide(slide.id)}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {slides.length === 0 && (
          <View style={styles.noData}>
            <Ionicons name="images-outline" size={48} color={colors.border} />
            <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
              لا توجد صور
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Slide Modal */}
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
                <Ionicons name="images" size={28} color={colors.primary} />
                <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                  {t('addSlide')}
                </Text>
              </View>

              {/* Image Picker */}
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Ionicons name="camera" size={48} color={colors.textSecondary} />
                    <Text style={styles.imagePickerText}>اختر صورة</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setImageUri('');
                  }}
                  disabled={uploading}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton, uploading && styles.disabledButton]}
                  onPress={handleAddSlide}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.textLight} />
                  ) : (
                    <Text style={styles.submitButtonText}>إضافة</Text>
                  )}
                </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  slideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slideItemRTL: {
    flexDirection: 'row-reverse',
  },
  slideImage: {
    width: 80,
    height: 50,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  slideInfo: {
    flex: 1,
  },
  slideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  imagePicker: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
