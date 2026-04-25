/**
 * VoyaGen — Register Screen
 *
 * Registration form with 4 fields. Auto-logs in after successful registration.
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

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !fullName.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        full_name: fullName.trim(),
        password,
      });
    } catch (error) {
      const message =
        error?.response?.data?.detail || 'Kayıt başarısız. Bilgilerinizi kontrol edin.';
      Alert.alert('Kayıt Hatası', message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, ...rest }) => (
    <View style={{ marginBottom: 14 }}>
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
        <Ionicons name={icon} size={20} color={COLORS.muted} />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 16,
            paddingHorizontal: 12,
            color: COLORS.text,
            fontSize: 15,
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />
      </View>
    </View>
  );

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
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 20,
              backgroundColor: COLORS.secondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
              shadowColor: COLORS.secondary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            <Ionicons name="person-add" size={34} color={COLORS.white} />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: COLORS.text,
            }}
          >
            Hesap Oluştur
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.muted,
              marginTop: 6,
            }}
          >
            VoyaGen'e katıl, keşfe çık!
          </Text>
        </View>

        {/* Form Fields */}
        <InputField
          icon="mail-outline"
          placeholder="E-posta adresi"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <InputField
          icon="at-outline"
          placeholder="Kullanıcı adı"
          value={username}
          onChangeText={setUsername}
        />
        <InputField
          icon="person-outline"
          placeholder="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        {/* Password with toggle */}
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
              placeholder="Şifre (en az 8 karakter)"
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

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: COLORS.secondary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            shadowColor: COLORS.secondary,
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
              Kayıt Ol
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 24, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.muted, fontSize: 14 }}>
            Zaten hesabın var mı?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              Giriş Yap
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
