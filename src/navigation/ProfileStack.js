/**
 * VoyaGen — Profile Stack Navigator
 * ProfileScreen -> EditProfileScreen, PostFeedScreen, etc.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PostFeedScreen from '../screens/PostFeedScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'transparent' },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800' },
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: '✈️ Profilim' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: '✍️ Profili Düzenle' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={require('../screens/PostDetailScreen').default}
        options={{ title: 'Gönderi' }}
      />
      <Stack.Screen
        name="PostFeedScreen"
        component={PostFeedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountInfo"
        component={require('../screens/AccountInfoScreen').default}
        options={{ title: 'Hesap Bilgileri' }}
      />
      <Stack.Screen
        name="Security"
        component={require('../screens/SecurityScreen').default}
        options={{ title: 'Güvenlik' }}
      />
      <Stack.Screen
        name="UserProfile"
        component={require('../screens/UserProfileScreen').default}
        options={{ title: '👤 Profil' }}
      />
      <Stack.Screen
        name="MessagesScreen"
        component={MessagesScreen}
        options={{ title: 'Mesajlar' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ title: 'Sohbet' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
