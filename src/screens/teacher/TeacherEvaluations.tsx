import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { evaluationsApi, studentsApi } from '../../services/api';

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade: string;
  grade_ar: string;
}

interface Question {
  id: string;
  question: string;
  question_ar: string;
}

interface EvaluationForm {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  questions?: Question[];
}

// Fixed answer types for all questions
const ANSWER_OPTIONS = [
  { id: 'completed', label: 'أنجزت', icon: 'checkmark-circle', color: colors.success },
  { id: 'needs_followup', label: 'تحتاج متابعة', icon: 'alert-circle', color: colors.warning },
  { id: 'notes', label: 'ملاحظات', icon: 'create', color: colors.textSecondary },
];

export const TeacherEvaluations: React.FC = () => {
  const { isRTL } = useLanguage();
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [formSelectVisible, setFormSelectVisible] = useState(false);
  const [studentSelectVisible, setStudentSelectVisible] = useState(false);
  const [evaluationVisible, setEvaluationVisible] = useState(false);
  
  // Selected items
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: { type: string; notes?: string } }>({});
  const [submitting, setSubmitting] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [formsData, studentsData] = await Promise.all([
        evaluationsApi.getForms(),
        studentsApi.getAll(),
      ]);
      setForms(formsData.filter((f: any) => f.is_active !== 0));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStartEvaluation = () => {
    setFormSelectVisible(true);
  };

  const handleSelectForm = async (form: EvaluationForm) => {
    try {
      const fullForm = await evaluationsApi.getFormById(form.id);
      setSelectedForm(fullForm);
      setFormSelectVisible(false);
      setStudentSelectVisible(true);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل النموذج');
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSelectVisible(false);
    setAnswers({});
    setEvaluationVisible(true);
  };

  const handleSelectAnswer = (questionId: string, type: string) => {
    if (type === 'notes') {
      // Show notes input modal
      setCurrentQuestionId(questionId);
      setCurrentNotes(answers[questionId]?.notes || '');
      setNotesModalVisible(true);
    } else {
      setAnswers(prev => ({ 
        ...prev, 
        [questionId]: { type, notes: undefined } 
      }));
    }
  };

  const handleSaveNotes = () => {
    if (currentQuestionId && currentNotes.trim()) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionId]: { type: 'notes', notes: currentNotes.trim() }
      }));
    }
    setNotesModalVisible(false);
    setCurrentQuestionId(null);
    setCurrentNotes('');
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedForm || !selectedStudent) return;

    // Check if all questions are answered
    const unanswered = selectedForm.questions?.filter(q => !answers[q.id]);
    if (unanswered && unanswered.length > 0) {
      Alert.alert('تنبيه', 'يرجى الإجابة على جميع الأسئلة');
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer_type: answer.type,
        notes: answer.notes || null,
      }));

      await evaluationsApi.create({
        student_id: selectedStudent.id,
        form_id: selectedForm.id,
        teacher_id: 'demo-teacher',
        evaluation_date: new Date().toISOString().split('T')[0],
        answers: answersArray,
      });

      Alert.alert('نجاح', 'تم حفظ التقييم بنجاح');
      setEvaluationVisible(false);
      setSelectedForm(null);
      setSelectedStudent(null);
      setAnswers({});
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="تقييم الطالبات" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="تقييم الطالبات" />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity style={styles.startButton} onPress={handleStartEvaluation}>
          <Ionicons name="clipboard" size={32} color={colors.textLight} />
          <Text style={styles.startButtonText}>بدء تقييم جديد</Text>
          <Text style={styles.startButtonSubtext}>اختر النموذج والطالبة</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          نماذج التقييم المتاحة
        </Text>

        {forms.map((form) => (
          <View key={form.id} style={styles.formCard}>
            <View style={styles.formIcon}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <View style={styles.formInfo}>
              <Text style={[styles.formName, isRTL && styles.textRTL]}>
                {form.name_ar || form.name}
              </Text>
              {form.description_ar && (
                <Text style={[styles.formDesc, isRTL && styles.textRTL]}>
                  {form.description_ar}
                </Text>
              )}
            </View>
          </View>
        ))}

        {forms.length === 0 && (
          <Text style={styles.emptyText}>لا توجد نماذج تقييم متاحة</Text>
        )}
      </ScrollView>

      {/* Form Selection Modal */}
      <Modal visible={formSelectVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSmall}>
              <Text style={styles.modalTitle}>اختر نموذج التقييم</Text>
              <TouchableOpacity onPress={() => setFormSelectVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {forms.map((form) => (
                <TouchableOpacity
                  key={form.id}
                  style={styles.selectItem}
                  onPress={() => handleSelectForm(form)}
                >
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <Text style={styles.selectItemText}>{form.name_ar || form.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Student Selection Modal */}
      <Modal visible={studentSelectVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderSmall}>
              <Text style={styles.modalTitle}>اختر الطالبة</Text>
              <TouchableOpacity onPress={() => setStudentSelectVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {students.map((student) => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.selectItem}
                  onPress={() => handleSelectStudent(student)}
                >
                  <View style={styles.studentAvatar}>
                    <Ionicons name="person" size={20} color={colors.textLight} />
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.selectItemText}>{student.name_ar || student.name}</Text>
                    <Text style={styles.studentGrade}>{student.grade_ar || student.grade}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Evaluation Modal */}
      <Modal visible={evaluationVisible} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEvaluationVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.evalHeader}>
              <Text style={styles.modalTitle}>{selectedForm?.name_ar || selectedForm?.name}</Text>
              <Text style={styles.evalStudent}>{selectedStudent?.name_ar || selectedStudent?.name}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleSubmitEvaluation}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveText}>حفظ</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.evalContent}>
            {selectedForm?.questions?.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionNumber}>السؤال {index + 1}</Text>
                <Text style={[styles.questionText, isRTL && styles.textRTL]}>
                  {question.question_ar || question.question}
                </Text>
                <View style={styles.optionsContainer}>
                  {ANSWER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        { borderColor: option.color },
                        answers[question.id]?.type === option.id && { 
                          backgroundColor: option.color,
                          borderColor: option.color,
                        },
                      ]}
                      onPress={() => handleSelectAnswer(question.id, option.id)}
                    >
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={answers[question.id]?.type === option.id ? colors.textLight : option.color} 
                      />
                      <Text style={[
                        styles.optionText,
                        { color: answers[question.id]?.type === option.id ? colors.textLight : option.color },
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {answers[question.id]?.type === 'notes' && answers[question.id]?.notes && (
                  <View style={styles.notesPreview}>
                    <Text style={styles.notesPreviewText}>{answers[question.id].notes}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Notes Input Modal */}
      <Modal visible={notesModalVisible} animationType="fade" transparent>
        <View style={styles.notesModalOverlay}>
          <View style={styles.notesModalContent}>
            <Text style={styles.notesModalTitle}>أضف ملاحظاتك</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="اكتب ملاحظاتك هنا..."
              value={currentNotes}
              onChangeText={setCurrentNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={colors.textSecondary}
              textAlign="right"
            />
            <View style={styles.notesModalButtons}>
              <TouchableOpacity
                style={[styles.notesButton, styles.cancelButton]}
                onPress={() => {
                  setNotesModalVisible(false);
                  setCurrentQuestionId(null);
                  setCurrentNotes('');
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notesButton, styles.submitButton]}
                onPress={handleSaveNotes}
              >
                <Text style={styles.submitButtonText}>حفظ</Text>
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
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  startButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  textRTL: {
    textAlign: 'right',
  },
  formCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  formDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeaderSmall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  selectItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
  },
  studentGrade: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  fullModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  evalHeader: {
    flex: 1,
    alignItems: 'center',
  },
  evalStudent: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  evalContent: {
    flex: 1,
    padding: 16,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionNumber: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 6,
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  notesPreview: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  notesPreviewText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  notesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notesModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  notesModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: 'top',
  },
  notesModalButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  notesButton: {
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
