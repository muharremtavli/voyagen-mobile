/**
 * VoyaGen — User Profile Screen (Other Users)
 * Premium travel-themed user profile with follow button and post grid.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';
import { getImageUrl } from '../api/client';

const { width: SW } = Dimensions.get('window');
const GRID_SIZE = SW / 3 - 2;

const UserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prof, userPosts] = await Promise.all([
          usersApi.getUserProfile(userId),
          usersApi.getUserPosts(userId),
        ]);
        setProfile(prof);
        setPosts(userPosts);
      } catch (e) {
        console.log('UserProfile error:', e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🌍</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.muted, marginTop: 12, fontSize: 14 }}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🔭</Text>
        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Kullanıcı bulunamadı</Text>
        <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
          Bu gezgin rotasını değiştirmiş olabilir
        </Text>
      </View>
    );
  }

  const StatItem = ({ label, value, emoji }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '900' }}>{value || 0}</Text>
      <Text style={{ color: COLORS.mutedLight, fontSize: 12, marginTop: 4, fontWeight: '500' }}>
        {emoji} {label}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: COLORS.card, paddingBottom: 20 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
        {/* Avatar + Stats */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            ...(Platform.OS === 'web' ? {
              boxShadow: `0 0 20px ${COLORS.accentGlow}`,
            } : {
              shadowColor: COLORS.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }),
          }}>
            <UserAvatar uri={profile.profile_image_url} name={profile.full_name} size={90} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', marginLeft: 24 }}>
            <StatItem label="Gönderi" value={profile.posts_count} emoji="📸" />
            <StatItem label="Takipçi" value={profile.followers_count} emoji="👥" />
            <StatItem label="Takip" value={profile.following_count} emoji="✨" />
          </View>
        </View>

        {/* Name + Bio */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 20 }}>{profile.full_name}</Text>
          <Text style={{ color: COLORS.primary, fontSize: 14, marginTop: 3, fontWeight: '500' }}>@{profile.username}</Text>
          {profile.bio ? (
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 10, lineHeight: 22 }}>{profile.bio}</Text>
          ) : null}
        </View>

        {/* Follow Button */}
        <View style={{ marginTop: 18 }}>
          <FollowButton userId={userId} isFollowing={profile.is_following} onToggle={(following) => {
            setProfile(prev => ({
              ...prev,
              is_following: following,
              followers_count: following ? prev.followers_count + 1 : Math.max(0, prev.followers_count - 1),
            }));
          }} />
        </View>
      </View>

      {/* Grid Header */}
      <View style={{ borderTopWidth: 0.5, borderTopColor: COLORS.border, marginTop: 20, paddingTop: 16, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 15, marginLeft: 10 }}>Gönderiler</Text>
          <Text style={{ color: COLORS.muted, fontSize: 13, marginLeft: 6 }}>({profile.posts_count || 0})</Text>
        </View>
      </View>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 1 }}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <Image
        source={{ uri: getImageUrl(item.image_url) }}
        style={{ width: '100%', height: '100%', backgroundColor: COLORS.surface }} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPostItem}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={{ paddingTop: 50, alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📸</Text>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Henüz gönderi yok</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
              Bu gezgin henüz bir anı paylaşmamış 🌍
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default UserProfileScreen;
