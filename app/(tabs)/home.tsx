import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ToolCard from '../components/ToolCard';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

  const tools: { title: string; icon: IoniconName; onPress: () => void }[] = [
    { title: 'Meetings', icon: 'people', onPress: () => router.push('/tools/meetings') },
    { title: 'Tasks', icon: 'checkmark-done', onPress: () => router.push('/tools/tasks') },
    { title: 'Whiteboard', icon: 'create', onPress: () => router.push('/tools/whiteboard') },
    { title: 'Pomodoro', icon: 'timer', onPress: () => router.push('/tools/pomodoro') },
    { title: 'Calendar', icon: 'calendar', onPress: () => router.push('/tools/calendar') },
    { title: 'Wellness', icon: 'heart', onPress: () => router.push('/tools/wellness') },
  ];

  const bgColor = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#eef4ff]';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const cardText = theme === 'dark' ? 'text-white' : 'text-gray-700';

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView className="flex-1 px-4 pt-6 pb-10" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="max-w-4xl w-full mx-auto">
          <Text className={`text-xl font-bold ${textColor}`}>Hi, Jasleen 👋</Text>
          <Text className={`italic text-sm mb-3 ${subText}`}>
            "Start where you are. Use what you have. Do what you can."
          </Text>

          <TextInput
            className={`${cardBg} rounded-xl px-4 py-2 mb-5`}
            style={styles.shadowFix}
            placeholder="Search tools, tasks, etc..."
            placeholderTextColor={theme === 'dark' ? '#94a3b8' : '#9ca3af'}
          />

          <Text className={`text-lg font-bold mb-2 ${textColor}`}>Tools</Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {tools.map((tool) => (
              <ToolCard
                key={tool.title}
                icon={tool.icon}
                title={tool.title}
                onPress={tool.onPress}
              />
            ))}
          </View>

          <View className="mt-6">
            <Text className={`text-lg font-semibold mb-2 ${textColor}`}>🌟 Today’s Highlights</Text>
            <View className={`${cardBg} p-4 rounded-xl`} style={styles.shadowFix}>
              <Text className={`text-sm ${cardText}`}>🌅 Good morning! Review your day</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
