import { Ionicons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showPolicy, setShowPolicy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSubmitFeedback = () => {
    Alert.alert("Feedback Received", "Thank you for your feedback!");
    setFeedbackModalVisible(false);
    setFeedbackText('');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', onPress: () => router.replace('/login') },
    ]);
  };

  const contactSupport = async () => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Mail composer not available on this device.');
        return;
      }
      await MailComposer.composeAsync({
        recipients: ['kourjasleen2002@gmail.com'],
        subject: 'StudyMate App Support',
        body: 'Hi Jasleen, I need help with...',
      });
    } catch (error) {
      console.error('Mail composer error:', error);
      Alert.alert('Error', 'Failed to open email composer.');
    }
  };

  return (
    <>
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
        <ScrollView className="px-4 py-6">
          <Text className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</Text>

          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={styles.shadowFix}>
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>👤 Profile</Text>
            <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Name: Jasleen Kour</Text>
            <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Email: kourjasleen2002@gmail.com</Text>
          </View>

          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={styles.shadowFix}>
            <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>⚙️ Preferences</Text>
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="moon" size={18} color={isDark ? '#fff' : '#333'} />
                <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>Dark Mode</Text>
              </View>
              <Switch value={isDark} onValueChange={toggleTheme} />
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center space-x-2">
                <Ionicons name="notifications" size={18} color={isDark ? '#fff' : '#333'} />
                <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>Notifications</Text>
              </View>
              <Switch value={true} onValueChange={() => {}} />
            </View>
          </View>

          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`} style={styles.shadowFix}>
            <TouchableOpacity className="py-3 border-b border-gray-600 flex-row items-center space-x-2" onPress={() => setShowChangePassword(true)}>
              <Ionicons name="key" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-600 flex-row items-center space-x-2">
              <Ionicons name="language" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Language (English)</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-600 flex-row items-center space-x-2" onPress={contactSupport}>
              <Ionicons name="mail" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-600 flex-row items-center space-x-2" onPress={() => setShowPolicy(true)}>
              <Ionicons name="document-text" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 border-b border-gray-600 flex-row items-center space-x-2" onPress={() => setFeedbackModalVisible(true)}>
              <Ionicons name="chatbox-ellipses" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Send Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 flex-row items-center space-x-2 border-t border-gray-600" onPress={() => setShowAbout(true)}>
              <Ionicons name="information-circle" size={18} color={isDark ? '#ccc' : '#333'} />
              <Text className={`text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>About App</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-2 mb-6">
            <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Version 1.0.0 | © 2025 </Text>
          </View>

          <TouchableOpacity className="bg-indigo-600 py-3 rounded-xl items-center mb-10" onPress={handleLogout}>
            <Text className="text-white font-semibold text-base">Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={feedbackModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className={`w-full rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>✍️ Send us your feedback</Text>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Type here..."
              multiline
              numberOfLines={4}
              className={`p-3 mb-4 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
            />
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)} className="px-4 py-2 bg-gray-500 rounded-lg">
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitFeedback} className="px-4 py-2 bg-indigo-600 rounded-lg">
                <Text className="text-white">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPolicy} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className={`w-full max-h-[80%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>📜 Privacy Policy</Text>
            <ScrollView className="mb-4">
              <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Your data is safe with us. We do not share your personal information with any third party. We use your data only to enhance your app experience and provide better service...
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setShowPolicy(false)} className="px-4 py-2 bg-indigo-600 rounded-lg">
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAbout} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className={`w-full max-h-[80%] rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>ℹ️ About StudyMate</Text>
            <ScrollView className="mb-4">
              <Text className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                StudyMate helps students manage tasks, wellness, and productivity all in one place. Version 1.0.0. Created by Jasleen Kour.
              </Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setShowAbout(false)} className="px-4 py-2 bg-indigo-600 rounded-lg">
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showChangePassword} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className={`w-full rounded-xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>🔐 Change Password</Text>
            <TextInput placeholder="Enter new password" secureTextEntry className={`p-3 mb-4 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`} />
            <TextInput placeholder="Confirm new password" secureTextEntry className={`p-3 mb-4 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`} />
            <View className="flex-row justify-between">
              <TouchableOpacity onPress={() => setShowChangePassword(false)} className="px-4 py-2 bg-gray-500 rounded-lg">
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowChangePassword(false); Alert.alert('Password Changed', 'Your password has been updated.'); }} className="px-4 py-2 bg-indigo-600 rounded-lg">
                <Text className="text-white">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shadowFix: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
