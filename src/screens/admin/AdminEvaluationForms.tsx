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
import { evaluationsApi } from '../../services/api';

interface AnswerOption {
  option_text: string;
  option_text_ar: string;
  option_value: number;
}

interface Question {
  id?: string;
  question: string;
  question_ar: string;
  answer_type: string;
  options: AnswerOption[];
}

interface EvaluationForm {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  is_active: number;
  questions?: Question[];
}

const ANSWER_TYPES = [
  { id: 'pass_fail', label: 'Pass / Fail', labelAr: 'ناجح / راسب' },
  { id: 'scale_3', label: '3-Point Scale', labelAr: 'مقياس 3 نقاط' },
  { id: 'scale_4', label: '4-Point Scale', labelAr: 'مقياس 4 نقاط' },
  { id: 'scale_5', label: '5-Point Scale', labelAr: 'مقياس 5 نقاط' },
];

const getDefaultOptions = (type: string): AnswerOption[] => {
  switch (type) {
    case 'pass_fail':
      return [
        { option_text: 'Pass', option_text_ar: 'ناجح', option_value: 1 },
        { option_text: 'Fail', option_text_ar: 'راسب', option_value: 0 },
      ];
    case 'scale_3':
      return [
        { option_text: 'Excellent', option_text_ar: 'ممتاز', option_value: 3 },
        { option_text: 'Good', option_text_ar: 'جيد', option_value: 2 },
        { option_text: 'Needs Improvement', option_text_ar: 'يحتاج تحسين', option_value: 1 },
      ];
    case 'scale_4':
      return [
        { option_text: 'Excellent', option_text_ar: 'ممتاز', option_value: 4 },
        { option_text: 'Very Good', option_text_ar: 'جيد جداً', option_value: 3 },
        { option_text: 'Good', option_text_ar: 'جيد', option_value: 2 },
        { option_text: 'Needs Improvement', option_text_ar: 'يحتاج تحسين', option_value: 1 },
      ];
    case 'scale_5':
      return [
        { option_text: 'Excellent', option_text_ar: 'ممتاز', option_value: 5 },
        { option_text: 'Very Good', option_text_ar: 'جيد جداً', option_value: 4 },
        { option_text: 'Good', option_text_ar: 'جيد', option_value: 3 },
        { option_text: 'Fair', option_text_ar: 'مقبول', option_value: 2 },
        { option_text: 'Needs Improvement', option_text_ar: 'يحتاج تحسين', option_value: 1 },
      ];
    default:
      return [];
  }
};

export const AdminEvaluationForms: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<EvaluationForm | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question states
  const [questionText, setQuestionText] = useState('');
  const [questionTextAr, setQuestionTextAr] = useState('');
  const [answerType, setAnswerType] = useState('pass_fail');
  const [customOptions, setCustomOptions] = useState<AnswerOption[]>([]);

  const fetchForms = useCallback(async () => {
    try {
      const data = await evaluationsApi.getForms();
      setForms(data);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const resetForm = () => {
    setFormName('');
    setFormNameAr('');
    setFormDesc('');
    setFormDescAr('');
    setQuestions([]);
    setSelectedForm(null);
  };

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionTextAr('');
    setAnswerType('pass_fail');
    setCustomOptions([]);
  };

  const handleAddQuestion = () => {
    if (!questionText || !questionTextAr) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال نص السؤال' : 'Please enter question text'
      );
      return;
    }

    const options = customOptions.length > 0 ? customOptions : getDefaultOptions(answerType);
    
    const newQuestion: Question = {
      question: questionText,
      question_ar: questionTextAr,
      answer_type: answerType,
      options: options,
    };

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();
    setQuestionModalVisible(false);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmitForm = async () => {
    if (!formName || !formNameAr) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إدخال اسم النموذج' : 'Please enter form name'
      );
      return;
    }

    if (questions.length === 0) {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'يرجى إضافة سؤال واحد على الأقل' : 'Please add at least one question'
      );
      return;
    }

    try {
      await evaluationsApi.createForm({
        name: formName,
        name_ar: formNameAr,
        description: formDesc,
        description_ar: formDescAr,
        questions: questions,
      });
      setModalVisible(false);
      resetForm();
      fetchForms();
      Alert.alert(
        language === 'ar' ? 'نجاح' : 'Success',
        language === 'ar' ? 'تم إنشاء النموذج بنجاح' : 'Form created successfully'
      );
    } catch (error: any) {
      Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
    }
  };

  const handleDeleteForm = (form: EvaluationForm) => {
    Alert.alert(
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar' ? 'هل أنت متأكد من حذف هذا النموذج؟' : 'Are you sure you want to delete this form?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await evaluationsApi.deleteForm(form.id);
              fetchForms();
            } catch (error: any) {
              Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleViewForm = async (form: EvaluationForm) => {
    try {
      const fullForm = await evaluationsApi.getFormById(form.id);
      Alert.alert(
        language === 'ar' ? fullForm.name_ar : fullForm.name,
        fullForm.questions?.map((q: Question, i: number) => 
          `${i + 1}. ${language === 'ar' ? q.question_ar : q.question}`
        ).join('\n') || (language === 'ar' ? 'لا توجد أسئلة' : 'No questions')
      );
    } catch (error) {
      console.error('Error viewing form:', error);
    }
  };

  const addCustomOption = () => {
    setCustomOptions([...customOptions, { option_text: '', option_text_ar: '', option_value: customOptions.length + 1 }]);
  };

  const updateCustomOption = (index: number, field: keyof AnswerOption, value: string | number) => {
    const updated = [...customOptions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomOptions(updated);
  };

  const removeCustomOption = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'ar' ? 'نماذج التقييم' : 'Evaluation Forms'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'نماذج التقييم' : 'Evaluation Forms'} showBack />
      
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
            {language === 'ar' ? 'إنشاء نموذج جديد' : 'Create New Form'}
          </Text>
        </TouchableOpacity>

        {forms.map((form) => (
          <View key={form.id} style={styles.formCard}>
            <View style={styles.formHeader}>
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
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewForm(form)}
              >
                <Ionicons name="eye" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteForm(form)}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {forms.length === 0 && (
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا توجد نماذج تقييم' : 'No evaluation forms found'}
          </Text>
        )}
      </ScrollView>

      {/* Create Form Modal */}
      <Modal visible={modalVisible && !questionModalVisible} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {language === 'ar' ? 'إنشاء نموذج تقييم' : 'Create Evaluation Form'}
            </Text>
            <TouchableOpacity onPress={handleSubmitForm}>
              <Text style={styles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'معلومات النموذج' : 'Form Information'}
            </Text>
            
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'اسم النموذج (إنجليزي)' : 'Form Name (English)'}
              value={formName}
              onChangeText={setFormName}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'اسم النموذج (عربي)' : 'Form Name (Arabic)'}
              value={formNameAr}
              onChangeText={setFormNameAr}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              value={formDesc}
              onChangeText={setFormDesc}
              multiline
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              value={formDescAr}
              onChangeText={setFormDescAr}
              multiline
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.questionsSection}>
              <View style={styles.questionsSectionHeader}>
                <Text style={styles.sectionTitle}>
                  {language === 'ar' ? 'الأسئلة' : 'Questions'} ({questions.length})
                </Text>
                <TouchableOpacity
                  style={styles.addQuestionButton}
                  onPress={() => setQuestionModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={colors.textLight} />
                  <Text style={styles.addQuestionText}>
                    {language === 'ar' ? 'إضافة سؤال' : 'Add Question'}
                  </Text>
                </TouchableOpacity>
              </View>

              {questions.map((q, index) => (
                <View key={index} style={styles.questionCard}>
                  <View style={styles.questionInfo}>
                    <Text style={styles.questionNumber}>{index + 1}</Text>
                    <View style={styles.questionDetails}>
                      <Text style={styles.questionText}>
                        {language === 'ar' ? q.question_ar : q.question}
                      </Text>
                      <Text style={styles.questionType}>
                        {ANSWER_TYPES.find(t => t.id === q.answer_type)?.[language === 'ar' ? 'labelAr' : 'label']}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveQuestion(index)}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Question Modal - Separate from form modal */}
      <Modal visible={questionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.questionModalContent}>
            <Text style={styles.modalTitle}>
              {language === 'ar' ? 'إضافة سؤال' : 'Add Question'}
            </Text>

            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'نص السؤال (إنجليزي)' : 'Question Text (English)'}
              value={questionText}
              onChangeText={setQuestionText}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              placeholder={language === 'ar' ? 'نص السؤال (عربي)' : 'Question Text (Arabic)'}
              value={questionTextAr}
              onChangeText={setQuestionTextAr}
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>
              {language === 'ar' ? 'نوع الإجابة' : 'Answer Type'}
            </Text>
            <View style={styles.answerTypes}>
              {ANSWER_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.answerTypeButton,
                    answerType === type.id && styles.answerTypeSelected,
                  ]}
                  onPress={() => {
                    setAnswerType(type.id);
                    setCustomOptions([]);
                  }}
                >
                  <Text style={[
                    styles.answerTypeText,
                    answerType === type.id && styles.answerTypeTextSelected,
                  ]}>
                    {language === 'ar' ? type.labelAr : type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setQuestionModalVisible(false);
                  resetQuestionForm();
                }}
              >
                <Text style={styles.cancelButtonText}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddQuestion}
              >
                <Text style={styles.submitButtonText}>
                  {language === 'ar' ? 'إضافة' : 'Add'}
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  fullModal: {
    flex: 1,
    backgroundColor: colors.background,
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
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  inputRTL: {
    textAlign: 'right',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  questionsSection: {
    marginTop: 24,
  },
  questionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addQuestionText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  questionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 12,
  },
  questionDetails: {
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  questionType: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  questionModalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  answerTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  answerTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  answerTypeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  answerTypeText: {
    fontSize: 12,
    color: colors.text,
  },
  answerTypeTextSelected: {
    color: colors.textLight,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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

