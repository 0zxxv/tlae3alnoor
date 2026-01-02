import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { evaluationsApi } from '../../services/api';
import { EVALUATION_CATEGORIES } from '../../constants/classes';

const { width } = Dimensions.get('window');

interface EvaluationAnswer {
  question: string;
  question_ar: string;
  answer_type: string;
  notes?: string;
}

interface Evaluation {
  id: string;
  form_name: string;
  form_name_ar: string;
  teacher_name: string;
  teacher_name_ar: string;
  evaluation_date: string;
  answers?: EvaluationAnswer[];
}

// Answer type labels
const ANSWER_LABELS: { [key: string]: { label: string; color: string; icon: string } } = {
  completed: { label: 'أنجزت', color: colors.success, icon: 'checkmark-circle' },
  needs_followup: { label: 'تحتاج متابعة', color: colors.warning, icon: 'alert-circle' },
  notes: { label: 'ملاحظات', color: colors.textSecondary, icon: 'create' },
};

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: string } = {
  'الوضوء': 'water',
  'الصلاة': 'moon',
  'السلوك': 'heart',
  'المشاركة': 'hand-left',
  'الحجاب': 'shirt',
};

export const ParentEvaluations: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const { selectedChild } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchEvaluations = useCallback(async () => {
    if (!selectedChild?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await evaluationsApi.getByStudent(selectedChild.id);
      setEvaluations(data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChild?.id]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluations();
  };

  const handleViewDetails = async (evaluation: Evaluation) => {
    setLoadingDetails(true);
    setDetailsVisible(true);
    try {
      const details = await evaluationsApi.getById(evaluation.id);
      setSelectedEvaluation(details);
    } catch (error) {
      console.error('Error fetching evaluation details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Get latest evaluation status for each category
  const getCategoryStatus = (categoryName: string) => {
    // Find the latest evaluation that includes this category
    for (const evaluation of evaluations) {
      if (evaluation.answers) {
        const answer = evaluation.answers.find(a => 
          a.question_ar === categoryName || a.question === categoryName
        );
        if (answer) {
          return answer.answer_type;
        }
      }
    }
    return null;
  };

  // Get overall score percentage
  const getOverallScore = () => {
    let completed = 0;
    let total = 0;
    evaluations.forEach(e => {
      if (e.answers) {
        e.answers.forEach(a => {
          total++;
          if (a.answer_type === 'completed') completed++;
        });
      }
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="التقييم" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة الرئيسية</Text>
        </TouchableOpacity>

        <Text style={[styles.title, isRTL && styles.textRTL]}>
          التقييم
        </Text>

        {/* Student Info */}
        {selectedChild && (
          <View style={[styles.childInfo, isRTL && styles.childInfoRTL]}>
            <View style={styles.childAvatar}>
              <Ionicons name="person" size={28} color={colors.textLight} />
            </View>
            <View style={styles.childDetails}>
              <Text style={[styles.childName, isRTL && styles.textRTL]}>
                {selectedChild.nameAr || selectedChild.name}
              </Text>
              <Text style={[styles.childGrade, isRTL && styles.textRTL]}>
                {selectedChild.gradeAr || selectedChild.grade}
              </Text>
            </View>
          </View>
        )}

        {/* Overall Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>التقييم العام</Text>
          <View style={styles.scoreCircle}>
            <Ionicons name="trophy" size={24} color={colors.primary} />
            <Text style={styles.scoreValue}>{getOverallScore()}%</Text>
          </View>
          <Text style={styles.scoreSubtext}>
            من {evaluations.length} تقييمات
          </Text>
        </View>

        {/* Evaluation Categories */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          معايير التقييم
        </Text>

        {EVALUATION_CATEGORIES.map((category) => {
          const status = getCategoryStatus(category.nameAr);
          const statusInfo = status ? ANSWER_LABELS[status] : null;
          
          return (
            <View key={category.id} style={styles.categoryCard}>
              <View style={[styles.categoryRow, isRTL && styles.categoryRowRTL]}>
                <View style={styles.categoryIcon}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={colors.primary} 
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, isRTL && styles.textRTL]}>
                    {category.nameAr}
                  </Text>
                  {statusInfo ? (
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                      <Ionicons 
                        name={statusInfo.icon as any} 
                        size={14} 
                        color={statusInfo.color} 
                      />
                      <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.noEvalText}>لم يتم التقييم بعد</Text>
                  )}
                </View>
                <View style={[
                  styles.categoryIndicator,
                  { backgroundColor: statusInfo?.color || colors.border }
                ]} />
              </View>
            </View>
          );
        })}

        {/* Recent Evaluations */}
        {evaluations.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL, { marginTop: 24 }]}>
              التقييمات الأخيرة
            </Text>

            {evaluations.slice(0, 3).map((evaluation) => (
              <TouchableOpacity
                key={evaluation.id}
                style={styles.evaluationCard}
                onPress={() => handleViewDetails(evaluation)}
              >
                <View style={styles.evalHeader}>
                  <View style={styles.evalIcon}>
                    <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.evalInfo}>
                    <Text style={[styles.evalName, isRTL && styles.textRTL]}>
                      {evaluation.form_name_ar || evaluation.form_name}
                    </Text>
                    <Text style={[styles.evalTeacher, isRTL && styles.textRTL]}>
                      المعلمة: {evaluation.teacher_name_ar || evaluation.teacher_name}
                    </Text>
                  </View>
                  <Text style={styles.evalDate}>
                    {new Date(evaluation.evaluation_date).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {evaluations.length === 0 && (
          <View style={styles.noData}>
            <Ionicons name="clipboard-outline" size={48} color={colors.border} />
            <Text style={[styles.noDataText, isRTL && styles.textRTL]}>
              لا توجد تقييمات بعد
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Evaluation Details Modal */}
      <Modal visible={detailsVisible} animationType="slide">
        <View style={styles.fullModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setDetailsVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.modalHeaderCenter}>
              <Text style={styles.modalTitle}>
                {selectedEvaluation?.form_name_ar || selectedEvaluation?.form_name}
              </Text>
              <Text style={styles.modalDate}>
                {selectedEvaluation && new Date(selectedEvaluation.evaluation_date).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {loadingDetails ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              selectedEvaluation?.answers?.map((answer, index) => (
                <View key={index} style={styles.answerCard}>
                  <View style={styles.answerHeader}>
                    <View style={styles.answerIconContainer}>
                      <Ionicons 
                        name={(CATEGORY_ICONS[answer.question_ar] || 'help-circle') as any}
                        size={20} 
                        color={colors.primary} 
                      />
                    </View>
                    <Text style={[styles.questionText, isRTL && styles.textRTL]}>
                      {answer.question_ar || answer.question}
                    </Text>
                  </View>
                  <View style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                    <View style={[
                      styles.answerBadge, 
                      { backgroundColor: ANSWER_LABELS[answer.answer_type]?.color || colors.primary }
                    ]}>
                      <Ionicons 
                        name={ANSWER_LABELS[answer.answer_type]?.icon as any || 'help-circle'} 
                        size={16} 
                        color={colors.textLight} 
                      />
                      <Text style={styles.answerText}>
                        {ANSWER_LABELS[answer.answer_type]?.label || answer.answer_type}
                      </Text>
                    </View>
                  </View>
                  {answer.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>الملاحظات:</Text>
                      <Text style={styles.notesText}>{answer.notes}</Text>
                    </View>
                  )}
                </View>
              ))
            )}

            {!loadingDetails && (!selectedEvaluation?.answers || selectedEvaluation.answers.length === 0) && (
              <Text style={styles.noAnswers}>لا توجد تفاصيل متاحة</Text>
            )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  textRTL: {
    textAlign: 'right',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  childInfoRTL: {
    flexDirection: 'row-reverse',
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  childGrade: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  scoreSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRowRTL: {
    flexDirection: 'row-reverse',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 14,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noEvalText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginLeft: 8,
  },
  evaluationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  evalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  evalInfo: {
    flex: 1,
  },
  evalName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  evalTeacher: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  evalDate: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderCenter: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalDate: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  answerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  answerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  answerRow: {
    flexDirection: 'row',
  },
  answerRowRTL: {
    flexDirection: 'row-reverse',
  },
  answerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  answerText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  notesBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  noAnswers: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
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
});
