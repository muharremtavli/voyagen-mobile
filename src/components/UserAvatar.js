/**
 * VoyaGen — UserAvatar Component
 *
 * Circular avatar image with gradient-inspired fallback initials.
 */

import React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import COLORS from '../theme/colors';
import { getImageUrl } from '../api/client';

// Generate a consistent color based on the name
const getAvatarColor = (name) => {
  const colors = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.info, '#EC4899', '#F97316'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserAvatar = ({ uri, name = '', size = 44 }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = getAvatarColor(name);
  const finalUri = getImageUrl(uri);

  if (finalUri) {
    return (
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
      }}>
        <Image
          source={{ uri: finalUri }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.surface,
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        ...(Platform.OS === 'web' ? {
          boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
        } : {
          shadowColor: bgColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }),
      }}
    >
      <Text
        style={{
          color: COLORS.white,
          fontSize: size * 0.36,
          fontWeight: '800',
          letterSpacing: 1,
        }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
};

export default UserAvatar;
