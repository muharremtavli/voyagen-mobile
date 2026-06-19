/**
 * VoyaGen — Explore Screen
 * Segmented tabs: Users search + Locations discovery.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Platform, Animated, Dimensions, ScrollView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';
import { useTheme } from '../contexts/ThemeContext';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';
import * as locationsApi from '../api/locations';
import LocationCard from '../components/LocationCard';
import PostCard from '../components/PostCard';
import { getGlobalFeed } from '../api/posts';

const { width: SW } = Dimensions.get('window');

const TABS = [
  { key: 'users', label: '👥 Gezginler' },
  { key: 'places', label: '📍 Mekanlar' },
  { key: 'tags', label: '🏷️ Etiketler' },
];

const CATEGORY_EMOJI = {
  cafe: '☕', museum: '🏛️', park: '🌳', restaurant: '🍽️',
  hotel: '🏨', nightlife: '🌙', shopping: '🛍️', beach: '🏖️',
  historical: '🏰', mosque: '🕌',
};

const DESTINATIONS = [
  { emoji: '🗼', name: 'Paris', tag: 'Romantik' },
  { emoji: '🏝️', name: 'Maldivler', tag: 'Cennet' },
  { emoji: '⛰️', name: 'İsviçre', tag: 'Macera' },
  { emoji: '🌅', name: 'Santorini', tag: 'Gün batımı' },
  { emoji: '🏯', name: 'Kyoto', tag: 'Kültür' },
  { emoji: '🗽', name: 'New York', tag: 'Şehir' },
];

const ExploreScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userSearched, setUserSearched] = useState(false);

  // Places state
  const [placeQuery, setPlaceQuery] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeSearched, setPlaceSearched] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Tags state
  const [tagQuery, setTagQuery] = useState('');
  const [tagResults, setTagResults] = useState([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [tagSearched, setTagSearched] = useState(false);

  const [searchFocused, setSearchFocused] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await locationsApi.getCategories();
      setCategories(data);
    } catch (e) { /* ignore */ }
  };

  // ── User Search ─────────────────────────────────────
  const handleUserSearch = useCallback(async (text) => {
    setUserQuery(text);
    if (text.trim().length < 1) { setUserResults([]); setUserSearched(false); return; }
    setUserLoading(true); setUserSearched(true);
    try {
      const data = await usersApi.searchUsers(text.trim());
      setUserResults(data);
    } catch (e) { console.log('Search error:', e?.message); }
    finally { setUserLoading(false); }
  }, []);

  const handlePlaceSearch = useCallback(async (overrideCat) => {
    const cat = overrideCat !== undefined ? overrideCat : selectedCategory;
    if (!placeQuery.trim() && !city.trim() && !cat) return;
    setPlaceLoading(true); setPlaceSearched(true);
    setRelatedPosts([]);
    try {
      const data = await locationsApi.searchLocations(placeQuery.trim(), city.trim(), cat, 20);
      setPlaceResults(data);

      // Also search for related posts by the search query as tag
      if (placeQuery.trim()) {
        setPostsLoading(true);
        try {
          const posts = await getGlobalFeed(0, 10, placeQuery.trim());
          setRelatedPosts(posts);
        } catch (e) { /* ignore */ }
        finally { setPostsLoading(false); }
      }
    } catch (e) { console.log('Place search error:', e?.message); }
    finally { setPlaceLoading(false); }
  }, [placeQuery, city, selectedCategory]);

  // ── Tag Search ──────────────────────────────────────
  const handleTagSearch = useCallback(async (text) => {
    setTagQuery(text);
    if (text.trim().length < 1) { setTagResults([]); setTagSearched(false); return; }
    setTagLoading(true); setTagSearched(true);
    try {
      const data = await getGlobalFeed(0, 20, text.trim().replace('#', ''));
      setTagResults(data);
    } catch (e) { console.log('Tag search error:', e?.message); }
    finally { setTagLoading(false); }
  }, []);

  const handleCategoryPress = (key) => {
    const newCat = selectedCategory === key ? '' : key;
    setSelectedCategory(newCat);
    if (newCat || placeQuery.trim() || city.trim()) {
      setPlaceLoading(true); setPlaceSearched(true);
      locationsApi.searchLocations(placeQuery.trim(), city.trim(), newCat, 20)
        .then(data => setPlaceResults(data))
        .catch(() => {})
        .finally(() => setPlaceLoading(false));
    }
  };

  const handleUserPress = (user) => navigation.navigate('UserProfile', { userId: user.id });
  const handleLocationPress = (loc) => navigation.navigate('LocationDetail', { fsqId: loc.fsq_id, locationName: loc.name });

  // ── Render User Item ────────────────────────────────
  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item)} activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20,
        backgroundColor: colors.card, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
      <UserAvatar uri={item.profile_image_url} name={item.full_name || item.username} size={52} />
      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{item.username}</Text>
        <Text style={{ color: colors.mutedLight, fontSize: 13, marginTop: 3 }}>{item.full_name}</Text>
      </View>
      <View style={{ backgroundColor: colors.primaryGlow, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Profil</Text>
      </View>
    </TouchableOpacity>
  );

  // ── Tab Content ─────────────────────────────────────
  const renderUsersTab = () => (
    <>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: searchFocused && activeTab === 'users' ? colors.surfaceHover : colors.surface,
          borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5,
          borderColor: searchFocused && activeTab === 'users' ? colors.primary : 'transparent' }}>
          <Ionicons name="search" size={18} color={searchFocused ? colors.primary : colors.muted} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: colors.text, fontSize: 15,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
            placeholder="🔍 Gezginleri ara..." placeholderTextColor={colors.mutedLight}
            value={userQuery} onChangeText={handleUserSearch} autoCapitalize="none" autoCorrect={false}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
          {userQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setUserQuery(''); setUserResults([]); setUserSearched(false); }}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {userLoading ? (
        <View style={{ paddingTop: 50, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 12 }}>Aranıyor...</Text>
        </View>
      ) : (
        <FlatList data={userResults} keyExtractor={(item) => String(item.id)} renderItem={renderUserItem}
          ListEmptyComponent={
            userSearched ? (
              <View style={{ paddingTop: 70, alignItems: 'center', paddingHorizontal: 40 }}>
                <Text style={{ fontSize: 56, marginBottom: 16 }}>🔭</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Gezgin bulunamadı</Text>
                <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>Farklı bir isim ile aramayı dene</Text>
              </View>
            ) : (
              <Animated.View style={{ paddingTop: 40, opacity: headerAnim,
                transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
                <View style={{ alignItems: 'center', paddingHorizontal: 40, marginBottom: 36 }}>
                  <Text style={{ fontSize: 56, marginBottom: 14 }}>🌍</Text>
                  <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>Dünyayı Keşfet</Text>
                  <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>Yeni gezginler bul, takip et ve{'\n'}ilham al! ✨</Text>
                </View>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ color: colors.mutedLight, fontSize: 14, fontWeight: '700', marginLeft: 20, marginBottom: 14 }}>🗺️ Popüler Destinasyonlar</Text>
                  <FlatList data={DESTINATIONS} horizontal showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.name} contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity activeOpacity={0.8} style={{ backgroundColor: colors.card, borderRadius: 20, padding: 20,
                        marginRight: 14, width: 140, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ fontSize: 40, marginBottom: 10 }}>{item.emoji}</Text>
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{item.name}</Text>
                        <View style={{ marginTop: 8, backgroundColor: colors.primaryGlow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{item.tag}</Text>
                        </View>
                      </TouchableOpacity>
                    )} />
                </View>
              </Animated.View>
            )
          } />
      )}
    </>
  );

  const renderPlacesTab = () => (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
      {/* Search Inputs */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
          borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent' }}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: colors.text, fontSize: 15,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
            placeholder="Mekan adı veya tür..." placeholderTextColor={colors.mutedLight}
            value={placeQuery} onChangeText={setPlaceQuery} autoCapitalize="none"
            onSubmitEditing={() => handlePlaceSearch()} returnKeyType="search" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
            borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: 'transparent' }}>
            <Text style={{ fontSize: 14 }}>📍</Text>
            <TextInput style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: colors.text, fontSize: 15,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
              placeholder="Şehir (ör: İstanbul)" placeholderTextColor={colors.mutedLight}
              value={city} onChangeText={setCity} autoCapitalize="words"
              onSubmitEditing={() => handlePlaceSearch()} returnKeyType="search" />
          </View>
          <TouchableOpacity onPress={() => handlePlaceSearch()} activeOpacity={0.8}
            style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' }}>
            <Text style={{ color: colors.onPrimary, fontWeight: '800', fontSize: 15 }}>Ara</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity key={cat.key} onPress={() => handleCategoryPress(cat.key)} activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center',
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
                  borderWidth: 1, borderColor: isActive ? colors.primary : colors.border }}>
                <Text style={{ fontSize: 15, marginRight: 5 }}>{CATEGORY_EMOJI[cat.key] || '📍'}</Text>
                <Text style={{ color: isActive ? colors.onPrimary : colors.text, fontSize: 13, fontWeight: isActive ? '800' : '600' }}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Results */}
      {placeLoading ? (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 14 }}>Mekanlar aranıyor...</Text>
        </View>
      ) : placeSearched ? (
        <View>
          {/* Foursquare Results */}
          {placeResults.length > 0 ? (
            <View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginHorizontal: 16, marginTop: 12, marginBottom: 8 }}>
                📍 Bulunan Mekanlar ({placeResults.length})
              </Text>
              {placeResults.map((item) => (
                <LocationCard key={item.fsq_id} location={item} onPress={() => handleLocationPress(item)} />
              ))}
            </View>
          ) : (
            <View style={{ paddingTop: 40, alignItems: 'center', paddingHorizontal: 40 }}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>🔭</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Mekan bulunamadı</Text>
              <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>Farklı bir şehir veya kategori deneyin</Text>
            </View>
          )}

          {/* Related Posts Section */}
          {postsLoading ? (
            <View style={{ paddingTop: 30, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ color: colors.muted, marginTop: 8, fontSize: 13 }}>İlgili gönderiler aranıyor...</Text>
            </View>
          ) : relatedPosts.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 }}>
                <Ionicons name="images-outline" size={20} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginLeft: 8 }}>
                  Gezginlerin Paylaşımları
                </Text>
                <View style={{ backgroundColor: colors.primaryGlow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>{relatedPosts.length}</Text>
                </View>
              </View>
              {relatedPosts.map((post) => (
                <PostCard key={String(post.id)} post={post} onAuthorPress={handleUserPress} />
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ paddingTop: 40, alignItems: 'center', paddingHorizontal: 30 }}>
          <Text style={{ fontSize: 56, marginBottom: 14 }}>🗺️</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>Mekanları Keşfet</Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>Kafeler, müzeler, parklar ve{'\n'}daha fazlasını keşfet! ✨</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderTagsTab = () => (
    <>
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: searchFocused && activeTab === 'tags' ? colors.surfaceHover : colors.surface,
          borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5,
          borderColor: searchFocused && activeTab === 'tags' ? colors.primary : 'transparent' }}>
          <Ionicons name="search" size={18} color={searchFocused ? colors.primary : colors.muted} />
          <TextInput
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: colors.text, fontSize: 15,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
            placeholder="Etiket ara (örn: istanbul)..." placeholderTextColor={colors.mutedLight}
            value={tagQuery} onChangeText={handleTagSearch} autoCapitalize="none" autoCorrect={false}
            onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
          {tagQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setTagQuery(''); setTagResults([]); setTagSearched(false); }}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {tagLoading ? (
        <View style={{ paddingTop: 50, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.muted, marginTop: 12 }}>Gönderiler aranıyor...</Text>
        </View>
      ) : (
        <FlatList data={tagResults} keyExtractor={(item) => String(item.id)} 
          renderItem={({ item }) => {
            return <PostCard post={item} onAuthorPress={handleUserPress} />;
          }}
          ListEmptyComponent={
            tagSearched ? (
              <View style={{ paddingTop: 70, alignItems: 'center', paddingHorizontal: 40 }}>
                <Text style={{ fontSize: 56, marginBottom: 16 }}>🏷️</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Gönderi bulunamadı</Text>
                <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>Farklı bir etiket ile aramayı dene</Text>
              </View>
            ) : (
              <View style={{ paddingTop: 40, alignItems: 'center', paddingHorizontal: 30 }}>
                <Text style={{ fontSize: 56, marginBottom: 14 }}>🏷️</Text>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 10 }}>Etiketleri Keşfet</Text>
                <Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>#istanbul, #gezi gibi etiketlerle{'\n'}yeni yerler keşfet! ✨</Text>
              </View>
            )
          } />
      )}
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Segmented Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 8,
        borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
                backgroundColor: isActive ? colors.primary : 'transparent' }}>
              <Text style={{ color: isActive ? colors.onPrimary : colors.muted, fontWeight: '700', fontSize: 14 }}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'places' && renderPlacesTab()}
      {activeTab === 'tags' && renderTagsTab()}
    </View>
  );
};

export default ExploreScreen;
