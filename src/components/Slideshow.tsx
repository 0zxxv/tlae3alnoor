import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SlideShowImage } from '../types';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width;

interface SlideshowProps {
  images: SlideShowImage[];
  autoPlay?: boolean;
  interval?: number;
}

export const Slideshow: React.FC<SlideshowProps> = ({
  images,
  autoPlay = true,
  interval = 4000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      setActiveIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * SLIDE_WIDTH,
        animated: true,
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeIndex, autoPlay, images.length, interval]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    if (slideIndex !== activeIndex) {
      setActiveIndex(slideIndex);
    }
  };

  if (images.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
      >
        {images.map((image, index) => (
          <View key={image.id} style={styles.slide}>
            <Image source={{ uri: image.uri }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: 180,
    borderRadius: 0,
    overflow: 'hidden',
    marginRight: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
});

