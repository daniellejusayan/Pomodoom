import { useState, useCallback, useEffect } from 'react';
import { useSettings } from '../../../context/SettingsContext';
import * as Haptics from 'expo-haptics';
import type { Interruption, PenaltyAction, PenaltyType } from '../types/PenaltyTypes';

export const usePenaltySystem = () => {
  const { penaltyType, vibrationEnabled } = useSettings();
  const [sessionPauseCount, setSessionPauseCount] = useState(0);
  const [interruptions, setInterruptions] = useState<Interruption[]>([]);

  // 🔧 FIX: Log penalty type changes for debugging
  useEffect(() => {
    console.log('Penalty type changed to:', penaltyType);
  }, [penaltyType]);

  // 🎯 Calculate time penalty based on pause count
  const calculateTimePenalty = useCallback((pauseCount: number): number => {
    if (pauseCount === 0) return 2;   // First pause: +2 minutes
    if (pauseCount === 1) return 5;   // Second pause: +5 minutes
    if (pauseCount >= 2) return 10;   // Third+ pause: +10 minutes
    return 10;
  }, []);

  // 🎯 Get penalty message based on type and context
  const getPenaltyMessage = useCallback((
    type: PenaltyType, 
    reason: 'pause' | 'stop',
    timeAdded?: number
  ): string => {
    switch (type) {
      case 'none':
        return reason === 'pause'
          ? 'Session paused.'
          : 'Session stopped.';

      case 'warning':
        return reason === 'pause' 
          ? "You're about to pause your session. Are you sure?"
          : "You're about to stop your session. Are you sure?";
      
      case 'resetTimer':
        return "You chose to stop your session. As a penalty, you will have to reset the timer for this session.";
      
      case 'addTime':
        return reason === 'pause'
          ? `Session paused. As a penalty, ${timeAdded} minutes have been added to your timer.`
          : `You chose to stop your session. As a penalty, ${timeAdded} minutes were added before returning to Home Timer.`;

      case 'lockMode':
        return reason === 'pause'
          ? 'Lock Mode is active. Hard app-lock is coming soon, but this interruption is still recorded.'
          : 'Lock Mode is active. Hard app-lock is coming soon, but stopping now still counts as an interruption.';
      
      default:
        return "Session interrupted.";
    }
  }, []);

  // 🎯 Record interruption
  const recordInterruption = useCallback((
    sessionId: string,
    reason: 'manual_pause' | 'app_background' | 'manual_stop'
  ) => {
    const interruption: Interruption = {
      id: Date.now().toString(),
      sessionId,
      timestamp: new Date(),
      reason,
      penaltyApplied: penaltyType, // Log the penalty type applied for this interruption
    };
    
    setInterruptions(prev => [...prev, interruption]);
    
    // Increment pause count for this session
    if (reason === 'manual_pause' || reason === 'app_background') {
      setSessionPauseCount(prev => prev + 1);
    }
  }, [penaltyType]);

  // 🎯 Apply penalty and return action to take
  const applyPenalty = useCallback((
    sessionId: string,
    reason: 'pause' | 'stop',
    stopCount: number = 0 // 🆕 ADDED: Track stop attempts for escalation
  ): PenaltyAction | null => {
    // Log the penalty application for debugging
    console.log('Applying penalty:', penaltyType, 'for reason:', reason);

    if (penaltyType === 'none') {
      const interruptionReason = reason === 'pause' ? 'manual_pause' : 'manual_stop';
      recordInterruption(sessionId, interruptionReason);
      return null;
    }

    // Trigger haptic feedback if enabled
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Record the interruption
    const interruptionReason = reason === 'pause' ? 'manual_pause' : 'manual_stop';
    recordInterruption(sessionId, interruptionReason);

    // Determine penalty action based on type
    switch (penaltyType) {
      case 'warning':
        return {
          type: 'warning',
          message: getPenaltyMessage('warning', reason),
        };

      case 'resetTimer':
        return {
          type: 'resetTimer',
          message: getPenaltyMessage('resetTimer', reason),
        };

      case 'addTime':
        let timeAdded: number;
        if (reason === 'stop') {
          // 🆕 ESCALATION for stop action: 2 min → 5 min → 10 min → 10 min ...
          if (stopCount === 0) {
            timeAdded = 2;
          } else if (stopCount === 1) {
            timeAdded = 5;
          } else {
            timeAdded = 10;
          }
        } else {
          // Original pause escalation
          timeAdded = calculateTimePenalty(sessionPauseCount);
        }
        return {
          type: 'addTime',
          message: getPenaltyMessage('addTime', reason, timeAdded),
          timeAddedMinutes: timeAdded,
          pauseCount: reason === 'pause' ? sessionPauseCount + 1 : sessionPauseCount,
        };

      case 'lockMode':
        return {
          type: 'lockMode',
          message: getPenaltyMessage('lockMode', reason),
        };

      default:
        return null;
    }
  }, [
    penaltyType, 
    vibrationEnabled, 
    sessionPauseCount, 
    calculateTimePenalty, 
    getPenaltyMessage,
    recordInterruption,
  ]);

  // 🎯 Reset pause count when session completes successfully
  const resetSessionPenalties = useCallback(() => {
    setSessionPauseCount(0);
  }, []);

  // 🎯 Clear all interruptions (for testing/reset)
  const clearInterruptions = useCallback(() => {
    setInterruptions([]);
    setSessionPauseCount(0);
  }, []);

  return {
    penaltyType,
    sessionPauseCount,
    interruptions,
    applyPenalty,
    resetSessionPenalties,
    clearInterruptions,
    recordInterruption,
  };
};