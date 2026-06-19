/**
 * VoyaGen — Locations Screen (Foursquare Explore)
 *
 * Premium place discovery with category filters, city search,
 * animated cards, and Foursquare-powered results.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import * as locationsApi from '../api/locations';

const { width: SW } = Dimensions.get('window');

// Category emoji mapping
const CATEGORY_EMOJI = {
  cafe: '☕',
  museum: '🏛️',
  park: '🌳',
  restaurant: '🍽️',
  hotel: '🏨',
  nightlife: '🌙',
  shopping: '🛍️',
  beach: '🏖️',
  historical: '🏰',
  mosque: '🕌',
};

const LocationsScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await locationsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.log('Categories error:', error?.response?.data || error.message);
    }
  };

  const handleSearch = useCallback(async (overrideCategory) => {
    const cat = overrideCategory !== undefined ? overrideCategory : selectedCategory;
    if (!query.trim() && !city.trim() && !cat) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await locationsApi.searchLocations(
        query.trim(),
        city.trim(),
        cat,
        20
      );
      setResults(data);
    } catch (error) {
      console.log('Search error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [query, city, selectedCategory]);

  const handleCategoryPress = (key) => {
    const newCategory = selectedCategory === key ? '' : key;
    setSelectedCategory(newCategory);
    // Auto-search when category selected
    if (newCategory || query.trim() || city.trim()) {
      setTimeout(() => {
        setLoading(true);
        setSearched(true);
        locationsApi.searchLocations(query.trim(), city.trim(), newCategory, 20)
          .then(data => setResults(data))
          .catch(err => console.log('Category search error:', err?.message))
          .finally(() => setLoading(false));
      }, 100);
    }
  };

  const handleLocationPress = (location) => {
    navigation.navigate('LocationDetail', { fsqId: location.fsq_id, locationName: location.name });
  };

  // ── Place Card ──────────────────────────────────────────
  const renderPlaceCard = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleLocationPress(item)}
      activeOpacity={0.8}
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 20,
        marginHorizontal: 16,
        marginBottom: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      {/* Image */}
      {item.photo_url ? (
        <Image
          source={{ uri: item.photo_url }}
          style={{
            width: '100%',
            height: 180,
            backgroundColor: COLORS.surface,
          }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 140,
            backgroundColor: COLORS.surface,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 48, opacity: 0.5 }}>📍</Text>
        </View>
      )}

      {/* Rating Badge */}
      {item.fsq_rating && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: COLORS.overlay,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: COLORS.warning, fontSize: 13, fontWeight: '800' }}>
            ⭐ {item.fsq_rating.toFixed(1)}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* Name + Category */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text
              style={{
                color: COLORS.text,
                fontSize: 17,
                fontWeight: '800',
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
          {item.category ? (
            <View
              style={{
                backgroundColor: COLORS.primaryGlow,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '700' }}>
                {item.category}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Address */}
        {item.address ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Ionicons name="location-outline" size={14} color={COLORS.muted} />
            <Text
              style={{
                color: COLORS.mutedLight,
                fontSize: 13,
                marginLeft: 5,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {item.address}
            </Text>
          </View>
        ) : null}

        {/* City + Country */}
        {(item.city || item.country) && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <Ionicons name="earth-outline" size={14} color={COLORS.muted} />
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 12,
                marginLeft: 5,
              }}
            >
              {[item.city, item.country].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        {/* Description preview */}
        {item.description ? (
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              marginTop: 8,
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        ) : null}

        {/* Action row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.surface,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 10,
          }}>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            <Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '700', marginLeft: 5 }}>
              Detayları Gör
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Main Render ─────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Search Section */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.card,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.border,
        }}
      >
        {/* Query Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: searchFocused ? COLORS.surfaceHover : COLORS.surface,
            borderRadius: 14,
            paddingHorizontal: 14,
            marginBottom: 8,
            borderWidth: 1.5,
            borderColor: searchFocused ? COLORS.primary : 'transparent',
          }}
        >
          <Ionicons name="search" size={18} color={searchFocused ? COLORS.primary : COLORS.muted} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              color: COLORS.text,
              fontSize: 15,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            }}
            placeholder="🔍 Mekan adı veya tür..."
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* City + Search Row */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: cityFocused ? COLORS.surfaceHover : COLORS.surface,
              borderRadius: 14,
              paddingHorizontal: 14,
              borderWidth: 1.5,
              borderColor: cityFocused ? COLORS.secondary : 'transparent',
            }}
          >
            <Text style={{ fontSize: 14 }}>📍</Text>
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 10,
                color: COLORS.text,
                fontSize: 15,
                ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
              }}
              placeholder="Şehir (ör: İstanbul)"
              placeholderTextColor={COLORS.muted}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              autoCorrect={false}
              onFocus={() => setCityFocused(true)}
              onBlur={() => setCityFocused(false)}
              onSubmitEditing={() => handleSearch()}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            onPress={() => handleSearch()}
            activeOpacity={0.8}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingHorizontal: 20,
              justifyContent: 'center',
              alignItems: 'center',
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 4px 16px ${COLORS.primaryGlow}`,
              } : {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
              }),
            }}
          >
            <Text style={{ color: COLORS.bg, fontWeight: '800', fontSize: 15 }}>Ara</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Chips */}
      {categories.length > 0 && (
        <View style={{ paddingVertical: 10, backgroundColor: COLORS.card, borderBottomWidth: 0.5, borderBottomColor: COLORS.border }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => handleCategoryPress(cat.key)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isActive ? COLORS.primary : COLORS.surface,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderWidth: 1,
                    borderColor: isActive ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text style={{ fontSize: 15, marginRight: 5 }}>
                    {CATEGORY_EMOJI[cat.key] || '📍'}
                  </Text>
                  <Text
                    style={{
                      color: isActive ? COLORS.bg : COLORS.textSecondary,
                      fontSize: 13,
                      fontWeight: isActive ? '800' : '600',
                    }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.muted, marginTop: 14, fontSize: 14 }}>
            Mekanlar aranıyor...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.fsq_id}
          renderItem={renderPlaceCard}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 30 }}
          ListEmptyComponent={
            searched ? (
              <View style={{ paddingTop: 70, alignItems: 'center', paddingHorizontal: 40 }}>
                <Text style={{ fontSize: 56, marginBottom: 16 }}>🔭</Text>
                <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
                  Mekan bulunamadı
                </Text>
                <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
                  Farklı bir şehir veya kategori ile tekrar deneyin
                </Text>
              </View>
            ) : (
              <Animated.View
                style={{
                  paddingTop: 40,
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
                  }],
                }}
              >
                {/* Welcome State */}
                <View style={{ alignItems: 'center', paddingHorizontal: 40, marginBottom: 30 }}>
                  <Text style={{ fontSize: 56, marginBottom: 14 }}>🗺️</Text>
                  <Text style={{
                    color: COLORS.text, fontSize: 24, fontWeight: '800',
                    textAlign: 'center', marginBottom: 10,
                  }}>
                    Mekanları Keşfet
                  </Text>
                  <Text style={{
                    color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 22,
                  }}>
                    Dünya genelinde kafeler, müzeler, parklar{'\n'}ve daha fazlasını keşfet! ✨
                  </Text>
                </View>

                {/* Quick Categories */}
                <View style={{ paddingHorizontal: 16 }}>
                  <Text style={{ color: COLORS.mutedLight, fontSize: 14, fontWeight: '700', marginBottom: 14 }}>
                    🏷️ Popüler Kategoriler
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {[
                      { emoji: '☕', name: 'Kafe', key: 'cafe' },
                      { emoji: '🍽️', name: 'Restoran', key: 'restaurant' },
                      { emoji: '🏛️', name: 'Müze', key: 'museum' },
                      { emoji: '🌳', name: 'Park', key: 'park' },
                      { emoji: '🏨', name: 'Otel', key: 'hotel' },
                      { emoji: '🏖️', name: 'Plaj', key: 'beach' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.7}
                        onPress={() => handleCategoryPress(item.key)}
                        style={{
                          backgroundColor: COLORS.card,
                          borderRadius: 16,
                          padding: 16,
                          width: (SW - 58) / 3,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: COLORS.border,
                        }}
                      >
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</Text>
                        <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 13 }}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )
          }
        />
      )}
    </View>
  );
};

export default LocationsScreen;
