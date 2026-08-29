import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, LoadingIndicator } from '../../components/ui';
import { goToActiveMission, useActiveMission } from '../../hooks/useActiveMission';
import { useCreateRequest } from '../../hooks/useCreateRequest';

function formatAddress(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(', ');
}

export function ConfirmLocationScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const createRequest = useCreateRequest();
  const { data: activeMission, isLoading: isCheckingActive } = useActiveMission();

  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detecting, setDetecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const position = await Location.getCurrentPositionAsync();
        if (cancelled) return;

        const detected = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(detected);

        const [geocoded] = await Location.reverseGeocodeAsync(detected);
        if (!cancelled && geocoded) {
          setAddress(
            formatAddress([
              geocoded.name,
              geocoded.street,
              geocoded.district,
              geocoded.city,
              geocoded.region,
            ]),
          );
        }
      } catch {
        // Best-effort: user can just type the address in manually.
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // This screen, not RequestScreen, is where a mission actually gets created, so
  // the one-request-at-a-time rule has to hold here too: after confirming, a back
  // press lands right back on this form and Confirm would create a second mission.
  // useFocusEffect rather than useEffect — this screen stays mounted underneath
  // /searching, and a plain effect would fire while the user is still on that
  // screen, yanking it out from under them.
  //
  // goToActiveMission (not a plain replace): by the time this guard fires the
  // stack can be as deep as Home → Request → Reward → (here), and a plain
  // replace only swaps this screen, leaving Reward underneath — back from
  // Mission Status would land on Reward instead of Home. See its comment.
  useFocusEffect(
    useCallback(() => {
      if (activeMission) {
        goToActiveMission(router, activeMission.id);
      }
    }, [activeMission, router]),
  );

  const handleConfirm = async () => {
    const trimmedAddress = address.trim();
    const trimmedDetail = detailAddress.trim();
    if (!trimmedAddress || !amount) return;
    setError(null);

    try {
      const mission = await createRequest.mutateAsync({
        category: 'cockroach',
        rewardAmount: Number(amount),
        address: trimmedDetail ? `${trimmedAddress}, ${trimmedDetail}` : trimmedAddress,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });
      router.push({ pathname: '/searching', params: { missionId: mission.id, amount } });
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  if (isCheckingActive || activeMission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Pressable className="flex-1" onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-row items-center px-6 py-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#111111" />
          </Pressable>
          <Text className="ml-4 text-lg font-sans-semibold text-text-primary">
            Confirm Location
          </Text>
        </View>

        <View className="flex-1 gap-6 px-6">
          <View className="gap-1">
            <Text className="text-2xl font-sans-bold text-text-primary">
              Where do you need help?
            </Text>
            <Text className="font-sans text-sm text-text-secondary">
              We use this to find heroes nearby.{'\n'}이 위치로 근처 히어로를 찾아드려요.
            </Text>
          </View>

          {detecting && (
            <Text className="font-sans text-sm text-text-secondary">
              Detecting your location...
            </Text>
          )}

          <Input
            label="Address"
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
          />

          <Input
            label="Detail Address (Unit/Floor) · 상세 주소 (동/호수)"
            placeholder="e.g. 101-호, 3층"
            value={detailAddress}
            onChangeText={setDetailAddress}
          />

          {error && <Text className="text-sm text-danger">{error}</Text>}
        </View>

        <View className="px-6 pb-6">
          <Button
            label="Confirm Location"
            variant="primary"
            loading={createRequest.isPending}
            disabled={!address.trim() || createRequest.isPending}
            onPress={handleConfirm}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
