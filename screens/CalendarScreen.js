import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

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

  const [markedDates, setMarkedDates] = useState({
    '2024-08-15': { dots: [{ key: 'pomodoro', color: 'orange' }] },
    '2024-08-17': { dots: [{ key: '1percent', color: 'blue' }] },
    '2024-08-19': { dots: [{ key: 'pomodoro', color: 'orange' }, { key: '1percent', color: 'blue' }] },
  });

  useEffect(() => {
    if (isFocused) {
      // Cambiar el color del StatusBar y otros marcos
      StatusBar.setBackgroundColor('#FFFFFF'); // Fondo blanco
      StatusBar.setBarStyle('dark-content'); // Color del texto en la barra de estado
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Track your progress!</Text>
      <Calendar
        // Habilitar la navegación entre meses
        onDayPress={(day) => {
          console.log('Día seleccionado', day);
        }}
        // Marcar días específicos
        markingType={'multi-dot'}
        markedDates={markedDates}
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
