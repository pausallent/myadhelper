import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, StatusBar, Alert, Platform, Modal, TextInput, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import Svg, { Path } from 'react-native-svg'; // Para el ícono de Settings
import { useIsFocused } from '@react-navigation/native';


// Configuración de la tarea en segundo plano
const BACKGROUND_TIMER_TASK = 'background-timer-task';

TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    // Aquí manejaríamos la actualización del timer si es necesario
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

export default function PomodoroScreen() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sets, setSets] = useState(4);

  const [currentMinutes, setCurrentMinutes] = useState(workMinutes);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [currentSet, setCurrentSet] = useState(0);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Estado para controlar la visibilidad del modal de configuración
  const [modalVisible, setModalVisible] = useState(false);
  const [tempWorkMinutes, setTempWorkMinutes] = useState(workMinutes);
  const [tempBreakMinutes, setTempBreakMinutes] = useState(breakMinutes);
  const [tempLongBreakMinutes, setTempLongBreakMinutes] = useState(longBreakMinutes);
  const [tempSets, setTempSets] = useState(sets);
  const [notificationId, setNotificationId] = useState(null);
  
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      // Cambiar el color del StatusBar y otros marcos
      StatusBar.setBackgroundColor(isWorkTime ? '#FFA500' : '#A5D6A7'); // Fondo naranja
      StatusBar.setBarStyle(isWorkTime ? 'light-content' : 'dark-content'); // Color del texto en la barra de estado
    }
  }, [isFocused, isWorkTime]);

  useEffect(() => {
    let interval = null;
    //updateNotification();  // Programar notificación en segundo plano
    if (isRunning) {
      interval = setInterval(() => {
        if (currentSeconds === 0) {
          if (currentMinutes === 0) {
            handleCycleCompletion();
          } else {
            setCurrentMinutes(prevMinutes => prevMinutes - 1);
            setCurrentSeconds(59);
          }
        } else {
          setCurrentSeconds(prevSeconds => prevSeconds - 1);
        }
      }, 1000);
    } else if (!isRunning && currentSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentSeconds]);


    const startBackgroundTask = async () => {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
            minimumInterval: 1, // Ejecutar cada minuto
            stopOnTerminate: false,
            startOnBoot: true,
        });
        }
    };
/*
  useEffect(() => {
    if (isRunning) {
      startBackgroundTask();
    } else {
      TaskManager.unregisterTaskAsync(BACKGROUND_TIMER_TASK);
    }
  }, [isRunning]);
  */
  useEffect(() => {
    const askNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('¡No tienes permiso para recibir notificaciones!');
        return;
      }
    };
  
    askNotificationPermission();
  }, []);
  
  const updateNotification = async () => {
    if (notificationId) {
      await Notifications.dismissNotificationAsync(notificationId);
    }
    const newNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: isRunning ? "Pomodoro en marcha" : "Pomodoro en pausa",
        body: `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`,
      },
      trigger: null, // Se ejecuta de inmediato
    });
    setNotificationId(newNotificationId);
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  

  const handleCycleCompletion = () => {
    Vibration.vibrate();
    if (isWorkTime) {
      if (currentSet + 1 === sets) {
        setCurrentMinutes(longBreakMinutes);
      } else {
        setCurrentMinutes(breakMinutes);
      }
      setCurrentSet(currentSet + 1);
      setIsWorkTime(false);
      setIsRunning(false); // Reseteamos dos veces el estado Running para que vuelva a entrar al useState
      setIsRunning(true);
    } else {
      if (currentSet === sets) {
        resetPomodoro();
        Alert.alert("Pomodoro completo!", "Has completado todos los sets.");
        setIsRunning(false); // Paramos tras completar el pomodoro.
      } else {
        setCurrentMinutes(workMinutes);
        setIsWorkTime(true);
        setIsRunning(false); // Reseteamos dos veces el estado Running para que vuelva a entrar al useState
        setIsRunning(true);
      }
    }
    setCurrentSeconds(0);
  };

  const startstopPomodoro = () => {
    if(isRunning) {
        setIsRunning(false);
        if (notificationId) {
           //updateNotification(); // Notificamos que se ha parado el pomodoro
        }
    } else {
        setIsRunning(true);
        //updateNotification(); // Iniciar la primera notificación
    }
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setCurrentMinutes(workMinutes);
    setCurrentSeconds(0);
    setCurrentSet(0);
    setIsWorkTime(true);
  };

  const handleSettings = () => {
    setModalVisible(true);  // Mostrar modal de configuración
  };
  const setDefaultValues = () => {
    setWorkMinutes(25);
    setBreakMinutes(5);
    setLongBreakMinutes(15);
    setSets(4);
    // Seteamos también los valores que aparecen en los campos del modal
    setTempWorkMinutes(25);
    setTempBreakMinutes(5);
    setTempLongBreakMinutes(15);
    setTempSets(4);
    setModalVisible(false);  // Cerrar el modal
  };

  const cancelSettings = () => {
    setTempWorkMinutes(workMinutes);
    setTempBreakMinutes(breakMinutes);
    setTempLongBreakMinutes(longBreakMinutes);
    setTempSets(sets);
    setModalVisible(false);  // Cerrar el modal
  };

  const saveSettings = () => {
    setWorkMinutes(tempWorkMinutes);
    setBreakMinutes(tempBreakMinutes);
    setLongBreakMinutes(tempLongBreakMinutes);
    setSets(tempSets);
    setModalVisible(false);  // Cerrar el modal
  };
  useEffect(() => {
    resetPomodoro();  // Resetear el Pomodoro con los nuevos valores cuando cambie la configuración
}, [workMinutes, breakMinutes, longBreakMinutes, sets]);


  const renderProgressDots = () => {
    const dots = [];
        
    for (let i = 0; i < sets; i++) {
      if (i < currentSet) {
        dots.push(<View key={i} style={styles.completedDot} />);
      } else if (i === currentSet && isWorkTime) {
        dots.push(<View key={i} style={styles.currentDot} />);
      } else {
        dots.push(<View key={i} style={styles.incompleteDot} />);
      }
    }
    return dots;
  };

  const CustomButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        {/* Botones start/stop superpuestos */}
        {!isRunning && (
          <TouchableOpacity style={styles.startButton} onPress={startstopPomodoro}>
            <View style={[styles.triangle, {borderTopColor: isWorkTime ? 'orange' : '#A5D6A7'}, {borderBottomColor: isWorkTime ? 'orange' : '#A5D6A7' }]} />
          </TouchableOpacity>
        )}
        
        {isRunning && (
          <TouchableOpacity style={styles.stopButton} onPress={startstopPomodoro}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
          </TouchableOpacity>
        )}  
        {/* Botón Reset (Stop) */}
        <TouchableOpacity style={styles.resetButton} onPress={resetPomodoro}>
          <View style={styles.square} />
        </TouchableOpacity>
  
        {/* Botón Settings (Ajustes) */}
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Svg height="32" width="32" viewBox="0 0 24 24">
          <Path
            d="M12 1.75a2.25 2.25 0 0 1 2.24 2.01l.24 2.02a7.43 7.43 0 0 1 1.75.72l2.1-1.15a2.25 2.25 0 0 1 3.13.94l1.05 1.83a2.25 2.25 0 0 1-.45 2.79l-1.67 1.34c.06.42.1.85.1 1.29 0 .44-.03.87-.1 1.29l1.67 1.34a2.25 2.25 0 0 1 .45 2.8l-1.05 1.82a2.25 2.25 0 0 1-3.13.95l-2.1-1.16a7.43 7.43 0 0 1-1.75.72l-.24 2.02a2.25 2.25 0 0 1-4.48 0l-.24-2.02a7.43 7.43 0 0 1-1.75-.72l-2.1 1.16a2.25 2.25 0 0 1-3.13-.95l-1.05-1.82a2.25 2.25 0 0 1 .45-2.8l1.67-1.34c-.07-.42-.1-.85-.1-1.29 0-.44.03-.87.1-1.29l-1.67-1.34a2.25 2.25 0 0 1-.45-2.79l1.05-1.83a2.25 2.25 0 0 1 3.13-.94l2.1 1.15c.54-.33 1.13-.6 1.75-.72l.24-2.02A2.25 2.25 0 0 1 12 1.75zm0 5.5a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5z"
            fill="#777777"
          />
          </Svg>
        </TouchableOpacity>
      </View>
    );
  };
  
  
  return (
    <View style={[styles.container, { backgroundColor: isWorkTime ? '#FFA726' : '#A5D6A7' }]}>
      <Text style={styles.timerText}>
        {`${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`}
      </Text>
      <View style={styles.dotsContainer}>
        {renderProgressDots()}
      </View>
      <CustomButtons />
    {
      //<Button title={isRunning ? "Stop" : "Start"} onPress={startstopPomodoro} />
      //<Button title={isRunning ? "Reset" : "Settings"} onPress={handleSettings} />
    }

      {/* Modal de Configuración */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuración</Text>
            <Text>Duración del set de trabajo (min):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempWorkMinutes.toString()}
              onChangeText={text => setTempWorkMinutes(Number(text))}
            />
            <Text>Duración del descanso (min):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempBreakMinutes.toString()}
              onChangeText={text => setTempBreakMinutes(Number(text))}
            />
            <Text>Duración del descanso largo (min):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempLongBreakMinutes.toString()}
              onChangeText={text => setTempLongBreakMinutes(Number(text))}
            />
            <Text>Número de sets:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={tempSets.toString()}
              onChangeText={text => setTempSets(Number(text))}
            />
            <View style={styles.modalButtons}>
              <Button title="Default" onPress={setDefaultValues} />
              <Button title="Save" onPress={saveSettings} />
              <Button title="Cancel" onPress={cancelSettings} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20,
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  completedDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#66BB6A',
    marginHorizontal: 5,
  },
  currentDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#66BB6A',
    borderWidth: 3,
    marginHorizontal: 5,
  },
  incompleteDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#BDBDBD',
    borderWidth: 3,
    marginHorizontal: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 20,
    },
    startButton: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    triangle: {
      width: 0,
      height: 0,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: 40,
      borderRightWidth: 0,
      borderBottomWidth: 20,
      borderTopWidth: 20,
      borderLeftColor: 'green',
      borderRadius: 0, // Bordes redondeados
    },
    stopButton: {
      width: 60,
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pauseBar: {
      width: 12,
      height: 40,
      backgroundColor: '#F08902',
      marginHorizontal: 3,
      borderRadius: 3, // Bordes redondeados
    },
    resetButton: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    square: {
      width: 40,
      height: 40,
      backgroundColor: 'red',
      borderRadius: 5, // Bordes redondeados
    },
    settingsButton: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  