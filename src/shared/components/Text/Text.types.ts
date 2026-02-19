import { ReactNode } from 'react';
import type { TextProps as RNTextProps } from 'react-native';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

export type TextProps = RNTextProps & {
  children?: ReactNode;
  variant?: TextVariant;
  color?: string;
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
};

export default TextProps;
