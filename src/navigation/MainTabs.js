/**
 * VoyaGen — Main Bottom Tabs Navigator
 * Premium tab bar with travel-themed icons and glow effects.
 */
import React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import AIStack from './AIStack';
import NotesStack from './NotesStack';
import ProfileStack from './ProfileStack';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

// Custom middle button component (Search bar shape, 3D look)
const ExploreCustomButton = ({ children, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={{
        top: -15,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 70,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 3,
          borderColor: colors.bg,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
            },
            android: {
              elevation: 8,
            },
            web: {
              boxShadow: `0 4px 12px ${colors.primary}80`,
            }
          })
        }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};

const MainTabs = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false, // Removed labels under icons
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 10,
          left: 15,
          right: 15,
          elevation: 10,
          borderRadius: 25,
          height: 65,
          paddingBottom: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            web: {
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
              position: 'fixed'
            }
          })
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Explore') {
            // Middle button is special
            return <Ionicons name="search" size={24} color={colors.card} />;
          }
          
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'AIRoute') iconName = focused ? 'sparkles' : 'sparkles-outline';
          else if (route.name === 'SmartNotes') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              ...(focused ? {
                backgroundColor: colors.primaryGlow,
                borderRadius: 20,
              } : {}),
            }}>
              <Ionicons name={iconName} size={24} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="AIRoute" component={AIStack} />
      <Tab.Screen 
        name="Explore" 
        component={ExploreStack} 
        options={{
          tabBarButton: (props) => <ExploreCustomButton {...props} />
        }}
      />
      <Tab.Screen name="SmartNotes" component={NotesStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default MainTabs;
