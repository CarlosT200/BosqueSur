# Informe de verificación — Evaluación Sumativa 3 · BosqueSur

**Proyecto:** Prototipo de trazabilidad BosqueSur Maderas SpA (Sprint 1)
**Fecha de verificación:** 2026-11-16
**Repositorio:** https://github.com/CarlosT200/BosqueSur
**Entorno de verificación:** Linux, Node v22.23.4, npm 10.9.9, PostgreSQL 16 (local).

> Todos los resultados de este informe provienen de ejecuciones reales realizadas en
> esta verificación. Donde algo **no** pudo ejecutarse en este entorno, se indica
> explícitamente cómo se validó en su lugar.

---

## Actualización — Etapa 2 de corrección (2026-11-16)

Sobre el informe original se realizaron estas correcciones y adiciones (verificadas localmente):
- **Concurrencia de inventario corregida:** `registrarRecepcion` ahora usa **incremento atómico**
  (`upsert` con `increment`) para evitar pérdida de actualizaciones ante recepciones concurrentes de
  la misma especie. Archivo: `apps/api/src/modules/despachos/despachos.service.js`.
- **Pruebas: 18 → 20.** Se agregaron #18 (concurrencia: dos recepciones de la misma especie suman sin
  pérdida) y #19 (autorización de operaciones críticas). `npm test` → **20/20**.
- **Reinicio seguro de demostración:** `apps/api/prisma/demo-reset.js` + `npm run demo:reset` (con
  `CONFIRM_DEMO_RESET=SI` y bloqueo en producción salvo `ALLOW_DEMO_RESET=true`). Sin endpoint público.
- **Diagramas formales creados** (antes solo había ASCII): `docs/evaluacion3/` incluye topología,
  infraestructura y arquitectura en **Mermaid** (`.mmd` + renderizado en GitHub), más análisis
  comparativo, justificación, criterios/normas, seguridad/rendimiento (con **mediciones reales**),
  matriz de rúbrica, checklist y evidencias. Esto eleva la sección D (rúbrica) de PARCIAL a completo.
- **App móvil validada de verdad (no solo sintaxis):** se corrigió la inconsistencia de versión en
  `README.md` (decía SDK 52; la versión real declarada e instalada es **Expo 58** / RN 0.88 / React
  19). Se generó **`apps/mobile/package-lock.json`** reproducible y se verificó **`npm ci --prefix
  apps/mobile`** (instalación limpia OK). Se agregó `babel-preset-expo` (faltaba como dependencia
  directa) y `metro.config.js`, con lo que **`npx expo export --platform android` empaqueta el bundle
  correctamente** (Metro, 848 módulos, bundle `.hbc`). `npx expo-doctor`: **20/20 en GitHub Actions**
  (localmente da 18/20 porque el sandbox bloquea `exp.host` y React Native Directory; en GitHub, con
  red, pasa todo). Se corrigió además el aviso de esquema `splash` de SDK 58 (ver abajo). El CI
  incluye ahora `npm ci --prefix apps/mobile` + `expo export`.
  > Aclaración honesta: la **app móvil real multiarchivo** se validó por **empaquetado (expo export),
  > expo-doctor y sintaxis (17/17)**, NO se ejecutó en un teléfono; la que corrió en un **iPhone
  > físico** fue la **variante Snack** (`apps/mobile/snack/App.js`).
- **CI:** `.github/workflows/ci.yml` creado y validado localmente (YAML correcto, jobs `build-test` y
  `mobile-validate`). **Ejecutado con éxito en GitHub Actions** (run `43849653316` y la corrida
  posterior al fix de `splash`: ambos jobs `build-test` y `mobile-validate` en **success**, 20/20
  pruebas). La publicación ya **no** está pendiente.
- **Fix de `splash` (SDK 58):** `expo-doctor` reportaba en GitHub 1 fallo de esquema
  (`Additional property "splash" is not allowed`). Se instaló `expo-splash-screen@~58.0.14` (versión
  que bundlea Expo 58) y se movió la configuración al plugin `expo-splash-screen` con
  `backgroundColor: "#1b3b2a"` (sin imagen, porque no existe recurso gráfico). Con esto `expo-doctor`
  llega a **20/20 en GitHub**.
- **Despliegue tras el push:** API y Web **redesplegadas** en Render; `/api/health` → `status: ok`,
  `db: ok`; la web carga y renderiza el panel con datos reales.

---

## A. Resumen del proyecto

**Componentes construidos (monorepo npm workspaces):**

| Componente | Carpeta | Tecnologías |
|---|---|---|
| API REST | `apps/api` | Node.js, Express 4, JavaScript (ESM), Prisma 6 (motor WebAssembly + `@prisma/adapter-pg`), PostgreSQL, JWT, bcryptjs, Zod, Helmet, express-rate-limit, CORS |
| App web (bodega) | `apps/web` | React 18, Vite 6, React Router 6, JavaScript |
| App móvil (terreno) | `apps/mobile` | React Native, Expo SDK 58, React Navigation 7, expo-secure-store, JavaScript |
| Base de datos | `apps/api/prisma` | PostgreSQL 16/18, esquema y migración Prisma |

**Comunicación:** la app web y la app móvil consumen **la misma API REST** (JSON, JWT en
`Authorization: Bearer`) y ésta usa **una sola base de datos PostgreSQL** mediante Prisma. El
**inventario es la fuente única de información** (solo se modifica vía movimientos dentro de una
transacción). Verificado en vivo: una cosecha creada desde el iPhone apareció en la misma base que
consulta la web.

**Alcance específico de la Evaluación 3 (Sprint 1):** BL-01 autenticación/roles; BL-02 API REST
común; BL-03 predio y cosecha desde móvil; BL-04 despacho y recepción con diferencias; BL-05
actualización automática de inventario en transacción atómica.

**Fuera de alcance (sprints posteriores):** producción/elaborados, códigos QR, secado/impregnado,
movimientos entre bodegas, pedidos, compras, reportería gerencial avanzada, integración SII,
facturación electrónica, app iOS publicada en tienda.

---

## B. Estado de BL-01 a BL-05

| ID | Funcionalidad | Estado | Cómo se verificó | Archivo o endpoint | Pendientes |
|---|---|---|---|---|---|
| BL-01 | Autenticación, roles y permisos | **COMPLETO Y PROBADO** | Pruebas automatizadas 1–5, 16, 17 (login JWT, 401, 403, auditoría de acceso denegado); verificado en vivo en Render | `modules/auth/*`, `middlewares/authenticate.js`, `middlewares/authorize.js`, `POST /api/auth/login` | — |
| BL-02 | API REST común web+móvil | **COMPLETO Y PROBADO** | Web (Render) y móvil (iPhone/Expo Go) consumen la misma API; respuestas JSON consistentes; `GET /api/health` ok | `app.js`, `routes/index.js`, `utils/httpResponse.js`, `middlewares/error.js` | — |
| BL-03 | Registro móvil de predio y cosecha | **COMPLETO Y PROBADO** | En vivo: desde el iPhone se creó predio "Fundó prueba móvil" y cosecha (pino 120 m³); confirmado vía API que persistió en la BD compartida. Pruebas 6–9 cubren la lógica en backend | `apps/mobile/src/screens/*`, `POST /api/predios`, `POST /api/cosechas`, `GET /api/cosechas/:id` | Capturas de pantalla del móvil (las tomará el equipo) |
| BL-04 | Despacho y recepción con diferencias | **COMPLETO Y PROBADO** | Pruebas 10–13 (recepción exacta, diferencia exige resolución+observación, no recibir dos veces); verificado por curl en vivo | `modules/despachos/*`, `POST /api/despachos/:id/recepcion` | — |
| BL-05 | Actualización automática de inventario (transacción atómica) | **COMPLETO Y PROBADO** | Prueba 14 (los 5 efectos existen y son consistentes) y 14b (rollback por FK inválida); verificado por curl (saldo 150→268) | `modules/despachos/despachos.service.js` (`prisma.$transaction`), `GET /api/inventario`, `/api/inventario/movimientos` | — |

---

## C. Criterios de aceptación

**BL-01** — *Login válido entrega JWT; sin token 401; sin rol 403; acceso denegado auditado.*
Evidencia: pruebas `api.test.js` #1–#5, #16, #17. Resultado real: **PASA**. Captura manual pendiente:
pantalla de login y respuesta 403 en la web.

**BL-02** — *Al menos un flujo donde el móvil registra y la web consulta sobre el mismo backend.*
Evidencia: cosecha creada en iPhone visible vía API en la BD que usa la web. Resultado real:
**CUMPLE** (verificado en vivo 2026-11-16). Prueba automatizada relacionada: #9 (cosecha consultable
con su origen).

**BL-03** — *Se registra predio, fecha, responsable, especie y volumen; el origen queda consultable.*
Evidencia: pruebas #6–#9. Resultado real: **PASA**. Captura manual pendiente: registro móvil y
detalle de cosecha con su predio.

**BL-04** — *La recepción compara despachado vs recibido, registra la diferencia y exige resolución/
incidencia cuando corresponde.* Evidencia: pruebas #10–#13. Resultado real: **PASA**.

**BL-05** — *Recepción + movimiento + inventario + cambio de estado + auditoría de forma atómica;
si algo falla, se revierte todo.* Evidencia: pruebas #14 y #14b. Resultado real: **PASA**.

Incumplimientos/riesgos detectados: ninguno en la lógica probada. Riesgo externo: cold start y
posible expiración de la BD gratuita de Render (ver sección M y N).

---

## D. Rúbrica (matriz de cumplimiento)

| Indicador | Estado | Evidencia o archivo | Qué falta para nivel excelente |
|---|---|---|---|
| 2.1.1.1 Diagrama de topología | **COMPLETO Y VERIFICADO** | `docs/evaluacion3/01_TOPOLOGIA.md` + `diagramas/topologia.mmd` (Mermaid, se renderiza en GitHub) | (Opcional) exportar a SVG/PNG |
| 2.1.1.2 Diagrama de infraestructura | **COMPLETO Y VERIFICADO** | `02_INFRAESTRUCTURA.md` + `diagramas/infraestructura.mmd` + `render.yaml` | (Opcional) SVG/PNG |
| 2.1.1.3 Diagrama de arquitectura | **COMPLETO Y VERIFICADO** | `03_ARQUITECTURA.md` + `diagramas/arquitectura.mmd` | (Opcional) SVG/PNG |
| 2.1.2.4 Análisis cualitativo/cuantitativo de tecnologías | **COMPLETO Y VERIFICADO** | `04_ANALISIS_TECNOLOGIAS.md` (matrices ponderadas 1–5) | — |
| 2.1.2.5 Selección y justificación de herramientas/lenguajes/servicios | **COMPLETO Y VERIFICADO** | `05_SELECCION_Y_JUSTIFICACION.md` | — |
| 2.1.3.6 Criterios de aceptación y estándares normativos | **COMPLETO Y VERIFICADO** | `06_CRITERIOS_Y_NORMAS.md` + pruebas (20/20); normas OWASP, IEEE 830, BPMN, Ley 19.628/21.719 con fuentes | Validar vigencia legal definitiva antes de producción |
| 2.1.3.7 Buenas prácticas, rendimiento y seguridad | **COMPLETO Y VERIFICADO** | `07_SEGURIDAD_RENDIMIENTO.md` (seguridad por archivo + **mediciones de rendimiento reales**) | Mediciones de la **API desplegada** (procedimiento manual indicado) |

> Nota: los **siete indicadores** cuentan con archivo/diagrama/matriz/medición concreta en
> `docs/evaluacion3/` y coinciden con `docs/evaluacion3/08_MATRIZ_CUMPLIMIENTO_RUBRICA.md`. Lo que
> resta para "Excelente" es evidencia manual (capturas y mediciones de la API desplegada), la
> primera ejecución real del CI y validaciones legales; opcionalmente, exportar los diagramas a
> imagen.

---

## E. Seguridad (implementado y probado)

| Punto | Estado | Archivo |
|---|---|---|
| JWT con expiración | ✅ implementado y probado (#1) | `utils/jwt.js` (`expiresIn`), `config/env.js` |
| Bcrypt (hash de contraseñas) | ✅ implementado y probado (#2) | `utils/password.js` (bcryptjs), `prisma/seed.js` |
| Roles y permisos en backend | ✅ implementado y probado (#4, #16) | `middlewares/authorize.js` (verificación en servidor) |
| Respuestas 401 / 403 | ✅ probado (#3, #4) | `middlewares/authenticate.js`, `middlewares/authorize.js`, `utils/ApiError.js` |
| Validación de entradas | ✅ probado (#8, #11, #12) | `middlewares/validate.js` + `*.validators.js` (Zod) |
| Helmet | ✅ implementado | `app.js` (`app.use(helmet())`) |
| Limitación de intentos de login | ✅ implementado | `middlewares/rateLimit.js` (relajado solo en entorno de test) |
| CORS configurable | ✅ implementado | `app.js` + `CORS_ORIGINS` (env) |
| Variables de entorno | ✅ implementado | `config/env.js` (validación Zod), `.env.example` |
| Auditoría | ✅ probado (#5) | `utils/audit.js`; acciones: LOGIN, ACCESO_DENEGADO, CREAR_PREDIO/COSECHA, CONFIRMAR_RECEPCION, ACTUALIZAR_INVENTARIO, RECEPCION_DUPLICADA |
| Manejo seguro de errores (sin trazas) | ✅ implementado | `middlewares/error.js` |
| Protección de secretos | ✅ `.gitignore` excluye `.env`; solo `.env.example` versionado | `.gitignore`, `*/.env.example` |
| Transacción de inventario en PostgreSQL | ✅ probado (#14, #14b) | `modules/despachos/despachos.service.js` (`prisma.$transaction`) |

---

## F. Pruebas y verificaciones (resultados reales 2026-11-16)

**Comandos ejecutados y resultado real:**

| Comando | Resultado |
|---|---|
| `npm ci` | OK (instalación limpia de API y Web; cliente Prisma generado en postinstall) |
| `npm ci --prefix apps/mobile` | OK (instalación limpia de la app móvil desde su `package-lock.json`) |
| `pg_isready` | `127.0.0.1:5432 - accepting connections` |
| `npm run db:seed` | OK — 4 usuarios, 3 predios, 3 cosechas, 4 despachos, 2 inventarios iniciales |
| `npm run lint:api` | **exit 0** (sin errores) |
| `npm run lint:web` | **exit 0** (sin errores) |
| `npm test` | **20 pruebas, 20 aprobadas, 0 fallidas** (17 criterios de la pauta + rollback + concurrencia + autorización) |
| `npm run build:web` | **OK** — 44 módulos; `dist/assets/index-*.js` 190.29 kB (gzip 60.37 kB) |
| Arranque API (`node src/server.js`) | **OK** — `GET /api/health` → `{"status":"ok","db":"ok"}` |
| Móvil (Expo) | Sintaxis **17/17**; `expo export --platform android` OK (848 módulos); `expo-doctor` **20/20 en GitHub** (18/20 local por red); ver nota abajo |

**Salida resumida real de `npm test`:**
```
 ✓ tests/api.test.js (20 tests) 1388ms
 Test Files  1 passed (1)
      Tests  20 passed (20)
   Duration  1.91s
```

**Pruebas fallidas:** ninguna.
**Cobertura:** no se midió (no se ejecutó cobertura; no se reporta un número inventado).

**Nota sobre Expo (honesta):** la app móvil **real multiarchivo** se validó así: (1)
**`npm ci --prefix apps/mobile`** — instalación limpia reproducible desde su lockfile (OK);
(2) **`npx expo export --platform android`** — Metro empaquetó el bundle correctamente (848 módulos,
bundle `.hbc`); (3) **`npx expo-doctor`** — **20/20 en GitHub Actions** (localmente 18/20: el sandbox
bloquea `exp.host` y React Native Directory; en GitHub, con red, pasan todos los checks, incluido el
de esquema tras el fix de `splash`); (4) **sintaxis 17/17** archivos con esbuild. La app real
multiarchivo **NO se ejecutó en un teléfono**.
En cambio, la **variante de archivo único** `apps/mobile/snack/App.js` (Expo Snack) **sí se ejecutó en
un iPhone físico** vía Expo Go, creando un predio y una cosecha que persistieron en la base de datos
compartida (confirmado por consulta a la API).

**Nota sobre Prisma/migraciones (honesta):** en este sandbox la descarga del motor nativo de Prisma
(`binaries.prisma.sh`) está bloqueada por red, por lo que `prisma migrate deploy` no corre aquí; la
migración versionada `prisma/migrations/0_init/migration.sql` se aplicó con `psql` y el **runtime usa
el motor WebAssembly** (`engineType = "client"` + `@prisma/adapter-pg`), sin binario nativo. En el
**despliegue real en Render sí se ejecutó `npm run db:migrate` (`prisma migrate deploy`) + seed** con
éxito (la API desplegada conecta y responde `db: ok`).

---

## G. Base de datos

**Modelos Prisma** (`apps/api/prisma/schema.prisma`): `User`, `Predio`, `Cosecha`, `Despacho`,
`Recepcion`, `InventoryItem`, `InventoryMovement`, `AuditLog`.

**Relaciones principales:**
- `Cosecha` → `Predio` (origen) y → `User` (responsable).
- `Despacho` → `Cosecha?` (opcional) y → `User` (creador).
- `Recepcion` → `Despacho` (1:1, `despachoId` único) y → `User` (receptor).
- `InventoryMovement` → `InventoryItem`, → `Recepcion?`, → `User`.
- `AuditLog` → `User?`.

**Migraciones:** `prisma/migrations/0_init/migration.sql` (+ `migration_lock.toml`). Crea 5 enums,
8 tablas, índices y claves foráneas.

**Datos del seed** (idempotente, `prisma/seed.js`): 4 usuarios demo (uno por rol, bcrypt), 3 predios,
3 cosechas, 4 despachos PENDIENTE, inventario inicial (Pino 150 m³, Roble 40 m³).

**Tipos decimales:** todos los volúmenes/cantidades usan `Decimal` (`@db.Decimal(12,3)` o `(14,3)`)
para evitar errores de punto flotante.

**No recibir dos veces un despacho:** doble defensa — (1) el servicio rechaza con `409
DESPACHO_YA_RECIBIDO` si el despacho ya está `RECIBIDO` o tiene recepción; (2) restricción **única**
en `Recepcion.despachoId` a nivel de BD.

**Actualización de inventario:** al confirmar recepción se suma el volumen recibido al
`InventoryItem` de la especie (se crea si no existe) y se registra un `InventoryMovement` con saldo
anterior/posterior. No se mantienen saldos paralelos.

**Transacción de recepción:** `prisma.$transaction(async (tx) => { ... })` ejecuta, en una sola
transacción PostgreSQL: (1) crear recepción, (2) crear/actualizar item de inventario, (3) crear
movimiento, (4) cambiar despacho a `RECIBIDO`, (5) registrar auditoría. **Rollback:** si cualquier
paso lanza, toda la transacción se revierte (probado en #14b: un movimiento con FK inválida revierte
también el item creado; recuentos sin cambios).

---

## H. Endpoints

| Método | Endpoint | Roles autorizados | Función | Estado |
|---|---|---|---|---|
| GET | `/api/health` | público | Estado del servicio y BD | ✅ |
| POST | `/api/auth/login` | público | Login, entrega JWT | ✅ |
| GET | `/api/auth/me` | autenticado | Perfil del usuario | ✅ |
| GET | `/api/predios` | ADMIN, TERRENO | Listar predios | ✅ |
| POST | `/api/predios` | ADMIN, TERRENO | Crear predio | ✅ |
| GET | `/api/cosechas` | ADMIN, TERRENO | Listar cosechas (filtros) | ✅ |
| GET | `/api/cosechas/:id` | ADMIN, TERRENO | Detalle con predio de origen | ✅ |
| POST | `/api/cosechas` | ADMIN, TERRENO | Crear cosecha | ✅ |
| GET | `/api/despachos` | ADMIN, BODEGA, GERENCIA | Listar despachos (`?estado=`) | ✅ |
| GET | `/api/despachos/:id` | ADMIN, BODEGA, GERENCIA | Detalle de despacho | ✅ |
| POST | `/api/despachos/:id/recepcion` | ADMIN, BODEGA | Registrar recepción (transacción) | ✅ |
| GET | `/api/recepciones` | ADMIN, BODEGA, GERENCIA | Historial de recepciones | ✅ |
| GET | `/api/inventario` | ADMIN, BODEGA, GERENCIA | Existencias por especie | ✅ |
| GET | `/api/inventario/movimientos` | ADMIN, BODEGA, GERENCIA | Movimientos recientes | ✅ |
| GET | `/api/resumen` | ADMIN, BODEGA, GERENCIA | Indicadores y diferencias | ✅ |
| GET | `/api/auditoria` | ADMIN | Registro de auditoría | ✅ |

Todos los endpoints mínimos de la pauta están implementados. No hay endpoints "fantasma".

---

## I. Aplicación web (`apps/web`)

| Pantalla | Estado | Archivo |
|---|---|---|
| Login | ✅ terminada | `pages/LoginPage.jsx` |
| Inicio/Dashboard (indicadores) | ✅ terminada | `pages/DashboardPage.jsx` |
| Despachos pendientes | ✅ terminada | `pages/DespachosPage.jsx` |
| Registro de recepción (diferencia en vivo) | ✅ terminada | `pages/RecepcionPage.jsx` |
| Recepciones y diferencias | ✅ terminada | `pages/RecepcionesPage.jsx` |
| Inventario | ✅ terminada | `pages/InventarioPage.jsx` |
| Movimientos | ✅ terminada | (incluidos en `InventarioPage.jsx`) |
| Auditoría | ✅ terminada (solo ADMIN) | `pages/AuditoriaPage.jsx` |
| Resumen de diferencias | ✅ terminada | `pages/ResumenPage.jsx` |
| Navegación según rol | ✅ terminada | `components/Layout.jsx`, `components/ProtectedRoute.jsx` |

Build de producción verificado (`npm run build:web` → OK). Desplegada en Render (login real
verificado en vivo).

---

## J. Aplicación móvil (`apps/mobile`)

| Función | Estado | Archivo |
|---|---|---|
| Login | ✅ (probado en iPhone) | `src/screens/LoginScreen.js` |
| Almacenamiento seguro del token | ✅ implementado (`expo-secure-store`) | `src/api/client.js`, `src/context/AuthContext.js` |
| Consulta de predios | ✅ (probado en iPhone) | `src/screens/PrediosScreen.js` |
| Creación de predio | ✅ (probado en iPhone — persistió en BD) | `src/screens/PredioFormScreen.js` |
| Registro de cosecha | ✅ (probado en iPhone — persistió en BD) | `src/screens/CosechaFormScreen.js` |
| Validaciones (volumen>0, campos, fecha) | ✅ implementado | `src/screens/CosechaFormScreen.js` |
| Consulta del origen de la cosecha | ✅ implementado | `src/screens/CosechaDetailScreen.js` |
| Conexión con la API real | ✅ (probado contra Render) | `src/api/client.js` |
| Configuración de la URL de API | ✅ fuente única | `src/api/config.js` (`EXPO_PUBLIC_API_URL` / `app.json` → Render) |

> La variante `apps/mobile/snack/App.js` (archivo único para Expo Snack) usa el **token en memoria**
> en vez de SecureStore, solo para simplificar el demo sin instalar nada. La app "real"
> (`apps/mobile`, multi-archivo) sí usa SecureStore.

---

## K. Usuarios de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| ADMIN | `admin@bosquesur.cl` | `Admin123*` |
| TERRENO | `terreno@bosquesur.cl` | `Terreno123*` |
| BODEGA | `bodega@bosquesur.cl` | `Bodega123*` |
| GERENCIA | `gerencia@bosquesur.cl` | `Gerencia123*` |

Son credenciales creadas **expresamente para demostración** (definidas en `prisma/seed.js`). No son
secretos reales.

---

## L. Ejecución (comandos exactos, en orden)

```bash
# 1. Instalar dependencias (API + Web)
npm install

# 2. Crear/levantar la base de datos (PostgreSQL con Docker)
npm run db:up

# 3. Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. Migraciones
npm run db:migrate

# 5. Seed
npm run db:seed

# 6. Iniciar API
npm run dev:api            # o: npm run start:api

# 7. Iniciar web
npm run dev:web

# 8. Iniciar app móvil
cd apps/mobile && npm install && npx expo start

# 9. Pruebas
npm test

# 10. Linter
npm run lint

# 11. Compilar la web
npm run build:web
```

**Puertos:** API `4000`, Web `5173` (preview `4173`), Expo `8081`, PostgreSQL `5432`.

**Teléfono físico con la API:** la app ya apunta por defecto a la API de Render
(`https://bosquesur-api.onrender.com/api`), así que el teléfono solo necesita internet. Para apuntar
a una API **local**, crear `apps/mobile/.env` con `EXPO_PUBLIC_API_URL=http://<IP-LOCAL-DEL-PC>:4000/api`
(no `localhost`), con el PC y el teléfono en la **misma red Wi-Fi**; o usar `npx expo start --tunnel`.
Requisito: Node ≥ 22.18.

---

## M. Despliegue

| Elemento | Estado |
|---|---|
| Web desplegada | ✅ https://bosquesur-web.onrender.com |
| API desplegada | ✅ https://bosquesur-api.onrender.com/api (`db: ok`) |
| PostgreSQL | ✅ configurado en Render (gestionado) |
| Blueprint | ✅ `render.yaml` |

**Variables a configurar** (ya definidas en el blueprint): `DATABASE_URL` (desde la BD de Render),
`JWT_SECRET` (autogenerado), `JWT_EXPIRES_IN`, `CORS_ORIGINS` (dominio de la web), `VITE_API_URL`
(dominio de la API), `NODE_VERSION=22.18.0`.

**Pasos que requieren GitHub/Render:** ya realizados (repo creado y poblado; Blueprint aplicado).
Para re-desplegar: push a `main` (auto-sync) o re-aplicar el Blueprint.

**Cold start:** en plan gratuito los servicios "duermen" tras ~15 min de inactividad; la primera
petición puede tardar ~50 s. La base de datos gratuita puede expirar tras un periodo (Render avisa).

---

## N. Lista honesta de pendientes

**Funcionalidades incompletas:** ninguna dentro del alcance de la Evaluación 3 (BL-01 a BL-05 están
completas y probadas).

**Errores conocidos:** ninguno en la lógica probada.

**Pruebas faltantes:** no se midió cobertura; no hay prueba E2E de UI (Playwright) — mencionada como
opcional en la pauta. La app móvil **real multiarchivo** se validó por **empaquetado** (`expo export`
Android), **`expo-doctor` (20/20 en GitHub)** y **sintaxis (17/17)**, pero **no se ejecutó en un teléfono**; la
**variante Snack** sí se ejecutó en un iPhone real.

**Documentos/diagramas de la rúbrica:** **completos** en `docs/evaluacion3/` — topología,
infraestructura y arquitectura (diagramas **Mermaid**), análisis cualitativo/cuantitativo, selección y
justificación, criterios y normas, seguridad y rendimiento (con mediciones reales), matriz de
cumplimiento, checklist y evidencias. (Ya no son un pendiente.)

**Pendientes reales (requieren intervención manual):**
- **Capturas manuales** de evidencia web y móvil — índice **E01–E24** en
  `docs/evaluacion3/evidencias/README.md`.
- **App móvil multiarchivo ejecutada en un dispositivo** (captura en teléfono/emulador).
- **Mediciones de la API desplegada** (procedimiento con Postman/DevTools).
- **Validación legal** (vigencia de la Ley 21.719) antes de una implementación productiva.

**Configuraciones externas pendientes:** ninguna obligatoria (todo desplegado). Opcional: guardar el
Snack del móvil bajo una cuenta de Expo para un enlace permanente.

**Riesgos para la evaluación:**
1. **Cold start / expiración de la BD gratuita** de Render el día de la demo — calentar antes y no
   dejar la demostración para después de que expire la base.
2. Evidencias (capturas) manuales aún no tomadas (el CI ya corrió en GitHub con éxito).
