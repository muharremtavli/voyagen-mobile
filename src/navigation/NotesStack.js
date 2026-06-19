/**
 * VoyaGen — Smart Notes Stack Navigator
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SmartNotesScreen from '../screens/SmartNotesScreen';
import { useTheme } from '../contexts/ThemeContext';

import RouteDetailScreen from '../screens/RouteDetailScreen';

const Stack = createNativeStackNavigator();

const NotesStack = () => {
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
      <Stack.Screen
        name="SmartNotesMain"
        component={SmartNotesScreen}
        options={{ title: '📚 Akıllı Notlar' }}
      />
      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={({ route }) => ({
          title: route.params?.title || 'Rota Detayı',
        })}
      />
    </Stack.Navigator>
  );
};

export default NotesStack;
