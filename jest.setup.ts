// jest.setup.ts — React Native mocks for component testing

jest.mock('react-native', () => {
  const React = require('react');
  const mockComponent = (name: string) => {
    const Component = ({ children, ...props }: any) =>
      React.createElement(name, props, children);
    Component.displayName = name;
    return Component;
  };
  return {
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    StyleSheet: {
      create: (styles: any) => styles,
    },
    useColorScheme: () => 'dark',
    Platform: { OS: 'ios', select: (obj: any) => obj.ios },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    useWindowDimensions: () => ({ width: 375, height: 812, scale: 1, fontScale: 1 }),
  };
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const mockComponent = (name: string) => {
    return ({ children, ...props }: any) =>
      React.createElement(name, props, children);
  };
  return {
    __esModule: true,
    default: mockComponent('Svg'),
    Svg: mockComponent('Svg'),
    Rect: mockComponent('Rect'),
    Line: mockComponent('Line'),
    Circle: mockComponent('Circle'),
    Text: mockComponent('SvgText'),
    G: mockComponent('G'),
    Defs: mockComponent('Defs'),
    LinearGradient: mockComponent('LinearGradient'),
    Stop: mockComponent('Stop'),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement('SafeAreaView', props, children),
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

jest.mock('./src/theme/ThemeContext', () => {
  const { darkTheme } = require('./src/theme/colors');
  return {
    useTheme: () => ({
      theme: darkTheme,
      isDark: true,
      toggleTheme: jest.fn(),
      useFlats: false,
      toggleFlats: jest.fn(),
      isLeftHanded: false,
      toggleLeftHanded: jest.fn(),
      capo: 0,
      setCapo: jest.fn(),
    }),
    ThemeProvider: ({ children }: any) => children,
  };
});
