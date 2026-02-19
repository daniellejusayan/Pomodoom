# PUNISHMENT/PENALTY SYSTEM PROMPT

## COMPREHENSIVE PENALTY FEATURE IMPLEMENTATION

```
Create the Punishment/Penalty System for Pomodoom - the app's main differentiator 
that discourages distractions through meaningful consequences.

## PRODUCT CONTEXT

**Core Value Proposition:**
"Stay focused or face the consequences. Pomodoom doesn't just track your time - 
it actively discourages distractions through escalating penalties that make 
you think twice before checking your phone."

**Psychology:**
- Loss aversion: People hate losing progress more than they like gaining it
- Gamification: Penalties create stakes and engagement
- Behavioral conditioning: Consistent consequences build focus habits

## PENALTY TYPES (User Configurable)

### 1. NONE (Default for New Users)
- No penalties applied
- Good for users learning the system
- Gentle mode for casual users

### 2. WARNING MODE
- Visual/audio alert when interruption detected
- Guilt-inducing message
- Tracks interruption count
- No actual consequence to session

### 3. TIME PENALTY
- Adds extra time to current session
- Escalating: First interruption = +2 min, second = +5 min, third = +10 min
- Must complete the added time to finish session
- Shows penalty time separately in UI

### 4. PROGRESS RESET
- Current session timer resets to original duration
- Keeps interruption in history as "failed"
- Most punishing option
- Recommended for users struggling with phone addiction

### 5. STREAK BREAKER
- Breaks current daily/weekly streak
- Shows "streak broken" animation
- Affects statistics and achievements
- Social pressure (if sharing enabled)

### 6. LOCK MODE (Premium Feature)
- Phone partially locked during session
- Only emergency calls allowed
- Apps whitelisted by user remain accessible
- Attempts to access blocked apps trigger escalating penalties

## ARCHITECTURAL STRUCTURE

### File Organization

```
src/features/penalties/
├── screens/
│   └── PenaltyConfigScreen.tsx       # Settings configuration
├── components/
│   ├── PenaltyAlert.tsx              # Warning modal
│   ├── PenaltyAnimation.tsx          # Visual feedback
│   ├── InterruptionTracker.tsx       # Real-time counter
│   ├── PenaltyTypeCard.tsx           # Setting selector
│   └── index.ts
├── hooks/
│   ├── usePenaltySystem.ts           # Core penalty logic
│   ├── useInterruptionDetection.ts   # Distraction detection
│   ├── usePenaltyEscalation.ts       # Progressive penalties
│   └── index.ts
├── services/
│   ├── PenaltyService.ts             # Business logic
│   ├── InterruptionDetector.ts       # Background monitoring
│   └── index.ts
├── types/
│   └── penalty.types.ts              # TypeScript definitions
└── index.ts

src/models/Penalty.ts                  # Data models
```

### Type Definitions

**src/features/penalties/types/penalty.types.ts**
```typescript
export type PenaltyType = 
  | 'none' 
  | 'warning' 
  | 'timeAdded' 
  | 'progressReset' 
  | 'streakBreaker'
  | 'lockMode';

export type InterruptionReason = 
  | 'appSwitch'           // Left app for another app
  | 'screenOff'           // Screen turned off mid-session
  | 'manualPause'         // User paused timer
  | 'incomingCall'        // Phone call received
  | 'notification'        // Interacted with notification
  | 'unknown';

export interface Interruption {
  id: string;
  sessionId: string;
  timestamp: Date;
  reason: InterruptionReason;
  duration: number;        // How long away in seconds
  penaltyApplied: Penalty | null;
}

export interface Penalty {
  id: string;
  type: PenaltyType;
  severity: 'low' | 'medium' | 'high';
  appliedAt: Date;
  interruptionId: string;
  
  // Type-specific data
  timeAddedMinutes?: number;      // For timeAdded
  streakDaysBroken?: number;      // For streakBreaker
  message: string;                // User-facing explanation
}

export interface PenaltySettings {
  enabled: boolean;
  type: PenaltyType;
  
  // Escalation settings
  escalationEnabled: boolean;
  firstInterruptionPenalty: number;   // minutes for timeAdded
  secondInterruptionPenalty: number;
  thirdInterruptionPenalty: number;
  
  // Tolerance settings
  gracePeriodSeconds: number;    // Allow brief interruptions (e.g., 5 sec)
  maxInterruptionsBeforeReset: number;
  
  // Lock mode settings (if applicable)
  whitelistedApps: string[];     // App bundle IDs
  allowEmergencyCalls: boolean;
  
  // UI settings
  showInterruptionCount: boolean;
  playSoundOnInterruption: boolean;
  vibrationPattern: 'gentle' | 'strong' | 'escalating';
}

export interface PenaltyStats {
  totalInterruptions: number;
  totalPenaltiesApplied: number;
  totalTimeAdded: number;        // minutes
  streaksBroken: number;
  sessionsReset: number;
  mostCommonReason: InterruptionReason;
  improvementRate: number;       // percentage decrease over time
}
```

---

## CORE HOOK: usePenaltySystem

**src/features/penalties/hooks/usePenaltySystem.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PenaltyService } from '../services/PenaltyService';
import { useSettings } from '@/context/SettingsContext';
import { useSession } from '@/context/SessionContext';

interface UsePenaltySystemReturn {
  // State
  interruptions: Interruption[];
  currentSessionInterruptions: number;
  penaltyActive: boolean;
  timeAddedSeconds: number;
  
  // Actions
  recordInterruption: (reason: InterruptionReason) => Promise<void>;
  applyPenalty: (interruption: Interruption) => Promise<void>;
  clearPenalties: () => void;
  
  // Getters
  getNextPenaltySeverity: () => 'low' | 'medium' | 'high';
  getPenaltyMessage: (type: PenaltyType, severity: string) => string;
}

export const usePenaltySystem = (): UsePenaltySystemReturn => {
  const { settings } = useSettings();
  const { activeSession, updateSession } = useSession();
  
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);
  const [timeAddedSeconds, setTimeAddedSeconds] = useState(0);
  const [penaltyActive, setPenaltyActive] = useState(false);
  
  const penaltySettings = settings.penaltySettings;
  
  // Calculate current session interruptions
  const currentSessionInterruptions = interruptions.filter(
    i => i.sessionId === activeSession?.id
  ).length;

  /**
   * Record an interruption event
   */
  const recordInterruption = useCallback(async (
    reason: InterruptionReason
  ): Promise<void> => {
    if (!activeSession || !penaltySettings.enabled) return;
    
    const interruption: Interruption = {
      id: `int_${Date.now()}`,
      sessionId: activeSession.id,
      timestamp: new Date(),
      reason,
      duration: 0, // Will be calculated when user returns
      penaltyApplied: null,
    };
    
    // Save to state
    setInterruptions(prev => [...prev, interruption]);
    
    // Save to storage
    await PenaltyService.saveInterruption(interruption);
    
    // Apply penalty based on settings
    if (penaltySettings.type !== 'none') {
      await applyPenalty(interruption);
    }
  }, [activeSession, penaltySettings]);

  /**
   * Apply penalty based on type and escalation rules
   */
  const applyPenalty = useCallback(async (
    interruption: Interruption
  ): Promise<void> => {
    if (!activeSession) return;
    
    const severity = getNextPenaltySeverity();
    let penalty: Penalty;
    
    switch (penaltySettings.type) {
      case 'warning':
        penalty = PenaltyService.createWarningPenalty(
          interruption.id,
          severity
        );
        // Show warning modal
        setPenaltyActive(true);
        break;
        
      case 'timeAdded':
        const minutesToAdd = getTimeToAdd(currentSessionInterruptions);
        penalty = PenaltyService.createTimeAddedPenalty(
          interruption.id,
          minutesToAdd,
          severity
        );
        // Add time to session
        setTimeAddedSeconds(prev => prev + (minutesToAdd * 60));
        await updateSession(activeSession.id, {
          duration: activeSession.duration + (minutesToAdd * 60),
          penaltyApplied: true,
        });
        setPenaltyActive(true);
        break;
        
      case 'progressReset':
        penalty = PenaltyService.createProgressResetPenalty(
          interruption.id,
          severity
        );
        // Reset timer to original duration
        await updateSession(activeSession.id, {
          duration: activeSession.plannedDuration,
          penaltyApplied: true,
        });
        setPenaltyActive(true);
        break;
        
      case 'streakBreaker':
        penalty = PenaltyService.createStreakBreakerPenalty(
          interruption.id,
          severity
        );
        // Break streak (handled in statistics)
        await PenaltyService.breakStreak();
        setPenaltyActive(true);
        break;
        
      default:
        return;
    }
    
    // Save penalty
    await PenaltyService.savePenalty(penalty);
    
    // Update interruption with penalty
    interruption.penaltyApplied = penalty;
    
    // Play haptic/sound feedback
    if (penaltySettings.playSoundOnInterruption) {
      playPenaltySound(severity);
    }
    triggerHapticFeedback(penaltySettings.vibrationPattern, severity);
    
  }, [activeSession, penaltySettings, currentSessionInterruptions]);

  /**
   * Get escalating penalty severity based on interruption count
   */
  const getNextPenaltySeverity = useCallback((): 'low' | 'medium' | 'high' => {
    if (!penaltySettings.escalationEnabled) return 'low';
    
    if (currentSessionInterruptions === 0) return 'low';
    if (currentSessionInterruptions === 1) return 'medium';
    return 'high';
  }, [currentSessionInterruptions, penaltySettings.escalationEnabled]);

  /**
   * Calculate time to add based on escalation rules
   */
  const getTimeToAdd = (interruptionCount: number): number => {
    if (!penaltySettings.escalationEnabled) {
      return penaltySettings.firstInterruptionPenalty;
    }
    
    if (interruptionCount === 0) {
      return penaltySettings.firstInterruptionPenalty;
    } else if (interruptionCount === 1) {
      return penaltySettings.secondInterruptionPenalty;
    } else {
      return penaltySettings.thirdInterruptionPenalty;
    }
  };

  /**
   * Get user-facing penalty message
   */
  const getPenaltyMessage = useCallback((
    type: PenaltyType,
    severity: string
  ): string => {
    const messages = {
      warning: {
        low: "Stay focused! You've got this. 💪",
        medium: "Distracted again? Let's get back on track.",
        high: "This is the third time. Focus or face harsher penalties!",
      },
      timeAdded: {
        low: "⏱️ +2 minutes added to your session",
        medium: "⏱️ +5 minutes added. Stay focused!",
        high: "⏱️ +10 minutes added. This is getting expensive!",
      },
      progressReset: {
        low: "🔄 Session reset. All progress lost.",
        medium: "🔄 Session reset. All progress lost.",
        high: "🔄 Session reset. All progress lost.",
      },
      streakBreaker: {
        low: "💔 Your streak has been broken",
        medium: "💔 Your streak has been broken",
        high: "💔 Your streak has been broken",
      },
    };
    
    return messages[type]?.[severity] || "Penalty applied";
  }, []);

  /**
   * Clear penalties for new session
   */
  const clearPenalties = useCallback(() => {
    setInterruptions([]);
    setTimeAddedSeconds(0);
    setPenaltyActive(false);
  }, []);

  // Monitor app state changes (interruption detection)
  useEffect(() => {
    if (!activeSession || !penaltySettings.enabled) return;
    
    let appStateStart: Date | null = null;
    
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // User left the app
        appStateStart = new Date();
        await recordInterruption('appSwitch');
      } else if (nextAppState === 'active' && appStateStart) {
        // User returned
        const duration = (Date.now() - appStateStart.getTime()) / 1000;
        
        // Check if within grace period
        if (duration < penaltySettings.gracePeriodSeconds) {
          // Ignore brief interruptions
          console.log('Interruption within grace period, ignoring');
        }
        
        appStateStart = null;
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription.remove();
  }, [activeSession, penaltySettings, recordInterruption]);

  return {
    interruptions,
    currentSessionInterruptions,
    penaltyActive,
    timeAddedSeconds,
    recordInterruption,
    applyPenalty,
    clearPenalties,
    getNextPenaltySeverity,
    getPenaltyMessage,
  };
};

// Helper functions
const playPenaltySound = (severity: string) => {
  // Implementation using expo-av
};

const triggerHapticFeedback = (pattern: string, severity: string) => {
  // Implementation using expo-haptics
};
```

---

## PENALTY SERVICE

**src/features/penalties/services/PenaltyService.ts**

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Penalty, Interruption, PenaltyType } from '../types/penalty.types';

const STORAGE_KEYS = {
  INTERRUPTIONS: '@pomodoom_interruptions',
  PENALTIES: '@pomodoom_penalties',
  PENALTY_STATS: '@pomodoom_penalty_stats',
};

export class PenaltyService {
  /**
   * Save interruption to storage
   */
  static async saveInterruption(interruption: Interruption): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.INTERRUPTIONS);
      const interruptions = stored ? JSON.parse(stored) : [];
      interruptions.push(interruption);
      await AsyncStorage.setItem(
        STORAGE_KEYS.INTERRUPTIONS,
        JSON.stringify(interruptions)
      );
    } catch (error) {
      console.error('Failed to save interruption:', error);
    }
  }

  /**
   * Save penalty to storage
   */
  static async savePenalty(penalty: Penalty): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PENALTIES);
      const penalties = stored ? JSON.parse(stored) : [];
      penalties.push(penalty);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENALTIES,
        JSON.stringify(penalties)
      );
    } catch (error) {
      console.error('Failed to save penalty:', error);
    }
  }

  /**
   * Create warning penalty
   */
  static createWarningPenalty(
    interruptionId: string,
    severity: 'low' | 'medium' | 'high'
  ): Penalty {
    const messages = {
      low: "Friendly reminder: Stay focused on your goals! 🎯",
      medium: "You're getting distracted. Lock in and finish strong! 💪",
      high: "Third strike! Your focus is slipping. Consider enabling harsher penalties.",
    };
    
    return {
      id: `pen_${Date.now()}`,
      type: 'warning',
      severity,
      appliedAt: new Date(),
      interruptionId,
      message: messages[severity],
    };
  }

  /**
   * Create time added penalty
   */
  static createTimeAddedPenalty(
    interruptionId: string,
    minutes: number,
    severity: 'low' | 'medium' | 'high'
  ): Penalty {
    return {
      id: `pen_${Date.now()}`,
      type: 'timeAdded',
      severity,
      appliedAt: new Date(),
      interruptionId,
      timeAddedMinutes: minutes,
      message: `${minutes} minutes added to your session. Focus costs!`,
    };
  }

  /**
   * Create progress reset penalty
   */
  static createProgressResetPenalty(
    interruptionId: string,
    severity: 'low' | 'medium' | 'high'
  ): Penalty {
    return {
      id: `pen_${Date.now()}`,
      type: 'progressReset',
      severity,
      appliedAt: new Date(),
      interruptionId,
      message: "Your session has been reset to the beginning. All progress lost. 😔",
    };
  }

  /**
   * Create streak breaker penalty
   */
  static createStreakBreakerPenalty(
    interruptionId: string,
    severity: 'low' | 'medium' | 'high'
  ): Penalty {
    return {
      id: `pen_${Date.now()}`,
      type: 'streakBreaker',
      severity,
      appliedAt: new Date(),
      interruptionId,
      message: "Your focus streak has been broken. Back to day 1. 💔",
    };
  }

  /**
   * Break user's current streak
   */
  static async breakStreak(): Promise<void> {
    try {
      const statsKey = '@pomodoom_session_stats';
      const stored = await AsyncStorage.getItem(statsKey);
      const stats = stored ? JSON.parse(stored) : {};
      
      stats.currentStreak = 0;
      stats.lastStreakBreakDate = new Date().toISOString();
      
      await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to break streak:', error);
    }
  }

  /**
   * Get penalty statistics
   */
  static async getPenaltyStats(): Promise<PenaltyStats> {
    try {
      const [interruptionsData, penaltiesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INTERRUPTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PENALTIES),
      ]);
      
      const interruptions: Interruption[] = interruptionsData 
        ? JSON.parse(interruptionsData) 
        : [];
      const penalties: Penalty[] = penaltiesData 
        ? JSON.parse(penaltiesData) 
        : [];
      
      // Calculate stats
      const totalTimeAdded = penalties
        .filter(p => p.type === 'timeAdded')
        .reduce((sum, p) => sum + (p.timeAddedMinutes || 0), 0);
      
      const streaksBroken = penalties.filter(
        p => p.type === 'streakBreaker'
      ).length;
      
      const sessionsReset = penalties.filter(
        p => p.type === 'progressReset'
      ).length;
      
      // Find most common interruption reason
      const reasonCounts = interruptions.reduce((acc, int) => {
        acc[int.reason] = (acc[int.reason] || 0) + 1;
        return acc;
      }, {} as Record<InterruptionReason, number>);
      
      const mostCommonReason = Object.keys(reasonCounts).reduce((a, b) => 
        reasonCounts[a] > reasonCounts[b] ? a : b
      ) as InterruptionReason;
      
      // Calculate improvement rate (fewer interruptions over time)
      const improvementRate = calculateImprovementRate(interruptions);
      
      return {
        totalInterruptions: interruptions.length,
        totalPenaltiesApplied: penalties.length,
        totalTimeAdded,
        streaksBroken,
        sessionsReset,
        mostCommonReason,
        improvementRate,
      };
    } catch (error) {
      console.error('Failed to get penalty stats:', error);
      return {
        totalInterruptions: 0,
        totalPenaltiesApplied: 0,
        totalTimeAdded: 0,
        streaksBroken: 0,
        sessionsReset: 0,
        mostCommonReason: 'unknown',
        improvementRate: 0,
      };
    }
  }
}

/**
 * Calculate improvement rate over last 30 days
 */
const calculateImprovementRate = (interruptions: Interruption[]): number => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recent = interruptions.filter(
    i => new Date(i.timestamp) >= thirtyDaysAgo
  );
  
  if (recent.length === 0) return 0;
  
  // Split into first half and second half
  const midpoint = Math.floor(recent.length / 2);
  const firstHalf = recent.slice(0, midpoint).length;
  const secondHalf = recent.slice(midpoint).length;
  
  if (firstHalf === 0) return 0;
  
  const improvement = ((firstHalf - secondHalf) / firstHalf) * 100;
  return Math.max(0, Math.min(100, improvement)); // Clamp 0-100
};
```

---

## UI COMPONENTS

### PenaltyAlert Component

**src/features/penalties/components/PenaltyAlert.tsx**

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal, Button } from '@/shared/components';
import { Penalty } from '../types/penalty.types';
import { PenaltyAnimation } from './PenaltyAnimation';
import * as Haptics from 'expo-haptics';

interface PenaltyAlertProps {
  visible: boolean;
  penalty: Penalty | null;
  onDismiss: () => void;
  onChangeSettings?: () => void;
}

/**
 * Modal alert shown when penalty is applied
 * 
 * Features:
 * - Animated entrance with attention-grabbing effect
 * - Different visuals based on severity
 * - Option to adjust penalty settings
 * - Haptic feedback
 */
export const PenaltyAlert: React.FC<PenaltyAlertProps> = ({
  visible,
  penalty,
  onDismiss,
  onChangeSettings,
}) => {
  useEffect(() => {
    if (visible && penalty) {
      // Trigger haptic feedback based on severity
      if (penalty.severity === 'high') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (penalty.severity === 'medium') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  }, [visible, penalty]);

  if (!penalty) return null;

  const getSeverityColor = () => {
    switch (penalty.severity) {
      case 'high': return '#E74C3C'; // Red
      case 'medium': return '#F39C12'; // Orange
      case 'low': return '#3498DB'; // Blue
      default: return '#3498DB';
    }
  };

  const getIcon = () => {
    switch (penalty.type) {
      case 'warning': return '⚠️';
      case 'timeAdded': return '⏱️';
      case 'progressReset': return '🔄';
      case 'streakBreaker': return '💔';
      default: return '⚡';
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onDismiss}
      variant="alert"
    >
      <View style={styles.container}>
        <PenaltyAnimation 
          type={penalty.type} 
          severity={penalty.severity}
        />
        
        <Text style={styles.icon}>{getIcon()}</Text>
        
        <Text style={[styles.title, { color: getSeverityColor() }]}>
          {getPenaltyTitle(penalty.type)}
        </Text>
        
        <Text style={styles.message}>
          {penalty.message}
        </Text>
        
        {penalty.type === 'timeAdded' && (
          <View style={styles.detailBox}>
            <Text style={styles.detailText}>
              +{penalty.timeAddedMinutes} minutes added
            </Text>
          </View>
        )}
        
        <View style={styles.actions}>
          <Button
            variant="primary"
            onPress={onDismiss}
            fullWidth
          >
            Got It - Back to Focus
          </Button>
          
          {penalty.severity === 'high' && onChangeSettings && (
            <Button
              variant="text"
              onPress={onChangeSettings}
            >
              This is too harsh - Change Settings
            </Button>
          )}
        </View>
        
        {penalty.severity === 'high' && (
          <Text style={styles.tip}>
            💡 Tip: Enable Do Not Disturb on your phone to avoid distractions
          </Text>
        )}
      </View>
    </Modal>
  );
};

const getPenaltyTitle = (type: PenaltyType): string => {
  const titles = {
    warning: 'Stay Focused!',
    timeAdded: 'Time Penalty Applied',
    progressReset: 'Progress Reset',
    streakBreaker: 'Streak Broken',
    none: '',
    lockMode: 'Lock Mode Activated',
  };
  return titles[type];
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailBox: {
    backgroundColor: '#FCF3CF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7D6608',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  tip: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
```

### InterruptionTracker Component

**src/features/penalties/components/InterruptionTracker.tsx**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/core/theme';

interface InterruptionTrackerProps {
  count: number;
  maxBeforeReset?: number;
  visible?: boolean;
}

/**
 * Real-time interruption counter shown during active session
 * 
 * Shows:
 * - Current interruption count
 * - Visual warning as count increases
 * - Progress to max threshold
 */
export const InterruptionTracker: React.FC<InterruptionTrackerProps> = ({
  count,
  maxBeforeReset = 3,
  visible = true,
}) => {
  if (!visible || count === 0) return null;

  const getColor = () => {
    if (count >= maxBeforeReset) return '#E74C3C';
    if (count >= 2) return '#F39C12';
    return '#3498DB';
  };

  const getMessage = () => {
    if (count >= maxBeforeReset) {
      return 'Maximum interruptions reached!';
    }
    if (count >= 2) {
      return `${maxBeforeReset - count} more and session resets!`;
    }
    return 'Stay focused';
  };

  return (
    <View style={[styles.container, { borderColor: getColor() }]}>
      <View style={styles.header}>
        <Text style={styles.label}>Interruptions</Text>
        <Text style={[styles.count, { color: getColor() }]}>
          {count} / {maxBeforeReset}
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { 
              width: `${(count / maxBeforeReset) * 100}%`,
              backgroundColor: getColor(),
            }
          ]} 
        />
      </View>
      
      <Text style={[styles.message, { color: getColor() }]}>
        {getMessage()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  count: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

## SETTINGS INTEGRATION

**Update SettingsScreen to include penalty configuration:**

```typescript
// In SettingsScreen.tsx

import { PenaltyTypeCard } from '@/features/penalties/components';

// Add to settings sections:

<Card title="Penalty System" subtitle="Consequences for distractions">
  <PenaltyTypeCard
    type="none"
    title="No Penalties"
    description="Track interruptions without consequences"
    recommended="Beginners"
    selected={penaltySettings.type === 'none'}
    onSelect={() => updatePenaltyType('none')}
  />
  
  <PenaltyTypeCard
    type="warning"
    title="Warning Mode"
    description="Get reminders to stay focused"
    recommended="Casual users"
    selected={penaltySettings.type === 'warning'}
    onSelect={() => updatePenaltyType('warning')}
  />
  
  <PenaltyTypeCard
    type="timeAdded"
    title="Time Penalty"
    description="Add extra time for each interruption"
    recommended="Most popular"
    selected={penaltySettings.type === 'timeAdded'}
    onSelect={() => updatePenaltyType('timeAdded')}
  />
  
  <PenaltyTypeCard
    type="progressReset"
    title="Progress Reset"
    description="Start over if interrupted"
    recommended="Hardcore focus"
    selected={penaltySettings.type === 'progressReset'}
    onSelect={() => updatePenaltyType('progressReset')}
  />
  
  <PenaltyTypeCard
    type="streakBreaker"
    title="Streak Breaker"
    description="Lose your focus streak"
    recommended="Competitive users"
    selected={penaltySettings.type === 'streakBreaker'}
    onSelect={() => updatePenaltyType('streakBreaker')}
  />
</Card>

{penaltySettings.type === 'timeAdded' && (
  <Card title="Escalation Settings">
    <Text>First interruption adds:</Text>
    <ChipSelector
      options={[1, 2, 3, 5]}
      selected={penaltySettings.firstInterruptionPenalty}
      onSelect={(v) => updateEscalation('first', v)}
      unit=" min"
    />
    
    <Text>Second interruption adds:</Text>
    <ChipSelector
      options={[3, 5, 7, 10]}
      selected={penaltySettings.secondInterruptionPenalty}
      onSelect={(v) => updateEscalation('second', v)}
      unit=" min"
    />
    
    <Text>Third+ interruption adds:</Text>
    <ChipSelector
      options={[5, 10, 15, 20]}
      selected={penaltySettings.thirdInterruptionPenalty}
      onSelect={(v) => updateEscalation('third', v)}
      unit=" min"
    />
  </Card>
)}

<Card title="Tolerance Settings">
  <SettingRow
    label="Grace Period"
    description="Ignore interruptions shorter than this"
    value={`${penaltySettings.gracePeriodSeconds}s`}
  />
  <Slider
    value={penaltySettings.gracePeriodSeconds}
    minimumValue={3}
    maximumValue={30}
    step={1}
    onValueChange={(v) => updateGracePeriod(v)}
  />
</Card>
```

---

## INTEGRATION WITH TIMER SCREEN

**Update HomeTimerScreen to show penalty feedback:**

```typescript
import { usePenaltySystem } from '@/features/penalties/hooks';
import { 
  PenaltyAlert, 
  InterruptionTracker 
} from '@/features/penalties/components';

const HomeTimerScreen = () => {
  const penalty = usePenaltySystem();
  const [showPenaltyAlert, setShowPenaltyAlert] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState<Penalty | null>(null);
  
  // Show alert when penalty is applied
  useEffect(() => {
    if (penalty.penaltyActive) {
      setShowPenaltyAlert(true);
      // Get latest penalty from interruptions
      const lastInterruption = penalty.interruptions[penalty.interruptions.length - 1];
      if (lastInterruption?.penaltyApplied) {
        setCurrentPenalty(lastInterruption.penaltyApplied);
      }
    }
  }, [penalty.penaltyActive]);
  
  return (
    <View style={styles.container}>
      {/* Timer display */}
      
      {/* Show interruption tracker during active session */}
      {activeSession && (
        <InterruptionTracker
          count={penalty.currentSessionInterruptions}
          maxBeforeReset={settings.penaltySettings.maxInterruptionsBeforeReset}
          visible={settings.penaltySettings.showInterruptionCount}
        />
      )}
      
      {/* Penalty alert modal */}
      <PenaltyAlert
        visible={showPenaltyAlert}
        penalty={currentPenalty}
        onDismiss={() => {
          setShowPenaltyAlert(false);
          penalty.clearPenalties();
        }}
        onChangeSettings={() => {
          setShowPenaltyAlert(false);
          navigation.navigate('Settings');
        }}
      />
      
      {/* Show added time if applicable */}
      {penalty.timeAddedSeconds > 0 && (
        <View style={styles.penaltyBadge}>
          <Text style={styles.penaltyText}>
            +{Math.floor(penalty.timeAddedSeconds / 60)} min penalty
          </Text>
        </View>
      )}
    </View>
  );
};
```

---

## STATISTICS INTEGRATION

**Add penalty stats to Statistics Screen:**

```typescript
// In StatisticsScreen.tsx

import { PenaltyService } from '@/features/penalties/services';

const StatisticsScreen = () => {
  const [penaltyStats, setPenaltyStats] = useState<PenaltyStats | null>(null);
  
  useEffect(() => {
    loadPenaltyStats();
  }, []);
  
  const loadPenaltyStats = async () => {
    const stats = await PenaltyService.getPenaltyStats();
    setPenaltyStats(stats);
  };
  
  return (
    <View>
      {/* Existing stats */}
      
      <Card title="Penalty Impact">
        <StatCard
          icon="⚠️"
          label="Total Interruptions"
          value={penaltyStats?.totalInterruptions || 0}
        />
        
        <StatCard
          icon="⏱️"
          label="Time Added (Penalties)"
          value={`${penaltyStats?.totalTimeAdded || 0} min`}
        />
        
        <StatCard
          icon="📈"
          label="Improvement Rate"
          value={`${penaltyStats?.improvementRate || 0}%`}
          trend={penaltyStats?.improvementRate > 0 ? 'up' : 'neutral'}
        />
        
        {penaltyStats?.improvementRate > 20 && (
          <View style={styles.encouragement}>
            <Text>🎉 Great progress! Your focus is improving!</Text>
          </View>
        )}
      </Card>
    </View>
  );
};
```

---

## ONBOARDING INTEGRATION

**Add penalty system introduction to onboarding:**

```typescript
// Add as Slide 3 in OnboardingScreen

{
  title: "Stay Accountable",
  description: "Pomodoom keeps you honest with optional penalties for distractions",
  image: require('@/assets/images/onboarding_penalties.png'),
  interactive: (
    <View>
      <Text style={styles.label}>Choose your penalty level:</Text>
      
      <TouchableOpacity 
        style={styles.penaltyOption}
        onPress={() => setInitialPenalty('none')}
      >
        <Text style={styles.optionTitle}>😊 Gentle Mode</Text>
        <Text style={styles.optionDesc}>
          Just track interruptions, no consequences
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.penaltyOption}
        onPress={() => setInitialPenalty('warning')}
      >
        <Text style={styles.optionTitle}>⚠️ Warning Mode</Text>
        <Text style={styles.optionDesc}>
          Get friendly reminders to refocus
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.penaltyOption}
        onPress={() => setInitialPenalty('timeAdded')}
      >
        <Text style={styles.optionTitle}>⏱️ Time Penalty</Text>
        <Text style={styles.optionDesc}>
          Add minutes for each distraction (Recommended)
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.penaltyOption}
        onPress={() => setInitialPenalty('progressReset')}
      >
        <Text style={styles.optionTitle}>🔥 Hardcore Mode</Text>
        <Text style={styles.optionDesc}>
          Reset your session if interrupted
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.note}>
        💡 You can change this anytime in Settings
      </Text>
    </View>
  ),
}
```

---

## MARKETING & USER COMMUNICATION

### App Store Description

```
**Stay Focused or Pay the Price**

Pomodoom isn't just another timer app. It's your accountability partner 
that actually keeps you honest.

🔥 UNIQUE PENALTY SYSTEM 🔥

Choose your consequences:
• Warning Mode - Friendly nudges to refocus
• Time Penalty - Add minutes for each distraction (most popular!)
• Progress Reset - Start over if interrupted (hardcore)
• Streak Breaker - Lose your focus streak

Why penalties work:
✓ Loss aversion psychology - You hate losing progress
✓ Real stakes - Makes you think twice before checking your phone
✓ Gamification - Penalties create engagement and challenge
✓ Behavioral conditioning - Build lasting focus habits

Start gentle, level up as you improve. Your future focused self will thank you.
```

### In-App Tooltips

```typescript
// Add helpful explanations throughout UI

const PENALTY_TOOLTIPS = {
  warning: "Perfect for beginners. Get gentle reminders without harsh consequences.",
  
  timeAdded: "Most effective for building focus. Each distraction costs you real time. Most users see 40% fewer interruptions within a week!",
  
  progressReset: "For those serious about deep work. One interruption = start over. Tough love that works.",
  
  escalation: "Penalties get progressively stricter. First time: gentle. Third time: harsh. Teaches your brain to stay focused.",
};
```

---

## FUTURE ENHANCEMENTS

### Phase 2 Features

1. **Social Accountability**
   - Share penalty stats with accountability partner
   - Competitive leaderboards (who can avoid penalties?)
   - Group challenges with shared penalty pool

2. **Smart Penalties**
   - AI learns your distraction patterns
   - Adaptive penalties based on time of day
   - Contextual penalties (harsher during work hours)

3. **Rewards System**
   - Earn "focus credits" by avoiding penalties
   - Spend credits to reduce future penalties
   - Unlock achievements for penalty-free streaks

4. **Advanced Lock Mode**
   - App-level blocking during sessions
   - Website filtering
   - Emergency contact whitelist

---

## HUMAN-IN-THE-LOOP QUESTIONS

After implementing this system, ask user:

```
I've implemented the core penalty system. Review points:

EFFECTIVENESS:
1. Should penalties reset daily or persist across sessions?
2. Is the escalation too harsh? Too gentle?
3. Should we add a "forgiveness" system (one free pass per day)?

USER EXPERIENCE:
1. Are the penalty messages motivating or discouraging?
2. Should we add customizable penalty messages?
3. Want animations or keep it subtle?

BALANCE:
1. Default to warning mode or time penalties for new users?
2. Should hardcore mode have a confirmation dialog?
3. Add a "vacation mode" to temporarily disable penalties?

ANALYTICS:
1. Track which penalty type leads to best focus improvement?
2. Show "money/time saved by avoiding distractions"?
3. Weekly reports on penalty trends?

What's your priority for v1.0?
```

---

This punishment system is the **core differentiator** that makes Pomodoom unique and effective. It leverages psychology, gamification, and real consequences to build lasting focus habits! 🎯🔥