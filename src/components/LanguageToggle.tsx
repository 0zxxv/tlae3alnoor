import React from 'react';
import { View, ViewStyle } from 'react-native';

interface LanguageToggleProps {
  style?: ViewStyle;
}

// Language toggle is disabled - app is Arabic only
export const LanguageToggle: React.FC<LanguageToggleProps> = () => {
  return <View />;
};
