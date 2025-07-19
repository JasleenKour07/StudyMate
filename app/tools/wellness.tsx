import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import {
  Button,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SceneMap, TabView } from 'react-native-tab-view';



const moods = ['😊', '😐', '😔', '😡', '🥳'] as const;
type MoodType = typeof moods[number];

const moodColors: Record<MoodType, string> = {
  '😊': 'bg-green-100',
  '😐': 'bg-yellow-100',
  '😔': 'bg-blue-100',
  '😡': 'bg-red-100',
  '🥳': 'bg-purple-100',
};

const defaultData = [
  {
    key: 'meditation',
    icon: '🧘',
    label: 'Meditation',
    description: (v: number) => `${v} minutes meditated`,
    percentage: (v: number) => `${Math.min(Math.round((v / 60) * 100), 100)}%`, // 60 min target
  },
  {
    key: 'sleep',
    icon: '🛌',
    label: 'Sleep',
    description: (v: number) => `${v} hours slept`,
    percentage: (v: number) => `${Math.min(Math.round((v / 8) * 100), 100)}%`, // 8 hrs target
  },
  {
    key: 'stress',
    icon: '😰',
    label: 'Stress',
    description: (v: number) => `Stress level: ${v}`,
    percentage: (v: number) => `${Math.min(v * 10, 100)}%`, // scale 0-10
  },
  {
    key: 'journaling',
    icon: '📔',
    label: 'Journaling',
    description: (v: number) => `${v} journal entries`,
    percentage: (v: number) => `${Math.min(v * 20, 100)}%`, // 5 entries = 100%
  }
];

// 1. Define State and Actions
interface WellnessState {
  mood: MoodType;
  journalEntry: string;
  journalHeading: string;
  savedJournals: { id: string; text: string; heading: string; date: string; mood: MoodType }[];
  loading: boolean;
  meditation: number;
  sleep: number;
  stress: number;
}

type Action =
  | { type: 'SET_MOOD'; payload: MoodType }
  | { type: 'SET_JOURNAL_ENTRY'; payload: string }
  | { type: 'SET_JOURNAL_HEADING'; payload: string }
  | { type: 'SAVE_JOURNAL' }
  | { type: 'SET_INITIAL_STATE'; payload: Partial<WellnessState> }
  | { type: 'UPDATE_MEDITATION'; payload: number }
  | { type: 'UPDATE_SLEEP'; payload: number }
  | { type: 'UPDATE_STRESS'; payload: number };

const initialState: WellnessState = {
  mood: '😊',
  journalEntry: '',
  journalHeading: '',
  savedJournals: [],
  meditation: 0,
  sleep: 0,
  stress: 0,
  loading: true,
};

// 2. Create the Reducer
const wellnessReducer = (state: WellnessState, action: Action): WellnessState => {
  switch (action.type) {
    case 'SET_MOOD':
      return { ...state, mood: action.payload };
    case 'SET_JOURNAL_ENTRY':
      return { ...state, journalEntry: action.payload };
    case 'SET_JOURNAL_HEADING':
      return { ...state, journalHeading: action.payload };
    case 'SAVE_JOURNAL': {
      if (!state.journalEntry.trim()) return state;
      const newEntry = {
        id: Date.now().toString(),
        text: state.journalEntry,
        heading: state.journalHeading,
        date: new Date().toLocaleDateString(),
        mood: state.mood,
      };
      const updatedJournals = [newEntry, ...state.savedJournals];
      const newState = { ...state, savedJournals: updatedJournals, journalEntry: '', journalHeading: '' };
      AsyncStorage.setItem('@journals', JSON.stringify(updatedJournals));
      AsyncStorage.setItem('@wellnessStats', JSON.stringify({
        meditation: newState.meditation,
        sleep: newState.sleep,
        stress: newState.stress,
        journaling: updatedJournals.length,
      }));
      return newState;
    }
    case 'SET_INITIAL_STATE':
      return { ...state, ...action.payload, loading: false };
    case 'UPDATE_MEDITATION': {
      const newState = { ...state, meditation: state.meditation + action.payload };
      AsyncStorage.setItem('@wellnessStats', JSON.stringify({
        meditation: newState.meditation,
        sleep: newState.sleep,
        stress: newState.stress,
        journaling: newState.savedJournals.length,
      }));
      return newState;
    }
    case 'UPDATE_SLEEP': {
      const newState = { ...state, sleep: state.sleep + action.payload };
      AsyncStorage.setItem('@wellnessStats', JSON.stringify({
        meditation: newState.meditation,
        sleep: newState.sleep,
        stress: newState.stress,
        journaling: newState.savedJournals.length,
      }));
      return newState;
    }
    case 'UPDATE_STRESS': {
      const newState = { ...state, stress: state.stress + action.payload };
      AsyncStorage.setItem('@wellnessStats', JSON.stringify({
        meditation: newState.meditation,
        sleep: newState.sleep,
        stress: newState.stress,
        journaling: newState.savedJournals.length,
      }));
      return newState;
    }
    default:
      return state;
  }
};

// 3. Create Contexts
const WellnessStateContext = createContext<WellnessState>(initialState);
const WellnessDispatchContext = createContext<React.Dispatch<Action>>(() => null);

const shadowFix = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
};

const getMoodStats = (savedJournals: { text: string; date: string }[]) => {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const labels: string[] = [];
  const monthDateTuples: { year: number; month: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthNames[d.getMonth()]);
    monthDateTuples.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const getDataForTerm = (term: string) => {
    return monthDateTuples.map(({ year, month }) => {
      const monthJournals = savedJournals.filter((j) => {
        const date = new Date(j.date);
        return date.getFullYear() === year && date.getMonth() === month;
      });
      return monthJournals.reduce((acc, j) => acc + (j.text.toLowerCase().includes(term) ? 1 : 0), 0);
    });
  };

  const anxiety = getDataForTerm('anxiety');
  const depression = getDataForTerm('depression');

  return {
    labels,
    datasets: [
      { data: anxiety, color: () => 'orange', strokeWidth: 2 },
      { data: depression, color: () => 'blue', strokeWidth: 2 },
    ],
    legend: ['Anxiety', 'Depression'],
  };
};

const useWellnessState = () => useContext(WellnessStateContext);
const useWellnessDispatch = () => useContext(WellnessDispatchContext);

const MoodTab = () => {
  const { mood, savedJournals } = useWellnessState();
  const dispatch = useWellnessDispatch();
  const [affirmation, setAffirmation] = useState('');

  useEffect(() => {
    const affirmationsList = ['You are doing your best!', 'Take a deep breath and keep going.', 'Progress, not perfection.'];
    setAffirmation(affirmationsList[Math.floor(Math.random() * affirmationsList.length)]);
  }, []);

  const moodTips: Record<MoodType, string> = {
    '😊': "Keep the joy alive! Maybe share a smile with someone today 😊",
    '😐': "Take a short break and listen to your favorite song 🎵",
    '😔': "Write down one good thing that happened today 📝",
    '😡': "Try deep breathing or step away from screens for 10 minutes 💨",
    '🥳': "Celebrate yourself! Do a little happy dance 💃🕺",
  };

  const affirmations = {
    '😊': "You radiate positivity!",
    '😐': "Stay calm, progress takes time.",
    '😔': "You are strong and this feeling will pass.",
    '😡': "You are in control of your emotions.",
    '🥳': "Celebrate your wins, big or small!",
  };

  return (
    <ScrollView className="flex-1 bg-blue-50 p-4">
      <Text className="text-lg font-semibold text-blue-900 mb-3">How are you feeling today?</Text>
      <View className="flex-row flex-wrap justify-around">
        {moods.map((m) => (
          <View key={m} style={{ margin: 6 }}>
            <TouchableOpacity
              className={`w-16 h-16 rounded-xl items-center justify-center ${mood === m ? 'bg-blue-300' : 'bg-white'}`}
              style={shadowFix}
              onPress={() => dispatch({ type: 'SET_MOOD', payload: m })}
            >
              <Text className="text-3xl">{m}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {mood && <Text className="text-blue-700 italic mt-4">{moodTips[mood]}</Text>}

      <Text className="text-lg font-semibold text-blue-900 mt-6 mb-2">💬 Daily Affirmation</Text>
      <Text className="bg-blue-100 p-3 rounded-md text-blue-700 italic">{affirmations[mood] || affirmation}</Text>

      <View className="bg-white p-4 rounded-2xl mb-4 space-y-4 mt-6">
        <Text className="text-blue-800 font-semibold text-lg mb-2 px-4 py-2">Log Wellness</Text>

        <View className="px-4">
            <View className="mb-2">
              <Button
                title="Add 10 min Meditation"
                onPress={() => dispatch({ type: 'UPDATE_MEDITATION', payload: 10 })}
                color="#4CAF50"
              />
            </View>

            <View className="mb-2">
              <Button
                title="Add 1 Hour Sleep"
                onPress={() => dispatch({ type: 'UPDATE_SLEEP', payload: 1 })}
                color="#2196F3"
              />
            </View>

            <View className="mb-2">
              <Button
                title="Increase Stress Level"
                onPress={() => dispatch({ type: 'UPDATE_STRESS', payload: 1 })}
                color="#f44336"
              />
            </View>
          </View>
        </View>
</ScrollView>
);
};

const JournalTab = () => {
  const { journalEntry, journalHeading, savedJournals } = useWellnessState();
  const dispatch = useWellnessDispatch();

  const journalTemplates = [
    { id: '1', title: 'Daily Reflection', description: 'How was your day?' },
    { id: '2', title: 'Mood Journal', description: 'Track your mood patterns' },
    { id: '3', title: 'Goals & Intentions', description: 'What do you want to achieve?' },
  ];

  return (
    <View className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-lg font-semibold text-blue-900 mt-6 mb-1">New Entry</Text>

        <View className="bg-white rounded-xl p-4 mb-4" style={shadowFix}>
          <TextInput
            placeholder="Heading..."
            value={journalHeading}
            onChangeText={(text) => dispatch({ type: 'SET_JOURNAL_HEADING', payload: text })}
            className="bg-gray-100 rounded-md px-3 py-2 mb-2 text-base"
          />
          <TextInput
            placeholder="Write your thoughts..."
            value={journalEntry}
            onChangeText={(text) => dispatch({ type: 'SET_JOURNAL_ENTRY', payload: text })}
            multiline
            textAlignVertical="top"
            className="bg-gray-100 rounded-md px-3 py-2 h-28 text-base"
          />
          <TouchableOpacity onPress={() => dispatch({ type: 'SAVE_JOURNAL' })} className="bg-blue-600 mt-3 py-2 rounded-md">
            <Text className="text-white text-center font-semibold">Save Journal</Text>
          </TouchableOpacity>
        </View>

        {savedJournals.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold text-blue-900 mb-3">📚 All Journals</Text>
            {savedJournals.map((entry) => {
              const moodKey = entry.mood as MoodType;
              return (
                <View
                  key={entry.id}
                  className={`p-4 mb-3 rounded-xl ${moodColors[moodKey] || 'bg-white'}`}
                  style={shadowFix}
                >
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-gray-600">{entry.date}</Text>
                    <Text className="text-lg">{entry.mood}</Text>
                  </View>
                  <Text className="text-base font-bold text-blue-800 mt-1">{entry.heading}</Text>
                  <Text className="text-base text-blue-800 mt-1">{entry.text}</Text>
                </View>
              );
            })}
          </View>
        )}
        <Text className="text-lg font-semibold text-blue-900 mt-6 mb-2">📝 Journal Entries</Text>
       <View>
          {journalTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              className="bg-white p-4 rounded-xl mb-3"
              style={shadowFix}
              onPress={() => {
                dispatch({ type: 'SET_JOURNAL_HEADING', payload: template.title });
                dispatch({ type: 'SET_JOURNAL_ENTRY', payload: template.description });
              }}
            >
              <Text className="text-lg font-semibold text-blue-800">{template.title}</Text>
              <Text className="text-sm text-gray-600 mt-1">{template.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const StatsTab = () => {
  const { meditation, sleep, stress, savedJournals } = useWellnessState();
  const data = {
    meditation,
    sleep,
    stress,
    journaling: savedJournals.length,
  };
  const screenWidth = Dimensions.get('window').width;
  const chartData = getMoodStats(savedJournals);

  return (
    <ScrollView className="flex-1 px-4 py-4 bg-blue-50">
      {defaultData.map((item) => {
        const value = data[item.key as keyof typeof data] || 0;
        const percent = parseInt(item.percentage(value).replace('%', ''), 10);

      return (
        <View key={item.key} className="bg-white rounded-2xl p-4 mb-4 shadow-md">
          <Text className="text-lg font-semibold text-blue-800 mb-1">
            {item.icon} {item.label}
          </Text>
          <Text className="text-sm text-gray-700 mb-2">
            {item.description(value)}
          </Text>
          <View className="h-3 w-full bg-gray-300 rounded-full">
            <View
              style={{ width: `${percent}%` }}
              className="h-3 bg-green-400 rounded-full"
            />
          </View>
          <Text className="text-right text-xs text-gray-600 mt-1">
            {item.percentage(value)}
          </Text>
        </View>
      );
    })}

      {/* INSIGHTS SECTION */}
      <Text className="text-lg font-semibold text-blue-900 mt-4 mb-2">📊 Your Mental Health Insights</Text>
      <Text className="text-sm mb-3 text-gray-700">
        Based on your journal entries, here is a look at mentions of anxiety and depression over the last 4 months.
      </Text>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yLabelsOffset={15}
        withShadow={false}
        withInnerLines={false}
        withOuterLines={false}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          labelColor: () => '#555',
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
  </ScrollView>
  );
};

const WellnessProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(wellnessReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      const storedJournals = await AsyncStorage.getItem('@journals');
      const storedStats = await AsyncStorage.getItem('@wellnessStats');
      const journals = storedJournals ? JSON.parse(storedJournals) : [];
      const stats = storedStats ? JSON.parse(storedStats) : {};
      dispatch({
        type: 'SET_INITIAL_STATE',
        payload: {
          savedJournals: journals,
          meditation: stats.meditation || 0,
          sleep: stats.sleep || 0,
          stress: stats.stress || 0,
        },
      });
    };
    loadData();
  }, []);

  return (
    <WellnessStateContext.Provider value={state}>
      <WellnessDispatchContext.Provider value={dispatch}>
        {children}
      </WellnessDispatchContext.Provider>
    </WellnessStateContext.Provider>
  );
};

const WellnessContent = () => {
  const layout = Dimensions.get('window');
  const [index, setIndex] = useState(0);

  const renderScene = SceneMap({
    mood: MoodTab,
    journal: JournalTab,
    stats: StatsTab,
  });
  

return (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={{ flex: 1 }}
  >
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View className="flex-1 bg-white">
        {/* Header Tabs */}
        <View className="flex-row justify-around bg-white border-b border-blue-200 py-3">
          {['Mood', 'Journal', 'Stats'].map((title, i) => (
            <TouchableOpacity
              key={title}
              className={`flex-1 ${index === i ? 'border-b-4 border-blue-600' : ''}`}
              onPress={() => setIndex(i)}
            >
              <Text
                className={`text-center text-base font-bold ${
                  index === i ? 'text-blue-800' : 'text-blue-500'
                }`}
              >
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

          {/* Tab View */}
          <TabView
            navigationState={{
              index,
              routes: [
                { key: 'mood', title: 'Mood' },
                { key: 'journal', title: 'Journal' },
                { key: 'stats', title: 'Stats' },

              ],
            }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={() => null}
        />

        {/* Footer */}
      </View>
    </SafeAreaView>
  </KeyboardAvoidingView>
  );
}

export default function Wellness() {
  return (
    <WellnessProvider>
      <WellnessContent />
    </WellnessProvider>
  );
}
