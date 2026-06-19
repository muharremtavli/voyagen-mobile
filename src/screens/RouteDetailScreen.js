/**
 * VoyaGen — Route Detail Screen
 * Renders AI generated routes (Timeline UI for JSON, Markdown for legacy).
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, StyleSheet, Image, Modal, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getServerUrl } from '../api/client';
import { getRoute } from '../api/routes';

const parseMarkdownText = (text, colors) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    if (line.startsWith('### ')) {
      return <Text key={index} style={{ color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 16, marginBottom: 8 }}>{line.replace('### ', '')}</Text>;
    }
    if (line.startsWith('## ')) {
      return <Text key={index} style={{ color: colors.accent, fontSize: 22, fontWeight: '900', marginTop: 20, marginBottom: 10 }}>{line.replace('## ', '')}</Text>;
    }
    if (line.startsWith('# ')) {
      return <Text key={index} style={{ color: colors.primary, fontSize: 26, fontWeight: '900', marginTop: 24, marginBottom: 12 }}>{line.replace('# ', '')}</Text>;
    }
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      return (
        <View key={index} style={{ flexDirection: 'row', marginBottom: 6, paddingLeft: 10 }}>
          <Text style={{ color: colors.primary, marginRight: 8, fontSize: 16 }}>•</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 22, flex: 1 }}>{renderBold(content, colors)}</Text>
        </View>
      );
    }
    if (line.trim() === '') {
      return <View key={index} style={{ height: 10 }} />;
    }
    return <Text key={index} style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 24, marginBottom: 8 }}>{renderBold(line, colors)}</Text>;
  });
};

const renderBold = (text, colors) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={i} style={{ color: colors.text, fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>;
    }
    return part;
  });
};

const getProxiedUrl = (url) => {
  if (!url) return null;
  return `${getServerUrl()}/api/v1/routes/proxy-image?url=${encodeURIComponent(url)}`;
};

const renderTimeline = (schedule, title, imageUrl, setLightboxImage, colors) => {
  const proxiedMainImage = getProxiedUrl(imageUrl);
  const styles = createStyles(colors);

  return (
    <View>
      {proxiedMainImage ? (
        <Image source={{ uri: proxiedMainImage }} style={{ width: '100%', height: 220, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 15 }} resizeMode="cover" />
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.primary, marginBottom: 20, alignItems: 'center' }]}>
        <Text style={{ color: colors.onPrimary, fontSize: 20, fontWeight: '800', marginBottom: 5 }}><Ionicons name="map" size={20} color={colors.onPrimary} /> {title}</Text>
        <Text style={{ color: colors.onPrimary, opacity: 0.8, fontSize: 14 }}>{schedule.length} günlük mükemmel rotanız hazır!</Text>
      </View>

      <View style={styles.timelineContainer}>
        <View style={styles.timelineLine} />
        {schedule.map((day, dayIndex) => (
          <View key={dayIndex} style={{ marginBottom: 20 }}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day.day ? `Gün ${day.day}` : day.title || `Gün ${dayIndex + 1}`}</Text>
              {day.title && day.day && <Text style={styles.dayHeaderSubText}>{day.title}</Text>}
            </View>

            {(day.activities || day.items || []).map((act, actIndex) => (
              <View key={actIndex} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  {(act.time || act.hour) && <Text style={styles.timelineTime}>{act.time || act.hour}</Text>}
                  <View style={styles.activityCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        {(act.place_name || act.place || act.name) && (
                          <Text style={styles.activityTitle}>
                            <Ionicons name="location" size={14} color={colors.primaryLight} /> {act.place_name || act.place || act.name}
                          </Text>
                        )}
                        {(act.description || act.detail) && <Text style={styles.activityDesc}>{act.description || act.detail}</Text>}
                        {(act.tip || act.note) && (
                          <View style={styles.activityTip}>
                            <Ionicons name="bulb" size={14} color="#f0ad4e" style={{ marginRight: 4 }} />
                            <Text style={styles.activityTipText}>{act.tip || act.note}</Text>
                          </View>
                        )}
                      </View>
                      {act.image_url && (
                        <TouchableOpacity 
                          onPress={() => setLightboxImage(act.image_url)}
                          style={{ width: 80, height: 80, marginLeft: 12, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.border }}
                        >
                          <Image source={{ uri: getProxiedUrl(act.image_url) }} style={{ width: 80, height: 80 }} resizeMode="cover" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const RouteDetailScreen = ({ route }) => {
  const { colors } = useTheme();
  const params = route.params || {};
  const paramTitle = params.title || params.route?.title || params.route?.destination;
  const paramContent = params.content || params.route?.content;
  const routeId = params.routeId || params.route?.id;
  const [lightboxImage, setLightboxImage] = useState(null);
  
  const [loading, setLoading] = useState(!paramContent && !!routeId);
  const [routeData, setRouteData] = useState({ title: paramTitle, content: paramContent });

  useEffect(() => {
    if (!paramContent && routeId) {
      const fetchRouteData = async () => {
        try {
          const data = await getRoute(routeId);
          setRouteData({ title: data.title || data.destination, content: data.content });
        } catch (e) {
          console.log('Error fetching route', e);
        } finally {
          setLoading(false);
        }
      };
      fetchRouteData();
    }
  }, [routeId, paramContent]);

  let parsedContent = null;
  let isTimeline = false;

  if (routeData.content) {
    try {
      let cleanContent = routeData.content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
      }
      const json = JSON.parse(cleanContent);
      if (json.schedule && Array.isArray(json.schedule)) {
        parsedContent = renderTimeline(json.schedule, routeData.title, json.image_url, setLightboxImage, colors);
        isTimeline = true;
      } else if (Array.isArray(json)) {
        parsedContent = renderTimeline(json, routeData.title, json.image_url, setLightboxImage, colors);
        isTimeline = true;
      }
    } catch (e) {
      // Fallback to markdown
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {isTimeline ? parsedContent : parseMarkdownText(routeData.content, colors)}
        </ScrollView>
      )}

      {/* Lightbox Modal */}
      <Modal visible={!!lightboxImage} transparent={true} animationType="fade" onRequestClose={() => setLightboxImage(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <Pressable style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} onPress={() => setLightboxImage(null)} />
          <TouchableOpacity 
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setLightboxImage(null)}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
          {lightboxImage && (
            <Image 
              source={{ uri: getProxiedUrl(lightboxImage) }} 
              style={{ width: '90%', height: '80%', borderRadius: 12 }} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    ...(Platform.OS === 'web' ? { boxShadow: `0 4px 15px rgba(0,0,0,0.05)` } : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
    })
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 10
  },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.primaryLight,
    opacity: 0.3
  },
  dayHeader: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 1
  },
  dayHeaderText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14
  },
  dayHeaderSubText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingLeft: 30,
    position: 'relative'
  },
  timelineDot: {
    position: 'absolute',
    left: 6,
    top: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 2
  },
  timelineContent: {
    flex: 1
  },
  timelineTime: {
    fontSize: 12,
    color: colors.muted || colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'web' ? { boxShadow: `0 2px 8px rgba(0,0,0,0.03)` } : {
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    })
  },
  activityTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6
  },
  activityDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8
  },
  activityTip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240, 173, 78, 0.1)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'flex-start'
  },
  activityTipText: {
    color: '#d98b25',
    fontSize: 12,
    flex: 1,
    lineHeight: 16
  }
});

export default RouteDetailScreen;
