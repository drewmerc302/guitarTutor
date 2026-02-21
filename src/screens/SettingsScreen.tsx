// src/screens/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { SegmentedControl } from '../components/SegmentedControl';

interface SettingsScreenProps {
  onClose: () => void;
  onOpenGlossary: () => void;
}

export function SettingsScreen({ onClose, onOpenGlossary }: SettingsScreenProps) {
  const { theme, isDark, toggleTheme, useFlats, toggleFlats, isLeftHanded, toggleLeftHanded, capo, setCapo } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close settings">
          <MaterialCommunityIcons name="close" size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>DISPLAY</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Note names</Text>
            <SegmentedControl
              options={["♯", "♭"]}
              activeOption={useFlats ? "♭" : "♯"}
              onSelect={(opt) => { if ((opt === "♭") !== useFlats) toggleFlats(); }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Hand</Text>
            <SegmentedControl
              options={["Right-handed", "Left-handed"]}
              activeOption={isLeftHanded ? "Left-handed" : "Right-handed"}
              onSelect={(opt) => { if ((opt === "Left-handed") !== isLeftHanded) toggleLeftHanded(); }}
            />
          </View>
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Theme</Text>
            <SegmentedControl
              options={["Light", "Dark"]}
              activeOption={isDark ? "Dark" : "Light"}
              onSelect={(opt) => { if ((opt === "Dark") !== isDark) toggleTheme(); }}
            />
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>PLAYBACK</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Capo</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => setCapo(Math.max(0, capo - 1))}
                style={styles.stepperBtn}
                accessibilityLabel="Decrease capo"
              >
                <Text style={[styles.stepperText, { color: theme.textSecondary }]}>{"−"}</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: capo > 0 ? theme.accent : theme.textMuted }]}>
                {capo} frets
              </Text>
              <TouchableOpacity
                onPress={() => setCapo(Math.min(7, capo + 1))}
                style={styles.stepperBtn}
                accessibilityLabel="Increase capo"
              >
                <Text style={[styles.stepperText, { color: theme.textSecondary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
          <TouchableOpacity style={styles.row} onPress={onOpenGlossary} accessibilityRole="button">
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Glossary</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 28, fontWeight: "700" },
  closeBtn: { padding: 4 },
  content: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 6,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 15 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepperBtn: { padding: 8 },
  stepperText: { fontSize: 18, fontWeight: "600" },
  stepperValue: { fontSize: 15, minWidth: 60, textAlign: "center" },
});
