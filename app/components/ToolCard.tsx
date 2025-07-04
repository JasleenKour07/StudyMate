import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext'; // adjust path if needed

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
};

export default function ToolCard({ icon, title, onPress }: Props) {
  const { theme } = useTheme();

  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const iconColor = theme === 'dark' ? '#93c5fd' : '#2563eb';

  return (
    <Pressable
      onPress={onPress}
      className={`w-[48%] sm:w-full h-28 ${cardBg} rounded-2xl justify-center items-center`}
      style={styles.shadowFix}
    >
      <Ionicons name={icon} size={30} color={iconColor} />
      <Text className={`mt-2 text-base font-medium ${textColor}`}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadowFix: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
