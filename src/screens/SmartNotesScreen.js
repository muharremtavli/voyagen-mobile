/**
 * VoyaGen — Smart Notes Screen
 * AI-powered travel notes with Radio Cards for transport and stay options.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  FlatList, ScrollView, Platform, StyleSheet, Alert, Animated, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import COLORS from '../theme/colors';
import * as notesApi from '../api/notes';
import * as routesApi from '../api/routes';

const SmartNotesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { themeKey } = useTheme();
  const [locationInput, setLocationInput] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // AI Response State
  const [aiResult, setAiResult] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(0)).current;

  // Saved Notes & Routes State
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  const fetchData = async () => {
    try {
      setLoadingNotes(true);
      setLoadingRoutes(true);
      const [notesData, routesData] = await Promise.all([
        notesApi.getMyNotes(),
        routesApi.getMyRoutes()
      ]);
      setNotes(notesData);
      setRoutes(routesData);
    } catch (e) {
      console.log('Error fetching data', e?.message);
    } finally {
      setLoadingNotes(false);
      setLoadingRoutes(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();

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

  const handleAskAssistant = async () => {
    if (!locationInput.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen mekan veya şehir adı girin.');
      return;
    }

    setGenerating(true);
    setAiResult(null);
    setSelectedTransport(null);
    setSelectedStay(null);

    try {
      const result = await notesApi.generateNoteAI(locationInput.trim());
      setAiResult(result);
    } catch (e) {
      Alert.alert('Hata', 'Asistan yanıt veremedi: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!aiResult) return;

    setSaving(true);
    try {
      await notesApi.createNote({
        location_name: aiResult.location_name,
        info: aiResult.quick_info || '',
        transport_option: selectedTransport ? `${selectedTransport.type}: ${selectedTransport.details}` : '',
        stay_option: selectedStay ? `${selectedStay.type}: ${selectedStay.details}` : '',
        content: ''
      });
      
      Alert.alert('Başarılı! ✅', 'Notunuz başarıyla kaydedildi.');
      setAiResult(null);
      setLocationInput('');
      await fetchData();
    } catch (e) {
      Alert.alert('Hata', 'Not kaydedilemedi: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Bu ${type === 'note' ? 'notu' : 'rotayı'} silmek istediğinize emin misiniz?`)) {
        try {
          if (type === 'note') await notesApi.deleteNote(id);
          else await routesApi.deleteRoute(id);
          await fetchData();
        } catch (e) {
          window.alert('Silinemedi.');
        }
      }
    } else {
      Alert.alert('Onay', `Bu ${type === 'note' ? 'notu' : 'rotayı'} silmek istediğinize emin misiniz?`, [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: async () => {
            try {
              if (type === 'note') await notesApi.deleteNote(id);
              else await routesApi.deleteRoute(id);
              await fetchData();
            } catch (e) {
              Alert.alert('Hata', 'Silinemedi.');
            }
          }
        }
      ]);
    }
  };

  // Pulse animation for skeleton
  const [pulseAnim] = useState(new Animated.Value(0.5));
  useEffect(() => {
    if (generating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [generating]);

  const renderSkeleton = () => (
    <Animated.View style={[styles.card, { opacity: pulseAnim, marginTop: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, marginRight: 15 }} />
        <View style={{ flex: 1 }}>
          <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6, width: '60%', marginBottom: 8 }} />
          <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, width: '40%' }} />
        </View>
      </View>
      <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, width: '100%', marginBottom: 8 }} />
      <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, width: '90%', marginBottom: 8 }} />
      <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, width: '70%' }} />
    </Animated.View>
  );

  const renderRadioCard = (option, selectedOption, onSelect) => {
    const isSelected = selectedOption?.type === option.type;
    return (
      <TouchableOpacity
        key={option.type}
        activeOpacity={0.8}
        onPress={() => onSelect(option)}
        style={[styles.radioCard, isSelected && styles.radioCardSelected]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={[styles.radioCardTitle, isSelected && { color: colors.primary }]}>{option.type}</Text>
          {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
        </View>
        <Text style={styles.radioCardDesc}>{option.details}</Text>
      </TouchableOpacity>
    );
  };

  const renderAIResult = () => {
    if (!aiResult) return null;

    const canSave = 
      (aiResult.transport_options?.length === 0 || selectedTransport !== null) &&
      (aiResult.stay_options?.length === 0 || selectedStay !== null);

    return (
      <View style={[styles.card, { marginTop: 20, borderTopWidth: 4, borderTopColor: colors.primaryLight }]}>
        {aiResult.image_url ? (
          <Image source={{ uri: aiResult.image_url }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 15 }} resizeMode="cover" />
        ) : null}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}><Ionicons name="bulb" size={18} color="#f0ad4e" /> Hızlı Bilgi</Text>
          <Text style={styles.infoText}>{aiResult.quick_info}</Text>
        </View>

        {aiResult.transport_options?.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}><Ionicons name="bus" size={18} color={colors.primary} /> Ulaşım Seçenekleri</Text>
            <View style={{ gap: 10 }}>
              {aiResult.transport_options.map(opt => renderRadioCard(opt, selectedTransport, setSelectedTransport))}
            </View>
          </View>
        )}

        {aiResult.stay_options?.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}><Ionicons name="bed" size={18} color={colors.primary} /> Konaklama Seçenekleri</Text>
            <View style={{ gap: 10 }}>
              {aiResult.stay_options.map(opt => renderRadioCard(opt, selectedStay, setSelectedStay))}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSaveNote}
          disabled={!canSave || saving}
          style={[styles.saveBtn, (!canSave || saving) && styles.saveBtnDisabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveBtnText}><Ionicons name="save" size={18} /> Notu Kaydet</Text>
          )}
        </TouchableOpacity>
        {!canSave && (
          <Text style={styles.saveHint}>Kaydetmek için ulaşım ve konaklama seçeneklerinden birer tane seçin.</Text>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ padding: 20 }}>
      <View style={[styles.card, { borderWidth: 1.5, borderColor: colors.accent }]}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 16, opacity: 0.8 }}>
          Gittiğin veya gitmeyi planladığın mekanları yaz, yapay zeka senin için ulaşım ve konaklama bilgilerini özetlesin.
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <TextInput
            style={styles.input}
            placeholder="Mekan veya şehir (Örn: Galata)"
            placeholderTextColor={colors.muted}
            value={locationInput}
            onChangeText={setLocationInput}
          />
          <TouchableOpacity
            onPress={handleAskAssistant}
            disabled={generating}
            style={styles.askBtn}
          >
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {generating && renderSkeleton()}
      {renderAIResult()}

      <View style={{ flexDirection: 'row', marginTop: 30, marginBottom: 15, paddingHorizontal: 20 }}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Notlarım
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'routes' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('routes')}
        >
          <Text style={[styles.tabText, activeTab === 'routes' && styles.tabTextActive]}>
            Rotalarım
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNoteCard = ({ item }) => (
    <View style={[styles.card, { marginHorizontal: 20, marginBottom: 15, borderTopWidth: 4, borderTopColor: colors.primaryLight }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800', flex: 1 }}>
          <Ionicons name="location" size={18} color={colors.primaryLight} /> {item.location_name}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, 'note')} style={{ padding: 5 }}>
          <Ionicons name="trash" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>📌 Bilgi</Text>
        <Text style={styles.noteSectionContent}>{item.info || 'Bilgi yok'}</Text>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>🚌 Ulaşım</Text>
        <Text style={styles.noteSectionContent}>{item.transport_option || 'Bilgi yok'}</Text>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>🏨 Konaklama</Text>
        <Text style={styles.noteSectionContent}>{item.stay_option || 'Bilgi yok'}</Text>
      </View>
    </View>
  );

  const renderRouteCard = ({ item }) => (
    <View style={[styles.card, { marginHorizontal: 20, marginBottom: 15, borderTopWidth: 4, borderTopColor: colors.accent }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '800', flex: 1 }}>
          <Ionicons name="map" size={18} color={colors.accent} /> {item.title || `${item.destination} Rotası`}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, 'route')} style={{ padding: 5 }}>
          <Ionicons name="trash" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionContent}>Hedef: <Text style={{ fontWeight: 'bold' }}>{item.destination}</Text></Text>
        <Text style={styles.noteSectionContent}>Süre: <Text style={{ fontWeight: 'bold' }}>{item.days} Gün</Text></Text>
      </View>

      <TouchableOpacity 
        style={[styles.saveBtn, { backgroundColor: colors.accent, marginTop: 15 }]} 
        onPress={() => navigation.navigate('RouteDetail', { routeId: item.id })}
      >
        <Text style={styles.saveBtnText}>Detayları Gör</Text>
      </TouchableOpacity>
    </View>
  );

  if (showSplash) {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', opacity: splashOpacity }}>
        <Image 
          source={require('../../assets/notes_splash.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="cover" 
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { flex: 1, backgroundColor: colors.bg }]} key={themeKey}>
      {(loadingNotes || loadingRoutes) ? (
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {renderHeader()}
          
          {activeTab === 'notes' && (
            notes.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: colors.muted }}>Henüz kayıtlı bir notun yok.</Text>
              </View>
            ) : (
              notes.map(item => (
                <React.Fragment key={`note-${item.id}`}>
                  {renderNoteCard({ item })}
                </React.Fragment>
              ))
            )
          )}

          {activeTab === 'routes' && (
            routes.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: colors.muted }}>Henüz kayıtlı bir rotan yok.</Text>
              </View>
            ) : (
              routes.map(item => (
                <React.Fragment key={`route-${item.id}`}>
                  {renderRouteCard({ item })}
                </React.Fragment>
              ))
            )
          )}
        </ScrollView>
      )}
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    ...(Platform.OS === 'web' ? { boxShadow: `0 4px 15px rgba(0,0,0,0.05)` } : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
    })
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border
  },
  askBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 14
  },
  radioCard: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    backgroundColor: colors.surface
  },
  radioCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(45,79,30,0.05)'
  },
  radioCardTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text
  },
  radioCardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },
  saveBtnDisabled: {
    opacity: 0.5
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15
  },
  saveHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
    marginTop: 8
  },
  noteSection: {
    marginTop: 12
  },
  noteSectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
    marginBottom: 4
  },
  noteSectionContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    alignItems: 'center'
  },
  tabBtnActive: {
    borderBottomColor: colors.primary
  },
  tabText: {
    fontWeight: '600',
    color: colors.muted,
    fontSize: 16
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '800'
  }
});

export default SmartNotesScreen;
