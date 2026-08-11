# TODO

> 현재 상태: **기능 MVP 거의 완성** — User↔Hero 플로우가 처음부터 끝까지 실제 Supabase 데이터로 동작(요청→매칭→완료→리뷰).
> 인증 · Realtime · 위치/거리정렬 · 온보딩/스플래시 · Edit Profile(아바타 업로드) · Inbox 활동피드 · Total Earned · ESLint/Prettier까지 구현·검증 완료(대부분 Expo Web + Playwright 기준).
> **남은 핵심**: 네이티브 실기기 검증(EAS Build → TestFlight) · 출시 전 이메일 인증 재활성화 · 핵심 유틸 단위 테스트 · 스토리지/비번 입력 서버측 검증 마감. 상세는 아래 미착수(`[ ]`) 항목 참고.

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
- [x] ~~이메일 중복 체크 불필요~~ → **필요했음. 구현 완료 (2026-08-08)** — "unique 제약이 막아주니 됐다"는 옛 판단이 틀렸음. DB가 막는 것과 **사용자에게 뭐가 잘못됐는지 알려주는 것은 별개**였음. 실제로 이미 가입된 주소로 가입하니 "이메일을 확인해주세요"가 떠서, 오지 않을 메일을 기다리며 한참 헤맴(이 세션의 메일 삽질 전체가 여기서 시작됨)
  - **Supabase가 중복을 알려주는 방식이 Confirm email 설정에 따라 완전히 다름** — 한쪽만 처리하면 토글을 바꾸는 순간 조용히 깨짐. 둘 다 처리함:
    - **Confirm email 켜짐**: 에러가 아니라 **200 + 가짜 유저**를 돌려주고, `confirmation_sent_at`까지 채워 보냄(실제로는 발송 안 함). 계정 존재 여부를 못 캐게 하려는 의도적 설계. 구분 단서는 **`identities`가 빈 배열**인 것뿐 — REST로 직접 확인함
    - **Confirm email 꺼짐**: 평범하게 `user_already_exists` 에러로 떨어짐 → catch에서 처리
  - 절충 인지하고 진행: 중복을 알려주는 건 Supabase의 계정 열거(enumeration) 방어를 끄는 것. 단 `identities`로 이미 새고 있어서 실질 방어력이 약하고, 오지 않는 메일을 기다리는 사용자 피해가 더 크다고 판단
- [x] 회원가입 폼: 비밀번호 확인(재입력) 필드 추가 — 회원가입 모드에만 표시, `password !== passwordConfirm`이면 canSubmit 막고 Input `error`로 "Passwords don't match" 영/한 문구 표시, toggleMode 시 초기화. DB 변경 없음(클라 전용)
- [x] 회원가입 폼: 휴대전화 번호 입력 필드 추가 (`profiles.phone`)
  - `0005_add_profile_phone.sql`: `profiles.phone` nullable text 추가(unique 없음) + `handle_new_user()`를 `create or replace`로 재정의해 `raw_user_meta_data->>'phone'`도 insert (0002 소급수정 안 함) — Management API로 실제 원격 DB에 적용 완료
  - AuthScreen: Email 아래에 Phone Input(회원가입 모드만), 가벼운 정규식(`/^[0-9+\-\s()]{7,}$/`) 검증으로 필수 입력, signUp `options.data.phone`로 전달. `Profile.ts`/`useProfile.ts`에 `phone` 반영
  - 검증: `npx tsc --noEmit` 통과 · expo web + Playwright — 로그인 모드엔 phone/confirm 필드 안 뜸, 비번 불일치·잘못된 phone 시 에러+버튼 비활성, 정상 입력 시 가입→자동 로그인, 원격 DB에서 해당 유저 `profiles.phone = '010-1234-5678'` 실제 저장 확인
- [x] 비밀번호 찾기(재설정) 플로우 — `AuthScreen`에 "비밀번호를 잊으셨나요?" 진입점 + 이메일 입력 화면 + Supabase `resetPasswordForEmail` 연동, PKCE `exchangeCodeForSession`로 리셋 링크 딥링크 처리. redirectTo는 `Linking.createURL('reset-password')`로 환경별 자동(Expo Go는 `exp://`, 독립 빌드는 `notme://`)
  - ⚠️ **실제 이메일 링크 클릭 E2E는 개발 빌드/TestFlight에서 최종 확인 필요.** Expo Go(iOS)로는 검증 불가 — iOS Safari가 웹 302 리다이렉트를 통한 `exp://` 커스텀 스킴 오픈을 차단함(구조적 한계, 코드 문제 아님). 로직 자체(만료 코드 에러 처리 / `updateUser` 비번 변경 라운드트립 / 미존재 이메일 enumeration 방지)는 실제 Supabase 호출로 검증 완료
  - 📌 개발 빌드에서 테스트할 때: Supabase Auth → URL Configuration → Redirect URLs에 `notme://reset-password` 등록 필요. 같은 기기에서 요청+클릭해야 함(PKCE code_verifier 로컬 저장)
- [ ] **구글 로그인 (소셜 로그인, 카카오는 보류)** — 카카오는 Supabase 지원은 되지만 개인(비사업자) 카카오 개발자 계정으론 이메일 scope를 기본으로 못 받는 제약이 있어서 이번 범위에서 제외, 나중에 필요해지면 provider 하나 더 추가하는 식으로 확장
  - `signInWithOAuth({ provider: 'google' })` + `expo-web-browser`(`skipBrowserRedirect: true`) 조합, 비밀번호 재설정 때 만든 딥링크 처리(`Linking.createURL`, redirect URL 등록) 패턴 재사용
  - Google Cloud Console에서 OAuth 클라이언트 ID **3개** 필요(iOS / Android / Web) — 잘못된 자리에 잘못된 ID 넣으면 `DEVELOPER_ERROR`만 뜨고 원인 파악이 어려우니 설정 단계를 꼼꼼히 문서화하며 진행할 것
  - Supabase Dashboard의 Auth → Providers에서 Google 활성화 + 위 클라이언트 ID/시크릿 등록
  - **구글 가입 유저는 지금 이메일 가입 폼의 필수 휴대전화 입력을 건너뜀** → `profiles.phone`이 비어있는 상태로 시작함. 별도 "가입 직후 전화번호 입력" 화면은 새로 안 만들고, 이미 계획된 Edit Profile 화면(프로필 수정 항목 참고)에서 나중에 채우는 걸로 충분 — 지금 강제할 필요 없음
  - `handle_new_user()` 트리거가 OAuth 가입에도 그대로 타는지 확인 필요(현재는 이메일/비번 가입 기준으로 짜여 있음) — `raw_user_meta_data`에 `phone` 키가 없는 경우 정상적으로 null로 들어가는지 확인
  - 로그인 화면에 "Continue with Google" 버튼 추가(이메일/비번 폼과 나란히), 로딩 중 상태 처리
- [ ] **`missions`/`reviews`에 DELETE RLS 정책이 아예 없음** (점검 중 발견 · 2026-07-27) — RLS는 정책 없는 커맨드를 기본 거부하므로 보안 문제는 아니지만(안전한 기본값), 그 결과 ①실제 유저도 자기 미션/리뷰 row를 삭제할 방법이 전혀 없음(취소=`status` 변경만 가능, 진짜 삭제 불가) ②이번 세션 REST 테스트 정리용 DELETE 호출들이 `Prefer: return=representation` 없이는 204로 "성공"처럼 보였지만 실제로는 0건 삭제됨 — 원격 프로젝트에 테스트 계정/미션/리뷰 잔여 데이터가 생각보다 많이 남아있을 수 있음(무해한 더미, 지금은 그대로 둠). 나중에 처리할 때: `missions`는 아마 본인 소유 + `requested`(미매칭) 상태에서만 삭제 허용이 안전(수락/완료된 건 기록 보존 목적으로 삭제 막는 게 나을 수 있음), `reviews`는 신뢰 신호라 작성자가 임의로 지울 수 있게 할지 자체를 판단 필요 — 마이그레이션은 항상 그렇듯 파일만 작성, 직접 적용 금지
- [ ] 🚨 **메일 발송용 도메인 인증 — 출시 블로커** (2026-08-08 확인) — 현재 Resend를 커스텀 SMTP로 붙여뒀지만 도메인을 인증하지 않아서, 발신 주소가 테스트용 `onboarding@resend.dev`임. 이 상태에선 **Resend 계정 소유자 주소(`elodiekim93@gmail.com`) 딱 하나로만 발송되고 나머지는 전부 550으로 거절됨**. Gmail 별칭(`+t3`)도 다른 주소로 취급돼서 안 됨
  - **영향이 Confirm email 하나가 아님**: 비밀번호 재설정 메일도 같은 경로라 **똑같이 막힘**. 즉 지금 실사용자를 받으면 ①가입 확인 불가 ②비번 분실 시 계정 영구 복구 불가. Confirm email을 꺼도 재설정은 여전히 필요하므로 **도메인 인증은 토글과 무관하게 어차피 해야 함**
  - 할 일: 도메인 구입 → resend.com/domains에서 DNS 레코드 등록·인증 → Supabase SMTP의 Sender email을 `noreply@<도메인>`으로 교체 → 그 다음에 Confirm email 다시 켜기(아래 항목)
  - 참고(삽질 기록): 도메인 없이 우회하려고 Gmail SMTP(앱 비밀번호)를 시도했으나 `535 BadCredentials`로 실패해 포기하고 Resend로 롤백. 개발 중 확인 메일 흐름을 봐야 하면 ①`elodiekim93@gmail.com` 계정을 지우고 그 주소로 가입하거나 ②Mailtrap(모든 메일을 웹 화면에 가로채는 개발용 서비스) 사용
- [ ] **출시 전 재확인**: 개발 편의상 Supabase "Confirm email"을 다시 꺼둔 상태(2026-08-08) — 위 도메인 인증을 끝낸 뒤 다시 켤 것. 켜면 중복 이메일 응답 형태가 바뀌므로(위 중복 체크 항목 참고) 그때 가입 플로우 재확인 필요
- [x] **Account(계정) 화면에 이메일 표시 추가, 수정은 불가하게** (완료 · 2026-08-01) — `EditProfileScreen.tsx`에 `useAuthStore`의 `session.user.email`을 읽어 `<Input label="Email" value={email} editable={false} />`로 Name 위에 추가. 폼 상태로 관리 안 하고 저장 로직(`handleSave`/`useUpdateProfile`)도 안 건드림 — 표시만, 수정 불가
- [x] **비밀번호 최소 길이 클라이언트 검증** (점검에서 발견) — 가입(`AuthScreen`)·재설정(`ResetPasswordScreen`) 둘 다 `password.length > 0`만 확인. Supabase가 서버측 6자 최소를 걸어 막긴 하지만, 3자 등 입력 시 "Something went wrong"류 **모호한 에러**로 떨어져 사용자가 원인을 모름 → 두 화면에 "6자 이상" 안내 + `canSubmit` 가드 추가(서버 규칙과 숫자 일치시킬 것). 순수 클라 검증, DB 변경 없음
  - 서버 최소 길이 REST 확인: 5자→422 `weak_password`, 6자→200 → `MIN_PASSWORD_LENGTH = 6` (`src/features/auth/password.ts` 공유 상수)로 정확히 일치. 로그인 모드엔 미적용(기존 계정 로그인 막지 않게)
  - 검증: `npx tsc --noEmit` 통과 · expo web + Playwright 11/11 통과 — 가입 5자→에러+버튼 비활성, 6자→통과 / 로그인 짧은 비번→버튼 유지(회귀 방지) / 재설정 화면도 동일(PKCE 토큰 교환 intercept로 폼 렌더)

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
  - **⚠️ 위 수정이 관문을 잘못 잡았음 — 재수정 (사용자가 실기기 테스트 중 발견 · 2026-08-05)**: 가드를 `RequestScreen`에만 걸었는데 **실제로 미션을 insert하는 건 `ConfirmLocationScreen`**임. 플로우가 Request(가드O) → Reward(가드X) → Confirm Location(가드X) → Searching이라, 히어로가 수락한 뒤 **뒤로가기로 Confirm Location에 돌아가면 Confirm을 다시 눌러 미션을 계속 새로 만들 수 있었음**. 세 군데를 같이 고침:
    - `ConfirmLocationScreen.tsx`: `useActiveMission` 가드 추가(`RequestScreen`과 동일 패턴). 단 `useEffect`가 아니라 **`useFocusEffect`** — 이 화면은 `/searching` 밑에 마운트된 채로 남아있어서, 평범한 effect로 `router.replace`를 부르면 유저가 보고 있는 Searching 화면을 갈아치워버림
    - `useCreateRequest.ts`: `onSuccess`에서 `['activeMission']` 무효화 추가. **이게 없으면 가드를 붙여도 안 먹힘** — 화면이 언마운트되지 않으니 캐시된 "활성 미션 없음"(null)을 계속 읽음. 기존엔 `missionHistory`만 무효화하고 있었음
    - `useActiveMission.ts`: `ACTIVE_STATUSES`에 **`'arrived'`가 빠져 있던 별개 버그** — 히어로가 도착한 상태면 "활성 미션 없음"으로 판정돼서 `RequestScreen` 가드까지 뚫렸음. 추가함
  - 검증: `npx tsc --noEmit` / `npx eslint` 통과. **실기기(iOS 시뮬레이터, 2026-08-09) 확인 완료** — 수락된 상태로 뒤로가기 → Confirm Location이 폼 대신 `/mission-status`로 튕기는 것, Searching 화면이 뒤에서 갈아치워지지 않는 것 둘 다 정상 동작 확인
- [x] **취소 규칙이 UI에만 있고 DB엔 없음 → 트리거로 이관 + 제품 방향 자체를 뒤집음** (점검 중 발견 · 2026-08-03, 처리 · 2026-08-05)
  - 발견 당시 진단: `MissionScreen.tsx`가 `status === 'requested'`일 때만 Cancel 버튼을 그려서 히어로 수락 후엔 취소가 막혀 보이지만, 이건 **화면에 안 그리는 것뿐**이었음. `0001_init.sql`의 "Requester or accepted hero can update a mission" 정책은 `with check` 없이 `using(auth.uid() = requester_id or auth.uid() = hero_id)`만 걸려 있고, 암묵적 `with check`도 같은 식을 NEW row에 재평가하는데 두 id 모두 안 변하므로 **모든 상태 전이가 통과**함 → 앱을 우회해 REST로 직접 치면 요청자가 `accepted`/`on_the_way`/`arrived`는 물론 **`completed` 미션까지 `cancelled`로 되돌릴 수 있었음**(히어로의 완료 기록·수입이 사후에 지워짐 — 원래 못 봤던 진짜 구멍)
  - **처음엔 "requested일 때만 취소 가능"으로 잠그려 했으나, 그 규칙 자체가 틀렸다고 결론남**: 이 앱은 낯선 사람이 집 안에 들어오는 서비스라 리스크가 요청자 쪽으로 크게 기울어 있는데, 선착순 수락이라 "누가 오는지"에 대한 거부권이 요청자한테 없었음. 게다가 이미 `/mission-status`의 히어로 카드 → `/reviews` 링크로 **평판을 보라고 만들어놓고 보고 나서 할 수 있는 게 없는** 모순 상태였음(별점 낮은 걸 확인해도 기다리는 수밖에). 그래서 **요청자는 완료 전까지 언제든 취소 가능**으로 방향을 바꿈
  - `0012_restrict_mission_cancel.sql`(신규): `missions`에 `BEFORE UPDATE` 트리거. ①`completed` 미션은 절대 취소 불가 ②`cancelled`를 쓸 수 있는 건 요청자뿐(히어로는 0011의 back-out으로 빠짐 — 미션 자체를 죽일 권한 없음). **RLS 정책으로는 표현 불가**한 규칙이라 트리거를 씀 — `using`은 OLD row만, `with check`는 NEW row만 보므로 "이전 상태 → 이후 상태" 비교를 정책 하나로 못 함. 트리거는 0007에서 겪은 permissive 정책 OR 우회 함정에서도 자유로움. `errcode`를 `check_violation`/`insufficient_privilege`로 명시 — 안 붙이면 PostgREST가 전부 500으로 내려서 앱엔 "Something went wrong"만 뜸(비번 최소길이 때 겪은 모호한 에러 문제와 동일)
  - `MissionScreen.tsx`: `accepted`/`on_the_way`/`arrived`에서 "Waiting for completion..."(비활성) 아래에 **"Cancel request · 요청 취소"(ghost) 추가**. 히어로가 이미 이동 중이라 바로 취소하지 않고 `BottomSheet` 확인 시트를 띄움(danger "Yes, cancel · 취소할게요" / ghost "Keep waiting · 기다릴게요"). `handleCancel`이 `fromStatus`를 인자로 받도록 일반화 — 탭하는 순간 히어로가 완료 처리하는 레이스를 막음
  - **검증 완료(2026-08-06, 사용자가 0012·0013 적용 후 REST로 공격 시나리오 재현)** — 임시 계정 2개로 앱을 거치지 않고 서버에 직접 요청: ①완료 미션을 요청자가 취소 시도 → **400 `A completed mission cannot be cancelled`**(errcode 23514) ②히어로가 `cancelled` 직접 쓰기 시도 → **403 `Only the requester can cancel a mission`**(errcode 42501) ③요청자가 `accepted` 상태에서 취소 → **204, 실제로 `cancelled`로 반영**(새로 허용한 동작) ④히어로 back-out(0011) → **204, `requested`+`hero_id` null**(회귀 없음). `0013` 기록도 정확히 1건 남음(`requester`/`accepted`), 실패한 ①②는 기록 안 남음(AFTER 트리거라 롤백됨). 인증된 유저로 `mission_cancellations` SELECT 시 `[]` — RLS 의도대로 차단. 테스트 데이터는 SQL Editor에서 삭제(`delete from missions where address = 'trigger test'`), 계정 2개(`trigger-test-req@`/`trigger-test-hero@`)는 남음
  - **후속 버그 — 히어로 화면이 취소에 반응하지 않음** (사용자가 실기기 테스트 중 발견 · 2026-08-06): 요청자가 취소해도 히어로의 `ActiveMissionScreen`은 그대로 "On my way" 버튼을 띄우고 있어서, **히어로가 사라진 미션으로 계속 이동할 수 있었음**. `useMission`의 Realtime 구독이 데이터는 정상적으로 밀어주는데 화면에 `cancelled` 분기가 아예 없었던 것(요청자 쪽엔 히어로 back-out 토스트가 있는데 반대 방향은 비어 있던 비대칭). 수정: 상태 배지 `Cancelled · 취소됨`(neutral), 주소 카드 자리에 "요청자가 미션을 취소했어요" 안내, 액션 버튼을 전부 "Back to Home" 하나로 대체, 히어로 자신의 Cancel 버튼도 숨김. **자동 리다이렉트 대신 종료 화면** — 이동 중일 수 있는 히어로가 무슨 일이 있었는지 읽을 기회를 줘야 함
  - (미수정 · 사소함) 취소된 미션을 히어로가 수락 시도하면 `useAcceptMission`의 `.eq('status','requested')` 가드로 정상 차단되지만, 에러 문구가 "다른 히어로가 이미 수락했어요"로 떠서 실제 사유(요청자 취소)와 다름. 클라이언트는 0건 업데이트만 보고 이유를 구분할 수 없어서 그대로 둠
  - **부수 발견**: 위 검증 중 `mission_cancellations`에 사용자 실기기 테스트 기록 4건이 이미 쌓여 있었는데, **`requested` 상태 미션 3건이 15초 안에 한꺼번에 자동 취소된 흔적**이었음(15분 만료가 Missions 탭 진입 시 일괄 처리). 한 번에 하나만 가능해야 할 요청이 동시에 3개 열려 있었다는 뜻 — 아래 중복요청 버그가 실제로 발생했던 데이터상 증거
- [x] **멈춘 미션 — 히어로 수락 후엔 만료가 아예 없음** (사용자 지적 · 2026-08-05) — `requested`는 15분(`SEARCH_TIMEOUT_MS`) 뒤 opportunistic 취소가 있지만, **히어로가 수락한 뒤로는 어떤 만료도 없어서** 히어로가 잠수하면 미션이 영구히 "진행 중"으로 남음. 위의 중복요청 가드가 이 상태를 활성으로 치므로 새 요청도 계속 막힘
  - **자동 취소는 안 하기로 함**: 상태별로 의미가 정반대임 — `accepted`에서 몇 시간 정지는 잠수가 유력하지만, **`arrived`에서 정지는 오히려 일을 다 끝내고 완료 버튼만 안 누른 것**일 가능성이 높음. 이걸 자동 취소하면 히어로 수입 기록이 날아가고 요청자는 리뷰 기회도 잃음. 게다가 현재 만료 방식은 "누가 그 미션 화면을 열어야 처리"되는 구조라, 정작 아무도 안 보는 잠수 미션엔 잘 안 걸림(제대로 하려면 서버 스케줄러 필요 = MVP 범위 밖)
  - **대신 알려주기만 함**(자동 처리 없음, 판단은 요청자가): `STALLED_MISSION_MS`(30분) + `isMissionStalled()` 추가. `createdAt`이 아니라 **`updatedAt` 기준** — `missions_set_updated_at` 트리거가 상태 변경마다 갱신하므로 "마지막 진전 이후 경과"로 정확히 읽힘(느리지만 진행 중인 미션은 안 걸림). `accepted`/`on_the_way`에서만 판정, **`arrived`는 제외**(위 이유로 "응답 없음"이 틀린 안내가 됨)
  - `MissionScreen.tsx`: 멈춘 상태면 ①안내 문구를 "히어로가 오고 있어요" → "히어로가 한동안 응답이 없어요"로 교체(그대로 두면 거짓말) ②"Waiting for completion..." 비활성 버튼 숨김(문제없다는 안심 신호라) ③취소 버튼을 ghost → secondary로 승격 ④확인 시트 문구도 "이미 오고 있어요" → "아직 올 수도 있어요"로
  - 검증: `npx tsc --noEmit` / `npx eslint` 통과. **알려진 한계**: `isStalled`는 렌더 시점의 `Date.now()`로 계산하는데 react-query의 structural sharing 때문에 데이터가 동일하면 리렌더가 안 됨 → 화면을 켜둔 채 30분 경계를 넘기면 즉시 안 뜨고 다음 진입 때 뜸. 타이머를 넣을 수도 있지만 30분을 응시하는 시나리오가 비현실적이라 단순함을 택함
- [ ] **취소 패널티 — 데이터 쌓인 뒤 rate limit으로 설계** (`0013` 적용·검증 완료 2026-08-06, 이제 기록이 쌓이는 중) — 양쪽 다 이탈 가능해졌으니 책임 장치가 필요하지만, **지금 설계하면 100% 감으로 찍는 것**이라 기록만 먼저 함(`0013_mission_cancellations_log.sql`: `mission_cancellations` 테이블 + `missions` AFTER UPDATE 트리거로 요청자 취소/히어로 back-out 자동 적재, RLS 정책 0개라 클라에서 접근 불가, `from_status`가 비용 신호 — `requested`에서 이탈은 공짜, `accepted` 이후 이탈은 누군가 이미 출발한 것)
  - **하지 말 것으로 결론난 것들**: ①요청자 취소에 패널티 → 방금 안전을 위해 준 거부권에 벌금 매기는 꼴 ②히어로 back-out에 강한 패널티 → back-out 대신 **잠수**(수락하고 안 옴)로 도망감, 명시적 이탈보다 훨씬 나쁨 ③`hero_rating` 깎기 → 리뷰 기반 값이라 "일을 잘하나"와 "약속을 지키나"가 섞여 둘 다 못 읽게 됨 ④취소 수수료 → CLAUDE.md에서 결제 자체가 범위 밖
  - **실제 막아야 할 것**: 한 사람이 반복 수락→백아웃하며 미션 풀을 헤집는 것(수락된 미션은 다른 히어로 목록에서 사라짐). 평판 문제가 아니라 DoS에 가까우니 "1시간에 N번 이탈 시 일정 시간 수락 불가" 같은 **기계적 rate limit**이 맞는 해법 — 실제 이탈 빈도 보고 N과 시간을 정할 것

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
- [x] **Mission Status 완료 화면에 "나중에 하기" 나가기 옵션 없음** (수정 완료 · 2026-07-18) — `completed && !reviewed` 상태에서 "Leave a Review" 버튼 하나뿐이고 헤더 back도 없어서, 지금 리뷰 쓰기 싫어도 화면을 벗어날 명시적인 방법이 없던 문제. 방금 History에서 나중에 다시 들어와 리뷰 남길 수 있게 만들어뒀으니(`hasReview` 기반) 자연스럽게 이어지는 수정.
  - `MissionScreen.tsx`: `isCompleted && !isReviewed`일 때 버튼 영역을 "Leave a Review"(primary, 기존과 동일하게 `/complete`로 이동) + "Not now · 나중에 할게요"(ghost, `router.replace('/')`로 홈 이동) 두 개로 구성
  - `isReviewed` 상태도 판단해서 같이 처리 — 볼 것도 없고 나가기만 하면 되는 상태인데 disabled "Reviewed ✓" 버튼 하나뿐이라 헤더 back도 없는 이 화면에서 나갈 방법이 전혀 없었음. "Reviewed ✓"(비활성) 아래에 "Back to Home" 버튼 추가해서 같은 패턴으로 대칭 처리
  - `isRequested`(Cancel)/`isCancelled`/진행 중 상태("Waiting for completion...")는 이번 범위 아니라 그대로 미변경
  - 검증(임시 테스트 계정 2개, expo web + Playwright, 실 REST): ① completed+미리뷰 미션 진입 → "Leave a Review"/"Not now" 두 버튼 다 노출 확인 → "Not now" 클릭 → 홈 이동 확인 ② Mission 탭 History에서 여전히 "Leave a Review" 카드로 남아있는지(리뷰 상태 안 바뀜) 확인 ③ 거기서 다시 들어가 실제로 별점 남기고 제출 → REST로 `reviews` row 생성 확인 ④ 같은 미션에 `/mission-status` 재진입 시 "Reviewed ✓" + "Back to Home" 두 버튼으로 바뀌는지, "Back to Home" 클릭 시 실제로 홈 이동하는지 확인 ⑤ 회귀: 별개 미션으로 "Leave a Review" 버튼이 기존처럼 `/complete`로 정상 이동하는지 확인. `npx tsc --noEmit` 통과, 13개 체크 전부 통과
- [x] **리뷰 목록 화면 신규 — 리뷰 상세 열람 + 히어로 신뢰 확인** (사용자가 실기기 테스트 중 발견 · 완료 · 2026-07-27) — 별점/개수(`RatingRow`)는 여러 화면에 뜨지만 **실제 리뷰 코멘트를 읽을 화면이 아예 없던** 문제. 두 갈래(①본인 받은/쓴 리뷰 열람 불가 ②`/mission-status`에서 배정된 히어로를 숫자만 보고 믿어야 함)를 화면/훅 하나 재사용으로 동시 해결(화면 2개 안 만듦).
  - 새 훅 `src/hooks/useReviews.ts`: `useReceivedReviews(heroId)`(리뷰 대상 = `hero_id` 매치)와 `useWrittenReviews(reviewerId)`(작성자 = `reviewer_id` 매치) 2개. `useMission`의 FK 임베드 패턴 그대로(`profiles!reviews_reviewer_id_fkey` / `profiles!reviews_hero_id_fkey`)로 상대방 이름까지 조인, 최신순 정렬. RLS 변경 불필요(이미 인증 유저 전체가 `reviews` SELECT 가능 — 공개 신뢰 신호)
  - 새 화면 `app/reviews.tsx` + `src/features/reviews/ReviewsScreen.tsx`: `heroId` 쿼리 파라미터 유무로 2가지 모드. **있으면**(히어로 지정) 그 히어로가 "받은 리뷰"만 읽기 전용(`/mission-status`에서 진입, 신뢰 확인용), **없으면**(본인 프로필) "받은 리뷰"+"쓴 리뷰" 두 섹션(`SectionHeader` 재사용). 각 항목은 `RatingRow`(별점)+코멘트(없으면 생략)+상대방 이름(`by`/`for`)+날짜. back 버튼·빈 상태("No reviews yet.\n아직 리뷰가 없어요.", 죄책감 문구 없음)·로딩/에러(공통 패턴) 포함
  - `MissionScreen.tsx`: `mission.heroId`가 있을 때만 히어로 정보 `MissionCard`를 **지역적으로 `Pressable`로 감싸** `/reviews?heroId=<heroId>`로 이동(공용 `MissionCard` API는 안 건드림 — `onPress` prop 추가 X). `requested`(히어로 미배정)면 안 감싸서 탭 불가
  - `ProfileScreen.tsx`: "Member since" 카드 아래 "My Reviews · 내 리뷰" 링크 카드 하나 추가(`router.push('/reviews')`, 파라미터 없이). Settings 행과 동일한 아이콘+라벨+chevron 스타일
  - 검증(expo web + Playwright, 실 Supabase 계정 2개로 양방향 리뷰 시딩): ① 프로필→My Reviews→받은 리뷰(H→R 코멘트)·쓴 리뷰(R→H 코멘트) 각각 정상 표시 ② `/reviews?heroId=H`는 H가 받은 리뷰만 뜨고 **다른 히어로 리뷰 안 섞임**(R이 받은 리뷰 미노출) 확인 ③ `/mission-status`(히어로 배정 미션)에서 히어로 카드 탭→`/reviews?heroId=H` 이동 확인 ④ 빈 상태(리뷰 응답 `[]` 가로채기) 정상 렌더 ⑤ `requested` 미션은 리뷰 버튼 없음 + 카드 탭해도 URL 불변(회귀) 확인. `npx tsc --noEmit` 통과. **주의**: `reviews`/`missions`에 DELETE RLS 정책이 없어(0009 avatars만 존재) 검증용 테스트 행은 REST로 삭제 불가 — 테스트 계정에 완료 미션/리뷰가 남음(기존 "service key 없어 남는 무해한 더미" 선례와 동일). 정리 원하면 아래 SQL을 Supabase에서 실행: `delete from missions where address = 'Seoul reviews test';`(리뷰는 `mission_id` on delete cascade로 함께 삭제됨)

- [x] **Profile 화면 별점/리뷰 개수 클릭 → 리뷰 목록으로 이동** (사용자가 실기기 테스트 중 발견 · 완료 · 2026-07-31) — 별점(`RatingRow`)이 눌러도 반응 없는 정적 텍스트였음. `Pressable`로 감싸 `/reviews`로 이동하도록 수정, 아래 그룹 카드의 기존 "My Reviews" 진입점과 중복되지만 의도된 것(둘 다 자연스러운 진입 경로)

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
- [x] ~~지도 표시~~ — PRODUCT.md "Future Vision > Live Map Tracking"으로 이동, MVP 범위 아님으로 확정(Mission Status 실시간 위치추적은 나중에, Nearby/Confirm Location은 애초에 실지도 계획 없음)
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
- [x] Inbox 화면에 pull-to-refresh 추가 (완료 · 2026-07-28) — `InboxScreen`에 `NearbyMissionsScreen`과 동일한 `RefreshControl`+`isRefetching`+`refetch` 패턴 적용. 빈 상태는 기존 공용 `ComingSoonScreen`(스크롤/새로고침 미지원 정적 컴포넌트) 대신 인라인 스크롤 뷰로 교체해 pull-to-refresh를 붙임 (`ComingSoonScreen` 자체는 그대로 유지, 다른 곳에서 쓰지 않음)
- [x] Mission History를 월별 섹션으로 그룹핑 (사용자 요청 · 완료 · 2026-07-31) — 리스트가 너무 길어 보인다는 피드백. 페이저(< 2026년 7월 >식 월 넘기기) 대신 한 스크롤 안에서 월별 헤더로만 구분(단순함 우선, 유저당 히스토리 아직 많지 않은 초기 단계라 페이저 도입 비용이 이득보다 큼 — 나중에 데이터 많아지면 재검토). `MissionsTabScreen.tsx`에 `groupByMonth` 유틸 추가, 기존 카드 렌더 로직은 그대로 재사용
- [x] **Mission History 최신 미션이 Active에 안 뜨는 버그** (사용자가 실기기 테스트 중 발견 · 완료 · 2026-07-31) — 진행 중인 미션이 있는데 요청자 Missions 탭 Active에 안 보이던 문제.
  - 원인: `missionHistory` 쿼리 캐시가 `useUpdateMissionStatus`에서만 invalidate되고, 미션 생성(`useCreateRequest`)·히어로 수락(`useAcceptMission`) 성공 시엔 한 번도 invalidate 안 됨. Expo Router 탭 화면은 언마운트 안 되고 유지되니, 생성/수락 직후 Missions 탭에 가도 그 미션이 없던 시절의 캐시를 계속 보여줌
  - 수정: `useCreateRequest.ts`/`useAcceptMission.ts` 둘 다 `onSuccess`에 `queryClient.invalidateQueries({ queryKey: ['missionHistory'] })` 추가 (기존 `useUpdateMissionStatus`와 동일 패턴)
- [x] **Mission Detail 화면 카테고리 아이콘 크기 과대** (사용자가 실기기 테스트 중 발견 · 완료 · 2026-07-31) — `MissionDetailScreen.tsx`만 유일하게 `MissionCard`를 안 거치고 직접 80×80 정사각 `Image`를 그려서, 앱 전체 48×48 원형 아이콘 스케일과 비교해 어색하게 커 보이던 문제. 56×56로 축소
- [x] Nearby Missions 화면에 pull-to-refresh 추가 (완료 · 2026-07-20) — ⚠️ TODO 설명이 stale했음: "기존 30초 폴링·Realtime 구독과 공존"이라 적혀 있었지만 이 화면은 **폴링도 Realtime도 없이 마운트 시 1회만 조회**함(그게 이 작업의 전제). pull-to-refresh가 유일한 수동 재조회 수단.
  - `NearbyMissionsScreen.tsx`: `useNearbyMissions()`에서 `isRefetching` 추가 구조분해, RN 기본 `RefreshControl` import(프로젝트 최초 도입, 새 라이브러리 없음). `refreshControl` JSX를 한 번 만들어(`refreshing={isRefetching}`, `onRefresh={refetch}`, `tintColor`/`colors`는 `COLORS.primary`) 리스트/빈 상태 두 ScrollView에 재사용
  - **빈 상태도 pull 가능하게**: 기존엔 빈 상태가 일반 `View`(스크롤 불가)라 당길 수 없었음 → `ScrollView`(`contentContainerStyle: { flexGrow: 1, justifyContent: 'center' }`로 박스는 그대로 중앙 유지)로 교체하고 동일 `refreshControl` 부착. 빈 상태일 때가 오히려 "다시 당겨 확인"하고 싶은 순간이라 반드시 포함
  - 로딩 스켈레톤/에러 상태는 미변경(스켈레톤 위 당김은 무의미, 에러는 Try Again으로 이미 재시도 가능). 거리 정렬·반경 필터(`rankByDistance`/`useMemo`)는 그대로 — refetch로 새 데이터 들어와도 자동 재계산
  - 검증(`npx tsc --noEmit` 통과 + expo web + Playwright, 실 Supabase 계정 2개): 히어로 화면 진입(baseline $63 표시) → 요청자 계정으로 새 미션 $71 REST 생성 → **당기기 전엔 $71 안 보이고, 재조회 후 리스트에 나타남**(스크린샷 확인). 거리 라벨 정상 렌더(정렬/필터 회귀 없음), 빈 상태 박스가 스크롤 컨테이너 안에 정상 렌더, 에러 상태 Try Again 정상 노출(회귀). 테스트 미션은 종료 후 REST DELETE로 정리. **참고**: RefreshControl의 당김 제스처 자체는 react-native-web에서 마우스로 재현이 안 되는 네이티브 인터랙션이라, 웹에선 "재조회 시 새 데이터가 뜨는가"(pull이 호출하는 `refetch`와 동일한 queryFn)를 화면 재진입으로 검증함. RefreshControl→refetch 연결은 2-prop 배선이라 tsc + 코드 리뷰로 확인
- [x] **"이동 중" 단계 dot 은은한 펄스 애니메이션** (완료 · 2026-08-02) — `StatusTimeline.tsx`에 `pulseCurrentStep` prop 추가, opacity 1↔0.4 부드러운 루프(RN `Animated`, `useNativeDriver: true`). **삽질 기록**: 처음엔 `status === 'on_the_way'` 조건으로 짰는데 실제로 안 깜빡였음 — `on_the_way`가 스키마/타입엔 있어도 실제로 세팅하는 코드가 어디에도 없는 죽은 상태였기 때문(히어로 플로우가 `accepted`→`arrived`로 바로 점프). 아래 "이동 중 상태 실제 도입" 작업으로 근본 해결
- [x] **"이동 중"(`on_the_way`) 상태 실제 도입 + 히어로 수락 취소 기능** (사용자 요청 · 완료 · 2026-08-02)
  - `ActiveMissionScreen.tsx`(히어로): 기존 2단계(`I've Arrived`/`Complete Mission`) 앞에 **"On my way · 이동중이에요"** 버튼 추가 → `accepted → on_the_way → arrived → completed` 3단계 플로우로. 각 전환은 기존 `fromStatus` 가드 패턴 재사용. DB `missions.status` CHECK 제약(`0001_init.sql`)엔 `on_the_way`가 원래부터 있어서 마이그레이션 불필요
  - `MissionScreen.tsx`(요청자): pulse 조건을 `accepted`/`on_the_way`/`arrived` 세 상태 전부로 확장 — 어느 단계든 "지금 살아있게 진행 중"임을 계속 신호. completed 실시간 전환 감지 시 0.9초 대기 후 `/mission-complete`로 이동(그 사이 타임라인 마지막 dot이 노란색으로 채워지는 게 보이도록), 대기 중엔 Leave a Review/Not now 버튼 안 보이게 처리
  - **히어로 수락 취소(신규 기능)**: 한 번 수락하면 빠져나갈 방법이 없어서 사고/변심 시 미션이 영구히 멈추는 문제 → `ActiveMissionScreen.tsx`에 "Cancel · 취소할게요" 버튼(ghost) 추가, `useCancelAcceptedMission.ts` 신규 훅으로 `status='requested', hero_id=null`로 되돌려 다시 Nearby 목록에 노출. 요청자 쪽엔 "Your hero had to step away · 새 히어로를 찾고 있어요" Toast로 안심시키는 문구(죄책감/비난 없는 중립 톤, DESIGN.md 톤 가이드 참고)
  - **마이그레이션 필요**: `0011_hero_cancel_accepted_mission.sql` 신규 — 기존 UPDATE 정책 2개 다 이 전환(수락된 미션 → hero_id null + status='requested')을 못 커버해서(자세한 이유는 마이그레이션 파일 주석 참고) 새 permissive 정책 추가. **직접 적용 안 함, Supabase SQL Editor에서 실행 필요**
  - 검증: `npx tsc --noEmit` 통과, 코드 리뷰로 브리핑 대조. RLS 정책은 마이그레이션 실행 후 실계정으로 실제 취소 플로우까지 REST 재현 검증 권장(아직 미검증 — 마이그레이션 적용 대기 중)

## 🟡 P2 · 온보딩 & 앱 진입

DESIGN.md 화면 순서엔 Splash → Onboarding → Home 이 있으나 현재 없음(과거 커밋에서 reset됨).

- [x] Splash 화면 — `expo-splash-screen` 설치 후 `_layout.tsx` 모듈 최상단에서 `SplashScreen.preventAutoHideAsync()` 호출, 폰트 로딩 + 온보딩 플래그 조회(`useOnboardingStore`)가 **둘 다** 끝나면 `hideAsync()`. 기존 `return null` 자리를 `ready` 게이트로 교체. app.json `expo-splash-screen` 플러그인에 `app-icon.png`(정사각에 가까운 586x619) + `resizeMode: contain` + 배경 `#FFFFFF`(DESIGN background 토큰). ⚠️ **네이티브 전용 동작**이라 Expo Web에선 스플래시 이미지 자체가 렌더되지 않음(웹에선 `hideAsync`가 사실상 no-op, 로직 흐름만 검증됨) — 실제 스플래시 표시는 EAS/네이티브 빌드에서 재확인 필요
- [x] Onboarding 화면 — `app/onboarding.tsx` + `src/features/onboarding/OnboardingScreen.tsx`(3장 슬라이드: bush-cockroach-cat / hero-cat / proud-cat + 영/한 두 줄 카피). 가로 `ScrollView pagingEnabled` + 하단 점 인디케이터(활성 primary, 새 캐러셀 라이브러리 없음). 우상단 Skip + 마지막 장 Get Started. 둘 다 AsyncStorage `hasOnboarded='true'` 저장 후 `/sign-in`으로 이동. **주의: `onMomentumScrollEnd`는 react-native-web에서 안 켜져 Get Started/점이 안 바뀌는 버그가 있어 `onScroll`로 교체함(웹/네이티브 공통 동작).** 온보딩 플래그는 `useOnboardingStore`(Zustand)로 메모리 반영 — 안 그러면 완료 직후 stale 플래그 때문에 `/onboarding`으로 되돌아가는 바운스 버그 발생하므로 store로 해결
  - AuthGate 게이트 로직: `!hasOnboarded && !session`이면 (온보딩 라우트가 아닌 한) `/onboarding`으로 리다이렉트(딥링크 우회 커버). 온보딩 완료했거나 세션 있는 유저가 `/onboarding`에 오면 세션 여부에 따라 `/` 또는 `/sign-in`으로 되돌림. 그 외는 기존 로직 그대로
  - 검증(Expo Web + Playwright, 실제 동작): ①localStorage 비운 첫 접속 → `/onboarding` 3장 표시 ②마지막 장 스크롤 시 Get Started 노출 → 탭 시 `/sign-in`, `hasOnboarded=true` 저장 ③온보딩 후 새로고침 → 온보딩 안 뜨고 바로 sign-in ④Skip → 즉시 sign-in + 플래그 저장 ⑤**회귀**: 실제 회원가입으로 세션 생성 후 `hasOnboarded` 플래그를 지우고 새로고침해도 온보딩 안 뜨고 `/`(홈) 유지, 로그인 상태로 `/onboarding` 딥링크해도 `/`로 리다이렉트 — 온보딩 로직이 로그인 유저 플로우를 안 건드림 확인. `npx tsc --noEmit` 통과
  - (테스트용 더미 계정 `onboard-test-*@example.com` 1개가 원격 auth에 남음 — service key 없어 삭제 불가, 무해한 더미)
- [x] app.json 앱 아이콘 / 스플래시 설정 — `expo.icon`에 `./assets/logo/app-icon.png` 연결(ios/android 공용 하나, 과설계 안 함) + 위 스플래시 플러그인. `npx expo config`로 icon/splash 경로 정상 resolve 확인. ⚠️ **아이콘 실제 렌더링은 Web에서 검증 불가(네이티브 전용)**, 게다가 `app-icon.png`가 정사각형이 아님(586x619) — Expo는 1024x1024 정사각 아이콘 권장이라 네이티브 빌드 시 왜곡/패딩 경고 가능성 있음. 정식 아이콘 규격(1024x1024 square) 준비 후 EAS 빌드에서 재확인 필요
- [x] **`expo-image-picker` 네이티브 권한 설정 누락 — 실기기에서 프로필 사진 수정 안 됨** (사용자가 실기기 테스트 중 발견 · 수정 완료 · 2026-07-19) — Edit Profile의 사진 선택 코드(`EditProfileScreen.tsx`)는 정상인데 `app.json`에 `expo-image-picker`의 iOS 권한 문구(`NSPhotoLibraryUsageDescription`)가 아예 없었음. Expo Go에선 기본값으로 어물쩍 넘어가지만 실기기 dev build/TestFlight에선 이게 없으면 사진 선택기가 조용히 실패/크래시할 수 있음 — 이번 세션 내내 Expo Web으로만 검증해서 놓쳤던, 처음 발견된 네이티브 전용 버그.
  - `app.json` plugins에 `expo-location`과 동일한 패턴으로 `expo-image-picker` 추가: `photosPermission`(iOS `NSPhotoLibraryUsageDescription`) 커스텀 문구 설정. 앱이 `launchImageLibraryAsync`만 쓰고(카메라 촬영 기능 없음, `EditProfileScreen.tsx` 확인) 카메라/마이크는 안 쓰므로 `cameraPermission: false` / `microphonePermission: false`도 같이 설정해 불필요한 권한 요청 최소화(기본값대로 두면 마이크는 `RECORD_AUDIO`가 자동으로 Android 매니페스트에 추가됨 — 이 프로젝트엔 불필요)
  - 다른 plugin 설정/코드는 미변경(순수 설정 누락 수정)
  - 검증: `npx expo config --type public`으로 plugins 배열에 반영 확인, `npx tsc --noEmit` 통과. **네이티브 파일까지 실제로 확인**하려고 `npx expo prebuild --no-install --platform all`을 임시로 돌려서 `ios/NotMe/Info.plist`에 `NSPhotoLibraryUsageDescription`(커스텀 문구)이 실제로 생성되고 `NSCameraUsageDescription`/`NSMicrophoneUsageDescription`은 없는 것 확인, `android/app/src/main/AndroidManifest.xml`에도 `CAMERA`/`RECORD_AUDIO`가 `tools:node="remove"`로 명시적으로 막혀 있는 것 확인 — 둘 다 기대대로 정확히 반영됨. **managed workflow 유지**: prebuild가 생성한 `ios/`/`android/` 폴더는 확인 후 삭제, `app.json`/`package.json`에 prebuild가 자동으로 끼워넣은 `bundleIdentifier`/`package`/`android.permissions`/scripts 변경분도 git diff로 확인해서 되돌리고 plugins 추가분만 남김(`ios`/`android`는 `.gitignore`에도 이미 등록돼 있어 커밋 대상 아님)
  - ⚠️ **이건 설정이 문서(Info.plist/AndroidManifest)에 정상 반영되는 것까지만 확인한 것 — 실기기에서 사진 선택기가 실제로 뜨는지는 다음 EAS dev build/TestFlight에서 직접 확인 필요.** Expo Web으로는 이 버그 자체가 재현되지 않아서(Expo Go/웹은 브라우저 파일 선택기를 씀) 이번 세션에서 실기기 검증은 불가능했음

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
- [x] Profile 설정 항목(Account / Notifications / Help) 네비게이션 연결 (Account 완료 · 2026-07-22) — Account만 Edit Profile 화면으로 연결, Notifications/Help는 범위 밖이라 그대로 무동작 유지. `supabase/migrations/0009_avatars_bucket.sql`(avatars 버킷 + RLS)은 파일만 작성 — **사용자가 SQL Editor에서 직접 실행해야 아바타 업로드가 동작함**
  - **Account → Edit Profile 화면 신규**: 이름 / 휴대전화 / 아바타 사진 수정. `profiles.avatar_url` 컬럼은 이미 있고 `useProfile`도 이미 읽어오는 중이라 스키마 변경 불필요, UI + 업로드 플로우만 없음
  - ⚠️ **Supabase Storage 실제로는 아직 하나도 안 붙어있음** (CLAUDE.md 스택엔 있지만 지금까지 만든 기능 중 Storage 쓰는 곳 없음) — `avatars` 버킷 신규 생성 + RLS 정책(본인 파일만 write, 공개 read) 필요, 이번 작업이 Storage 최초 연동임을 감안하고 범위 잡을 것
  - 이미지 선택은 `expo-image-picker`(신규 설치 필요), 정사각 크롭(`aspect: [1,1]`)까지만, 필터/편집 등 추가 기능 없음(오버엔지니어링 방지)
  - 업로드 성공 시 `profiles.avatar_url` 갱신 + `useProfile` 캐시 무효화, 실패 시 DESIGN.md 톤으로 에러 메시지
  - Notifications/Help는 이번 범위 아님 — CLAUDE.md "만들지 않음"의 푸시알림과 겹치니 Notifications는 별도 판단 필요(지금은 손대지 말 것)
- [x] **avatars 버킷 서버측 제한 없음** (완료 · 2026-07-25 · 보안) — `0010_avatars_bucket_hardening.sql` 신규 작성(0009는 수정 안 함, append-only), 사용자가 SQL Editor에서 직접 실행. 버킷에 `file_size_limit = 5MB` + `allowed_mime_types = [image/jpeg, image/png, image/webp]` 추가, UPDATE 정책을 drop 후 `with check`까지 포함해 재생성(경로 이동 방지). 앱 코드 변경 없음. 검증(실 Supabase REST): ①5MB+ 업로드 → **413 차단**, ②text/plain·application/pdf → **415 차단**, ③정상 jpeg/png 업로드 → **200 정상(회귀 OK)**, ④본인 폴더 PUT 업데이트 → 200, 타 유저가 A 폴더로 PUT → **403 RLS 차단**
- [x] 히어로 누적 수익(Total Earned) 표시 (완료 · 2026-07-22) — `ProfileScreen`에 히어로로 완료한 미션(`role==='hero' && status==='completed'`)의 `rewardAmount` 합계 통계 카드 추가. Member since 카드 위에 전체 폭 단독 Card로 배치. 새 훅/쿼리/DB 변경 없이 기존 `useMissionHistory` 배열 filter+reduce. 부동소수점 드리프트는 `formatEarned`(toFixed(2) 후 `.00`만 잘라냄)로 처리. **정산/출금 문구·버튼 없음**(CLAUDE.md "Payments" 미구현 유지). 0원은 담백하게 "$0". 검증(실 Supabase, 계정 3개): 히어로 완료 $10.50/$20/$0.25 → 합계 **$30.75** 정확, accepted/cancelled/requested 및 role=user 완료 미션은 합계 제외 확인, 빈 계정 "$0", `10.1+10.2`→`$20.30` 드리프트 없음, `tsc` 통과
- [x] Profile 화면 재구성: 설정 분리 + 수익 상세 내역 (실기기 피드백 · 완료 · 2026-07-27) — ProfileScreen이 아바타/통계/Total Earned/가입일/My Reviews/Settings 리스트/Sign Out까지 한 화면에 쌓여 스크롤이 길고 Settings가 하단에 묻히던 문제 + Total Earned가 합계만 보여주고 내역이 없던 문제. **Settings 분리**: `app/settings.tsx` + `SettingsScreen`으로 SETTINGS_ITEMS(Account/Notifications/Help) + Sign Out + (dev)Replay Onboarding 이동, ReviewsScreen식 뒤로가기 헤더. ProfileScreen엔 My Reviews와 동일 스타일 "Settings · 설정" 진입 카드만 남김. **수익 내역**: `app/earnings.tsx` + `EarningsScreen`, `useMissionHistory`에서 hero+completed만 필터·`updatedAt` 최신순 정렬, 항목별 카테고리 아이콘+완료일+금액, 상단에 합계 카드, 빈 상태 "No earnings yet.\n아직 수익이 없어요.". ProfileScreen의 Total Earned Card를 Pressable+chevron으로 감싸 `/earnings` 이동. `formatEarned`는 `src/utils/formatEarned.ts`로 추출해 공유(중복 제거). 새 훅/DB/라이브러리 없음. 검증: `tsc` 통과 + 실 Supabase(계정 3개) — hero 완료 $10.50/$0.25/$20이 updatedAt 최신순(m1 bump 후 [10.50,0.25,20])으로 정렬, 합계 **$30.75**, accepted/cancelled/requested·role=user 완료는 내역 제외, 빈 계정은 empty state/"$0" 확인. 설정/Sign Out 네비게이션은 기존 `/reviews`·`/edit-profile`과 동일 라우팅 패턴이라 구조적 동일성으로 확인
  - 후속 레이아웃 보완(2026-07-27): Total Earned / Member since / My Reviews / Settings 4개가 개별 Card로 각각 32px씩 떨어져 어색하던 것을, 리팩터 전 Settings 리스트가 쓰던 패턴(하나의 Card 안 `gap-4` + 첫 행 제외 `border-t border-surface pt-4` 구분선)으로 통합. 탭 가능 행(Total Earned/My Reviews/Settings)은 Pressable+chevron 유지, Member since는 Pressable 없이 텍스트만. onPress/accessibilityLabel/라우팅 로직 무변경(순수 레이아웃). Header/Stats row와 통합 카드 사이 32px 섹션 간격은 유지. `tsc` 통과. (border-t 구분선 패턴은 리팩터 전 동일 파일에서 이미 렌더 검증됐던 idiom)
  - 후속 그룹 분리(2026-07-27): "내가 한 일"(통계)과 "내 정보·설정"이 한 카드에 섞여 위계가 밋밋하던 것을 두 그룹으로 분리. **통계 그룹**은 `flex-row gap-3` 3칸으로 Requested/Helped **+ Total Earned**(각 `flex:1`, Total Earned는 Pressable로 `/earnings` 이동 유지). 3칸이라 폭이 빠듯해 chevron은 빼고 Requested/Helped와 동일한 담백한 숫자+라벨 스타일로 통일(탭 가능 강조 불필요). **정보/설정 그룹**은 통합 카드에서 Total Earned 행 제거하고 Member since(첫 행, 구분선 없음)→My Reviews→Settings 3행만 유지. 순수 레이아웃 재배치, `formatEarned`/라우팅 무변경, `tsc` 통과
  - 최종 레이아웃(2026-07-27): 위 3칸 통계 row가 실기기에서 깨짐(좁은 칸에서 "Total Earned · 누적 수익" 라벨이 글자 단위 줄바꿈, "$0"도 "$"/"0" 두 줄로 분리) → 3칸 폐기. **Requested/Helped는 원래 2칸 복원**, **Total Earned는 그 아래 독립 전체 폭 Card**로 분리(Pressable→`/earnings`, `flex-row items-center gap-3` 왼쪽 금액+라벨 / 오른쪽 chevron-right). Member since/My Reviews/Settings 카드는 그대로. **이번엔 실제 렌더 검증함**: expo web + Playwright로 테스트 히어로 계정(완료 미션 $120.50+$20=합계 **$140.50**) 로그인 → Profile 스크린샷 확인, 긴 금액 `$140.50`이 한 줄에 안 깨지고 정상 렌더, 2칸 통계 row/독립 Total Earned 카드/하단 3행 카드 위계 정상. 탭 회귀: Total Earned→`/earnings`, My Reviews→`/reviews`, Settings→`/settings` 전부 정상 이동 확인, Earnings 화면 내역($120.50/$20 행 + 합계 $140.50)도 스크린샷 확인. `tsc` 통과
- [x] **MissionCard 아바타가 원형이 아니라 정사각형으로 나옴** (실기기 피드백 · 완료 · 2026-07-28) — 히어로 프로필 사진 업로드 후 `/mission-status`에서 사진이 정사각형으로 표시되던 문제. `MissionCard.tsx`의 아바타 `Image`에 `borderRadius`가 아예 없었음(`ProfileScreen`의 아바타는 `borderRadius: 44`로 이미 원형 처리 중이었는데 이 공용 컴포넌트만 누락). `borderRadius: 24`(48x48 기준 정원) 추가. `MissionCard`는 5곳에서 공유(`MissionScreen` 실사진 1곳 + `MissionsTabScreen`/`NearbyMissionsScreen`/`ActiveMissionScreen`의 카테고리 아이콘 4곳) — 카테고리 아이콘 4곳도 원형 클리핑 영향받지만 투명배경 일러스트라 문제없음. 검증: `tsc` 통과, expo web + Playwright 스크린샷 — 실제 URL 아바타(`https://i.pravatar.cc/300`) 설정한 히어로 계정으로 `/mission-status` 진입 → 사진이 원형으로 정상 렌더 확인, Nearby Missions 카테고리 아이콘 회귀 없음(원형 배지 안에서 자연스럽게 렌더) 확인
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
- [x] Mission Status 아바타가 히어로가 아니라 카테고리 아이콘으로 표시되던 문제 수정 — `heroAvatarUrl` 추가, 없으면 제네릭 프로필 아이콘 폴백
- [x] Mission Status 완료 화면에 나가기 옵션 추가 — "Leave a Review"/"Not now"/"Reviewed ✓ + Back to Home"
- [x] Complete 화면(`/complete`)에도 "Not now · 나중에 할게요" 버튼 추가 — 리뷰 미루고 나갈 수 있게, History에서 나중에 재진입 가능
- [x] **chevron/아이콘 색상·스타일이 화면마다 다름** (디자인 리뷰에서 발견 · 2026-07-14) — 재점검 결과 실제 코드 버그는 아니었음, 규칙만 정하고 문서화로 마무리:
  - chevron 색: `MainMissionCard`/`BecomeHeroSection`(강조 CTA 카드) = `COLORS.primary`, `ProfileScreen` 설정 리스트(평범한 리스트) = 회색(`textDisabled`) — 코드 3곳 전수 확인 결과 이미 "용도별 구분" 규칙을 일관되게 따르고 있었음. **CTA=옐로우 / 리스트=회색 규칙으로 의도된 것 확정**, 코드 변경 없음
  - 손그림 PNG vs Feather 아웃라인 "혼재"도 버그 아님 — 실제로는 의도된 2단 체계: Feather(`@expo/vector-icons`) = 기능적 UI 아이콘(뒤로가기/닫기/검색/설정 리스트/빈 상태, 12곳 전수 확인 일관됨), 손그림 PNG = 브랜드·카테고리 일러스트(카테고리 아이콘, Become a Hero 등). `CategoryTile`의 Feather `more-horizontal`도 "아이콘 없는 카테고리" 폴백으로 의도된 것
  - 다만 `DESIGN.md` 「Icons」 섹션이 Lucide/outline만 명시하고 이 2단 체계를 문서화하지 않아 "기준 불명확"으로 보였던 것 — 사용자 승인 받아 「Icons」 섹션에 "기능적 UI 아이콘에만 적용, 카테고리/브랜드 아이콘은 Illustrations 섹션 참고" 2줄 추가해 명문화. PRODUCT.md는 건드리지 않음
- [x] **Inbox 탭에 상단 헤더가 없음** (디자인 리뷰에서 발견 · 2026-07-14) — Home(로고+벨) / Mission("My Missions") / Profile(아바타+이름)은 화면 상단에 타이틀이 있는데, Inbox는 헤더가 없던 문제. 바로 위 "Coming Soon → 활동 피드" 작업과 함께 해결: `InboxScreen`에 다른 탭과 통일된 두 줄 헤더("Inbox / 받은편지함", `MissionsTabScreen`과 동일한 `text-lg font-sans-semibold` + 서브타이틀) 추가. 이벤트 0개일 때 뜨는 `ComingSoonScreen`도 자체적으로 "Inbox / 받은편지함" 타이틀을 표시해 빈 상태에서도 정체성 유지. Playwright로 헤더 렌더 육안 확인 완료

## 🟢 P3 · 마감 완성도 (기타)

- [ ] **proud cat 무늬 수정** — `assets/characters/proud-cat.png`(온보딩 3번째 슬라이드에서 사용) 무늬 디자인 손보기

## 🟢 P3 · About NotMe (구현 완료 · 2026-08-04, `about-notme/others.PNG`·`first.PNG` 목업 기준으로 재설계)
- [x] 실제 사진 자산 이전: `about-notme/upscale-cat.png`, `about-notme/Upscale-cockroach.png` → `notme-app/assets/about/real-cat.png`(1122x1402), `real-cockroach.png`(1086x1448)로 복사. **크롭 안 함** — 처음에 목업 구도에 맞춰 타이트하게 크롭했다가 "잘리고 확대되어 보인다"는 피드백으로 되돌림, 원본 사진 그대로 `resizeMode: 'contain'` + 고정 폭(240)으로 크기만 축소해서 표시. 원본 iPhone 사진은 `about-notme/`에 소스 보관용으로 그대로 둠
- [x] Profile 설정 리스트에 "About NotMe" 항목 추가(Account/Notifications/Help 옆) — `SettingsScreen.tsx`의 `SETTINGS_ITEMS`/`SETTINGS_ROUTES`에 추가, 탭하면 `/about`으로 이동
- [x] **언어 선택 화면** (`app/about/index.tsx` → `LanguageSelectScreen`) — `first.PNG` 목업대로 재설계: 큰 로고+태그라인, 캐릭터, 이중언어 헤드라인("Every great app starts with a story." + 한글), 언어 선택 박스 2개. 국기 이모지는 특정 국가로 언어를 대표하는 게 편향돼 보일 수 있어(🇺🇸=영어 논쟁 등) 아이콘 없이 텍스트만 사용하기로 결정. 고른 언어는 `lang` 라우트 파라미터로 다음 화면에 전달(기존 missionId/heroId 패턴과 동일, 새 store 안 만듦)
- [x] **스토리 화면을 에디토리얼 스타일로 재구성** (`app/about/story.tsx` → `AboutStoryScreen`) — 3단계 변천사: ① `others.PNG` 목업대로 4단계 탭(step 배지+진행점+Continue) → "개인 이야기인데 튜토리얼처럼 느껴진다"는 피드백으로 폐기 ② 단일 스크롤 + 짧은 fragment 문장 나열 → "왜 다 한 페이지에" 재질문에 카드/타임라인/에디토리얼 3안을 아티팩트로 비교 목업해서 제시 ③ **에디토리얼(3안)로 확정** — 문장을 잘게 쪼개지 않고 자연스러운 좌측정렬 문단으로 이어가다가, "바퀴벌레가 나타났다" 문단 뒤에 실제 바퀴벌레 사진, "고양이가 준비돼 있었다" 문단 뒤에 실제 고양이 사진을 본문 흐름 속에 배치. 💭 인용구로 감정 브레이크를 준 다음, "That day, I had one thought:" + 크고 굵은 pull-quote("There should be an app for this.")로 이어지고, 짧은 노란 밑줄 구분선 → "That's how **NotMe** was born"(로고는 이미지 대신 스타일링된 텍스트: Not=검정, Me=primary) → 마지막 캐릭터 → "Start Using NotMe" 버튼(`router.replace('/')`).
  - 이후 다듬은 것: 사진이 실기기에서 `aspectRatio` 계산이 안 먹혀서 화면 꽉 차게 나오던 버그 → 폭/높이를 고정 숫자로 직접 지정(190x253, 190x237)해서 해결. 제목 위 중복 로고 텍스트 제거, 영어 버전에선 한글 부제 숨김. "전체적으로 안 어울린다"는 피드백으로 진단해보니 원인은 사진 크기가 아니라 **가운데정렬/왼쪽정렬이 요소마다 섞여있던 것** — 전체를 왼쪽 정렬로 통일. 마지막 캐릭터는 celebrate-cat → Hero Cat(중앙정렬 예외)로 한 번 바꿨다가, "일러스트로 끝나면 사진 두 장으로 쌓아온 다큐멘터리 톤이 마지막에 깨진다"는 판단으로 **세 번째 실제 고양이 사진(`real-cat-box.jpg`, 상자에서 고개 내민 사진)으로 교체** — 기존 `Photo` 컴포넌트 그대로 재사용해서 왼쪽 정렬 예외 없이 끝까지 일관됨. 상단 Proud Cat도 100→72로 축소해서 타이틀이 시각적 1순위가 되도록 조정
  - 추가 요청 2건: ① 마지막 사진 캡션을 "우리 집 진짜 히어로예요"(그냥 귀여운 사진)에서 **"이 앱에 나오는 캐릭터들은 전부 얘한테서 영감을 받았어요"로 변경** — 앱 전체에 왜 이 고양이 그림체가 계속 나왔는지에 대한 실제 답이 되도록 마무리 포인트를 강화 ② p1/p2 문단을 **마침표(문장) 단위로 쪼개서 한 문장 = 한 문단**으로 재배치 — 예전에 폐기했던 "구(句) 단위로 끊기"(어느 날, / 집에)와는 다르게 완결된 문장 단위라 에세이/매거진에서 흔한 기법, 톤 안 깨짐
  - 추가 다듬기 5건(2026-08-04): ① "That's how NotMe was born" 문장을 자체 문단으로 한 줄 더 내림(bornDetail 분리) ② 한글 마무리 문구 "그보다 용감했던 고양이" → **"나보다 용감했던 고양이"**로 정정(주어 오류 수정) ③ 마지막 캡션에서 "이 앱에 나오는" 중복 표현 제거 ④ 제목 아래 다국어 부제(titleSub) **완전 제거** — 영/한 둘 다 이제 제목 한 줄만 표시 ⑤ 종료 버튼 라벨을 "Start Using NotMe"/"NotMe 시작하기"에서 **"Continue to NotMe"/"NotMe로 돌아가기"로 변경** — 이 화면은 Settings에서 들어오는 기존 유저 플로우라 "시작하기"가 온보딩처럼 느껴진다는 지적으로 수정
- [x] 사진은 원본 그대로(크롭 없음) `resizeMode: 'contain'` + 고정 폭(170)으로 크기만 축소, 캡션은 매거진 사진 캡션처럼 작고 이탤릭. 애니메이션 없음, `Button` 컴포넌트 재사용
- 검증: `npx tsc --noEmit` / `npx eslint .` 통과, `expo start --web`으로 `/about/story?lang=en`, `?lang=kr` 200 응답 + Metro 번들 에러 없음 확인. **다만 이번 세션엔 브라우저 자동화 도구가 없어서 실제 화면을 클릭/스크롤해서 눈으로 확인은 못 했음 — 특히 사진 캡션 간격과 하이라이터 인용구 박스는 실기기에서 꼭 확인 필요**

## 🟢 P3 · 이스터에그 (신규, `DESIGN.md`의 "Easter Egg: Fake Pest Control Ad" 참고)
- [ ] `CompleteScreen`(`/complete`)의 "Mission Complete!" 메시지와 리뷰 폼 사이에 가짜 방역업체 광고 카드 하나 삽입. 회색 배경 + "Ad" 라벨 + 기존 카드 토큰(rounded-card/soft shadow), 탭하면 실제 링크 없이 토스트("농담이에요, 광고 없어요 🐱")만. 딱 이 화면 하나에만, 로테이션 없음. 히어로 쪽 화면엔 넣지 않음
- [ ] 업체명 미정 — 문구("Need a permanent solution? / 404 Bugs / The bug you're looking for cannot be found.")는 확정, 업체명만 나중에 채워넣기

## 🟢 P3 · 미션 완료 축하 애니메이션 (완료 · 2026-08-01, `DESIGN.md`의 "Exception: Mission Complete Celebration" 참고)
- [x] ~~`MissionScreen` 위에 팝업 배너로 표시~~ → 히어로 쪽 `/hero/reward`(`RewardEarnedScreen`)와 대칭되는 **전용 화면**으로 재설계(사용자 요청 · 2026-08-01): `status`가 `completed`로 **실시간 전환되는 순간** `/mission-complete`(신규 `MissionCompleteScreen.tsx`)로 이동. scale-in "pop"(0.85→1.05→1.0) + fade는 새 화면 안에서 그대로 재현(RN `Animated`만 사용). 기존 `CelebrationBanner.tsx`는 로직 이식 후 삭제
- [x] 문구: "Mission Complete! Your hero saved the day" / "미션 완료! 히어로가 문제를 해결했어요" + 캐릭터(`assets/characters/celebrate-cat.png`, 점프 축하 포즈), 그 아래 **Leave a Review / Not now** 버튼 배치(`/complete`로 이동 · 홈으로 이동)
- [x] **한 번만 발동하는 조건**: `prevStatusRef`로 이전 status 추적, "이전 값이 존재하고(undefined 아님) + completed가 아니었다가 + 지금 completed" 조건일 때만 새 화면으로 이동 — 이미 완료된 미션에 직접 재진입(예: History에서)했을 땐 이 리다이렉트가 안 타므로, `MissionScreen`의 기존 인라인 "Leave a Review"/"Not now" 버튼(`isCompleted && !isReviewed` 분기)은 그대로 유지 — 극적 연출 없이 바로 처리 가능해야 하는 케이스
- [ ] DESIGN.md Animations 섹션의 "Avoid: Bounce/Overly playful" 규칙은 이 한 화면·한 순간만 예외, 나머지 UI는 기존 규칙(Fade/Scale/Slide) 그대로 유지 (문서화만 남음, 코드는 완료)

## 🟡 P2 · 관리자 대시보드 — **`notme-admin` 독립 레포로 이전 (2026-08-11)**

~~아래 계획(Expo Router 내 웹 라우트, 새 앱 안 만듦)은 폐기됨~~ — 실제로는 별도 레포 `notme-admin`(`/Users/sujung/Desktop/NotMe/notme-admin`, `github.com/elodiekim/not-me-admin`)으로 이미 방향이 잡혀 있었음. 그 레포에 `CLAUDE.md`/`PRODUCT.md`/`DESIGN.md`/`ADMIN.md`까지 문서가 준비돼 있어 이쪽이 최신 계획. 상세 스코프·화면 구성은 그 레포의 문서 참고, 여기서는 더 추적 안 함. `profiles.is_admin` + RLS는 어느 쪽이든 `notme-app`의 DB에 마이그레이션이 필요해서 착수 시 `notme-app`/`notme-admin` 양쪽에 걸치는 작업이 될 것

## ⚪ 품질 / 인프라 (선택)

- [x] ESLint / Prettier 설정
  - ESLint: `npx expo lint`로 Expo 공식 셋업 사용 — `eslint@9` + `eslint-config-expo@10`(flat config, `eslint.config.js`) 자동 설치. 직접 config 안 짜고 공식 경로 그대로
  - Prettier: `prettier@3.9` + `eslint-config-prettier@10`(스타일 규칙 충돌 방지용) 설치. `.prettierrc`로 기존 코드 스타일 유지 — `singleQuote: true`, `semi: true`, `tabWidth: 2`, `printWidth: 100`, `trailingComma: 'all'`. `eslint.config.js`에 `eslint-config-prettier/flat`을 맨 뒤에 추가해 Prettier와 겹치는 스타일 규칙 off. `.prettierignore`(dist/.expo/native/lockfile/assets 제외)
  - `package.json` 스크립트: `lint: "eslint ."`, `format: "prettier --write ."`, `format:check: "prettier --check ."`. `.gitignore`에 `.eslintcache`/`.prettiercache` 추가
  - 전체 `npm run format` 1회 실행(예상대로 대부분 파일 포맷 diff — 순수 포맷팅만, 로직 변경 없음)
  - 추가된 devDependencies: `eslint`, `eslint-config-expo`, `prettier`, `eslint-config-prettier`(+ eslint 트랜지티브). 전부 devDependency라 런타임 무영향
  - 남은 lint 이슈: 처음 `react/no-unescaped-entities` 2건(ForgotPasswordScreen / MissionNotFound의 JSX 텍스트 내 `'`) — 표시상 동일한 `&apos;` 이스케이프로 안전하게 수정(로직/표시 변경 없음). **최종 lint 에러 0건**
  - 검증: `npm run lint`(에러 0), `npm run format:check`(All matched files use Prettier code style), `npx tsc --noEmit` 통과, `expo start --web` 부팅 확인(온보딩 정상 렌더 — 포맷팅이 로직 안 건드림). ※ 콘솔의 NativeWind dark-mode 경고는 이번 작업과 무관한 기존 경고
- [ ] 핵심 훅 · 유틸 기본 테스트
- [ ] **EAS Build → TestFlight 설정** (Android 진행 중 · 2026-08-09)
  - `eas-cli` devDependency로 설치, `eas login` 완료, `eas init`으로 프로젝트 연결(`@elodiekim/notme-app`), `eas build:configure`로 `eas.json`(development/preview/production 프로필) 생성
  - Bundle ID/package를 `com.notme.app`으로 통일 지정(`app.json`) — 스토어 등록 전이라 지금 정해야 나중에 안 바뀜
  - **막힐 뻔한 것**: 첫 빌드를 환경변수 없이 그대로 돌렸다가 뒤늦게 발견 — `.env`는 gitignore 대상이라 **클라우드 빌드는 로컬 `.env` 값을 전혀 모름**. 그대로 뒀으면 빌드는 성공하고 앱이 Supabase에 아예 못 붙는 상태로 나올 뻔함. 빌드 취소 후 `eas env:set`으로 `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`를 development/preview/production 세 환경 전부에 등록하고 재시작. **앞으로 `.env`에 새 키 추가할 때마다 EAS 쪽에도 같이 등록해야 함** — 안 하면 로컬에선 되는데 빌드본에서만 조용히 깨짐
  - Android 첫 빌드(`preview` 프로필, 내부 배포용 APK) **완료**. 키스토어는 EAS가 자동 생성(Expo 서버 관리)
  - **iOS는 미착수** — Apple Developer 계정($99/년) 필요, 사용자 확인 후 진행 예정
  - **실기기 검증은 Android APK 대신 iOS 시뮬레이터로 진행** (안드로이드 실기기가 없어서) — Xcode CLT만 있던 환경이라 `xcode-select`를 풀 Xcode로 전환 + 라이선스 동의 + iOS 18.3 시뮬레이터 런타임(8.72GB) 신규 설치부터 필요했음. 시뮬레이터 2대(iPhone 16 Pro/iPhone 16)를 동시에 띄우고(한쪽 기기에 설치된 Expo Go `.app`을 `simctl install`로 복사) 요청자/히어로 계정을 각각 로그인해서 실시간 상호작용까지 확인(2026-08-09) — 아래 항목들 전부 정상 동작 확인:
    - 이미 가입된 이메일 blur 시 경고
    - 요청자가 수락 후 취소 → 확인 시트 → 히어로 화면에 즉시 반영
    - Confirm Location 뒤로가기 시 폼 대신 mission-status로 튕김, Searching 화면 안 갈아치워짐
    - 히어로 back-out → 요청자 쪽 토스트
- [x] AGENTS.md의 Expo 버전(57) vs 실제(54) 정리 (완료 · 2026-07-28) — `docs.expo.dev/versions/v57.0.0/` → `v54.0.0/`로 수정, `package.json`의 `"expo": "^54.0.0"`과 일치시킴

---

## 만들지 않음 (CLAUDE.md 기준)

결제 · AI · 채팅 · 푸시알림 · 애널리틱스 · 어드민 · 리퍼럴 · 게이미피케이션
