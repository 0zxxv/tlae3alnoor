import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Button, Input, Card } from '../../components';
import { mockStudents as initialStudents } from '../../data/mockData';
import { Student } from '../../types';

export const AdminStudents: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [grade, setGrade] = useState('');
  const [gradeAr, setGradeAr] = useState('');

  const handleAddStudent = () => {
    if (!name || !grade) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields'
      );
      return;
    }

    const newStudent: Student = {
      id: `student${Date.now()}`,
      name,
      nameAr: nameAr || name,
      grade,
      gradeAr: gradeAr || grade,
      parentId: 'parent1',
    };

    setStudents([...students, newStudent]);
    Alert.alert(
      language === 'ar' ? 'نجاح' : 'Success',
      language === 'ar' ? 'تمت إضافة الطالب بنجاح' : 'Student added successfully'
    );

    // Reset form
    setName('');
    setNameAr('');
    setGrade('');
    setGradeAr('');
    setModalVisible(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا الطالب؟'
        : 'Are you sure you want to delete this student?',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            setStudents(students.filter((s) => s.id !== studentId));
            Alert.alert(
              language === 'ar' ? 'نجاح' : 'Success',
              language === 'ar' ? 'تم حذف الطالب بنجاح' : 'Student deleted successfully'
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
            <Ionicons name="school" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('students')}
            </Text>
          </View>
          <Button
            title={t('addStudent')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="person-add" size={18} color={colors.textLight} />}
          />
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {language === 'ar'
            ? `${students.length} طالب مسجل`
            : `${students.length} students registered`}
        </Text>

        {/* Students List */}
        {students.map((student) => (
          <Card key={student.id}>
            <View style={[styles.studentItem, isRTL && styles.studentItemRTL]}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? student.nameAr : student.name}
                </Text>
                <View style={[styles.gradeRow, isRTL && styles.gradeRowRTL]}>
                  <Ionicons name="school-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                    {language === 'ar' ? student.gradeAr : student.grade}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteStudent(student.id)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Student Modal */}
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
                <Ionicons name="person-add" size={28} color={colors.primary} />
                <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                  {t('addStudent')}
                </Text>
              </View>

              <Input
                label={language === 'ar' ? 'اسم الطالب (إنجليزي)' : 'Student Name (English)'}
                value={name}
                onChangeText={setName}
                placeholder={language === 'ar' ? 'أدخل اسم الطالب' : 'Enter student name'}
              />

              <Input
                label={language === 'ar' ? 'اسم الطالب (عربي)' : 'Student Name (Arabic)'}
                value={nameAr}
                onChangeText={setNameAr}
                placeholder={language === 'ar' ? 'أدخل اسم الطالب بالعربية' : 'Enter name in Arabic'}
              />

              <Input
                label={language === 'ar' ? 'الصف (إنجليزي)' : 'Grade (English)'}
                value={grade}
                onChangeText={setGrade}
                placeholder={language === 'ar' ? 'مثال: Grade 3' : 'e.g., Grade 3'}
              />

              <Input
                label={language === 'ar' ? 'الصف (عربي)' : 'Grade (Arabic)'}
                value={gradeAr}
                onChangeText={setGradeAr}
                placeholder={language === 'ar' ? 'مثال: الصف الثالث' : 'e.g., الصف الثالث'}
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
                  onPress={handleAddStudent}
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
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentItemRTL: {
    flexDirection: 'row-reverse',
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gradeRowRTL: {
    flexDirection: 'row-reverse',
  },
  studentGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});
