/**
 * VoyaGen — LocationCard Component
 * Premium place card with image, rating, address, and category.
 */
import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';

const LocationCard = ({ location, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      backgroundColor: COLORS.card,
      borderRadius: 18,
      marginHorizontal: 16,
      marginBottom: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: COLORS.border,
    }}
  >
    {/* Image */}
    {location.photo_url ? (
      <Image
        source={{ uri: location.photo_url }}
        style={{ width: '100%', height: 160, backgroundColor: COLORS.surface }}
        resizeMode="cover"
      />
    ) : (
      <View style={{ width: '100%', height: 120, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 40, opacity: 0.4 }}>📍</Text>
      </View>
    )}

    {/* Rating Badge */}
    {location.fsq_rating != null && (
      <View style={{
        position: 'absolute', top: 10, right: 10,
        backgroundColor: COLORS.overlay, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
        flexDirection: 'row', alignItems: 'center',
      }}>
        <Text style={{ color: COLORS.warning, fontSize: 12, fontWeight: '800' }}>
          ⭐ {Number(location.fsq_rating).toFixed(1)}
        </Text>
      </View>
    )}

    {/* Content */}
    <View style={{ padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 }} numberOfLines={1}>
          {location.name}
        </Text>
        {location.category ? (
          <View style={{ backgroundColor: COLORS.primaryGlow, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 7 }}>
            <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '700' }}>{location.category}</Text>
          </View>
        ) : null}
      </View>

      {location.address ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Ionicons name="location-outline" size={13} color={COLORS.muted} />
          <Text style={{ color: COLORS.mutedLight, fontSize: 12, marginLeft: 4, flex: 1 }} numberOfLines={1}>
            {location.address}
          </Text>
        </View>
      ) : null}

      {(location.city || location.country) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="earth-outline" size={13} color={COLORS.muted} />
          <Text style={{ color: COLORS.muted, fontSize: 11, marginLeft: 4 }}>
            {[location.city, location.country].filter(Boolean).join(', ')}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
          paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
          <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '700', marginLeft: 4 }}>Detaylar</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default LocationCard;
