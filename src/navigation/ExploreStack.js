/**
 * VoyaGen — Explore Stack Navigator
 * ExploreScreen -> UserProfileScreen
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import COLORS from '../theme/colors';

const Stack = createNativeStackNavigator();

const ExploreStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.card },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '700' },
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen name="ExploreMain" component={ExploreScreen} options={{ title: 'Keşfet' }} />
    <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profil' }} />
  </Stack.Navigator>
);

export default ExploreStack;
