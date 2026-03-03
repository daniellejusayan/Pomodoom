import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../Button';
import { Modal } from '../Modal';
import { Text } from '../Text';
import type { GuidancePopupProps } from './GuidancePopup.types';
import styles from './GuidancePopup.styles';

const GuidancePopup = ({
  visible,
  title,
  description,
  steps,
  footnote,
  onClose,
  primaryLabel = 'Next',
  secondaryLabel = 'Back',
}: GuidancePopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const safeSteps = useMemo(() => (steps.length > 0 ? steps : ['']), [steps]);
  const isLastStep = currentStep >= safeSteps.length - 1;

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <Modal visible={visible} onClose={handleClose} variant="alert" title={title} description={description}>
      <View style={styles.content}>
        <Text style={styles.stepCount}>Step {currentStep + 1} of {safeSteps.length}</Text>
        <Text style={styles.stepText}>{safeSteps[currentStep]}</Text>
        {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}

        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={handleBack}
            disabled={currentStep === 0}
            style={styles.actionButton}
          >
            {secondaryLabel}
          </Button>
          <Button onPress={handleNext} style={styles.actionButton}>
            {isLastStep ? "Let's Focus" : primaryLabel}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default GuidancePopup;
