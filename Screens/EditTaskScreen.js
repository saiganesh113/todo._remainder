import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function EditTaskScreen({ route, navigation }) {
  const { taskIndex, taskData, updateTask } = route.params; // Ensure updateTask is passed
  const [taskTitle, setTaskTitle] = useState(taskData.title);
  const [taskTime, setTaskTime] = useState(taskData.time);
  const [selectedTag, setSelectedTag] = useState(taskData.tag);
  const [priority, setPriority] = useState(taskData.priority);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  // Save the edited task
  const saveTask = () => {
    const updatedTask = {
      ...taskData,
      title: taskTitle,
      time: taskTime,
      tag: selectedTag,
      priority: priority,
    };
    updateTask(taskIndex, updatedTask); // Call updateTask to update the task
    navigation.goBack(); // Navigate back to HomeScreen
  };

  // Delete the task
  const deleteTask = () => {
    updateTask(taskIndex, null);  // Call updateTask with null to delete
    navigation.goBack(); // Navigate back to HomeScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Edit Task</Text>
      <TextInput style={styles.input} value={taskTitle} onChangeText={setTaskTitle} />

      {/* Task Time */}
      <TouchableOpacity onPress={() => setTimeModalVisible(true)} style={styles.input}>
        <Text style={styles.color} >Task Time: {taskTime}</Text>
      </TouchableOpacity>

      {/* Task Tag */}
      <TextInput style={styles.input} value={selectedTag} onChangeText={setSelectedTag} />

      {/* Task Priority */}
      <TouchableOpacity onPress={() => setPriority(priority === 'Low' ? 'High' : 'Low')} style={styles.input}>
        <Text style={styles.color}>Task Priority: {priority}</Text>
      </TouchableOpacity>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={deleteTask}>
        <Text style={styles.deleteButtonText}>Delete Task</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <Modal visible={timeModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Time</Text>
            <Picker
              selectedValue={taskTime}
              onValueChange={(itemValue) => setTaskTime(itemValue)}
              style={{ width: 150 }}
            >
              {Array.from({ length: 24 }, (_, h) =>
                Array.from({ length: 60 }, (_, m) => `${h}:${m < 10 ? '0' : ''}${m}`).map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))
              )}
            </Picker>
            <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
              <Text style={styles.modalfooter}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop:20,
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 20,
    color: 'white',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#7f7fff',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4c4c',
    padding: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    color: 'white', // Set the color to white
    marginBottom: 20,
  },
  modalfooter: {
    fontSize: 18,
    color: 'white', // Set the color to white
    marginTop: 20,
  },
  color:{
    color: 'white',
  },
});