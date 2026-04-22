# Zync API — Referencia para Frontend

Base URL: `http://<HOST>:3000`
Swagger interactivo: `http://<HOST>:3000/api/docs`

Todos los endpoints que requieren autenticación esperan el header:
```
Authorization: Bearer <accessToken>
```

---

## Flujo de registro

El registro requiere verificar el email antes de crear la cuenta:

```
1. POST /email/request   → envía OTP al email
2. POST /email/verify    → valida el OTP (devuelve confirmación)
3. POST /auth/register   → crea la cuenta (requiere email ya verificado)
```

---

## Email

### `POST /email/request`
Solicitar OTP de verificación.

**Body:**
```json
{ "email": "gonza@mail.com", "locale": "es-AR" }
```
`locale` es opcional (default: `"es-AR"`).

### `POST /email/resend`
Reenviar OTP (mismo body que request).

### `POST /email/verify`
Verificar OTP recibido.

**Body:**
```json
{ "email": "gonza@mail.com", "otp": "123456" }
```

---

## Auth

### `POST /auth/register`
Crear cuenta (el email debe estar verificado primero).

**Body:**
```json
{
  "email": "gonza@mail.com",
  "password": "mipass123",
  "firstName": "Gonzalo",
  "lastName": "García"
}
```
**Response:**
```json
{ "createdAt": "2026-03-17T..." }
```

### `POST /auth/login`
**Body:**
```json
{ "email": "gonza@mail.com", "password": "mipass123" }
```
**Response:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### `POST /auth/refresh`
Renovar access token.
**Body:**
```json
{ "refreshToken": "eyJ..." }
```
**Response:** mismo formato que login.

### `GET /auth/me` 🔒
Retorna el usuario autenticado del JWT.

### `POST /auth/google`
Login o registro con Google OAuth.

**Body:**
```json
{ "accessToken": "ya29.a0..." }
```
**Response:** mismo formato que login (`accessToken`, `refreshToken`, `user`).

### `POST /auth/logout` 🔒
Cerrar sesión e invalidar el refresh token en el servidor.

**Body:**
```json
{ "refreshToken": "eyJ..." }
```
**Response:** `{ "success": true }`

**Errores:**
- `401 INVALID_REFRESH_TOKEN` — token no encontrado o ya revocado

### `POST /auth/forgot-password`
**Body:** `{ "email": "..." }`

### `POST /auth/reset-password`
**Body:** `{ "email": "...", "otp": "123456", "newPassword": "..." }`

---

## Users

### `GET /users`
Lista todos los usuarios (público).

### `GET /users/:id/profile`
Perfil público de un usuario. Incluye `zyncPoints` (puntos acumulados del usuario).

### `PATCH /users/profile` 🔒
Actualizar nombre, apellido, etc.
**Body:** `{ "firstName"?: "...", "lastName"?: "..." }`

### `POST /users/me/avatar` 🔒
Subir foto de perfil. `multipart/form-data`, campo `file` (JPEG/PNG/WebP, máx 5 MB).

**Response:**
```json
{ "avatarUrl": "https://res.cloudinary.com/..." }
```

### `DELETE /users/me` 🔒
Eliminar cuenta (soft-delete).

### `POST /users/me/change-password` 🔒
**Body:**
```json
{ "oldPassword": "...", "newPassword": "..." }
```

### `PUT /users/push-token` 🔒
Registrar token push de Expo para notificaciones.
**Body:** `{ "pushToken": "ExponentPushToken[...]" }`

### `GET /users/me/preferences` 🔒
Retorna preferencias del usuario.
**Response:**
```json
{
  "receiveEmailNotifications": true,
  "receivePushNotifications": true,
  "language": "es",
  "themeMode": "system"
}
```

### `PATCH /users/me/preferences` 🔒
**Body (todos opcionales):**
```json
{
  "receiveEmailNotifications": false,
  "receivePushNotifications": true,
  "language": "en",
  "themeMode": "dark"
}
```
`themeMode` válidos: `"light"`, `"dark"`, `"system"`

---

## DJ Profile

Rutas bajo `/users/me/dj-profile` 🔒 (todas requieren auth)

### `POST /users/me/dj-profile`
Crear perfil DJ (asigna el rol `DJ` al usuario automáticamente).

**Body:**
```json
{
  "artistName": "DJ Gonza",
  "genres": ["Techno", "House"],
  "pricePerSong": 100.0,
  "soundcloudUrl": "https://soundcloud.com/djgonza",
  "spotifyUrl": "https://open.spotify.com/artist/...",
  "instagramUrl": "https://instagram.com/djgonza"
}
```

### `PATCH /users/me/dj-profile`
Actualizar info del perfil DJ (todos los campos opcionales).

**Body (todos opcionales):**
```json
{
  "artistName": "...",
  "genres": ["Techno"],
  "pricePerSong": 150.0,
  "bio": "Techno DJ de Buenos Aires, 10+ años.",
  "city": "Buenos Aires",
  "soundcloudUrl": "...",
  "spotifyUrl": "...",
  "instagramUrl": "..."
}
```

### `PATCH /users/me/dj-profile/logo`
Subir logo del DJ. `multipart/form-data`, campo `file`.
**Response:** `{ "logoUrl": "https://..." }`

### `PATCH /users/me/dj-profile/banner`
Subir banner del DJ. `multipart/form-data`, campo `file`.
**Response:** `{ "bannerUrl": "https://..." }`

---

## Organizer Profile

### `POST /users/me/organizer-profile` 🔒
Crear perfil organizador (asigna rol `ORGANIZER`).
**Body:** `{ "companyName": "...", "contactEmail": "..." }`

### `PATCH /users/me/organizer-profile` 🔒
Actualizar perfil organizador (mismo body).

---

## Venues

### `GET /venues/timezones`
Lista los timezones IANA soportados para configurar en un venue. Actualmente devuelve todos los de Argentina (`America/Argentina/*`).

**Response:** `["America/Argentina/Buenos_Aires", "America/Argentina/Cordoba", ...]`

---

### `GET /venues`
Lista todos los venues (público). Cada venue incluye `imageUrl` y `videoUrl` si fueron subidos.

### `GET /venues/my-venues` 🔒
Venues del usuario autenticado.

### `POST /venues` 🔒 (solo ORGANIZER)
**Body:**
```json
{
  "name": "Club Niceto",
  "address": "Niceto Vega 5510, CABA",
  "description": "Club de techno",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "radius": 100,
  "autoEventEnabled": true,
  "openDays": ["wednesday", "thursday", "friday", "saturday", "sunday"],
  "openTime": "19:00",
  "closeTime": "01:00",
  "timezone": "America/Argentina/Buenos_Aires"
}
```

Todos los campos son opcionales excepto `name` y `address`.

**Auto-evento (`autoEventEnabled`):** cuando está en `true` y se configuran `openDays`, `openTime` y `closeTime`, el endpoint `GET /venues/:venueId/active-event` crea automáticamente un evento con el nombre del venue si el horario corresponde. Un evento manual activo siempre tiene prioridad.

- `openDays`: array de nombres de días en inglés. Valores válidos: `sunday`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`.
- `openTime` / `closeTime`: formato `HH:MM` en **hora local del venue**. Si `closeTime < openTime`, se interpreta como cruce de medianoche (ej: 22:00 → 02:00).
- `timezone`: timezone IANA del venue (ej: `"America/Argentina/Buenos_Aires"`, `"America/Bogota"`). Default: `"America/Argentina/Buenos_Aires"`. Se usa para calcular correctamente `startsAt`/`endsAt` en UTC y determinar el día de apertura.

### `PATCH /venues/:venueId` 🔒 (solo el dueño)
**Body:** igual que POST, todos opcionales.

### `DELETE /venues/:venueId` 🔒 (solo el dueño)
**Response:** `{ "ok": true }`

---

## Events

### `GET /events`
Lista eventos con paginación.

**Query params:**
- `skip` (number, opcional)
- `take` (number, opcional)

**Response:** array de eventos con venue incluido.

### `GET /events/:eventId`
Detalle de un evento.

**Response:**
```json
{
  "id": "uuid",
  "name": "Noche Techno",
  "startsAt": "2026-03-20T22:00:00Z",
  "endsAt": "2026-03-21T05:00:00Z",
  "isActive": true,
  "imageUrl": "https://res.cloudinary.com/...",
  "capacity": 300,
  "organizerId": "uuid",
  "venueId": "uuid",
  "venue": { "id": "...", "name": "Club Niceto", "address": "..." }
}
```

### `POST /events` 🔒 (solo ORGANIZER)
Crear evento. Si el evento pertenece a un venue (`venueId`) y ese venue tiene otro evento activo, el evento anterior se desactiva automáticamente — nunca puede haber dos eventos activos en el mismo venue.

**Body:**
```json
{
  "name": "Noche Techno",
  "startsAt": "2026-03-20T22:00:00.000Z",
  "endsAt": "2026-03-21T05:00:00.000Z",
  "venueId": "uuid-del-venue",
  "imageUrl": "https://res.cloudinary.com/...",
  "capacity": 300,
  "latitude": -34.6037,
  "longitude": -58.3816,
  "radius": 200
}
```
Todos los campos son opcionales excepto `name`, `startsAt` y `endsAt`.

- `latitude`, `longitude`, `radius`: solo para eventos **sin venue** (ej: fiesta en un parque). Si el evento tiene venue, se usan las coordenadas del venue para el check-in.

### `POST /events/:eventId/enter` 🔒
Ingresar manualmente a un evento. Si el evento tiene `capacity` definida y está lleno, retorna `403`.

**Response:** `{ "ok": true }`

### `POST /events/:eventId/leave` 🔒
Salir manualmente de un evento.

**Response:** `{ "ok": true }`

### `GET /events/:eventId/lineup`
Ver el lineup de DJs oficiales del evento.

**Response:**
```json
[
  {
    "userId": "uuid",
    "djProfileId": "uuid",
    "artistName": "DJ Gonza",
    "pricePerSong": "500.00",
    "genres": ["Techno", "House"],
    "logoUrl": "https://...",
    "bio": "...",
    "city": "Buenos Aires",
    "instagramUrl": "https://...",
    "spotifyUrl": "https://...",
    "soundcloudUrl": "https://...",
    "isLive": false,
    "assignedAt": "2026-03-18T..."
  }
]
```

### `POST /events/check-location` 🔒
Check-in/out automático por geolocalización. Compara la posición del usuario con todos los eventos activos. Prioridad de coordenadas: venue del evento → coordenadas propias del evento. Radio default: 100 m.

**Body:**
```json
{ "latitude": -34.6037, "longitude": -58.3816 }
```

**Response:**
```json
[
  { "eventId": "uuid", "eventName": "Noche Techno", "action": "entered" },
  { "eventId": "uuid", "eventName": "Otro Evento", "action": "none" }
]
```
`action` puede ser `"entered"`, `"left"` o `"none"`.

---

## Promo Codes

### `POST /events/:eventId/djs/:djProfileId/promo-codes` 🔒 (solo ORGANIZER)
Crear código promocional para un DJ en un evento.

**Body:**
```json
{
  "type": "DRINK",
  "discountType": "FREE",
  "discountValue": null,
  "description": "Trago gratis en la barra principal",
  "maxUses": 100,
  "expiresAt": "2026-04-01T05:00:00.000Z"
}
```

- `type`: `"DRINK"` | `"ENTRY"` | `"MERCH"` | `"OTHER"`
- `discountType`: `"PERCENTAGE"` | `"FIXED"` | `"FREE"`
- `discountValue`: número si es PERCENTAGE o FIXED, `null` si es FREE
- `expiresAt`: opcional

### `GET /events/:eventId/djs/:djProfileId/promo-codes` 🔒 (solo ORGANIZER)
Ver todos los códigos de un DJ en un evento.

### `GET /dj/:djProfileId/promo-codes` 🔒 (solo el propio DJ)
Ver mis códigos promocionales con stats de uso.

### `POST /dj/promo-codes/:code/redeem` 🔒
Canjear un código. Falla si: ya fue usado por este usuario, superó `maxUses`, el evento terminó, o venció (`expiresAt`).

---

## DJ

### `GET /dj`
Lista todos los perfiles DJ.

**Query params:**
- `genre` (string, opcional): filtrar por género musical

### `GET /dj/:djProfileId`
Obtener perfil público de un DJ por su `djProfileId` (UUID del DjProfile, no del usuario).

**Response:** objeto con todos los campos del perfil DJ (artistName, genres, pricePerSong, bio, city, logoUrl, bannerUrl, spotifyUrl, soundcloudUrl, instagramUrl, **followersCount**, **isLive**, **liveEventId**, **acceptingRequests**).

**Errores:**
- `404 DJ_PROFILE_NOT_FOUND`

### `GET /dj/feed` 🔒
Próximos eventos de los DJs que sigue el usuario autenticado.

**Response:**
```json
[
  {
    "dj": {
      "id": "uuid",
      "artistName": "DJ Gonza",
      "logoUrl": "https://...",
      "userId": "uuid"
    },
    "event": {
      "id": "uuid",
      "name": "Noche Techno",
      "imageUrl": "https://...",
      "startsAt": "2026-03-20T22:00:00Z",
      "endsAt": "2026-03-21T05:00:00Z",
      "capacity": 300,
      "venue": { "id": "uuid", "name": "Club Niceto", "address": "..." }
    }
  }
]
```

### `GET /dj/:djProfileId/gigs`
Próximos eventos de un DJ.

### `POST /dj/:djProfileId/follow` 🔒
Seguir a un DJ.

### `DELETE /dj/:djProfileId/follow` 🔒
Dejar de seguir a un DJ.

### `POST /dj/:djProfileId/events/:eventId/lineup` 🔒 (solo ORGANIZER)
Agregar un DJ al lineup de un evento.

### `POST /dj/:djProfileId/events/:eventId/reviews` 🔒
Dejar una reseña de un DJ. Solo disponible cuando el evento terminó (`isActive = false`) y el usuario asistió al evento. Una sola reseña por usuario por evento.

**Body:**
```json
{
  "score": 5,
  "comment": "Tremendo set, mucha energía"
}
```
- `score`: entero del 1 al 5 — requerido
- `comment`: texto libre — opcional

**Response:**
```json
{ "id": "uuid" }
```

**Errores posibles:**
- `403 REVIEW_EVENT_STILL_ACTIVE` — el evento todavía no terminó
- `403 REVIEW_USER_NOT_ATTENDEE` — el usuario no asistió al evento
- `404 DJ_PROFILE_NOT_FOUND` — perfil DJ no encontrado
- `404 EVENT_NOT_FOUND` — evento no encontrado
- `409 REVIEW_ALREADY_EXISTS` — ya dejaste una reseña para este DJ en este evento

### `PATCH /dj/me/live` 🔒 (solo DJ)
Activar o desactivar el modo en vivo. El DJ lo activa manualmente cuando empieza a tocar.

**Body:**
```json
{ "isLive": true, "liveEventId": "uuid" }
```
- `liveEventId`: opcional. ID del evento donde está tocando.
- Para desactivar: `{ "isLive": false }`

**Response:** `{ "isLive": true, "liveEventId": "uuid" }`

**Errores:**
- `404 DJ_PROFILE_NOT_FOUND`

### `GET /dj/:djProfileId/stats` 🔒 (solo el propio DJ)
Estadísticas de song requests del DJ.

**Response:**
```json
{
  "totalRequests": 120,
  "pendingRequests": 5,
  "acceptedRequests": 80,
  "rejectedRequests": 20,
  "playedRequests": 15
}
```

### `PATCH /dj/:djProfileId` 🔒 (solo el propio DJ)
Actualizar campos del perfil DJ (actualmente `acceptingRequests`).

**Body:**
```json
{ "acceptingRequests": false }
```

### `GET /dj/:djProfileId/song-requests` 🔒 (solo el propio DJ)
Cola de song requests recibidas.

**Query params:**
- `status` (opcional): `PENDING` | `ACCEPTED` | `REJECTED` | `PLAYED`

**Response:**
```json
[
  {
    "id": "uuid",
    "trackId": "spotify:track:...",
    "trackName": "Levels",
    "artistName": "Avicii",
    "albumArt": "https://...",
    "pricePaid": "500.00",
    "status": "PENDING",
    "createdAt": "2026-03-23T...",
    "user": { "id": "uuid", "firstName": "Gonza", "lastName": "García", "avatarUrl": "https://..." }
  }
]
```

### `PATCH /dj/:djProfileId/song-requests/:requestId` 🔒 (solo el propio DJ)
Actualizar estado de una song request.

**Body:**
```json
{ "status": "ACCEPTED" }
```
`status`: `"ACCEPTED"` | `"REJECTED"` | `"PLAYED"`

Al cambiar estado se emite socket `song_request:updated` al usuario que pidió la canción.

### `GET /dj/:djProfileId/reviews`
Obtener todas las reseñas de un DJ con su promedio y total.

**Response:**
```json
{
  "stats": {
    "averageScore": 4.7,
    "totalReviews": 143
  },
  "reviews": [
    {
      "id": "uuid",
      "eventId": "uuid",
      "userId": "uuid",
      "score": 5,
      "comment": "Tremendo set",
      "createdAt": "2026-03-17T..."
    }
  ]
}
```

---

## Venues — Media y Reseñas

### `POST /venues/:venueId/media` 🔒 (solo el dueño)
Subir imagen o video del venue a Cloudinary. `multipart/form-data`.

**Query params:**
- `type`: `"image"` (default) | `"video"`

**Campos:**
- `file`: archivo de imagen o video — requerido

**Response:** `{ "url": "https://res.cloudinary.com/..." }`

**Errores:**
- `403 NOT_VENUE_OWNER`
- `404 VENUE_NOT_FOUND`

### `POST /venues/:venueId/reviews` 🔒
Dejar una reseña del venue. Un solo review por usuario.

**Body:**
```json
{ "score": 5, "comment": "Excelente lugar" }
```
- `score`: entero del 1 al 5 — requerido
- `comment`: opcional

**Response:** `{ "id": "uuid" }`

**Errores:**
- `404 VENUE_NOT_FOUND`
- `409 VENUE_REVIEW_ALREADY_EXISTS`

### `GET /venues/:venueId/active-event`
Devuelve el evento activo del venue o `null` si no hay ninguno.

Los eventos automáticos se pre-crean via cron cada hora para todos los venues con `autoEventEnabled: true`. El cron corre cada hora para soportar cualquier timezone. Este endpoint solo consulta — no crea.

Lógica de prioridad:
1. Si hay un evento manual activo (`isAutoGenerated: false`) → lo devuelve.
2. Si hay un evento automático activo para hoy → lo devuelve.
3. Sin evento activo → devuelve `null`.

**Response:** objeto evento o `null`.

### `GET /venues/:venueId/orders?status=` 🔒 (solo dueño del venue)
Pedidos del venue para gestión (fulfillment).

**Query params:**
- `status` (opcional): `PENDING` | `CONFIRMED` | `READY` | `DELIVERED` | `CANCELLED`

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "PENDING",
    "total": "2400.00",
    "createdAt": "2026-03-23T...",
    "user": { "id": "uuid", "firstName": "Gonza", "lastName": "García", "avatarUrl": "https://..." },
    "items": [
      { "quantity": 2, "unitPrice": "1200.00", "product": { "id": "uuid", "name": "Gin Tonic" } }
    ]
  }
]
```

### `GET /venues/:venueId/reviews`
Reseñas y promedio de un venue.

**Response:**
```json
{
  "stats": { "averageScore": 4.3, "totalReviews": 28 },
  "reviews": [
    { "id": "uuid", "userId": "uuid", "score": 5, "comment": "Muy bueno", "createdAt": "..." }
  ]
}
```

---

## Venue Products

### `GET /venues/:venueId/products?category=`
Listar productos disponibles del venue (público).

**Query params:**
- `category` (opcional): filtrar por categoría (ej. `"Tragos"`, `"Comida"`)


**Response:**
```json
[
  {
    "id": "uuid",
    "venueId": "uuid",
    "name": "Gin Tonic",
    "description": "Hendrick's con agua tónica",
    "price": "1200.00",
    "imageUrl": "https://...",
    "category": "Tragos",
    "isAvailable": true,
    "createdAt": "2026-03-19T...",
    "updatedAt": "2026-03-19T..."
  }
]
```

### `POST /venues/:venueId/products` 🔒 (solo el dueño del venue)
Crear un producto en el menú del venue.

**Body:**
```json
{
  "name": "Gin Tonic",
  "description": "Hendrick's con agua tónica",
  "price": 1200,
  "category": "Tragos"
}
```
- `description`, `category` son opcionales.
- Para la imagen del producto usar `PATCH /venues/:venueId/products/:productId/image`.

**Errores:**
- `403 NOT_VENUE_OWNER` — no sos el dueño
- `404 VENUE_NOT_FOUND` — venue no encontrado

### `PATCH /venues/:venueId/products/:productId` 🔒 (solo el dueño)
Actualizar un producto. Todos los campos son opcionales.

**Body:** igual que POST + `"isAvailable": false` para pausar el producto.

### `PATCH /venues/:venueId/products/:productId/image` 🔒 (solo el dueño)
Subir imagen del producto. `multipart/form-data`, campo `file` (JPEG/PNG/WebP, máx 5 MB).

**Response:** `{ "imageUrl": "https://res.cloudinary.com/..." }`

**Errores:**
- `403 NOT_VENUE_OWNER`
- `404 VENUE_PRODUCT_NOT_FOUND`

### `DELETE /venues/:venueId/products/:productId` 🔒 (solo el dueño)
Eliminar un producto del menú.

**Response:** `{ "ok": true }`

**Errores:**
- `403 NOT_VENUE_OWNER`
- `404 VENUE_PRODUCT_NOT_FOUND`

---

## Orders

### `POST /orders` 🔒
Crear una orden (checkout del carrito).

**Body:**
```json
{
  "venueId": "uuid",
  "eventId": "uuid",
  "items": [
    { "productId": "uuid", "quantity": 2 },
    { "productId": "uuid", "quantity": 1 }
  ],
  "promoCode": "PROMO123",
  "useZyncPoints": false
}
```
- `eventId`, `promoCode`, `useZyncPoints` son opcionales.
- Si `useZyncPoints: true` y el usuario no tiene puntos suficientes, retorna `400 INSUFFICIENT_ZYNC_POINTS`.
- El usuario gana 1 Zync Point por cada $1 del total pagado.

**Response:** objeto de la orden creada con sus items y productos.

**Errores:**
- `400 VENUE_PRODUCT_NOT_AVAILABLE` — producto no disponible
- `400 INSUFFICIENT_ZYNC_POINTS` — puntos insuficientes
- `404 VENUE_PRODUCT_NOT_FOUND` — producto no encontrado

### `GET /orders/me` 🔒
Mis órdenes ordenadas por fecha descendente, con items y productos incluidos.

### `GET /orders/:orderId` 🔒
Detalle de una orden. Solo retorna la orden si pertenece al usuario autenticado.

**Errores:**
- `404 ORDER_NOT_FOUND`

### `PATCH /orders/:orderId/status` 🔒
Actualizar el estado de una orden.

**Body:**
```json
{ "status": "CANCELLED" }
```

- `status`: `"PENDING"` | `"CONFIRMED"` | `"READY"` | `"DELIVERED"` | `"CANCELLED"`
- **Usuario** solo puede pasar a `CANCELLED` (su propia orden).
- **Dueño del venue** puede pasar a `CONFIRMED`, `READY` o `DELIVERED`.
- Al cambiar estado se emite socket `order:status_update` al usuario.

**Response:** orden actualizada con items y productos.

**Errores:**
- `403 ORDER_FORBIDDEN` — no tenés permiso para este cambio de estado
- `404 ORDER_NOT_FOUND`

---

## Stories

### `POST /stories` 🔒
Crear historia en un evento. `multipart/form-data`.

**Campos:**
- `file`: imagen (JPEG/PNG/WebP, máx 5 MB) o video (máx 50 MB) — requerido
- `eventId`: UUID del evento — requerido
- `text`: texto opcional (máx 200 caracteres)

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "eventId": "uuid",
  "mediaUrl": "https://...",
  "mediaType": "image",
  "text": "Disfrutando el evento 🔥",
  "createdAt": "2026-03-17T...",
  "expiresAt": "2026-03-18T...",
  "viewCount": 0,
  "seenByViewer": false,
  "isDjStory": false
}
```

### `DELETE /stories/:storyId` 🔒
Eliminar historia propia antes de que expire. Solo el autor puede eliminarla.

**Response:** `204 No Content`

**Errores:**
- `403 STORY_NOT_OWNED` — no sos el autor de la historia
- `404 STORY_NOT_FOUND` — historia no encontrada

### `POST /stories/:storyId/seen` 🔒
Marcar historia como vista. El viewer debe ser participante del evento. Idempotente.

**Response:** `204 No Content`

**Errores:**
- `403 USER_NOT_EVENT_PARTICIPANT` — no pertenecés al evento
- `404 STORY_NOT_FOUND` — historia no encontrada

### `GET /stories/events/:eventId/stories` 🔒
Ver todas las historias activas de un evento (no expiradas). DJs primero.

### `GET /stories/events/:eventId/users/:userId/stories` 🔒
Ver historias activas de un usuario específico en un evento.

---

## Tickets

### `GET /events/:eventId/ticket-types`
Listar los tipos de ticket de un evento (público).

**Response:**
```json
[
  {
    "id": "uuid",
    "eventId": "uuid",
    "name": "General",
    "description": "Entrada general",
    "price": "2500.00",
    "capacity": 200,
    "soldCount": 45,
    "saleStartAt": "2026-04-15T18:00:00Z",
    "saleEndAt": "2026-04-20T22:00:00Z",
    "isActive": true,
    "createdAt": "2026-04-10T..."
  }
]
```

### `POST /events/:eventId/ticket-types` 🔒 (solo ORGANIZER)
Crear un tipo de ticket para un evento.

**Body:**
```json
{
  "name": "VIP",
  "description": "Acceso VIP con barra libre",
  "price": 5000,
  "capacity": 50,
  "saleStartAt": "2026-04-15T18:00:00Z",
  "saleEndAt": "2026-04-20T22:00:00Z"
}
```
- `description`, `capacity`, `saleStartAt`, `saleEndAt` son opcionales.
- `capacity: null` = sin límite.

### `PATCH /events/:eventId/ticket-types/:ticketTypeId` 🔒 (solo ORGANIZER)
Actualizar tipo de ticket. Todos los campos opcionales, igual que el POST.

### `DELETE /events/:eventId/ticket-types/:ticketTypeId` 🔒 (solo ORGANIZER)
Eliminar tipo de ticket.
**Response:** `204 No Content`

**Errores:**
- `404 TICKET_TYPE_NOT_FOUND`

---

### `POST /tickets/purchase` 🔒
Comprar un ticket.

**Body:**
```json
{ "ticketTypeId": "uuid" }
```

**Response:** objeto del ticket creado con `qrToken`, `status`, `pricePaid`, `ticketType` y `event` incluidos.

**Errores:**
- `404 TICKET_TYPE_NOT_FOUND` — tipo de ticket no encontrado o inactivo
- `409 TICKET_TYPE_FULL` — sin capacidad disponible
- `409 TICKET_TYPE_SALE_CLOSED` — la venta no está abierta

### `GET /tickets/me` 🔒
Mis tickets ordenados por fecha descendente, con `ticketType` y `event` incluidos.

### `GET /tickets/:ticketId` 🔒
Detalle de un ticket propio.

**Errores:**
- `403 TICKET_FORBIDDEN` — el ticket no te pertenece
- `404 TICKET_NOT_FOUND`

### `PATCH /tickets/:ticketId/cancel` 🔒
Cancelar un ticket propio (solo si está en estado `VALID`).

**Response:** ticket actualizado con `status: "CANCELLED"`.

**Errores:**
- `403 TICKET_FORBIDDEN`
- `404 TICKET_NOT_FOUND`
- `409 TICKET_NOT_VALID` — el ticket ya fue usado, cancelado o expirado

### `POST /tickets/validate` 🔒 (ORGANIZER o STAFF)
Validar ticket escaneando el QR. El escáner envía el `qrToken` del QR.

**Body:**
```json
{ "qrToken": "uuid-del-qr-token" }
```

**Response:** ticket actualizado con `status: "USED"` y `usedAt`.

**Errores:**
- `404 TICKET_NOT_FOUND`
- `409 TICKET_ALREADY_USED`
- `409 TICKET_NOT_VALID` — cancelado o expirado

---

## Ticket statuses

| Status | Descripción |
|--------|-------------|
| `VALID` | Entrada válida, puede usarse |
| `USED` | Ya fue escaneada en la puerta |
| `CANCELLED` | Cancelada por el usuario |
| `EXPIRED` | Venció sin ser usada |

---

## Chat (REST)

Los mensajes se envían en tiempo real vía WebSocket. Estos endpoints sirven para cargar historial.

### `GET /chats/:eventId/public/messages` 🔒
Historial del chat grupal del evento.

**Response:**
```json
{
  "eventId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Hola!",
      "sentAt": "2026-03-17T..."
    }
  ]
}
```

### `GET /chats/:eventId/private/:otherUserId/messages` 🔒
Historial de chat privado con otro usuario dentro de un evento.

### `GET /chats/:eventId/conversations` 🔒
Lista de conversaciones privadas del usuario en un evento.

### `POST /chats/:eventId/cleanup` 🔒 (solo ORGANIZER)
Finalizar evento y limpiar datos.

---

## WebSocket (Socket.IO)

Conectar a `ws://<HOST>:3000` con:
```
?token=<accessToken>
```

### Eventos cliente → servidor

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `event:join` | `{ eventId }` | Unirse a la sala del evento |
| `event:leave` | `{ eventId }` | Salir de la sala del evento |
| `chat:send_public` | `{ eventId, content }` | Mensaje al chat grupal |
| `chat:send_private` | `{ eventId, toUserId, content }` | Mensaje privado |
| `presence:get_list` | `{ eventId }` | Pedir lista de presentes |
| `chat:typing` | `{ eventId, toUserId }` | Indicar que estás escribiendo a un usuario |
| `chat:mark_delivered` | `{ messageId }` | Marcar mensaje como entregado |
| `chat:mark_seen` | `{ messageId }` | Marcar mensaje como visto |

### Eventos servidor → cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `chat:public_message` | `{ id, userId, content, sentAt }` | Nuevo mensaje grupal |
| `chat:private_message` | `{ id, fromUserId, content, sentAt }` | Nuevo mensaje privado |
| `presence:list` | `[{ userId, ... }]` | Lista de usuarios presentes |
| `presence:joined` | `{ userId }` | Usuario entró al evento |
| `presence:left` | `{ userId }` | Usuario salió del evento |
| `chat:typing_status` | `{ fromUserId, eventId }` | El otro usuario está escribiendo |
| `order:new` | objeto orden completo | **Business** recibe nuevo pedido en tiempo real |
| `order:status_update` | `{ orderId, status }` | **User** recibe cambio de estado de su pedido |
| `song_request:updated` | objeto song request completo | **User** recibe respuesta del DJ a su canción |

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `USER` | Usuario base (default al registrarse) |
| `DJ` | Se asigna al crear un DJ profile |
| `ORGANIZER` | Se asigna al crear un organizer profile |
| `STAFF` | Staff de un evento (asignado por organizador) |

Un usuario puede tener múltiples roles simultáneamente.

---

## Formato de errores

Todos los errores siguen el mismo esquema JSON:

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "DJ profile not found",
  "errorCode": "DJ_PROFILE_NOT_FOUND",
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

El campo `error` es siempre el nombre HTTP estándar del status code (`"Bad Request"`, `"Unauthorized"`, `"Forbidden"`, `"Not Found"`, `"Conflict"`, `"Gone"`, `"Too Many Requests"`).
El campo `errorCode` es el identificador de máquina — usalo en el frontend para distinguir errores del mismo status.

Los errores de validación incluyen un array `errors` en lugar de `message` y devuelven **todos los campos inválidos de una vez**:

```json
{
  "statusCode": 400,
  "error": "Validation Error",
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "email must be an email" },
    { "field": "password", "message": "password should not be empty" }
  ],
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

Los errores 500 incluyen un `requestId` para poder correlacionarlos con los logs del servidor:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "requestId": "a1b2c3d4-...",
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

---

## Códigos de error (`errorCode`)

El campo `errorCode` permite al frontend identificar el error de forma programática sin depender del texto del mensaje.

### Autenticación y usuarios

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `USER_ALREADY_EXISTS` | 409 | Email ya registrado |
| `EMAIL_NOT_VERIFIED` | 403 | Email no verificado antes del registro |
| `INVALID_CREDENTIALS` | 401 | Email o contraseña incorrectos |
| `ACCOUNT_DELETED` | 410 | La cuenta fue eliminada |
| `ACCOUNT_BANNED` | 403 | La cuenta está suspendida |
| `USER_NOT_FOUND` | 404 | Usuario no encontrado |
| `INVALID_PASSWORD` | 401 | Contraseña actual incorrecta |
| `SAME_PASSWORD` | 400 | La nueva contraseña es igual a la actual |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token inválido o revocado |
| `PASSWORD_RESET_NOT_FOUND` | 400 | No hay solicitud de reset activa para ese email |
| `RESET_CODE_EXPIRED` | 410 | El código de reset expiró |
| `INVALID_RESET_CODE` | 400 | Código de reset incorrecto |

### Email

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `COOLDOWN_ACTIVE` | 429 | Debe esperar antes de pedir otro OTP |
| `MAX_ATTEMPTS_REACHED` | 429 | Demasiados intentos fallidos de verificación |

### Eventos

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `EVENT_NOT_FOUND` | 404 | Evento no encontrado |
| `EVENT_NOT_ACTIVE` | 400 | El evento no está activo |
| `EVENT_FULL` | 403 | El evento alcanzó su capacidad máxima |
| `INVALID_EVENT_DATES` | 400 | Fechas del evento inválidas (endDate <= startDate) |
| `USER_NOT_EVENT_PARTICIPANT` | 403 | El usuario no participó en el evento |

### DJ y perfil

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `DJ_PROFILE_NOT_FOUND` | 404 | Perfil de DJ no encontrado |
| `DJ_ALREADY_IN_LINEUP` | 409 | El DJ ya está en el lineup del evento |

### Reviews

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `REVIEW_ALREADY_EXISTS` | 409 | Ya dejaste una reseña para este DJ en este evento |
| `REVIEW_EVENT_STILL_ACTIVE` | 403 | El evento todavía no terminó |
| `REVIEW_USER_NOT_ATTENDEE` | 403 | El usuario no asistió al evento |

### Promo codes

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `PROMO_CODE_NOT_FOUND` | 404 | Código promocional no encontrado |
| `PROMO_CODE_EXPIRED` | 410 | El código promocional expiró |
| `PROMO_CODE_USAGE_LIMIT` | 410 | El código alcanzó su límite de usos |
| `PROMO_CODE_ALREADY_REDEEMED` | 409 | El usuario ya canjeó este código |
| `PROMO_CODE_ACCESS_FORBIDDEN` | 403 | Sin permisos para ver estadísticas de este código |

### Venues y productos

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `VENUE_NOT_FOUND` | 404 | Venue no encontrado |
| `NOT_VENUE_OWNER` | 403 | El usuario no es dueño del venue |
| `VENUE_PRODUCT_NOT_FOUND` | 404 | Producto del venue no encontrado |
| `VENUE_PRODUCT_NOT_AVAILABLE` | 400 | Producto no disponible para pedidos |

### Órdenes

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `ORDER_NOT_FOUND` | 404 | Orden no encontrada |
| `INSUFFICIENT_ZYNC_POINTS` | 400 | El usuario no tiene suficientes Zync Points |

### Stories

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `STORY_NOT_FOUND` | 404 | Historia no encontrada |
| `STORY_NOT_OWNED` | 403 | No sos el autor de la historia |

### Tickets

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `TICKET_NOT_FOUND` | 404 | Ticket no encontrado |
| `TICKET_FORBIDDEN` | 403 | El ticket no te pertenece |
| `TICKET_ALREADY_USED` | 409 | El ticket ya fue usado |
| `TICKET_NOT_VALID` | 409 | El ticket está cancelado o expirado |
| `TICKET_TYPE_NOT_FOUND` | 404 | Tipo de ticket no encontrado o inactivo |
| `TICKET_TYPE_FULL` | 409 | Sin capacidad disponible para este tipo |
| `TICKET_TYPE_SALE_CLOSED` | 409 | La venta de este tipo de ticket no está abierta |

### Chat

| `errorCode` | Status | Descripción |
|-------------|--------|-------------|
| `EMPTY_MESSAGE_CONTENT` | 400 | El contenido del mensaje está vacío |

---

## HTTP status codes

| Status | Descripción |
|--------|-------------|
| `400` | Validación o regla de negocio fallida |
| `401` | No autenticado / credenciales inválidas |
| `403` | Sin permisos para realizar la acción |
| `404` | Recurso no encontrado |
| `409` | Conflicto (recurso ya existe o ya fue procesado) |
| `410` | Recurso expirado o eliminado |
| `429` | Rate limit superado |
