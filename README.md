# BosqueSur ES3 — Prototipo de trazabilidad (Sprint 1)

Prototipo funcional para la **Evaluación Sumativa 3** del ramo *Proyecto de Integración (TIHI63)*.
Caso: **BosqueSur Maderas SpA**, empresa forestal que necesita mejorar la trazabilidad de la
materia prima y controlar las diferencias entre lo despachado y lo recibido, evitando descuadres
de inventario y registros paralelos.

> 🚀 **¿Solo quieres probarlo o mostrarlo?** Está todo desplegado. Ve directo a
> **[`docs/GUIA_EQUIPO.md`](docs/GUIA_EQUIPO.md)** (URLs en vivo, usuarios demo, y cómo
> probar web y móvil sin instalar nada).

## Problema abordado

Hoy existe el riesgo de mantener registros inconsistentes entre **terreno**, **bodega** y
**oficina**. Este prototipo demuestra que la captura de datos en terreno (app móvil) y las
operaciones de bodega (app web) usan **una misma API REST** y **una sola base de datos**,
manteniendo el **inventario como fuente única de información**.

## Alcance de la Evaluación 3 (Sprint 1)

Los cinco elementos de mayor prioridad del Product Backlog, funcionando de punta a punta:

| ID | Funcionalidad | Dónde |
|----|---------------|-------|
| **BL-01** | Autenticación, roles y permisos (JWT + bcrypt + auditoría) | API |
| **BL-02** | Integración mediante una API REST común (JSON, validación, errores controlados) | API |
| **BL-03** | Registro de predio y cosecha desde la app móvil | Móvil |
| **BL-04** | Despacho y recepción con cálculo de diferencias | Web |
| **BL-05** | Actualización automática de inventario en una transacción atómica | API/Web |

Fuera de alcance (sprints/evaluaciones posteriores): producción, códigos QR, secado/impregnado,
movimientos entre bodegas, pedidos, compras, reportería gerencial avanzada, integración con el SII,
facturación electrónica y app iOS publicada. Ver sección *Trabajo futuro*.

## Tecnologías

- **Monorepo**: npm workspaces.
- **Backend**: Node.js + Express + JavaScript (ESM).
- **Base de datos**: PostgreSQL 16.
- **ORM**: Prisma 6 (motor **queryCompiler/WebAssembly** + driver adapter `@prisma/adapter-pg`, sin binario nativo).
- **Web**: React 18 + Vite.
- **Móvil**: React Native + Expo (SDK 52), con `expo-secure-store` para el JWT.
- **Autenticación**: JWT con expiración; contraseñas con hash **bcrypt** (`bcryptjs`).
- **Seguridad**: `helmet`, CORS configurable, rate limit de login, validación con **Zod**, auditoría.
- **Pruebas**: Vitest + Supertest.
- **Despliegue previsto**: Render (API + Web + PostgreSQL); móvil con Expo Go.

> **Requisito de Node:** `>= 22.18`. El cliente Prisma usa el motor WebAssembly y archivos `.ts`
> generados que Node ejecuta con *type stripping* nativo (disponible desde Node 22.18). Así el
> proyecto corre **sin descargar binarios nativos de Prisma**.

## Arquitectura

```
┌──────────────┐        ┌──────────────┐
│  App Móvil   │        │   App Web    │
│ (Expo/RN)    │        │ (React/Vite) │
│  TERRENO     │        │ BODEGA/GER.  │
└──────┬───────┘        └──────┬───────┘
       │     HTTP/JSON (JWT)   │
       └───────────┬──────────-┘
                   ▼
          ┌──────────────────┐
          │   API REST        │
          │ Express + Prisma  │
          │ (una sola API)    │
          └────────┬──────────┘
                   ▼
          ┌──────────────────┐
          │   PostgreSQL      │
          │ Inventario =      │
          │ fuente única      │
          └──────────────────┘
```

## Estructura de carpetas

```
bosquesur-es3/
  apps/
    api/              # API REST (Express + Prisma)
      prisma/         # schema, migraciones y seed
      src/
        config/       # carga y validación de variables de entorno
        db/           # cliente Prisma (adapter pg)
        middlewares/  # auth, authorize, validate, error, rateLimit
        modules/      # auth, predios, cosechas, despachos, recepciones, inventario, auditoria, resumen, health
        utils/        # ApiError, respuestas, jwt, password, audit
        generated/    # cliente Prisma generado (no se versiona)
      tests/          # pruebas Vitest + Supertest
    web/              # app web de bodega (React + Vite)
    mobile/           # app móvil de terreno (Expo + React Native)
  docs/               # API.md, PRUEBAS_Y_EVIDENCIAS.md, GUIA_DEMO.md, colección API
  docker-compose.yml  # PostgreSQL local
  render.yaml         # despliegue en Render
  package.json        # workspaces y scripts raíz
```

## Requisitos previos

- **Node.js >= 22.18** y npm.
- **Docker** (para PostgreSQL local con `docker-compose.yml`) o un PostgreSQL 16 propio.

## Instalación paso a paso

```bash
# 1. Clonar e instalar dependencias (API + Web)
git clone <URL-del-repo> bosquesur-es3
cd bosquesur-es3
npm install

# 2. Variables de entorno
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Levantar PostgreSQL local
npm run db:up           # docker compose up -d

# 4. Aplicar migraciones y poblar datos de demostración
npm run db:migrate      # prisma migrate deploy
npm run db:seed

# 5. Ejecutar API + Web (en paralelo)
npm run dev

# 6. App móvil (en otra terminal)
cd apps/mobile
npm install
cp .env.example .env     # ajustar EXPO_PUBLIC_API_URL con la IP local del PC
npm start                # abrir con Expo Go
```

> Si tu red bloquea la descarga de los binarios de Prisma al generar el cliente, ejecuta los
> comandos de Prisma con `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`. El motor en ejecución es
> WebAssembly, por lo que **no se requiere ningún binario nativo** para correr la API.
>
> Si además `prisma migrate deploy` no puede descargar su *schema-engine*, aplica el esquema
> directamente con el SQL versionado:
> `psql "$DATABASE_URL" -f apps/api/prisma/migrations/0_init/migration.sql` y luego `npm run db:seed`.

## Variables de entorno

**API** (`apps/api/.env`):

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://bosquesur:bosquesur_dev@localhost:5432/bosquesur_es3?schema=public` |
| `API_PORT` | Puerto de la API | `4000` |
| `JWT_SECRET` | Secreto de firma JWT | *(cadena larga y aleatoria)* |
| `JWT_EXPIRES_IN` | Expiración del token | `8h` |
| `CORS_ORIGINS` | Orígenes permitidos (coma) | `http://localhost:5173` |
| `LOGIN_RATE_MAX` | Máx. intentos de login / 15 min | `10` |

**Web** (`apps/web/.env`): `VITE_API_URL` (ej. `http://localhost:4000/api`).

**Móvil** (`apps/mobile/.env`): `EXPO_PUBLIC_API_URL` (usar la **IP local** del PC, no `localhost`).

## Comandos disponibles

Desde la raíz:

| Comando | Acción |
|---------|--------|
| `npm run db:up` / `npm run db:down` | Levanta / detiene PostgreSQL (Docker) |
| `npm run db:migrate` | Aplica migraciones (`prisma migrate deploy`) |
| `npm run db:seed` | Puebla datos de demostración |
| `npm run db:reset` | Reinicia la base, migra y vuelve a sembrar |
| `CONFIRM_DEMO_RESET=SI npm run demo:reset` | Reinicio seguro de datos de demostración (con confirmación) |
| `npm run dev` | API + Web en paralelo |
| `npm run dev:api` / `dev:web` / `dev:mobile` | Cada app por separado |
| `npm run build:web` | Compila la web para producción |
| `npm test` | Ejecuta las pruebas de la API |
| `npm run lint` | Linter de API y Web |

Puertos: **API** `4000`, **Web** `5173` (preview `4173`), **Expo** `8081`, **PostgreSQL** `5432`.

## Usuarios de demostración

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| ADMIN | `admin@bosquesur.cl` | `Admin123*` |
| TERRENO | `terreno@bosquesur.cl` | `Terreno123*` |
| BODEGA | `bodega@bosquesur.cl` | `Bodega123*` |
| GERENCIA | `gerencia@bosquesur.cl` | `Gerencia123*` |

> Contraseñas **solo de demostración**. No son secretos reales.

## Pruebas

```bash
npm test          # Vitest + Supertest contra una base de prueba
```

Son **20 pruebas**: los 17 criterios del punto 10 de la pauta más rollback, concurrencia de
inventario y autorización (login/JWT, 401/403, auditoría de accesos
denegados, registro de predio/cosecha, validación de volumen, recepción exacta y con diferencia,
atomicidad de la transacción de inventario, etc.). Ver `docs/PRUEBAS_Y_EVIDENCIAS.md`.

## Documentación de la Evaluación 3 (rúbrica)

La carpeta [`docs/evaluacion3/`](docs/evaluacion3/) contiene los entregables de la rúbrica:
diagramas de **topología**, **infraestructura** y **arquitectura** (Mermaid), **análisis cualitativo
y cuantitativo** de tecnologías, **selección y justificación**, **criterios y normas**, **seguridad y
rendimiento** (con mediciones reales), **matriz de cumplimiento**, **checklist** e **índice de
evidencias**.

## Despliegue

Ver `render.yaml` y `docs/PRUEBAS_Y_EVIDENCIAS.md`. Render provee PostgreSQL gestionado; la API usa
`DATABASE_URL`, la web usa `VITE_API_URL` y Expo usa `EXPO_PUBLIC_API_URL`. El comando de
construcción de la API ejecuta `prisma migrate deploy`.

## Nota sobre el monorepo y la app móvil

Los workspaces de npm incluyen **`apps/api`** y **`apps/web`**. La app móvil **`apps/mobile`** se
mantiene como **instalación separada (fuera de los workspaces)** de forma deliberada: Expo/Metro
tiene supuestos propios sobre la resolución de `node_modules` y el *hoisting* de dependencias que, al
compartir el `node_modules` raíz, puede romper el empaquetado. Por eso se instala aparte
(`cd apps/mobile && npm install`). De todos modos existe el comando raíz **`npm run dev:mobile`**
para iniciarla. Si en el futuro se desea unificarla en los workspaces, debe añadirse un
`metro.config.js` con `watchFolders`/`nodeModulesPaths` y verificarse en un entorno con Expo.

## Limitaciones conocidas

- La app móvil se ejecuta mediante **Expo Go**; no hay build nativa publicada (iOS/Android store).
- El selector de fecha de la cosecha usa texto `AAAA-MM-DD` para mantener el prototipo simple.
- El inventario registra la cantidad **recibida** como entrada; una recepción `RECHAZADO` igual
  deja traza del movimiento y de la incidencia (la baja/ajuste posterior pertenece a otro sprint).
- El plan gratuito de Render puede tener *cold start* (ver `docs/PRUEBAS_Y_EVIDENCIAS.md`).

## Trabajo futuro (fuera del alcance de la Evaluación 3)

Producción de elaborados, códigos QR, secado/impregnado/reproceso, movimientos entre bodegas,
pedidos de clientes, compras externas y aprobaciones, reportería gerencial avanzada, integración
con el SII, facturación electrónica y app iOS publicada. Pertenecen a los Sprints 2 y 3.
