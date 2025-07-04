import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
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

const shadowFix = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
};

const MoodTab = ({ mood, setMood, affirmation }: { mood: MoodType; setMood: (m: MoodType) => void; affirmation: string }) => {
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
              onPress={() => setMood(m)}
            >
              <Text className="text-3xl">{m}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {mood && <Text className="text-blue-700 italic mt-4">{moodTips[mood]}</Text>}

      <Text className="text-lg font-semibold text-blue-900 mt-6 mb-2">💬 Daily Affirmation</Text>
      <Text className="bg-blue-100 p-3 rounded-md text-blue-700 italic">{affirmations[mood] || affirmation}</Text>
    </ScrollView>
  );
};

const JournalTab = ({
  journalEntry,
  setJournalEntry,
  journalTemplates,
  saveJournal,
  savedJournals,
  setJournalHeading,
  journalHeading,
  mood,
}: {
  journalEntry: string;
  setJournalEntry: (val: string) => void;
  journalTemplates: { id: string; title: string; description: string }[];
  saveJournal: () => void;
  savedJournals: { text: string; heading: string; date: string; mood: string }[];
  setJournalHeading: (val: string) => void;
  journalHeading: string;
  mood: MoodType;
}) => {
  return (
    <View className="flex-1 bg-blue-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-lg font-semibold text-blue-900 mt-6 mb-2">New Entry</Text>

        <View className="bg-white rounded-xl p-4 mb-4" style={shadowFix}>
          <TextInput
            placeholder="Heading..."
            value={journalHeading}
            onChangeText={setJournalHeading}
            className="bg-gray-100 rounded-md px-3 py-2 mb-2 text-base"
          />
          <TextInput
            placeholder="Write your thoughts..."
            value={journalEntry}
            onChangeText={setJournalEntry}
            multiline
            textAlignVertical="top"
            className="bg-gray-100 rounded-md px-3 py-2 h-28 text-base"
          />
          <TouchableOpacity onPress={saveJournal} className="bg-blue-600 mt-3 py-2 rounded-md">
            <Text className="text-white text-center font-semibold">Save Journal</Text>
          </TouchableOpacity>
        </View>

        {savedJournals.length > 0 && (
          <View className="mt-4">
            <Text className="text-lg font-semibold text-blue-900 mb-3">📚 All Journals</Text>
            {savedJournals.map((entry, index) => {
              const moodKey = entry.mood as MoodType;
              return (
                <View
                  key={index}
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
      </ScrollView>
    </View>
  );
};

export default function Wellness() {
  const layout = Dimensions.get('window');
  const [index, setIndex] = useState(0);
  const [mood, setMood] = useState<MoodType>('😊');
  const [affirmation, setAffirmation] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [journalHeading, setJournalHeading] = useState('');
  const [savedJournals, setSavedJournals] = useState<
    { text: string; heading: string; date: string; mood: MoodType }[]
  >([]);

  const journalTemplates = [
    { id: '1', title: 'Daily Reflection', description: 'How was your day?' },
    { id: '2', title: 'Mood Journal', description: 'Track your mood patterns' },
    { id: '3', title: 'Goals & Intentions', description: 'What do you want to achieve?' },
  ];

  useEffect(() => {
    const affirmations = [
      'You are doing your best!',
      'Take a deep breath and keep going.',
      'Progress, not perfection.',
      'You’ve got this!',
      'Every day is a fresh start.',
    ];
    setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);

    (async () => {
      const stored = await AsyncStorage.getItem('@journals');
      if (stored) setSavedJournals(JSON.parse(stored));
    })();
  }, []);

  const saveJournal = async () => {
    const newEntry = {
      text: journalEntry,
      heading: journalHeading,
      date: new Date().toLocaleDateString(),
      mood,
    };
    const updated = [newEntry, ...savedJournals];
    setSavedJournals(updated);
    await AsyncStorage.setItem('@journals', JSON.stringify(updated));
    setJournalEntry('');
    setJournalHeading('');
  };

  const renderScene = SceneMap({
    mood: () => <MoodTab mood={mood} setMood={setMood} affirmation={affirmation} />,
    journal: () => (
      <JournalTab
        journalEntry={journalEntry}
        setJournalEntry={setJournalEntry}
        journalTemplates={journalTemplates}
        saveJournal={saveJournal}
        savedJournals={savedJournals}
        setJournalHeading={setJournalHeading}
        journalHeading={journalHeading}
        mood={mood}
      />
    ),
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <View className="flex-row justify-around bg-white border-b border-blue-200">
          {['Mood', 'Journal'].map((title, i) => (
            <TouchableOpacity
              key={title}
              className={`flex-1 py-3 ${index === i ? 'border-b-4 border-blue-600' : ''}`}
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

        <TabView
          navigationState={{
            index,
            routes: [
              { key: 'mood', title: 'Mood' },
              { key: 'journal', title: 'Journal' },
            ],
          }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
