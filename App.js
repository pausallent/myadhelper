// /Users/pausallent/myadhelper
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PomodoroScreen from './screens/PomodoroScreen';
import OnePercentTimerScreen from './screens/OnePercentTimerScreen';
import CalendarScreen from './screens/CalendarScreen';
import { Ionicons } from 'react-native-vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Pomodoro"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'Pomodoro') {
            iconSource = focused
              ? require('./assets/tomate-focus.png')
              : require('./assets/tomate.png');
          } else if (route.name === '1% Timer') {
            iconSource = focused
              ? require('./assets/1percent-focus.png')
              : require('./assets/1percent-focus.png');
          } else if (route.name === 'Calendar') {
            iconSource = focused
              ? require('./assets/calendar-focus.png')
              : require('./assets/calendar.png');
          }

          return (
            <Image
              source={iconSource}
              style={{ width: 24, height: 24 }}
            />
          );
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
        <Tab.Screen name="1% Timer" component={OnePercentTimerScreen} />
        <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
