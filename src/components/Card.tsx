import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  titleAr?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  titleAr,
  onPress,
  style,
}) => {
  const { language, isRTL } = useLanguage();
  const displayTitle = language === 'ar' && titleAr ? titleAr : title;

  const content = (
    <View style={[styles.card, style]}>
      {displayTitle && (
        <Text style={[styles.title, isRTL && styles.titleRTL]}>{displayTitle}</Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  titleRTL: {
    textAlign: 'right',
  },
});

