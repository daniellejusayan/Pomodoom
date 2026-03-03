import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import styles from './ProgressRing.styles';
import type { ProgressRingProps } from './ProgressRing.types';

const AnimatedCircle: any = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#2563EB',
  gradientColors,
  backgroundColor = '#E5E7EB',
  children,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const animated = useRef(new Animated.Value(clampedProgress)).current;
  const gradientId = useRef(`progress-gradient-${Math.random().toString(36).slice(2, 9)}`).current;

  useEffect(() => {
    Animated.timing(animated, { toValue: clampedProgress, duration: 500, useNativeDriver: false }).start();
  }, [clampedProgress, animated]);

  const strokeDashoffset = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {gradientColors && gradientColors.length > 1 ? (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientColors.map((gradientColor, index) => (
                <Stop
                  key={`${gradientColor}-${index}`}
                  offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                  stopColor={gradientColor}
                />
              ))}
            </LinearGradient>
          </Defs>
        ) : null}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientColors && gradientColors.length > 1 ? `url(#${gradientId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {children ? <View style={[styles.center, { width: size, height: size }]}>{children}</View> : null}
    </View>
  );
};

export default ProgressRing;
