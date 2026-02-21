import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useWindowDimensions, Modal } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ChordsScreen } from './src/screens/ChordsScreen';
import { ScalesScreen } from './src/screens/ScalesScreen';
import { ProgressionsScreen } from './src/screens/ProgressionsScreen';
import { TriadsScreen } from './src/screens/TriadsScreen';
import { ArpeggiosScreen } from './src/screens/ArpeggiosScreen';
import { GlossaryScreen } from './src/screens/GlossaryScreen';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ErrorBoundary } from './src/components';

const Tab = createBottomTabNavigator();

const withErrorBoundary = (Screen: React.ComponentType, label: string) =>
  function WrappedScreen() {
    return (
      <ErrorBoundary fallbackLabel={label}>
        <Screen />
      </ErrorBoundary>
    );
  };

function AppNavigator() {
  const { theme, isDark, toggleTheme, useFlats, toggleFlats, isLeftHanded, toggleLeftHanded, capo, setCapo } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const [glossaryVisible, setGlossaryVisible] = useState(false);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.bgSecondary,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            },
            headerTitleAlign: 'left',
            headerTitle: () => (
              <Text style={[styles.headerTitle, { color: theme.accent }]} numberOfLines={1}>
                {isCompact ? 'GT' : 'GUITAR TUTOR'}
              </Text>
            ),
            headerRight: () => (
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  onPress={() => setGlossaryVisible(true)}
                  style={styles.headerBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Open glossary"
                >
                  <MaterialCommunityIcons
                    name="book-open-variant"
                    size={20}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleLeftHanded}
                  style={styles.headerBtn}
                  accessibilityRole="button"
                  accessibilityLabel={isLeftHanded ? 'Switch to right-handed' : 'Switch to left-handed'}
                >
                  <Text style={[styles.headerBtnText, { color: isLeftHanded ? theme.accent : theme.textMuted, fontSize: 14 }]}>
                    LH
                  </Text>
                </TouchableOpacity>
                <View style={styles.capoControl}>
                  <TouchableOpacity
                    onPress={() => setCapo(Math.max(0, capo - 1))}
                    style={styles.capoBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease capo"
                  >
                    <Text style={[styles.capoBtnText, { color: theme.textSecondary }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.capoLabel, { color: capo > 0 ? theme.accent : theme.textMuted }]}>
                    {capo > 0 ? `Capo ${capo}` : 'Capo'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCapo(Math.min(7, capo + 1))}
                    style={styles.capoBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Increase capo"
                  >
                    <Text style={[styles.capoBtnText, { color: theme.textSecondary }]}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={toggleFlats}
                  style={styles.headerBtn}
                  accessibilityRole="button"
                  accessibilityLabel={useFlats ? 'Switch to sharps' : 'Switch to flats'}
                >
                  <Text style={[styles.headerBtnText, { color: useFlats ? theme.accent : theme.textMuted }]}>
                    {useFlats ? '♭' : '♯'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={styles.headerBtn}
                  accessibilityRole="button"
                  accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <Text style={[styles.headerBtnText, { color: theme.accent }]}>
                    {isDark ? '☀' : '☾'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
            headerTintColor: theme.accent,
            tabBarShowLabel: true,
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
            component={withErrorBoundary(ChordsScreen, 'Chords')}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="guitar-acoustic" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Scales"
            component={withErrorBoundary(ScalesScreen, 'Scales')}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="music-note-eighth" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Progressions"
            component={withErrorBoundary(ProgressionsScreen, 'Progressions')}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="music-note-plus" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Triads"
            component={withErrorBoundary(TriadsScreen, 'Triads')}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="triangle-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Arpeggios"
            component={withErrorBoundary(ArpeggiosScreen, 'Arpeggios')}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="music" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      <Modal
        visible={glossaryVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setGlossaryVisible(false)}
      >
        <GlossaryScreen onClose={() => setGlossaryVisible(false)} />
      </Modal>
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
  headerTitle: {
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    gap: 0,
  },
  headerBtn: {
    padding: 8,
  },
  headerBtnText: {
    fontSize: 20,
  },
  capoControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  capoBtn: {
    padding: 8,
  },
  capoBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  capoLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 46,
    textAlign: 'center',
  },
});
