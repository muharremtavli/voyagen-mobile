/**
 * VoyaGen — Loading Spinner Component
 * Premium loading screen with travel animation.
 */

import React, { useRef, useEffect } from 'react';
import { View, ActivityIndicator, Text, Animated } from 'react-native';
import COLORS from '../theme/colors';

const LoadingSpinner = ({ message = 'Yükleniyor...' }) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Animated.Text style={{ fontSize: 56, marginBottom: 20, transform: [{ scale: pulseAnim }] }}>
        ✈️
      </Animated.Text>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{
        color: COLORS.mutedLight,
        marginTop: 16,
        fontSize: 15,
        fontWeight: '500',
      }}>
        {message}
      </Text>
    </View>
  );
};

export default LoadingSpinner;
