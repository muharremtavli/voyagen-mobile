/**
 * VoyaGen — Profile Screen (Own Profile)
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

const { width: SW } = Dimensions.get('window');
const GRID_SIZE = SW / 3 - 2;

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(user);

  const fetchData = useCallback(async () => {
    try {
      const [prof, userPosts] = await Promise.all([
        usersApi.getMyProfile(),
        usersApi.getUserPosts(user?.id),
      ]);
      setProfile(prof);
      setPosts(userPosts);
    } catch (e) {
      console.log('Profile fetch error:', e?.response?.data || e.message);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await refreshUser();
    setRefreshing(false);
  };

  const StatItem = ({ label, value }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800' }}>{value || 0}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: COLORS.card, paddingBottom: 20 }}>
      {/* Avatar + Stats Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 }}>
        <UserAvatar uri={profile?.profile_image_url} name={profile?.full_name} size={80} />
        <View style={{ flex: 1, flexDirection: 'row', marginLeft: 20 }}>
          <StatItem label="Gönderi" value={profile?.posts_count} />
          <StatItem label="Takipçi" value={profile?.followers_count} />
          <StatItem label="Takip" value={profile?.following_count} />
        </View>
      </View>
      {/* Name + Bio */}
      <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
        <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 16 }}>{profile?.full_name}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>@{profile?.username}</Text>
        {profile?.bio ? <Text style={{ color: COLORS.text, fontSize: 14, marginTop: 8, lineHeight: 20 }}>{profile.bio}</Text> : null}
      </View>
      {/* Logout Button */}
      <TouchableOpacity onPress={logout} style={{ marginHorizontal: 20, marginTop: 16, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center' }}>
        <Text style={{ color: COLORS.danger, fontWeight: '600', fontSize: 14 }}>Çıkış Yap</Text>
      </TouchableOpacity>
      {/* Grid Header */}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
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

export default ProfileScreen;
