# DESIGN.md

# NotMe Design System

Version: 1.0

---

# Design Philosophy

NotMe should feel calm during stressful situations.

The interface should reduce anxiety rather than increase it.

The product should feel:

- Minimal
- Fast
- Modern
- Friendly
- Trustworthy

The UI should never feel childish.

Humor comes from copywriting and illustrations,
not from exaggerated UI elements.

---

# Brand Personality

Friendly

Reliable

Confident

Approachable

Modern

Slightly witty

Never sarcastic.

Never make fun of the user.

---

# Design Keywords

Minimal

Clean

Comfortable

Breathing Space

Large Typography

Rounded Shapes

Simple Navigation

Soft Motion

---

# Design Inspiration

The overall design language should be inspired by:

- Apple
- Uber
- Airbnb
- Linear
- Notion

Avoid copying any product directly.

---

# Visual Style

Flat Design

Soft Shadows

Rounded Corners

Large Cards

Minimal Icons

Generous White Space

No Skeuomorphism

No Glassmorphism

No Neumorphism

---

# Color System

## Primary

Yellow

#FFB400

Used for:

- Primary Buttons
- Active States
- CTA
- Important Highlights

---

## Background

White

#FFFFFF

Light Gray

#F8F8F8

---

## Text

Primary

#111111

Secondary

#666666

Disabled

#AAAAAA

---

## Status Colors

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Information

#3B82F6

---

# Typography

Font Family

Poppins

Fallback

System Font

---

## Scale

Display

40

Heading

32

Title

24

Subtitle

20

Body

16

Caption

13

Small

12

---

# Font Weight

Bold

SemiBold

Medium

Regular

Avoid Light.

---

# Spacing

Use an 8pt Grid.

Spacing Tokens

4

8

12

16

20

24

32

40

48

64

80

Avoid random spacing.

---

# Border Radius

Buttons

999

Cards

24

Inputs

16

Bottom Sheets

28

Avatars

999

---

# Shadows

Soft only.

Cards

Small Shadow

Floating Button

Medium Shadow

Bottom Sheet

Large Shadow

Never use heavy shadows.

---

# Icons

Style

Outline

Rounded

Simple

Use Lucide Icons.

Avoid filled icons unless necessary.

This applies to functional UI icons only — navigation, actions, list rows, empty/status states (implemented via Feather from `@expo/vector-icons`, close enough to Lucide in style).

Category and brand icons (mission categories, feature cards like "Become a Hero") are hand-drawn illustrations, not outline icons — see Illustrations below.

---

# Illustrations

Illustrations should feel:

Minimal

Friendly

Flat

Simple

Consistent

No gradients.

No realistic drawings.

No 3D.

---

# Character

Main mascot

White Cat

Three official poses:

Hero Cat

Avatar Cat

Proud Cat

Do not create additional poses unless required.

---

# Asset Rules

Assets live inside

/assets

Folders

logo/

characters/

bugs/

icons/

about/ — real (non-illustrated) founder photos, used only on the About NotMe screens. Use the processed/upscaled versions, not raw camera originals.

Never redesign official assets.

---

# Buttons

Primary

Yellow Background

Black Text

Rounded Full

Height

56

Secondary

White Background

Black Border

Ghost

Transparent

Text Only

Danger

Red

Only for destructive actions.

---

# Inputs

Rounded

16 Radius

56 Height

Clear Placeholder

Left Icon Optional

---

# Cards

White

24 Radius

Soft Shadow

Large Padding

Never use borders unless necessary.

---

# Bottom Navigation

Four Tabs

Home

Mission

Inbox — read-only activity feed (mission status changes, reviews received). Not chat.

Profile

Minimal Icons

Label Always Visible

---

# Animations

Animation should feel natural.

Duration

200~300ms

Use:

Fade

Scale

Slide

Avoid:

Bounce

Shake

Spin

Overly playful effects

## Exception: Mission Complete Celebration

One deliberate exception to "avoid bounce/overly playful": the moment Mission Status live-transitions to `completed` (Hero just finished, User is watching in real time) is the single peak emotional moment in the app and earns a punchier beat than everyday UI.

Everywhere else, the calm rules above still apply. This is reserved for this one moment only — not a general license for bounce/playful effects elsewhere.

Shape: a centered celebratory banner (not the bottom-bar `Toast` used for routine confirmations like cancellation — that shape should stay reserved for mundane notices so this one reads as different). Scale-in "pop" (e.g. 0.85 → 1.05 → 1.0) + fade, still RN `Animated`, no new animation library.

Copy: "Mission Complete! Your hero saved the day" / 미션 완료! 히어로가 문제를 해결했어요.

Fires once, only on a live status transition while the screen is open — not on landing on an already-completed mission (re-showing it every visit would wear out fast and undercuts the "just this one moment" intent).

---

# Screen Structure

Every screen should follow:

Header

↓

Content

↓

Primary Action

↓

Bottom Navigation

Avoid clutter.

---

# Empty States

Every feature should have an empty state.

Include:

Illustration

Title

Description

CTA

---

# Loading States

Always provide loading feedback.

Use Skeletons when appropriate.

Keep loading messages friendly.

Example

Looking for a hero...

Stay calm.

Help is on the way.

---

# Error States

Never expose technical messages.

Bad

500 Internal Server Error

Good

Something went wrong.

Please try again.

---

# Accessibility

Minimum touch target

44 x 44 pt

Support Dynamic Type

Maintain sufficient color contrast

Support screen readers

---

# Component Library

Core Components

Button

Input

Card

Avatar

Badge

Chip

MissionCard

FeatureCard

SectionHeader

BottomSheet

TabBar

LoadingIndicator

---

# Screen Order

User

Splash

↓

Onboarding

↓

Home

↓

Request

↓

Searching

↓

Mission Status

↓

Complete

↓

Profile

Hero

Home

↓

Nearby Missions

↓

Mission Detail

↓

Navigation

↓

Complete

↓

History

---

# Copy Style

Short.

Clear.

Friendly.

Never use long paragraphs.

Good

Need help?

Hero found.

Mission accepted.

We're on the way.

Mission complete.

Avoid

Oops.

LOL.

Too bad.

Why are you scared?

---

# Empty / Incomplete State Copy

Never phrase an empty or incomplete state as something the user is missing or hasn't done.

That reads as guilt-tripping, which conflicts with "never make fun of the user" and "reduce anxiety."

Bad

아직 도움 준 적 없어요!

Good

The roach next door is waiting.

첫 출동 대기 중...

Frame it as an invitation to a future state, not a gap in the user's past behavior.

Humor should come from the brand's core material (bugs, the cat mascot, the mission itself), never from the user's inaction.

---

# Easter Egg: Fake Pest Control Ad

A one-off joke, not a real ad system. Parodies the "ad injected right after a payout" dark pattern real gig apps use, aimed at the User (not the Hero) — the joke only lands on the side that just had a bug removed.

## Placement

`CompleteScreen` (`/complete`), between the "Mission Complete! 바퀴벌레 문제 해결 완료!" message and the "How was your Hero?" review form. Must not cover or push down the Submit Review / Not now buttons.

## Copy

"Ad" label + small card, styled with existing card tokens (rounded-card, soft shadow, surface background) so it looks like a real ad slot — the joke is in the content, not in visual clutter.

Company name: **TBD**.

Tagline:

> Need a permanent solution?
>
> 404 Bugs
>
> The bug you're looking for cannot be found.

## Rules

- Exactly one instance, one screen. No rotation system, no other placements — a recurring bit stops being funny.
- Not a real link. Tapping it shows a small toast ("농담이에요, 광고 없어요 🐱" or similar) instead of navigating anywhere.
- Never on the Hero side — this joke is specifically about the User's bug problem being "solved," which doesn't apply to the Hero's completion screen.

---

# About NotMe

The founder's story — why NotMe exists. Reached from Profile, not part of the core User/Hero mission loop. Not a marketing page: this should read like a short personal story, not a product pitch.

Consolidates the drafts in `about-notme/` into one final spec.

## Entry Point

Add an "About NotMe" row to the Profile settings list, alongside Account / Notifications / Help.

## Exception: Language Selector

Everywhere else in this app, English and Korean are shown together on the same screen (English primary, Korean secondary — see Copy Style). **This flow is the one deliberate exception**: it opens on a language choice (🇺🇸 English / 🇰🇷 한국어), and every screen after that shows only the chosen language, not both.

Why the exception: this is a personal story meant to be read start-to-finish in one language, not scanned line-by-line like the rest of the app's short functional copy. Don't extend this pattern anywhere else — it stays unique to About NotMe.

## Flow

About NotMe (Profile) → Language Select → Screen A "About NotMe" → Screen B "The Real Story" → back into the app (not a dead end).

## Screen A — "About NotMe"

1. Brand logo
2. Proud Cat illustration
3. Title: "How NotMe Started" / "이 앱을 만든 이유"
4. Founder story (EN):

> One day, a cockroach appeared in my apartment. I couldn't kill it. Instead, I stood there for almost an hour, watching it and waiting for a friend to come and rescue me. Meanwhile, my cat was sitting underneath it, meowing because it wanted to catch it. I was terrified. My cat was ready. That day I had one simple thought. "There should be an app for this." That's how NotMe was born. The mascot you see throughout this app is inspired by my own cat, who was much braver than I was. NotMe started with one cockroach, but it grew into an idea: helping people solve the weird little problems they don't want to face alone.

Founder story (KR):

> 어느 날 집에 바퀴벌레가 나타났습니다. 저는 잡을 용기가 나지 않았습니다. 혹시라도 도망갈까 봐 친구가 올 때까지 거의 한 시간을 그 자리에서 서 있었습니다. 그런데 아래를 보니 우리 집 고양이는 계속 잡고 싶다고 야옹거리고 있었습니다. 저는 무서웠고, 고양이는 준비되어 있었습니다. 그때 이런 생각이 들었습니다. "이런 것도 대신 도와주는 앱이 있으면 좋지 않을까?"

5. Mid-story pull-quote card (small, centered, one per screen):

EN: 💭 What I was thinking — "Please don't run away..." I stood there watching that cockroach for almost an hour, waiting for a friend.

KR: 💭 그때 들었던 생각 — "제발 도망가지 마..." 친구가 올 때까지 거의 한 시간을 바퀴벌레만 바라보고 있었습니다.

6. Continue button → Screen B

## Screen B — "The Real Story"

Real, uncropped-feeling photos from `assets/about/` (see Asset Rules), rounded corners, generous spacing between each photo block.

1. **Original cockroach photo** — caption EN: "The one that started everything." / KR: "모든 것의 시작이 된 바로 그 바퀴벌레입니다."
2. **Real cat photo** — caption EN: "He wanted to catch it. I definitely didn't." / KR: "저보다 훨씬 용감했던 우리 집 고양이입니다."
3. **Hero Cat illustration** (the existing official asset, shown alongside/after the real cat photo to draw the connection) — caption EN: "The mascot of NotMe was inspired by my real cat." / KR: "지금 앱에서 사용하는 Hero Cat은 이 친구에게서 영감을 받아 만들어졌습니다."
4. Footer: "Made with ☕ and one unforgettable cockroach." / "☕ 바퀴벌레 한 마리와 용감한 고양이가 만든 앱"
5. Final button, returns into the app (not just "back"): "🐱 Continue to NotMe — Start helping with weird problems →" / 홈으로

## Design Constraints

- Minimal and calm, generous white space, comfortable max text width for reading — follow the rest of DESIGN.md
- No animations required (this is the one screen area that doesn't need the Mission Complete–style delight treatment)
- Do not add illustrations beyond the existing Proud Cat / Hero Cat — the founder photos are the only new visual material
- Reuse existing typography and spacing tokens, no new ones
- Photos: rounded corners, don't crop aggressively

---

# Responsive Design

Reference Device

iPhone 16 Pro

Support

All modern iPhones

Android support comes second.

---

# Final Principle

Every screen should answer one question:

"What should the user do next?"

If the answer is unclear,

the design is too complicated.
