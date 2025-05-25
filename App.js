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
import WaiterTablesScreen from './src/screens/WaiterTablesScreen';
import WaiterMenuScreen from './src/screens/WaiterMenuScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#3498db" />
  </View>
);

// Admin Stack Navigator
const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Admin" component={AdminScreen} />
    <Stack.Screen name="Chef" component={ChefScreen} />
  </Stack.Navigator>
);

// Waiter Stack Navigator
const WaiterStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tables" component={WaiterTablesScreen} />
    <Stack.Screen name="Menu" component={WaiterMenuScreen} />
  </Stack.Navigator>
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
              <Stack.Screen name="AdminTabs" component={AdminStack} />
            ) : (
              <Stack.Screen name="WaiterTabs" component={WaiterStack} />
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
