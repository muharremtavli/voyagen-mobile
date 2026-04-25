/**
 * VoyaGen — FollowButton Component
 *
 * Toggle between Follow (outlined) and Following (filled) states.
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

const FollowButton = ({ userId, isFollowing: initialFollowing, onToggle }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
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
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.8}
      style={{
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: isFollowing ? 'transparent' : COLORS.primary,
        borderWidth: isFollowing ? 1.5 : 0,
        borderColor: isFollowing ? COLORS.border : 'transparent',
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? COLORS.muted : COLORS.white}
        />
      ) : (
        <Text
          style={{
            color: isFollowing ? COLORS.muted : COLORS.white,
            fontWeight: '700',
            fontSize: 14,
          }}
        >
          {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FollowButton;
