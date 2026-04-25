/**
 * VoyaGen — Home Stack Navigator
 * HomeScreen -> UserProfileScreen
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import COLORS from '../theme/colors';

const Stack = createNativeStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.card },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '700' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ title: 'VoyaGen', headerTitleStyle: { fontWeight: '800', fontSize: 22, color: COLORS.primary } }} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil' }} />
  </Stack.Navigator>
);

export default HomeStack;
