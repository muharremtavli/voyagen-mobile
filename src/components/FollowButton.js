/**
 * VoyaGen — FollowButton Component
 *
 * Premium toggle between Follow and Following states with smooth transition.
 */

import React, { useState, useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Animated, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

const FollowButton = ({ userId, isFollowing: initialFollowing, onToggle }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    try {
      if (isFollowing) {
        await usersApi.unfollowUser(userId);
        setIsFollowing(false);
      } else {
        await usersApi.followUser(userId);
        setIsFollowing(true);
      }
      onToggle?.(!isFollowing);
    } catch (error) {
      console.log('Follow/Unfollow error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 28,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: isFollowing ? 'transparent' : COLORS.primary,
          borderWidth: isFollowing ? 1.5 : 0,
          borderColor: isFollowing ? COLORS.border : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          ...(isFollowing ? {} : (Platform.OS === 'web' ? {
            boxShadow: `0 4px 16px ${COLORS.glow}`,
          } : {
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          })),
        }}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isFollowing ? COLORS.muted : COLORS.black}
          />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={isFollowing ? 'checkmark-circle' : 'person-add-outline'}
              size={18}
              color={isFollowing ? COLORS.mutedLight : COLORS.black}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: isFollowing ? COLORS.mutedLight : COLORS.black,
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FollowButton;
