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
import { HomeIcon, ChartIcon, NotificationIcon, AvatarIcon } from '../components/TabIcons';

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
        if (route.name === 'Home') {
          return <HomeIcon width={size} height={size} fill={color} opacity={focused ? 1 : 0.6} />;
        } else if (route.name === 'Analytics') {
          return <ChartIcon width={size} height={size} fill={color} opacity={focused ? 1 : 0.6} />;
        } else if (route.name === 'Notifications') {
          return <NotificationIcon width={size} height={size} fill={color} opacity={focused ? 1 : 0.6} />;
        } else if (route.name === 'Profile') {
          return <AvatarIcon width={size} height={size} fill={color} opacity={focused ? 1 : 0.6} />;
        }
        return null;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderTopWidth: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        paddingBottom: 12,
        paddingTop: 12,
        height: 80,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileStack} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen name="CreateKuri" component={CreateKuriScreen} />
        <Stack.Screen name="SpinWheel" component={SpinWheelScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
