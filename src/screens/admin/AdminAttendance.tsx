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
import { Header } from '../../components';

export const AdminAttendance: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Header title="الحضور" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <Text style={styles.backText}>العودة للوحة التحكم</Text>
        </TouchableOpacity>

        <View style={styles.placeholderContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.border} />
          <Text style={[styles.placeholderText, isRTL && styles.textRTL]}>
            صفحة الحضور - قيد التطوير
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
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
  },
});

