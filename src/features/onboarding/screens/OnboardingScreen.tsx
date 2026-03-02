import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation/types';
import { spacing } from '../../../core/theme/spacing';
import { colors } from '../../../core/theme/colors';
import { Button, Text } from '../../../shared/components';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ROOT.ONBOARDING
> & {
  onComplete?: () => void;
};

export default function OnboardingScreen({ navigation, onComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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
              Boost Your Focus,{'\n'}Crush Your Goals.
            </Text>
            <Text style={styles.subtitle}>
              Achieve more with focused work {'\n'} sessions and refreshing breaks.{'\n'}{'\n'}
              <Text style={{ fontWeight: 'bold' }}>Welcome to Pomodoom!</Text>
            </Text>
          </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottom}>
            <Button
              onPress={handleGetStarted}
              loading={isLoading}
              size="large"
              fullWidth
              style={styles.ctaButton}
              textStyle={styles.ctaText}
            >
              Get Started
            </Button>
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
  },

  bottom: {
    paddingBottom: spacing.lg,
  },

  ctaButton: {
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  ctaText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
