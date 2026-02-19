import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ChordsScreen } from './src/screens/ChordsScreen';
import { ScalesScreen } from './src/screens/ScalesScreen';
import { ProgressionsScreen } from './src/screens/ProgressionsScreen';
import { TriadsScreen } from './src/screens/TriadsScreen';
import { ArpeggiosScreen } from './src/screens/ArpeggiosScreen';
import { Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

function TabIcon({ label, focused, color }: { label: string; focused: boolean; color: string }) {
  return (
    <Text style={[styles.tabLabel, { color }]}>
      {label}
    </Text>
  );
}

function AppNavigator() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.bgSecondary,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
            },
            tabBarActiveTintColor: theme.accent,
            tabBarInactiveTintColor: theme.textMuted,
          }}
        >
          <Tab.Screen
            name="Chords"
            component={ChordsScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon label="♫" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Scales"
            component={ScalesScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon label="♪" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Progressions"
            component={ProgressionsScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon label="⟳" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Triads"
            component={TriadsScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon label="⋮" focused={focused} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Arpeggios"
            component={ArpeggiosScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <TabIcon label="∿" focused={focused} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 20,
  },
});
