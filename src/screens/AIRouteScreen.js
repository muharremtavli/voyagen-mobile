/**
 * VoyaGen — AI Route Screen
 * Form for generating AI routes + list of user's saved routes.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  FlatList, ScrollView, Platform, Animated, Dimensions, Alert, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import COLORS from '../theme/colors';
import * as routesApi from '../api/routes';

const { width: SW } = Dimensions.get('window');

const AIRouteScreen = ({ navigation }) => {
  const { themeKey } = useTheme();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [preferences, setPreferences] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(0)).current;

  const fetchRoutes = async () => {
    try {
      const data = await routesApi.getMyRoutes();
      setRoutes(data);
    } catch (e) {
      console.log('Error fetching routes', e?.message);
    } finally {
      setLoadingRoutes(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
      
      // Splash Animation
      setShowSplash(true);
      splashOpacity.setValue(0);

      const timer = setTimeout(() => {
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 4000);

      Animated.timing(splashOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      return () => {
        clearTimeout(timer);
        splashOpacity.stopAnimation();
      };
    }, [])
  );

  const handleGenerate = async () => {
    if (!destination.trim() || !days.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen gidilecek yeri ve gün sayısını girin.');
      return;
    }
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 14) {
      Alert.alert('Geçersiz Gün', 'Gün sayısı 1 ile 14 arasında olmalıdır.');
      return;
    }

    setGenerating(true);
    try {
      await routesApi.createRoute({
        destination: destination.trim(),
        days: daysNum,
        preferences: preferences.trim() || null
      });
      setDestination('');
      setDays('');
      setPreferences('');
      Alert.alert('Başarılı! ✨', 'Rotanız başarıyla oluşturuldu.');
      await fetchRoutes();
    } catch (e) {
      Alert.alert('Hata', 'Rota oluşturulamadı: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) {
        try {
          await routesApi.deleteRoute(id);
          await fetchRoutes();
        } catch (e) {
          window.alert('Silinemedi.');
        }
      }
    } else {
      Alert.alert('Onay', 'Bu rotayı silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: async () => {
            try {
              await routesApi.deleteRoute(id);
              await fetchRoutes();
            } catch (e) {
              Alert.alert('Hata', 'Silinemedi.');
            }
          }
        }
      ]);
    }
  };

  const renderHeader = () => (
    <View style={{ padding: 20 }}>
      {/* Form Card */}
      <View style={{
        backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
        borderWidth: 1.5, borderColor: COLORS.accent,
        ...(Platform.OS === 'web' ? { boxShadow: `0 8px 30px ${COLORS.accentGlow}` } : {
          shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10
        })
      }}>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 16 }}>
          ✨ Yeni Rota Planla
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 2 }}>
            <Text style={{ color: COLORS.mutedLight, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Nereye?</Text>
            <TextInput
              style={{ backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border }}
              placeholder="Örn: Paris" placeholderTextColor={COLORS.muted}
              value={destination} onChangeText={setDestination}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.mutedLight, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Kaç Gün?</Text>
            <TextInput
              style={{ backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border }}
              placeholder="Örn: 3" placeholderTextColor={COLORS.muted}
              keyboardType="number-pad" value={days} onChangeText={setDays}
            />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: COLORS.mutedLight, fontSize: 12, marginBottom: 6, fontWeight: '600' }}>Tercihler (Opsiyonel)</Text>
          <TextInput
            style={{ backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border }}
            placeholder="Tarih, sanat, yemek, doğa..." placeholderTextColor={COLORS.muted}
            value={preferences} onChangeText={setPreferences}
          />
        </View>

        <TouchableOpacity
          onPress={handleGenerate} disabled={generating} activeOpacity={0.8}
          style={{ backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
        >
          {generating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={{ color: COLORS.white, fontWeight: '800', fontSize: 15 }}>✨ Rotamı Oluştur</Text>
          )}
        </TouchableOpacity>
        {generating && (
          <Text style={{ color: COLORS.accentLight, textAlign: 'center', marginTop: 12, fontSize: 13 }}>
            Gemini AI en iyi yerleri seçiyor...
          </Text>
        )}
      </View>

      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 30, marginBottom: 10 }}>
        🗺️ Kayıtlı Rotalarım
      </Text>
    </View>
  );

  const renderRouteCard = ({ item }) => (
    <View style={{
      backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, marginBottom: 14, padding: 16,
      borderWidth: 1, borderColor: COLORS.border
    }}>
      <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 6 }}>{item.title}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 16 }}>
        Oluşturulma: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('RouteDetail', { routeId: item.id, title: item.title, content: item.content })}
          style={{ flex: 1, backgroundColor: COLORS.primaryGlow, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 13 }}>Görüntüle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}
        >
          <Ionicons name="trash" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showSplash) {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', opacity: splashOpacity }}>
        <Image 
          source={require('../../assets/route_splash.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="cover" 
        />
      </Animated.View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }} key={themeKey}>
      {loadingRoutes ? (
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {renderHeader()}
          {routes.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontSize: 40, opacity: 0.5 }}>🏜️</Text>
              <Text style={{ color: COLORS.muted, marginTop: 10 }}>Henüz rotanız yok.</Text>
            </View>
          ) : (
            routes.map(item => (
              <React.Fragment key={String(item.id)}>
                {renderRouteCard({ item })}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default AIRouteScreen;
