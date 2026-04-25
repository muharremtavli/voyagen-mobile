/**
 * VoyaGen — PostCard Component
 *
 * Instagram-style post card with author header, image, caption, and like button.
 */

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from './UserAvatar';
import COLORS from '../theme/colors';
import * as postsApi from '../api/posts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostCard = ({ post, onAuthorPress }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const author = post.author || {};
  const timeAgo = getTimeAgo(post.created_at);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (isLiked) {
        await postsApi.unlikePost(post.id);
        setIsLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
      } else {
        await postsApi.likePost(post.id);
        setIsLiked(true);
        setLikesCount((c) => c + 1);
      }
    } catch (error) {
      console.log('Like error:', error?.response?.data || error.message);
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        marginBottom: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
      }}
    >
      {/* Author Header */}
      <TouchableOpacity
        onPress={() => onAuthorPress?.(author)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
        }}
      >
        <UserAvatar
          uri={author.profile_image_url}
          name={author.full_name || author.username}
          size={38}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{
              color: COLORS.text,
              fontWeight: '700',
              fontSize: 14,
            }}
          >
            {author.username || 'unknown'}
          </Text>
          {author.full_name ? (
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 12,
                marginTop: 1,
              }}
            >
              {author.full_name}
            </Text>
          ) : null}
        </View>
        <Text style={{ color: COLORS.muted, fontSize: 11 }}>{timeAgo}</Text>
      </TouchableOpacity>

      {/* Post Image */}
      {post.image_url ? (
        <Image
          source={{ uri: post.image_url }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            backgroundColor: COLORS.surface,
          }}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions & Caption */}
      <View style={{ padding: 14 }}>
        {/* Like Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <TouchableOpacity onPress={handleLike} activeOpacity={0.7}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={26}
              color={isLiked ? COLORS.danger : COLORS.text}
            />
          </TouchableOpacity>
          <Text
            style={{
              color: COLORS.text,
              fontWeight: '600',
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            {likesCount} beğeni
          </Text>
        </View>

        {/* Caption */}
        {post.caption ? (
          <Text style={{ color: COLORS.text, fontSize: 14, lineHeight: 20 }}>
            <Text style={{ fontWeight: '700' }}>{author.username} </Text>
            {post.caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

// ── Helper: Time Ago ──────────────────────────────────────
function getTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'az önce';
  if (diffMins < 60) return `${diffMins}dk`;
  if (diffHours < 24) return `${diffHours}sa`;
  if (diffDays < 7) return `${diffDays}g`;
  return date.toLocaleDateString('tr-TR');
}

export default PostCard;
