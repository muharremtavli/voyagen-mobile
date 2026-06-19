/**
 * VoyaGen — Create Post Screen
 * Upload a photo with a caption to the feed.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import COLORS from '../theme/colors';
import * as postsApi from '../api/posts';

const CreatePostScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!imageUri) {
      Alert.alert('Uyarı', 'Lütfen bir fotoğraf seçin.');
      return;
    }

    setUploading(true);
    try {
      await postsApi.createPost(imageUri, caption.trim() || null, tags.trim() || null);
      Alert.alert('Başarılı! 🚀', 'Gönderiniz paylaşıldı.');
      navigation.goBack(); // Go back to Home/Feed
    } catch (error) {
      Alert.alert('Hata', 'Gönderi paylaşılamadı: ' + (error?.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Image Picker Area */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.8}
          style={{
            width: '100%',
            height: 350,
            backgroundColor: COLORS.card,
            borderRadius: 20,
            borderWidth: imageUri ? 0 : 2,
            borderColor: COLORS.border,
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            overflow: 'hidden'
          }}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="camera" size={48} color={COLORS.muted} style={{ marginBottom: 10 }} />
              <Text style={{ color: COLORS.mutedLight, fontSize: 16, fontWeight: '600' }}>Fotoğraf Seç veya Çek</Text>
            </View>
          )}
          
          {imageUri && (
            <View style={{
              position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)',
              borderRadius: 20, padding: 8
            }}>
              <Ionicons name="pencil" size={20} color={COLORS.white} />
            </View>
          )}
        </TouchableOpacity>

        {/* Caption Input */}
        <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 8 }}>Açıklama</Text>
        <TextInput
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 14,
            padding: 16,
            color: COLORS.text,
            fontSize: 15,
            minHeight: 100,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 24,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
          }}
          placeholder="Bu anı hakkında bir şeyler yaz..."
          placeholderTextColor={COLORS.muted}
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        {/* Tags Input */}
        <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 8 }}>Etiketler</Text>
        <TextInput
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 14,
            padding: 16,
            color: COLORS.text,
            fontSize: 15,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 24,
            ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
          }}
          placeholder="virgülle ayırarak (örn: istanbul, gezi)"
          placeholderTextColor={COLORS.muted}
          value={tags}
          onChangeText={setTags}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handlePost}
          disabled={uploading || !imageUri}
          activeOpacity={0.8}
          style={{
            backgroundColor: (!imageUri || uploading) ? COLORS.surface : COLORS.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            ...(Platform.OS === 'web' && imageUri ? { boxShadow: `0 8px 24px ${COLORS.primaryGlow}` } : {
               shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: (!imageUri || uploading) ? 0 : 8
            }),
          }}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={{
              color: (!imageUri || uploading) ? COLORS.muted : COLORS.bg,
              fontWeight: '800', fontSize: 16
            }}>
              Paylaş ✨
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;
