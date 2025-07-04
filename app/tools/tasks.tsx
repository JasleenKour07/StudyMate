import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));
  }, [tasks]);

  const loadTasks = async () => {
    const stored = await AsyncStorage.getItem('tasks');
    if (stored) setTasks(JSON.parse(stored));
  };

  type Task = {
    id: string;
    text: string;
    date: string;
    completed: boolean;
    category: string;
  };

  const saveTasks = async (updated: Task[]) => {
    setTasks(updated);
    await AsyncStorage.setItem('tasks', JSON.stringify(updated));
  };

  const addTask = async () => {
    if (!taskText.trim()) return;
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      Alert.alert('Invalid Date', 'Please select a valid date and time.');
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      date: selectedDate.toISOString(),
      completed: false,
      category: 'study',
    };
    const updated = [...tasks, newTask];
    await saveTasks(updated);
    setTaskText('');
    setModalVisible(false);
  };

  const toggleComplete = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    await saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    Alert.alert('Delete task?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = tasks.filter((t) => t.id !== id);
          await saveTasks(updated);
        },
      },
    ]);
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      study: 'bg-green-100 border-green-400',
      work: 'bg-yellow-100 border-yellow-400',
      personal: 'bg-blue-100 border-blue-400',
    };
    return categoryColors[category] || 'bg-gray-100 border-gray-400';
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return filter === 'completed' ? task.completed : !task.completed;
  });

  return (
    <SafeAreaView className="flex-1 bg-blue-50">
      <ScrollView>
        <View className="w-full max-w-4xl mx-auto px-4 pt-4 pb-20">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">📝 Your Tasks</Text>
            {Platform.OS === 'web' && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">＋ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-1">Progress</Text>
            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <View
                style={{ width: `${progress}%` }}
                className="h-full bg-green-500"
              />
            </View>
            <Text className="text-xs text-right mt-1 text-gray-600">{progress}% completed</Text>
          </View>

          <View className="flex-row flex-wrap gap-2 mb-3">
            {['all', 'completed', 'pending'].map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                className={`px-4 py-2 rounded-full border ${filter === f ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
              >
                <Text className={`text-sm ${filter === f ? 'text-white' : 'text-gray-800'}`}>{f[0].toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredTasks.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10">No tasks found.</Text>
          ) : (
            <View className="space-y-4">
              {filteredTasks.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onLongPress={() => deleteTask(item.id)}
                  className={`p-4 rounded-xl border-l-4 ${getCategoryColor(item.category)} shadow-sm`}
                  style={Platform.OS === 'web' ? { boxShadow: '0 3px 10px rgba(0,0,0,0.06)' } : {}}
                >
                  <View className="flex-row items-start">
                    <Checkbox
                      value={item.completed}
                      onValueChange={() => toggleComplete(item.id)}
                      color={item.completed ? '#2563eb' : undefined}
                    />
                    <View className="ml-3 flex-1">
                      <Text className={`text-base font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.text}</Text>
                      <Text className="text-xs text-gray-500 mt-1">📅 {new Date(item.date).toLocaleString()}</Text>
                      <Text className="text-[10px] text-gray-500 mt-1">🏷️ Category: {item.category}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              className="absolute bottom-6 right-6 bg-blue-600 rounded-full w-14 h-14 items-center justify-center shadow-lg"
            >
              <Text className="text-white text-3xl font-bold">＋</Text>
            </TouchableOpacity>
          )}

          <Modal visible={modalVisible} animationType="slide" transparent>
            <View className="flex-1 justify-center bg-black/40 px-4">
              <View className="bg-white rounded-2xl p-6">
                <Text className="text-lg font-bold mb-3">Add New Task</Text>
                <TextInput
                  value={taskText}
                  onChangeText={setTaskText}
                  placeholder="Task description"
                  className="bg-gray-100 px-4 py-2 rounded-xl mb-3"
                />
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-gray-200 px-3 py-2 rounded-lg mb-4"
                >
                  <Text className="text-sm text-gray-800">📅 {selectedDate.toLocaleString()}</Text>
                </TouchableOpacity>

                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="datetime"
                  date={selectedDate}
                  onConfirm={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                  onCancel={() => setShowDatePicker(false)}
                />

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={addTask}
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-white text-center font-semibold">Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-gray-300 px-4 py-2 rounded-lg flex-1 ml-2"
                  >
                    <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
