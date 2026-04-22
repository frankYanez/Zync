# Zync — Endpoints Pendientes de Implementación Backend

> Documento para el equipo de backend.
> Fecha: Abril 2026

Estos son todos los endpoints que el frontend necesita pero que aún no están implementados en el servidor. Están organizados por prioridad de negocio.

---

## Prioridad ALTA

---

### 1. Scanner QR — Validación de tickets

El scanner del business necesita validar el QR que muestra el asistente al entrar al evento.

**Endpoint necesario:**
```
POST /tickets/validate
Authorization: Bearer <token>   (requiere rol BUSINESS u ORGANIZER)

Body:
{
  "qrCode": "string",    // contenido del QR escaneado
  "eventId": "uuid"
}

Response 200:
{
  "valid": true,
  "ticket": {
    "id": "uuid",
    "holderName": "Gonzalo García",
    "eventId": "uuid",
    "eventName": "Noche Techno",
    "price": 2500.00,
    "status": "valid"   // "valid" | "already_used" | "expired"
  },
  "user": {
    "id": "uuid",
    "firstName": "Gonzalo",
    "avatarUrl": "https://..."
  }
}

Response 400:
{ "valid": false, "reason": "Ticket already used" }
```

**Lógica backend:**
- Buscar ticket por `qrCode`
- Verificar que pertenece al `eventId` indicado
- Si `status = 'used'` → retornar `valid: false`
- Si válido → marcar como `used`, retornar datos del ticket y del usuario
- El cambio de estado debe ser **atómico** (usar transacción DB para evitar race condition si dos scanners intentan validar el mismo ticket)

---

### 2. Compra de tickets

El usuario compra una entrada al evento desde la app.

**Endpoint necesario:**
```
POST /events/:eventId/tickets/purchase
Authorization: Bearer <token>

Body:
{
  "quantity": 1            // cantidad de entradas (por ahora siempre 1)
}

Response 201:
{
  "id": "uuid",
  "eventId": "uuid",
  "userId": "uuid",
  "qrCode": "string",      // código único para el QR (UUID o hash)
  "price": 2500.00,
  "status": "valid",
  "purchasedAt": "2026-04-11T..."
}

Errores:
- 400 EVENT_FULL          → capacidad agotada
- 400 EVENT_NOT_ACTIVE    → evento no está activo o no comenzó
- 409 TICKET_ALREADY_PURCHASED → el usuario ya tiene un ticket para este evento
```

**Lógica backend:**
- Verificar capacidad del evento
- Generar `qrCode` único (UUID v4 o hash SHA256 de `userId + eventId + timestamp`)
- Descontar del `capacity` del evento (o del contador de tickets vendidos)
- El `qrCode` es lo que se muestra como QR en la app del asistente

---

### 3. Lista de tickets del usuario

```
GET /users/me/tickets
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "qrCode": "string",
    "price": 2500.00,
    "status": "valid",          // "valid" | "used" | "expired"
    "purchasedAt": "2026-04-11T...",
    "event": {
      "id": "uuid",
      "name": "Noche Techno",
      "imageUrl": "https://...",
      "startsAt": "2026-04-11T22:00:00Z",
      "endsAt": "2026-04-12T05:00:00Z",
      "venue": {
        "name": "Club Niceto",
        "address": "Niceto Vega 5510"
      }
    }
  }
]
```

---

### 4. Detalle de un ticket

```
GET /users/me/tickets/:ticketId
Authorization: Bearer <token>

Response 200: (mismo objeto de la lista)

Errores:
- 404 TICKET_NOT_FOUND
- 403 TICKET_ACCESS_FORBIDDEN  → el ticket no pertenece al usuario
```

---

## Prioridad ALTA — Stats

---

### 5. Estadísticas del venue (para BusinessHomeScreen)

La pantalla de home del organizador muestra métricas del día en tiempo real.

**Endpoint necesario:**
```
GET /venues/:venueId/stats
Authorization: Bearer <token>   (solo dueño del venue)

Response 200:
{
  "todayOrders": 47,
  "todayRevenue": 128400.00,
  "activeCustomers": 312,
  "pendingOrdersCount": 8
}
```

**Lógica backend:**
- `todayOrders`: COUNT de órdenes del venue con `createdAt >= inicio del día` (en el timezone del venue)
- `todayRevenue`: SUM de `total` de esas órdenes con status != 'CANCELLED'
- `activeCustomers`: COUNT de usuarios distintos que hayan entrado al evento activo del venue (tabla `event_participants`)
- `pendingOrdersCount`: COUNT de órdenes en estado `PENDING`

**Sugerencia:** Cachear por 30 segundos para no impactar la DB con polling frecuente. El frontend podría hacer polling cada 30-60 seg mientras la pantalla está activa.

---

### 6. Estadísticas del evento (para OrganizerEventDetail)

```
GET /events/:eventId/stats
Authorization: Bearer <token>   (solo organizador del evento)

Response 200:
{
  "ticketsSold": 230,
  "ticketRevenue": 575000.00,
  "checkIns": 187,
  "capacity": 300,
  "activeDjs": 2
}
```

**Lógica backend:**
- `ticketsSold`: COUNT de tickets del evento con status != 'expired'
- `ticketRevenue`: SUM del precio de esos tickets
- `checkIns`: COUNT de registros en `event_participants` para este evento
- `capacity`: campo del evento
- `activeDjs`: COUNT de DJs en el lineup con `isLive = true`

---

### 7. Estadísticas del usuario (tier y gasto)

```
GET /users/me/stats
Authorization: Bearer <token>

Response 200:
{
  "totalOrders": 34,
  "totalSpent": 87600.00,
  "tier": "silver"      // "bronze" | "silver" | "gold"
}
```

**Lógica de tiers sugerida:**
```
bronze: totalSpent < $50.000
silver: totalSpent >= $50.000 y < $200.000
gold:   totalSpent >= $200.000
```

Los valores pueden configurarse. El frontend usa `tier` para mostrar un badge y desbloquear beneficios.

---

## Prioridad MEDIA

---

### 8. Wallet top-up (recarga de saldo)

El usuario recarga crédito en la app para gastar en órdenes.

**Endpoint necesario:**
```
POST /wallet/topup
Authorization: Bearer <token>

Body:
{
  "amount": 5000.00,
  "paymentMethodId": "uuid"   // (futuro, por ahora puede ignorarse)
}

Response 200:
{
  "balance": 15000.00,        // nuevo balance TOTAL del usuario
  "zyncPoints": 150           // puntos TOTALES del usuario
}
```

**Nota para integración con pasarela de pagos:**
El backend deberá integrar una pasarela (MercadoPago, Stripe, etc.). El flujo típico es:
1. Frontend inicia la transacción → backend crea el intent de pago y retorna un `paymentIntentId`
2. Frontend completa el pago con la SDK de la pasarela
3. Frontend notifica al backend con el resultado → backend confirma y acredita el saldo

La implementación actual es un mock simple que puede reemplazarse con el `amount` y un `paymentMethodId` cuando esté listo.

**Campo actual en DB:** El usuario tiene `balance` y `zyncPoints` en la tabla `users`. El top-up incrementa `balance` en el `amount`.

---

### 9. Subir cover del evento

```
POST /events/:eventId/cover
Authorization: Bearer <token>   (solo organizador)
Content-Type: multipart/form-data

Campo: file (imagen JPEG/PNG/WebP, máx 5 MB)

Response 200:
{
  "coverImageUrl": "https://res.cloudinary.com/..."
}

Errores:
- 403 NOT_EVENT_OWNER
- 404 EVENT_NOT_FOUND
```

**Nota:** Similar al endpoint `POST /venues/:venueId/media` ya existente. El campo `imageUrl` del evento se actualiza con la URL de Cloudinary.

---

### 10. Broadcast del DJ

El DJ envía un anuncio (texto) a todos los usuarios en el evento en tiempo real.

**Opción A — Vía WebSocket (sin endpoint REST):**

```
// El DJ emite:
socket.emit('dj:broadcast', {
  eventId: "uuid",
  message: "La próxima canción va a ser 🔥",
  type: "announcement"   // "announcement" | "song_preview"
})

// Todos en el evento reciben:
socket.on('dj:broadcast', {
  djProfileId: "uuid",
  artistName: "DJ Gonza",
  message: "La próxima canción va a ser 🔥",
  type: "announcement",
  sentAt: "2026-04-11T..."
})
```

**Opción B — Vía REST + WebSocket:**
```
POST /events/:eventId/broadcast
Authorization: Bearer <token>   (requiere rol DJ)

Body:
{
  "message": "string",
  "type": "announcement"
}

Response 200: { "ok": true }
```
El backend persiste el mensaje y emite el evento de socket a la sala del evento.

**Recomendación:** La Opción A es más simple y tiene menos latencia. La Opción B permite persistir el historial de broadcasts.

---

### 11. Subir imagen de producto del venue

```
PATCH /venues/:venueId/products/:productId/image
Authorization: Bearer <token>   (solo dueño del venue)
Content-Type: multipart/form-data

Campo: file (imagen JPEG/PNG/WebP, máx 5 MB)

Response 200:
{
  "imageUrl": "https://res.cloudinary.com/..."
}

Errores:
- 403 NOT_VENUE_OWNER
- 404 VENUE_PRODUCT_NOT_FOUND
```

---

## Prioridad BAJA

---

### 12. Lista de conversaciones del chat

El usuario puede ver todas las conversaciones privadas que tuvo en un evento.

```
GET /chats/:eventId/conversations
Authorization: Bearer <token>

Response 200:
[
  {
    "otherUser": {
      "id": "uuid",
      "firstName": "Gonza",
      "lastName": "García",
      "avatarUrl": "https://..."
    },
    "lastMessage": {
      "content": "Hola!",
      "sentAt": "2026-04-11T..."
    },
    "unreadCount": 2
  }
]
```

---

### 13. Lista de usuarios (admin / búsqueda)

```
GET /users
(público)

Query params:
- search (string, opcional)
- skip / take (paginación)

Response 200: array de usuarios con perfil básico
```

Actualmente no está implementado en la app pero puede ser útil para búsquedas de usuarios en chat.

---

### 14. Timezones disponibles

```
GET /venues/timezones

Response 200: ["America/Argentina/Buenos_Aires", "America/Bogota", ...]
```

Usado en el formulario de creación de venues para seleccionar el timezone. El formulario actualmente hardcodea algunos valores.

---

## Resumen de endpoints pendientes

| # | Endpoint | Prioridad | Depende de |
|---|----------|-----------|------------|
| 1 | `POST /tickets/validate` | ALTA | Sistema de tickets |
| 2 | `POST /events/:eventId/tickets/purchase` | ALTA | Sistema de tickets |
| 3 | `GET /users/me/tickets` | ALTA | Sistema de tickets |
| 4 | `GET /users/me/tickets/:ticketId` | ALTA | Sistema de tickets |
| 5 | `GET /venues/:venueId/stats` | ALTA | — |
| 6 | `GET /events/:eventId/stats` | ALTA | — |
| 7 | `GET /users/me/stats` | ALTA | — |
| 8 | `POST /wallet/topup` | MEDIA | Pasarela de pagos |
| 9 | `POST /events/:eventId/cover` | MEDIA | Cloudinary |
| 10 | `socket dj:broadcast` o `POST /events/:eventId/broadcast` | MEDIA | — |
| 11 | `PATCH /venues/:venueId/products/:productId/image` | MEDIA | Cloudinary |
| 12 | `GET /chats/:eventId/conversations` | BAJA | — |
| 13 | `GET /users` | BAJA | — |
| 14 | `GET /venues/timezones` | BAJA | — |

---

## Modelos de datos sugeridos

### Ticket
```typescript
{
  id: uuid (PK)
  userId: uuid (FK → users)
  eventId: uuid (FK → events)
  qrCode: string (UNIQUE, generado al crear)
  price: decimal
  status: enum('valid', 'used', 'expired')
  purchasedAt: timestamp
  usedAt: timestamp (nullable)
}
```

### UserStats (calculado, no tabla)
```typescript
// Calculado en query al momento de petición
// JOIN orders WHERE userId = me AND status != CANCELLED
{
  totalOrders: count
  totalSpent: sum(total)
  tier: derived('bronze'|'silver'|'gold')
}
```

### WalletBalance (campo en tabla users)
```typescript
// Campos en tabla users:
balance: decimal (default 0)
zyncPoints: integer (default 0)
// Al hacer topUp: balance += amount; zyncPoints += floor(amount / 100)
// Al hacer orden con puntos: zyncPoints -= pointsUsed
```
