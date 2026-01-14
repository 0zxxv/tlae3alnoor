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
import { studentsApi } from '../../services/api';
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

interface StudentAttendance {
  student: Student;
  attendanceRate: number;
  presentDays: number;
  totalDays: number;
}

export const AdminAttendance: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [overallAttendance, setOverallAttendance] = useState(0);
  const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const studentsData = await studentsApi.getAll();
      setStudents(studentsData);

      // TODO: Replace with actual attendance API when available
      // For now, using placeholder data
      const placeholderAttendance: StudentAttendance[] = studentsData.map((student: Student) => {
        // Generate random attendance data for demonstration
        const totalDays = 30;
        const presentDays = Math.floor(Math.random() * (totalDays - 20) + 20); // Between 20-30 days
        const attendanceRate = Math.round((presentDays / totalDays) * 1000) / 10;
        
        return {
          student,
          attendanceRate,
          presentDays,
          totalDays,
        };
      });

      setStudentAttendances(placeholderAttendance);

      // Calculate overall attendance
      if (placeholderAttendance.length > 0) {
        const totalRate = placeholderAttendance.reduce(
          (sum, sa) => sum + sa.attendanceRate,
          0
        );
        const avg = Math.round((totalRate / placeholderAttendance.length) * 10) / 10;
        setOverallAttendance(avg);
      } else {
        setOverallAttendance(0);
      }
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
  const getFilteredAttendances = () => {
    if (!selectedCourse || selectedCourse === 'all') {
      return studentAttendances;
    }
    return studentAttendances.filter(sa => 
      studentMatchesCourse(sa.student, selectedCourse)
    );
  };

  const filteredAttendances = getFilteredAttendances();

  // Get average attendance for a specific course
  const getCourseAttendance = (courseId: string) => {
    const courseStudents = studentAttendances.filter(sa => 
      studentMatchesCourse(sa.student, courseId)
    );
    
    if (courseStudents.length === 0) return 0;
    
    const total = courseStudents.reduce((sum, sa) => sum + sa.attendanceRate, 0);
    return Math.round((total / courseStudents.length) * 10) / 10;
  };

  // Sort by attendance rate (descending)
  const sortedAttendances = [...filteredAttendances].sort(
    (a, b) => b.attendanceRate - a.attendanceRate
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="الحضور" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="الحضور" />
      
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

        {/* Overall Attendance Card */}
        <Card>
          <View style={styles.overallCard}>
            <Ionicons name="calendar" size={32} color={colors.accentBlue} />
            <Text style={styles.overallLabel}>معدل الحضور العام</Text>
            <Text style={styles.overallValue}>{overallAttendance}%</Text>
            <Text style={styles.overallSubtext}>
              لـ {students.length} طالبة
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

        {/* Course Attendance Chart */}
        {(!selectedCourse || selectedCourse === 'all') && (
          <View style={styles.courseAttendanceSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              معدل الحضور حسب الدورة
            </Text>
            <Card>
              <BarChart
                data={ACADEMY_COURSES.map((course, index) => {
                  const courseAttendance = getCourseAttendance(course.id);
                  return {
                    label: course.nameAr.replace('دورة ', ''),
                    value: courseAttendance,
                    color: index % 2 === 0 ? colors.accentBlue : colors.accentYellow,
                  };
                })}
                maxValue={100}
                height={220}
                showValues={true}
              />
            </Card>
          </View>
        )}

        {/* Top Students Attendance Chart */}
        {sortedAttendances.length > 0 && (
          <View style={styles.topStudentsSection}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              أفضل {Math.min(10, sortedAttendances.length)} طالبة في الحضور
            </Text>
            <Card>
              <BarChart
                data={sortedAttendances.slice(0, 10).map((sa, index) => {
                  const getAttendanceColor = () => {
                    if (index === 0) return colors.accentBlue; // Top performer gets accent blue
                    if (sa.attendanceRate >= 90) return colors.accentYellow;
                    if (sa.attendanceRate >= 75) return colors.primary;
                    return colors.primary;
                  };
                  
                  return {
                    label: sa.student.name_ar || sa.student.name || `طالبة ${index + 1}`,
                    value: sa.attendanceRate,
                    color: getAttendanceColor(),
                  };
                })}
                maxValue={100}
                height={250}
                showValues={true}
                barSpacing={4}
              />
            </Card>
          </View>
        )}

        {/* Student Attendance List */}
        <View style={styles.studentsSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            معدل الحضور لكل طالبة
            {selectedCourse && selectedCourse !== 'all' && (
              <Text style={styles.sectionSubtitle}>
                {' '}({filteredAttendances.length} طالبة)
              </Text>
            )}
          </Text>

          {sortedAttendances.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color={colors.border} />
              <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
                لا توجد بيانات حضور متاحة
              </Text>
            </View>
          ) : (
            sortedAttendances.map((studentAtt, index) => {
              const getAttendanceColor = () => {
                if (index === 0) return colors.accentBlue; // Top performer
                if (studentAtt.attendanceRate >= 90) return colors.accentYellow;
                if (studentAtt.attendanceRate >= 75) return colors.primary;
                return colors.primary;
              };

              const getRankColor = () => {
                if (index === 0) return colors.accentBlue;
                if (index === 1) return colors.accentYellow;
                return colors.secondary;
              };

              return (
                <Card key={studentAtt.student.id}>
                  <View style={styles.studentRow}>
                    <View style={[styles.studentRank, { backgroundColor: index < 2 ? getRankColor() : colors.secondary }]}>
                      <Text style={[styles.rankNumber, { color: index < 2 ? colors.text : colors.primary }]}>{index + 1}</Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                        {studentAtt.student.name_ar || studentAtt.student.name}
                      </Text>
                      {studentAtt.student.grade_ar && (
                        <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                          {studentAtt.student.grade_ar}
                        </Text>
                      )}
                    </View>
                    <View style={styles.studentAttendance}>
                      <View style={[styles.attendanceCircle, { borderColor: getAttendanceColor() }]}>
                        <Text style={[styles.attendanceValue, { color: getAttendanceColor() }]}>
                          {studentAtt.attendanceRate}%
                        </Text>
                      </View>
                      <Text style={styles.attendanceDays}>
                        {studentAtt.presentDays} / {studentAtt.totalDays} يوم
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.infoNoteText}>
            ملاحظة: هذه البيانات تجريبية. سيتم ربطها بقاعدة البيانات عند توفر API الحضور.
          </Text>
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
    color: colors.accentBlue,
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
  courseAttendanceSection: {
    marginBottom: 24,
  },
  topStudentsSection: {
    marginBottom: 24,
  },
  courseAttendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  courseAttendanceCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseAttendanceName: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  courseAttendanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentBlue,
    marginTop: 4,
  },
  courseAttendanceCount: {
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
  studentAttendance: {
    alignItems: 'center',
  },
  attendanceCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  attendanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  attendanceDays: {
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
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'right',
  },
});
