import type { MissionHistoryEntry } from '../../hooks/useMissionHistory';

// A read-only timeline entry derived from a mission's current state.
// missions has no status-change history, so each mission yields at most one
// event summarizing where it stands right now — never a per-transition log.
export interface ActivityEvent {
  id: string;
  message: string;
  // updated_at of the source mission; used for sorting and the relative-time label.
  timestamp: string;
  // Set only for actionable events (e.g. leave-a-review) that should be tappable.
  route?: { pathname: string; params: Record<string, string> };
}

function deriveEvent(mission: MissionHistoryEntry): ActivityEvent | null {
  const base = { id: mission.id, timestamp: mission.updatedAt };

  if (mission.role === 'user') {
    const hero = mission.counterpartName ?? '히어로';
    switch (mission.status) {
      case 'accepted':
        return { ...base, message: `${hero}님이 요청을 수락했어요` };
      case 'on_the_way':
        return { ...base, message: `${hero}님이 가는 중이에요` };
      case 'arrived':
        return { ...base, message: `${hero}님이 도착했어요` };
      case 'completed':
        // Once reviewed, the action is done — nothing left to surface.
        if (mission.hasReview) return null;
        return {
          ...base,
          message: '미션이 완료됐어요 — 리뷰를 남겨주세요',
          route: { pathname: '/complete', params: { missionId: mission.id } },
        };
      // requested (nothing happened yet) and cancelled (nothing to report) are skipped.
      default:
        return null;
    }
  }

  // role === 'hero': the only thing worth notifying about is a review received.
  if (mission.hasReview) {
    const requester = mission.counterpartName ?? '요청자';
    const stars = mission.reviewRating ?? 0;
    return { ...base, message: `${requester}님이 ★${stars} 리뷰를 남겼어요` };
  }

  return null;
}

// Turn the mission history into a newest-first activity feed.
export function deriveActivityEvents(missions: MissionHistoryEntry[]): ActivityEvent[] {
  return missions
    .map(deriveEvent)
    .filter((event): event is ActivityEvent => event !== null)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
