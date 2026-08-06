import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet, Button, LoadingIndicator, MissionCard, Toast } from '../../components/ui';
import { getCategoryInfo } from '../../constants/categoryInfo';
import { useMission } from '../../hooks/useMission';
import { useUpdateMissionStatus } from '../../hooks/useUpdateMissionStatus';
import { isMissionStalled, isRequestStale } from '../../utils/missionExpiry';
import type { MissionStatus } from '../../types/Mission';
import { StatusTimeline } from './components/StatusTimeline';

const STEP_BY_STATUS: Record<string, number> = {
  requested: 0,
  accepted: 1,
  on_the_way: 2,
  arrived: 2,
  completed: 3,
};

export function MissionScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  // Realtime pushes status changes instantly; this poll is only a safety net for
  // dropped sockets, so 30s is plenty (was 3s when polling was the primary path).
  const {
    data: mission,
    isLoading,
    isError,
    refetch,
  } = useMission(missionId, { refetchInterval: 30000 });
  const updateStatus = useUpdateMissionStatus();
  const { mutate: updateStatusMutate } = updateStatus;

  // Opportunistic expiry: no server cron, so a stale 'requested' mission only gets
  // cancelled once someone looks at it — here, whenever this screen loads/polls.
  // The 3s poll above then picks up the resulting 'cancelled' status.
  useEffect(() => {
    if (mission && mission.status === 'requested' && isRequestStale(mission.createdAt)) {
      updateStatusMutate({ missionId: mission.id, status: 'cancelled', fromStatus: 'requested' });
    }
  }, [mission, updateStatusMutate]);

  // Routes to the celebration screen only on a live 'completed' transition witnessed
  // while this screen is open — never on landing on an already-completed mission.
  const prevStatusRef = useRef<string | undefined>(undefined);
  // True only during the brief pause between the live transition and the redirect —
  // hides the Leave a Review/Not now buttons so they don't flash right before the
  // dedicated Mission Complete screen (with its own buttons) takes over.
  const [isTransitioningToComplete, setIsTransitioningToComplete] = useState(false);
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const justCompleted =
      !!mission &&
      prevStatus !== undefined &&
      prevStatus !== 'completed' &&
      mission.status === 'completed';
    prevStatusRef.current = mission?.status;

    if (!justCompleted || !mission) return;

    // Brief pause so the timeline's last dot is visibly seen turning yellow
    // before navigating away, instead of jumping straight to the next screen.
    setIsTransitioningToComplete(true);
    const missionId = mission.id;
    const timer = setTimeout(() => {
      router.replace({ pathname: '/mission-complete', params: { missionId } });
    }, 900);
    return () => clearTimeout(timer);
  }, [mission, router]);

  // A hero can back out of an accepted mission (useCancelAcceptedMission), which
  // resets it to an open request with no hero — surface that with a reassuring
  // toast instead of letting the hero card silently vanish.
  const prevHeroIdRef = useRef<string | null | undefined>(undefined);
  const [showHeroBackedOutToast, setShowHeroBackedOutToast] = useState(false);
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  useEffect(() => {
    const prevHeroId = prevHeroIdRef.current;
    const heroBackedOut =
      !!mission && !!prevHeroId && mission.heroId === null && mission.status === 'requested';
    prevHeroIdRef.current = mission ? mission.heroId : undefined;

    if (heroBackedOut) setShowHeroBackedOutToast(true);
  }, [mission]);

  if (isLoading) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  if (isError || !mission) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        edges={['top']}
      >
        <Text className="text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  const category = getCategoryInfo(mission.category);
  const isCompleted = mission.status === 'completed';
  const isReviewed = isCompleted && mission.hasReview;
  const isCancelled = mission.status === 'cancelled';
  const isRequested = mission.status === 'requested';
  // A stranger is on their way to the requester's home, so they keep a way out
  // even after a hero accepts — seeing who accepted (the hero card links to
  // their reviews) is worthless without being able to act on it. Confirmed
  // through a sheet rather than a bare button, since someone is already en route.
  const isHeroOnTheWay =
    mission.status === 'accepted' ||
    mission.status === 'on_the_way' ||
    mission.status === 'arrived';
  // Nothing expires a mission once a hero accepts, so a hero who goes quiet leaves
  // it sitting here indefinitely. Rather than auto-cancelling — 'arrived' especially
  // often means the job was finished and only the Complete tap is missing, and
  // cancelling that would erase the hero's earnings and the requester's review —
  // just tell the requester it's been quiet and let them decide. 'arrived' is left
  // out for the same reason: "no response" would be the wrong thing to say.
  const isStalled =
    (mission.status === 'accepted' || mission.status === 'on_the_way') &&
    isMissionStalled(mission.updatedAt);
  // Once a hero is assigned, their card links to their public reviews so the
  // requester can vet who's coming. A still-'requested' mission has no hero → no link.
  const heroId = mission.heroId;

  // fromStatus guards against cancelling something that moved on mid-tap — most
  // importantly a mission the hero completed in the same moment.
  const handleCancel = async (fromStatus: MissionStatus) => {
    setIsCancelSheetOpen(false);
    try {
      await updateStatus.mutateAsync({
        missionId: mission.id,
        status: 'cancelled',
        fromStatus,
      });
    } catch {
      // Cancellation failed (e.g. offline) — never trap the user, still go home.
    }
    // One-shot signal so Home can confirm the cancel with a toast.
    router.replace({ pathname: '/', params: { cancelled: '1' } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 py-4">
        <Text className="text-lg font-sans-semibold text-text-primary">Mission Status</Text>
      </View>
      <View className="flex-1 gap-8 px-6">
        {(() => {
          const heroCard = (
            <MissionCard
              avatar={
                mission.heroAvatarUrl
                  ? { uri: mission.heroAvatarUrl }
                  : require('../../../assets/icons/profile.png')
              }
              title={
                isCancelled
                  ? 'Request cancelled'
                  : mission.heroName
                    ? `${mission.heroName} is on the way`
                    : 'Looking for your hero'
              }
              subtitle={`${category.title} · ${category.koTitle} · $${mission.rewardAmount}`}
              statusLabel={
                isCancelled
                  ? 'Cancelled · 취소됨'
                  : isCompleted
                    ? 'Completed'
                    : // Without this the badge said "On the way" while the card's own
                      // title still read "Looking for your hero" — same card, opposite
                      // claims, before anyone had even accepted.
                      isRequested
                      ? 'Searching · 찾는 중'
                      : 'On the way'
              }
              statusVariant={isCancelled ? 'neutral' : isCompleted ? 'success' : 'info'}
              rating={mission.heroRating ?? undefined}
              reviewCount={mission.heroReviewCount}
            />
          );
          // Wrap in a Pressable only when a hero is assigned — links to their reviews.
          return heroId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View ${mission.heroName ?? 'hero'} reviews`}
              onPress={() => router.push({ pathname: '/reviews', params: { heroId } })}
            >
              {heroCard}
            </Pressable>
          ) : (
            heroCard
          );
        })()}

        <Text className="font-sans text-center text-sm text-text-secondary">
          {isCancelled
            ? 'This request was cancelled.\n요청이 취소됐어요.'
            : isCompleted
              ? 'Your hero finished the mission.\n미션이 완료됐어요.'
              : isStalled
                ? // Saying "on the way" here would be actively misleading — nothing
                  // has moved in a while. Names the situation without blaming the
                  // hero, who may simply be stuck somewhere.
                  "It's been quiet for a while.\n히어로가 한동안 응답이 없어요."
                : isRequested
                  ? // Nobody has accepted yet, so there is no hero to be on the way.
                    "We're looking for your hero.\n히어로를 찾고 있어요."
                  : 'Your hero is on the way.\n히어로가 오고 있어요.'}
        </Text>

        {!isCancelled && (
          <StatusTimeline
            currentStep={STEP_BY_STATUS[mission.status] ?? 0}
            // Pulse whenever the hero is actively engaged but not done yet — keeps a
            // "this is live" signal through accepted -> on the way -> arrived.
            pulseCurrentStep={
              mission.status === 'accepted' ||
              mission.status === 'on_the_way' ||
              mission.status === 'arrived'
            }
          />
        )}
      </View>
      <View className="px-6 pb-6 gap-3">
        {isCancelled ? (
          <Button label="Back to Home" variant="secondary" onPress={() => router.replace('/')} />
        ) : isRequested ? (
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => handleCancel('requested')}
            loading={updateStatus.isPending}
            disabled={updateStatus.isPending}
          />
        ) : isTransitioningToComplete ? null : isHeroOnTheWay ? (
          <>
            {/* Dropped once stalled: "waiting for completion" reads as reassurance
                that nothing is wrong, and cancelling becomes the live option. */}
            {!isStalled && (
              <Button label="Waiting for completion..." variant="secondary" disabled />
            )}
            <Button
              label="Cancel request · 요청 취소"
              variant={isStalled ? 'secondary' : 'ghost'}
              onPress={() => setIsCancelSheetOpen(true)}
              loading={updateStatus.isPending}
              disabled={updateStatus.isPending}
            />
          </>
        ) : isCompleted && !isReviewed ? (
          <>
            <Button
              label="Leave a Review"
              variant="primary"
              onPress={() =>
                router.replace({ pathname: '/complete', params: { missionId: mission.id } })
              }
            />
            <Button
              label="Not now · 나중에 할게요"
              variant="ghost"
              onPress={() => router.replace('/')}
            />
          </>
        ) : isReviewed ? (
          <>
            <Button label="Reviewed ✓" variant="secondary" disabled />
            <Button label="Back to Home" variant="ghost" onPress={() => router.replace('/')} />
          </>
        ) : (
          <Button label="Waiting for completion..." variant="secondary" disabled />
        )}
      </View>
      {showHeroBackedOutToast && (
        <Toast
          message="Your hero had to step away · 새 히어로를 찾고 있어요"
          onDismiss={() => setShowHeroBackedOutToast(false)}
        />
      )}

      <BottomSheet visible={isCancelSheetOpen} onClose={() => setIsCancelSheetOpen(false)}>
        <Text className="text-lg font-sans-semibold text-text-primary">
          Cancel this request?{'\n'}요청을 취소할까요?
        </Text>
        <Text className="font-sans text-sm text-text-secondary">
          {isStalled
            ? `${mission.heroName ?? 'Your hero'} may still show up.\n히어로가 아직 올 수도 있어요.`
            : `${mission.heroName ?? 'Your hero'} is already on the way.\n히어로가 이미 오고 있어요.`}
        </Text>
        <Button
          label="Yes, cancel · 취소할게요"
          variant="danger"
          onPress={() => handleCancel(mission.status)}
        />
        <Button
          label="Keep waiting · 기다릴게요"
          variant="ghost"
          onPress={() => setIsCancelSheetOpen(false)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}
