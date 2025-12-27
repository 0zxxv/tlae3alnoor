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
import { parentsApi, studentsApi } from '../../services/api';

interface Parent {
  id: string;
  mobile: string;
  name: string;
  name_ar: string;
  relationship?: string;
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
  const { isRTL } = useLanguage();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);

  // Form states - no password required
  const [mobile, setMobile] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Student form
  const [studentNameAr, setStudentNameAr] = useState('');
  const [studentGradeAr, setStudentGradeAr] = useState('');

  const fetchParents = useCallback(async () => {
    try {
      const data = await parentsApi.getAll();
      setParents(data);
    } catch (error) {
      console.error('Error fetching parents:', error);
      Alert.alert('خطأ', 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchParents();
  };

  const resetForm = () => {
    setMobile('');
    setNameAr('');
    setRelationship('');
    setIsEditing(false);
    setSelectedParent(null);
  };

  const handleSubmit = async () => {
    if (!mobile || !nameAr) {
      Alert.alert('خطأ', 'رقم الجوال والاسم مطلوبان');
      return;
    }

    try {
      if (isEditing && selectedParent) {
        await parentsApi.update(selectedParent.id, { 
          mobile, 
          name: nameAr, 
          name_ar: nameAr,
          relationship: relationship || 'ولي أمر',
        });
      } else {
        await parentsApi.create({ 
          mobile, 
          name: nameAr, 
          name_ar: nameAr,
          relationship: relationship || 'ولي أمر',
        });
      }
      setModalVisible(false);
      resetForm();
      fetchParents();
      Alert.alert('نجاح', isEditing ? 'تم التحديث بنجاح' : 'تمت الإضافة بنجاح');
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
    }
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setMobile(parent.mobile);
    setNameAr(parent.name_ar || parent.name);
    setRelationship(parent.relationship || '');
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDelete = (parent: Parent) => {
    Alert.alert(
      'تأكيد الحذف',
      'سيتم حذف الحساب وجميع الطالبات المرتبطات به. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await parentsApi.delete(parent.id);
              fetchParents();
            } catch (error: any) {
              Alert.alert('خطأ', error.message);
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
      Alert.alert('خطأ', 'فشل في تحميل الطالبات');
    }
  };

  const handleAddStudent = async () => {
    if (!studentNameAr || !studentGradeAr || !selectedParent) {
      Alert.alert('خطأ', 'جميع الحقول مطلوبة');
      return;
    }

    try {
      await studentsApi.create({
        parent_id: selectedParent.id,
        name: studentNameAr,
        name_ar: studentNameAr,
        grade: studentGradeAr,
        grade_ar: studentGradeAr,
      });
      setStudentNameAr('');
      setStudentGradeAr('');
      const children = await studentsApi.getByParent(selectedParent.id);
      setParentChildren(children);
      fetchParents();
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
    }
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الطالبة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await studentsApi.delete(student.id);
              const children = await studentsApi.getByParent(selectedParent!.id);
              setParentChildren(children);
              fetchParents();
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
        <Header title="أولياء الأمور" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="أولياء الأمور" />
      
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
          <Text style={styles.addButtonText}>إضافة حساب جديد</Text>
        </TouchableOpacity>

        {parents.map((parent) => (
          <View key={parent.id} style={styles.parentCard}>
            <View style={[styles.parentInfo, isRTL && styles.rowReverse]}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.parentDetails}>
                <Text style={[styles.parentName, isRTL && styles.textRTL]}>
                  {parent.name_ar || parent.name}
                </Text>
                <Text style={[styles.parentMobile, isRTL && styles.textRTL]}>
                  {parent.mobile}
                </Text>
                {parent.relationship && (
                  <Text style={[styles.relationship, isRTL && styles.textRTL]}>
                    صلة القرابة: {parent.relationship}
                  </Text>
                )}
                <TouchableOpacity onPress={() => handleViewChildren(parent)}>
                  <Text style={styles.childrenCount}>
                    {parent.children_count} طالبة
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
          <Text style={styles.emptyText}>لا يوجد حسابات</Text>
        )}
      </ScrollView>

      {/* Add/Edit Parent Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'تعديل الحساب' : 'إضافة حساب جديد'}
            </Text>

            <TextInput
              style={[styles.input, styles.inputRTL]}
              placeholder="رقم الجوال *"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.inputRTL]}
              placeholder="الاسم *"
              value={nameAr}
              onChangeText={setNameAr}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.inputRTL]}
              placeholder="صلة القرابة (مثال: أم، خالة، عمة)"
              value={relationship}
              onChangeText={setRelationship}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.hint}>
              * صلة القرابة اختيارية - إذا لم تحدد ستكون "ولي أمر"
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>حفظ</Text>
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
                طالبات {selectedParent?.name_ar || selectedParent?.name}
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
                        {student.name_ar || student.name}
                      </Text>
                      <Text style={styles.studentGrade}>
                        {student.grade_ar || student.grade}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteStudent(student)}>
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {parentChildren.length === 0 && (
                <Text style={styles.noStudentsText}>لا توجد طالبات مسجلات</Text>
              )}
            </ScrollView>

            <View style={styles.addStudentSection}>
              <Text style={styles.sectionTitle}>إضافة طالبة جديدة</Text>
              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="اسم الطالبة"
                value={studentNameAr}
                onChangeText={setStudentNameAr}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="الصف"
                value={studentGradeAr}
                onChangeText={setStudentGradeAr}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.addStudentButton} onPress={handleAddStudent}>
                <Text style={styles.addStudentButtonText}>إضافة الطالبة</Text>
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
  relationship: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  childrenCount: {
    fontSize: 12,
    color: colors.success,
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
    textAlign: 'right',
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
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 8,
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
    textAlign: 'right',
  },
  studentGrade: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  noStudentsText: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: 20,
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
    textAlign: 'right',
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
