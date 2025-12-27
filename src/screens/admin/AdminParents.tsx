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
import { Header, Card } from '../../components';
import { parentsApi, studentsApi } from '../../services/api';

interface Parent {
  id: string;
  mobile: string;
  name: string;
  name_ar: string;
  children_count: number;
}

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade: string;
  grade_ar: string;
  parent_id: string;
}

export const AdminParents: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);

  // Form states
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Student form
  const [studentName, setStudentName] = useState('');
  const [studentNameAr, setStudentNameAr] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentGradeAr, setStudentGradeAr] = useState('');

  const fetchParents = useCallback(async () => {
    try {
      const data = await parentsApi.getAll();
      setParents(data);
    } catch (error) {
      console.error('Error fetching parents:', error);
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [language]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchParents();
  };

  const resetForm = () => {
    setMobile('');
    setPassword('');
    setName('');
    setNameAr('');
    setIsEditing(false);
    setSelectedParent(null);
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
      if (isEditing && selectedParent) {
        await parentsApi.update(selectedParent.id, { mobile, name, name_ar: nameAr, ...(password ? { password } : {}) });
      } else {
        await parentsApi.create({ mobile, password, name, name_ar: nameAr });
      }
      setModalVisible(false);
      resetForm();
      fetchParents();
    } catch (error: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
    }
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setMobile(parent.mobile);
    setName(parent.name);
    setNameAr(parent.name_ar);
    setPassword('');
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDelete = (parent: Parent) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' 
        ? 'سيتم حذف ولي الأمر وجميع الطلاب المرتبطين به. هل أنت متأكد؟' 
        : 'This will delete the parent and all linked students. Are you sure?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await parentsApi.delete(parent.id);
              fetchParents();
            } catch (error: any) {
              Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleViewChildren = async (parent: Parent) => {
    setSelectedParent(parent);
    try {
      const children = await studentsApi.getByParent(parent.id);
      setParentChildren(children);
      setStudentModalVisible(true);
    } catch (error) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل في تحميل الطلاب' : 'Failed to load students');
    }
  };

  const handleAddStudent = async () => {
    if (!studentName || !studentNameAr || !studentGrade || !studentGradeAr || !selectedParent) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required'
      );
      return;
    }

    try {
      await studentsApi.create({
        parent_id: selectedParent.id,
        name: studentName,
        name_ar: studentNameAr,
        grade: studentGrade,
        grade_ar: studentGradeAr,
      });
      setStudentName('');
      setStudentNameAr('');
      setStudentGrade('');
      setStudentGradeAr('');
      const children = await studentsApi.getByParent(selectedParent.id);
      setParentChildren(children);
      fetchParents();
    } catch (error: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' ? 'هل أنت متأكد من حذف هذه الطالبة؟' : 'Are you sure you want to delete this student?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentsApi.delete(student.id);
              const children = await studentsApi.getByParent(selectedParent!.id);
              setParentChildren(children);
              fetchParents();
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
        <Header title={language === 'ar' ? 'أولياء الأمور' : 'Parents'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'أولياء الأمور' : 'Parents'} showBack />
      
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
            {language === 'ar' ? 'إضافة ولي أمر' : 'Add Parent'}
          </Text>
        </TouchableOpacity>

        {parents.map((parent) => (
          <View key={parent.id} style={styles.parentCard}>
            <View style={[styles.parentInfo, isRTL && styles.rowReverse]}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.parentDetails}>
                <Text style={[styles.parentName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? parent.name_ar : parent.name}
                </Text>
                <Text style={[styles.parentMobile, isRTL && styles.textRTL]}>
                  {parent.mobile}
                </Text>
                <TouchableOpacity onPress={() => handleViewChildren(parent)}>
                  <Text style={styles.childrenCount}>
                    {language === 'ar' 
                      ? `${parent.children_count} طالبة` 
                      : `${parent.children_count} student(s)`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewChildren(parent)}
              >
                <Ionicons name="people" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEdit(parent)}
              >
                <Ionicons name="pencil" size={20} color={colors.warning} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDelete(parent)}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {parents.length === 0 && (
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا يوجد أولياء أمور' : 'No parents found'}
          </Text>
        )}
      </ScrollView>

      {/* Add/Edit Parent Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing 
                ? (language === 'ar' ? 'تعديل ولي أمر' : 'Edit Parent')
                : (language === 'ar' ? 'إضافة ولي أمر' : 'Add Parent')}
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

      {/* Students Modal */}
      <Modal visible={studentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ar' 
                  ? `طالبات ${selectedParent?.name_ar}` 
                  : `${selectedParent?.name}'s Students`}
              </Text>
              <TouchableOpacity onPress={() => setStudentModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.studentsList}>
              {parentChildren.map((student) => (
                <View key={student.id} style={styles.studentItem}>
                  <View style={styles.studentInfo}>
                    <Ionicons name="person-circle" size={32} color={colors.primary} />
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>
                        {language === 'ar' ? student.name_ar : student.name}
                      </Text>
                      <Text style={styles.studentGrade}>
                        {language === 'ar' ? student.grade_ar : student.grade}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteStudent(student)}>
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.addStudentSection}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'إضافة طالبة جديدة' : 'Add New Student'}
              </Text>
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                value={studentName}
                onChangeText={setStudentName}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
                value={studentNameAr}
                onChangeText={setStudentNameAr}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'الصف (إنجليزي)' : 'Grade (English)'}
                value={studentGrade}
                onChangeText={setStudentGrade}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={language === 'ar' ? 'الصف (عربي)' : 'Grade (Arabic)'}
                value={studentGradeAr}
                onChangeText={setStudentGradeAr}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.addStudentButton} onPress={handleAddStudent}>
                <Text style={styles.addStudentButtonText}>
                  {language === 'ar' ? 'إضافة الطالبة' : 'Add Student'}
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
  parentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  parentInfo: {
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
  parentDetails: {
    flex: 1,
  },
  parentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  parentMobile: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  childrenCount: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
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
  largeModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  studentsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  studentGrade: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addStudentSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  addStudentButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addStudentButtonText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
});

