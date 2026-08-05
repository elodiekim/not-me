// 실사용 데이터가 없는 추정치 — 실제 평균 수락 시간을 보고 조정할 것 (TODO.md P2)
export const SEARCH_TIMEOUT_MS = 15 * 60 * 1000;

// 히어로가 수락한 뒤 이 시간이 지나도록 아무 진전이 없으면 요청자에게 안내를 띄움.
// 자동 취소는 하지 않음 — 판단은 요청자가 함 (TODO.md의 "멈춘 미션" 항목 참고).
// 실사용 데이터가 없는 추정치 — 히어로를 찾는 시간(SEARCH_TIMEOUT_MS)보다는 길고
// 실제 이동 시간도 감안한 값. 실제 완료까지 걸리는 시간을 보고 조정할 것 (TODO.md P2)
export const STALLED_MISSION_MS = 30 * 60 * 1000;

// Nearby Missions에서 이 반경(km) 밖의 미션은 숨김. 카테고리가 하나뿐이고 사용자가 적은
// 초기 단계라 넉넉하게 잡음 — 실사용 데이터가 쌓이면 좁힐 것 (TODO.md P2)
export const NEARBY_RADIUS_KM = 50;

// 커스텀 리워드 금액 상한. DB의 reward_amount_range check 제약(0008 마이그레이션)과 값을 맞출 것.
export const MAX_REWARD_AMOUNT = 200;
