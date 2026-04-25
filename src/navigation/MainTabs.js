/**
 * VoyaGen — Main Bottom Tabs Navigator
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import AIRouteScreen from '../screens/AIRouteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import COLORS from '../theme/colors';

const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
        borderTopWidth: 0.5,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.muted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Explore') iconName = focused ? 'search' : 'search-outline';
        else if (route.name === 'AIRoute') iconName = focused ? 'sparkles' : 'sparkles-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Ana Sayfa' }} />
    <Tab.Screen name="Explore" component={ExploreStack} options={{ tabBarLabel: 'Keşfet' }} />
    <Tab.Screen name="AIRoute" component={AIRouteScreen} options={{ tabBarLabel: 'AI Rota', headerShown: true, headerTitle: 'AI Rota', headerStyle: { backgroundColor: COLORS.card }, headerTintColor: COLORS.text, headerTitleStyle: { fontWeight: '700' } }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil', headerShown: true, headerTitle: 'Profilim', headerStyle: { backgroundColor: COLORS.card }, headerTintColor: COLORS.text, headerTitleStyle: { fontWeight: '700' } }} />
  </Tab.Navigator>
);

export default MainTabs;
