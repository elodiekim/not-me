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
