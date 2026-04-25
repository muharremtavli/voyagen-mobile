/**
 * VoyaGen — User Profile Screen (Other Users)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';
import FollowButton from '../components/FollowButton';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.muted, fontSize: 16 }}>Kullanıcı bulunamadı</Text>
      </View>
    );
  }

  const StatItem = ({ label, value }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800' }}>{value || 0}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: COLORS.card, paddingBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 }}>
        <UserAvatar uri={profile.profile_image_url} name={profile.full_name} size={80} />
        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 20 }}>
          <StatItem label="Gönderi" value={profile.posts_count} />
          <StatItem label="Takipçi" value={profile.followers_count} />
          <StatItem label="Takip" value={profile.following_count} />
        </View>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 16 }}>{profile.full_name}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>@{profile.username}</Text>
        {profile.bio ? <Text style={{ color: COLORS.text, fontSize: 14, marginTop: 8, lineHeight: 20 }}>{profile.bio}</Text> : null}
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <FollowButton userId={userId} isFollowing={profile.is_following} onToggle={(following) => {
          setProfile(prev => ({
            ...prev,
            is_following: following,
            followers_count: following ? prev.followers_count + 1 : Math.max(0, prev.followers_count - 1),
          }));
        }} />
      </View>
      <View style={{ borderTopWidth: 0.5, borderTopColor: COLORS.border, marginTop: 20, paddingTop: 14, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="grid-outline" size={18} color={COLORS.text} />
          <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>Gönderiler</Text>
        </View>
      </View>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.8} style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 1 }}>
      <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%', backgroundColor: COLORS.surface }} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <Ionicons name="camera-outline" size={48} color={COLORS.border} />
            <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 12 }}>Henüz gönderi yok</Text>
          </View>
        }
      />
    </View>
  );
};

export default UserProfileScreen;
