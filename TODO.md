# TODO

> 현재 상태: **UI 프로토타입 완성** — 전 화면이 클릭으로 연결됨.
> 단, 모든 데이터가 하드코딩(mock)이고 `services / stores / hooks / types` 폴더는 비어 있음.
> Supabase 미설치 · 인증 없음 · 화면 간 상태 전달 없음 · 리뷰/미션 저장 안 됨.

---

## ✅ 완료 (UI 프로토타입)

### Phase 1 · 셋업
- [x] Expo 생성
- [x] NativeWind 설치
- [x] Zustand 설치
- [x] TanStack Query 설치

### Phase 2 · 디자인 시스템 & 공용 컴포넌트
- [x] Design System (colors / typography / spacing)
- [x] Button / Card / Input / Badge / Chip / Avatar / MissionCard / SectionHeader / LoadingIndicator / RatingRow
- [x] Bottom Tab Navigation (Home / Mission / Inbox / Profile)

### Phase 3 · User 플로우 (UI)
- [x] Home / Request / Reward / Searching / Mission Status / Complete / Profile

### Phase 4 · Hero 플로우 (UI)
- [x] Nearby Missions / Mission Detail / Active Mission / Reward Earned / Mission History

---

## 🔴 P0 · 백엔드 & 데이터 (가장 큰 공백)

지금은 `services / stores / hooks / types` 폴더가 전부 비어 있고 모든 데이터가 하드코딩임.

- [x] Supabase 연동
  - [x] `@supabase/supabase-js` 설치
  - [x] `.env` (+ `.env.example`) 로 URL / anon key 관리 (키 하드코딩 금지)
  - [x] `src/services/supabase.ts` 클라이언트 생성
- [x] DB 스키마 (모든 테이블 UUID PK · id · created_at · updated_at) — `supabase/migrations/0001_init.sql`, RLS 포함
  - [x] `profiles` (이름, 히어로 평점/리뷰 수)
  - [x] `missions` (category, reward, status, requester_id, hero_id, address)
  - [x] `reviews` (mission_id, rating, comment, reviewer_id, hero_id — User→Hero 단방향)
  - [x] 실제 Supabase 프로젝트에 마이그레이션 적용 완료, `.env` 실 값으로 교체, REST + RLS 동작 확인 완료
- [x] `src/types` 채우기: `Mission.ts` / `Profile.ts` / `Review.ts`
- [ ] TanStack Query 훅 작성 (`src/hooks`)
  - [ ] 조회: useNearbyMissions / useMission / useMissionHistory / useProfile
  - [ ] 변경: useCreateRequest / useAcceptMission / useCompleteMission / useSubmitReview
- [ ] mock 데이터 → 실제 쿼리로 교체 (`nearbyMissions.ts`, `missionHistory.ts` 제거)

## 🔴 P0 · 인증 (Authentication)
- [ ] Supabase Auth 연동
- [ ] 로그인 / 회원가입 화면
- [ ] 세션 유지 & 보호 라우팅 (미로그인 시 진입 차단)
- [ ] Profile 하드코딩("Yuna") → 실제 유저 정보 표시
- [ ] Sign Out 동작 구현 (현재 onPress 없음)

## 🟠 P1 · 상태 연결 (플로우 간 데이터 전달)
현재 각 화면이 독립적이라 사용자가 고른 값이 다음 화면으로 이어지지 않음.
- [ ] Zustand `useRequestStore` — 선택 카테고리 + 리워드 보관
- [ ] Reward에서 고른 금액을 Searching / Mission Status 로 전달
- [ ] Mission Status 하드코딩("Minjun", "약 8분", step=2) → 실제 미션 데이터
- [ ] Searching: 가짜 2.5초 setTimeout → 실제 매칭 (Realtime / 폴링)

## 🟠 P1 · 리뷰 (Review)
- [ ] Complete 화면 별점/코멘트 실제 저장 (지금은 저장 없이 홈으로 이동)
- [ ] Profile 평점/리뷰 수 실제 집계값 표시 (지금 4.9 / 128 하드코딩)

## 🟡 P2 · 실시간 & 위치 (제품 핵심 경험)
- [ ] 위치 권한 + 현재 위치 획득 (expo-location)
- [ ] Nearby Missions 실제 거리 계산 (지금 "0.3 km away" 하드코딩)
- [ ] Mission Status 실시간 업데이트 (Supabase Realtime)
- [ ] (선택) 지도 표시

## 🟡 P2 · 온보딩 & 앱 진입
DESIGN.md 화면 순서엔 Splash → Onboarding → Home 이 있으나 현재 없음(과거 커밋에서 reset됨).
- [ ] Splash 화면
- [ ] Onboarding 화면
- [ ] app.json 앱 아이콘 / 스플래시 설정 (`assets/logo/app-icon.png` 있으나 미연결)

## 🟢 P3 · 마감 완성도 (Definition of Done)
- [ ] 로딩 상태: 리스트 스켈레톤 (Nearby / History)
- [ ] 빈 상태: Nearby Missions 빈 목록 처리 (현재 없음)
- [ ] 에러 상태: 네트워크 실패 시 사용자 친화 메시지 (DESIGN.md 톤)
- [ ] Profile 설정 항목(Account / Notifications / Help) 네비게이션 연결
- [ ] Home 알림 벨 아이콘 동작 또는 비활성 처리
- [ ] Inbox 탭: 현재 Coming Soon (CLAUDE.md상 Chat 보류 → 유지 OK)

## ⚪ 품질 / 인프라 (선택)
- [ ] ESLint / Prettier 설정
- [ ] 핵심 훅 · 유틸 기본 테스트
- [ ] EAS Build → TestFlight 설정
- [ ] AGENTS.md의 Expo 버전(57) vs 실제(54) 정리

---

## 만들지 않음 (CLAUDE.md 기준)
결제 · AI · 채팅 · 푸시알림 · 애널리틱스 · 어드민 · 리퍼럴 · 게이미피케이션
