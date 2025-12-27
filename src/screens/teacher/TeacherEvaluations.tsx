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

interface AnswerOption {
  id: string;
  option_text: string;
  option_text_ar: string;
  option_value: number;
}

interface Question {
  id: string;
  question: string;
  question_ar: string;
  answer_type: string;
  options: AnswerOption[];
}

interface EvaluationForm {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  questions?: Question[];
}

export const TeacherEvaluations: React.FC = () => {
  const { isRTL, language } = useLanguage();
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
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [formsData, studentsData] = await Promise.all([
        evaluationsApi.getForms(),
        studentsApi.getAll(),
      ]);
      setForms(formsData.filter(f => f.is_active !== 0));
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
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', language === 'ar' ? 'فشل في تحميل النموذج' : 'Failed to load form');
    }
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentSelectVisible(false);
    setAnswers({});
    setEvaluationVisible(true);
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedForm || !selectedStudent) return;

    // Check if all questions are answered
    const unanswered = selectedForm.questions?.filter(q => !answers[q.id]);
    if (unanswered && unanswered.length > 0) {
      Alert.alert(
        language === 'ar' ? 'تنبيه' : 'Warning',
        language === 'ar' ? 'يرجى الإجابة على جميع الأسئلة' : 'Please answer all questions'
      );
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
        question_id: questionId,
        selected_option_id: optionId,
      }));

      await evaluationsApi.create({
        student_id: selectedStudent.id,
        form_id: selectedForm.id,
        teacher_id: 'demo-teacher', // In real app, get from auth context
        evaluation_date: new Date().toISOString().split('T')[0],
        answers: answersArray,
      });

      Alert.alert(
        language === 'ar' ? 'نجاح' : 'Success',
        language === 'ar' ? 'تم حفظ التقييم بنجاح' : 'Evaluation saved successfully'
      );
      setEvaluationVisible(false);
      setSelectedForm(null);
      setSelectedStudent(null);
      setAnswers({});
    } catch (error: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'ar' ? 'تقييم الطالبات' : 'Student Evaluations'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'تقييم الطالبات' : 'Student Evaluations'} showBack />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <TouchableOpacity style={styles.startButton} onPress={handleStartEvaluation}>
          <Ionicons name="clipboard" size={32} color={colors.textLight} />
          <Text style={styles.startButtonText}>
            {language === 'ar' ? 'بدء تقييم جديد' : 'Start New Evaluation'}
          </Text>
          <Text style={styles.startButtonSubtext}>
            {language === 'ar' ? 'اختر النموذج والطالبة' : 'Select form and student'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {language === 'ar' ? 'نماذج التقييم المتاحة' : 'Available Forms'}
        </Text>

        {forms.map((form) => (
          <View key={form.id} style={styles.formCard}>
            <View style={styles.formIcon}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
            </View>
            <View style={styles.formInfo}>
              <Text style={[styles.formName, isRTL && styles.textRTL]}>
                {language === 'ar' ? form.name_ar : form.name}
              </Text>
              {form.description && (
                <Text style={[styles.formDesc, isRTL && styles.textRTL]}>
                  {language === 'ar' ? form.description_ar : form.description}
                </Text>
              )}
            </View>
          </View>
        ))}

        {forms.length === 0 && (
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا توجد نماذج تقييم متاحة' : 'No evaluation forms available'}
          </Text>
        )}
      </ScrollView>

      {/* Form Selection Modal */}
      <Modal visible={formSelectVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ar' ? 'اختر نموذج التقييم' : 'Select Evaluation Form'}
              </Text>
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
                  <Text style={styles.selectItemText}>
                    {language === 'ar' ? form.name_ar : form.name}
                  </Text>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'ar' ? 'اختر الطالبة' : 'Select Student'}
              </Text>
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
                    <Text style={styles.selectItemText}>
                      {language === 'ar' ? student.name_ar : student.name}
                    </Text>
                    <Text style={styles.studentGrade}>
                      {language === 'ar' ? student.grade_ar : student.grade}
                    </Text>
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
              <Text style={styles.modalTitle}>
                {language === 'ar' ? selectedForm?.name_ar : selectedForm?.name}
              </Text>
              <Text style={styles.evalStudent}>
                {language === 'ar' ? selectedStudent?.name_ar : selectedStudent?.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleSubmitEvaluation}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.evalContent}>
            {selectedForm?.questions?.map((question, index) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionNumber}>
                  {language === 'ar' ? `السؤال ${index + 1}` : `Question ${index + 1}`}
                </Text>
                <Text style={[styles.questionText, isRTL && styles.textRTL]}>
                  {language === 'ar' ? question.question_ar : question.question}
                </Text>
                <View style={styles.optionsContainer}>
                  {question.options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionButton,
                        answers[question.id] === option.id && styles.optionSelected,
                      ]}
                      onPress={() => handleSelectAnswer(question.id, option.id)}
                    >
                      <Text style={[
                        styles.optionText,
                        answers[question.id] === option.id && styles.optionTextSelected,
                      ]}>
                        {language === 'ar' ? option.option_text_ar : option.option_text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 40,
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
  },
  questionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

