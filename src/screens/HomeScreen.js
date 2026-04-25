/**
 * VoyaGen — Home Screen (Global Feed)
 *
 * Instagram-style vertical feed using FlatList.
 * Pull-to-refresh and load-more pagination.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import PostCard from '../components/PostCard';
import COLORS from '../theme/colors';
import * as postsApi from '../api/posts';

const HomeScreen = ({ navigation }) => {
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
          backgroundColor: COLORS.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onAuthorPress={handleAuthorPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 100,
            }}
          >
            <Text style={{ color: COLORS.muted, fontSize: 16 }}>
              Henüz gönderi yok
            </Text>
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 13,
                marginTop: 6,
              }}
            >
              İlk gönderiyi paylaşan sen ol! 🌍
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;
