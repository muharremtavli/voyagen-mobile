import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import UserAvatar from '../components/UserAvatar';
import { useTheme } from '../contexts/ThemeContext';
import * as messagesApi from '../api/messages';
import * as usersApi from '../api/users';

const MessagesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const data = await messagesApi.getChatList();
      setChats(data);
    } catch (e) {
      console.log('Error fetching chats:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await usersApi.searchUsers(text.trim());
      setSearchResults(results);
    } catch (e) {
      console.log('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const openChat = (user) => {
    navigation.navigate('ChatScreen', { userId: user.id, username: user.username, profileImage: user.profile_image_url });
  };

  const renderChatItem = ({ item }) => {
    const { user, last_message, unread_count } = item;
    return (
      <TouchableOpacity 
        onPress={() => openChat(user)}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}
      >
        <UserAvatar uri={user.profile_image_url} name={user.full_name || user.username} size={52} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: unread_count > 0 ? '800' : '600', fontSize: 16 }}>{user.username}</Text>
          <Text style={{ color: unread_count > 0 ? colors.text : colors.muted, fontSize: 14, marginTop: 4 }} numberOfLines={1}>
            {last_message.content}
          </Text>
        </View>
        {unread_count > 0 && (
          <View style={{ backgroundColor: colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => openChat(item)}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight }}
    >
      <UserAvatar uri={item.profile_image_url} name={item.full_name || item.username} size={48} />
      <View style={{ marginLeft: 16, flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{item.username}</Text>
        <Text style={{ color: colors.mutedLight, fontSize: 13, marginTop: 2 }}>{item.full_name}</Text>
      </View>
      <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header Search */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.card, borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12 }}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.text, fontSize: 15, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) }}
            placeholder="Mesajlaşmak için kullanıcı ara..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length > 0 ? (
        searching ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>Kullanıcı bulunamadı.</Text>
            }
          />
        )
      ) : (
        loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.user.id}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>Mesajın yok</Text>
                <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 8, marginHorizontal: 40 }}>
                  Yeni bir sohbet başlatmak için yukarıdan kullanıcı arayın.
                </Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
};

export default MessagesScreen;
