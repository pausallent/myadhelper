import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import moment from 'moment';
import { TimerContext } from './TimerContext';

// Configurar el calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function CalendarScreen() {
  const isFocused = useIsFocused();
  const { pomodorosCompleted, onePercentTimersCompleted } = useContext(TimerContext);

  // Estado para manejar los días marcados en el calendario
  const [markedDates, setMarkedDates] = useState({});
  useEffect(() => {
    console.log('Pomodoros completados:', pomodorosCompleted);
    console.log('Temporizadores 1% completados:', onePercentTimersCompleted);
  }, [pomodorosCompleted, onePercentTimersCompleted]);

  useEffect(() => {
    if (isFocused) {
      StatusBar.setBackgroundColor('#FFFFFF'); // Cambiar el color del fondo del status bar
      StatusBar.setBarStyle('dark-content');  // Cambiar el color del texto del status bar
    }
  }, [isFocused]);
  
  useEffect(() => {
    const newMarks = { ...markedDates };
  
    // Recorrer los días completados de Pomodoro y añadir puntos rojos anaranjados
    pomodorosCompleted.forEach((date) => {
      if (newMarks[date]) {
        // Si ya hay una entrada para ese día, añadimos el punto del pomodoro
        newMarks[date].dots = [...newMarks[date].dots, { key: 'pomodoro', color: 'orange' }];
      } else {
        // Si no hay una entrada para ese día, creamos una nueva
        newMarks[date] = {
          dots: [{ key: 'pomodoro', color: 'orange' }]
        };
      }
    });
  
    // Recorrer los días completados de 1% Timer y añadir puntos azules
    onePercentTimersCompleted.forEach((date) => {
      if (newMarks[date]) {
        // Si ya hay una entrada para ese día, añadimos el punto del 1%
        newMarks[date].dots = [...newMarks[date].dots, { key: '1percent', color: 'blue' }];
      } else {
        // Si no hay una entrada para ese día, creamos una nueva
        newMarks[date] = {
          dots: [{ key: '1percent', color: 'blue' }]
        };
      }
    });
  
    // Actualizar el estado de los días marcados
    setMarkedDates(newMarks);
  }, [pomodorosCompleted, onePercentTimersCompleted]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendario para seguimiento de Pomodoro y 1% Timer</Text>
      <Calendar
        markingType={'multi-dot'}
        markedDates={markedDates}  // Mostrar los días marcados
        onDayPress={(day) => {
          console.log('Día seleccionado', day);
          console.log(pomodorosCompleted);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});
