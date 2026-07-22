import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, LoadingIndicator } from '../../components/ui';
import { useProfile } from '../../hooks/useProfile';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import type { Profile } from '../../types/Profile';

// Same lenient phone check the sign-up form uses — digits plus common
// separators, at least 7 chars. Guards obvious typos, not real numbers.
const PHONE_PATTERN = /^[0-9+\-\s()]{7,}$/;

const FALLBACK_AVATAR = require('../../../assets/characters/avatar-cat.png');

export function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfile();

  if (isLoading) {
    return <LoadingIndicator message="Loading your profile..." />;
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-6" edges={['top']}>
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  // Mount the form only once the profile is loaded, so its inputs can be
  // seeded from the real name/phone on their very first render.
  return <EditProfileForm profile={profile} />;
}

function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  // Local URI of a freshly picked photo, shown as a preview until Save uploads it.
  const [pickedAvatarUri, setPickedAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const phoneValid = trimmedPhone.length === 0 || PHONE_PATTERN.test(trimmedPhone);
  const phoneError =
    trimmedPhone.length > 0 && !phoneValid
      ? "That phone number doesn't look right.\n휴대전화 번호를 확인해주세요."
      : undefined;
  const canSave = trimmedName.length > 0 && phoneValid && !updateProfile.isPending;

  const avatarSource = pickedAvatarUri
    ? { uri: pickedAvatarUri }
    : profile.avatarUrl
      ? { uri: profile.avatarUrl }
      : FALLBACK_AVATAR;

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPickedAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateProfile.mutateAsync({
        name: trimmedName,
        phone: trimmedPhone.length > 0 ? trimmedPhone : null,
        avatarUri: pickedAvatarUri,
      });
      router.back();
    } catch {
      setError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }} keyboardShouldPersistTaps="handled">
        <View className="items-center gap-2">
          <Text className="text-2xl font-sans-bold text-text-primary">Edit Profile</Text>
          <Text className="text-sm text-text-secondary">프로필 수정</Text>
        </View>

        <View className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            onPress={handlePickAvatar}
            disabled={updateProfile.isPending}
          >
            <Image source={avatarSource} style={{ width: 96, height: 96, borderRadius: 48 }} />
            <View
              className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2 border-background bg-primary"
              style={{ width: 32, height: 32 }}
            >
              <Feather name="camera" size={16} color="#111111" />
            </View>
          </Pressable>
        </View>

        <View className="gap-4">
          <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} />
          <Input
            label="Phone"
            placeholder="010-1234-5678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={phoneError}
          />
          {error && <Text className="font-sans text-xs text-danger">{error}</Text>}
        </View>

        <Button
          label="Save"
          variant="primary"
          loading={updateProfile.isPending}
          disabled={!canSave}
          onPress={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
