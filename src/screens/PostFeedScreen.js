import React, { useRef, useState, useEffect } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '../components/PostCard';
import { useTheme } from '../contexts/ThemeContext';

const { height: SH, width: SW } = Dimensions.get('window');

const PostFeedScreen = ({ route, navigation }) => {
  const { posts, initialIndex } = route.params;
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(initialIndex || 0);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Hide standard header since we want a full-screen immersive experience
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Back Button Overlay */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => String(item.id)}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({ length: SH, offset: SH * index, index })}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View style={{ height: SH, width: SW, justifyContent: 'center' }}>
            <PostCard 
              post={item} 
              onAuthorPress={(author) => {
                if (author.id) navigation.navigate('UserProfile', { userId: author.id });
              }}
              onPostDeleted={() => {
                // Should ideally update list, but popping back is simpler
                navigation.goBack();
              }}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default PostFeedScreen;
