import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import * as postsApi from '../api/posts';

const PostDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { post: initialPost, postId: initialPostId, focusComment } = route.params;
  const inputRef = useRef(null);

  useEffect(() => {
    if (focusComment && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 500);
    }
  }, [focusComment]);
  const postId = initialPost?.id || initialPostId;
  
  const [post, setPost] = useState(initialPost || null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(!initialPost);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        postsApi.getPost(postId),
        postsApi.getPostComments(postId),
      ]);
      setPost(fetchedPost);
      setComments(fetchedComments);
    } catch (e) {
      console.log('Post fetch error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const handleSendComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await postsApi.createPostComment(postId, commentText.trim());
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (e) {
      console.log('Comment error:', e?.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={{ flexDirection: 'row', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}>
      <UserAvatar uri={item.author?.profile_image_url} name={item.author?.full_name || item.author?.username} size={36} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
          {item.author?.username || 'user'}
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '400' }}>
            {' • '} {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 }}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  if (loading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderComment}
        ListHeaderComponent={() => (
          <View>
            <PostCard 
              post={post} 
              onAuthorPress={(author) => {
                if (author.id) navigation.navigate('UserProfile', { userId: author.id });
              }}
              onPostDeleted={() => navigation.goBack()}
            />
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>Yorumlar</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 30, alignItems: 'center' }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Henüz yorum yok. İlk yorumu sen yap!</Text>
          </View>
        )}
      />

      {/* Comment Input */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12
      }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: colors.text,
            fontSize: 14,
            maxHeight: 100,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
          }}
          placeholder="Yorum ekle..."
          placeholderTextColor={colors.muted}
          value={commentText}
          onChangeText={setCommentText}
          ref={inputRef}
          multiline
        />
        <TouchableOpacity
          onPress={handleSendComment}
          disabled={!commentText.trim() || submitting}
          style={{
            marginLeft: 12,
            backgroundColor: commentText.trim() ? colors.primary : colors.surfaceHover,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {submitting ? (
             <ActivityIndicator size="small" color={colors.bg} />
          ) : (
             <Ionicons name="send" size={18} color={commentText.trim() ? colors.bg : colors.muted} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;
