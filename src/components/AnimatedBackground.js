import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const AnimatedBackground = ({ children }) => {
  const { colors } = useTheme();
  
  // Using a simple breathing animation by animating the opacity of an inverted gradient over a base gradient
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [fadeAnim]);

  // If gradient colors are not available, fallback to solid colors
  const startColor = colors.gradientStart || colors.bg || '#000';
  const endColor = colors.gradientEnd || colors.bg || '#000';

  return (
    <>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AnimatedLinearGradient
        colors={[endColor, startColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}
      />
      {children}
    </>
  );
};

export default AnimatedBackground;
