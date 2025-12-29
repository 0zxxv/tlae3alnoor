import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';
import { studentsApi } from '../../services/api';
import { ACADEMY_COURSES } from '../../constants/classes';

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade: string;
  grade_ar: string;
  class_name?: string;
  subclass_name?: string;
  parent_name?: string;
  parent_name_ar?: string;
}

export const AdminStudents: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudents = useCallback(async () => {
    try {
      const data = await studentsApi.getAll();
      console.log('Fetched students:', JSON.stringify(data, null, 2));
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

  // Get current course object
  const currentCourse = ACADEMY_COURSES.find(c => c.id === selectedCourse);

  // Helper function to check if student belongs to a course
  const studentMatchesCourse = (student: Student, courseId: string): boolean => {
    const course = ACADEMY_COURSES.find(c => c.id === courseId);
    if (!course) return false;
    
    // Extract keywords to match (e.g., "البراعم" from "دورة البراعم")
    const keyword = course.nameAr.replace('دورة ', '');
    
    // Check multiple fields for the course name
    const fieldsToCheck = [
      student.class_name || '',
      student.grade_ar || '',
      student.grade || ''
    ];
    
    // Check if any field contains the keyword or full course name
    for (const field of fieldsToCheck) {
      if (field && (field.includes(keyword) || field.includes(course.nameAr))) {
        return true;
      }
    }
    return false;
  };

  // Helper function to check if student belongs to a subclass
  const studentMatchesSubclass = (student: Student, subclassName: string): boolean => {
    // Extract keyword (e.g., "المصطفى" from "صف المصطفى")
    const keyword = subclassName.replace('صف ', '');
    
    // Check multiple fields for the subclass name
    const fieldsToCheck = [
      student.subclass_name || '',
      student.grade_ar || '',
      student.grade || ''
    ];
    
    // Check if any field contains the keyword or full subclass name
    for (const field of fieldsToCheck) {
      if (field && (field.includes(keyword) || field.includes(subclassName))) {
        return true;
      }
    }
    return false;
  };

  // Filter students based on selected course, subclass, and search
  const getFilteredStudents = () => {
    let filtered = students;
    
    if (selectedCourse && selectedCourse !== 'all') {
      filtered = filtered.filter(s => studentMatchesCourse(s, selectedCourse));
    }

    // Only filter by subclass if it's not 'all' and a subclass is selected
    if (selectedSubclass && selectedSubclass !== 'all') {
      filtered = filtered.filter(s => studentMatchesSubclass(s, selectedSubclass));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name_ar?.toLowerCase().includes(query) ||
        s.name?.toLowerCase().includes(query) ||
        s.parent_name_ar?.toLowerCase().includes(query) ||
        s.parent_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  // Get student count for a course
  const getCourseCount = (courseId: string) => {
    return students.filter(s => studentMatchesCourse(s, courseId)).length;
  };

  // Get student count for a subclass within the selected course
  const getSubclassCount = (subclassName: string) => {
    let filtered = students;
    
    // First filter by current course
    if (currentCourse) {
      filtered = filtered.filter(s => studentMatchesCourse(s, currentCourse.id));
    }
    
    // Then filter by subclass
    return filtered.filter(s => studentMatchesSubclass(s, subclassName)).length;
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

  // Level 1: Show courses (دورات)
  if (!selectedCourse) {
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
                اختر الدورة
              </Text>
            </View>
          </View>

          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            {students.length} طالبة مسجلة في الأكاديمية
          </Text>

          {/* Courses Grid */}
          <View style={styles.classesGrid}>
            {ACADEMY_COURSES.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.classCard}
                onPress={() => setSelectedCourse(course.id)}
              >
                <View style={styles.classIcon}>
                  <Ionicons name={course.icon as any} size={32} color={colors.primary} />
                </View>
                <Text style={styles.className}>{course.nameAr}</Text>
                <Text style={styles.classCount}>
                  {getCourseCount(course.id)} طالبة
                </Text>
                <Text style={styles.subclassInfo}>
                  {course.subclasses.length} صفوف
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* View All Button */}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setSelectedCourse('all')}
          >
            <Ionicons name="list" size={20} color={colors.textLight} />
            <Text style={styles.viewAllText}>عرض جميع الطالبات</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Level 2: Show subclasses (صفوف) for selected course
  if (selectedCourse !== 'all' && !selectedSubclass && currentCourse) {
    return (
      <View style={styles.container}>
        <Header title="الطالبات" />
        
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Back to courses */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCourse(null)}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
            <Text style={styles.backText}>العودة للدورات</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
              <Ionicons name={currentCourse.icon as any} size={28} color={colors.primary} />
              <Text style={[styles.title, isRTL && styles.textRTL]}>
                {currentCourse.nameAr}
              </Text>
            </View>
          </View>

          <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
            اختر الصف
          </Text>

          {/* Subclasses List */}
          {currentCourse.subclasses.map((subclass) => (
            <TouchableOpacity
              key={subclass.id}
              style={styles.subclassCard}
              onPress={() => setSelectedSubclass(subclass.nameAr)}
            >
              <View style={styles.subclassIcon}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <View style={styles.subclassInfo}>
                <Text style={styles.subclassName}>{subclass.nameAr}</Text>
                <Text style={styles.subclassCount}>
                  {getSubclassCount(subclass.nameAr)} طالبة
                </Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          {/* View all in this course */}
          <TouchableOpacity
            style={[styles.viewAllButton, { marginTop: 16 }]}
            onPress={() => setSelectedSubclass('all')}
          >
            <Ionicons name="list" size={20} color={colors.textLight} />
            <Text style={styles.viewAllText}>عرض كل طالبات {currentCourse.nameAr}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Level 3: Show students list
  return (
    <View style={styles.container}>
      <Header title="الطالبات" />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (selectedSubclass) {
              setSelectedSubclass(null);
            } else {
              setSelectedCourse(null);
            }
          }}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>
            {selectedSubclass && selectedCourse !== 'all' ? 'العودة للصفوف' : 'العودة للدورات'}
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="school" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {selectedCourse === 'all' 
                ? 'جميع الطالبات' 
                : selectedSubclass === 'all'
                  ? `كل طالبات ${currentCourse?.nameAr}`
                  : selectedSubclass}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث بالاسم..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {filteredStudents.length} طالبة
        </Text>

        <Text style={[styles.infoText, isRTL && styles.textRTL]}>
          لإضافة طالبة جديدة، اذهب إلى إدارة أولياء الأمور
        </Text>

        {/* Students List */}
        {filteredStudents.map((student) => (
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
                    {student.subclass_name || student.class_name || student.grade_ar || student.grade}
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

        {filteredStudents.length === 0 && searchQuery && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد نتائج للبحث</Text>
          </View>
        )}

        {filteredStudents.length === 0 && !searchQuery && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={colors.border} />
            <Text style={styles.emptyText}>لا توجد طالبات</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  classCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subclassInfo: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
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
  subclassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subclassIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subclassName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  subclassCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
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
