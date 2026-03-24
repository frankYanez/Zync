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
- **dj** — DJ profiles, gigs, promo codes, stats (`DjStats`); follow/unfollow DJs (`followDj`/`unfollowDj`); DJ reviews (`getDjReviews`, `submitDjReview`); live mode toggle (`setDjLiveMode`); DJ feed of upcoming gigs from followed DJs (`getDjFeed`)
- **profile** — User profile editing, avatar upload, DJ/organizer sub-profiles; `stats.service.ts` exposes user tier (`bronze`/`silver`/`gold`)
- **wallet** — Cart, orders, payment methods; `wallet.service.ts` for balance/top-up
- **dashboard** — Home feed, event/venue discovery; `BusinessHomeScreen` (venue metrics + live pending orders); event management for organizers (`getMyEvents`, `createEvent`, `updateEvent`, `deleteEvent`); geolocation check-in (`checkLocation` → `POST /events/check-location`); lineup management (`addDjToLineup`)
- **scanner** — QR code scanning
- **tickets** — User ticket purchase/display with QR codes; `validateTicket` for business scanner. **Note:** currently mock-only (see TODO comments in `ticket.service.ts`)
- **venues** — Venue creation and management (`createVenue`, `getMyVenues`); venue reviews; media upload (image/video via Cloudinary); active event lookup (`getVenueActiveEvent`); orders fulfillment view for venue owners
- **music** — Spotify integration: client-credentials OAuth, `searchTracks(query)`
- **stories** — Event stories: create, view by event, view by user-in-event

### Mock Services

Several services are temporarily mock-only while backend endpoints are being built. They include `TODO` comments with the real endpoint. Check before integrating:
- `src/features/tickets/services/ticket.service.ts` — all endpoints mocked
- `src/features/wallet/services/wallet.service.ts` — `topUp` is mocked; `getBalance` is real
- `src/features/profile/services/stats.service.ts` — `getUserStats` is mocked
- `src/features/venues/services/venue.service.ts` — `createVenue`, `deleteVenue` are mocked
- `src/features/dashboard/services/event.service.ts` — `uploadEventCover`, `getVenueStats`, `getEventStats` are mocked
- `src/features/dj/services/dj.service.ts` — `sendBroadcast` is mocked (endpoint not yet available)

### API Integration

- **Base URL:** `EXPO_PUBLIC_API_URL=http://100.31.134.251:3000` (from `.env`)
- **HTTP client:** Axios; all authenticated requests use `getAuthHeaders()` from `src/features/auth/services/auth.service.ts`
- **Token storage:** `expo-secure-store` on mobile, `localStorage` on web; cached in-memory to avoid repeated reads
- **Real-time:** Socket.io client in `src/features/chat/services/socket.service.ts`, authenticated via JWT in `auth` field
- **API reference:** `api-reference.md` in the repo root — authoritative spec for all endpoints, error codes, and socket events. Also available interactively at `<BASE_URL>/api/docs` (Swagger).

#### Backend vs App roles

The backend has four roles (`USER`, `DJ`, `ORGANIZER`, `STAFF`), but the app maps them to three navigation roles: `user` → `(tabs)`, `dj` → `(business)`, `business` → `(business)`. A single user can hold multiple backend roles simultaneously (e.g. `DJ` + `ORGANIZER`).

#### Key Socket.io Events

Connect to `ws://<HOST>:3000?token=<accessToken>`.

| Direction | Event | Payload | Purpose |
|---|---|---|---|
| emit | `event:join` / `event:leave` | `{ eventId }` | Join/leave event room |
| emit | `chat:send_public` | `{ eventId, content }` | Group chat message |
| emit | `chat:send_private` | `{ eventId, toUserId, content }` | 1-to-1 message |
| on | `chat:public_message` / `chat:private_message` | message object | Receive messages |
| emit | `chat:typing` | `{ eventId, toUserId }` | Typing indicator |
| on | `chat:typing_status` | `{ fromUserId, eventId }` | Other user typing |
| emit | `chat:mark_delivered` / `chat:mark_seen` | `{ messageId }` | Read receipts |
| emit | `presence:get_list` | `{ eventId }` | Request online users list |
| on | `presence:list` / `presence:joined` / `presence:left` | user data | Presence updates |
| on | `order:new` | order object | Business receives new order |
| on | `order:status_update` | `{ orderId, status }` | User receives order status change |
| on | `song_request:updated` | song request object | User receives DJ response to song request |

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
