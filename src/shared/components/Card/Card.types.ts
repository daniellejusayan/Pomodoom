import { ReactNode } from 'react';

export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  padding?: CardPadding;
  elevation?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export default CardProps;
