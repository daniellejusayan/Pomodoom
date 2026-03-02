export interface GuidancePopupProps {
  visible: boolean;
  title: string;
  description?: string;
  steps: string[];
  footnote?: string;
  onClose: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}
