import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import TrainingLogScreen from './src/screens/TrainingLogScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SetupScreen from './src/screens/SetupScreen';
import { DataProvider } from './src/context/DataContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Training Log') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Progress') {
                iconName = focused ? 'analytics' : 'analytics-outline';
              } else if (route.name === 'Setup') {
                iconName = focused ? 'settings' : 'settings-outline';
              } else {
                iconName = 'home-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#8B5CF6',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#1F2937',
              borderTopColor: '#374151',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Workouts' }} />
          <Tab.Screen name="Training Log" component={TrainingLogScreen} />
          <Tab.Screen name="Progress" component={ProgressScreen} />
          <Tab.Screen name="Setup" component={SetupScreen} options={{ title: 'Workout Setup' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}
