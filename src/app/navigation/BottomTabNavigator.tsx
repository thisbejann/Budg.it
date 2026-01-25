import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  Home,
  Receipt,
  Wallet,
  Settings,
  Plus,
} from 'lucide-react-native';
import type { MainTabParamList } from '../../types/navigation';
import { COLORS, GLASS } from '../../constants/colors';
import { useTheme } from '../../hooks/useColorScheme';

// Import screens
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { TransactionsScreen } from '../../features/transactions/screens/TransactionsScreen';
import { AccountsScreen } from '../../features/accounts/screens/AccountsScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const shouldUseFallback = () => {
  return Platform.OS === 'android' && Platform.Version < 31;
};

interface TabIconProps {
  focused: boolean;
  icon: React.ReactNode;
}

function AnimatedTabIcon({ focused, icon }: TabIconProps) {
  const scale = useSharedValue(focused ? 1.1 : 1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, { damping: 15, stiffness: 300 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {icon}
    </Animated.View>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, glass, colors } = useTheme();
  const useFallback = shouldUseFallback();

  const fabScale = useSharedValue(1);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPress = () => {
    fabScale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      fabScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      navigation.navigate('AddTransaction' as any);
    }, 100);
  };

  const renderTabBarContent = () => (
    <View style={styles.tabBarInner}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // Insert FAB in the middle
        const showFabBefore = index === 2;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const getIcon = () => {
          const color = isFocused ? colors.primary : colors.mutedForeground;
          const size = 24;

          switch (route.name) {
            case 'Home':
              return <Home size={size} color={color} />;
            case 'Transactions':
              return <Receipt size={size} color={color} />;
            case 'Accounts':
              return <Wallet size={size} color={color} />;
            case 'Settings':
              return <Settings size={size} color={color} />;
            default:
              return null;
          }
        };

        return (
          <React.Fragment key={route.key}>
            {showFabBefore && (
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={handleFabPress}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.fab, fabAnimatedStyle]}>
                  <Plus size={28} color="#fff" strokeWidth={2.5} />
                </Animated.View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <AnimatedTabIcon
                focused={isFocused}
                icon={getIcon()}
              />
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );

  const containerStyle = [
    styles.tabBarContainer,
    { marginBottom: insets.bottom + 8 },
  ];

  if (useFallback) {
    return (
      <View
        style={[
          containerStyle,
          styles.tabBarBackground,
          { backgroundColor: glass.background },
        ]}
      >
        {renderTabBarContent()}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <BlurView
        intensity={isDark ? 60 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.tabBarBackground, styles.blurView]}
      >
        {renderTabBarContent()}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  },
  tabBarBackground: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: GLASS.light.border,
    overflow: 'hidden',
  },
  blurView: {
    borderRadius: 24,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  fabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
