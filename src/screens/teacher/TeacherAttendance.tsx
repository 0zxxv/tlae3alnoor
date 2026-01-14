import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { Header, Card } from '../../components';

export const TeacherAttendance: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header showLogout />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>
        <Card>
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.accentBlue} />
            <Text style={[styles.emptyTitle, isRTL && styles.textRTL]}>
              تسجيل الحضور
            </Text>
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>
              صفحة تسجيل الحضور قيد التطوير
            </Text>
            <Text style={[styles.emptySubtext, isRTL && styles.textRTL]}>
              سيتم إضافة هذه الميزة قريباً
            </Text>
          </View>
        </Card>
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
