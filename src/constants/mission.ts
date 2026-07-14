// 실사용 데이터가 없는 추정치 — 실제 평균 수락 시간을 보고 조정할 것 (TODO.md P2)
export const SEARCH_TIMEOUT_MS = 15 * 60 * 1000;

// Nearby Missions에서 이 반경(km) 밖의 미션은 숨김. 카테고리가 하나뿐이고 사용자가 적은
// 초기 단계라 넉넉하게 잡음 — 실사용 데이터가 쌓이면 좁힐 것 (TODO.md P2)
export const NEARBY_RADIUS_KM = 50;
