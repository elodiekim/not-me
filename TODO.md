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
- [x] ~~이메일 중복 체크~~ — Supabase Auth의 `auth.users.email` unique 제약으로 이미 처리됨, 별도 구현 불필요
- [x] 회원가입 폼: 비밀번호 확인(재입력) 필드 추가 — 회원가입 모드에만 표시, `password !== passwordConfirm`이면 canSubmit 막고 Input `error`로 "Passwords don't match" 영/한 문구 표시, toggleMode 시 초기화. DB 변경 없음(클라 전용)
- [x] 회원가입 폼: 휴대전화 번호 입력 필드 추가 (`profiles.phone`)
  - `0005_add_profile_phone.sql`: `profiles.phone` nullable text 추가(unique 없음) + `handle_new_user()`를 `create or replace`로 재정의해 `raw_user_meta_data->>'phone'`도 insert (0002 소급수정 안 함) — Management API로 실제 원격 DB에 적용 완료
  - AuthScreen: Email 아래에 Phone Input(회원가입 모드만), 가벼운 정규식(`/^[0-9+\-\s()]{7,}$/`) 검증으로 필수 입력, signUp `options.data.phone`로 전달. `Profile.ts`/`useProfile.ts`에 `phone` 반영
  - 검증: `npx tsc --noEmit` 통과 · expo web + Playwright — 로그인 모드엔 phone/confirm 필드 안 뜸, 비번 불일치·잘못된 phone 시 에러+버튼 비활성, 정상 입력 시 가입→자동 로그인, 원격 DB에서 해당 유저 `profiles.phone = '010-1234-5678'` 실제 저장 확인
- [ ] 비밀번호 찾기(재설정) 플로우 — `AuthScreen`에 "비밀번호를 잊으셨나요?" 진입점 + 이메일 입력 화면 + Supabase `resetPasswordForEmail` 연동, 리셋 링크 딥링크 처리 필요 (Expo Router 딥링크 설정 확인)
- [ ] **출시 전 재확인**: 개발 편의상 Supabase "Confirm email"을 꺼둔 상태 — 위 인증 폼 작업들과 함께 마무리하면서 다시 켤 것

## 🟠 P1 · 상태 연결 (플로우 간 데이터 전달)
- [x] ~~Zustand `useRequestStore`~~ — 불필요 판단: 카테고리는 바퀴벌레 하나뿐이라 선택지 없음, 리워드는 쿼리 파라미터로 충분
- [x] **1/5 Reward 확정 → 실제 `missions` row 생성** (`useCreateRequest`), `missionId`를 Searching로 전달 — REST로 실제 insert 확인 완료
- [x] **2/5 Hero의 Nearby Missions**: mock → 실제 `status='requested'` 미션 조회 (`useNearbyMissions`, `useMission`), 요청자 이름까지 join으로 표시 확인 완료
  - Nearby Missions/Mission Detail 둘 다 real data — 하지만 **Active Mission 화면은 아직 mock**이라 지금 "Accept Mission" 누르면 그 화면에서 "Mission not found" 뜸 (3/5에서 고침, 예상된 중간 상태)
- [x] **3/5 Hero 수락 처리**: `useAcceptMission`(hero_id/status='accepted', 이중수락 방지 가드) + `useUpdateMissionStatus`(arrived/completed), Active Mission 화면 real data 전환 — Accept → Arrived → Complete → Reward $ 표시까지 실클릭으로 확인 완료
  - RLS에 "열린 미션 수락" 정책 추가 필요했음 (`0003_claim_open_mission.sql`) — 기존 정책은 이미 배정된 요청자/히어로만 커버해서 최초 수락 시점엔 안 맞았음
  - mock 데이터 파일(`hero/data/nearbyMissions.ts`) 삭제 (더 이상 아무도 안 씀)
- [x] **4/5 Searching**: 가짜 2.5초 setTimeout → 실제 매칭 감지 (`useMission` 2초 폴링) — 두 명 유저로 동시 테스트: Hero가 수락하자 Requester 화면이 자동으로 Mission Status로 이동 확인 완료
  - Cancel 버튼 실제 취소 처리 연결 완료: `useUpdateMissionStatus`로 `status: 'cancelled'` 업데이트 후 홈 이동, 처리 중 loading/disabled, 실패해도 홈으로 보내서 화면에 갇히지 않음 (폴링 useEffect가 cancelled를 mission-status로 튕기지 않게 가드 추가)
  - 검증: 실제 Supabase에 테스트 계정 2개로 미션 생성 → 취소 PATCH(요청자 JWT, RLS 통과) → row status가 `cancelled`로 변경 확인, 취소 후 다른 계정의 Nearby(`status=eq.requested`) 조회에서 제외됨 확인, `npx tsc --noEmit` 통과
- [x] **5/5 Mission Status**: 하드코딩("Minjun", "약 8분", step=2) → 실제 미션 + 히어로 데이터 (`useMission`에 hero profile join 추가, 3초 폴링으로 상태 실시간 반영, 완료 전엔 "Leave a Review" 버튼 비활성화) — 두 유저로 수락→도착→완료까지 실클릭 확인 완료
  - `categoryInfo.ts`를 `src/features/hero/`에서 `src/constants/`로 이동 (User/Hero 양쪽에서 공용으로 씀)
  - 가짜 "약 8분 후 도착" 문구 삭제 — 실제 ETA 계산이 없는데 숫자를 지어내는 건 부정직해서, "히어로가 오고 있어요" 정도로 순화

**P1 상태 연결 5단계 전부 완료. User ↔ Hero 플로우가 처음부터 끝까지 실제 Supabase 데이터로 연결됨.**
- [x] (참고) `missions.address`는 아직 위치 입력 화면이 없어 placeholder 텍스트로 저장 중 — Confirm Location 화면 추가로 해결 (아래 P2 항목 참고)

## 🟠 P1 · 리뷰 (Review)
- [x] Complete 화면 별점/코멘트 실제 저장 (`useSubmitReview`, `missionId`를 Mission Status → Complete로 전달)
  - `reviews` INSERT RLS 강화: 완료된 미션 + 실제 요청자/히어로 매칭 확인 (`0004_review_trigger_and_rls.sql`)
  - 리뷰 insert 시 `profiles.hero_rating`/`hero_review_count` 자동 재계산 트리거(`handle_new_review`) 추가
  - 테스트 계정 2개로 실제 미션 2건 완료 + 리뷰 2건(5점/3점) 남겨서 평점 4.0/카운트 2로 정확히 집계됨을 확인, RLS 차단 케이스(미완료 미션 리뷰, 본인 리뷰)도 403으로 정상 차단됨을 확인 완료
- [ ] Profile 평점/리뷰 수 실제 집계값 표시 (지금 4.9 / 128 하드코딩)

## 🟡 P2 · 실시간 & 위치 (제품 핵심 경험)
- [x] 위치 권한 + 현재 위치 획득 (expo-location)
- [x] Nearby Missions 실제 거리 계산 (~~지금 "0.3 km away" 하드코딩~~ → 확인 결과 거리 표시 자체가 없었음(stale 메모). `missions.latitude/longitude` 저장 + haversine으로 실거리 계산해 subtitle에 표시, `0006_add_mission_location.sql` 사용자가 실행 완료·검증 완료)
- [x] **Confirm Location 화면** (`PRODUCT.md`의 "현재 위치 기본값, 수동 편집 폴백" 구현): Reward → Confirm Location → Searching으로 플로우 변경. 좌표를 가져오는 책임을 `useCreateRequest`에서 이 화면으로 이동(`CreateRequestInput`에 `address`/`latitude`/`longitude` 추가). 진입 시 위치 권한 요청 → 허용되면 `reverseGeocodeAsync`로 주소 프리필(사용자가 자유롭게 수정 가능), 거부/실패하면 빈 입력창에서 직접 타이핑. 주소 비어있으면 Confirm 버튼 비활성화
  - Expo Web에서는 `expo-location`의 `reverseGeocodeAsync`가 미지원(웹 전용 폴백 새로 안 만들고 실패 케이스로 처리 — 좌표는 정상 캡처되고 주소만 빈 채로 시작, 수동 입력 가능)이라 자동 프리필은 네이티브에서만 확인 가능
  - Playwright로 검증: 권한 허용 시 좌표 캡처 + 수동 입력 주소로 미션 생성 → REST로 `latitude/longitude` 정상 저장 확인, 권한 거부 시 Confirm 버튼 비활성화 → 수동 입력 후 정상 생성 + 좌표 `null` 확인, 콘솔 에러 없음
  - 상세 주소(동/호수) 입력 필드 추가 (선택 입력): building address + detail address를 별도 state로 관리하다가 Confirm 시점에 `"${building}, ${detail}"`로 합쳐서 저장 (detail 비어있으면 building만). REST로 확인 결과 `"123 Test Street, Seoul, 301-호"`처럼 정확히 합쳐짐, detail 없을 땐 trailing comma 없이 building 주소만 저장됨 확인
- [x] 취소한 미션도 Mission 탭 History에 표시 (`MissionsTabScreen.tsx`): `historyMissions` 필터에 `cancelled` 추가, `statusLabel`을 취소된 건은 "Cancelled · 취소됨"(neutral variant)로 분기 — 리워드 금액 대신 취소 라벨 표시. Active 필터는 그대로라 취소된 미션은 Active에 안 보이고 History로만 이동. 실제로 미션 생성→취소→Missions 탭에서 History에 뜨는지, Active엔 안 뜨는지 확인 완료
- [ ] Mission Status 실시간 업데이트 (Supabase Realtime)
- [ ] (선택) 지도 표시
- [x] Searching 화면 나가기(X 버튼): 대기 화면 오른쪽 상단에 X 아이콘 추가, 미션은 취소하지 않고 `router.replace('/')`로 홈만 이동(`accessibilityLabel="Close"`). 기존 "Cancel" 버튼(실제 취소)은 그대로 유지, 둘이 공존. 만료(expired) 화면엔 X 버튼 미추가(이미 Try Again/Back to Home 두 버튼으로 명확한 종료 상태라서)
  - Mission 탭 Active 섹션이 이미 `status='requested'`도 표시하고 탭하면 `/mission-status`로 보내주는 기존 로직을 그대로 재사용 — 복귀 경로 새로 안 만듦
  - Playwright로 검증: X 클릭 → 홈 이동 확인 → REST로 미션 status가 여전히 `requested`인지 확인 → Mission 탭 Active에 그대로 떠 있고 탭하면 `/mission-status`로 정상 이동 확인. Cancel 버튼 회귀 확인(인증된 요청으로 재조회 — RLS가 익명 키로는 취소된 미션을 못 읽어서 세션 토큰으로 확인): status가 `cancelled`로 정상 변경됨. 만료 화면엔 "Close" 라벨이 코드상 한 곳(대기 화면)에만 존재함을 확인
- [x] Searching 타임아웃: 일정 시간 지나도 히어로가 안 잡히면 자동 만료 처리
  - `SEARCH_TIMEOUT_MS` 상수 하나 (15분, `src/constants/mission.ts`로 분리) — 실사용 데이터 나오면 조정
  - 클라이언트에서 `created_at` 기준 경과 시간 체크 (setTimeout, 서버 크론 없음)
  - 새 `expired` 상태 대신 기존 `cancelled` 재사용 (마이그레이션/타입 변경 불필요, Nearby·Missions 탭 제외가 자동으로 따라옴 — 가장 간단한 쪽)
  - 만료 시 "No heroes nearby right now. Want to try again?" 화면 + Try Again(같은 카테고리/리워드로 새 미션 생성, `useCreateRequest` 재사용) + Back to Home
  - 만료/취소 업데이트에 `fromStatus: 'requested'` 조건 추가 (`useUpdateMissionStatus` 확장) — 히어로가 같은 순간 수락하면 0 row 매치로 무시되고 폴링이 mission-status로 이동 (useAcceptMission의 이중수락 가드와 같은 패턴)
  - 검증: `created_at`을 16분 전으로 백데이트한 미션으로 expo web + Playwright 실로그인 테스트 — 만료 화면 표시, row `cancelled` 변경, Try Again으로 새 `requested` 미션 생성 후 검색 화면 복귀 확인. 히어로 계정 REST 조회에서 취소 미션은 Nearby 제외(RLS상 아예 안 보임), 새 미션은 정상 노출 확인. `npx tsc --noEmit` 통과
- [x] **화면 밖에서도 만료 처리 (opportunistic 체크)**: SearchingScreen을 벗어나면(X 버튼 등) 타이머가 언마운트되며 사라져서 화면 밖에서는 미션이 영원히 `requested`로 남는 문제 수정
  - `SEARCH_TIMEOUT_MS` + `isRequestStale`/`millisUntilStale`를 `src/constants/mission.ts` / `src/utils/missionExpiry.ts`로 공용 분리, SearchingScreen도 이걸 사용하도록 교체
  - `MissionsTabScreen.tsx`에 `useEffect` 추가: 목록 로드될 때마다 `role === 'user' && status === 'requested'`인 미션 중 stale한 것들을 `useUpdateMissionStatus`로 일괄 취소 (`fromStatus: 'requested'` 가드 동일 적용). 서버 크론이 아니라 "Mission 탭을 열어볼 때마다 한 번 더 확인"하는 방식 — 정시 취소 보장 아님, 그 정도로 충분
  - `MissionScreen.tsx`(`/mission-status`)에도 같은 opportunistic 체크 추가 — 직접 진입해도 만료 처리됨
  - `useUpdateMissionStatus`의 `onSuccess`에 `missionHistory` 쿼리 무효화 추가 — 취소 반영이 Mission 탭에 바로 보이도록
  - `MissionScreen.tsx`가 `cancelled` 상태를 정직하게 표시하도록 수정: 기존엔 `cancelled`를 못 다뤄서 "히어로가 오고 있어요" 같은 잘못된 문구가 뜰 수 있었음 → "Request cancelled / 요청이 취소됐어요" 안내 + 타임라인 숨김 + 버튼도 "Back to Home"으로 분기
  - 검증: `created_at`을 16분 전으로 백데이트한 미션 2건으로 각각 Mission 탭 진입/`/mission-status` 직접 진입 테스트 → 둘 다 자동으로 `cancelled` 전환 확인(REST), Mission 탭은 Active에서 빠지고 History로 이동 확인, `/mission-status`는 "This request was cancelled" 문구로 정상 표시(예전처럼 "히어로가 오고 있어요" 안 뜸) 확인. X 버튼/Cancel 버튼 회귀 확인 — 둘 다 그대로 정상 동작
- [x] Mission History 카드에 주소 표시: `MissionCard`에 `detail?: string` prop 추가(과설계 방지용으로 새 prop 하나만), History 섹션에서 `detail={mission.address}`로 전달. Active 섹션은 이번 범위 아니라 안 건드림. 취소된 미션/정상 완료된 미션 둘 다 History 카드에 주소가 정상 표시되는 것 실계정 2개로 수락→도착→완료 플로우까지 돌려서 확인

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
- [ ] Inbox 탭: Coming Soon → 활동 피드로 교체 (채팅 아님, CLAUDE.md상 Chat은 계속 보류)
  - 새 백엔드/테이블 없이 기존 `missions`(status 변화 + timestamp)와 `reviews`를 조합해 클라이언트에서 이벤트 목록 구성
  - 이벤트 예: "OO님이 요청을 수락했어요" / "OO님이 도착했어요" / "미션이 완료됐어요 — 리뷰를 남겨주세요" / (히어로) "OO님이 ★N 리뷰를 남겼어요"
  - `useMissionHistory`에서 이미 조회하는 미션 목록을 재사용해서 이벤트로 매핑하는 방식이 가장 간단 (새 훅 필요하면 최소한으로)
- [x] **뒤로가기 버튼 누락** — Hero의 Nearby Missions (`/hero`) + Mission Detail (`/hero/[id]`) 헤더에 back 버튼 추가
  - RequestScreen/RewardScreen의 기존 Feather `arrow-left` + `router.back()` 패턴 그대로 재사용 (공용 Header 컴포넌트 안 만듦, 2개뿐이라 추상화 이르다 판단). Nearby는 두 줄 타이틀 구조 유지하며 첫 줄에만 back, 서브타이틀은 `ml-10`으로 타이틀 아래 정렬
  - `router.back()` 그대로 사용 (Expo Router는 스택 비면 no-op이라 fallback 불필요)
  - (Searching / Mission Status / Active Mission / Complete / Reward Earned는 커밋된 미션이라 의도적으로 back 없음 — 안 건드림, grep으로 재확인)
  - 검증: expo web + Playwright 실로그인 — Home→Hero Mode→Nearby에서 back→Home 복귀, Nearby→미션 탭→Mission Detail에서 (수락 안 하고) back→Nearby 복귀 확인, 스크린샷으로 레이아웃 확인, `npx tsc --noEmit` 통과

## ⚪ 품질 / 인프라 (선택)
- [ ] ESLint / Prettier 설정
- [ ] 핵심 훅 · 유틸 기본 테스트
- [ ] EAS Build → TestFlight 설정
- [ ] AGENTS.md의 Expo 버전(57) vs 실제(54) 정리

---

## 만들지 않음 (CLAUDE.md 기준)
결제 · AI · 채팅 · 푸시알림 · 애널리틱스 · 어드민 · 리퍼럴 · 게이미피케이션
