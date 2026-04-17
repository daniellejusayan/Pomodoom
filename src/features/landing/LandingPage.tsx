import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors } from '../../core/theme/colors';
import { ROUTES } from '../../navigation/routes';
import { RootStackParamList } from '../../navigation/types';
import { Text } from '../../shared/components';

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.ROOT.WEB_LANDING>;

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pomodoom.app';

export default function LandingPage({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [revealAnim]);

  const titleFontStyle = useMemo(
    () =>
      Platform.select({
        web: { fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' },
        default: {},
      }),
    []
  );

  const openPlayStore = async () => {
    try {
      await Linking.openURL(PLAY_STORE_URL);
    } catch (error) {
      console.error('Failed to open Play Store link:', error);
    }
  };

  const goToApp = () => {
    navigation.navigate(ROUTES.ROOT.APP);
  };

  const heroTransform = {
    opacity: revealAnim,
    transform: [
      {
        translateY: revealAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  } as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.nav}>
          <View style={styles.brandWrap}>
            <Image source={require('../../../assets/icon.png')} style={styles.navIcon} resizeMode="contain" />
            <Text style={[styles.brandText, titleFontStyle]}>Pomodoom</Text>
          </View>
          <Pressable onPress={openPlayStore} style={styles.navCta}>
            <Text style={styles.navCtaText}>Get the App</Text>
          </Pressable>
        </View>

        <LinearGradient colors={[colors.gradientStart, '#d9eaf8', '#f6fbff']} style={[styles.hero, isMobile && styles.heroMobile]}>
          <Animated.View style={[styles.heroLeft, heroTransform]}>
            <Text style={styles.eyebrow}>Pomodoro Timer With Accountability</Text>
            <Text style={[styles.heroTitle, titleFontStyle]}>
              Stay Focused,{"\n"}
              or Pay the Price.
            </Text>
            <Text style={styles.heroSub}>
              Pomodoom is your focus loop with accountability built in. You work, recover, and repeat without drifting.
            </Text>
            <View style={styles.heroActions}>
              <Pressable onPress={openPlayStore} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Download on Google Play</Text>
              </Pressable>
              <Pressable onPress={goToApp} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Open Web App</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={[styles.heroRight, heroTransform]}>
            <View style={styles.mockCard}>
              <Image source={require('../../../assets/icon.png')} style={styles.mockIcon} resizeMode="contain" />
              <Text style={[styles.mockTitle, titleFontStyle]}>Focus Session</Text>
              <Text style={styles.mockTime}>24:37</Text>
              <Text style={styles.mockCaption}>One task only. Protect this sprint.</Text>
              <View style={styles.mockButtons}>
                <View style={styles.mockStop}><Text style={styles.mockStopText}>Stop</Text></View>
                <View style={styles.mockPause}><Text style={styles.mockPauseText}>Pause</Text></View>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.statStrip}>
          <View style={styles.statItem}><Text style={[styles.statNum, titleFontStyle]}>4</Text><Text style={styles.statLabel}>Focus modes</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, titleFontStyle]}>5</Text><Text style={styles.statLabel}>Penalty types</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, titleFontStyle]}>100%</Text><Text style={styles.statLabel}>Local data</Text></View>
          <View style={styles.statItem}><Text style={[styles.statNum, titleFontStyle]}>0</Text><Text style={styles.statLabel}>Ads</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What's Inside</Text>
          <Text style={[styles.sectionTitle, titleFontStyle]}>Everything you need to stay accountable</Text>
          <View style={[styles.featureGrid, isMobile && styles.featureGridMobile]}>
            {[
              { title: 'Pomodoro Timer', desc: 'Configurable focus and break cycles with long-break progression.' },
              { title: 'Penalty System', desc: 'Warning, Reset Timer, Add Time, and Lock Mode for accountability.' },
              { title: 'Session Statistics', desc: 'Track sessions, interruptions, and weekly focus trends.' },
              { title: 'Task List', desc: 'Pin a focus task, reorder items, and keep your task visible.' },
              { title: 'Lock Mode', desc: 'Pause/Stop locks and emergency exit math challenge when strict focus is needed.' },
              { title: 'Private by Design', desc: 'All data remains local on your device and can be cleared anytime.' },
            ].map((item) => (
              <View key={item.title} style={styles.featureCard}>
                <Text style={[styles.featureTitle, titleFontStyle]}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.ctaSection]}>
          <Text style={[styles.ctaTitle, titleFontStyle]}>Ready to stop drifting?</Text>
          <Text style={styles.ctaSub}>Start your first accountable focus session now.</Text>
          <View style={styles.heroActions}>
            <Pressable onPress={goToApp} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Enter Pomodoom</Text>
            </Pressable>
            <Pressable onPress={openPlayStore} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Google Play</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Pomodoom. All data stays on your device.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef5fb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  nav: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74,159,213,0.22)',
    backgroundColor: 'rgba(238,245,251,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f1923',
    letterSpacing: -0.7,
  },
  navCta: {
    backgroundColor: '#4a9fd5',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  navCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  hero: {
    marginTop: 18,
    marginHorizontal: 24,
    borderRadius: 26,
    padding: 28,
    flexDirection: 'row',
    gap: 20,
  },
  heroMobile: {
    flexDirection: 'column',
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,159,213,0.14)',
    color: '#2d6fa3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    color: '#0f1923',
    letterSpacing: -1.6,
  },
  heroSub: {
    marginTop: 16,
    color: '#334155',
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 560,
  },
  heroActions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#4a9fd5',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: 'rgba(15,25,35,0.2)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffffcc',
  },
  secondaryBtnText: {
    color: '#0f1923',
    fontWeight: '700',
    fontSize: 14,
  },
  mockCard: {
    width: 260,
    backgroundColor: '#ffffffee',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(74,159,213,0.22)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#2d6fa3',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  mockIcon: {
    width: 58,
    height: 58,
    borderRadius: 14,
  },
  mockTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f1923',
  },
  mockTime: {
    fontSize: 36,
    fontWeight: '800',
    color: '#2d6fa3',
  },
  mockCaption: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  mockButtons: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  mockStop: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217,79,61,0.2)',
    backgroundColor: 'rgba(217,79,61,0.1)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  mockStopText: {
    color: '#d94f3d',
    fontSize: 12,
    fontWeight: '700',
  },
  mockPause: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74,159,213,0.2)',
    backgroundColor: 'rgba(74,159,213,0.1)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  mockPauseText: {
    color: '#2d6fa3',
    fontSize: 12,
    fontWeight: '700',
  },
  statStrip: {
    marginTop: 20,
    backgroundColor: '#0f1923',
    marginHorizontal: 24,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 14,
  },
  statItem: {
    minWidth: 110,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statNum: {
    fontSize: 30,
    fontWeight: '800',
    color: '#a8d4ee',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    textAlign: 'center',
  },
  section: {
    marginTop: 36,
    marginHorizontal: 24,
  },
  sectionLabel: {
    color: '#4a9fd5',
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '800',
    color: '#0f1923',
    letterSpacing: -1,
    maxWidth: 620,
  },
  featureGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  featureGridMobile: {
    flexDirection: 'column',
  },
  featureCard: {
    width: '32%',
    minWidth: 230,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(74,159,213,0.18)',
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1923',
    letterSpacing: -0.4,
  },
  featureDesc: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 22,
  },
  ctaSection: {
    borderRadius: 22,
    padding: 26,
    backgroundColor: '#dfeefb',
    borderWidth: 1,
    borderColor: 'rgba(74,159,213,0.2)',
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1.3,
    color: '#0f1923',
  },
  ctaSub: {
    marginTop: 8,
    fontSize: 17,
    color: '#334155',
    lineHeight: 28,
  },
  footer: {
    marginTop: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748b',
    fontSize: 13,
  },
});
