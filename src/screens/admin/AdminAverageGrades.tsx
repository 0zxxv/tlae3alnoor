import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card, BarChart } from '../../components';
import { studentsApi, gradesApi } from '../../services/api';
import { ACADEMY_COURSES } from '../../constants/classes';

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade?: string;
  grade_ar?: string;
  class_name?: string;
  subclass_name?: string;
}

interface Grade {
  id: string;
  student_id: string;
  student_name?: string;
  student_name_ar?: string;
  subject: string;
  subject_ar: string;
  score: number;
  max_score: number;
  date: string;
}

interface StudentAverage {
  student: Student;
  average: number;
  gradeCount: number;
}

export const AdminAverageGrades: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overallAverage, setOverallAverage] = useState(0);
  const [studentAverages, setStudentAverages] = useState<StudentAverage[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const studentsData = await studentsApi.getAll();
      let gradesData = await gradesApi.getAll();

      setStudents(studentsData);

      // TODO: Replace with actual grades API when available
      // For now, using placeholder data if no grades exist
      if (gradesData.length === 0 && studentsData.length > 0) {
        // Generate fake grades for demonstration
        const subjects = [
          { en: 'Quran', ar: 'القرآن الكريم' },
          { en: 'Hadith', ar: 'الحديث الشريف' },
          { en: 'Fiqh', ar: 'الفقه' },
          { en: 'Aqeedah', ar: 'العقيدة' },
          { en: 'Seerah', ar: 'السيرة النبوية' },
          { en: 'Arabic', ar: 'اللغة العربية' },
        ];

        const fakeGrades: any[] = [];
        studentsData.forEach((student: any, studentIndex: number) => {
          // Determine performance level based on student index
          let minScore, maxScore;
          const performanceLevel = studentIndex % 4;
          switch (performanceLevel) {
            case 0: // Excellent
              minScore = 90;
              maxScore = 100;
              break;
            case 1: // High
              minScore = 85;
              maxScore = 100;
              break;
            case 2: // Average
              minScore = 70;
              maxScore = 90;
              break;
            default: // Mixed
              minScore = 60;
              maxScore = 95;
          }

          subjects.forEach((subject, subjectIndex) => {
            const score = minScore + Math.floor(Math.random() * (maxScore - minScore + 1));
            fakeGrades.push({
              id: `fake-${student.id}-${subjectIndex}`,
              student_id: student.id,
              student_name: student.name,
              student_name_ar: student.name_ar,
              subject: subject.en,
              subject_ar: subject.ar,
              score: score,
              max_score: 100,
              date: new Date(Date.now() - (30 - subjectIndex * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
          });
        });
        gradesData = fakeGrades;
      }

      setGrades(gradesData);

      // Calculate overall average
      if (gradesData.length > 0) {
        const totalPercentage = gradesData.reduce((sum: number, grade: any) => {
          if (grade.max_score && grade.max_score > 0) {
            return sum + (grade.score / grade.max_score) * 100;
          }
          return sum;
        }, 0);
        const avg = Math.round((totalPercentage / gradesData.length) * 10) / 10;
        setOverallAverage(avg);
      } else {
        setOverallAverage(0);
      }

      // Calculate average per student
      const studentMap = new Map<string, { student: Student; grades: Grade[] }>();
      
      studentsData.forEach((student: Student) => {
        studentMap.set(student.id, { student, grades: [] });
      });

      gradesData.forEach((grade: any) => {
        const entry = studentMap.get(grade.student_id);
        if (entry) {
          entry.grades.push(grade);
        }
      });

      const averages: StudentAverage[] = [];
      studentMap.forEach(({ student, grades: studentGrades }) => {
        if (studentGrades.length > 0) {
          const totalPercentage = studentGrades.reduce((sum, grade) => {
            if (grade.max_score && grade.max_score > 0) {
              return sum + (grade.score / grade.max_score) * 100;
            }
            return sum;
          }, 0);
          const avg = Math.round((totalPercentage / studentGrades.length) * 10) / 10;
          averages.push({
            student,
            average: avg,
            gradeCount: studentGrades.length,
          });
        }
      });

      // Sort by average (descending)
      averages.sort((a, b) => b.average - a.average);
      setStudentAverages(averages);
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

  // Helper function to check if student belongs to a course
  const studentMatchesCourse = (student: Student, courseId: string): boolean => {
    const course = ACADEMY_COURSES.find(c => c.id === courseId);
    if (!course) return false;
    
    const keyword = course.nameAr.replace('دورة ', '');
    
    const fieldsToCheck = [
      student.grade_ar,
      student.grade,
      student.class_name,
      student.subclass_name,
    ];
    
    return fieldsToCheck.some(field => 
      field && field.includes(keyword)
    );
  };

  // Filter students by course
  const getFilteredAverages = () => {
    if (!selectedCourse || selectedCourse === 'all') {
      return studentAverages;
    }
    return studentAverages.filter(sa => 
      studentMatchesCourse(sa.student, selectedCourse)
    );
  };

  const filteredAverages = getFilteredAverages();

  // Get average for a specific course
  const getCourseAverage = (courseId: string) => {
    const courseStudents = studentAverages.filter(sa => 
      studentMatchesCourse(sa.student, courseId)
    );
    
    if (courseStudents.length === 0) return 0;
    
    const total = courseStudents.reduce((sum, sa) => sum + sa.average, 0);
    return Math.round((total / courseStudents.length) * 10) / 10;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="متوسط الدرجات" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="متوسط الدرجات" />
      
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
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>

        {/* Overall Average Card */}
        <Card>
          <View style={styles.overallCard}>
            <Ionicons name="stats-chart" size={32} color={colors.accentYellow} />
            <Text style={styles.overallLabel}>المعدل العام</Text>
            <Text style={styles.overallValue}>{overallAverage}%</Text>
            <Text style={styles.overallSubtext}>
              من {grades.length} درجة لـ {students.length} طالبة
            </Text>
          </View>
        </Card>


        {/* Course Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            التصفية حسب الدورة
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                (!selectedCourse || selectedCourse === 'all') && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCourse('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  (!selectedCourse || selectedCourse === 'all') && styles.filterChipTextActive,
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>
            {ACADEMY_COURSES.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.filterChip,
                  selectedCourse === course.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCourse(course.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCourse === course.id && styles.filterChipTextActive,
                  ]}
                >
                  {course.nameAr}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Course Averages Chart */}
        {(!selectedCourse || selectedCourse === 'all') && (
          <View style={styles.courseAveragesSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              متوسط الدرجات حسب الدورة
            </Text>
            <Card>
              <BarChart
                data={ACADEMY_COURSES.map((course, index) => {
                  const courseAvg = getCourseAverage(course.id);
                  return {
                    label: course.nameAr.replace('دورة ', ''),
                    value: courseAvg,
                    color: index % 2 === 0 ? colors.primary : colors.accentYellow,
                  };
                })}
                maxValue={100}
                height={220}
                showValues={true}
              />
            </Card>
          </View>
        )}

        {/* Top Students Chart */}
        {filteredAverages.length > 0 && (
          <View style={styles.topStudentsSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              أفضل {Math.min(10, filteredAverages.length)} طالبة
            </Text>
            <Card>
              <BarChart
                data={filteredAverages.slice(0, 10).map((sa, index) => ({
                  label: sa.student.name_ar || sa.student.name || `طالبة ${index + 1}`,
                  value: sa.average,
                  color: index === 0 ? colors.accentYellow : index === 1 ? colors.accentBlue : colors.primary,
                }))}
                maxValue={100}
                height={250}
                showValues={true}
                barSpacing={4}
              />
            </Card>
          </View>
        )}

        {/* Student Averages */}
        <View style={styles.studentsSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            متوسط الدرجات لكل طالبة
            {selectedCourse && selectedCourse !== 'all' && (
              <Text style={styles.sectionSubtitle}>
                {' '}({filteredAverages.length} طالبة)
              </Text>
            )}
          </Text>

          {filteredAverages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                لا توجد درجات متاحة
              </Text>
            </View>
          ) : (
            filteredAverages.map((studentAvg, index) => {
              const getRankColor = () => {
                if (index === 0) return colors.accentYellow;
                if (index === 1) return colors.accentBlue;
                return colors.primary;
              };
              
              const getAverageBorderColor = () => {
                if (studentAvg.average >= 95) return colors.accentYellow;
                if (studentAvg.average >= 90) return colors.accentBlue;
                return colors.primary;
              };

              return (
                <Card key={studentAvg.student.id}>
                  <View style={styles.studentRow}>
                    <View style={[styles.studentRank, { backgroundColor: index < 3 ? getRankColor() : colors.secondary }]}>
                      <Text style={[styles.rankNumber, { color: index < 3 ? colors.text : colors.primary }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                        {studentAvg.student.name_ar || studentAvg.student.name}
                      </Text>
                      {studentAvg.student.grade_ar && (
                        <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                          {studentAvg.student.grade_ar}
                        </Text>
                      )}
                    </View>
                    <View style={styles.studentAverage}>
                      <View style={[styles.averageCircle, { borderColor: getAverageBorderColor() }]}>
                        <Text style={[styles.averageValue, { color: getAverageBorderColor() }]}>{studentAvg.average}%</Text>
                      </View>
                      <Text style={styles.gradeCount}>
                        {studentAvg.gradeCount} درجة
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>
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
  overallCard: {
    alignItems: 'center',
    padding: 20,
  },
  overallLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  overallSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  textRTL: {
    textAlign: 'right',
  },
  filterScroll: {
    marginHorizontal: -16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  courseAveragesSection: {
    marginBottom: 24,
  },
  topStudentsSection: {
    marginBottom: 24,
  },
  courseAveragesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  courseAverageCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseAverageName: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  courseAverageValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  courseAverageCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  studentsSection: {
    marginBottom: 24,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  studentGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  studentAverage: {
    alignItems: 'center',
  },
  averageCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  gradeCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
