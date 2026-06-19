/**
 * VoyaGen — Register Screen
 *
 * Premium registration with travel theme, step indicator feel,
 * animated form fields. Fixed web TextInput focus issue.
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import COLORS from '../theme/colors';

const { width: SW } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Animations
  const headerScale = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(formSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

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

  const renderInput = ({ icon, emoji, placeholder, value, onChangeText, secure, field, keyboardType, autoCapitalize }) => {
    const isFocused = focusedField === field;
    return (
      <View style={{ marginBottom: 14 }}>
        {/* Field Label */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 4 }}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>{emoji}</Text>
          <Text style={{ color: COLORS.mutedLight, fontSize: 13, fontWeight: '600' }}>{placeholder}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isFocused ? COLORS.surfaceHover : COLORS.surface,
            borderRadius: 16,
            paddingHorizontal: 18,
            borderWidth: 1.5,
            borderColor: isFocused ? COLORS.secondary : COLORS.border,
            ...(isFocused && Platform.OS === 'web' ? {
              boxShadow: `0 0 20px ${COLORS.secondaryGlow}`,
            } : {}),
          }}
        >
          <Ionicons name={icon} size={20} color={isFocused ? COLORS.secondary : COLORS.muted} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 16,
              paddingHorizontal: 14,
              color: COLORS.text,
              fontSize: 16,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            }}
            placeholder={placeholder}
            placeholderTextColor={COLORS.muted}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secure && !showPassword}
            autoCapitalize={autoCapitalize || 'none'}
            autoCorrect={false}
            keyboardType={keyboardType || 'default'}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
          />
          {secure && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: COLORS.border };
    if (password.length < 4) return { level: 1, label: 'Zayıf', color: COLORS.danger };
    if (password.length < 8) return { level: 2, label: 'Orta', color: COLORS.warning };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: 'Güçlü', color: COLORS.success };
    return { level: 3, label: 'İyi', color: COLORS.primary };
  };

  const pwStrength = getPasswordStrength();

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
          paddingVertical: 40,
          maxWidth: 460,
          alignSelf: 'center',
          width: '100%',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View style={{ alignItems: 'center', marginBottom: 36, transform: [{ scale: headerScale }] }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: COLORS.secondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 12px 40px ${COLORS.secondaryGlow}`,
              } : {
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 15,
              }),
            }}
          >
            <Text style={{ fontSize: 40 }}>🧭</Text>
          </View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: '900',
              color: COLORS.text,
              letterSpacing: 1,
            }}
          >
            Maceraya Katıl!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.mutedLight,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            🌍 VoyaGen ile dünyayı keşfetmeye başla
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
          {renderInput({
            icon: 'mail-outline',
            emoji: '📧',
            placeholder: 'E-posta adresi',
            value: email,
            onChangeText: setEmail,
            field: 'email',
            keyboardType: 'email-address',
          })}
          {renderInput({
            icon: 'at-outline',
            emoji: '👤',
            placeholder: 'Kullanıcı adı',
            value: username,
            onChangeText: setUsername,
            field: 'username',
          })}
          {renderInput({
            icon: 'person-outline',
            emoji: '✨',
            placeholder: 'Ad Soyad',
            value: fullName,
            onChangeText: setFullName,
            field: 'fullName',
            autoCapitalize: 'words',
          })}
          {renderInput({
            icon: 'lock-closed-outline',
            emoji: '🔒',
            placeholder: 'Şifre (en az 8 karakter)',
            value: password,
            onChangeText: setPassword,
            secure: true,
            field: 'password',
          })}

          {/* Password Strength Bar */}
          {password.length > 0 && (
            <View style={{ marginBottom: 20, marginTop: -6 }}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: level <= pwStrength.level ? pwStrength.color : COLORS.border,
                    }}
                  />
                ))}
              </View>
              <Text style={{ color: pwStrength.color, fontSize: 12, marginTop: 6, marginLeft: 4, fontWeight: '600' }}>
                {pwStrength.label}
              </Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              marginTop: 8,
              backgroundColor: COLORS.secondary,
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 8px 30px ${COLORS.secondaryGlow}`,
              } : {
                shadowColor: COLORS.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }),
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>🚀</Text>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: 17,
                    fontWeight: '800',
                    letterSpacing: 0.5,
                  }}
                >
                  Hesap Oluştur
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            style={{ marginTop: 24, alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ color: COLORS.mutedLight, fontSize: 15 }}>
              Zaten hesabın var mı?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                Giriş Yap ✈️
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
