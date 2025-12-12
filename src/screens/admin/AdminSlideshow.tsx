import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Button, Input, Slideshow, Card } from '../../components';
import { mockSlideshow as initialSlideshow } from '../../data/mockData';
import { SlideShowImage } from '../../types';

export const AdminSlideshow: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [slides, setSlides] = useState<SlideShowImage[]>(initialSlideshow);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [imageUri, setImageUri] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        language === 'ar' ? 'إذن مطلوب' : 'Permission Required',
        language === 'ar'
          ? 'نحتاج إذن الوصول إلى الصور'
          : 'We need permission to access your photos'
      );
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

  const handleAddSlide = () => {
    if (!title || !imageUri) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إضافة عنوان وصورة' : 'Please add a title and image'
      );
      return;
    }

    const newSlide: SlideShowImage = {
      id: `slide${Date.now()}`,
      uri: imageUri,
      title,
      titleAr: titleAr || title,
    };

    setSlides([...slides, newSlide]);
    Alert.alert(
      language === 'ar' ? 'نجاح' : 'Success',
      language === 'ar' ? 'تمت إضافة الصورة بنجاح' : 'Slide added successfully'
    );

    // Reset form
    setTitle('');
    setTitleAr('');
    setImageUri('');
    setModalVisible(false);
  };

  const handleDeleteSlide = (slideId: string) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذه الصورة؟'
        : 'Are you sure you want to delete this slide?',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            setSlides(slides.filter((s) => s.id !== slideId));
            Alert.alert(
              language === 'ar' ? 'نجاح' : 'Success',
              language === 'ar' ? 'تم حذف الصورة بنجاح' : 'Slide deleted successfully'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="images" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('slideshow')}
            </Text>
          </View>
          <Button
            title={t('addSlide')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={18} color={colors.textLight} />}
          />
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {language === 'ar'
            ? `${slides.length} صورة في العرض`
            : `${slides.length} slides in slideshow`}
        </Text>

        {/* Preview */}
        {slides.length > 0 && (
          <Card title={language === 'ar' ? 'معاينة العرض' : 'Slideshow Preview'}>
            <Slideshow images={slides} />
          </Card>
        )}

        {/* Slides Management */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {language === 'ar' ? 'إدارة الصور' : 'Manage Slides'}
        </Text>

        {slides.map((slide) => (
          <Card key={slide.id}>
            <View style={[styles.slideItem, isRTL && styles.slideItemRTL]}>
              <Image source={{ uri: slide.uri }} style={styles.slideImage} />
              <View style={styles.slideInfo}>
                <Text style={[styles.slideTitle, isRTL && styles.textRTL]}>
                  {language === 'ar' ? slide.titleAr : slide.title}
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
              {language === 'ar' ? 'لا توجد صور' : 'No slides yet'}
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
                    <Text style={styles.imagePickerText}>
                      {language === 'ar' ? 'اختر صورة' : 'Choose Image'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <Input
                label={language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                value={title}
                onChangeText={setTitle}
                placeholder={language === 'ar' ? 'أدخل عنوان الصورة' : 'Enter slide title'}
              />

              <Input
                label={language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                value={titleAr}
                onChangeText={setTitleAr}
                placeholder={language === 'ar' ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
              />

              <View style={styles.modalButtons}>
                <Button
                  title={t('cancel')}
                  variant="outline"
                  onPress={() => {
                    setModalVisible(false);
                    setImageUri('');
                    setTitle('');
                    setTitleAr('');
                  }}
                  style={styles.modalButton}
                />
                <Button
                  title={t('submit')}
                  onPress={handleAddSlide}
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
  },
});
