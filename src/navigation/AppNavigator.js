/**
 * VoyaGen — App Navigator (Root)
 * Switches between AuthStack and MainTabs based on auth state.
 */
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import LoadingSpinner from '../components/LoadingSpinner';
import AnimatedBackground from '../components/AnimatedBackground';

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="VoyaGen yükleniyor..." />;
  }

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <AnimatedBackground>
      <NavigationContainer theme={navTheme}>
        {isAuthenticated ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </AnimatedBackground>
  );
};

export default AppNavigator;
