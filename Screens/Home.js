import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView, Image, FlatList, Linking, Platform } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';

// Configure notification settings for mobile platforms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});
  const [timers, setTimers] = useState({});

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received: ", notification);
      });

      return () => {
        notificationListener.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.requestPermissionsAsync().then(({ status }) => {
        if (status !== 'granted') {
          console.error('Permission to send notifications not granted!');
        }
      });
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(tasksArray);

      const storedStatuses = await AsyncStorage.getItem('taskStatuses');
      const statuses = storedStatuses ? JSON.parse(storedStatuses) : {};
      
      const timersInit = {};
      tasksArray.forEach((task, index) => {
        if (!statuses[index]) {
          statuses[index] = { doing: false, originalTime: task.time, remainingTime: task.time };
        }
        timersInit[index] = null;
      });
      setTaskStatuses(statuses);
      setTimers(timersInit);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const saveTaskStatuses = async () => {
      try {
        await AsyncStorage.setItem('taskStatuses', JSON.stringify(taskStatuses));
      } catch (error) {
        console.error('Error saving task statuses:', error);
      }
    };
    saveTaskStatuses();
  }, [taskStatuses]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const updateTask = async (index, updatedTask) => {
    const updatedTasks = [...tasks];
    if (updatedTask === null) {
      updatedTasks.splice(index, 1);
    } else {
      updatedTasks[index] = updatedTask;
    }
    setTasks(updatedTasks);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const handleTaskClick = (task) => {
    if (task.description) {
      let url = task.description;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      Linking.openURL(url).catch(err => console.error('An error occurred', err));
    }
  };

  const formatTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;
  };

  const startTimer = (index) => {
    const [hours, minutes] = taskStatuses[index].remainingTime
      .replace('h', '')
      .replace('m', '')
      .split(' ')
      .map((time) => parseInt(time, 10));

    const totalTimeInMinutes = (hours * 60) + minutes;
    let remainingTimeInMinutes = totalTimeInMinutes;

    const updateTime = (timeLeftInMinutes) => {
      setTaskStatuses((prevStatuses) => {
        const updatedStatuses = { ...prevStatuses };
        updatedStatuses[index].remainingTime = formatTime(timeLeftInMinutes);
        return updatedStatuses;
      });
    };

    const intervalId = setInterval(() => {
      remainingTimeInMinutes -= 1;

      if (remainingTimeInMinutes <= 0) {
        clearInterval(intervalId);
        sendNotification(tasks[index].title);
        setTaskStatuses((prevStatuses) => {
          const updatedStatuses = { ...prevStatuses };
          updatedStatuses[index].doing = false;
          updatedStatuses[index].remainingTime = taskStatuses[index].originalTime;
          return updatedStatuses;
        });
      } else {
        updateTime(remainingTimeInMinutes);
      }
    }, 60000);

    setTimers((prevTimers) => ({
      ...prevTimers,
      [index]: intervalId,
    }));
  };

  const handleToggle = (index) => {
    setTaskStatuses((prevStatuses) => {
      const newStatuses = { ...prevStatuses };

      if (!newStatuses[index].doing) {
        newStatuses[index].doing = true;
        startTimer(index);
      } else {
        newStatuses[index].doing = false;
        clearInterval(timers[index]);
        newStatuses[index].remainingTime = newStatuses[index].originalTime;
      }

      return newStatuses;
    });
  };

  const sendNotification = async (taskTitle) => {
    console.log("sendNotification called for task:", taskTitle);
    if (Platform.OS !== 'web') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time's up!",
          body: `The timer for "${taskTitle}" has ended.`,
        },
        trigger: null,
      });
    } else if (Platform.OS === 'web' && Notification.permission === 'granted') {
      new Notification('Time\'s up!', { body: `The timer for "${taskTitle}" has ended.` });
    } else if (Platform.OS === 'web' && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Time\'s up!', { body: `The timer for "${taskTitle}" has ended.` });
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="menu" size={28} color="white"/>
        <Text style={styles.headerTitle}>Index</Text>
        <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.profileIcon} onPress={() => navigation.navigate('Profile')}/>
      </View>

      {/* Task List with Scroll */}
      <View style={styles.taskListContainer}>
        <Text style={styles.title}>Your Tasks</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.taskContainer}>
              <Pressable
                style={styles.leftIconContainer}
                onPress={() => navigation.navigate('EditTaskScreen', { taskIndex: index, taskData: item, updateTask })}
              >
                <MaterialCommunityIcons name="send" size={28} color="#7f7fff" />
              </Pressable>

              <Pressable style={styles.taskContent} onPress={() => handleTaskClick(item)}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskTime}>Time Remaining: {taskStatuses[index]?.remainingTime}</Text>
              </Pressable>

              <View style={styles.taskRightSection}>
                <Text style={styles.taskTag}>{item.tag}</Text>
                <Text style={styles.taskStatus}>Priority: {item.priority}</Text>

                <Pressable
                  style={[styles.button, { backgroundColor: taskStatuses[index]?.doing ? 'red' : 'green' }]}
                  onPress={() => handleToggle(index)}
                >
                  <Text style={styles.buttonText}>
                    {taskStatuses[index]?.doing ? 'Doing' : 'Start'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>

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
  container: {
    flex: 1,
    paddingTop:20,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
  },
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
  taskListContainer: {
    flex: 1,
    padding: 5,
    maxHeight: '70%',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    color: 'white',
    fontSize: 18,
  },
  taskTime: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 5,
  },
  taskRightSection: {
    alignItems: 'flex-end',
  },
  taskTag: {
    color: 'white',
    fontSize: 14,
  },
  taskStatus: {
    color: '#00FF00',
    fontSize: 12,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
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
