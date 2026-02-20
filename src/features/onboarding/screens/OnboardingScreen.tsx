import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation/types';
import { spacing } from '../../../core/theme/spacing';
import { colors } from '../../../core/theme/colors';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ROOT.ONBOARDING
> & {
  onComplete?: () => void;
};

export default function OnboardingScreen({ navigation, onComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-150)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [isLoading, setIsLoading] = useState(false);

  // 🌊 Floating animation (like CSS @keyframes float)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  // ✨ Shine animation (button hover effect equivalent)
  const triggerShine = () => {
    shineAnim.setValue(-150);
    Animated.timing(shineAnim, {
      toValue: 300,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  // 🆕 ADDED: Button press animation (scale down then back up)
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  // 🆕 ADDED: Button release animation
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleGetStarted = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await new Promise<void>((resolve) => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => resolve());
      });

      // Call the onComplete callback if provided
      if (onComplete) {
        await onComplete();
      }

      navigation.replace(ROUTES.ROOT.APP, {
        screen: ROUTES.TABS.TIMER,
        params: { screen: ROUTES.TIMER.HOME },
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          
          {/* Top Section */}
          <View style={styles.top}>
            <Text style={styles.logo}>Pomodoom</Text>

            <Animated.View
              style={[
                styles.illustrationContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Image
                source={require('../../../../../assets/focused_tomato.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Middle Section */}
          <View style={styles.middle}>
            <Text style={styles.title}>
              Boost Your Focus,{'\n'}Crush Your Goals.
            </Text>
            <Text style={styles.subtitle}>
              Stay productive with focused sessions and refreshing breaks.
            </Text>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottom}>
            <Pressable
              onPressIn={handlePressIn}  // 🆕 Scale down on press
              onPressOut={handlePressOut} // 🆕 Scale back on release
              onPress={() => {
                triggerShine();
                handleGetStarted();
              }}
            >
              {/* 🆕 ADDED: Animated wrapper for scale transform */}
              <Animated.View
                style={[
                  styles.ctaWrapper,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cta}
                >
                  {/* 🔄 CHANGED: Show loading state if processing */}
                  <Text style={styles.ctaText}>
                    {isLoading ? 'Loading...' : 'Get Started'}
                  </Text>

                  <Animated.View
                    style={[
                      styles.shine,
                      { transform: [{ translateX: shineAnim }] },
                    ]}
                  />
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  top: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl * 2,
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: spacing.lg,
  },

  illustrationContainer: {
    width: 240,
    height: 240, // 🔄 Increased height to accommodate full illustration
    borderRadius: 20,
    backgroundColor: 'transparent', // 🔄 Changed to transparent for better image display
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md, // 🆕 Added padding for image breathing room
  },

  /* 🆕 ADDED: Style for the illustration image */
  illustration: {
    width: '100%',
    height: '100%',
  },

  middle: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  bottom: {
    paddingBottom: spacing.lg,
  },

  ctaWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    // 🆕 ADDED: Shadow for depth (iOS)
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // 🆕 ADDED: Elevation for depth (Android)
    elevation: 5,
  },

  cta: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },

  shine: {
    position: 'absolute',
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    transform: [{ rotate: '20deg' }],
  },
});
