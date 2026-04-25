/**
 * VoyaGen — Login Screen
 *
 * Modern dark-themed login with gradient accents.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import COLORS from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error) {
      const message =
        error?.response?.data?.detail || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      Alert.alert('Giriş Hatası', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Ionicons name="airplane" size={40} color={COLORS.white} />
          </View>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              color: COLORS.text,
              letterSpacing: 1,
            }}
          >
            VoyaGen
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.muted,
              marginTop: 6,
            }}
          >
            AI Destekli Sosyal Gezi Platformu
          </Text>
        </View>

        {/* Input Fields */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="person-outline" size={20} color={COLORS.muted} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 12,
                color: COLORS.text,
                fontSize: 15,
              }}
              placeholder="Kullanıcı adı veya e-posta"
              placeholderTextColor={COLORS.muted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} />
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 12,
                color: COLORS.text,
                fontSize: 15,
              }}
              placeholder="Şifre"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text
              style={{
                color: COLORS.white,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Giriş Yap
            </Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 24, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.muted, fontSize: 14 }}>
            Hesabın yok mu?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              Kayıt Ol
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
