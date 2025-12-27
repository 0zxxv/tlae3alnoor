import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { teachersApi } from '../../services/api';

interface Teacher {
  id: string;
  mobile: string;
  name: string;
  name_ar: string;
}

export const AdminTeachers: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await teachersApi.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeachers();
  };

  const resetForm = () => {
    setMobile('');
    setPassword('');
    setName('');
    setNameAr('');
    setIsEditing(false);
    setSelectedTeacher(null);
  };

  const handleSubmit = async () => {
    if (!mobile || !name || !nameAr || (!isEditing && !password)) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
      );
      return;
    }

    try {
      if (isEditing && selectedTeacher) {
        await teachersApi.update(selectedTeacher.id, { mobile, name, name_ar: nameAr, ...(password ? { password } : {}) });
      } else {
        await teachersApi.create({ mobile, password, name, name_ar: nameAr });
      }
      setModalVisible(false);
      resetForm();
      fetchTeachers();
    } catch (error: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setMobile(teacher.mobile);
    setName(teacher.name);
    setNameAr(teacher.name_ar);
    setPassword('');
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDelete = (teacher: Teacher) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' ? 'هل أنت متأكد من حذف هذه المعلمة؟' : 'Are you sure you want to delete this teacher?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await teachersApi.delete(teacher.id);
              fetchTeachers();
            } catch (error: any) {
              Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'ar' ? 'المعلمات' : 'Teachers'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'المعلمات' : 'Teachers'} showBack />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color={colors.textLight} />
          <Text style={styles.addButtonText}>
            {language === 'ar' ? 'إضافة معلمة' : 'Add Teacher'}
          </Text>
        </TouchableOpacity>

        {teachers.map((teacher) => (
          <View key={teacher.id} style={styles.teacherCard}>
            <View style={[styles.teacherInfo, isRTL && styles.rowReverse]}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.teacherDetails}>
                <Text style={[styles.teacherName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? teacher.name_ar : teacher.name}
                </Text>
                <Text style={[styles.teacherMobile, isRTL && styles.textRTL]}>
                  {teacher.mobile}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(teacher)}
              >
                <Ionicons name="pencil" size={20} color={colors.warning} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(teacher)}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {teachers.length === 0 && (
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا يوجد معلمات' : 'No teachers found'}
          </Text>
        )}
      </ScrollView>

      {/* Add/Edit Teacher Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing 
                ? (language === 'ar' ? 'تعديل معلمة' : 'Edit Teacher')
                : (language === 'ar' ? 'إضافة معلمة' : 'Add Teacher')}
            </Text>

            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'رقم الجوال' : 'Mobile Number'}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
              value={nameAr}
              onChangeText={setNameAr}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  teacherCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  teacherMobile: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textRTL: {
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputRTL: {
    textAlign: 'right',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
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
});

