import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme/colors';

interface LanguageToggleProps {
  style?: object;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ style }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity onPress={toggleLanguage} style={[styles.container, style]}>
      <View style={styles.toggle}>
        <View style={[styles.option, language === 'en' && styles.activeOption]}>
          <Text style={[styles.text, language === 'en' && styles.activeText]}>EN</Text>
        </View>
        <View style={[styles.option, language === 'ar' && styles.activeOption]}>
          <Text style={[styles.text, language === 'ar' && styles.activeText]}>عربي</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.secondary,
    borderRadius: 25,
    padding: 4,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeOption: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeText: {
    color: colors.textLight,
  },
});
