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
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { evaluationsApi } from '../../services/api';

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

export const ParentEvaluations: React.FC = () => {
  const { isRTL } = useLanguage();
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

  // Calculate stats for bar chart
  const calculateStats = (answers: EvaluationAnswer[] | undefined) => {
    if (!answers || answers.length === 0) {
      return { completed: 0, needs_followup: 0, notes: 0, total: 0 };
    }
    
    const stats = { completed: 0, needs_followup: 0, notes: 0, total: answers.length };
    answers.forEach(a => {
      if (a.answer_type === 'completed') stats.completed++;
      else if (a.answer_type === 'needs_followup') stats.needs_followup++;
      else if (a.answer_type === 'notes') stats.notes++;
    });
    return stats;
  };

  // Simple bar chart component
  const BarChart = ({ evaluation }: { evaluation: Evaluation }) => {
    const stats = calculateStats(evaluation.answers);
    const barWidth = (width - 80) * 0.8;
    
    if (stats.total === 0) return null;

    return (
      <View style={styles.barChartContainer}>
        <View style={styles.barRow}>
          <View style={styles.barLabelContainer}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.barLabel}>أنجزت</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${(stats.completed / stats.total) * 100}%`,
                  backgroundColor: colors.success,
                }
              ]} 
            />
          </View>
          <Text style={styles.barCount}>{stats.completed}</Text>
        </View>

        <View style={styles.barRow}>
          <View style={styles.barLabelContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.warning} />
            <Text style={styles.barLabel}>تحتاج متابعة</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${(stats.needs_followup / stats.total) * 100}%`,
                  backgroundColor: colors.warning,
                }
              ]} 
            />
          </View>
          <Text style={styles.barCount}>{stats.needs_followup}</Text>
        </View>

        <View style={styles.barRow}>
          <View style={styles.barLabelContainer}>
            <Ionicons name="create" size={16} color={colors.textSecondary} />
            <Text style={styles.barLabel}>ملاحظات</Text>
          </View>
          <View style={styles.barBackground}>
            <View 
              style={[
                styles.barFill, 
                { 
                  width: `${(stats.notes / stats.total) * 100}%`,
                  backgroundColor: colors.textSecondary,
                }
              ]} 
            />
          </View>
          <Text style={styles.barCount}>{stats.notes}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="تقييمات الأداء" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="تقييمات الأداء" />
      
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Student Info */}
        {selectedChild && (
          <View style={styles.studentCard}>
            <View style={styles.studentAvatar}>
              <Ionicons name="person" size={32} color={colors.textLight} />
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                {selectedChild.nameAr || selectedChild.name}
              </Text>
              <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                {selectedChild.gradeAr || selectedChild.grade}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          التقييمات ({evaluations.length})
        </Text>

        {evaluations.map((evaluation) => (
          <TouchableOpacity
            key={evaluation.id}
            style={styles.evaluationCard}
            onPress={() => handleViewDetails(evaluation)}
          >
            <View style={styles.evalHeader}>
              <View style={styles.evalIcon}>
                <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.evalInfo}>
                <Text style={[styles.evalName, isRTL && styles.textRTL]}>
                  {evaluation.form_name_ar || evaluation.form_name}
                </Text>
                <Text style={[styles.evalTeacher, isRTL && styles.textRTL]}>
                  المعلمة: {evaluation.teacher_name_ar || evaluation.teacher_name}
                </Text>
                <Text style={styles.evalDate}>
                  {new Date(evaluation.evaluation_date).toLocaleDateString('ar-SA')}
                </Text>
              </View>
            </View>
            
            {/* Bar Chart */}
            <BarChart evaluation={evaluation} />
            
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {evaluations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد تقييمات بعد</Text>
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
                  <Text style={[styles.questionText, isRTL && styles.textRTL]}>
                    {answer.question_ar || answer.question}
                  </Text>
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
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  studentGrade: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  textRTL: {
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  evaluationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  evalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  evalIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  evalInfo: {
    flex: 1,
  },
  evalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  evalTeacher: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  evalDate: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  barChartContainer: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 4,
  },
  barLabel: {
    fontSize: 12,
    color: colors.text,
  },
  barBackground: {
    flex: 1,
    height: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barCount: {
    width: 24,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 16,
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
  questionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 12,
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
});
