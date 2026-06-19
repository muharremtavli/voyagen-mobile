import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { getMyProfile } from '../api/users';

const AccountInfoScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getMyProfile();
      setUser(res);
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const creationDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <Text style={styles.value}>{user?.username}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Ad Soyad</Text>
          <Text style={styles.value}>{user?.full_name}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Hesap Açılış Tarihi</Text>
          <Text style={styles.value}>{creationDate}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  content: { padding: 20 },
  infoCard: {
    backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border
  },
  label: { fontSize: 12, color: COLORS.primary, fontWeight: 'bold', marginBottom: 4 },
  value: { fontSize: 16, color: COLORS.text, fontWeight: '600' }
});

export default AccountInfoScreen;
