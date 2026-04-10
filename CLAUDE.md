# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
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
- Dark mode is toggled by adding/removing `dark` class on `<body>` — dark overrides for CSS custom properties are in `globals.css` under `body.dark`
- Custom UI components in `components/ui/` (Card, Button, Badge, Modal, Tabs, Input, Select, ProgressBar, Toast, StatCard) — use these instead of installing a component library
- `lib/utils.ts` provides `cn()` for conditional class joining, plus `formatDate`, `formatTime`, `formatCurrency` (Turkish locale), and `fullName` helpers
- `AppShell` (`components/layout/AppShell.tsx`) wraps all pages: shows `LoginPage` when logged out, otherwise renders Sidebar + Header + content area
- Layout uses a fixed sidebar (`components/layout/Sidebar.tsx`) with `pl-64` offset on the content area
- i18n: use `t('key', language)` from `lib/i18n.ts`; language state lives in Zustand store. Type is `Language = 'tr' | 'en'`

## Dual-Role System

The app supports two roles: `'doctor'` and `'patient'`. The role is set at login via `useStore`'s `login(role, patientId?)` action. `AppShell` enforces route restrictions — patients can only access a whitelist of paths (`PATIENT_ALLOWED_PATHS`). The dashboard renders `PatientDashboard` for patients and the standard admin dashboard for doctors. Patient-specific widgets (ChatWidget, WaterIntake, PainMap, ExerciseTimer, etc.) live in `components/patient/`.

## Data Flow

- `lib/types.ts` — all TypeScript interfaces
- `lib/mock-data.ts` — static mock data arrays + helper functions (date generators)
- `lib/store.ts` — Zustand store initialized from mock data, with actions for mutations
- `lib/constants.ts` — navigation items, status color maps, motivational quotes
- `lib/i18n.ts` — translation keys and `t()` helper function

## Routes

All routes are Turkish-language paths:

- **Core (doctor):** `/` (Dashboard), `/randevular` (Appointments), `/hastalar` (Patients), `/hastalar/[id]` (Patient detail), `/tedavi-planlari` (Treatment plans), `/seanslar` (Sessions), `/egzersiz-programlari` (Exercises), `/ilerleme` (Progress), `/odemeler` (Payments), `/raporlar` (Reports), `/ayarlar` (Settings)
- **Patient-facing:** `/profilim` (My Profile), `/belgelerim` (My Documents), `/basarilarim` (Achievements/Badges), `/seans-ozetleri` (Session Summaries), `/bilgilendirme` (Info Center/FAQs)
