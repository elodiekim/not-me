# CLAUDE.md

# NotMe

Version: 1.0

---

# Project Overview

NotMe is a mobile-first application built with React Native and Expo.

This project is a personal side project focused on creating a polished MVP with an excellent user experience.

For product vision, target users, and features, see @PRODUCT.md.

For visual design, colors, typography, and copy tone, see @DESIGN.md.

This document covers technical rules, coding style, and project philosophy only.

---

# Vision

Build a simple, trustworthy and enjoyable product.

Always prioritize:

- User Experience
- Simplicity
- Speed
- Clean Architecture
- Maintainability

Never over-engineer.

---

# Tech Stack

## Mobile

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind

## State Management

- Zustand

## Server State

- TanStack Query

## Backend

- Supabase

## Database

- PostgreSQL

## Authentication

- Supabase Auth

## Storage

- Supabase Storage

## Realtime

- Supabase Realtime

## Deployment

- EAS Build
- TestFlight

Landing Page

- Vercel

---

# Project Structure

```
app/
components/
features/
hooks/
services/
stores/
types/
constants/
assets/
docs/
```

Keep folders simple.

Avoid deep nesting.

---

# Development Principles

Always build in the following order.

1. Design System

2. Shared Components

3. Feature Components

4. Screens

5. Business Logic

6. Supabase Integration

7. Animation

8. Optimization

Never build the entire feature at once.

Build incrementally.

---

# Coding Rules

Always use:

- TypeScript
- Functional Components
- React Hooks

Never use:

- Class Components

Prefer:

Small reusable components.

Avoid files larger than approximately 300 lines whenever practical.

Separate UI and business logic.

---

# Styling

Always use NativeWind.

Avoid inline styles unless absolutely necessary.

Create reusable UI components.

For colors, spacing, typography, and other design tokens, see @DESIGN.md.

---

# Navigation

Use Expo Router.

Keep navigation simple.

Avoid deeply nested routes.

---

# State Management

Global State

- Zustand

Server State

- TanStack Query

Never store server data inside Zustand.

---

# Backend

Supabase is the source of truth.

Prefer Supabase built-in features before creating custom solutions.

Use:

- Auth
- Storage
- Database
- Realtime

Avoid unnecessary backend complexity.

---

# Database Rules

Use UUID for every primary key.

Every table should contain:

- id
- created_at
- updated_at

Normalize data whenever possible.

Avoid duplicated information.

---

# Component Rules

Create reusable components.

Examples

- Button
- Card
- Input
- Badge
- Chip
- Avatar
- MissionCard
- FeatureCard
- BottomSheet

Never duplicate UI.

---

# Naming Convention

Components

PascalCase

Example

MissionCard.tsx

Hooks

useCamelCase

Example

useMission.ts

Stores

useMissionStore.ts

Types

Mission.ts

Constants

UPPER_SNAKE_CASE

---

# Error Handling

Never expose raw server errors to the user.

For message tone and copy examples, see @DESIGN.md.

---

# Performance

Avoid unnecessary re-renders.

Lazy load where appropriate.

Memoize expensive calculations only when necessary.

Do not optimize prematurely.

---

# Accessibility

Support Dynamic Type whenever possible.

Provide accessibility labels.

For touch target sizing and contrast requirements, see @DESIGN.md.

---

# Security

Never expose service keys.

Use environment variables.

Validate all user input.

Do not trust client-side validation.

---

# Communication Style

When generating code:

- Keep explanations concise.
- Explain important architectural decisions.
- Recommend the simplest implementation.
- Ask before adding new dependencies.
- Follow the existing project conventions.

---

# What NOT to Build

Do not implement unless explicitly requested.

- Payments
- AI Features
- Chat
- Push Notifications
- Analytics
- Admin Dashboard
- Referral System
- Gamification

Keep the MVP focused.

---

# Definition of Done

A feature is complete only when:

- UI matches the design.
- TypeScript has no errors.
- Components are reusable.
- Loading state exists.
- Empty state exists.
- Error state exists.
- The code is readable and maintainable.

---

# Final Principle

Every decision should improve one of these:

- Simplicity
- User Experience
- Readability
- Development Speed

If multiple implementations are possible,

always choose the simplest one.

---

# AI Working Rules

When implementing a feature:

1. Explain the implementation plan first.
2. Wait for approval before making major architectural changes.
3. Reuse existing components whenever possible.
4. Do not introduce new libraries without explaining why.
5. Keep generated code production-ready.
6. Follow the existing folder structure.
7. Prioritize readability over cleverness.
