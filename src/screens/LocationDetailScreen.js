/**
 * VoyaGen — Location Detail Screen
 *
 * Premium place detail view with photo gallery, info cards,
 * community ratings, Foursquare tips, and star-based rating form.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Linking,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';
import COLORS from '../theme/colors';
import * as locationsApi from '../api/locations';

const { width: SW } = Dimensions.get('window');

const LocationDetailScreen = ({ route }) => {
  const { fsqId } = route.params;

  const [detail, setDetail] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  // Rating form state
  const [userScore, setUserScore] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchDetail();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [fsqId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const [detailData, ratingsData] = await Promise.all([
        locationsApi.getLocationDetail(fsqId),
        locationsApi.getLocationRatings(fsqId).catch(() => []),
      ]);
      setDetail(detailData);
      setRatings(ratingsData);
    } catch (error) {
      console.log('Detail error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (userScore < 1) {
      Alert.alert('Uyarı', 'Lütfen 1-5 arasında bir puan seçin.');
      return;
    }

    setSubmitting(true);
    try {
      await locationsApi.rateLocation(
        fsqId,
        userScore,
        userComment.trim() || null
      );
      // Refresh data
      await fetchDetail();
      setUserScore(0);
      setUserComment('');
      setShowRatingForm(false);
      Alert.alert('Başarılı! ✨', 'Değerlendirmeniz kaydedildi.');
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Değerlendirme gönderilemedi.';
      Alert.alert('Hata', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = () => {
    if (detail?.latitude && detail?.longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${detail.name}@${detail.latitude},${detail.longitude}`,
        android: `geo:${detail.latitude},${detail.longitude}?q=${detail.name}`,
        default: `https://www.google.com/maps/search/?api=1&query=${detail.latitude},${detail.longitude}`,
      });
      Linking.openURL(url).catch(() => {});
    }
  };

  // ── Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📍</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.muted, marginTop: 12, fontSize: 14 }}>Mekan yükleniyor...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🔭</Text>
        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Mekan bulunamadı</Text>
        <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
          Bu mekan artık erişilebilir değil
        </Text>
      </View>
    );
  }

  const photos = detail.photos && detail.photos.length > 0 ? detail.photos : (detail.photo_url ? [detail.photo_url] : []);

  // ── Star Selector ─────────────────────────────────────
  const StarSelector = ({ score, onSelect, size = 32 }) => (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onSelect(star)} activeOpacity={0.7}>
          <Ionicons
            name={star <= score ? 'star' : 'star-outline'}
            size={size}
            color={star <= score ? COLORS.warning : COLORS.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  // ── Info Card ─────────────────────────────────────────
  const InfoCard = ({ icon, label, value, onPress }) => (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600', marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '600' }} numberOfLines={2}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="open-outline" size={16} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg, opacity: fadeAnim }}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo Gallery */}
      {photos.length > 0 ? (
        <View>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
              setActivePhoto(idx);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: SW, height: 280, backgroundColor: COLORS.surface }}
                resizeMode="cover"
              />
            )}
          />
          {/* Photo indicators */}
          {photos.length > 1 && (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              gap: 6,
            }}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === activePhoto ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === activePhoto ? COLORS.primary : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </View>
          )}
          {/* Photo count badge */}
          <View style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: COLORS.overlay,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
              {photos.length}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{
          width: '100%',
          height: 200,
          backgroundColor: COLORS.surface,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 64, opacity: 0.3 }}>📍</Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900', marginBottom: 6 }}>
            {detail.name}
          </Text>
          {detail.category && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: COLORS.primaryGlow,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 10,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: '700' }}>
                {detail.category}
              </Text>
            </View>
          )}
        </View>

        {/* Ratings Summary */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: COLORS.card,
          borderRadius: 18,
          padding: 18,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
          gap: 16,
        }}>
          {/* Foursquare Rating */}
          {detail.fsq_rating && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: COLORS.warning, fontSize: 28, fontWeight: '900' }}>
                {detail.fsq_rating.toFixed(1)}
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
                ⭐ Foursquare
              </Text>
            </View>
          )}

          {/* Community Rating */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: '900' }}>
              {detail.avg_rating ? detail.avg_rating.toFixed(1) : '—'}
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4, fontWeight: '600' }}>
              🌍 Topluluk ({detail.ratings_count || 0})
            </Text>
          </View>

          {/* Hours */}
          {detail.hours_open_now !== null && detail.hours_open_now !== undefined && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: detail.hours_open_now ? COLORS.success : COLORS.danger,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <Ionicons
                  name={detail.hours_open_now ? 'checkmark' : 'close'}
                  size={16}
                  color={COLORS.white}
                />
              </View>
              <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '600' }}>
                {detail.hours_open_now ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
          )}
        </View>

        {/* Info Cards */}
        {detail.address && (
          <InfoCard icon="📍" label="ADRES" value={detail.address} onPress={openMaps} />
        )}
        {detail.hours_display && (
          <InfoCard icon="🕐" label="ÇALIŞMA SAATLERİ" value={detail.hours_display} />
        )}
        {detail.tel && (
          <InfoCard
            icon="📞"
            label="TELEFON"
            value={detail.tel}
            onPress={() => Linking.openURL(`tel:${detail.tel}`).catch(() => {})}
          />
        )}
        {detail.website && (
          <InfoCard
            icon="🌐"
            label="WEB SİTESİ"
            value={detail.website}
            onPress={() => Linking.openURL(detail.website).catch(() => {})}
          />
        )}
        {detail.description && (
          <InfoCard icon="📝" label="AÇIKLAMA" value={detail.description} />
        )}

        {/* Map Button */}
        {detail.latitude && detail.longitude && (
          <TouchableOpacity
            onPress={openMaps}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.info,
              borderRadius: 14,
              paddingVertical: 14,
              marginTop: 4,
              marginBottom: 20,
              ...(Platform.OS === 'web' ? {
                boxShadow: `0 4px 16px rgba(59, 130, 246, 0.3)`,
              } : {
                shadowColor: COLORS.info,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
              }),
            }}
          >
            <Ionicons name="navigate" size={18} color={COLORS.white} />
            <Text style={{ color: COLORS.white, fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
              Haritada Göster
            </Text>
          </TouchableOpacity>
        )}

        {/* Foursquare Tips */}
        {detail.tips && detail.tips.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 14 }}>
              💬 Foursquare Yorumları
            </Text>
            {detail.tips.map((tip, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: COLORS.card,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text style={{ color: COLORS.textSecondary, fontSize: 14, lineHeight: 22 }}>
                  "{tip.text}"
                </Text>
                {tip.created_at && (
                  <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>
                    {new Date(tip.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Community Ratings */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800' }}>
              🌍 Topluluk Değerlendirmeleri
            </Text>
            <TouchableOpacity
              onPress={() => setShowRatingForm(!showRatingForm)}
              activeOpacity={0.7}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: COLORS.bg, fontWeight: '700', fontSize: 13 }}>
                {showRatingForm ? '✕ İptal' : '⭐ Değerlendir'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rating Form */}
          {showRatingForm && (
            <View style={{
              backgroundColor: COLORS.card,
              borderRadius: 18,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1.5,
              borderColor: COLORS.primary,
            }}>
              <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>
                Bu mekanı nasıl buldunuz?
              </Text>

              {/* Stars */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <StarSelector score={userScore} onSelect={setUserScore} size={38} />
                <Text style={{ color: COLORS.mutedLight, fontSize: 13, marginTop: 8 }}>
                  {userScore === 0 ? 'Puan seçin' : `${userScore}/5 yıldız`}
                </Text>
              </View>

              {/* Comment */}
              <TextInput
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: 12,
                  padding: 14,
                  color: COLORS.text,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                }}
                placeholder="Yorumunuzu yazın (opsiyonel)..."
                placeholderTextColor={COLORS.muted}
                value={userComment}
                onChangeText={setUserComment}
                multiline
                maxLength={500}
              />

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSubmitRating}
                disabled={submitting || userScore < 1}
                activeOpacity={0.8}
                style={{
                  backgroundColor: userScore < 1 ? COLORS.surface : COLORS.primary,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  ...(Platform.OS === 'web' && userScore >= 1 ? {
                    boxShadow: `0 4px 16px ${COLORS.primaryGlow}`,
                  } : {}),
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.bg} />
                ) : (
                  <Text style={{
                    color: userScore < 1 ? COLORS.muted : COLORS.bg,
                    fontWeight: '800',
                    fontSize: 15,
                  }}>
                    Değerlendirmeyi Gönder
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Ratings List */}
          {ratings.length > 0 ? (
            ratings.map((rating, index) => (
              <View
                key={rating.id || index}
                style={{
                  flexDirection: 'row',
                  backgroundColor: COLORS.card,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <UserAvatar
                  uri={rating.user?.profile_image_url}
                  name={rating.user?.full_name || rating.user?.username || '?'}
                  size={42}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 14 }}>
                      {rating.user?.username || 'Anonim'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= rating.score ? 'star' : 'star-outline'}
                          size={14}
                          color={s <= rating.score ? COLORS.warning : COLORS.muted}
                        />
                      ))}
                    </View>
                  </View>
                  {rating.comment && (
                    <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 6, lineHeight: 20 }}>
                      {rating.comment}
                    </Text>
                  )}
                  <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 6 }}>
                    {rating.created_at ? new Date(rating.created_at).toLocaleDateString('tr-TR') : ''}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>⭐</Text>
              <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
                Henüz değerlendirme yok
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                İlk değerlendiren sen ol!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.ScrollView>
  );
};

export default LocationDetailScreen;
