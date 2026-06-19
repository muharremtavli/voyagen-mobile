/**
 * VoyaGen — Home Stack Navigator
 * HomeScreen -> UserProfileScreen
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
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
        name="HomeFeed"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: '✈️ VoyaGen',
          headerTitleStyle: { fontWeight: '900', fontSize: 22, color: colors.primary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate('CreatePost')} style={{ marginLeft: Platform.OS === 'web' ? 15 : 0 }}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('MessagesScreen')} style={{ marginRight: 15 }}>
              <Ionicons name="paper-plane" size={26} color={colors.primary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: '👤 Profil' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '📸 Gönderi Oluştur' }} />
      <Stack.Screen
        name="PostDetail"
        component={require('../screens/PostDetailScreen').default}
        options={{ title: 'Gönderi' }}
      />
      <Stack.Screen
        name="PostFeedScreen"
        component={require('../screens/PostFeedScreen').default}
        options={{ title: 'Gönderiler', headerShown: false }}
      />
      <Stack.Screen
        name="MessagesScreen"
        component={require('../screens/MessagesScreen').default}
        options={{ title: 'Mesajlar' }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={require('../screens/ChatScreen').default}
        options={{ title: 'Sohbet' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
