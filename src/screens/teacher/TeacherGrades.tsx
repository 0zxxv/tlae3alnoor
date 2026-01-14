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
import { Header, Card, Button, Input } from '../../components';
import { mockStudents, mockGrades, subjects } from '../../data/mockData';
import { Student, Grade } from '../../types';

export const TeacherGrades: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [modalVisible, setModalVisible] = useState(false);
  const [grades, setGrades] = useState<Grade[]>(mockGrades);

  const handleAddGrade = () => {
    if (!selectedStudent || !selectedSubject || !score) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubject);
    const newGrade: Grade = {
      id: `grade${Date.now()}`,
      studentId: selectedStudent.id,
      subject: subject?.name || '',
      subjectAr: subject?.nameAr || '',
      score: parseInt(score),
      maxScore: parseInt(maxScore),
      date: new Date().toISOString().split('T')[0],
      teacherId: 'teacher1',
    };

    setGrades([...grades, newGrade]);
    Alert.alert('نجاح', 'تمت إضافة الدرجة بنجاح');
    
    // Reset form
    setSelectedStudent(null);
    setSelectedSubject('');
    setScore('');
    setModalVisible(false);
  };

  const getStudentGrades = (studentId: string) => {
    return grades.filter((g) => g.studentId === studentId);
  };

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>
            {t('grades')}
          </Text>
          <Button
            title={t('addGrade')}
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="add-circle-outline" size={20} color={colors.textLight} />}
          />
        </View>

        {/* Students with their grades */}
        {mockStudents.map((student) => (
          <Card key={student.id}>
            <View style={[styles.studentHeader, isRTL && styles.studentHeaderRTL]}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {student.nameAr || student.name}
                </Text>
                <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                  {student.gradeAr || student.grade}
                </Text>
              </View>
            </View>
            
            <View style={styles.gradesContainer}>
              {getStudentGrades(student.id).length > 0 ? (
                getStudentGrades(student.id).map((grade) => (
                  <View key={grade.id} style={[styles.gradeItem, isRTL && styles.gradeItemRTL]}>
                    <View style={[styles.gradeSubjectRow, isRTL && styles.gradeSubjectRowRTL]}>
                      <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.gradeSubject, isRTL && styles.textRTL]}>
                        {grade.subjectAr || grade.subject}
                      </Text>
                    </View>
                    <View style={styles.gradeScore}>
                      <Text style={styles.gradeValue}>
                        {grade.score}/{grade.maxScore}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.noGrades, isRTL && styles.textRTL]}>
                  لا توجد درجات
                </Text>
              )}
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add Grade Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="arrow-forward" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.modalHeaderCenter}>
                <Ionicons name="create" size={28} color={colors.accentYellow} />
                <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
                  {t('addGrade')}
                </Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Select Student */}
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('selectStudent')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectionScroll}
            >
              {mockStudents.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={[
                    styles.selectionItem,
                    selectedStudent?.id === student.id && styles.selectionItemActive,
                  ]}
                  onPress={() => setSelectedStudent(student)}
                >
                  <Text
                    style={[
                      styles.selectionText,
                      selectedStudent?.id === student.id && styles.selectionTextActive,
                    ]}
                  >
                    {student.nameAr || student.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Select Subject */}
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('selectSubject')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectionScroll}
            >
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.selectionItem,
                    selectedSubject === subject.id && styles.selectionItemActive,
                  ]}
                  onPress={() => setSelectedSubject(subject.id)}
                >
                  <Text
                    style={[
                      styles.selectionText,
                      selectedSubject === subject.id && styles.selectionTextActive,
                    ]}
                  >
                    {subject.nameAr || subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Score Input */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreInput}>
                <Input
                  label={t('score')}
                  value={score}
                  onChangeText={setScore}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.scoreInput}>
                <Input
                  label={t('maxScore')}
                  value={maxScore}
                  onChangeText={setMaxScore}
                  keyboardType="numeric"
                  placeholder="100"
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Button
                title={t('cancel')}
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title={t('submit')}
                onPress={handleAddGrade}
                style={styles.modalButton}
              />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  textRTL: {
    textAlign: 'right',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  studentHeaderRTL: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  studentGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gradesContainer: {
    gap: 8,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gradeItemRTL: {
    flexDirection: 'row-reverse',
  },
  gradeSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeSubjectRowRTL: {
    flexDirection: 'row-reverse',
  },
  gradeSubject: {
    fontSize: 14,
    color: colors.text,
  },
  gradeScore: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  noGrades: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  selectionScroll: {
    marginBottom: 16,
  },
  selectionItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    marginRight: 8,
  },
  selectionItemActive: {
    backgroundColor: colors.accentBlue,
  },
  selectionText: {
    fontSize: 14,
    color: colors.text,
  },
  selectionTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreInput: {
    flex: 1,
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
