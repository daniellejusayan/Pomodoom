import { ReactNode } from 'react';

export type ChipSize = 'small' | 'medium';

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  size?: ChipSize;
  accessibilityLabel?: string;
}

export default ChipProps;
