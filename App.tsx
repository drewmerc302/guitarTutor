[34mimport[39;49;00m[37m [39;49;00m[04m[36mReact[39;49;00m,[37m [39;49;00m{ useState } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33mreact[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ StatusBar } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33mexpo-status-bar[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ NavigationContainer } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m@react-navigation/native[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ createBottomTabNavigator } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m@react-navigation/bottom-tabs[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ SafeAreaProvider } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33mreact-native-safe-area-context[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ useWindowDimensions, Modal, ScrollView } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33mreact-native[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ThemeProvider, useTheme } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/theme/ThemeContext[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ChordsScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/ChordsScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ScalesScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/ScalesScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ProgressionsScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/ProgressionsScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ TriadsScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/TriadsScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ArpeggiosScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/ArpeggiosScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ GlossaryScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/GlossaryScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ SettingsScreen } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/screens/SettingsScreen[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ TouchableOpacity, Text, View, StyleSheet } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33mreact-native[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m[04m[36mMaterialCommunityIcons[39;49;00m [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m@expo/vector-icons/MaterialCommunityIcons[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ ErrorBoundary } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/components[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[34mimport[39;49;00m[37m [39;49;00m{ PALETTE_NAMES, PALETTES, PaletteName } [34mfrom[39;49;00m[37m [39;49;00m[33m'[39;49;00m[33m./src/theme/colors[39;49;00m[33m'[39;49;00m;[37m[39;49;00m
[37m[39;49;00m
const Tab = createBottomTabNavigator();[37m[39;49;00m
[37m[39;49;00m
const withErrorBoundary = (Screen: React.ComponentType, label: string) =>[37m[39;49;00m
  function WrappedScreen() {[37m[39;49;00m
    [34mreturn[39;49;00m ([37m[39;49;00m
      <ErrorBoundary fallbackLabel={label}>[37m[39;49;00m
        <Screen />[37m[39;49;00m
      </ErrorBoundary>[37m[39;49;00m
    );[37m[39;49;00m
  };[37m[39;49;00m
[37m[39;49;00m
/** Thin horizontal strip shown above the tab bar [34mfor[39;49;00m switching palettes. */[37m[39;49;00m
function PaletteSwitcher() {[37m[39;49;00m
  const { theme, isDark, palette, setPalette } = useTheme();[37m[39;49;00m
[37m[39;49;00m
  [34mreturn[39;49;00m ([37m[39;49;00m
    <View style={[paletteSwitcherStyles.container, { backgroundColor: theme.bgSecondary, borderTopColor: theme.border }]}>[37m[39;49;00m
      <Text style={[paletteSwitcherStyles.label, { color: theme.textMuted }]}>PALETTE</Text>[37m[39;49;00m
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={paletteSwitcherStyles.row}>[37m[39;49;00m
        {PALETTE_NAMES.map((name) => {[37m[39;49;00m
          const isActive = name === palette;[37m[39;49;00m
          const accentColor = isDark [04m[91m?[39;49;00m PALETTES[name].dark.accent : PALETTES[name].light.accent;[37m[39;49;00m
          [34mreturn[39;49;00m ([37m[39;49;00m
            <TouchableOpacity[37m[39;49;00m
              key={name}[37m[39;49;00m
              onPress={() => setPalette(name [34mas[39;49;00m PaletteName)}[37m[39;49;00m
              style={[[37m[39;49;00m
                paletteSwitcherStyles.chip,[37m[39;49;00m
                {[37m[39;49;00m
                  backgroundColor: isActive [04m[91m?[39;49;00m theme.bgElevated : theme.bgTertiary,[37m[39;49;00m
                  borderColor: isActive [04m[91m?[39;49;00m theme.accent : theme.border,[37m[39;49;00m
                },[37m[39;49;00m
              ]}[37m[39;49;00m
              accessibilityRole=[33m"[39;49;00m[33mbutton[39;49;00m[33m"[39;49;00m[37m[39;49;00m
              accessibilityLabel={[04m[91m`[39;49;00mSwitch to [04m[91m$[39;49;00m{name} palette[04m[91m`[39;49;00m}[37m[39;49;00m
            >[37m[39;49;00m
              <View style={[paletteSwitcherStyles.swatch, { backgroundColor: accentColor }]} />[37m[39;49;00m
              <Text style={[paletteSwitcherStyles.chipText, { color: isActive [04m[91m?[39;49;00m theme.textPrimary : theme.textSecondary }]}>[37m[39;49;00m
                {name}[37m[39;49;00m
              </Text>[37m[39;49;00m
            </TouchableOpacity>[37m[39;49;00m
          );[37m[39;49;00m
        })}[37m[39;49;00m
      </ScrollView>[37m[39;49;00m
    </View>[37m[39;49;00m
  );[37m[39;49;00m
}[37m[39;49;00m
[37m[39;49;00m
function AppNavigator() {[37m[39;49;00m
  const { theme, isDark } = useTheme();[37m[39;49;00m
  const { width } = useWindowDimensions();[37m[39;49;00m
  const isCompact = width < [34m380[39;49;00m;[37m[39;49;00m
  const [glossaryVisible, setGlossaryVisible] = useState(false);[37m[39;49;00m
  const [settingsVisible, setSettingsVisible] = useState(false);[37m[39;49;00m
[37m[39;49;00m
  [34mreturn[39;49;00m ([37m[39;49;00m
    <>[37m[39;49;00m
      <StatusBar style={isDark [04m[91m?[39;49;00m [33m'[39;49;00m[33mlight[39;49;00m[33m'[39;49;00m : [33m'[39;49;00m[33mdark[39;49;00m[33m'[39;49;00m} />[37m[39;49;00m
      <NavigationContainer>[37m[39;49;00m
        <Tab.Navigator[37m[39;49;00m
          screenOptions={{[37m[39;49;00m
            headerShown: true,[37m[39;49;00m
            headerStyle: {[37m[39;49;00m
              backgroundColor: theme.bgSecondary,[37m[39;49;00m
              borderBottomWidth: [34m1[39;49;00m,[37m[39;49;00m
              borderBottomColor: theme.border,[37m[39;49;00m
            },[37m[39;49;00m
            headerTitleAlign: [33m'[39;49;00m[33mleft[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
            headerTitle: () => ([37m[39;49;00m
              <Text style={[styles.headerTitle, { color: theme.accent }]} numberOfLines={[34m1[39;49;00m}>[37m[39;49;00m
                {isCompact [04m[91m?[39;49;00m [33m'[39;49;00m[33mGT[39;49;00m[33m'[39;49;00m : [33m'[39;49;00m[33mGUITAR TUTOR[39;49;00m[33m'[39;49;00m}[37m[39;49;00m
              </Text>[37m[39;49;00m
            ),[37m[39;49;00m
            headerRight: () => ([37m[39;49;00m
              <View style={styles.headerButtons}>[37m[39;49;00m
                <TouchableOpacity[37m[39;49;00m
                  onPress={() => setGlossaryVisible(true)}[37m[39;49;00m
                  style={styles.headerBtn}[37m[39;49;00m
                  accessibilityRole=[33m"[39;49;00m[33mbutton[39;49;00m[33m"[39;49;00m[37m[39;49;00m
                  accessibilityLabel=[33m"[39;49;00m[33mOpen glossary[39;49;00m[33m"[39;49;00m[37m[39;49;00m
                >[37m[39;49;00m
                  <MaterialCommunityIcons name=[33m"[39;49;00m[33mbook-open-variant[39;49;00m[33m"[39;49;00m size={[34m20[39;49;00m} color={theme.textMuted} />[37m[39;49;00m
                </TouchableOpacity>[37m[39;49;00m
                <TouchableOpacity[37m[39;49;00m
                  onPress={() => setSettingsVisible(true)}[37m[39;49;00m
                  style={styles.headerBtn}[37m[39;49;00m
                  accessibilityRole=[33m"[39;49;00m[33mbutton[39;49;00m[33m"[39;49;00m[37m[39;49;00m
                  accessibilityLabel=[33m"[39;49;00m[33mOpen settings[39;49;00m[33m"[39;49;00m[37m[39;49;00m
                >[37m[39;49;00m
                  <MaterialCommunityIcons name=[33m"[39;49;00m[33mcog-outline[39;49;00m[33m"[39;49;00m size={[34m20[39;49;00m} color={theme.textMuted} />[37m[39;49;00m
                </TouchableOpacity>[37m[39;49;00m
              </View>[37m[39;49;00m
            ),[37m[39;49;00m
            headerTintColor: theme.accent,[37m[39;49;00m
            tabBarShowLabel: true,[37m[39;49;00m
            tabBarStyle: {[37m[39;49;00m
              backgroundColor: theme.bgSecondary,[37m[39;49;00m
              borderTopColor: theme.border,[37m[39;49;00m
              borderTopWidth: [34m1[39;49;00m,[37m[39;49;00m
              height: [34m80[39;49;00m,[37m[39;49;00m
              paddingBottom: [34m20[39;49;00m,[37m[39;49;00m
              paddingTop: [34m10[39;49;00m,[37m[39;49;00m
            },[37m[39;49;00m
            tabBarActiveTintColor: theme.accent,[37m[39;49;00m
            tabBarInactiveTintColor: theme.textMuted,[37m[39;49;00m
          }}[37m[39;49;00m
        >[37m[39;49;00m
          <Tab.Screen[37m[39;49;00m
            name=[33m"[39;49;00m[33mChords[39;49;00m[33m"[39;49;00m[37m[39;49;00m
            component={withErrorBoundary(ChordsScreen, [33m'[39;49;00m[33mChords[39;49;00m[33m'[39;49;00m)}[37m[39;49;00m
            options={{[37m[39;49;00m
              tabBarIcon: ({ color, size }) => ([37m[39;49;00m
                <MaterialCommunityIcons name=[33m"[39;49;00m[33mguitar-acoustic[39;49;00m[33m"[39;49;00m size={size} color={color} />[37m[39;49;00m
              ),[37m[39;49;00m
            }}[37m[39;49;00m
          />[37m[39;49;00m
          <Tab.Screen[37m[39;49;00m
            name=[33m"[39;49;00m[33mScales[39;49;00m[33m"[39;49;00m[37m[39;49;00m
            component={withErrorBoundary(ScalesScreen, [33m'[39;49;00m[33mScales[39;49;00m[33m'[39;49;00m)}[37m[39;49;00m
            options={{[37m[39;49;00m
              tabBarIcon: ({ color, size }) => ([37m[39;49;00m
                <MaterialCommunityIcons name=[33m"[39;49;00m[33mmusic-note-eighth[39;49;00m[33m"[39;49;00m size={size} color={color} />[37m[39;49;00m
              ),[37m[39;49;00m
            }}[37m[39;49;00m
          />[37m[39;49;00m
          <Tab.Screen[37m[39;49;00m
            name=[33m"[39;49;00m[33mProgressions[39;49;00m[33m"[39;49;00m[37m[39;49;00m
            component={withErrorBoundary(ProgressionsScreen, [33m'[39;49;00m[33mProgressions[39;49;00m[33m'[39;49;00m)}[37m[39;49;00m
            options={{[37m[39;49;00m
              tabBarIcon: ({ color, size }) => ([37m[39;49;00m
                <MaterialCommunityIcons name=[33m"[39;49;00m[33mmusic-note-plus[39;49;00m[33m"[39;49;00m size={size} color={color} />[37m[39;49;00m
              ),[37m[39;49;00m
            }}[37m[39;49;00m
          />[37m[39;49;00m
          <Tab.Screen[37m[39;49;00m
            name=[33m"[39;49;00m[33mArpeggios[39;49;00m[33m"[39;49;00m[37m[39;49;00m
            component={withErrorBoundary(ArpeggiosScreen, [33m'[39;49;00m[33mArpeggios[39;49;00m[33m'[39;49;00m)}[37m[39;49;00m
            options={{[37m[39;49;00m
              tabBarIcon: ({ color, size }) => ([37m[39;49;00m
                <MaterialCommunityIcons name=[33m"[39;49;00m[33mmusic[39;49;00m[33m"[39;49;00m size={size} color={color} />[37m[39;49;00m
              ),[37m[39;49;00m
            }}[37m[39;49;00m
          />[37m[39;49;00m
          <Tab.Screen[37m[39;49;00m
            name=[33m"[39;49;00m[33mTriads[39;49;00m[33m"[39;49;00m[37m[39;49;00m
            component={withErrorBoundary(TriadsScreen, [33m'[39;49;00m[33mTriads[39;49;00m[33m'[39;49;00m)}[37m[39;49;00m
            options={{[37m[39;49;00m
              tabBarIcon: ({ color, size }) => ([37m[39;49;00m
                <MaterialCommunityIcons name=[33m"[39;49;00m[33mtriangle-outline[39;49;00m[33m"[39;49;00m size={size} color={color} />[37m[39;49;00m
              ),[37m[39;49;00m
            }}[37m[39;49;00m
          />[37m[39;49;00m
        </Tab.Navigator>[37m[39;49;00m
      </NavigationContainer>[37m[39;49;00m
[37m[39;49;00m
      {/* Palette switcher [04m[91m—[39;49;00m dev-only, floats above the tab bar */}[37m[39;49;00m
      <PaletteSwitcher />[37m[39;49;00m
[37m[39;49;00m
      <Modal[37m[39;49;00m
        visible={glossaryVisible}[37m[39;49;00m
        animationType=[33m"[39;49;00m[33mslide[39;49;00m[33m"[39;49;00m[37m[39;49;00m
        presentationStyle=[33m"[39;49;00m[33mpageSheet[39;49;00m[33m"[39;49;00m[37m[39;49;00m
        onRequestClose={() => setGlossaryVisible(false)}[37m[39;49;00m
      >[37m[39;49;00m
        <GlossaryScreen onClose={() => setGlossaryVisible(false)} />[37m[39;49;00m
      </Modal>[37m[39;49;00m
[37m[39;49;00m
      <Modal[37m[39;49;00m
        visible={settingsVisible}[37m[39;49;00m
        animationType=[33m"[39;49;00m[33mslide[39;49;00m[33m"[39;49;00m[37m[39;49;00m
        presentationStyle=[33m"[39;49;00m[33mpageSheet[39;49;00m[33m"[39;49;00m[37m[39;49;00m
        onRequestClose={() => setSettingsVisible(false)}[37m[39;49;00m
      >[37m[39;49;00m
        <SettingsScreen[37m[39;49;00m
          onClose={() => setSettingsVisible(false)}[37m[39;49;00m
          onOpenGlossary={() => {[37m[39;49;00m
            setSettingsVisible(false);[37m[39;49;00m
            setGlossaryVisible(true);[37m[39;49;00m
          }}[37m[39;49;00m
        />[37m[39;49;00m
      </Modal>[37m[39;49;00m
    </>[37m[39;49;00m
  );[37m[39;49;00m
}[37m[39;49;00m
[37m[39;49;00m
export default function App() {[37m[39;49;00m
  [34mreturn[39;49;00m ([37m[39;49;00m
    <SafeAreaProvider>[37m[39;49;00m
      <ThemeProvider>[37m[39;49;00m
        <AppNavigator />[37m[39;49;00m
      </ThemeProvider>[37m[39;49;00m
    </SafeAreaProvider>[37m[39;49;00m
  );[37m[39;49;00m
}[37m[39;49;00m
[37m[39;49;00m
const styles = StyleSheet.create({[37m[39;49;00m
  headerTitle: {[37m[39;49;00m
    letterSpacing: [34m2[39;49;00m,[37m[39;49;00m
    textTransform: [33m'[39;49;00m[33muppercase[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    fontWeight: [33m'[39;49;00m[33m600[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    fontSize: [34m15[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  headerButtons: {[37m[39;49;00m
    flexDirection: [33m'[39;49;00m[33mrow[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    alignItems: [33m'[39;49;00m[33mcenter[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    marginRight: [34m4[39;49;00m,[37m[39;49;00m
    gap: [34m0[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  headerBtn: {[37m[39;49;00m
    padding: [34m8[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  headerBtnText: {[37m[39;49;00m
    fontSize: [34m20[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
});[37m[39;49;00m
[37m[39;49;00m
const paletteSwitcherStyles = StyleSheet.create({[37m[39;49;00m
  container: {[37m[39;49;00m
    position: [33m'[39;49;00m[33mabsolute[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    bottom: [34m80[39;49;00m,           // sits just above the tab bar[37m[39;49;00m
    left: [34m0[39;49;00m,[37m[39;49;00m
    right: [34m0[39;49;00m,[37m[39;49;00m
    flexDirection: [33m'[39;49;00m[33mrow[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    alignItems: [33m'[39;49;00m[33mcenter[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    paddingVertical: [34m6[39;49;00m,[37m[39;49;00m
    paddingHorizontal: [34m8[39;49;00m,[37m[39;49;00m
    borderTopWidth: StyleSheet.hairlineWidth,[37m[39;49;00m
    zIndex: [34m100[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  label: {[37m[39;49;00m
    fontSize: [34m9[39;49;00m,[37m[39;49;00m
    fontWeight: [33m'[39;49;00m[33m700[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    letterSpacing: [34m1[39;49;00m,[37m[39;49;00m
    marginRight: [34m8[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  row: {[37m[39;49;00m
    flexDirection: [33m'[39;49;00m[33mrow[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    gap: [34m6[39;49;00m,[37m[39;49;00m
    alignItems: [33m'[39;49;00m[33mcenter[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  chip: {[37m[39;49;00m
    flexDirection: [33m'[39;49;00m[33mrow[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    alignItems: [33m'[39;49;00m[33mcenter[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
    gap: [34m5[39;49;00m,[37m[39;49;00m
    paddingHorizontal: [34m8[39;49;00m,[37m[39;49;00m
    paddingVertical: [34m4[39;49;00m,[37m[39;49;00m
    borderRadius: [34m12[39;49;00m,[37m[39;49;00m
    borderWidth: [34m1[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  swatch: {[37m[39;49;00m
    width: [34m8[39;49;00m,[37m[39;49;00m
    height: [34m8[39;49;00m,[37m[39;49;00m
    borderRadius: [34m4[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
  chipText: {[37m[39;49;00m
    fontSize: [34m11[39;49;00m,[37m[39;49;00m
    fontWeight: [33m'[39;49;00m[33m600[39;49;00m[33m'[39;49;00m,[37m[39;49;00m
  },[37m[39;49;00m
});[37m[39;49;00m
