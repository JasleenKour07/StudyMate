import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';


const DURATIONS = {
  pomodoro25: 25 * 60,
  pomodoro40: 40 * 60,
  pomodoro50: 50 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

type Mode = 'pomodoro25' | 'pomodoro40' | 'pomodoro50' | 'short' | 'long';

export default function PomodoroPage() {
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro25);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>('pomodoro25');
  const [projectName, setProjectName] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);
  const progressAnim = new Animated.Value(0);

  const radius = 100;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const totalDuration = DURATIONS[mode];
  const progress = 1 - secondsLeft / totalDuration;

  useEffect(() => {
    (async () => {
      const savedProject = await AsyncStorage.getItem('projectName');
      const savedSessions = await AsyncStorage.getItem('completedSessions');
      if (savedProject) setProjectName(savedProject);
      if (savedSessions) setCompletedSessions(Number(savedSessions));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('projectName', projectName);
  }, [projectName]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      const newTotal = completedSessions + 1;
      setCompletedSessions(newTotal);
      AsyncStorage.setItem('completedSessions', newTotal.toString());
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setSecondsLeft(DURATIONS[newMode]);
  };

  const isBreak = mode === 'short' || mode === 'long';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pomodoro Timer</Text>

      <View style={styles.svgWrapper}>
        <Svg height="220" width="220">
          <Circle
            stroke="#eee"
            fill="none"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#3b82f6"
            fill="none"
            cx="110"
            cy="110"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference - progress * circumference}
            strokeLinecap="round"
            rotation={-90}
            origin="110,110"
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>

      <TouchableOpacity onPress={() => setIsRunning(!isRunning)} style={styles.startButton}>
        <Text style={styles.startText}>{isRunning ? 'Pause' : 'Start'}</Text>
      </TouchableOpacity>

      <View style={styles.modeButtons}>
        {['pomodoro25', 'pomodoro40', 'pomodoro50'].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => handleModeChange(m as Mode)}
            style={[styles.modeButton, mode === m ? styles.activeMode : {}]}
          >
            <Text style={styles.modeText}>{m.replace('pomodoro', '')} Min</Text>
          </TouchableOpacity>
        ))}
        {['short', 'long'].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => handleModeChange(m as Mode)}
            style={[styles.modeButton, mode === m ? styles.activeMode : {}]}
          >
            <Text style={styles.modeText}>{m === 'short' ? 'Short Break' : 'Long Break'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.projectBox}>
        {isBreak ? (
          <Text style={styles.projectTitle}>
            Break Mode: <Text style={{ fontWeight: 'bold' }}>{mode === 'short' ? 'Short' : 'Long'} Break</Text>
          </Text>
        ) : (
          <>
            <Text style={styles.projectTitle}>Current Project:</Text>
            <TextInput
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Enter project name"
            />
          </>
        )}
        <Text style={styles.timeText}>Completed Sessions: {completedSessions}</Text>
        <Text style={styles.metricLabel}>Focus Level</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eef2ff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#1e3a8a',
  },
  svgWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  timerText: {
    position: 'absolute',
    top: 90,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 20,
  },
  startText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 25,
    gap: 10,
    justifyContent: 'center',
  },
  modeButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  activeMode: {
    backgroundColor: '#2563eb',
  },
  modeText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
  },
  projectBox: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#1e293b',
  },
  input: {
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  timeText: {
    color: '#475569',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#475569',
    fontSize: 13,
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
});
