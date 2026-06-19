import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import * as messagesApi from '../api/messages';

const ChatScreen = ({ route, navigation }) => {
  const { userId, username, profileImage } = route.params;
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
    return () => {
      if (parent) {
        parent.setOptions({ 
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 20 : 10,
            left: 15,
            right: 15,
            elevation: 10,
            borderRadius: 25,
            height: 65,
            paddingBottom: 0,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10 },
              web: { boxShadow: '0 5px 20px rgba(0,0,0,0.1)', position: 'fixed' }
            })
          }
        });
      }
    };
  }, [navigation, colors]);

  useEffect(() => {
    navigation.setOptions({
      title: username,
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <UserAvatar uri={profileImage} name={username} size={32} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginLeft: 10 }}>{username}</Text>
        </View>
      )
    });
    
    fetchMessages();
    
    // Polling every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await messagesApi.getMessages(userId);
      setMessages(data);
    } catch (e) {
      console.log('Error fetching messages', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    try {
      const newMsg = await messagesApi.sendMessage(userId, inputText.trim());
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      // e.response.data.detail could be permission error
      const errorMsg = e.response?.data?.detail || "Mesaj gönderilemedi.";
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert("Hata", errorMsg);
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === currentUser.id;
    return (
      <View style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        backgroundColor: isMine ? colors.primary : colors.surface,
        maxWidth: '80%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginVertical: 4,
        marginHorizontal: 16,
        borderBottomRightRadius: isMine ? 4 : 20,
        borderBottomLeftRadius: isMine ? 20 : 4,
      }}>
        <Text style={{ color: isMine ? colors.onPrimary : colors.text, fontSize: 15, lineHeight: 20 }}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.bg }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, justifyContent: 'center' }} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.muted, marginTop: 40 }}>
              Burada henüz mesaj yok. Bir 'Merhaba' de!
            </Text>
          }
        />
      )}

      {/* Input Area */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.card, borderTopWidth: 0.5, borderTopColor: colors.border }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxHeight: 100,
            color: colors.text,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {})
          }}
          placeholder="Mesaj yaz..."
          placeholderTextColor={colors.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend} 
          disabled={!inputText.trim() || sending}
          style={{
            marginLeft: 12,
            backgroundColor: inputText.trim() ? colors.primary : colors.surfaceHover,
            width: 44, height: 44, borderRadius: 22,
            justifyContent: 'center', alignItems: 'center'
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons name="send" size={20} color={inputText.trim() ? colors.onPrimary : colors.muted} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
