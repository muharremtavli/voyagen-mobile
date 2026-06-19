/**
 * VoyaGen — Login Screen
 *
 * Premium dark-themed login with travel emojis, animated floating icons,
 * and glassmorphism. Uses useRef for TextInput to fix web focus issues.
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

const { width: SW, height: SH } = Dimensions.get('window');

// Travel emojis for floating animation
const TRAVEL_EMOJIS = ['✈️', '🌍', '🗺️', '🏝️', '🧳', '⛰️', '🚀', '🌅', '🗼', '🏖️', '🧭', '🌄'];

const FloatingEmoji = ({ emoji, delay, duration, startX, startY }) => {
  const animY = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      animY.setValue(0);
      animOpacity.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animY, {
            toValue: -SH * 0.5,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(animOpacity, {
              toValue: 0.35,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: 0.35,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
            Animated.timing(animOpacity, {
              toValue: 0,
              duration: duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: startX,
        bottom: startY,
        fontSize: 24,
        opacity: animOpacity,
        transform: [{ translateY: animY }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

const BackgroundEmojis = React.memo(() => {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1 }} pointerEvents="none">
      {TRAVEL_EMOJIS.map((emoji, i) => (
        <FloatingEmoji
          key={i}
          emoji={emoji}
          delay={i * 800}
          duration={8000 + Math.random() * 4000}
          startX={Math.random() * SW * 0.9}
          startY={Math.random() * 100 - 50}
        />
      ))}
    </View>
  );
});

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Animated values
  const logoScale = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

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

  const renderInput = ({ icon, placeholder, value, onChangeText, secure, field, keyboardType }) => {
    const isFocused = focusedField === field;
    return (
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isFocused ? COLORS.surfaceHover : COLORS.surface,
            borderRadius: 16,
            paddingHorizontal: 18,
            borderWidth: 1.5,
            borderColor: isFocused ? COLORS.primary : COLORS.border,
            ...(isFocused && Platform.OS === 'web' ? {
              boxShadow: `0 0 20px ${COLORS.primaryGlow}`,
            } : {}),
          }}
        >
          <Ionicons name={icon} size={20} color={isFocused ? COLORS.primary : COLORS.muted} />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 18,
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
            autoCapitalize="none"
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Floating Travel Emojis Background */}
      <BackgroundEmojis />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 28,
          maxWidth: 460,
          alignSelf: 'center',
          width: '100%',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <Animated.View style={{ alignItems: 'center', marginBottom: 48, transform: [{ scale: logoScale }] }}>
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 28,
              backgroundColor: COLORS.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 12px 40px ${COLORS.glow}`,
              } : {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
                elevation: 20,
              }),
            }}
          >
            <Text style={{ fontSize: 44 }}>✈️</Text>
          </View>
          <Text
            style={{
              fontSize: 40,
              fontWeight: '900',
              color: COLORS.text,
              letterSpacing: 2,
            }}
          >
            VoyaGen
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: COLORS.mutedLight,
              marginTop: 8,
              letterSpacing: 0.5,
            }}
          >
            🌍 AI Destekli Sosyal Gezi Platformu
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formTranslateY }] }}>
          {renderInput({
            icon: 'person-outline',
            placeholder: 'Kullanıcı adı veya e-posta',
            value: username,
            onChangeText: setUsername,
            field: 'username',
          })}

          {renderInput({
            icon: 'lock-closed-outline',
            placeholder: 'Şifre',
            value: password,
            onChangeText: setPassword,
            secure: true,
            field: 'password',
          })}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              borderRadius: 16,
              paddingVertical: 18,
              alignItems: 'center',
              marginTop: 8,
              backgroundColor: COLORS.primary,
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 8px 30px ${COLORS.glow}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              } : {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }),
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.black} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="log-in-outline" size={20} color={COLORS.black} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 17,
                    fontWeight: '800',
                    letterSpacing: 0.5,
                  }}
                >
                  Giriş Yap
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 28 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
            <Text style={{ color: COLORS.muted, fontSize: 13, marginHorizontal: 16 }}>veya</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
            style={{
              alignItems: 'center',
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: COLORS.secondary,
              backgroundColor: COLORS.secondaryGlow,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>🧳</Text>
              <Text style={{ color: COLORS.secondary, fontSize: 16, fontWeight: '700' }}>
                Yeni Hesap Oluştur
              </Text>
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 20 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: 'center' }}>
              Giriş yaparak keşfe çık 🗺️ yeni rotalar bul
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
