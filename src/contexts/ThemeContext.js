import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, applyTheme } from '../theme/colors';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('monochrome');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [key, setKey] = useState(0); // Used to force re-render AppNavigator

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme') || 'monochrome';
      const savedMode = await AsyncStorage.getItem('appDarkMode');
      const isDark = savedMode === 'true';
      
      setThemeName(savedTheme);
      setIsDarkMode(isDark);
      applyTheme(savedTheme, isDark);
      setKey(prev => prev + 1);
    } catch (e) {
      console.log('Failed to load theme', e);
    }
  };

  const changeTheme = async (newTheme) => {
    try {
      setThemeName(newTheme);
      applyTheme(newTheme, isDarkMode);
      await AsyncStorage.setItem('appTheme', newTheme);
      setKey(prev => prev + 1);
    } catch (e) {
      console.log('Failed to save theme', e);
    }
  };

  const toggleDarkMode = async (value) => {
    try {
      setIsDarkMode(value);
      applyTheme(themeName, value);
      await AsyncStorage.setItem('appDarkMode', value.toString());
      setKey(prev => prev + 1);
    } catch (e) {
      console.log('Failed to save dark mode', e);
    }
  };

  const colors = getThemeColors(themeName, isDarkMode);

  return (
    <ThemeContext.Provider value={{ colors, themeName, isDarkMode, changeTheme, toggleDarkMode, themeKey: key }}>
      {children}
    </ThemeContext.Provider>
  );
};
