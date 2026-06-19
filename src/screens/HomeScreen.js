/**
 * VoyaGen — Home Screen (Global Feed)
 *
 * Premium Instagram-style vertical feed with travel-themed empty state,
 * floating action concept, and smooth loading states.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import PostCard from '../components/PostCard';
import COLORS from '../theme/colors';
import { useTheme } from '../contexts/ThemeContext';
import * as postsApi from '../api/posts';

const { width: SW } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const PAGE_SIZE = 20;

  const fetchPosts = useCallback(async (skip = 0, append = false) => {
    try {
      const data = await postsApi.getGlobalFeed(skip, PAGE_SIZE);
      if (append) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setPosts(data);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.log('Feed error:', error?.response?.data || error.message);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0).finally(() => setInitialLoading(false));
  }, [fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(0);
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPosts(posts.length, true);
    setLoadingMore(false);
  };

  const handleAuthorPress = (author) => {
    if (author?.id) {
      navigation.navigate('UserProfile', { userId: author.id });
    }
  };

  if (initialLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>✈️</Text>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 14, fontSize: 14 }}>
            Gönderiler yükleniyor...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard post={item} onAuthorPress={handleAuthorPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 24 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 80,
              paddingHorizontal: 40,
            }}
          >
            <Text style={{ fontSize: 72, marginBottom: 20 }}>🌍</Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Keşfetmeye Hazır mısın?
            </Text>
            <Text
              style={{
                color: colors.muted,
                fontSize: 15,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Henüz gönderi yok. İlk gönderiyi paylaşan sen ol! {'\n'}
              ✈️ Yeni yerler keşfet, anılarını paylaş
            </Text>
            <View
              style={{
                marginTop: 32,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {['🏝️', '⛰️', '🗼', '🌅', '🏖️'].map((emoji, i) => (
                <Text key={i} style={{ fontSize: 28 }}>{emoji}</Text>
              ))}
            </View>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;
