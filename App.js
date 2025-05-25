import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/context/AppContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import ChefScreen from './src/screens/ChefScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3498db" />
  </View>
);

// Chef Tabs (for standalone chef panel)
const ChefTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#2c3e50' },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: '#7f8c8d',
    }}
  >
    <Tab.Screen 
      name="Chef" 
      component={ChefScreen} 
      options={{
        tabBarLabel: 'Şef Paneli',
        tabBarIcon: () => null,
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { state } = useApp();

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {state.user.role === 'admin' ? (
              <Stack.Screen name="AdminTabs" component={ChefTabs} />
            ) : (
              <Stack.Screen name="WaiterTabs" component={ChefTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
