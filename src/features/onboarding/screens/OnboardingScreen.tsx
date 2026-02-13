import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
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
                styles.card,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <View style={styles.tomato} />
              <View style={styles.eyeRow}>
                <View style={styles.eye} />
                <View style={styles.eye} />
              </View>
              <View style={styles.smile} />
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
              onPress={() => {
                triggerShine();
                handleGetStarted();
              }}
            >
              <View style={styles.ctaWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDeep]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>Get Started</Text>

                  <Animated.View
                    style={[
                      styles.shine,
                      { transform: [{ translateX: shineAnim }] },
                    ]}
                  />
                </LinearGradient>
              </View>
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
  },

  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  card: {
    width: 240,
    height: 200,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tomato: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
  },

  eyeRow: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 20,
    top: 90,
  },

  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryDark,
  },

  smile: {
    position: 'absolute',
    top: 110,
    width: 50,
    height: 20,
    borderBottomWidth: 3,
    borderColor: colors.primaryDark,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
