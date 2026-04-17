import { Audio } from 'expo-av';
import { Platform, Vibration } from 'react-native';

// 🎵 Single alarm sound
let soundAsset: any = null;

const loadSound = async () => {
  if (soundAsset) return;
  if (Platform.OS === 'web') return;
  try {
    soundAsset = require('../../assets/sounds/timesup.mp3');
  } catch {
    console.warn('Sound file not found: assets/sounds/timesup.mp3');
  }
};

export async function playAlarm() {
  if (Platform.OS === 'web') {
    return;
  }

  await loadSound();
  
  if (!soundAsset) {
    return;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(soundAsset);
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play alarm:', error);
  }
}

export function triggerVibration() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Pattern: [delay, vibration duration, delay, vibration, ...]
    Vibration.vibrate([0, 150, 100, 150]);
  } catch (error) {
    console.error('Failed to trigger vibration:', error);
  }
}
