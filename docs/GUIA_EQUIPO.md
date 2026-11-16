# Guía para el equipo — Probar y mostrar BosqueSur ES3

Todo está **desplegado y funcionando**. Esta guía es para que cualquier integrante
pruebe el sistema y lo muestre, sin instalar nada (o en local si lo prefieren).

## 🔗 Accesos (ya en línea)

| Recurso | URL |
|---|---|
| Web (bodega) | https://bosquesur-web.onrender.com |
| API REST | https://bosquesur-api.onrender.com/api |
| Repositorio | https://github.com/CarlosT200/BosqueSur |

**Usuarios de demostración:**

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| ADMIN | `admin@bosquesur.cl` | `Admin123*` |
| TERRENO | `terreno@bosquesur.cl` | `Terreno123*` |
| BODEGA | `bodega@bosquesur.cl` | `Bodega123*` |
| GERENCIA | `gerencia@bosquesur.cl` | `Gerencia123*` |

> ⚠️ **Cold start (plan gratis de Render):** si el servicio estuvo inactivo ~15 min,
> la **primera** carga puede tardar ~50 s mientras "despierta". Abran la web/API un
> par de minutos **antes** de mostrar o grabar, para calentarla.

---

## A) Probar la WEB (2 minutos, sin instalar nada)

1. Abran https://bosquesur-web.onrender.com (si tarda, es el cold start; esperen).
2. Inicien sesión. Prueben distintos roles para ver la **navegación por rol**:
   - **BODEGA**: ve Despachos, Inventario, Recepciones, Resumen.
   - **GERENCIA**: ve Inventario, Recepciones, Resumen (solo consulta).
   - **ADMIN**: ve todo, incluida **Auditoría**.
3. Flujo estrella (como BODEGA o ADMIN):
   - **Despachos** → elijan uno **PENDIENTE** → *Registrar recepción*.
   - Pongan un **volumen recibido distinto** al despachado (p. ej. 118 si el despacho
     era 120,5). La diferencia se calcula sola y exige **resolución** + **observación**.
   - Confirmen → verán la **actualización automática del inventario** (saldo anterior → posterior).
   - Revisen **Inventario** (existencias + movimientos) y, como ADMIN, **Auditoría**.

> Tip de contraseña: escríbanla a mano con cuidado; al pegar, revisen que no quede un
> espacio al final (si no, sale "Credenciales inválidas").

---

## B) Probar la APP MÓVIL (Expo Go)

La app apunta a la **API desplegada**, así que el teléfono solo necesita internet.

### Método 1 — Expo Snack (rápido, sin instalar nada en el PC)

1. En el PC, abran https://snack.expo.dev
2. Reemplacen el contenido de **App.js** por el de este archivo del repo:
   `apps/mobile/snack/App.js`
   (link directo "raw":
   https://raw.githubusercontent.com/CarlosT200/BosqueSur/main/apps/mobile/snack/App.js )
3. Abran el archivo **package.json** de Snack y déjenlo así: `{ "dependencies": {} }`
   (esta versión no usa librerías externas).
4. En la pestaña **"My Device"** aparece un **QR**.
   - **iOS:** primero **inicien sesión en Expo Go** (lo exige Apple para abrir Snacks),
     luego escaneen el QR con la **Cámara**.
   - **Android:** escaneen el QR con Expo Go (no pide sesión).
5. Inicien sesión en la app como **TERRENO** (`terreno@bosquesur.cl` / `Terreno123*`),
   registren un **predio** y una **cosecha**. Aparecen al instante en la misma base que
   usa la web (eso demuestra la integración del criterio 2.1.3).

### Método 2 — App real con Expo (`npx expo start`)

En el PC (requiere Node ≥ 22.18 y la app Expo Go en el teléfono):

```bash
git clone https://github.com/CarlosT200/BosqueSur.git
cd BosqueSur/apps/mobile
npm install
npx expo start          # si el teléfono no conecta: npx expo start --tunnel
```

Escaneen el QR (iOS: Cámara; Android: Expo Go). La app ya apunta a la API de Render.

---

## C) Correr TODO en local (opcional, para desarrollo)

Ver el `README.md` (sección *Instalación paso a paso*): levanta PostgreSQL con Docker,
aplica migraciones, siembra datos y corre API + Web.

```bash
npm install
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

---

## D) Pruebas automatizadas (20 pruebas)

```bash
npm test
```

Resultado de referencia (2026-11-16): **20 pruebas aprobadas (20/20)** — los 17 criterios
del punto 10 de la pauta + 1 prueba extra de atomicidad/rollback de la transacción de
inventario. Peguen la salida real de `npm test` como evidencia.

---

## E) Para la demo y las evidencias

- **Guion de demostración (7–10 min, 3 integrantes):** `docs/GUIA_DEMO.md`
- **Checklist de evidencias y medición de tiempos:** `docs/PRUEBAS_Y_EVIDENCIAS.md`
- **Endpoints y colección importable (Postman/Thunder/Bruno):** `docs/API.md` y
  `docs/bosquesur.postman_collection.json`

---

## F) Re-desplegar o re-sembrar (si hiciera falta)

El despliegue está definido en `render.yaml` (Blueprint de Render). Si la base gratuita
expira o se quiere recrear todo: volver a aplicar el Blueprint en Render. La API, al
iniciar, corre **migraciones + seed** automáticamente, así que los usuarios y datos de
demostración vuelven solos.
