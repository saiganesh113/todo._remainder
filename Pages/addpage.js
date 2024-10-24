import React, { useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Correct AsyncStorage import

export default function AddTaskScreen({ navigation }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedHours, setSelectedHours] = useState(0);
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [selectedTag, setSelectedTag] = useState('');
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [priority, setPriority] = useState('Low'); // Default priority
  
  // Function to start the timer and set a notification
  const startTimer = () => {
    const totalTimeInSeconds = selectedHours * 3600 + selectedMinutes * 60;
    setTimeout(() => {
      sendNotification();
    }, totalTimeInSeconds * 1000);
  };

  // Function to save selected tag
  const saveSelectedTag = () => {
    setSelectedTag(selectedOption);
    setTagModalVisible(false);
  };

  // Function to cycle through priority levels
  const cyclePriority = () => {
    const priorities = ['High', 'Low'];
    const currentIndex = priorities.indexOf(priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    setPriority(nextPriority);
  };

  // Function to store the task in local storage
  const storeTask = async () => {
    // Ensure the description has a valid URL format
    let description = taskDescription;
    if (description && !/^https?:\/\//i.test(description)) {
      description = 'https://' + description; // Add https:// if it's missing
    }

    const newTask = {
      title: taskTitle,
      description: description, // Use the formatted description
      tag: selectedTag,
      time: `${selectedHours}h ${selectedMinutes}m`,
      priority: priority,
    };
    
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
      tasksArray.push(newTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksArray));

      // Navigate to Home screen after saving
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="menu" size={28} color="white" />
        <Text style={styles.headerTitle}>Add Task</Text>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.profileIcon} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* Add Task Section */}
          <Text style={styles.headerText}>Add Task</Text>

          {/* Task Title Input */}
          <TextInput
            style={styles.input}
            placeholder="Do math homework"
            placeholderTextColor="#aaa"
            value={taskTitle}
            onChangeText={setTaskTitle}
          />

          {/* Task Description Input */}
          <TextInput
            style={styles.input}
            placeholder="URL or Description"
            placeholderTextColor="#aaa"
            value={taskDescription}
            onChangeText={setTaskDescription}
          />

          {/* Icons and Send Button Section */}
          <View style={styles.row}>
            <View style={styles.iconRow}>
              {/* Timer Icon */}
              <TouchableOpacity style={styles.iconButton} onPress={() => setTimeModalVisible(true)}>
                <Ionicons name="timer-outline" size={40} color="white" />
              </TouchableOpacity>

              {/* Tag Icon - Open Tag Modal */}
              <TouchableOpacity style={styles.iconButton} onPress={() => setTagModalVisible(true)}>
                <FontAwesome name="tag" size={40} color="white" />
              </TouchableOpacity>

              {/* Priority Icon */}
              <TouchableOpacity style={styles.iconButton} onPress={cyclePriority}>
                <MaterialIcons name="flag" size={40} color="white" />
              </TouchableOpacity>
            </View>

            {/* Submit Task Button */}
            <TouchableOpacity style={styles.addButton} onPress={storeTask}>
              <Ionicons name="send-outline" size={40} color="white" />
            </TouchableOpacity>
          </View>

          {/* Display Selected Tag */}
          {selectedTag ? (
            <View style={styles.tagContainer}>
              <Text style={styles.selectedTag}>Selected Tag: {selectedTag}</Text>
            </View>
          ) : null}
        </View>

        {/* Timer Modal */}
        <Modal visible={timeModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Choose Time</Text>

              {/* Picker for Hours and Minutes Side by Side */}
              <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Hours</Text>
                  <Picker
                    selectedValue={selectedHours}
                    style={[styles.picker, { height: 150, overflow: 'hidden' }]}
                    itemStyle={[styles.pickerItem, { fontSize: 24, height: 30, textAlign: 'center' }]}
                    onValueChange={(itemValue) => setSelectedHours(itemValue)}
                  >
                    {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                      <Picker.Item key={hour} label={`${hour}`} value={hour} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Minutes</Text>
                  <Picker
                    selectedValue={selectedMinutes}
                    style={[styles.picker, { height: 150, overflow: 'hidden' }]}
                    itemStyle={[styles.pickerItem, { fontSize: 24, height: 30, textAlign: 'center' }]}
                    onValueChange={(itemValue) => setSelectedMinutes(itemValue)}
                  >
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <Picker.Item key={minute} label={`${minute}`} value={minute} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setTimeModalVisible(false);
                    startTimer();
                  }}
                >
                  <Text style={styles.saveText}>Start Timer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tag Modal */}
        <Modal visible={tagModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Add TAG</Text>

              <View style={styles.optionsContainer}>
                {['1 hour', 'single tap', 'once a day'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption === option && styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setTagModalVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={saveSelectedTag}>
                  <Text style={styles.saveText}>Save Tag</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>

      {/* Floating Action Button (FAB) */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('Add')}>
        <MaterialIcons name="add" size={32} color="white" />
      </Pressable>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="view-grid" size={24} color="white" />
          <Text style={styles.navText}>Index</Text>
        </Pressable>

        <Pressable style={[styles.navItem, styles.leftNavItem]} onPress={() => navigation.navigate('Organizer')}>
          <MaterialCommunityIcons name="folder" size={24} color="white" />
          <Text style={styles.navText}>Organizer</Text>
        </Pressable>

        <Pressable style={[styles.navItem, styles.rightNavItem]} onPress={() => navigation.navigate('Focus')}>
          <FontAwesome name="globe" size={24} color="white" />
          <Text style={styles.navText}>Focus</Text>
        </Pressable>

        <Pressable style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="account" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop:20, flex: 1, backgroundColor: '#121212' },
  innerContainer: { padding: 20 },
  headerText: { fontSize: 20, color: 'white' },
  input: { backgroundColor: '#1c1c1c', color: 'white', padding: 12, borderRadius: 8, marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop:20 },
  iconRow: { flexDirection: 'row' },
  iconButton: { alignItems: 'center', marginHorizontal: 5 , padding:10, backgroundColor: '#7f7fff', borderRadius: 30, },
  iconText: { color: 'green', fontSize: 12, marginTop: 4 },
  addButton: { backgroundColor: '#7f7fff', borderRadius: 30, padding: 10 },
  tagContainer: { marginTop: 20 },
  selectedTag: { color: 'green', fontSize: 16 },

  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { width: 300, backgroundColor: '#333', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalHeader: { fontSize: 18, color: 'white', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelText: { color: 'white', fontSize: 16 },
  saveText: { color: '#7f7fff', fontSize: 16 },
  pickerContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
  pickerWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  picker: { width: 60, height: 60, color: 'white', backgroundColor: '#444', borderRadius: 10 },
  pickerItem: { fontSize: 24, height: 30, textAlign: 'center' },
  pickerLabel: { color: 'white', marginBottom: 10, fontSize: 16 },

  optionsContainer: { marginBottom: 20 },
  optionButton: { backgroundColor: '#333', padding: 15, marginBottom: 10, borderRadius: 8 },
  selectedOption: { backgroundColor: '#7f7fff' },
  optionText: { color: 'white', fontSize: 16 },
  selectedOptionText: { color: 'white' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  fab: {
    backgroundColor: '#7f7fff',
    borderRadius: 35,
    padding: 20,
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -35 }],
    elevation: 5,
    zIndex: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#1c1c1c',
    height: 80,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  leftNavItem: {
    marginRight: 40,
  },
  rightNavItem: {
    marginLeft: 40,
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
});
