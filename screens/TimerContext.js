// TimerContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crear el contexto
export const TimerContext = createContext();

// Proveedor del contexto
export const TimerProvider = ({ children }) => {
  const [pomodorosCompleted, setPomodorosCompleted] = useState([]);
  const [onePercentTimersCompleted, setOnePercentTimersCompleted] = useState([]);

  // Cargar datos guardados en AsyncStorage (si se necesita persistencia)
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedPomodoros = await AsyncStorage.getItem('pomodorosCompleted');
        const storedOnePercent = await AsyncStorage.getItem('onePercentTimersCompleted');
        if (storedPomodoros) setPomodorosCompleted(JSON.parse(storedPomodoros));
        if (storedOnePercent) setOnePercentTimersCompleted(JSON.parse(storedOnePercent));
      } catch (error) {
        console.log('Error al cargar los datos:', error);
      }
    };
    loadData();
  }, []);

  // Guardar los datos en AsyncStorage cuando se actualicen
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('pomodorosCompleted', JSON.stringify(pomodorosCompleted));
        await AsyncStorage.setItem('onePercentTimersCompleted', JSON.stringify(onePercentTimersCompleted));
      } catch (error) {
        console.log('Error al guardar los datos:', error);
      }
    };
    saveData();
  }, [pomodorosCompleted, onePercentTimersCompleted]);

  // Marcar el día en que se completó un Pomodoro
  const completePomodoro = () => {
    const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    if (!pomodorosCompleted.includes(today)) {
      setPomodorosCompleted([...pomodorosCompleted, today]);
    }
    console.log('se completa pomodoro');
    console.log(pomodorosCompleted);
  };

  // Marcar el día en que se completó un temporizador de 1%
  const completeOnePercentTimer = () => {
    const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    if (!onePercentTimersCompleted.includes(today)) {
      setOnePercentTimersCompleted([...onePercentTimersCompleted, today]);
    }
  };

  return (
    <TimerContext.Provider value={{
      pomodorosCompleted,
      onePercentTimersCompleted,
      completePomodoro,
      completeOnePercentTimer,
    }}>
      {children}
    </TimerContext.Provider>
  );
};
