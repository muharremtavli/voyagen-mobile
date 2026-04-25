/**
 * VoyaGen — Loading Spinner Component
 */

import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import COLORS from '../theme/colors';

const LoadingSpinner = ({ message = 'Yükleniyor...' }) => {
  return (
    <View style={{
      flex: 1,
      backgroundColor: COLORS.bg,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={{
        color: COLORS.muted,
        marginTop: 12,
        fontSize: 14,
      }}>
        {message}
      </Text>
    </View>
  );
};

export default LoadingSpinner;
