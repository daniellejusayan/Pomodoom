import { ReactNode } from 'react';

export type ModalVariant = 'bottomSheet' | 'fullScreen' | 'alert';

export interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'text' | 'outline' | 'danger';
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  variant?: ModalVariant;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ModalAction[];
  backdropDismiss?: boolean;
}

export default ModalProps;
