# Zync Mobile — Documentación Técnica (Frontend)

> React Native 0.81.5 · Expo SDK 54 · Expo Router · TypeScript

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework móvil | React Native | 0.81.5 |
| Toolchain | Expo SDK | 54 |
| Routing | Expo Router | file-based, typed routes |
| Lenguaje | TypeScript | strict mode |
| HTTP | Axios | - |
| Real-time | Socket.io client | - |
| State | Context API | sin Redux ni Zustand |
| Storage | expo-secure-store (móvil) / localStorage (web) | - |
| Animaciones | Reanimated + Moti | - |
| Optimización | React Compiler | memoización automática |
| Música | Spotify Web API | client credentials |

Alias de paths: `@/*` → `./src/*` (configurado en `tsconfig.json`).

---

## Estructura de directorios

```
Zync/
├── app/                    # Rutas Expo Router (file-based)
│   ├── _layout.tsx         # Root layout: providers + stack navigation
│   ├── (auth)/             # Login, Register, Verify
│   ├── (tabs)/             # Tabs del rol user
│   ├── (business)/         # Tabs de los roles dj y business
│   ├── chat/               # Chat list, [id], connected-users
│   ├── tickets/            # Lista de tickets, [id] con QR
│   ├── profile/            # Editar perfil, crear DJ/organizador
│   └── dj/                 # [id] perfil público DJ
│
└── src/
    ├── components/         # UI compartida (NeonButton, CyberCard, etc.)
    ├── context/            # RoleContext, ZyncContext
    ├── features/           # Módulos por dominio (ver tabla abajo)
    ├── hooks/              # Hooks globales (useProtectedRoute, useRoleManager)
    ├── infrastructure/     # Configuración del cliente HTTP
    └── shared/
        └── constants/
            └── theme.ts    # ZyncTheme: colores, espaciado
```

---

## Sistema de navegación

### Grupos de rutas

| Grupo | Ruta | Acceso |
|---|---|---|
| `(auth)` | login, register, verify | No autenticado |
| `(tabs)` | Home, Wallet, Scanner, Beats, Profile | Rol: `user` |
| `(business)` | Tabs dinámicos según rol | Rol: `dj` o `business` |
| `chat/` | Lista, conversación, usuarios conectados | Autenticado |
| `profile/` | edit, change-password, create-dj, edit-dj | Autenticado |
| `dj/` | `[id]` — perfil público | Autenticado |

### Routing guard

`useProtectedRoute` (`src/hooks/useProtectedRoute.ts`) se ejecuta en el root layout y evalúa el estado de auth y el rol activo:

```
Sin sesión       → redirect (auth)/login
Rol user         → redirect (tabs)
Rol dj/business  → redirect (business)
```

### CustomTabBar

`src/components/CustomTabBar.tsx` renderiza los tabs del grupo `(business)` de forma dinámica. Según `currentRole`:

- **dj**: Home, Requests, Promo Codes, Profile
- **business**: Home, Products, Scanner, Orders, Profile

El tab Scanner tiene un estilo elevado especial con borde neon.

### Orden de providers (root layout)

```
ZyncProvider
  └── AuthProvider
        └── RoleProvider
              └── CartProvider
                    └── Stack Navigation
```

---

## Gestión de estado

Context API exclusivamente. Cuatro contextos globales:

| Contexto | Archivo | Responsabilidad |
|---|---|---|
| `AuthContext` | `src/features/auth/context/` | Estado de auth, tokens JWT, datos del usuario logueado, balance |
| `RoleContext` | `src/context/RoleContext.tsx` | Rol activo, cambio de rol en runtime |
| `ZyncContext` | `src/context/ZyncContext.tsx` | Venue/establecimiento activo seleccionado |
| `CartContext` | `src/features/wallet/context/` | Ítems del carrito, checkout, órdenes activas |

---

## Feature modules

Cada módulo en `src/features/` sigue la estructura:

```
features/<nombre>/
├── screens/    # Componentes de pantalla
├── services/   # Llamadas HTTP / socket
├── domain/     # Tipos e interfaces TypeScript
├── context/    # Context propio (si aplica)
└── hooks/      # Hooks del módulo
```

| Módulo | Estado | Descripción |
|---|---|---|
| `auth` | Completo | JWT, refresh token, OTP email verification, Google OAuth |
| `chat` | Completo | Socket.io, 1-to-1 y chat grupal de evento |
| `dj` | Completo | Perfiles DJ, gigs, promo codes, song requests, stats |
| `profile` | Completo | Edición de perfil, avatar, sub-perfiles DJ/organizador |
| `dashboard` | Completo | Home feed, discovery de eventos/venues, métricas business |
| `wallet` | En progreso | Carrito, órdenes, Zync Points; `topUp` es mock |
| `scanner` | En progreso | Escáner QR, integración parcial |
| `tickets` | Mock | Compra y visualización con QR — todo mock, ver `ticket.service.ts` |
| `venues` | Completo | Creación y gestión de venues (`createVenue`, `getMyVenues`) |
| `music` | Completo | Spotify client credentials OAuth, `searchTracks(query)` |
| `stories` | En progreso | Historias de evento: crear, ver por evento/usuario |

### Servicios mock activos

Los siguientes servicios tienen `TODO` con el endpoint real pendiente:

- `src/features/tickets/services/ticket.service.ts` — todos los endpoints son mock
- `src/features/wallet/services/wallet.service.ts` — `topUp` es mock; `getBalance` es real
- `src/features/profile/services/stats.service.ts` — `getUserStats` es mock

---

## Hooks clave

| Hook | Archivo | Expone |
|---|---|---|
| `useProtectedRoute` | `src/hooks/useProtectedRoute.ts` | Redirige según auth y rol |
| `useRoleManager` | `src/hooks/useRoleManager.ts` | `currentRole`, `switchRole(role)` |
| `useProfile` | `src/features/profile/hooks/` | `profile`, `isLoading`, `isSaving`, `updateField(field, value)`, `setAvatarUrl`, `refetch` |
| `useDjProfile` | `src/features/dj/hooks/` | Perfil DJ del usuario autenticado |
| `useDjGigs` | `src/features/dj/hooks/` | Lista de gigs para un `djProfileId` |
| `useDjStats` | `src/features/dj/hooks/` | `DjStats` para un `djProfileId` |
| `useDjPromoCodes` | `src/features/dj/hooks/` | Códigos promo; expone `createPromoCode(eventId)` |
| `useSongRequests` | `src/features/dj/hooks/` | `pending`, `accepted`, `history`, `updateStatus(requestId, status)` |

> Siempre usar `useProfile` en lugar de llamar a `profile.service.ts` directamente desde pantallas.

---

## Integración con la API

- **Base URL**: definida en `.env` como `EXPO_PUBLIC_API_URL`
- **Cliente HTTP**: Axios; todas las peticiones autenticadas usan `getAuthHeaders()` de `src/features/auth/services/auth.service.ts`
- **Almacenamiento de tokens**: `expo-secure-store` en móvil, `localStorage` en web; con caché en memoria para evitar lecturas repetidas al storage
- **Refresh**: `refreshToken()` renueva el access token; el flujo de refresco es transparente

---

## Integración Socket.io

Servicio: `src/features/chat/services/socket.service.ts`  
Autenticación: JWT enviado en el campo `auth` del handshake WebSocket.

| Dirección | Evento | Propósito |
|---|---|---|
| emit | `join-event` / `leave-event` | Unirse / salir de la sala del evento |
| emit | `send-message` | Mensaje privado 1-to-1 |
| emit | `send-event-message` | Mensaje al chat grupal del evento |
| on | `new-message` / `event-message` | Recibir mensajes |
| emit/on | `typing` / `onTyping` | Indicadores de escritura |
| on | `message-delivered` / `message-seen` | Confirmaciones de entrega y lectura |
| emit | `presence:who` | Solicitar lista de usuarios online |
| on | `presence:list` / `presence:update` | Datos de presencia |

---

## Sistema de diseño

Tema centralizado en `src/shared/constants/theme.ts` como `ZyncTheme`. Estética cyberpunk/neon.

### Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| Primary | `#CCFF00` | Lima eléctrico. Acento principal, CTAs, bordes activos |
| Background | `#0a0a0a` | Negro profundo. Fondo base de todas las pantallas |
| Card | `#161616` | Contenedores y tarjetas |
| Border | `#2a2a2a` | Bordes de elementos |
| Error | `#FF0055` | Errores y alertas críticas |
| TabBar | `#121212` | Fondo del tab bar |

### Escala de espaciado

`xs=4 · s=8 · m=16 · l=24 · xl=32 · xxl=48`

### Componentes compartidos (`src/components/`)

`NeonButton` · `NeonInput` · `NeonModal` · `ScreenLayout` · `CustomTabBar` · `CyberCard` · `ZyncLoader` · `VideoBackground` · `CollapsingProfileHeader` · `RoleSelector` · `AvatarUpload` · `TicketCard` · `TypingIndicator` · `EventStoriesCarousel` · `ConnectedUsersCarousel` · `PromotionsCarousel` · `LiveOrderBanner`

---

## Comandos de desarrollo

```bash
npm start          # Servidor de desarrollo Expo
npm run android    # Emulador Android
npm run ios        # Simulador iOS
npm run web        # Navegador
npm run lint       # ESLint
```

No hay suite de tests configurada. No hay build step — Expo maneja el bundling.
