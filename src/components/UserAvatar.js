/**
 * VoyaGen — UserAvatar Component
 *
 * Circular avatar image with fallback initials.
 */

import React from 'react';
import { View, Image, Text } from 'react-native';
import COLORS from '../theme/colors';

const UserAvatar = ({ uri, name = '', size = 44 }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS.surface,
        }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.accent,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontSize: size * 0.38,
          fontWeight: '700',
        }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
};

export default UserAvatar;
