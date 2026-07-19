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

## 🔴 P0 · 정합성 / 신뢰 버그 (점검에서 발견, 수정 완료 · 2026-07-10)
- [x] **자기 요청을 자기가 수락 → 자기 리뷰로 평점 조작 방지** (신뢰 훼손 가능한 실제 버그)
  - 증상: `useNearbyMissions`가 `status='requested'` 미션을 **본인 것 포함 전부** 반환하고, `useAcceptMission`·RLS(`0003_claim_open_mission.sql`) 어디에도 `requester_id ≠ hero_id` 체크가 없음 → 요청자가 Hero 모드에서 **자기 요청을 수락 가능**. 완료까지 진행하면 리뷰 INSERT RLS가 전부 self로 충족돼 **자기 자신에게 리뷰를 남겨 `hero_rating`을 부풀릴 수 있음** (`handle_new_review` 트리거가 그대로 반영).
  - 수정 (3겹):
    - `useNearbyMissions.ts`: 쿼리에 `.neq('requester_id', userId)` 추가 → 목록에서 본인 요청 제외
    - `useAcceptMission.ts`: update 쿼리에 `.neq('requester_id', userId)` 추가 → 직접 API 진입해도 0 row 매치로 실패
    - `0007_prevent_self_accept.sql`: `0003` claim 정책에 `requester_id <> auth.uid()` 추가 + 리뷰 INSERT 정책에 `requester_id <> hero_id` 추가
  - **주의(중요)**: 처음엔 claim 정책만 고쳤더니 실제 공격 재현에서 **자기 수락이 여전히 성공**했음. 원인은 Postgres RLS가 같은 커맨드의 permissive 정책들을 **OR**로 묶는다는 점 — `0001`의 "Requester or accepted hero can update a mission" 정책이 `with check` 없이 기본값(=`using`, 즉 `auth.uid() = requester_id or auth.uid() = hero_id`)을 쓰기 때문에 requester 본인이면 이 정책만으로 이미 통과됨. 그래서 0007에 `as restrictive` 정책(`hero_id is null or hero_id <> requester_id`)을 추가로 넣어 모든 UPDATE 경로에 AND로 강제 적용해서 해결. **정책 하나만 손보는 방식은 다른 permissive 정책에 의해 우회될 수 있으니 이후 유사 RLS 수정 시 restrictive 정책 필요 여부를 항상 검토할 것.**
  - 검증 (실제 REST API로 공격 시나리오 재현, 임시 테스트 계정 2개 사용): ①본인 요청 self-accept 시도 → `403 new row violates row-level security policy "Requester and hero must never be the same person"` 확인 ②다른 계정(B)의 정상 플로우 — nearby 노출 → accept → arrived → completed → 리뷰 insert(201) → `profiles.hero_rating` 실제로 5.0 반영까지 전부 정상 동작 확인 (회귀 없음). `npx tsc --noEmit` 통과. 테스트 데이터는 종료 후 정리(mission/review row는 delete, 테스트용 auth 계정 2개는 service key 없어 남아있음 — 무해한 더미 계정).
- [x] **DB의 알 수 없는 `category` 값으로 크래시 가능** — `CATEGORY_INFO[mission.category]`가 6개 화면(Active/Detail/Nearby/Mission/MissionsTab)에서 직접 인덱싱되는데, `missions.category`는 DB에 enum/check 제약 없는 자유 텍스트라 정보 없는 값이 들어오면 `undefined.icon`으로 크래시. `getCategoryInfo(category)` 헬퍼를 추가해 매칭 안 되면 유일한 실제 카테고리(cockroach)로 폴백하도록 6곳 전부 교체
- [x] **`/mission-status`에 Cancel 버튼 없음** (수정 완료 · 2026-07-16) — Mission 탭 Active에서 재진입하는 `MissionScreen`에 취소 수단이 없어 유저가 15분 자동만료만 기다려야 하던 문제 해결.
  - `MissionScreen.tsx`: `mission.status === 'requested'`일 때만 Cancel 버튼(ghost) 노출. `handleCancel`은 `SearchingScreen`과 동일 패턴 — `useUpdateMissionStatus`로 `{ status: 'cancelled', fromStatus: 'requested' }`, 성공/실패 관계없이 `router.replace('/')`로 홈 이동(실패해도 유저를 화면에 가두지 않음). `updateStatus.isPending`으로 버튼 loading/disabled
  - 상태 분기: `cancelled`→"Back to Home", `requested`→Cancel, 그 외(accepted/on_the_way/arrived)→"Waiting for completion..."(비활성), `completed`→"Leave a Review". **`accepted`/`on_the_way`엔 Cancel 미노출** — 히어로가 이미 이동 중인 상태의 취소는 신뢰/보상 이슈라 지금 범위 아님, Known Gap으로 유지
  - 검증(expo web + Playwright, 실 REST): `requested` 미션 진입 시 Cancel 보임 → 클릭 → DB `status='cancelled'` 확인 + 홈 이동 확인. 미션을 `accepted`로 바꾸면 같은 화면에 Cancel 없고 "Waiting for completion..." 표시 확인. `npx tsc --noEmit` 통과
- [x] **취소 후 홈에서 확인 토스트 없음** (수정 완료 · 2026-07-16) — 요청을 취소하면(Searching/Mission Status의 Cancel) 조용히 홈으로만 이동해서 "진짜 취소됐나?" 확신이 안 서던 문제 해결. 취소한 본인에게만, 홈에서만 짧은 확인 배너 표시(히어로/타 유저 알림 아님, 범위 밖).
  - `src/components/ui/Toast.tsx` 신규: RN 기본 `Animated`만 사용(토스트 라이브러리 없음), 페이드 인(200ms)→hold(2.5s)→페이드 아웃 후 `onDismiss` 자동 호출. 탭바 위 하단 고정(`bottom: 96`, `zIndex: 50`). **주의**: NativeWind가 `Animated.View`엔 className을 적용 안 해서(배경/위치/패딩 무시됨) — Animated.View는 opacity·절대위치만 inline style로, 배너 모양(bg/rounded/padding)은 내부 일반 `View`에 className으로 분리
  - 신호 전달은 쿼리 파라미터(새 전역 상태 없음): `SearchingScreen`/`MissionScreen`의 `handleCancel`이 취소 성공 후 `router.replace({ pathname: '/', params: { cancelled: '1' } })`로 이동. X(닫기)는 파라미터 없이 `router.replace('/')`라 토스트 안 뜸
  - `HomeScreen`: `cancelled === '1'` 감지 시 토스트 표시 + `router.setParams({ cancelled: undefined })`로 인메모리 파라미터 제거(탭 이동·재진입 시 재발 방지). **`router.replace('/')`는 홈을 리마운트해 토스트가 아예 안 뜨므로 일부러 setParams 사용**
  - 검증(expo web + Playwright, 인앱 네비게이션 = 네이티브 라우팅과 동일): ①실제 미션 생성→Searching/Mission Status에서 Cancel→홈 도착 시 다크 배너 "Request cancelled · 요청이 취소됐어요" 육안 확인(스크린샷), 2.5초 후 자동 소멸(`onDismiss` 호출) ②토스트 소멸 후 Mission 탭 갔다 Home 재진입 → 재발 없음 ③X(닫기)로 홈 도착 시 토스트 없음. `npx tsc --noEmit` 통과. (참고: 웹 브라우저 하드 새로고침 시 URL에 `?cancelled=1`이 남아 재발할 수 있으나, URL·새로고침 개념이 없는 네이티브 앱에선 발생 불가한 web-preview 전용 아티팩트)
- [x] **중복 요청 가능** (수정 완료 · 2026-07-16) — 활성 미션이 있어도 새 미션을 또 만들 수 있던 문제 해결.
  - `src/hooks/useActiveMission.ts` 신규(가벼운 훅): 로그인 유저가 requester인 미션 중 `status in ('requested','accepted','on_the_way')` 하나를 `id, status`만 `limit(1).maybeSingle()`로 조회(있으면 `{id,status}`, 없으면 null). `useMissionHistory` 재사용 안 함
  - `RequestScreen.tsx` 진입 시점에서 이 훅으로 체크 — 활성 미션 있으면 폼을 안 그리고 곧바로 그 미션의 `/mission-status`로 `router.replace`(새로 안 만들고 기존 걸로 보냄, 가장 단순). 로딩/리다이렉트 중엔 `LoadingIndicator`로 폼 깜빡임 방지. Request 플로우의 단일 관문이라 Home 버튼/직접 진입 모두 커버
  - 검증(expo web + Playwright): 활성(`requested`) 미션 있는 상태에서 Home→Request Help → 폼 대신 `/mission-status?missionId=<활성미션>`로 이동 확인. 활성 미션 없으면 정상적으로 `/request` 폼(Roach Catcher 등) 렌더 확인(회귀). 기존 Searching Cancel/X·opportunistic 만료 로직 미변경

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
- [x] Profile 평점/리뷰 수 실제 집계값 표시 — 점검 결과 이미 `useProfile`의 `heroRating`/`heroReviewCount` 실데이터로 표시 중(리뷰 0건이면 "첫 출동 대기 중" 안내). "4.9/128 하드코딩"은 옛 메모, 더 이상 사실 아님
- [x] 🔴 **[최우선] 완료 후 리뷰 입구가 사라짐 — 리뷰를 못 남김** (수정 완료 · 2026-07-18) — MVP 4대 성공조건의 마지막(리뷰)이 끊기던 버그
  - 증상: 요청자가 화면을 벗어나 있는 동안(홈/미션탭) 미션이 완료되면, 완료 미션은 Mission 탭 **History**로 떨어지는데 History 카드엔 `Pressable`이 없어 눌러도 반응이 없었음 — 리뷰 화면(`/complete`)으로 가는 유일한 입구(mission-status의 "Leave a Review" 버튼)는 그 화면에 실시간으로 머물러 있어야만 노출됐기 때문에, 결과적으로 완료된 미션에 리뷰를 남길 방법이 영구히 사라짐
  - 수정:
    - `useMissionHistory.ts` / `useMission.ts`: `missions` select에 `reviews(id)` 임베디드 리소스 추가(N+1 없이 한 번의 쿼리), `hasReview: boolean` 필드로 매핑해 `MissionHistoryEntry`/`MissionWithRequester`에 노출
    - `MissionsTabScreen.tsx`: History 카드 중 `role === 'user' && status === 'completed' && !hasReview`인 카드만 `Pressable`로 감싸 `/complete`로 라우팅, statusLabel도 "Leave a Review"로 변경. 이미 리뷰한 카드(`hasReview`)는 "Reviewed ✓"로 비활성 표시. 히어로쪽 완료 내역/cancelled는 이번 범위 아니라 그대로 미탭 유지
    - `MissionScreen.tsx`(`/mission-status`): 직접 진입 정합성 확인 결과 **실제로 재현되는 문제였음** — 이미 리뷰한 완료 미션에 직접 진입하면 "Leave a Review" 버튼이 다시 떠서 다시 눌러도 되는 것처럼 보임. `mission.hasReview` 체크 추가해 "Reviewed ✓" 비활성 표시로 전환
    - `CompleteScreen.tsx`: 범위 밖이었지만 같은 `hasReview`가 `useMission`에 이미 실려 오길래 확인해보니 **이것도 실제로 뚫려 있었음** — `/complete?missionId=<이미 리뷰한 미션>`에 직접 진입하면 리뷰 폼이 그대로 떠서, 제출 시 `reviews.mission_id` unique 제약(0001)에 걸려 매번 "Something went wrong. Please try again."만 뜨고 영원히 재시도해도 안 되는 막다른 골목이었음 — `hasReview`면 즉시 홈으로 리다이렉트하도록 최소 가드 추가
  - **삽질 기록**: `reviews.mission_id`가 unique 제약이라 PostgREST가 `missions.reviews` 임베드를 (배열처럼 보여도) **단일 객체 또는 null**로 반환한다는 걸 몰라서, 처음에 `(row.reviews?.length ?? 0) > 0`로 짰다가 객체엔 `.length`가 없어 **항상 false**로 계산되는 버그를 만들었음(REST로 직접 select 응답 찍어보고 발견). `row.reviews != null`로 수정. 이후 이 테이블처럼 embed 대상 FK에 unique 제약이 있으면 배열이 아니라 단일 객체로 온다는 점 기억할 것
  - 검증(임시 테스트 계정 2개, expo web + Playwright, 실 REST 시딩): ① mission-status 화면 **밖에** 있는 상태로 미션을 완료 처리(REST로 accept→arrived→completed) → Mission 탭 History에서 "Leave a Review" 카드 탭 → `/complete`에서 별점 남기고 제출 → REST로 `reviews` row 실제 생성 확인 ② 제출 후 History 카드가 "Reviewed ✓"로 바뀌고 탭 불가 확인 ③ 같은 미션에 `/mission-status` 직접 진입 시 "Leave a Review" 대신 "Reviewed ✓" 확인 ④ `/complete` 직접 진입 시 폼 대신 홈으로 리다이렉트 확인 ⑤ 회귀: mission-status 화면에 계속 머물러 있다가 실시간(Realtime)으로 완료 감지 → "Leave a Review" 정상 노출 → 클릭 시 `/complete` 정상 이동까지 확인. `npx tsc --noEmit` 통과, 총 15개 체크 전부 통과

## 🟡 P2 · 실시간 & 위치 (제품 핵심 경험)
- [x] 위치 권한 + 현재 위치 획득 (expo-location)
- [x] Nearby Missions 실제 거리 계산 (~~지금 "0.3 km away" 하드코딩~~ → 확인 결과 거리 표시 자체가 없었음(stale 메모). `missions.latitude/longitude` 저장 + haversine으로 실거리 계산해 subtitle에 표시, `0006_add_mission_location.sql` 사용자가 실행 완료·검증 완료)
- [x] **Nearby Missions 근접 필터/정렬** (점검에서 발견) — 거리 *표시*만 하고 전체 열린 요청을 다 보여주던 문제 수정. 서울 히어로에게 부산 요청이 "400km"로 뜨던 상황 해결
  - `NearbyMissionsScreen.tsx`에 `rankByDistance()` 순수 함수 추가: 히어로 좌표 있으면 거리순 정렬(좌표 없는 미션은 후순위, 목록에선 안 빠짐) + `NEARBY_RADIUS_KM`(50km, `src/constants/mission.ts`) 밖은 제외. 히어로 좌표 없음(권한 거부/로딩 중)이면 정렬 불가라 서버 순서(`created_at desc`) 그대로 유지, 필터도 안 함. `useMemo`로 매 렌더 재정렬 방지
  - 반경은 50km로 넉넉하게(과설계 금지 — 카테고리 하나뿐이고 사용자 적은 초기 단계라 필터로 빈 상태 남발하는 것보다 정렬이 핵심이라 판단, 필터는 극단적 케이스만 거름)
  - Playwright로 검증: 정확한 좌표(1km/5km/20km/60km/좌표없음)로 미션 5개 생성 → 히어로 계정(권한 허용)에서 열어보니 가까운 순으로 정확히 정렬(1.0km → 5.0km → 20.0km 순서 확인), 60km 미션은 목록에서 제외, 좌표 없는 미션은 거리 표시 없이 맨 뒤. 같은 데이터를 권한 거부 계정으로 열면 60km 미션도 포함해서 전부 뜨고(필터 없음) 거리 표시도 없이 서버 순서 그대로 — 필터/정렬 유무 차이를 미션 개수(18 vs 17, 정확히 1건 차이)로도 검증. 콘솔 에러 없음, `npx tsc --noEmit` 통과
- [x] **Confirm Location 화면** (`PRODUCT.md`의 "현재 위치 기본값, 수동 편집 폴백" 구현): Reward → Confirm Location → Searching으로 플로우 변경. 좌표를 가져오는 책임을 `useCreateRequest`에서 이 화면으로 이동(`CreateRequestInput`에 `address`/`latitude`/`longitude` 추가). 진입 시 위치 권한 요청 → 허용되면 `reverseGeocodeAsync`로 주소 프리필(사용자가 자유롭게 수정 가능), 거부/실패하면 빈 입력창에서 직접 타이핑. 주소 비어있으면 Confirm 버튼 비활성화
  - Expo Web에서는 `expo-location`의 `reverseGeocodeAsync`가 미지원(웹 전용 폴백 새로 안 만들고 실패 케이스로 처리 — 좌표는 정상 캡처되고 주소만 빈 채로 시작, 수동 입력 가능)이라 자동 프리필은 네이티브에서만 확인 가능
  - Playwright로 검증: 권한 허용 시 좌표 캡처 + 수동 입력 주소로 미션 생성 → REST로 `latitude/longitude` 정상 저장 확인, 권한 거부 시 Confirm 버튼 비활성화 → 수동 입력 후 정상 생성 + 좌표 `null` 확인, 콘솔 에러 없음
  - 상세 주소(동/호수) 입력 필드 추가 (선택 입력): building address + detail address를 별도 state로 관리하다가 Confirm 시점에 `"${building}, ${detail}"`로 합쳐서 저장 (detail 비어있으면 building만). REST로 확인 결과 `"123 Test Street, Seoul, 301-호"`처럼 정확히 합쳐짐, detail 없을 땐 trailing comma 없이 building 주소만 저장됨 확인
- [x] 취소한 미션도 Mission 탭 History에 표시 (`MissionsTabScreen.tsx`): `historyMissions` 필터에 `cancelled` 추가, `statusLabel`을 취소된 건은 "Cancelled · 취소됨"(neutral variant)로 분기 — 리워드 금액 대신 취소 라벨 표시. Active 필터는 그대로라 취소된 미션은 Active에 안 보이고 History로만 이동. 실제로 미션 생성→취소→Missions 탭에서 History에 뜨는지, Active엔 안 뜨는지 확인 완료
- [x] Mission Status 실시간 업데이트 (Supabase Realtime)
  - `useMission.ts`에 `useEffect`로 realtime 구독 추가: `id` 있을 때 `supabase.channel('mission-{id}')`로 `missions` 테이블 해당 row(`id=eq.{id}`) UPDATE 구독 → 이벤트 수신 시 캐시를 직접 안 채우고 `queryClient.invalidateQueries(['mission', id])` 호출(payload에 requester/hero join이 없어서). 언마운트 시 `supabase.removeChannel(channel)`로 구독 해제. 훅 하나만 고쳐서 Searching/Mission Status/ActiveMission/MissionDetail/Complete 5개 화면 자동 적용
  - 폴링은 안전망으로 유지: Searching 2s→30s, Mission Status 3s→30s (소켓 끊김/재연결 실패 대비 off 안 함). `refetchOnReconnect`는 `new QueryClient()` 기본값(true) 그대로 → 네트워크 복귀 시 자동 재조회
  - DB: `missions` 테이블을 `supabase_realtime` publication에 추가해야 이벤트가 나옴(`docs/enable-missions-realtime.sql` = `alter publication supabase_realtime add table public.missions;`). 사용자가 SQL 실행 완료. PK(`id`) 필터 + `new`만 사용이라 `REPLICA IDENTITY FULL` 불필요
  - 검증(2계정, 실 Supabase): Requester 구독 상태에서 Hero가 REST로 `accepted` 변경 → Requester 소켓이 **457ms** 만에 UPDATE 이벤트 수신(30초 폴링보다 압도적으로 빨라 폴링 아닌 socket 확정). 채널 `SUBSCRIBED`→UPDATE(rows=1)→EVENT 순서 정상, 언마운트 시 `removeChannel`로 중복 구독 없음. `npx tsc --noEmit` 통과
  - (참고) publication 켜기 전 최초 측정에선 SUBSCRIBED·UPDATE 성공에도 20초간 이벤트 미수신 → Requester가 해당 row를 SELECT함을 확인해 RLS 아닌 publication 누락으로 진단, 활성화 후 재측정으로 해결
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
- [x] Splash 화면 — `expo-splash-screen` 설치 후 `_layout.tsx` 모듈 최상단에서 `SplashScreen.preventAutoHideAsync()` 호출, 폰트 로딩 + 온보딩 플래그 조회(`useOnboardingStore`)가 **둘 다** 끝나면 `hideAsync()`. 기존 `return null` 자리를 `ready` 게이트로 교체. app.json `expo-splash-screen` 플러그인에 `app-icon.png`(정사각에 가까운 586x619) + `resizeMode: contain` + 배경 `#FFFFFF`(DESIGN background 토큰). ⚠️ **네이티브 전용 동작**이라 Expo Web에선 스플래시 이미지 자체가 렌더되지 않음(웹에선 `hideAsync`가 사실상 no-op, 로직 흐름만 검증됨) — 실제 스플래시 표시는 EAS/네이티브 빌드에서 재확인 필요
- [x] Onboarding 화면 — `app/onboarding.tsx` + `src/features/onboarding/OnboardingScreen.tsx`(3장 슬라이드: bush-cockroach-cat / hero-cat / proud-cat + 영/한 두 줄 카피). 가로 `ScrollView pagingEnabled` + 하단 점 인디케이터(활성 primary, 새 캐러셀 라이브러리 없음). 우상단 Skip + 마지막 장 Get Started. 둘 다 AsyncStorage `hasOnboarded='true'` 저장 후 `/sign-in`으로 이동. **주의: `onMomentumScrollEnd`는 react-native-web에서 안 켜져 Get Started/점이 안 바뀌는 버그가 있어 `onScroll`로 교체함(웹/네이티브 공통 동작).** 온보딩 플래그는 `useOnboardingStore`(Zustand)로 메모리 반영 — 안 그러면 완료 직후 stale 플래그 때문에 `/onboarding`으로 되돌아가는 바운스 버그 발생하므로 store로 해결
  - AuthGate 게이트 로직: `!hasOnboarded && !session`이면 (온보딩 라우트가 아닌 한) `/onboarding`으로 리다이렉트(딥링크 우회 커버). 온보딩 완료했거나 세션 있는 유저가 `/onboarding`에 오면 세션 여부에 따라 `/` 또는 `/sign-in`으로 되돌림. 그 외는 기존 로직 그대로
  - 검증(Expo Web + Playwright, 실제 동작): ①localStorage 비운 첫 접속 → `/onboarding` 3장 표시 ②마지막 장 스크롤 시 Get Started 노출 → 탭 시 `/sign-in`, `hasOnboarded=true` 저장 ③온보딩 후 새로고침 → 온보딩 안 뜨고 바로 sign-in ④Skip → 즉시 sign-in + 플래그 저장 ⑤**회귀**: 실제 회원가입으로 세션 생성 후 `hasOnboarded` 플래그를 지우고 새로고침해도 온보딩 안 뜨고 `/`(홈) 유지, 로그인 상태로 `/onboarding` 딥링크해도 `/`로 리다이렉트 — 온보딩 로직이 로그인 유저 플로우를 안 건드림 확인. `npx tsc --noEmit` 통과
  - (테스트용 더미 계정 `onboard-test-*@example.com` 1개가 원격 auth에 남음 — service key 없어 삭제 불가, 무해한 더미)
- [x] app.json 앱 아이콘 / 스플래시 설정 — `expo.icon`에 `./assets/logo/app-icon.png` 연결(ios/android 공용 하나, 과설계 안 함) + 위 스플래시 플러그인. `npx expo config`로 icon/splash 경로 정상 resolve 확인. ⚠️ **아이콘 실제 렌더링은 Web에서 검증 불가(네이티브 전용)**, 게다가 `app-icon.png`가 정사각형이 아님(586x619) — Expo는 1024x1024 정사각 아이콘 권장이라 네이티브 빌드 시 왜곡/패딩 경고 가능성 있음. 정식 아이콘 규격(1024x1024 square) 준비 후 EAS 빌드에서 재확인 필요

## 🟢 P3 · 마감 완성도 (Definition of Done)
- [x] 로딩 상태: 리스트 스켈레톤 (Nearby / History) (완료 · 2026-07-16) — 스피너 하나(`LoadingIndicator`)로 화면 전체를 막던 걸 실제 카드 자리에 회색 뼈대를 먼저 보여주는 방식으로 개선(순수 UI, 훅/DB 로직 변경 없음).
  - `src/components/ui/MissionCardSkeleton.tsx` 신규: `MissionCard`와 동일한 `Card` 레이아웃(원형 아바타 블록 + 배지 바 + 텍스트 2줄)을 `bg-surface`(#F8F8F8) 블록으로 표현. RN 기본 `Animated`로 opacity 0.5↔1 pulse(700ms, `useNativeDriver:false`로 web 경고 회피, 새 라이브러리 없음). a11y에선 `accessibilityElementsHidden`+`importantForAccessibility="no-hide-descendants"`로 무시. `ui/index.ts`에 export
  - `NearbyMissionsScreen`: isLoading 시 `MissionCardSkeleton` 4개를 실제 리스트와 같은 `ScrollView`(padding 24, gap 16)에 나열
  - `MissionsTabScreen`: 화면 전체를 막지 않고 "My Missions" 헤더 유지 + Active/History 섹션 헤더 아래 각각 스켈레톤 2개씩. 빈 상태/에러/실데이터 분기는 그대로(isLoading 분기만 교체)
  - 검증(`npx tsc --noEmit` 통과 + expo web + Playwright): Supabase `/rest/v1/missions` 응답을 9초 지연시켜 로딩 상태를 붙잡고 스크린샷 — 두 화면 모두 스켈레톤 카드가 실제로 렌더됨을 육안 확인(헤더 유지), 지연 해제 후 실데이터 카드로 매끄럽게 전환(Nearby $20 등, Missions Active/History 실데이터) 확인. 빈/에러 분기 미변경으로 회귀 없음
- [x] 빈 상태: Nearby Missions 빈 목록 처리 (완료 · 2026-07-16) — ⚠️ TODO 설명이 stale했음: "(현재 없음)"이라 적혀 있었지만 실제로는 텍스트 한 줄("No missions nearby right now...") 빈 상태가 **이미 있었음**. 이번 작업은 "새로 추가"가 아니라 **다른 화면과 스타일 통일**이 목적.
  - `NearbyMissionsScreen`의 빈 상태를 `MissionsTabScreen`의 "No active mission" 패턴과 동일 구조로 교체: `rounded-card bg-surface p-8` 박스 + Feather `search` 아이콘(28, `COLORS.textDisabled`) + 제목("No missions nearby") + 설명("근처에 요청이 없어요.\n곧 찾아올게요."). `flex-1 justify-center`로 화면 중앙 배치
  - **CTA 버튼은 의도적으로 없음** — Hero 모드에선 미션을 만드는 게 아니라 기다리는 화면이라 "Request Help" 같은 버튼이 안 맞음. 아이콘+제목+설명까지만
  - 순수 UI 변경, 훅/로직 변경 없음. 검증: `npx tsc --noEmit` 통과 + expo web + Playwright — missions 응답을 `[]`로 가로채 빈 상태 강제 → 박스 스타일 렌더 육안 확인, 가로채기 없이는 기존 리스트($20 등) 정상 렌더(회귀) 확인
- [x] 에러 상태: 네트워크 실패 시 사용자 친화 메시지 (완료 · 2026-07-16) — 구멍 2개 발견해서 메움: `MissionsTabScreen`이 `useMissionHistory()`에서 `isError`를 아예 안 받아 실패 시 조용히 빈 목록으로 보이던 문제, `MissionNotFound`(hero/[id]·hero/active 공용)가 "진짜 없음"과 "네트워크 에러"를 구분 안 하고 항상 "Mission not found."만 보여주던 문제(한글 카피도 없었음). 재시도 버튼도 전 화면에 없었음.
  - `MissionsTabScreen.tsx`: `isError`/`refetch` 구조분해 추가, 에러 시 다른 화면과 동일한 "Something went wrong.\nPlease try again." + Try Again 버튼으로 화면 전체 대체 (조용한 빈 상태 제거)
  - `MissionNotFound.tsx`: `onRetry?` prop 추가, "We couldn't load this mission.\n미션을 불러올 수 없어요." + Try Again 버튼으로 통일 — Supabase `.single()`은 "없음"과 "에러"를 구분 못 해 어차피 같은 에러로 던지므로 정직하게 두 경우 다 커버하는 문구 하나로 처리(과설계 방지). `MissionDetailScreen`/`ActiveMissionScreen`은 `useMission`이 이미 반환하던 `refetch`를 `onRetry`로 전달
  - `NearbyMissionsScreen` / `MissionScreen`(`/mission-status`) / `ProfileScreen`: 기존 에러 문구·레이아웃은 그대로 두고 각 훅의 `refetch()`를 호출하는 Try Again 버튼만 추가
  - 검증(`npx tsc --noEmit` 통과 + expo web + Playwright, 임시 테스트 계정 2개로 REST 라우트 인터셉트): 5개 화면(Nearby / Mission Detail·Active의 garbage-id / Mission tab / Profile / Mission Status) 전부 fetch 실패 시 "Something went wrong"류 정직한 문구 + Try Again 버튼 노출, 기술적 에러 문자열(PostgREST/TypeError 등) 노출 없음 확인. Try Again 클릭 시 실제 refetch 발생해 정상 데이터로 복구되는 것까지 확인. 5개 화면 정상 케이스(에러 없음) 회귀도 재확인. **삽질 기록**: 처음엔 `route.abort()`로 네트워크를 끊어서 테스트했는데 Chromium이 내부적으로 요청을 투명하게 재시도하면서 react-query의 retry(기본 3회, ~7초)와 타이밍이 안 맞아 무한 재시도처럼 보이는 착시가 있었음 — `route.fulfill({status:500})`로 바꾸니 정확히 4번 요청(0/1/3/7초) 후 에러 상태로 안정적으로 수렴함. 이후 이런 네트워크 실패 재현 테스트는 abort보다 fulfill(500) 방식 우선 사용할 것
- [ ] Profile 설정 항목(Account / Notifications / Help) 네비게이션 연결
  - **Account → Edit Profile 화면 신규**: 이름 / 휴대전화 / 아바타 사진 수정. `profiles.avatar_url` 컬럼은 이미 있고 `useProfile`도 이미 읽어오는 중이라 스키마 변경 불필요, UI + 업로드 플로우만 없음
  - ⚠️ **Supabase Storage 실제로는 아직 하나도 안 붙어있음** (CLAUDE.md 스택엔 있지만 지금까지 만든 기능 중 Storage 쓰는 곳 없음) — `avatars` 버킷 신규 생성 + RLS 정책(본인 파일만 write, 공개 read) 필요, 이번 작업이 Storage 최초 연동임을 감안하고 범위 잡을 것
  - 이미지 선택은 `expo-image-picker`(신규 설치 필요), 정사각 크롭(`aspect: [1,1]`)까지만, 필터/편집 등 추가 기능 없음(오버엔지니어링 방지)
  - 업로드 성공 시 `profiles.avatar_url` 갱신 + `useProfile` 캐시 무효화, 실패 시 DESIGN.md 톤으로 에러 메시지
  - Notifications/Help는 이번 범위 아님 — CLAUDE.md "만들지 않음"의 푸시알림과 겹치니 Notifications는 별도 판단 필요(지금은 손대지 말 것)
- [x] Home 알림 벨 아이콘 동작 또는 비활성 처리 — 정적 `<Image>`였던 벨을 `Pressable`로 감싸고 `accessibilityRole="button"`/`accessibilityLabel="Notifications"` + `hitSlop={10}`(네이티브에서 24→44pt 터치영역) 추가. 실제 알림 기능은 CLAUDE.md상 보류 범위라, 탭 시 "Coming soon · 곧 만나요" 토스트만 표시. `HomeScreen`의 토스트 상태를 `showCancelToast: boolean` → `toastMessage: string | null`로 최소 리팩터해 취소 확인/벨 안내가 같은 `<Toast>` 하나를 공유(`HomeHeader`는 `onBellPress` 콜백만 받음). Expo web 실측: 벨 탭→"Coming soon" 토스트 뜨고 ~2.9초 후 자동 소멸, 기존 취소 토스트(`?cancelled=1`)도 회귀 확인 완료, tsc 통과. 주의: `hitSlop`은 react-native-web에서는 클릭영역을 확장하지 않음(24px 그대로) — 네이티브 타깃에선 정상 44pt.
- [x] 커스텀 리워드 상한/검증 (점검에서 발견) — `RewardScreen`이 `Number(customValue) > 0`만 확인해 $999999 같은 값도 통과하던 문제. `MAX_REWARD_AMOUNT`(`constants/mission.ts`, $200) + 소수 2자리 정규식으로 클라이언트 가드 추가, DB에도 `reward_amount_range` check 제약(`0008_reward_amount_check.sql`) 추가해 이중 방어. 실제 앱에서 $201/$200 경계값, 10.123/10.12 소수 자리 확인 완료, REST로 직접 999999 insert 시도 시 `23514` 위반으로 차단되는 것도 확인 완료
- [x] Inbox 탭: Coming Soon → 활동 피드로 교체 (채팅 아님, CLAUDE.md상 Chat은 계속 보류)
  - 새 백엔드/테이블 없이 기존 `missions`(현재 status + `updated_at`)와 `reviews`를 조합해 클라이언트에서 읽기 전용 이벤트 목록 구성. missions엔 상태 변화 이력이 없어(현재 상태 한 줄뿐) 미션 하나당 "지금 상태 요약 이벤트 한 줄"만 생성 — 이 제약 수용, 이력 테이블 안 만듦
  - `useMissionHistory` 재사용/확장: select에 `requester`/`hero` profiles name + `reviews(id, rating)` 추가, `MissionHistoryEntry`에 `counterpartName` / `reviewRating` 필드 추가 (새 훅 안 만듦 — 데이터가 거의 동일). reviews는 `mission_id` unique라 PostgREST가 단일 객체로 임베드 → `row.reviews?.rating`로 접근
  - 이벤트 파생은 순수 함수 `features/inbox/deriveActivityEvents.ts`: (요청자) accepted→"OO님이 요청을 수락했어요" / on_the_way→"가는 중" / arrived→"도착했어요" / completed&리뷰없음→"미션 완료 — 리뷰를 남겨주세요"(탭→`/complete`) / completed&리뷰있음·requested·cancelled→생략, (히어로) 리뷰 받음→"OO님이 ★N 리뷰를 남겼어요", 그 외 생략. `updated_at` 최신순 정렬
  - `features/inbox/InboxScreen.tsx` 신규 + `app/(tabs)/inbox.tsx` 교체. 상대 시간("N minutes/hours/days ago", 7일 넘으면 날짜)은 새 라이브러리 없이 직접 계산. 리뷰 유도 이벤트만 `Pressable`, 나머지는 읽기 전용. 이벤트 0개면 기존 `ComingSoonScreen` 재사용, 로딩/에러는 전 화면 공통 패턴(LoadingIndicator / "Something went wrong" + Try Again)
  - 검증(테스트 계정 3개, expo web + Playwright, 실 Supabase): ① 요청자 Inbox에 "수락했어요"+"리뷰를 남겨주세요" 2건 뜨고 리뷰 완료된 미션은 생략됨 확인 ② 리뷰 유도 이벤트 탭→실제로 `/complete?missionId=...`(Submit Review 화면) 이동 확인 ③ 히어로 Inbox에 "★4 리뷰를 남겼어요" 1건만(수락/미리뷰 미션은 생략) 확인 ④ 미션 없는 새 계정은 Coming Soon 빈 상태 확인 ⑤ 헤더가 Home/Mission 탭과 통일된 두 줄("Inbox / 받은편지함") 확인. RLS 하에서 조인 select JSON shape(단일 객체 reviews/rating)도 REST로 재확인, `npx tsc --noEmit` 통과
- [x] **뒤로가기 버튼 누락** — Hero의 Nearby Missions (`/hero`) + Mission Detail (`/hero/[id]`) 헤더에 back 버튼 추가
  - RequestScreen/RewardScreen의 기존 Feather `arrow-left` + `router.back()` 패턴 그대로 재사용 (공용 Header 컴포넌트 안 만듦, 2개뿐이라 추상화 이르다 판단). Nearby는 두 줄 타이틀 구조 유지하며 첫 줄에만 back, 서브타이틀은 `ml-10`으로 타이틀 아래 정렬
  - `router.back()` 그대로 사용 (Expo Router는 스택 비면 no-op이라 fallback 불필요)
  - (Searching / Mission Status / Active Mission / Complete / Reward Earned는 커밋된 미션이라 의도적으로 back 없음 — 안 건드림, grep으로 재확인)
  - 검증: expo web + Playwright 실로그인 — Home→Hero Mode→Nearby에서 back→Home 복귀, Nearby→미션 탭→Mission Detail에서 (수락 안 하고) back→Nearby 복귀 확인, 스크린샷으로 레이아웃 확인, `npx tsc --noEmit` 통과
- [ ] **Mission Status 아바타가 히어로가 아니라 카테고리(벌레) 아이콘으로 표시됨** (디자인 리뷰에서 발견 · 2026-07-14) — 데모 계정으로 실제 화면을 열어보니 `MissionScreen.tsx`(`/mission-status`)가 `MissionCard`의 `avatar` prop에 `category.icon`(바퀴벌레 아이콘)을 넘기고 있어서, "Minjun is on the way"처럼 히어로 이름이 뜨는 카드인데 아바타는 벌레 아이콘으로 나옴 — 텍스트는 사람을 가리키는데 이미지는 벌레라 어색함. Mission 탭(무슨 미션인지 보여줘야 하는 리스트)에서 category 아이콘을 쓰는 건 맞지만, Mission Status(누가 오고 있는지 보여줘야 하는 화면)엔 히어로를 나타내는 아바타가 들어가야 함. `profiles`에 아바타 이미지가 아직 없다면, 이전에 만들어 둔 제네릭 프로필 아이콘(`assets/icons/profile.png`, 브랜드 옐로우)으로 대체하는 방향 검토
- [ ] **chevron/아이콘 색상·스타일이 화면마다 다름** (디자인 리뷰에서 발견 · 2026-07-14) — `MainMissionCard`/`BecomeHeroSection`의 chevron은 `COLORS.primary`(브랜드 옐로우)인데, `ProfileScreen`의 Account/Notifications/Help 리스트 chevron은 여전히 회색(`#AAAAAA`)이라 같은 "카드+화살표" 패턴이 화면마다 다르게 보임. 또 손그림 스타일 컬러 아이콘(bug/star/slipper 등 `assets/icons/`)과 Feather 아웃라인 아이콘이 여러 화면에 혼재하는데, DESIGN.md 「Icons」 섹션은 outline/Lucide 스타일만 명시하고 있어 기준이 불명확함. chevron 색과 아이콘 스타일 기준을 화면 전체에 걸쳐 하나로 정하고 통일 필요
- [x] **Inbox 탭에 상단 헤더가 없음** (디자인 리뷰에서 발견 · 2026-07-14) — Home(로고+벨) / Mission("My Missions") / Profile(아바타+이름)은 화면 상단에 타이틀이 있는데, Inbox는 헤더가 없던 문제. 바로 위 "Coming Soon → 활동 피드" 작업과 함께 해결: `InboxScreen`에 다른 탭과 통일된 두 줄 헤더("Inbox / 받은편지함", `MissionsTabScreen`과 동일한 `text-lg font-sans-semibold` + 서브타이틀) 추가. 이벤트 0개일 때 뜨는 `ComingSoonScreen`도 자체적으로 "Inbox / 받은편지함" 타이틀을 표시해 빈 상태에서도 정체성 유지. Playwright로 헤더 렌더 육안 확인 완료

## ⚪ 품질 / 인프라 (선택)
- [ ] ESLint / Prettier 설정
- [ ] 핵심 훅 · 유틸 기본 테스트
- [ ] EAS Build → TestFlight 설정
- [ ] AGENTS.md의 Expo 버전(57) vs 실제(54) 정리

---

## 만들지 않음 (CLAUDE.md 기준)
결제 · AI · 채팅 · 푸시알림 · 애널리틱스 · 어드민 · 리퍼럴 · 게이미피케이션
