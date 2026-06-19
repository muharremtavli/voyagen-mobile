/**
 * VoyaGen — PostCard Component
 *
 * Premium Instagram-style post card with author header, image, caption, and like button.
 * Enhanced with travel emojis and smooth interactions.
 */

import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Animated, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from './UserAvatar';
import COLORS from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import * as postsApi from '../api/posts';
import { getImageUrl } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PostCard = ({ post: initialPost, onAuthorPress, onCommentPress, onPostDeleted }) => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [post, setPost] = useState(initialPost);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Edit/Delete state
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editTags, setEditTags] = useState(post.tags || '');
  const [editLoading, setEditLoading] = useState(false);

  const heartScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;

  const author = post.author || {};
  const timeAgo = getTimeAgo(post.created_at);
  const isAuthor = currentUser?.id === author.id;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    // Heart bounce animation
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
    ]).start();

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

  const handleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);

    Animated.sequence([
      Animated.timing(saveScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(saveScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
    ]).start();

    try {
      if (isSaved) {
        await postsApi.unsavePost(post.id);
        setIsSaved(false);
      } else {
        await postsApi.savePost(post.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.log('Save error:', error?.response?.data || error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShare = () => {
    if (Platform.OS === 'web') {
      alert("Paylaşım Modalı");
    } else {
      import('react-native').then(({ Alert }) => {
        Alert.alert("Paylaş", "Gönderi paylaşım modalı yakında!");
      });
    }
  };

  const handleDelete = async () => {
    setOptionsVisible(false);
    if (Platform.OS === 'web') {
      if (window.confirm("Bu gönderiyi silmek istediğinden emin misin?")) {
        try {
          await postsApi.deletePost(post.id);
          onPostDeleted?.(post.id);
        } catch (e) {
          alert('Silinemedi');
        }
      }
    } else {
      import('react-native').then(({ Alert }) => {
        Alert.alert("Gönderiyi Sil", "Bu gönderiyi silmek istediğinden emin misin?", [
          { text: "İptal", style: "cancel" },
          { text: "Sil", style: "destructive", onPress: async () => {
              try {
                await postsApi.deletePost(post.id);
                onPostDeleted?.(post.id);
              } catch (e) {
                console.log(e);
              }
            } 
          }
        ]);
      });
    }
  };

  const handleEditSubmit = async () => {
    if (editLoading) return;
    setEditLoading(true);
    try {
      const updatedPost = await postsApi.updatePost(post.id, editCaption, editTags);
      setPost(updatedPost);
      setEditModalVisible(false);
    } catch (error) {
      console.log('Update error:', error);
      alert('Gönderi güncellenirken bir hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.card,
        marginBottom: 2,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
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
          paddingHorizontal: 18,
        }}
      >
        <UserAvatar
          uri={author.profile_image_url}
          name={author.full_name || author.username}
          size={42}
        />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontWeight: '700',
              fontSize: 15,
            }}
          >
            {author.username || 'unknown'}
          </Text>
          {author.full_name ? (
            <Text
              style={{
                color: colors.mutedLight,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {author.full_name}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>📍 {timeAgo}</Text>
          {isAuthor && (
            <TouchableOpacity onPress={() => setOptionsVisible(true)} style={{ marginLeft: 10, padding: 4 }}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Post Image */}
      {post.image_url ? (
        <Image
          source={{ uri: getImageUrl(post.image_url) }}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
            backgroundColor: colors.surface,
          }}
          resizeMode="cover"
        />
      ) : null}

      {/* Actions & Caption */}
      <View style={{ padding: 16, paddingHorizontal: 18 }}>
        {/* Actions Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleLike} activeOpacity={0.7} style={{ marginRight: 12 }}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isLiked ? colors.danger : colors.text}
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={{ marginRight: 12 }}
              onPress={() => onCommentPress ? onCommentPress(post) : navigation.navigate('PostDetail', { post, focusComment: true })}
            >
              <Ionicons name="chatbubble-outline" size={26} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={26} color={colors.text} style={{ transform: [{ rotate: '15deg' }] }} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity activeOpacity={0.7} onPress={handleSave}>
            <Animated.View style={{ transform: [{ scale: saveScale }] }}>
              <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color={isSaved ? colors.primary : colors.text} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Likes Count & Caption */}
        <Text
          style={{
            color: colors.text,
            fontWeight: '700',
            fontSize: 14,
            marginBottom: 6,
          }}
        >
          {likesCount} beğenme
        </Text>
        
        {post.caption ? (
          <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            <Text style={{ fontWeight: '800', color: colors.text }}>{author.username} </Text>
            {post.caption}
          </Text>
        ) : null}

        {post.tags ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {post.tags.split(',').map((t, index) => {
              const tag = t.trim();
              if (!tag) return null;
              return (
                <View key={index} style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: '600' }}>#{tag}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      {/* Options Modal */}
      <Modal visible={optionsVisible} transparent animationType="fade" onRequestClose={() => setOptionsVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setOptionsVisible(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.card, width: '80%', borderRadius: 16, overflow: 'hidden' }}>
            <TouchableOpacity onPress={() => { setOptionsVisible(false); setEditModalVisible(true); }} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.danger }}>Sil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOptionsVisible(false)} style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.muted }}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={false} onRequestClose={() => setEditModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'ios' ? 50 : 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={{ color: colors.muted, fontSize: 16 }}>İptal</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Gönderiyi Düzenle</Text>
            <TouchableOpacity onPress={handleEditSubmit} disabled={editLoading}>
              {editLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Kaydet</Text>}
            </TouchableOpacity>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ color: colors.textSecondary, fontWeight: '600', marginBottom: 8 }}>Açıklama</Text>
            <TextInput
              style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, color: colors.text, minHeight: 100, textAlignVertical: 'top', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
              placeholder="Gönderi açıklaması..."
              placeholderTextColor={colors.mutedLight}
              value={editCaption}
              onChangeText={setEditCaption}
              multiline
            />
            <Text style={{ color: colors.textSecondary, fontWeight: '600', marginTop: 20, marginBottom: 8 }}>Etiketler (virgülle ayırın)</Text>
            <TextInput
              style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, color: colors.text, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
              placeholder="ör: tatil, deniz, istanbul"
              placeholderTextColor={colors.mutedLight}
              value={editTags}
              onChangeText={setEditTags}
            />
          </View>
        </View>
      </Modal>

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
