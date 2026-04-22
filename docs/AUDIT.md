# Zync Mobile — Audit de Código

> Fecha: Abril 2026 | Rama: dev

---

## Bugs corregidos

### 🟢 BUG-01 — Typo `toal` en CartContext
**Archivo:** `src/features/wallet/context/CartContext.tsx` — línea 78  
**Problema:** El acumulador del reduce estaba nombrado `toal` (typo).  
**Fix:** Renombrado a `total`.  
**Estado:** ✅ Corregido

---

### 🟢 BUG-02 — Zync Points no se deducían al hacer checkout
**Archivo:** `src/features/wallet/screens/CartScreen.tsx` — líneas 70-74  
**Problema:** Al pagar con Zync Points, se calculaba el descuento localmente pero nunca se llamaba `updateBalance()`. El balance mostrado en la UI no cambiaba.  
**Fix:** Se llama `updateBalance(-Math.round(discount))` cuando el checkout es exitoso y `usePoints` está activo.  
**Estado:** ✅ Corregido

---

### 🟢 BUG-03 — `updateUser()` ignoraba su parámetro
**Archivo:** `src/features/auth/context/AuthContext.tsx` — líneas 102-104  
**Problema:** La función `updateUser(updatedUser: User)` recibía el usuario actualizado pero lo ignoraba completamente, haciendo un `checkUser()` (llamada a `/auth/me`) en su lugar. Cualquier pantalla que llamaba `updateUser()` esperando actualizar el estado local veía un round-trip innecesario al servidor.  
**Fix:** `setUser(updatedUser)` directo. Si se necesita sincronizar con el servidor, usar `checkUser()` explícitamente.  
**Estado:** ✅ Corregido

---

### 🟢 BUG-04 — `console.log` de debug en producción
**Archivo:** `src/features/auth/context/AuthContext.tsx` — línea 40  
**Problema:** `console.log(user, "user en checkuser")` se ejecutaba en cada carga de la app, logueando datos sensibles del usuario.  
**Fix:** Eliminado.  
**Estado:** ✅ Corregido

---

## Bugs pendientes de fix

### 🔴 BUG-05 — DjHomeScreen no protege contra `profile` nulo
**Archivo:** `src/features/dj/screens/DjHomeScreen.tsx`  
**Problema:** `useDjStats(profile?.id)` y `useSongRequests(profile?.id)` se ejecutan con `undefined` en el primer render (antes de que cargue el perfil DJ). Los hooks deben manejar IDs opcionales pero genera llamadas de red innecesarias.  
**Fix sugerido:**
```typescript
const { profile, isLoading: profileLoading } = useDjProfile();
// Early guard antes de mostrar contenido:
if (profileLoading || !profile) return <ZyncLoader visible />;
```

---

### 🟡 BUG-06 — `updateBalance` suma en lugar de reemplazar
**Archivo:** `src/features/auth/context/AuthContext.tsx` — línea 123  
**Problema:** `updateBalance(amount)` hace `user.zyncPoints + amount`. Si el backend devuelve el nuevo balance total en el response de una acción, el caller debe restar el actual antes de llamar esta función. No hay forma de setear el balance absoluto sin hacer `checkUser()`.  
**Fix sugerido:** Agregar `setBalance(totalBalance: number)` en el contexto para casos donde el backend devuelve el valor total.

---

### 🟡 BUG-07 — CartContext no limpia el carrito tras checkout exitoso
**Archivo:** `src/features/wallet/context/CartContext.tsx`  
**Problema:** `checkout()` crea la orden pero no llama `clearCart()`. La pantalla de éxito en CartScreen llama `clearCart()` solo cuando el usuario presiona "VER MIS PEDIDOS" o cierra la pantalla. Si el usuario sale de la app en la pantalla de éxito, el carrito queda con items que ya fueron ordenados.  
**Fix sugerido:** Llamar `clearCart()` dentro de `checkout()` tras éxito, antes de retornar.

---

### 🟡 BUG-08 — useEffect en AuthContext referencia `checkUser` antes de declarar
**Archivo:** `src/features/auth/context/AuthContext.tsx` — línea 32-34  
**Problema:** El `useEffect` con `checkUser()` se ejecuta inmediatamente, pero `checkUser` está declarada después en el componente. Funciona porque JavaScript hace hoisting de funciones declaradas con `const` dentro del scope del componente antes de ejecutar el effect. Sin embargo, la dependencia del `useEffect` debería incluir `checkUser` o la función debería definirse antes del effect.  
**Fix sugerido:** No es bloqueante, pero para claridad mover `checkUser` arriba del `useEffect`, o usar `useCallback`.

---

## Mejoras de arquitectura

### ARCHI-01 — Hook genérico para fetch con loading/error
**Problema:** Los hooks `useDjGigs`, `useDjStats`, `useSongRequests`, `useDjPromoCodes` repiten exactamente el mismo patrón:

```typescript
const [data, setData] = useState<T[]>([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    service(id).then(setData).finally(() => setIsLoading(false));
}, [id]);
```

**Propuesta:** Crear `src/hooks/useFetch.ts`:
```typescript
export function useFetch<T>(
    fetcher: () => Promise<T>,
    deps: any[],
    skip = false
): { data: T | null; isLoading: boolean; error: Error | null; refetch: () => void }
```

---

### ARCHI-02 — Separar WalletContext de AuthContext
**Problema:** `AuthContext` maneja autenticación + balance de wallet + push tokens + puntos Zync. Viola el Single Responsibility Principle.  
**Propuesta:** Crear `WalletContext` con:
```typescript
interface WalletContextType {
    balance: number;
    zyncPoints: number;
    updateBalance: (amount: number) => void;
    setBalance: (total: number) => void;
    refreshBalance: () => Promise<void>;
}
```

---

### ARCHI-03 — Separar socket.service de lógica de chat
**Problema:** `socket.service.ts` mezcla la conexión/desconexión del socket con la lógica específica de chat (eventos, mensajes privados, presencia). El archivo crece sin límite claro de responsabilidades.  
**Propuesta:**
- `socket.service.ts` — solo: `connect()`, `disconnect()`, `emit()`, `on()`, `off()`
- `chat.socket.ts` — eventos de mensajes (send_public, send_private, typing, delivered, seen)
- `presence.socket.ts` — eventos de presencia (join, leave, get_list, list, joined, left)

---

### ARCHI-04 — Tipos `any` en componentes de chat
**Archivos afectados:**
- `ConnectedUsersCarousel.tsx`: `item: any`
- `EventStoriesCarousel.tsx`: `stories: any[]`
- `useConnectedUsers.ts`: `data: any` en handlers

**Propuesta:** Definir interfaces específicas:
```typescript
// chat/domain/chat.types.ts
export interface PresenceData {
    userId: string;
    online: boolean;
    user?: { id: string; name: string; avatar?: string };
    type?: 'join' | 'leave';
}

export interface StoryData {
    id: string;
    userId: string;
    mediaUrl: string;
    text?: string;
    createdAt: string;
    user: { firstName: string; avatarUrl?: string };
}
```

---

### ARCHI-05 — Protección de credenciales de Spotify
**Archivo:** `src/features/music/services/spotify-service.ts`  
**Problema:** El client ID y client secret de Spotify están en el código (hardcodeados o en `.env` con prefijo `EXPO_PUBLIC_`). Con prefijo `EXPO_PUBLIC_` las variables son visibles en el bundle.  
**Propuesta:** Mover el flujo de OAuth de Spotify al backend. El frontend pide al backend un access token de Spotify, y el backend hace la llamada a Spotify usando sus credenciales seguras. El frontend recibe el token y lo usa para las búsquedas.

```
Frontend → GET /spotify/token → Backend → Spotify /token → devuelve accessToken
```

---

### ARCHI-06 — Scanner QR sin implementar
**Archivos:** `src/features/scanner/screens/ScannerScreen.tsx`, `app/(tabs)/scanner.tsx`, `app/(business)/scanner.tsx`  
**Problema:** La pantalla de scanner (usuario) solo muestra UI sin lógica de cámara. No hay lectura real de QR.  
**Propuesta:**
1. Usar `expo-camera` (ya instalado) con `onBarcodeScanned`
2. El QR del venue/evento contiene el `venueId` o `eventId`
3. Al scanear: llamar `setCurrentEstablishment({ venueId, eventId })` en ZyncContext
4. El scanner de business usa la misma lógica pero llama `validateTicket(qrCode, eventId)`

```typescript
// Patrón sugerido en ScannerScreen:
<CameraView
    onBarcodeScanned={({ data }) => {
        const { venueId, eventId } = JSON.parse(data);
        setCurrentEstablishment({ id: venueId, eventId });
        router.back();
    }}
    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
/>
```

---

### ARCHI-07 — ZyncContext no persiste entre sesiones
**Archivo:** `src/context/ZyncContext.tsx`  
**Problema:** El `currentEstablishment` (venue/evento activo) se pierde al cerrar la app o al hacer background+foreground. El usuario tiene que volver a escanear el QR.  
**Propuesta:** Persistir el `currentEstablishment` en `expo-secure-store` con TTL basado en las horas del evento (`endsAt`). Al cargar la app, verificar si el establecimiento guardado sigue activo.

---

## Deuda técnica menor

| ID | Archivo | Issue |
|----|---------|-------|
| DT-01 | `app/chat-test.tsx` | Pantalla de test sin uso en producción, debería removerse o protegerse con `__DEV__` |
| DT-02 | `src/features/auth/context/AuthContext.tsx` | `console.error(e)` en `checkUser` debería ser silencioso o loggear a Sentry |
| DT-03 | Múltiples screens | Colores hardcodeados (`'#000'`, `'#111'`, `'#222'`) en lugar de usar `ZyncTheme.colors` |
| DT-04 | `src/features/wallet/screens/WalletScreen.tsx` | Tarjetas de pago en estado local de la pantalla, sin persistencia |
| DT-05 | `src/features/scanner/screens/ScannerScreen.tsx` | `expo-camera` instalado pero no importado en la pantalla de scanner |
| DT-06 | `src/infrastructure/mock-data.ts` | Archivo de mock data aún referenciado desde CartContext (`Product` type) |

---

## Checklist pre-launch

- [x] Auth JWT + Google OAuth funcionando
- [x] Refresh token automático
- [x] Logout con invalidación de token
- [x] Chat público y privado con Socket.io
- [x] Órdenes end-to-end (crear, ver, actualizar estado)
- [x] Song requests
- [x] Perfiles DJ y Organizer
- [x] Productos de venue
- [ ] Scanner QR funcional (solo UI)
- [ ] Tickets (todo mock)
- [ ] Wallet top-up real
- [ ] Stats de venue/evento/usuario
- [ ] Broadcast del DJ
- [ ] Validación de credenciales Spotify
- [ ] Push notifications en iOS
- [ ] Persistencia de establecimiento activo
