import React, { useEffect, useRef } from 'react';
import { Modal as RNModal, View, Text as RNText, Animated, TouchableWithoutFeedback } from 'react-native';
import styles from './Modal.styles';
import type { ModalProps } from './Modal.types';
import { Button } from '../Button';

const Modal = ({
  visible,
  onClose,
  variant = 'bottomSheet',
  title,
  description,
  children,
  actions = [],
  backdropDismiss = true,
}: ModalProps) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 250, useNativeDriver: true }).start();
  }, [visible, anim]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

  return (
    <RNModal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={backdropDismiss ? onClose : undefined}>
        <View style={styles.backdrop}>
          {variant === 'fullScreen' ? (
            <Animated.View style={[styles.container, styles.fullScreen, { transform: [{ translateY }] }]}> 
              {title ? <RNText style={styles.title}>{title}</RNText> : null}
              {description ? <RNText style={styles.description}>{description}</RNText> : null}
              {children}
              <View style={styles.actionsRow}>
                {actions.map((a, i) => (
                  <Button key={i} variant="text" onPress={a.onPress}>{a.label}</Button>
                ))}
              </View>
            </Animated.View>
          ) : variant === 'alert' ? (
            <Animated.View style={[styles.alertContainer, { transform: [{ translateY }] }]}>
              {title ? <RNText style={styles.title}>{title}</RNText> : null}
              {description ? <RNText style={styles.description}>{description}</RNText> : null}
              {children}
              <View style={styles.actionsRow}>
                {actions.map((a, i) => (
                  <Button key={i} variant="text" onPress={a.onPress}>{a.label}</Button>
                ))}
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.container, { transform: [{ translateY }] }]}> 
              {title ? <RNText style={styles.title}>{title}</RNText> : null}
              {description ? <RNText style={styles.description}>{description}</RNText> : null}
              {children}
              <View style={styles.actionsRow}>
                {actions.map((a, i) => (
                  <Button key={i} variant="text" onPress={a.onPress}>{a.label}</Button>
                ))}
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;
