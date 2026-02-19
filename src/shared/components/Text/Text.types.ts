import { ReactNode } from 'react';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

export interface TextProps {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  accessibilityLabel?: string;
}

export default TextProps;
