/**
 * VoyaGen — AI Route Screen (Placeholder)
 */
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';

const AIRouteScreen = () => (
  <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
    <View style={{ width: 100, height: 100, borderRadius: 30, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 }}>
      <Ionicons name="sparkles" size={48} color={COLORS.white} />
    </View>
    <Text style={{ fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 10 }}>AI Rota Planlayıcı</Text>
    <Text style={{ fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 22 }}>
      Yapay zeka destekli kişisel rota önerileri yakında burada!{'\n'}Gemini AI ile hayalindeki geziyi planla. 🤖✈️
    </Text>
    <View style={{ marginTop: 32, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.accent }}>
      <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 13 }}>Çok Yakında</Text>
    </View>
  </View>
);

export default AIRouteScreen;
