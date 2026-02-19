import { ImageSourcePropType } from 'react-native';

export interface EmptyStateProps {
  image?: ImageSourcePropType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default EmptyStateProps;
