import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarUI() {
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleMonth, setVisibleMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [currentTab, setCurrentTab] = useState('All');

  interface Event {
    title: string;
    startTime: string;
    endTime: string;
    category?: string;
  }

  const [events, setEvents] = useState<{ [key: string]: Event[] }>({});
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('Birthday');

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setVisibleMonth(day.dateString.slice(0, 7)); // sync month when selecting
  };

  const addOrEditEvent = () => {
    if (!newEvent.trim() || !startTime || !endTime) return;

    const newEventObj: Event = {
      title: newEvent,
      startTime,
      endTime,
      category: newCategory
    };

    setEvents(prev => {
      const current = prev[selectedDate] || [];
      let updated: Event[];

      if (isEditing && editingIndex !== null) {
        updated = [...current];
        updated[editingIndex] = newEventObj;
      } else {
        updated = [...current, newEventObj];
      }

      return { ...prev, [selectedDate]: updated };
    });

    setNewEvent('');
    setStartTime('');
    setEndTime('');
    setNewCategory('Birthday');
    setIsEditing(false);
    setEditingIndex(null);
    setModalVisible(false);
  };

  const startEditEvent = (index: number) => {
    const event = events[selectedDate][index];
    setNewEvent(event.title);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setNewCategory(event.category || 'Birthday');
    setIsEditing(true);
    setEditingIndex(index);
    setModalVisible(true);
  };

  const deleteEvent = (index: number) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setEvents(prev => {
            const updated = [...(prev[selectedDate] || [])];
            updated.splice(index, 1);
            return { ...prev, [selectedDate]: updated };
          });
        }
      }
    ]);
  };

  const colors = ['#FF5733', '#33C1FF', '#7DFF33', '#FF33A8', '#FFC733'];

  const markedDates = Object.keys(events).reduce((acc, date) => {
    const dots = events[date].map((_, idx) => ({
      key: `${date}-dot-${idx}`,
      color: colors[idx % colors.length],
    }));

    acc[date] = {
      marked: true,
      dots,
      selected: date === selectedDate,
      selectedColor: 'blue',
    };

    return acc;
  }, {} as any);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const storedEvents = await AsyncStorage.getItem('calendarEvents');
        if (storedEvents) {
          setEvents(JSON.parse(storedEvents));
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const saveEvents = async () => {
      try {
        await AsyncStorage.setItem('calendarEvents', JSON.stringify(events));
      } catch (error) {
        console.error('Failed to save events:', error);
      }
    };
    saveEvents();
  }, [events]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toDateString();
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.topTabs}>
        {['All', 'Birthday', 'Meetings', 'Trips'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setCurrentTab(tab)}
            style={[
              styles.tab,
              currentTab === tab && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              currentTab === tab && styles.activeTabText
            ]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        onDayLongPress={(day) => {
          setSelectedDate(day.dateString);
          setVisibleMonth(day.dateString.slice(0, 7));
          setNewEvent('');
          setIsEditing(false);
          setModalVisible(true);
        }}
        onMonthChange={(month) => {
          const monthStr = `${month.year}-${String(month.month).padStart(2, '0')}`;
          setVisibleMonth(monthStr);
        }}
        markedDates={markedDates}
        markingType="multi-dot"
      />

      {/* Timeline/Event List Below Calendar */}
      <ScrollView style={styles.timelineContainer}>
        <FlatList
          data={Object.entries(events).filter(([date]) => date.startsWith(visibleMonth))}
          keyExtractor={([date]) => date}
          renderItem={({ item: [date, dayEvents] }) => {
            const filteredEvents = currentTab === 'All'
              ? dayEvents
              : dayEvents.filter(event => event.category === currentTab);

            if (filteredEvents.length === 0) return null;

            return (
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>{formatDate(date)}</Text>
                {filteredEvents.map((event, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setSelectedDate(date);
                      startEditEvent(idx);
                    }}
                    onLongPress={() => {
                      setSelectedDate(date);
                      deleteEvent(idx);
                    }}
                    style={styles.eventCard}
                  >
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{event.startTime} - {event.endTime}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          }}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text>{isEditing ? 'Edit' : 'Add'} Event on {selectedDate}</Text>
          <TextInput
            placeholder="Event title"
            value={newEvent}
            onChangeText={setNewEvent}
            style={styles.input}
          />
          <TextInput
            placeholder="Start Time (e.g. 14:00)"
            value={startTime}
            onChangeText={setStartTime}
            style={styles.input}
          />
          <TextInput
            placeholder="End Time (e.g. 15:30)"
            value={endTime}
            onChangeText={setEndTime}
            style={styles.input}
          />
          <TextInput
            placeholder="Category (e.g. Birthday)"
            value={newCategory}
            onChangeText={setNewCategory}
            style={styles.input}
          />
          <TouchableOpacity onPress={addOrEditEvent} style={styles.addButton}>
            <Text style={styles.addButtonText}>{isEditing ? 'Update' : 'Add'} Event</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalVisible(false);
              setNewEvent('');
              setStartTime('');
              setEndTime('');
              setNewCategory('Birthday');
              setIsEditing(false);
              setEditingIndex(null);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#007BFF',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dateSection: {
    marginBottom: 20,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
  },
  dateLabel: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 10,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  eventTime: {
    color: '#666',
    fontSize: 12,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
