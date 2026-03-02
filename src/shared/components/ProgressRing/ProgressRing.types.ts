import { ReactNode } from 'react';

export interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientColors?: string[];
  backgroundColor?: string;
  children?: ReactNode; // optional center content
}

export default ProgressRingProps;
