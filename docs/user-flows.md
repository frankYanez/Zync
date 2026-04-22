# Zync Mobile — Flujos de usuario

> Este documento describe los flujos principales de cada rol desde la perspectiva funcional y técnica.

---

## Flujos transversales

### Autenticación y registro

```
[Register]
  Formulario (nombre, email, contraseña)
    → POST /email/request          (envía OTP al email)
    → Modal verificación 6 dígitos
    → POST /email/verify           (valida OTP)
    → POST /auth/register          (crea cuenta)
    → Redirect a login

[Login]
  Formulario (email, contraseña)
    → POST /auth/login             (devuelve accessToken + refreshToken)
    → Guardar tokens en SecureStore / localStorage
    → useProtectedRoute detecta rol → redirect al grupo correcto
```

**Token refresh**: cuando una petición devuelve 401, `getAuthHeaders()` llama a `refreshToken()` automáticamente antes de reintentar.

### Cambio de rol en runtime

```
Perfil → RoleSelector
  → switchRole(nuevoRol)            [RoleContext]
  → useProtectedRoute re-evalúa
  → Expo Router redirige al grupo correspondiente
    user      → (tabs)
    dj/business → (business)
```

Para activar el rol `dj`, el usuario debe crear primero su perfil artístico (`app/profile/create-dj.tsx`).  
Para `business`, debe crear su perfil de organizador (`app/profile/create-organizer.tsx`).

### Socket.io — ciclo de vida de conexión

```
Login exitoso
  → socket.connect() con JWT en auth
  → Al entrar a un evento: emit join-event (eventId)
    → Servidor une al usuario a la sala del evento
    → on: event-message (historial + nuevos mensajes)
    → on: presence:list (usuarios online)

Al salir del evento: emit leave-event (eventId)
Al cerrar sesión: socket.disconnect()
```

---

## Rol: User (Asistente)

### Onboarding completo

```
Splash → (auth)/login
  → Login exitoso → (tabs)/index (Home)
```

### Home — Feed principal

**Pantalla**: `app/(tabs)/index.tsx`

1. `ZyncContext` provee el venue activo seleccionado
2. Se muestra indicador live/offline del venue
3. Si hay órdenes activas → `LiveOrderBanner` con contador de pendientes
4. Si hay DJ en vivo → botón de chat con el DJ
5. Carrusel de promociones del venue
6. Botón QR Scanner con efecto pulse

### Beats — Solicitar canciones al DJ

**Pantalla**: `app/(tabs)/beats.tsx`

```
Input de búsqueda (debounce 500ms)
  → GET Spotify /search?q={query}&type=track
  → Lista de tracks con artwork, título, artista
  → Tap en "PEDIR $250"
    → Validar saldo suficiente
    → POST /song-requests
    → Estado: PENDING → ACCEPTED/REJECTED
    → on socket: song_request:updated → actualizar UI
```

El precio por canción lo define el DJ en su perfil (`pricePerSong`).

### Wallet — Billetera y pagos

**Pantalla**: `app/(tabs)/wallet.tsx`

- Muestra saldo actual y Zync Points acumulados
- Recarga rápida: $10 / $50 / $100 (UI implementada, `topUp` es mock)
- Tarjetas de pago en carrusel (UI implementada)

### Carrito y checkout

**Pantalla**: `src/features/wallet/screens/CartScreen.tsx`

```
Agregar producto al carrito
  → CartContext.addItem(producto, cantidad)
  → Abrir carrito
    → Input código promo → POST /promo-codes/redeem
    → Toggle Zync Points (1 punto = $1 de descuento)
    → Ver subtotal, descuento, total
    → Tap PAY
      → POST /orders (checkout)
      → Éxito: TicketCard con ID de orden + acumulación de puntos
      → Error: mensaje + opción de reintentar
```

### Tickets

**Pantalla**: `app/tickets/index.tsx` y `app/tickets/[id].tsx`

> Actualmente mock-only. El flujo completo estará disponible cuando `ticket.service.ts` se conecte al backend.

```
Lista de tickets del usuario
  → Tap en ticket → detalle con QR code
  → QR contiene ID de ticket para validación por el venue
```

### Chat

**Chat grupal**: `src/features/chat/screens/GroupChatScreen.tsx`

```
Entrar al evento
  → emit join-event (eventId)
  → GET /events/:id/messages (historial)
  → on: event-message → renderizar mensajes
  → on: presence:list → carrusel de usuarios online
  → emit send-event-message → nuevo mensaje
  → Indicador de escritura: emit typing / on: onTyping
```

**Chat privado**: `src/features/chat/screens/SingleChatScreen.tsx`

```
Desde ConnectedUsersScreen: tap en usuario
  → GET /chat/messages (historial de conversación)
  → emit send-message (toUserId, content)
  → on: new-message → renderizar
  → on: message-delivered / message-seen → actualizar estado
```

### Perfil de usuario

**Pantalla**: `app/(tabs)/profile.tsx`

- Ver estadísticas: órdenes, total gastado, tier (bronze/silver/gold)
- Editar perfil básico → `app/profile/edit.tsx` → PATCH `/users/me/profile`
- Cambiar contraseña → `app/profile/change-password.tsx`
- Crear perfil DJ → `app/profile/create-dj.tsx`
- Crear perfil Organizador → `app/profile/create-organizer.tsx`

---

## Rol: DJ (Artista)

### Acceso inicial

```
Login → useProtectedRoute detecta rol dj → (business)
```

### Home — Dashboard DJ

**Pantalla**: `app/(business)/index.tsx`

- Métricas obtenidas via `useDjStats(djProfileId)`
- Estadísticas de song requests por estado (pendientes, aceptadas, tocadas)

### Song Requests

**Pantalla**: `app/(business)/requests.tsx`

```
useSongRequests() → GET /dj/:id/requests
  → Tabs: PENDING / ACCEPTED / HISTORY
  → Tap en request
    → updateStatus(requestId, 'ACCEPTED' | 'PLAYED' | 'REJECTED')
    → PATCH /song-requests/:id/status
    → Socket emite: song_request:updated → User recibe actualización
```

### Gigs

**Pantalla**: `app/(business)/dj/gigs.tsx`

```
useDjGigs(djProfileId) → GET /dj/:id/gigs
  → Lista de actuaciones: nombre del evento, fecha, horario
  → Botón de refresh manual
```

### Códigos Promocionales

**Pantalla**: `app/(business)/dj/promo-codes.tsx`

```
useDjPromoCodes() → GET /dj/:id/promo-codes
  → Lista: código, evento, usos, fecha
  → Botón "+" → modal selector de evento
    → createPromoCode(eventId) → POST /dj/promo-codes
    → Nuevo código generado en uppercase
```

### Perfil DJ

**Pantalla**: `app/(business)/profile.tsx`

- Banner + logo con opción de cambio via `expo-image-picker`
- Estadísticas: número de gigs, precio por canción
- Géneros como chips, bio, links sociales
- Acceso a: Ver perfil público (`app/dj/[id].tsx`), Editar perfil DJ, Mis Gigs, Códigos Promo

**Edición**: `app/profile/edit-dj.tsx`

```
Cargar perfil existente → GET /dj/me
  → Editar campos (artistName, genres, pricePerSong, bio, ciudad, links)
  → Subir logo → POST /dj/logo (FormData multipart)
  → Subir banner → POST /dj/banner (FormData multipart)
  → Guardar → PATCH /dj/:id
```

---

## Rol: Business (Venue / Organizador)

### Acceso inicial

```
Login → useProtectedRoute detecta rol business → (business)
```

### Home — Dashboard Business

**Pantalla**: `app/(business)/index.tsx` (`BusinessHomeScreen`)

- Métricas del venue: total de órdenes, ingresos
- Lista de órdenes pendientes en vivo
- Socket: on `order:new` → nueva orden aparece en tiempo real
- Socket: on `order:status_update` → actualizar estado de orden

### Gestión de Lineup

**Pantalla**: `app/(business)/events/lineup.tsx`

```
Selector horizontal de eventos activos
  → GET /events?venueId=...
  → Lista de DJs disponibles → GET /dj
  → Tap "Agregar" → POST /events/:id/lineup { djProfileId }
```

### Productos

**Pantalla**: `app/(business)/products.tsx`

```
GET /venues/:id/products
  → Lista de productos con precio, categoría, disponibilidad
  → (Gestión completa: pendiente de desarrollo)
```

### Scanner QR (Business)

**Pantalla**: `app/(business)/scanner.tsx`

```
Escanear QR de ticket o pago
  → Validar ticket: POST /tickets/validate { qrData }
  → Respuesta: usuario, evento, estado del ticket
  → (Integración completa: en progreso)
```

### Orders

**Pantalla**: `app/(business)/orders.tsx`

```
GET /venues/:id/orders
  → Lista de órdenes con estado: PENDING / CONFIRMED / READY / DELIVERED / CANCELLED
  → Tap en orden → cambiar estado
```

---

## Flujo de contenido: Stories

```
Asistente en evento
  → Tap en "+" en carrusel de historias
  → expo-image-picker → seleccionar media
  → POST /stories (FormData multipart)
    → Cloudinary sube el archivo
    → Historia queda disponible por tiempo limitado (expiresAt)
  → Visible en carrusel del chat grupal del evento
```

---

## Notas de implementación

- Los flujos de **tickets** están completamente mockeados; el QR se genera localmente.
- El flujo de **wallet top-up** (recarga de saldo) está mockeado en `wallet.service.ts`.
- El **tier de usuario** (bronze/silver/gold) en perfil es mock; endpoint real pendiente.
- Los eventos de socket `order:new` y `order:status_update` están implementados y son funcionales.
