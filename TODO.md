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
- [x] TanStack Query 훅 작성 (`src/hooks`)
  - [x] 조회: useNearbyMissions / useMission / useMissionHistory / useProfile
  - [x] 변경: useCreateRequest / useAcceptMission / useUpdateMissionStatus(완료 처리 포함) / useSubmitReview
- [x] mock 데이터 → 실제 쿼리로 교체 (`nearbyMissions.ts`, `missionHistory.ts` 제거)
  - `useMissionHistory` 추가: 로그인 유저가 requester 또는 hero인 missions 전체 조회 + role('user'/'hero') 판별, `created_at desc`
  - Mission 탭: Active 섹션(미완료 미션 카드, 탭하면 role 따라 `/mission-status` 또는 `/hero/active`로 이동), History 섹션(완료 미션, `CATEGORY_INFO` 아이콘/제목 재사용) — cancelled는 Active/History 어디에도 표시 안 함
  - Profile 탭: Requested/Helped 카운트를 role별 실제 건수로 표시 (전 상태 누적), history 로딩 중엔 기존 LoadingIndicator로 함께 대기 (0→N 깜빡임 방지)
  - 검증: 테스트 계정 3개(요청자/히어로/신규)로 REST 시딩 후 expo web + Playwright 실로그인 — 카운트 2/0·0/1·0/0, History $20 카드, Active 탭→미션 상태 화면 이동, 빈 상태 모두 확인 완료

## 🔴 P0 · 인증 (Authentication)
- [x] Supabase Auth 연동 (이메일/비밀번호)
- [x] 로그인 / 회원가입 화면 (`AuthScreen`)
- [x] 세션 유지 & 보호 라우팅 (미로그인 시 `/sign-in`으로 리다이렉트)
- [x] Profile 하드코딩("Yuna") → 실제 유저 정보 표시 (`useProfile` 훅)
- [x] Sign Out 동작 구현
- [x] 회원가입 시 `profiles` row 자동 생성 (DB 트리거 `handle_new_user`, 클라이언트 insert 아님 — 이메일 미확인 상태에서도 안전하게 동작)
- [ ] **출시 전 재확인**: 개발 편의상 Supabase "Confirm email"을 꺼둔 상태 — 출시 전 다시 켤 것
- [ ] 회원가입 폼: 비밀번호 확인(재입력) 필드 추가
- [ ] 회원가입 폼: 휴대전화 번호 입력 필드 추가 (`profiles`에 `phone` 컬럼 필요)
- [ ] 비밀번호 찾기(재설정) 플로우 — `AuthScreen`에 "비밀번호를 잊으셨나요?" 진입점 + 이메일 입력 화면 + Supabase `resetPasswordForEmail` 연동, 리셋 링크 딥링크 처리 필요 (Expo Router 딥링크 설정 확인)
- [x] ~~이메일 중복 체크~~ — Supabase Auth의 `auth.users.email` unique 제약으로 이미 처리됨, 별도 구현 불필요

## 🟠 P1 · 상태 연결 (플로우 간 데이터 전달)
- [x] ~~Zustand `useRequestStore`~~ — 불필요 판단: 카테고리는 바퀴벌레 하나뿐이라 선택지 없음, 리워드는 쿼리 파라미터로 충분
- [x] **1/5 Reward 확정 → 실제 `missions` row 생성** (`useCreateRequest`), `missionId`를 Searching로 전달 — REST로 실제 insert 확인 완료
- [x] **2/5 Hero의 Nearby Missions**: mock → 실제 `status='requested'` 미션 조회 (`useNearbyMissions`, `useMission`), 요청자 이름까지 join으로 표시 확인 완료
  - Nearby Missions/Mission Detail 둘 다 real data — 하지만 **Active Mission 화면은 아직 mock**이라 지금 "Accept Mission" 누르면 그 화면에서 "Mission not found" 뜸 (3/5에서 고침, 예상된 중간 상태)
- [x] **3/5 Hero 수락 처리**: `useAcceptMission`(hero_id/status='accepted', 이중수락 방지 가드) + `useUpdateMissionStatus`(arrived/completed), Active Mission 화면 real data 전환 — Accept → Arrived → Complete → Reward $ 표시까지 실클릭으로 확인 완료
  - RLS에 "열린 미션 수락" 정책 추가 필요했음 (`0003_claim_open_mission.sql`) — 기존 정책은 이미 배정된 요청자/히어로만 커버해서 최초 수락 시점엔 안 맞았음
  - mock 데이터 파일(`hero/data/nearbyMissions.ts`) 삭제 (더 이상 아무도 안 씀)
- [x] **4/5 Searching**: 가짜 2.5초 setTimeout → 실제 매칭 감지 (`useMission` 2초 폴링) — 두 명 유저로 동시 테스트: Hero가 수락하자 Requester 화면이 자동으로 Mission Status로 이동 확인 완료 (Cancel 버튼은 아직 mission row를 실제로 취소 처리하진 않음, 그냥 홈으로만 이동 — 필요하면 나중에 추가)
- [x] **5/5 Mission Status**: 하드코딩("Minjun", "약 8분", step=2) → 실제 미션 + 히어로 데이터 (`useMission`에 hero profile join 추가, 3초 폴링으로 상태 실시간 반영, 완료 전엔 "Leave a Review" 버튼 비활성화) — 두 유저로 수락→도착→완료까지 실클릭 확인 완료
  - `categoryInfo.ts`를 `src/features/hero/`에서 `src/constants/`로 이동 (User/Hero 양쪽에서 공용으로 씀)
  - 가짜 "약 8분 후 도착" 문구 삭제 — 실제 ETA 계산이 없는데 숫자를 지어내는 건 부정직해서, "히어로가 오고 있어요" 정도로 순화

**P1 상태 연결 5단계 전부 완료. User ↔ Hero 플로우가 처음부터 끝까지 실제 Supabase 데이터로 연결됨.**
- [ ] (참고) `missions.address`는 아직 위치 입력 화면이 없어 placeholder 텍스트로 저장 중 — P2 위치 작업 때 실제 주소로 교체

## 🟠 P1 · 리뷰 (Review)
- [x] Complete 화면 별점/코멘트 실제 저장 (`useSubmitReview`, `missionId`를 Mission Status → Complete로 전달)
  - `reviews` INSERT RLS 강화: 완료된 미션 + 실제 요청자/히어로 매칭 확인 (`0004_review_trigger_and_rls.sql`)
  - 리뷰 insert 시 `profiles.hero_rating`/`hero_review_count` 자동 재계산 트리거(`handle_new_review`) 추가
  - 테스트 계정 2개로 실제 미션 2건 완료 + 리뷰 2건(5점/3점) 남겨서 평점 4.0/카운트 2로 정확히 집계됨을 확인, RLS 차단 케이스(미완료 미션 리뷰, 본인 리뷰)도 403으로 정상 차단됨을 확인 완료
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
