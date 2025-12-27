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

interface Student {
  id: string;
  name: string;
  name_ar: string;
  grade: string;
  grade_ar: string;
  parent_name?: string;
  parent_name_ar?: string;
}

export const AdminStudents: React.FC = () => {
  const { t, isRTL, language } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذه الطالبة؟'
        : 'Are you sure you want to delete this student?',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await studentsApi.delete(student.id);
              fetchStudents();
              Alert.alert(
                language === 'ar' ? 'نجاح' : 'Success',
                language === 'ar' ? 'تم حذف الطالبة بنجاح' : 'Student deleted successfully'
              );
            } catch (error: any) {
              Alert.alert(language === 'ar' ? 'خطأ' : 'Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={language === 'ar' ? 'الطالبات' : 'Students'} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={language === 'ar' ? 'الطالبات' : 'Students'} showBack />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Ionicons name="school" size={28} color={colors.primary} />
            <Text style={[styles.title, isRTL && styles.textRTL]}>
              {t('students')}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
          {language === 'ar'
            ? `${students.length} طالبة مسجلة`
            : `${students.length} students registered`}
        </Text>

        <Text style={[styles.infoText, isRTL && styles.textRTL]}>
          {language === 'ar'
            ? 'لإضافة طالبة جديدة، اذهب إلى إدارة أولياء الأمور'
            : 'To add a new student, go to Parents management'}
        </Text>

        {/* Students List */}
        {students.map((student) => (
          <Card key={student.id}>
            <View style={[styles.studentItem, isRTL && styles.studentItemRTL]}>
              <View style={styles.studentAvatar}>
                <Ionicons name="person" size={24} color={colors.textLight} />
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, isRTL && styles.textRTL]}>
                  {language === 'ar' ? student.name_ar : student.name}
                </Text>
                <View style={[styles.gradeRow, isRTL && styles.gradeRowRTL]}>
                  <Ionicons name="school-outline" size={12} color={colors.textSecondary} />
                  <Text style={[styles.studentGrade, isRTL && styles.textRTL]}>
                    {language === 'ar' ? student.grade_ar : student.grade}
                  </Text>
                </View>
                {student.parent_name && (
                  <View style={[styles.gradeRow, isRTL && styles.gradeRowRTL]}>
                    <Ionicons name="people-outline" size={12} color={colors.primary} />
                    <Text style={[styles.parentName, isRTL && styles.textRTL]}>
                      {language === 'ar' ? student.parent_name_ar : student.parent_name}
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

        {students.length === 0 && (
          <Text style={styles.emptyText}>
            {language === 'ar' ? 'لا توجد طالبات مسجلات' : 'No students registered'}
          </Text>
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  textRTL: {
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
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16,
  },
});
