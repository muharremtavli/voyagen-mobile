/**
 * VoyaGen — Explore Stack Navigator
 * ExploreScreen -> UserProfileScreen | LocationDetailScreen
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExploreScreen from '../screens/ExploreScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import LocationDetailScreen from '../screens/LocationDetailScreen';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const ExploreStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'transparent' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="ExploreMain" component={ExploreScreen} options={{ title: '🧭 Keşfet' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: '👤 Profil' }} />
      <Stack.Screen
        name="LocationDetail"
        component={LocationDetailScreen}
        options={({ route }) => ({
          title: `📍 ${route.params?.locationName || 'Mekan Detayı'}`,
          headerTitleStyle: { fontWeight: '800', fontSize: 15 },
        })}
      />
      <Stack.Screen
        name="PostDetail"
        component={require('../screens/PostDetailScreen').default}
        options={{ title: 'Gönderi' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={require('../screens/ChatScreen').default}
        options={{ title: 'Sohbet' }}
      />
    </Stack.Navigator>
  );
};

export default ExploreStack;
