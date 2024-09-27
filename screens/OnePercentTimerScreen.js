import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, StatusBar, Alert, Platform, Modal, TextInput, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useIsFocused } from '@react-navigation/native';
import { TimerContext } from './TimerContext';

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

export default function OnePercentTimerScreen() {
  const [workMinutes, setWorkMinutes] = useState(14);
  
  const [currentMinutes, setCurrentMinutes] = useState(workMinutes);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      // Cambiar el color del StatusBar y otros marcos
      StatusBar.setBackgroundColor('#B9E3FA'); // Fondo naranja
      StatusBar.setBarStyle('dark-content'); // Color del texto en la barra de estado
    }
  }, [isFocused]);
  
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
  }, [isRunning]);*/
  
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
        title: isRunning ? "Timer en marcha" : "Timer en pausa",
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
  
  const { completeOnePercentTimer } = useContext(TimerContext); // Accedemos al método para completar un temporizador de 1%


  const handleCycleCompletion = () => {
    Vibration.vibrate();
    setIsRunning(false);
    resetTimer();
    completeOnePercentTimer();
    Alert.alert("Timer completed!", "Congrats on working for 1% of your day!");
  };

  const startstopTimer = () => {
    if(isRunning) {
        setIsRunning(false);
    } else {
        setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentMinutes(workMinutes);
    setCurrentSeconds(0);
  };

  const CustomButtons = () => {
    return (
      <View style={styles.buttonsContainer}>
        {/* Botones start/stop superpuestos */}
        {!isRunning && (
          <TouchableOpacity style={styles.startButton} onPress={startstopTimer}>
            <View style={styles.triangle} />
          </TouchableOpacity>
        )}
        
        {isRunning && (
          <TouchableOpacity style={styles.stopButton} onPress={startstopTimer}>
              <View style={styles.pauseBar} />
              <View style={styles.pauseBar} />
          </TouchableOpacity>
        )}
        {/* Botón Reset (Stop) */}
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <View style={styles.square} />
        </TouchableOpacity>
      </View>
    );
  };
  
  
    return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
      {`${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`}
      </Text>
      <CustomButtons/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B9E3FA',
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20,
    color: '#000000',
  },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 20,
      backgroundColor: '#B9E3FA',
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
      borderTopColor: '#B9E3FA',
      borderBottomColor: '#B9E3FA',
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
  });
  