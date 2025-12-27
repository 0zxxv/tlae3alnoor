import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { studentsApi } from '../../services/api';
import { ACADEMY_CLASSES } from '../../constants/classes';

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade: string;
  grade_ar: string;
  class_name?: string;
  parent_name?: string;
  parent_name_ar?: string;
}

export const AdminStudents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleDeleteStudent = (student: Student) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف هذه الطالبة؟',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await studentsApi.delete(student.id);
              fetchStudents();
              Alert.alert('نجاح', 'تم حذف الطالبة بنجاح');
            } catch (error: any) {
              Alert.alert('خطأ', error.message);
            }
          },
        },
      ]
    );
  };

  // Filter students by selected class
  const filteredStudents = selectedClass
    ? students.filter((s) => s.class_name === selectedClass || s.grade_ar === selectedClass)
    : students;

  // Get student count by class
  const getClassCount = (className: string) => {
    return students.filter((s) => s.class_name === className || s.grade_ar === className).length;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="الطالبات" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Show class selection first if no class is selected
  if (!selectedClass) {
    return (
      <View style={styles.container}>
        <Header title="الطالبات" />
        
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.header}>
            <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
              <Ionicons name="school" size={28} color={colors.primary} />
              <Text style={[styles.title, isRTL && styles.textRTL]}>
                اختر الصف
              </Text>
            </View>
          </View>

          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {students.length} طالبة مسجلة في الأكاديمية
          </Text>

          {/* Classes Grid */}
          <View style={styles.classesGrid}>
            {ACADEMY_CLASSES.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={styles.classCard}
                onPress={() => setSelectedClass(cls.nameAr)}
              >
                <View style={styles.classIcon}>
                  <Ionicons name={cls.icon as any} size={32} color={colors.primary} />
                </View>
                <Text style={styles.className}>{cls.nameAr}</Text>
                <Text style={styles.classCount}>
                  {getClassCount(cls.nameAr)} طالبة
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* View All Button */}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setSelectedClass('all')}
          >
            <Ionicons name="list" size={20} color={colors.textLight} />
            <Text style={styles.viewAllText}>عرض جميع الطالبات</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="الطالبات" />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back to classes */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedClass(null)}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للصفوف</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="school" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {selectedClass === 'all' ? 'جميع الطالبات' : `صف ${selectedClass}`}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {selectedClass === 'all' ? students.length : filteredStudents.length} طالبة
        </Text>

        <Text style={[styles.infoText, isRTL && styles.textRTL]}>
          لإضافة طالبة جديدة، اذهب إلى إدارة أولياء الأمور
        </Text>

        {/* Students List */}
        {(selectedClass === 'all' ? students : filteredStudents).map((student) => (
          <Card key={student.id}>
            <View style={[styles.studentItem, isRTL && styles.studentItemRTL]}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {student.name_ar || student.name}
                </Text>
                <View style={[styles.gradeRow, isRTL && styles.gradeRowRTL]}>
                  <Ionicons name="school-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                    {student.class_name || student.grade_ar || student.grade}
                  </Text>
                </View>
                {student.parent_name && (
                  <View style={[styles.gradeRow, isRTL && styles.gradeRowRTL]}>
                    <Ionicons name="people-outline" size={12} color={colors.primary} />
                    <Text style={[styles.parentName, isRTL && styles.textRTL]}>
                      {student.parent_name_ar || student.parent_name}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteStudent(student)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {(selectedClass === 'all' ? students : filteredStudents).length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد طالبات في هذا الصف</Text>
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  textRTL: {
    textAlign: 'right',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  classCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  classIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  classCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textLight,
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
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentItemRTL: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gradeRowRTL: {
    flexDirection: 'row-reverse',
  },
  studentGrade: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  parentName: {
    fontSize: 12,
    color: colors.primary,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
});
