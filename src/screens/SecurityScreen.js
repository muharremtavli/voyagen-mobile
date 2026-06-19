import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { getMyProfile } from '../api/users';
import apiClient from '../api/client';

const SecurityScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getMyProfile();
      setEmail(res.email || '');
      setPhone(res.phone_number || '');
    } catch (e) {
      console.log('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (newPassword && !currentPassword) {
      Alert.alert("Hata", "Yeni şifre belirlemek için mevcut şifrenizi girmelisiniz.");
      return;
    }

    setSaving(true);
    try {
      const payload = { email, phone_number: phone };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      
      const res = await apiClient.put('/users/me/security', payload);
      
      Alert.alert("Başarılı", "Güvenlik ayarlarınız başarıyla güncellendi.");
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      Alert.alert("Hata", e.message || "Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güvenlik</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>E-posta Adresi</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefon Numarası</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Örn: +905554443322"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Şifre Güncelleme</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mevcut Şifre</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="Sadece şifrenizi değiştirecekseniz girin"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yeni Şifre</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color={COLORS.bg} /> : <Text style={styles.saveButtonText}>Güncelle</Text>}
        </TouchableOpacity>
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
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 12, color: COLORS.text, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, borderRadius: 12, color: COLORS.text, fontSize: 16
  },
  saveButton: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 20
  },
  saveButtonText: { color: COLORS.bg, fontSize: 16, fontWeight: 'bold' }
});

export default SecurityScreen;
