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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { Header } from '../../components';
import { evaluationsApi } from '../../services/api';

interface EvaluationAnswer {
  question: string;
  question_ar: string;
  option_text: string;
  option_text_ar: string;
  option_value: number;
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

export const ParentEvaluations: React.FC = () => {
  const { isRTL, language } = useLanguage();
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

  const getScoreColor = (value: number, maxValue: number = 5) => {
    const ratio = value / maxValue;
    if (ratio >= 0.8) return colors.success;
    if (ratio >= 0.6) return colors.warning;
    return colors.error;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'ar' ? 'تقييمات الأداء' : 'Performance Evaluations'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'تقييمات الأداء' : 'Performance Evaluations'} showBack />
      
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
                {language === 'ar' ? selectedChild.nameAr : selectedChild.name}
              </Text>
              <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                {language === 'ar' ? selectedChild.gradeAr : selectedChild.grade}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {language === 'ar' ? 'التقييمات' : 'Evaluations'} ({evaluations.length})
        </Text>

        {evaluations.map((evaluation) => (
          <TouchableOpacity
            key={evaluation.id}
            style={styles.evaluationCard}
            onPress={() => handleViewDetails(evaluation)}
          >
            <View style={styles.evalIcon}>
              <Ionicons name="clipboard-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.evalInfo}>
              <Text style={[styles.evalName, isRTL && styles.textRTL]}>
                {language === 'ar' ? evaluation.form_name_ar : evaluation.form_name}
              </Text>
              <Text style={[styles.evalTeacher, isRTL && styles.textRTL]}>
                {language === 'ar' ? 'المعلمة: ' : 'Teacher: '}
                {language === 'ar' ? evaluation.teacher_name_ar : evaluation.teacher_name}
              </Text>
              <Text style={styles.evalDate}>
                {new Date(evaluation.evaluation_date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        {evaluations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>
              {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No evaluations yet'}
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
                {language === 'ar' ? selectedEvaluation?.form_name_ar : selectedEvaluation?.form_name}
              </Text>
              <Text style={styles.modalDate}>
                {selectedEvaluation && new Date(selectedEvaluation.evaluation_date).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : 'en-US'
                )}
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
                    {language === 'ar' ? answer.question_ar : answer.question}
                  </Text>
                  <View style={[styles.answerRow, isRTL && styles.answerRowRTL]}>
                    <View style={[styles.answerBadge, { backgroundColor: getScoreColor(answer.option_value) }]}>
                      <Text style={styles.answerText}>
                        {language === 'ar' ? answer.option_text_ar : answer.option_text}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {!loadingDetails && (!selectedEvaluation?.answers || selectedEvaluation.answers.length === 0) && (
              <Text style={styles.noAnswers}>
                {language === 'ar' ? 'لا توجد تفاصيل متاحة' : 'No details available'}
              </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  answerText: {
    color: colors.textLight,
    fontWeight: 'bold',
  },
  noAnswers: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
  },
});

