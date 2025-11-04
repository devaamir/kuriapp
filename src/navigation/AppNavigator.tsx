import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { GroupDetailsScreen } from '../screens/GroupDetailsScreen';
import { CreateKuriScreen } from '../screens/CreateKuriScreen';
import { SpinWheelScreen } from '../screens/SpinWheelScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import {
  HomeIcon,
  ChartIcon,
  NotificationIcon,
  AvatarIcon,
} from '../components/TabIcons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const iconSize = 24;
        const iconColor = focused ? Colors.primary : Colors.gray400;
        
        if (route.name === 'Home') {
          return (
            <HomeIcon
              width={iconSize}
              height={iconSize}
              fill={iconColor}
            />
          );
        } else if (route.name === 'Analytics') {
          return (
            <ChartIcon
              width={iconSize}
              height={iconSize}
              fill={iconColor}
            />
          );
        } else if (route.name === 'Notifications') {
          return (
            <NotificationIcon
              width={iconSize}
              height={iconSize}
              fill={iconColor}
            />
          );
        } else if (route.name === 'Profile') {
          return (
            <AvatarIcon
              width={iconSize}
              height={iconSize}
              fill={iconColor}
            />
          );
        }
        return null;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray400,
      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: Colors.gray100,
        elevation: 8,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        paddingBottom: Spacing.md,
        paddingTop: Spacing.sm,
        height: 70,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
      },
      tabBarLabelStyle: {
        ...Typography.caption,
        fontWeight: '600',
        marginTop: 4,
      },
      tabBarItemStyle: {
        paddingVertical: Spacing.xs,
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Analytics" 
      component={AnalyticsScreen}
      options={{ tabBarLabel: 'Analytics' }}
    />
    <Tab.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ tabBarLabel: 'Alerts' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStack}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: Colors.gray50 },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="GroupDetails" 
          component={GroupDetailsScreen}
          options={{
            presentation: 'card',
            animationTypeForReplace: 'push',
          }}
        />
        <Stack.Screen 
          name="CreateKuri" 
          component={CreateKuriScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="SpinWheel" 
          component={SpinWheelScreen}
          options={{
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
