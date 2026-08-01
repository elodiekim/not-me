import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface TimelineStep {
  label: string;
  koLabel: string;
}

const STEPS: TimelineStep[] = [
  { label: 'Requested', koLabel: '요청됨' },
  { label: 'Hero Accepted', koLabel: '히어로 수락' },
  { label: 'On the way', koLabel: '이동 중' },
  { label: 'Completed', koLabel: '완료' },
];

interface StatusTimelineProps {
  currentStep: number;
  pulseCurrentStep?: boolean;
}

export function StatusTimeline({ currentStep, pulseCurrentStep = false }: StatusTimelineProps) {
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulseCurrentStep) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      pulseOpacity.setValue(1);
    };
  }, [pulseCurrentStep, pulseOpacity]);

  return (
    <View className="gap-4">
      {STEPS.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isDone || isCurrent;

        return (
          <View key={step.label} className="flex-row items-center gap-3">
            {isCurrent && pulseCurrentStep ? (
              <Animated.View style={{ opacity: pulseOpacity }} className="h-3 w-3 rounded-full bg-primary" />
            ) : (
              <View
                className={`h-3 w-3 rounded-full ${isActive ? 'bg-primary' : 'bg-surface border border-text-disabled'}`}
              />
            )}
            <View className="flex-1 flex-row items-baseline gap-2">
              <Text
                className={`text-sm ${isActive ? 'font-sans-semibold text-text-primary' : 'font-sans text-text-disabled'}`}
              >
                {step.label}
              </Text>
              <Text
                className={`font-sans text-xs ${isActive ? 'text-text-secondary' : 'text-text-disabled'}`}
              >
                {step.koLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
