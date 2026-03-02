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
import { GuidancePopup } from '../../../shared/components';

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
  const [isGuideVisible, setIsGuideVisible] = useState(true);

  const guideSteps = [
    'Pick your focus duration before each sprint.',
    'Press Start and stay with one task until the timer ends.',
    'Take your break, then jump into your next sprint.',
  ];

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

  const triggerShine = () => {
    shineAnim.setValue(-150);
    Animated.timing(shineAnim, {
      toValue: 300,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

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
                source={require('../../../../assets/focused_tomato.png')}
                style={styles.illustration}
                resizeMode="cover"
              />
            </Animated.View>
                      {/* Middle Section */}
          <View style={styles.middle}>
            <Text style={styles.title}>
              Stay Focused,{'\n'}or Pay the Price.
            </Text>
            <Text style={styles.subtitle}>
              Pomodoom is your focus loop with accountability built in.{"\n"}
              You work, recover, and repeat—without drifting.
            </Text>
            <Pressable onPress={() => setIsGuideVisible(true)} style={styles.guideTrigger}>
              <Text style={styles.guideTriggerText}>Show me how Pomodoom works</Text>
            </Pressable>
          </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottom}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => {
                triggerShine();
                handleGetStarted();
              }}
            >
              <Animated.View
                style={[
                  styles.ctaWrapper,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDeep]}
                  start={{ x: 1, y: 0.05 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cta}
                >
                  <Text style={styles.ctaText}>
                    {isLoading ? 'Loading...' : 'Start My Focus Journey'}
                  </Text>

                  <Animated.View
                    style={[
                      styles.shine,
                      { transform: [{ translateX: shineAnim }, { rotate: '20deg' }] },
                    ]}
                  />
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>

        </Animated.View>

        <GuidancePopup
          visible={isGuideVisible}
          onClose={() => setIsGuideVisible(false)}
          title="Quick Focus Guide"
          description="Three playful rules to win your focus session"
          steps={guideSteps}
          footnote="You can change penalty strictness anytime in Settings."
        />
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: spacing.lg * 2, // 🔄 Increased bottom margin for better spacing with the illustration
    marginTop: 40, // 🔄 Increased top margin for better spacing with the illustration
  },

  illustrationContainer: {
    width: 340,
    height: 340, // 🔄 Increased height to accommodate full illustration
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)', // 🔄 Changed opacity for better image display
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md, // 🆕 Added padding for image breathing room
  },

  /* 🆕 ADDED: Style for the illustration image */
  illustration: {
    width: 320,
    height: 320,
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
    lineHeight: 22,
  },

  guideTrigger: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  guideTriggerText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },

  bottom: {
    paddingBottom: spacing.lg,
  },

  ctaWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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
  },
});
