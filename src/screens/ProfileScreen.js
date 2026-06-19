/**
 * VoyaGen — Profile Screen (Own Profile)
 * Premium travel-themed profile with stats, grid, and logout.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Dimensions, Platform, Modal, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';
import { getImageUrl } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import { AVAILABLE_THEMES } from '../theme/colors';

const { width: SW } = Dimensions.get('window');
const GRID_SIZE = SW / 3 - 2;

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(user);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { themeName, isDarkMode, changeTheme, toggleDarkMode, colors } = useTheme();

  const fetchData = useCallback(async () => {
    try {
      const [prof, userPosts, userLiked, userSaved] = await Promise.all([
        usersApi.getMyProfile(),
        usersApi.getUserPosts(user?.id),
        usersApi.getLikedPosts(),
        usersApi.getSavedPosts(),
      ]);
      setProfile(prof);
      setPosts(userPosts);
      setLikedPosts(userLiked);
      setSavedPosts(userSaved);
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

  const StatItem = ({ label, value, emoji }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{value || 0}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4, fontWeight: '500' }}>
        {emoji} {label}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.card, paddingBottom: 20 }}>
      {/* Profile Header Card */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 20,
      }}>
        {/* Avatar + Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            ...(Platform.OS === 'web' ? {
              boxShadow: `0 0 20px ${colors.accentGlow}`,
            } : {
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }),
          }}>
            <UserAvatar uri={profile?.profile_image_url} name={profile?.full_name} size={90} />
          </View>
          <View style={{ flex: 1, flexDirection: 'row', marginLeft: 24 }}>
            <StatItem label="Gönderi" value={profile?.posts_count} emoji="📸" />
            <StatItem label="Takipçi" value={profile?.followers_count} emoji="👥" />
            <StatItem label="Takip" value={profile?.following_count} emoji="✨" />
          </View>
        </View>

        {/* Settings Button (Top Right) */}
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={{ position: 'absolute', top: 10, right: 10, width: 44, height: 44, zIndex: 10, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        {/* Name + Bio */}
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 20 }}>
            {profile?.full_name}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 3, fontWeight: '500' }}>
            @{profile?.username}
          </Text>
          {profile?.bio ? (
            <Text style={{ color: colors.mutedLight, fontSize: 14, marginTop: 10, lineHeight: 22 }}>
              {profile.bio}
            </Text>
          ) : (
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 10, fontStyle: 'italic' }}>
              ✍️ Bio eklemek için profilini düzenle
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: colors.border,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: colors.surface,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="create-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>Profili Düzenle</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: colors.danger,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              alignItems: 'center',
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid Header Tabs */}
      <View style={{
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: colors.border,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderLight,
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('posts')}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'posts' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <Ionicons name="grid-outline" size={24} color={activeTab === 'posts' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'posts' ? colors.text : colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 }}>Paylaşımlarım</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('liked')}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'liked' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <Ionicons name="heart-outline" size={24} color={activeTab === 'liked' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'liked' ? colors.text : colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 }}>Beğenilenler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('saved')}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'saved' ? 2 : 0,
            borderBottomColor: colors.primary,
          }}
        >
          <Ionicons name="bookmark-outline" size={24} color={activeTab === 'saved' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'saved' ? colors.text : colors.muted, fontSize: 11, fontWeight: '700', marginTop: 4 }}>Kaydedilenler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostItem = ({ item, index }) => (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 1 }}
      onPress={() => navigation.navigate('PostFeedScreen', { posts: currentData, initialIndex: index })}
    >
      <Image
        source={{ uri: getImageUrl(item.image_url) }}
        style={{ width: '100%', height: '100%', backgroundColor: colors.surface }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const currentData = activeTab === 'posts' ? posts : activeTab === 'liked' ? likedPosts : savedPosts;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPostItem}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={{ paddingTop: 50, alignItems: 'center', paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>📸</Text>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Henüz gönderi yok
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
              Gezilerinden anıları paylaş!{'\n'}🌍 İlk gönderini oluştur
            </Text>
          </View>
        }
      />

      {/* Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.card, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Menü ☰</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon" size={20} color={isDarkMode ? colors.primary : colors.muted} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>Koyu Mod</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
              />
            </View>

            <Text style={{ color: colors.primary, fontWeight: 'bold', marginBottom: 12 }}>Tema Seçimi</Text>
            <View style={{ marginBottom: 24 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                {AVAILABLE_THEMES.map(t => {
                  const isActive = themeName === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => changeTheme(t.id)}
                      style={{
                        alignItems: 'center', justifyContent: 'center',
                        padding: 12, borderRadius: 12, marginRight: 12,
                        borderWidth: 2, borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive ? colors.bg : colors.surface,
                        minWidth: 90
                      }}
                    >
                      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: t.swatches[0], borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', zIndex: 2 }} />
                        <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: t.swatches[1], marginLeft: -8, marginTop: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', zIndex: 1 }} />
                      </View>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: isActive ? '800' : '600' }}>
                        {t.name}
                      </Text>
                      {isActive && <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginTop: 4 }} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              onPress={() => { setSettingsVisible(false); navigation.navigate('AccountInfo'); }}
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Hesap Bilgileri</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Gizlilik (Gizli Hesap)</Text>
              </View>
              <Switch 
                value={profile?.is_private || false} 
                onValueChange={async (val) => {
                  try {
                    await usersApi.updateProfile({ is_private: val });
                    setProfile(prev => ({ ...prev, is_private: val }));
                  } catch (e) {
                    alert("Gizlilik güncellenemedi.");
                  }
                }} 
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={profile?.is_private ? colors.primary : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity
              onPress={() => { setSettingsVisible(false); navigation.navigate('Security'); }}
              style={{ backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>Güvenlik</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSettingsVisible(false); logout(); }}
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={{ color: colors.danger, fontWeight: 'bold', fontSize: 16 }}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;
