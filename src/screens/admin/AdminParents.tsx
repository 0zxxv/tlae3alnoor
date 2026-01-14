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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { parentsApi, studentsApi } from '../../services/api';
import { ACADEMY_COURSES } from '../../constants/classes';

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
  const navigation = useNavigation<any>();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states - no password required
  const [mobile, setMobile] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Student form
  const [studentNameAr, setStudentNameAr] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [studentSubclass, setStudentSubclass] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Get subclasses for selected course
  const selectedCourseObj = ACADEMY_COURSES.find(c => c.id === studentCourse);

  // Filter parents based on search
  const filteredParents = parents.filter(parent => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      parent.name_ar?.toLowerCase().includes(query) ||
      parent.name?.toLowerCase().includes(query) ||
      parent.mobile?.includes(query)
    );
  });

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
    if (!studentNameAr || !studentCourse || !studentSubclass || !selectedParent) {
      Alert.alert('خطأ', 'جميع الحقول مطلوبة');
      return;
    }

    const course = ACADEMY_COURSES.find(c => c.id === studentCourse);
    const courseName = course?.nameAr || '';

    const studentData = {
      parent_id: selectedParent.id,
      name: studentNameAr,
      name_ar: studentNameAr,
      grade: courseName,
      grade_ar: courseName,
      class_name: courseName,
      subclass_name: studentSubclass,
    };
    
    console.log('Adding student with data:', JSON.stringify(studentData, null, 2));

    try {
      if (editingStudent) {
        // Update existing student
        await studentsApi.update(editingStudent.id, studentData);
        Alert.alert('نجاح', 'تم تحديث بيانات الطالبة بنجاح');
      } else {
        // Create new student
        await studentsApi.create(studentData);
        Alert.alert('نجاح', 'تمت إضافة الطالبة بنجاح');
      }
      resetStudentForm();
      const children = await studentsApi.getByParent(selectedParent.id);
      setParentChildren(children);
      fetchParents();
    } catch (error: any) {
      console.error('Student error:', error);
      Alert.alert('خطأ', error.message || 'حدث خطأ في الخادم');
    }
  };

  const resetStudentForm = () => {
    setStudentNameAr('');
    setStudentCourse('');
    setStudentSubclass('');
    setEditingStudent(null);
  };

  const handleEditStudent = (student: Student) => {
    setStudentNameAr(student.name_ar || student.name);
    // Find the course based on grade_ar or class_name
    const matchedCourse = ACADEMY_COURSES.find(c => 
      c.nameAr === student.grade_ar || c.nameAr === (student as any).class_name
    );
    if (matchedCourse) {
      setStudentCourse(matchedCourse.id);
      setStudentSubclass((student as any).subclass_name || '');
    }
    setEditingStudent(student);
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
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>

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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث بالاسم أو رقم الجوال..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.resultsCount}>
          {filteredParents.length} من {parents.length} حساب
        </Text>

        {filteredParents.map((parent) => (
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
                <Ionicons name="people" size={20} color={colors.accentYellow} />
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

        {filteredParents.length === 0 && searchQuery && (
          <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
        )}
        {parents.length === 0 && !searchQuery && (
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
              <TouchableOpacity onPress={() => {
                setStudentModalVisible(false);
                resetStudentForm();
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.studentsList}>
              {parentChildren.map((student) => (
                <View key={student.id} style={styles.studentItem}>
                  <Ionicons name="person-circle" size={32} color={colors.accentBlue} />
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {student.name_ar || student.name}
                    </Text>
                    <Text style={styles.studentGrade}>
                      {(student as any).class_name || student.grade_ar || student.grade}
                      {(student as any).subclass_name ? ` - ${(student as any).subclass_name}` : ''}
                    </Text>
                  </View>
                  <View style={styles.studentActions}>
                    <TouchableOpacity 
                      style={styles.studentActionBtn}
                      onPress={() => handleEditStudent(student)}
                    >
                      <Ionicons name="pencil" size={18} color={colors.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.studentActionBtn}
                      onPress={() => handleDeleteStudent(student)}
                    >
                      <Ionicons name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {parentChildren.length === 0 && (
                <Text style={styles.noStudentsText}>لا توجد طالبات مسجلات</Text>
              )}
            </ScrollView>

            <View style={styles.addStudentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {editingStudent ? 'تعديل بيانات الطالبة' : 'إضافة طالبة جديدة'}
                </Text>
                {editingStudent && (
                  <TouchableOpacity onPress={resetStudentForm}>
                    <Text style={styles.cancelEditText}>إلغاء التعديل</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={[styles.input, styles.inputRTL]}
                placeholder="اسم الطالبة"
                value={studentNameAr}
                onChangeText={setStudentNameAr}
                placeholderTextColor={colors.textSecondary}
              />
              
              <Text style={styles.classLabel}>اختر الدورة:</Text>
              <View style={styles.classSelector}>
                {ACADEMY_COURSES.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.classOption,
                      studentCourse === course.id && styles.classOptionSelected,
                    ]}
                    onPress={() => {
                      setStudentCourse(course.id);
                      setStudentSubclass('');
                    }}
                  >
                    <Text
                      style={[
                        styles.classOptionText,
                        studentCourse === course.id && styles.classOptionTextSelected,
                      ]}
                    >
                      {course.nameAr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCourseObj && (
                <>
                  <Text style={styles.classLabel}>اختر الصف:</Text>
                  <View style={styles.classSelector}>
                    {selectedCourseObj.subclasses.map((subclass) => (
                      <TouchableOpacity
                        key={subclass.id}
                        style={[
                          styles.classOption,
                          studentSubclass === subclass.nameAr && styles.classOptionSelected,
                        ]}
                        onPress={() => setStudentSubclass(subclass.nameAr)}
                      >
                        <Text
                          style={[
                            styles.classOptionText,
                            studentSubclass === subclass.nameAr && styles.classOptionTextSelected,
                          ]}
                        >
                          {subclass.nameAr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              
              <TouchableOpacity style={styles.addStudentButton} onPress={handleAddStudent}>
                <Text style={styles.addStudentButtonText}>
                  {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالبة'}
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  parentDetails: {
    flex: 1,
    paddingVertical: 4,
  },
  parentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  parentMobile: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 13,
    color: colors.primary,
    textAlign: 'right',
    marginBottom: 2,
  },
  childrenCount: {
    fontSize: 15,
    color: colors.success,
    marginTop: 6,
    fontWeight: 'bold',
    textAlign: 'right',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 12,
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  studentActionBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.backgroundSecondary,
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
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
  },
  cancelEditText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
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
  classLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  classOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  classOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  classOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  classOptionTextSelected: {
    color: colors.textLight,
  },
});
