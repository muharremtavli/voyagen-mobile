/**
 * VoyaGen — Explore Screen
 *
 * Search users by username or full name with real-time results.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

const ExploreScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text) => {
    setQuery(text);
    if (text.trim().length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await usersApi.searchUsers(text.trim());
      setResults(data);
    } catch (error) {
      console.log('Search error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id });
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.card,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.border,
      }}
    >
      <UserAvatar
        uri={item.profile_image_url}
        name={item.full_name || item.username}
        size={50}
      />
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text
          style={{
            color: COLORS.text,
            fontWeight: '700',
            fontSize: 15,
          }}
        >
          {item.username}
        </Text>
        <Text
          style={{
            color: COLORS.muted,
            fontSize: 13,
            marginTop: 2,
          }}
        >
          {item.full_name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Search Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.card,
          borderBottomWidth: 0.5,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.surface,
            borderRadius: 12,
            paddingHorizontal: 14,
          }}
        >
          <Ionicons name="search" size={20} color={COLORS.muted} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 10,
              color: COLORS.text,
              fontSize: 15,
            }}
            placeholder="Kullanıcı ara..."
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={
            searched ? (
              <View
                style={{
                  paddingTop: 60,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="search-outline" size={48} color={COLORS.border} />
                <Text
                  style={{
                    color: COLORS.muted,
                    fontSize: 15,
                    marginTop: 12,
                  }}
                >
                  Kullanıcı bulunamadı
                </Text>
              </View>
            ) : (
              <View
                style={{
                  paddingTop: 80,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="globe-outline" size={64} color={COLORS.border} />
                <Text
                  style={{
                    color: COLORS.muted,
                    fontSize: 16,
                    marginTop: 16,
                    fontWeight: '600',
                  }}
                >
                  Keşfet
                </Text>
                <Text
                  style={{
                    color: COLORS.muted,
                    fontSize: 13,
                    marginTop: 6,
                    textAlign: 'center',
                    paddingHorizontal: 40,
                  }}
                >
                  Yeni gezginler keşfet, takip et ve ilham al! 🌍
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default ExploreScreen;
