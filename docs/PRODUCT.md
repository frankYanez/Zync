# Zync — Documento de Producto

> Versión: 1.0 | Fecha: Abril 2026

---

## ¿Qué es Zync?

Zync es una plataforma móvil para la industria del entretenimiento nocturno. Conecta tres actores clave en tiempo real dentro de un mismo espacio físico (boliche, bar, festival): **asistentes**, **DJs** y **dueños de venues/organizadores**.

El eje central de la experiencia es el **establecimiento activo**: el usuario escanea el QR del local y queda "dentro" de ese contexto. A partir de ahí puede pedir bebidas, chatear con otros asistentes, pedir canciones al DJ, comprar tickets, y ver stories del evento — todo desde la app.

---

## Los tres roles

### 👤 Usuario (User)
Asistente al evento. Accede desde la pestaña `(tabs)`.

- Escanea QR al entrar al local → queda vinculado al evento activo
- Ordena productos del menú del venue
- Pide canciones al DJ (pagando en créditos)
- Chatea en el grupo del evento o 1-a-1 con otros asistentes
- Sube y ve stories del evento
- Acumula **Zync Points** (1 punto por cada $1 gastado)
- Puede canjear puntos como descuento en órdenes
- Puede seguir DJs y recibir notificaciones de sus próximos eventos
- Puede dejar reseñas de DJs y venues una vez terminado el evento

### 🎧 DJ
Artista en presentación. Accede desde la pestaña `(business)`.

- Ve su dashboard con requests de canciones pendientes y métricas
- Acepta, rechaza o marca como "played" las peticiones de canciones
- Activa/desactiva el modo "En Vivo" al comenzar a tocar
- Activa/desactiva si acepta peticiones de canciones
- Gestiona sus gigs (presentaciones agendadas)
- Tiene perfil público con géneros, precio por canción, redes sociales
- Puede crear promo codes para que los usuarios del evento canjeen descuentos
- Envía broadcasts (anuncios) al chat del evento *(pendiente backend)*

### 🏢 Organizer / Business (Venue Owner)
Dueño del local u organizador del evento. Accede desde la pestaña `(business)`.

- Crea y gestiona su venue (coordenadas, radio de check-in, horarios auto-evento)
- Crea eventos y los vincula al venue
- Configura el menú de productos del venue (bebidas, comidas, etc.)
- Ve y actualiza el estado de las órdenes en tiempo real (pending → confirmed → ready → delivered)
- Recibe nuevas órdenes via WebSocket (`order:new`)
- Gestiona el lineup de DJs para cada evento
- Sube cover del evento y media del venue (imágenes/videos a Cloudinary)
- Tiene panel de métricas (órdenes del día, ingresos, clientes activos) *(stats pendiente backend)*

---

## Flujos de usuario principales

### Flujo básico del asistente
```
1. Registro → verificación OTP por email → login
2. Llega al local → escanea QR del venue
3. Queda "dentro" del evento activo
4. Navega el menú → agrega productos al carrito
5. Aplica promo code (si tiene) y/o Zync Points
6. Checkout → el venue recibe la orden y la prepara
7. En paralelo: chatea, pide canciones al DJ, sube stories
8. Al terminar el evento: puede dejar reseña del DJ y del venue
```

### Flujo del DJ en una noche
```
1. Login → dashboard DJ
2. Activa "modo en vivo" + vincula al evento
3. Activa "aceptando peticiones"
4. Recibe peticiones en cola (ordenadas por quien pagó más)
5. Acepta/rechaza/marca como played
6. Usuario que pidió recibe notificación via socket
7. Al finalizar: desactiva modo en vivo
```

### Flujo del organizer preparando un evento
```
1. Crea su venue (nombre, dirección, coordenadas, radio check-in)
2. Crea productos del menú (gin tonic $1200, entrada $500, etc.)
3. Crea el evento (fecha, capacidad, cover, vincula al venue)
4. Agrega DJs al lineup
5. El día del evento: ve dashboard con pedidos en tiempo real
6. Gestiona órdenes: PENDING → CONFIRMED → READY → DELIVERED
```

---

## Arquitectura del sistema

### Stack Mobile
| Tecnología | Uso |
|------------|-----|
| React Native 0.81.5 | Framework mobile |
| Expo SDK 54 / Expo Router 6 | Bundling + file-based routing |
| TypeScript | Tipado estático |
| Socket.io Client | WebSocket en tiempo real |
| Axios | HTTP client |
| expo-secure-store | Almacenamiento seguro de tokens |
| moti | Animaciones |
| expo-notifications | Push notifications (Android) |
| @react-native-google-signin | Google OAuth |

### Backend (API REST + WebSocket)
- **Base URL:** `http://<HOST>:3000`
- **Docs (Swagger):** `<BASE_URL>/api/docs`
- **WebSocket:** Socket.io sobre el mismo servidor

### Almacenamiento externo
- **Cloudinary:** imágenes y videos (covers de eventos, avatares, media de venues, stories)
- **Spotify Web API:** búsqueda de canciones para requests

---

## Módulos de la app

### `src/features/auth`
Autenticación completa con JWT.

- Login email/password
- Registro con verificación OTP por email (flujo en 3 pasos: request → verify → register)
- Google OAuth (via `@react-native-google-signin`)
- Refresh token automático (interceptado por Axios)
- Logout con invalidación del refresh token en el servidor
- Forgot password / Reset password
- Push token registration al hacer login (solo Android)

**Contexto:** `AuthContext` — maneja: `user`, `isAuthenticated`, `isLoading`, funciones de auth, `updateBalance(amount)` para puntos, `refreshSession()` para recargar roles post-upgrade.

---

### `src/features/dashboard`
Pantalla principal de cada rol y gestión de eventos.

**Pantallas:**
- `HomeScreen` — Vista principal del usuario: establecimiento activo, DJ en vivo, acceso a chat, scanner, carrusel de promos
- `BusinessHomeScreen` — Dashboard del organizer: métricas de hoy, cola de pedidos activos con transiciones de estado
- `DjHomeScreen` — Dashboard del DJ: stats de requests, cola de peticiones, toggle de disponibilidad
- `CreateEventScreen` — Formulario para crear evento con fecha, capacidad, venue, cover
- `OrganizerEventsScreen` — Lista de eventos del organizador
- `OrganizerEventDetailScreen` — Detalle de evento: lineup de DJs, estadísticas

**Servicios:**
- `getEvents()` / `getEventById()` — Públicos
- `getMyEvents()` — Solo organizador
- `createEvent()` / `updateEvent()` / `deleteEvent()` — CRUD de eventos
- `enterEvent()` / `leaveEvent()` — Check-in/out manual
- `checkLocation()` — Check-in automático por GPS
- `getEventLineup()` — DJs del evento
- `addDjToLineup()` — Agregar DJ al lineup
- `cleanupEventChat()` — Limpiar chat al finalizar evento
- `getVenueActiveEvent()` — Evento activo de un venue
- `uploadEventCover()` — 🔶 Mock pendiente backend
- `getVenueStats()` / `getEventStats()` — 🔶 Mock pendiente backend

---

### `src/features/chat`
Mensajería en tiempo real con Socket.io.

**Pantallas:**
- `GroupChatScreen` — Chat público del evento (todos los asistentes)
- `SingleChatScreen` — Chat privado 1-a-1 dentro del evento
- `ConnectedUsersScreen` — Lista de usuarios actualmente en el evento

**Componentes:**
- `ChatBubble` — Burbuja de mensaje con estado de entrega/visto
- `ChatInput` — Campo de texto con envío
- `ChatHeader` — Header del chat con info del otro usuario
- `TypingIndicator` — Animación "está escribiendo..."
- `ConnectedUsersCarousel` — Carrusel horizontal de usuarios online
- `EventStoriesCarousel` — Carrusel de stories del evento
- `StoryViewerModal` — Visor fullscreen de stories

**Hooks:**
- `useChat(eventId, currentUserId, otherUserId?)` — Mensajes optimistas, read receipts (delivered/seen), typing throttle, merge socket+history
- `useConnectedUsers(eventId)` — Lista de presencia en tiempo real

**Importante:** El socket es un singleton. No llamar `disconnectSocket()` dentro de un componente. Solo se desconecta en logout.

---

### `src/features/dj`
Gestión del perfil DJ y su dashboard.

**Pantalla:** `DjHomeScreen`
- Stats: requests pendientes / total, progress bar
- Toggle: aceptar/rechazar canciones
- Top 3 requests con botones Accept/Reject
- Broadcast a usuarios del evento *(pendiente backend)*

**Servicios:**
- `getDjs(genre?)` — Lista pública de DJs
- `getDjById(djProfileId)` — Perfil público
- `getMyDjProfile()` — Perfil propio del DJ autenticado
- `getDjFeed()` — Próximos eventos de DJs seguidos
- `getDjGigs()` / `createGig()` / `updateGigStatus()` / `deleteGig()` — CRUD de presentaciones
- `setDjLiveMode(isLive, liveEventId?)` — Activar/desactivar modo en vivo
- `toggleAcceptingRequests(djProfileId, accepting)` — Abrir/cerrar cola de requests
- `followDj()` / `unfollowDj()` — Seguir/dejar de seguir
- `getDjReviews()` / `submitDjReview()` — Reseñas
- `getDjStats()` — Stats de requests 🔶 (solo stats propias son reales, ganancias son mock)
- `generatePromoCode()` / `getDjPromoCodes()` / `getEventPromoCodes()` — Promo codes
- `sendBroadcast()` — 🔶 Mock, pendiente endpoint backend

---

### `src/features/music`
Búsqueda de canciones y song requests.

**Pantalla:** `BeatsScreen`
- Tab "Beats": búsqueda Spotify, precio dinámico por DJ, botón de request
- Tab "DJs": lista de DJs del evento con follow/unfollow y reseñas

**Servicios:**
- `searchTracks(query)` — Spotify Web API (client credentials OAuth)
- `submitSongRequest(eventId, djProfileId, track)` — Pedir canción al DJ
- `getMySongRequests(eventId)` — Mis peticiones
- `getDjSongRequests(djProfileId)` — Cola de peticiones del DJ
- `updateSongRequestStatus(djProfileId, requestId, status)` — Actualizar estado

---

### `src/features/venues`
Gestión de venues y sus productos.

**Pantallas:**
- `CreateVenueScreen` — Formulario: nombre, dirección, coordenadas, radio check-in, auto-evento
- `ProductsManagementScreen` — Lista de productos del venue con acciones CRUD
- `CreateEditProductScreen` — Formulario de producto

**Servicios:**
- `getVenues()` / `getVenueById()` / `getMyVenues()` — Consulta de venues
- `createVenue()` / `updateVenue()` / `deleteVenue()` — CRUD
- `uploadVenueMedia(venueId, fileUri, type)` — Subir imagen/video a Cloudinary
- `getVenueReviews()` / `submitVenueReview()` — Reseñas del venue
- `getVenueActiveEvent()` — Evento activo actual

**Hooks:**
- `useVenueProducts(venueId)` — Productos del venue con CRUD integrado

---

### `src/features/wallet`
Saldo, carrito y órdenes.

**Pantallas:**
- `WalletScreen` — Saldo, Zync Points, top-up, tarjetas de pago
- `CartScreen` — Carrito con items, promo code, Zync Points, checkout
- `OrderHistoryScreen` — Lista de órdenes del usuario
- `OrderDetailScreen` — Detalle de una orden con estado

**Servicios:**
- `getBalance()` — Saldo del wallet ✅
- `topUp(amount)` — Recargar saldo 🔶 Mock
- `createOrder({venueId, eventId, items, promoCode, useZyncPoints})` — Checkout ✅
- `getMyOrders()` / `getOrderById()` — Historial ✅
- `getVenueOrders(venueId, status?)` — Órdenes del venue para fulfillment ✅
- `updateOrderStatus(orderId, status)` — Cambiar estado ✅

**Contexto:** `CartContext` — addToCart, removeFromCart, checkout, activeOrders

---

### `src/features/tickets`
Entradas para eventos con QR.

> ⚠️ **Todo el módulo es mock.** Requiere implementación de backend.

**Pantallas:** Listado de tickets con QR code / Detalle de ticket

**Servicios (todos mock):**
- `purchaseTicket(eventId, price)` — Comprar entrada
- `getMyTickets()` — Mis entradas
- `getTicketById(ticketId)` — Detalle de ticket
- `validateTicket(qrCode, eventId)` — Validar QR (para business scanner)

---

### `src/features/profile`
Gestión del perfil de usuario y sub-perfiles.

**Pantallas:**
- `ProfileScreen` — Vista de perfil con stats, roles, menú de settings
- `EditProfileScreen` — Editar datos básicos
- `CreateDjProfileScreen` / `EditDjProfileScreen` — Perfil DJ
- `CreateOrganizerProfileScreen` / `EditOrganizerProfileScreen` — Perfil organizador
- `ChangePasswordScreen` — Cambiar contraseña
- `NotificationsScreen` — Preferencias de notificaciones
- `PaymentMethodsScreen` — Tarjetas de pago (UI lista, backend pendiente)
- `SecurityScreen` — Seguridad (cambio de contraseña, eliminar cuenta)

**Hook:** `useProfile()` — Único punto de acceso al perfil del usuario. Expone `profile`, `isLoading`, `isSaving`, `updateField()`, `setAvatarUrl()`, `refetch()`.

---

### `src/features/scanner`
Lector QR para entrar a eventos.

> ⚠️ **Solo UI.** La lógica de cámara y parsing de QR no está implementada.

El scanner del usuario sirve para "entrar" a un evento escaneando el QR del venue. El resultado debería ser setear el `currentEstablishment` en `ZyncContext`.

El scanner del business (en `app/(business)/scanner.tsx`) usa la cámara para validar tickets de entrada de los asistentes.

---

### `src/features/stories`
Stories efímeras del evento (tipo Instagram Stories).

**Servicios:**
- `createStory(eventId, fileUri, text?)` — Sube imagen a Cloudinary y crea story
- `getEventStories(eventId)` — Todas las stories del evento
- `getUserStoriesInEvent(eventId, userId)` — Stories de un usuario específico

---

### `src/features/notifications`
Push notifications (solo Android actualmente).

**Servicios:**
- `registerForPushNotifications()` — Pide permiso, obtiene Expo Push Token
- `savePushToken(token)` — Persiste token en el servidor (`PUT /users/push-token`)

Se llama automáticamente al hacer login.

---

## Gestión de estado

```
AuthContext      → usuario autenticado, roles, balance de puntos
RoleContext      → rol activo de navegación (user / dj / business)
ZyncContext      → establecimiento activo (venue/evento donde está el usuario)
CartContext      → items del carrito, órdenes activas
```

**Provider order:** `ZyncProvider → AuthProvider → RoleProvider → CartProvider`

---

## Sistema de puntos (Zync Points)

- El usuario gana **1 punto por cada $1** gastado en órdenes
- Los puntos se pueden canjear como descuento en el checkout (1pt = $1)
- El backend valida y aplica el descuento si `useZyncPoints: true` en la orden
- El saldo de puntos se refleja en `user.zyncPoints` del AuthContext
- Al hacer checkout con puntos, se descuenta localmente con `updateBalance(-discount)`

---

## Sistema de auto-evento

Los venues con `autoEventEnabled: true` se configuran con días de apertura y horarios. El backend tiene un cron que corre cada hora y pre-crea eventos automáticos para los venues que están en horario de apertura. El endpoint `GET /venues/:venueId/active-event` retorna el evento activo (manual tiene prioridad sobre auto).

---

## Design system

Definido en `src/shared/constants/theme.ts`:

| Token | Valor |
|-------|-------|
| Primary (neon) | `#CCFF00` |
| Background | `#0a0a0a` |
| Card | `#161616` |
| Border | `#2a2a2a` |
| Tab bar | `#121212` |
| Error | `#FF0055` |

**Componentes compartidos** (`src/components/`): `NeonButton`, `NeonInput`, `NeonModal`, `CustomTabBar`, `CyberCard`, `ZyncLoader`, `ScreenLayout`, `VideoBackground`, `CollapsingProfileHeader`, `ThemedText`.

---

## Convenciones de desarrollo

- **Path alias:** `@/*` → `src/*`
- **Servicios:** Las pantallas nunca llaman servicios directamente. Usan hooks intermedios.
- **useProfile:** Único hook para acceder al perfil del usuario. No llamar `profile.service.ts` desde screens.
- **Socket:** Singleton en `socket.service.ts`. No desconectar dentro de componentes. Solo en logout.
- **Mocks:** Los servicios mock tienen comentario `// TODO: replace mock →` con el endpoint real.
- **Roles backend vs app:** Backend tiene `USER`, `DJ`, `ORGANIZER`, `STAFF`. La app mapea a tres navegaciones: `user` → `(tabs)`, `dj` → `(business)`, `business` → `(business)`.

---

## Estado actual del producto

| Módulo | Estado |
|--------|--------|
| Auth (email + Google) | ✅ Completo |
| Chat (público y privado) | ✅ Completo |
| Song requests | ✅ Completo |
| Perfiles (user, DJ, organizer) | ✅ Completo |
| Venues y productos | ✅ Completo |
| Órdenes | ✅ Completo |
| Stories | ✅ Básico (viewer limitado) |
| Push notifications | ✅ Android |
| Wallet top-up | 🔶 Mock |
| Tickets | 🔶 Todo mock |
| Stats (venue, evento, usuario) | 🔶 Mock |
| Scanner QR (usuario) | ❌ Sin lógica de cámara |
| Broadcast DJ | ❌ Endpoint pendiente |
| Conversations list (chat) | ❌ Sin implementar |
