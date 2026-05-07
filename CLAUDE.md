# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Serve production build locally
npm run lint     # ESLint (flat config, eslint-config-next)
```

No test framework is configured.

## Project Overview

**FizyoPanel** — A physiotherapy clinic management system. Frontend-only prototype with mock data; no backend or database. Supports Turkish and English via `lib/i18n.ts`, defaulting to Turkish.

## Architecture

- **Next.js 16 App Router** with React 19 and TypeScript 5
- **TailwindCSS 4** using CSS-based `@theme` config in `app/globals.css` (not `tailwind.config.js`)
- **Zustand 5** for client state (`lib/store.ts`) — holds mutable copies of mock data for appointments, patients, sessions, payments, exercise completions, water intake, session surveys, chat messages, progress notes, patient profiles, plus UI state (sidebar, toast, language, login)
- **Framer Motion** for page/component animations (used in achievements and other patient-facing pages)
- **FullCalendar 6** for the appointment calendar view
- **Recharts 3** for progress/report charts
- **Lucide React** for icons

## Key Conventions

- All route pages are `'use client'` components that consume the Zustand store directly
- Path alias `@/` maps to project root
- Design tokens are defined as CSS custom properties in `globals.css` `@theme` block (e.g., `--color-primary`, `--color-background`) — use these Tailwind color names (e.g., `bg-primary`, `text-text-main`, `border-border`)
- Dark mode is toggled by `AppShell` adding/removing the `dark` class on `<body>` based on Zustand `theme` state; dark overrides for CSS variables live in `globals.css` under `body.dark`
- Font scale: `AppShell` writes `fontSize` (`small`/`normal`/`large` → `14px`/`16px`/`18px`) onto `document.documentElement.style.fontSize` so all `rem` units rescale globally
- Custom UI components in `components/ui/` (Card, Button, Badge, Modal, Tabs, Input, Select, ProgressBar, Toast, StatCard) — use these instead of installing a component library
- Dashboard widgets live in `components/dashboard/` (`PatientDashboard`, `AppointmentListWidget`, `ProgressChartWidget`, `QuickActionPanel`, `MotivationalQuote`)
- Patient-facing widgets in `components/patient/` (e.g., `ChatWidget`, `WaterIntakeWidget`, `ExerciseTimer`, `BadgesWidget`, `BeforeAfterComparison`, `DailyGoalsWidget`, `MedicationWidget`, `SleepEnergyWidget`, `ExerciseHeatmap`, `AppointmentRequestWidget`)
- `lib/utils.ts` provides `cn()` for conditional class joining, plus `formatDate`, `formatTime`, `formatCurrency` (Turkish locale), and `fullName` helpers
- `AppShell` (`components/layout/AppShell.tsx`) wraps all pages: shows `LoginPage` when logged out, otherwise renders Sidebar + Header + content area, plus the global `ChatWidget` and `Toast`
- i18n: use `t('key', language)` from `lib/i18n.ts`; language state lives in Zustand store. Type is `Language = 'tr' | 'en'`

## Mobile-First Layout

The UI is phone-optimized — recent work redesigned most pages around small screens, then layered desktop affordances on top via `lg:` breakpoints (Tailwind ≥1024px).

- Sidebar is a slide-in overlay on mobile (with backdrop `bg-black/50 lg:hidden`) and a fixed rail on desktop. Content area uses `pl-0 lg:pl-64`
- Main padding is `p-3 lg:p-6`; pages should follow the same compact-on-mobile pattern
- `globals.css` defines mobile helpers: `.mobile-full-card` (edge-to-edge cards under 1024px) and `.scrollbar-hide` (for horizontal tab strips). `html, body` are locked to `overflow-x: hidden` to prevent stray horizontal scroll
- Prefer stacked layouts on mobile (e.g., payment rows, session summaries) and `grid`/`flex` rows only at `lg:`

## Dual-Role System

The app supports two roles: `'doctor'` and `'patient'`. The role is set at login via `useStore`'s `login(role, patientId?)` action. `AppShell` enforces route restrictions — patients can only access paths in `PATIENT_ALLOWED_PATHS`, plus a special-case exception for their own detail page (`/hastalar/${loggedInPatientId}`). Restricted paths trigger a `router.replace('/')`. The dashboard renders `PatientDashboard` for patients and the standard admin dashboard for doctors.

## Data Flow

- `lib/types.ts` — all TypeScript interfaces
- `lib/mock-data.ts` — static mock data arrays + helper functions (date generators)
- `lib/store.ts` — Zustand store initialized from mock data, with actions for mutations
- `lib/constants.ts` — navigation items, status color maps, motivational quotes
- `lib/i18n.ts` — translation keys and `t()` helper function

## Routes

All routes are Turkish-language paths:

- **Core (doctor):** `/` (Dashboard), `/randevular` (Appointments), `/hastalar` (Patients), `/hastalar/[id]` (Patient detail), `/tedavi-planlari` (Treatment plans), `/seanslar` (Sessions), `/egzersiz-programlari` (Exercises), `/ilerleme` (Progress), `/odemeler` (Payments), `/raporlar` (Reports), `/ayarlar` (Settings)
- **Patient-facing:** `/profilim` (My Profile), `/belgelerim` (My Documents), `/seans-ozetleri` (Session Summaries), `/bilgilendirme` (Info Center/FAQs)
