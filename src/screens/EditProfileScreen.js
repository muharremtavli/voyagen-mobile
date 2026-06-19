/**
 * VoyaGen — Edit Profile Screen
 * Update full name, bio, and upload a new avatar.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import * as usersApi from '../api/users';

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUri, setAvatarUri] = useState(null); // Local URI selected
  
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update basic profile info
      await usersApi.updateProfile({ full_name: fullName.trim(), bio: bio.trim() || null });
      
      // Update avatar if selected
      if (avatarUri) {
        await usersApi.updateAvatar(avatarUri);
      }
      
      Alert.alert('Başarılı! ✨', 'Profiliniz güncellendi.');
      await refreshUser(); // Update the context user
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenemedi: ' + (error?.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        
        {/* Avatar Picker */}
        <View style={{ marginBottom: 30, alignItems: 'center' }}>
          <View style={{ position: 'relative' }}>
            <UserAvatar 
              uri={avatarUri || user?.profile_image_url} 
              name={fullName || user?.username} 
              size={120} 
            />
            <TouchableOpacity
              onPress={pickImage}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: COLORS.primary,
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: COLORS.bg,
              }}
            >
              <Ionicons name="camera" size={18} color={COLORS.bg} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Inputs */}
        <View style={{ width: '100%', marginBottom: 20 }}>
          <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>Ad Soyad</Text>
          <TextInput
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              color: COLORS.text,
              fontSize: 15,
              borderWidth: 1,
              borderColor: COLORS.border,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            }}
            placeholder="Adınız Soyadınız"
            placeholderTextColor={COLORS.muted}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={{ width: '100%', marginBottom: 30 }}>
          <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4 }}>Biyografi</Text>
          <TextInput
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 12,
              padding: 16,
              color: COLORS.text,
              fontSize: 15,
              minHeight: 100,
              textAlignVertical: 'top',
              borderWidth: 1,
              borderColor: COLORS.border,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            }}
            placeholder="Kendinizden bahsedin..."
            placeholderTextColor={COLORS.muted}
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          style={{
            width: '100%',
            backgroundColor: COLORS.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            ...(Platform.OS === 'web' ? { boxShadow: `0 8px 24px ${COLORS.primaryGlow}` } : {
               shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
            }),
          }}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.bg} />
          ) : (
            <Text style={{ color: COLORS.bg, fontWeight: '800', fontSize: 16 }}>Kaydet ✨</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
