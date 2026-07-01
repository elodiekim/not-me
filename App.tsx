import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './src/screens/HomeScreen';
import StepScreen from './src/components/StepScreen';
import RewardScreen from './src/screens/RewardScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import AcceptedScreen from './src/screens/AcceptedScreen';
import CompleteScreen from './src/screens/CompleteScreen';
import CancelledScreen from './src/screens/CancelledScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import { colors } from './src/theme';
import { CanFly, HELPER_LEVELS, Location, Mission, Screen } from './src/types';

const HELPER_NAMES = ['Min-jun', 'Seo-yeon', 'Alex', 'Jordan', 'Grandma Kim', 'Dae-ho'];

function randomHelper() {
  const name = HELPER_NAMES[Math.floor(Math.random() * HELPER_NAMES.length)];
  const level = HELPER_LEVELS[Math.floor(Math.random() * HELPER_LEVELS.length)];
  return { name, level };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [location, setLocation] = useState<Location>();
  const [canFly, setCanFly] = useState<CanFly>();
  const [mission, setMission] = useState<Mission | null>(null);

  function reset() {
    setLocation(undefined);
    setCanFly(undefined);
    setMission(null);
    setScreen('home');
  }

  function confirmReward(reward: number) {
    const helper = randomHelper();
    setMission({
      location: location!,
      canFly: canFly!,
      reward,
      helperName: helper.name,
      helperLevel: helper.level,
    });
    setScreen('loading');
  }

  let content;
  switch (screen) {
    case 'home':
      content = <HomeScreen onRequestHelp={() => setScreen('location')} />;
      break;
    case 'location':
      content = (
        <StepScreen
          step="Step 1"
          question="Where is it?"
          selected={location}
          options={[
            { label: 'Kitchen', value: 'Kitchen' },
            { label: 'Bathroom', value: 'Bathroom' },
            { label: 'Bedroom', value: 'Bedroom' },
            { label: 'Other', value: 'Other' },
          ]}
          onSelect={(v) => {
            setLocation(v as Location);
            setScreen('canFly');
          }}
        />
      );
      break;
    case 'canFly':
      content = (
        <StepScreen
          step="Step 2"
          question="Can it fly?"
          selected={canFly}
          options={[
            { label: '😱 Yes', value: 'Yes' },
            { label: '🙂 No', value: 'No' },
            { label: "🙈 I don't know", value: "I don't know" },
          ]}
          onSelect={(v) => {
            setCanFly(v as CanFly);
            setScreen('reward');
          }}
        />
      );
      break;
    case 'reward':
      content = <RewardScreen onSelect={confirmReward} />;
      break;
    case 'loading':
      content = <LoadingScreen onDone={() => setScreen('accepted')} />;
      break;
    case 'accepted':
      content = mission ? (
        <AcceptedScreen
          mission={mission}
          onComplete={() => setScreen('complete')}
          onCancel={() => setScreen('cancelled')}
        />
      ) : null;
      break;
    case 'complete':
      content = (
        <CompleteScreen onReview={() => setScreen('review')} onHome={reset} />
      );
      break;
    case 'cancelled':
      content = <CancelledScreen onHome={reset} />;
      break;
    case 'review':
      content = mission ? <ReviewScreen mission={mission} onDone={reset} /> : null;
      break;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {content}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
