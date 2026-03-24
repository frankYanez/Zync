# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
npm run lint       # Run ESLint
```

No test suite is configured. There is no build step — Expo handles bundling.

## Architecture Overview

Zync is a multi-role nightlife/events platform built with **Expo Router** (file-based routing) and **React Native 0.81.5**.

### User Roles

Three roles with distinct navigation layouts:
- `user` — Event attendees (5-tab layout in `app/(tabs)/`)
- `dj` — Artists managing gigs and promo codes (role-based tabs in `app/(business)/`)
- `business` — Venue owners managing products and events (role-based tabs in `app/(business)/`)

Role is managed by `RoleContext` (`src/context/RoleContext.tsx`). The `(business)` tab group renders different tabs/screens depending on `currentRole` via `CustomTabBar.tsx`.

### Navigation Structure

```
Root Stack (_layout.tsx)
├── (auth)/          — Login, Register, Verify screens
├── (tabs)/          — User tabs: Home, Wallet, Scanner, Beats, Profile
├── (business)/      — DJ/Business tabs (role-conditional)
│   ├── Shared: Home, Profile
│   ├── DJ-only: Requests (songs), dj/promo-codes
│   ├── Business-only: Products, Scanner, Orders
│   └── Hidden: dj/gigs, events/lineup, config
├── chat/            — index (list), [id] (1-to-1), connected-users
├── tickets/         — index (user ticket list), [id] (ticket detail with QR)
├── profile/         — edit, change-password, create-dj, create-organizer, edit-dj
└── dj/              — [id] (public DJ profile view)
```

Provider order in root layout: `ZyncProvider → AuthProvider → RoleProvider → CartProvider`.

### Routing Guards

`useProtectedRoute` (`src/hooks/useProtectedRoute.ts`) enforces:
- Unauthenticated → redirect to `(auth)`
- `business` or `dj` role → redirect to `(business)`
- `user` role → redirect to `(tabs)`

### State Management

Context-only (no Redux/Zustand):

| Context | Location | Purpose |
|---|---|---|
| `AuthContext` | `src/features/auth/context/` | Auth state, login/register/logout |
| `RoleContext` | `src/context/RoleContext.tsx` | Current role, role switching |
| `ZyncContext` | `src/context/ZyncContext.tsx` | Active establishment (venue) |
| `CartContext` | `src/features/wallet/context/` | Cart items, checkout |

### Feature Modules (`src/features/`)

Each feature follows: `screens/`, `services/`, `domain/` (types), `context/`, `hooks/`.

- **auth** — JWT auth, token refresh, OTP email verification
- **chat** — Socket.io real-time messaging (1-to-1 and event group chats)
- **dj** — DJ profiles, gigs, promo codes, stats (`DjStats`)
- **profile** — User profile editing, avatar upload, DJ/organizer sub-profiles; `stats.service.ts` exposes user tier (`bronze`/`silver`/`gold`)
- **wallet** — Cart, orders, payment methods; `wallet.service.ts` for balance/top-up
- **dashboard** — Home feed, event/venue discovery; `BusinessHomeScreen` (venue metrics + live pending orders)
- **scanner** — QR code scanning
- **tickets** — User ticket purchase/display with QR codes; `validateTicket` for business scanner. **Note:** currently mock-only (see TODO comments in `ticket.service.ts`)
- **venues** — Venue creation and management (`createVenue`, `getMyVenues`)
- **music** — Spotify integration: client-credentials OAuth, `searchTracks(query)`
- **stories** — Event stories: create, view by event, view by user-in-event

### Mock Services

Several services are temporarily mock-only while backend endpoints are being built. They include `TODO` comments with the real endpoint. Check before integrating:
- `src/features/tickets/services/ticket.service.ts` — all endpoints mocked
- `src/features/wallet/services/wallet.service.ts` — `topUp` is mocked; `getBalance` is real
- `src/features/profile/services/stats.service.ts` — `getUserStats` is mocked

### API Integration

- **Base URL:** `EXPO_PUBLIC_API_URL=http://100.31.134.251:3000` (from `.env`)
- **HTTP client:** Axios; all authenticated requests use `getAuthHeaders()` from `src/features/auth/services/auth.service.ts`
- **Token storage:** `expo-secure-store` on mobile, `localStorage` on web; cached in-memory to avoid repeated reads
- **Real-time:** Socket.io client in `src/features/chat/services/socket.service.ts`, authenticated via JWT in `auth` field

#### Key Socket.io Events

| Direction | Event | Purpose |
|---|---|---|
| emit | `join-event` / `leave-event` | Join/leave event room |
| emit | `send-message` | 1-to-1 message |
| emit | `send-event-message` | Group/event chat message |
| on | `new-message` / `event-message` | Receive messages |
| emit/on | `typing` / `onTyping` | Typing indicators |
| on | `message-delivered` / `message-seen` | Read receipts |
| emit | `presence:who` | Request online users list |
| on | `presence:list` / `presence:update` | Receive presence data |

### Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

### Design System

Theme defined in `src/shared/constants/theme.ts` (`ZyncTheme`):
- Primary accent: `#CCFF00` (electric lime/neon)
- Background: `#0a0a0a`, Card: `#161616`, Border: `#2a2a2a`
- Error: `#FF0055`, Tab bar: `#121212`
- Spacing scale: `xs=4, s=8, m=16, l=24, xl=32, xxl=48`

Shared UI components (`src/components/`): `NeonButton`, `NeonInput`, `NeonModal`, `CustomTabBar`, `CyberCard`, `ZyncLoader`, `ScreenLayout`, `VideoBackground`, `CollapsingProfileHeader`.

### Key Hooks

- `useProtectedRoute` — Redirects unauthenticated users to `(auth)`; routes by role
- `useRoleManager` — Thin wrapper around `RoleContext` (`currentRole`, `switchRole`)
- `useDjProfile` — Fetches current user's DJ profile
- `useDjGigs` — Fetches gigs for a DJ profile ID
- `useDjStats` — Fetches `DjStats` for a DJ profile ID
- `useDjPromoCodes` — Fetches/generates promo codes; exposes `createPromoCode(eventId)`
- `useSongRequests` — Fetches song requests for a DJ; exposes `pending`, `accepted`, `history`, and `updateStatus(requestId, status)`
- `useProfile` (`src/features/profile/hooks/`) — Fetches and updates the authenticated user's profile; exposes `profile`, `isLoading`, `isSaving`, `updateField(field, value)`, `setAvatarUrl`, `refetch`. Always use this hook instead of calling `profile.service.ts` directly from screens.
