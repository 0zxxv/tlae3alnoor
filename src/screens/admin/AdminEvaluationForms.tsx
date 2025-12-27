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

interface Question {
  id?: string;
  question: string;
  question_ar: string;
  answer_type: string;
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

export const AdminEvaluationForms: React.FC = () => {
  const { isRTL } = useLanguage();
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);

  // Form states - Arabic only
  const [formNameAr, setFormNameAr] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question states - Arabic only
  const [questionTextAr, setQuestionTextAr] = useState('');

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
    setFormNameAr('');
    setFormDescAr('');
    setQuestions([]);
  };

  const resetQuestionForm = () => {
    setQuestionTextAr('');
  };

  const handleAddQuestion = () => {
    if (!questionTextAr) {
      Alert.alert('خطأ', 'يرجى إدخال نص السؤال');
      return;
    }

    const newQuestion: Question = {
      question: questionTextAr,
      question_ar: questionTextAr,
      answer_type: 'fixed_3', // All questions have the same 3 answer types
    };

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();
    setQuestionModalVisible(false);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmitForm = async () => {
    if (!formNameAr) {
      Alert.alert('خطأ', 'يرجى إدخال اسم النموذج');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة سؤال واحد على الأقل');
      return;
    }

    try {
      await evaluationsApi.createForm({
        name: formNameAr,
        name_ar: formNameAr,
        description: formDescAr,
        description_ar: formDescAr,
        questions: questions,
      });
      setModalVisible(false);
      resetForm();
      fetchForms();
      Alert.alert('نجاح', 'تم إنشاء النموذج بنجاح');
    } catch (error: any) {
      Alert.alert('خطأ', error.message);
    }
  };

  const handleDeleteForm = (form: EvaluationForm) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذا النموذج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await evaluationsApi.deleteForm(form.id);
              fetchForms();
            } catch (error: any) {
              Alert.alert('خطأ', error.message);
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
        fullForm.name_ar || fullForm.name,
        fullForm.questions?.map((q: Question, i: number) => 
          `${i + 1}. ${q.question_ar || q.question}`
        ).join('\n') || 'لا توجد أسئلة'
      );
    } catch (error) {
      console.error('Error viewing form:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="نماذج التقييم" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="نماذج التقييم" />
      
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
          <Text style={styles.addButtonText}>إنشاء نموذج جديد</Text>
        </TouchableOpacity>

        {/* Info about answer types */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            كل سؤال له 3 خيارات إجابة: أنجزت ✓ | تحتاج متابعة ⚠ | ملاحظات 📝
          </Text>
        </View>

        {forms.map((form) => (
          <View key={form.id} style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIcon}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
              </View>
              <View style={styles.formInfo}>
                <Text style={[styles.formName, isRTL && styles.textRTL]}>
                  {form.name_ar || form.name}
                </Text>
                {form.description_ar && (
                  <Text style={[styles.formDesc, isRTL && styles.textRTL]}>
                    {form.description_ar || form.description}
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
          <Text style={styles.emptyText}>لا توجد نماذج تقييم</Text>
        )}
      </ScrollView>

      {/* Create Form Modal */}
      <Modal visible={modalVisible && !questionModalVisible} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>إنشاء نموذج تقييم</Text>
            <TouchableOpacity onPress={handleSubmitForm}>
              <Text style={styles.saveText}>حفظ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>معلومات النموذج</Text>
            
            <TextInput
              style={[styles.input, styles.inputRTL]}
              placeholder="اسم النموذج"
              value={formNameAr}
              onChangeText={setFormNameAr}
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.textArea, styles.inputRTL]}
              placeholder="الوصف (اختياري)"
              value={formDescAr}
              onChangeText={setFormDescAr}
              multiline
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.questionsSection}>
              <View style={styles.questionsSectionHeader}>
                <Text style={styles.sectionTitle}>الأسئلة ({questions.length})</Text>
                <TouchableOpacity
                  style={styles.addQuestionButton}
                  onPress={() => setQuestionModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={colors.textLight} />
                  <Text style={styles.addQuestionText}>إضافة سؤال</Text>
                </TouchableOpacity>
              </View>

              {questions.map((q, index) => (
                <View key={index} style={styles.questionCard}>
                  <View style={styles.questionInfo}>
                    <Text style={styles.questionNumber}>{index + 1}</Text>
                    <View style={styles.questionDetails}>
                      <Text style={styles.questionText}>{q.question_ar}</Text>
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

      {/* Add Question Modal */}
      <Modal visible={questionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.questionModalContent}>
            <Text style={styles.modalTitle}>إضافة سؤال</Text>

            <TextInput
              style={[styles.input, styles.inputRTL]}
              placeholder="نص السؤال"
              value={questionTextAr}
              onChangeText={setQuestionTextAr}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.answerTypesInfo}>
              <Text style={styles.answerTypesLabel}>خيارات الإجابة:</Text>
              <View style={styles.answerTypesList}>
                <View style={[styles.answerTypeTag, { backgroundColor: colors.success }]}>
                  <Text style={styles.answerTypeTagText}>أنجزت ✓</Text>
                </View>
                <View style={[styles.answerTypeTag, { backgroundColor: colors.warning }]}>
                  <Text style={styles.answerTypeTagText}>تحتاج متابعة ⚠</Text>
                </View>
                <View style={[styles.answerTypeTag, { backgroundColor: colors.textSecondary }]}>
                  <Text style={styles.answerTypeTagText}>ملاحظات 📝</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setQuestionModalVisible(false);
                  resetQuestionForm();
                }}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddQuestion}
              >
                <Text style={styles.submitButtonText}>إضافة</Text>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    textAlign: 'right',
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
    textAlign: 'right',
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
  },
  answerTypesInfo: {
    marginTop: 8,
    marginBottom: 16,
  },
  answerTypesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  answerTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  answerTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  answerTypeTagText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '600',
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
