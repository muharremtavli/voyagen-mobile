/**
 * VoyaGen — AI Stack Navigator
 * AIRouteScreen -> RouteDetailScreen
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIRouteScreen from '../screens/AIRouteScreen';
import RouteDetailScreen from '../screens/RouteDetailScreen';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const AIStack = () => {
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
        name="AIRouteMain"
        component={AIRouteScreen}
        options={{ title: '🤖 AI Rota Planlayıcı' }}
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

export default AIStack;
