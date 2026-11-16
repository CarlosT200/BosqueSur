# 2.1.3.7 — Buenas prácticas, seguridad y rendimiento

## A. Buenas prácticas

| Práctica | Evidencia (archivo) |
|---|---|
| Arquitectura modular por dominios | `apps/api/src/modules/*` (auth, predios, cosechas, despachos, recepciones, inventario, auditoria, resumen, health) |
| Separación rutas / controladores / servicios / datos | `*.routes.js` · `*.controller.js` · `*.service.js` · `db/prisma.js` |
| Validaciones de entrada | `middlewares/validate.js` + `*.validators.js` (Zod) |
| Manejo centralizado de errores | `middlewares/error.js` |
| Migraciones versionadas | `prisma/migrations/0_init/migration.sql` |
| Seed idempotente | `prisma/seed.js` |
| Reinicio seguro de demostración | `prisma/demo-reset.js` (con confirmación y bloqueo en prod) |
| Variables de entorno validadas | `config/env.js` (Zod), `.env.example` |
| Pruebas automatizadas | `tests/api.test.js` (20 pruebas) |
| Linter | `eslint.config.js` (API y Web) |
| Control de versiones | Git / GitHub |
| API documentada | `docs/API.md` + colección Postman |
| Nombres y responsabilidades coherentes | módulos homogéneos (ruta→controlador→servicio) |

## B. Seguridad

| Control | Archivo | Prueba que lo verifica |
|---|---|---|
| JWT con expiración | `utils/jwt.js`, `config/env.js` | #1 |
| Bcrypt (hash) | `utils/password.js`, `prisma/seed.js` | #2 |
| Autorización en el backend | `middlewares/authorize.js` | #4, #16, #19 |
| Respuestas 401 / 403 | `middlewares/authenticate.js`, `authorize.js`, `utils/ApiError.js` | #3, #4 |
| Helmet | `app.js` | — |
| CORS configurable | `app.js` (`CORS_ORIGINS`) | — |
| Rate limiting (login) | `middlewares/rateLimit.js` | — |
| Validación (Zod) | `middlewares/validate.js`, `*.validators.js` | #8, #11, #12 |
| Prisma (consultas parametrizadas) | `db/prisma.js`, servicios | — |
| Auditoría | `utils/audit.js`, tabla `audit_logs` | #5 |
| Protección de secretos | `.gitignore`, `*/.env.example` | — |
| HTTPS | despliegue Render (TLS gestionado) | — |
| SecureStore (token) en la app móvil **real** | `apps/mobile/src/api/client.js`, `context/AuthContext.js` | — |
| Transacción atómica + sin pérdida en concurrencia | `despachos.service.js` (`$transaction`, incremento atómico) | #14, #14b, #18 |

> La variante **Snack** del móvil (`apps/mobile/snack/App.js`) guarda el token **en memoria** para
> simplificar el demo sin instalar nada; la app móvil **real** (`apps/mobile/`) usa **SecureStore**.

## C. Rendimiento (mediciones reales)

**Procedimiento:** se realizó una petición de **calentamiento** previa (descartada) y luego **3
mediciones** por operación. El **cold start** del plan gratuito de Render se registra **por separado**
y **no** se incluye en los promedios.

### C.1 API — ambiente LOCAL
- **Ambiente:** Node.js v22.23.4, PostgreSQL 16 local, misma máquina (sin red). **Fecha:** 2026-11-16.
- **Herramienta:** `curl -w "%{time_total}"`, 3 corridas.

| Operación | M1 (ms) | M2 (ms) | M3 (ms) | Promedio (ms) | Objetivo | ¿Cumple? |
|---|--:|--:|--:|--:|---|:--:|
| `GET /api/health` | 2 | 2 | 2 | **2** | < 500 ms | ✅ |
| `POST /api/auth/login` | 89 | 87 | 108 | **95** | < 1500 ms | ✅ |
| `GET /api/inventario` | 5 | 4 | 3 | **4** | < 500 ms | ✅ |
| `GET /api/despachos?estado=PENDIENTE` | 19 | 5 | 5 | **10** | < 500 ms | ✅ |
| `POST /api/despachos/:id/recepcion` | 29 | 19 | 18 | **22** | < 1500 ms | ✅ |

Observación: `login` es el endpoint más lento por el **costo de bcrypt** (comportamiento esperado y
deseable en seguridad); aun así, muy por debajo del objetivo de escritura.

### C.2 Web — ambiente DESPLEGADO (Render)
- **Ambiente:** app web estática en Render, medida desde el navegador con la API de *Navigation
  Timing* (`loadEventEnd - startTime`), **en caliente**. **Fecha:** 2026-11-16.

| Operación | M1 (ms) | M2 (ms) | M3 (ms) | Promedio (ms) | Objetivo | ¿Cumple? |
|---|--:|--:|--:|--:|---|:--:|
| Carga inicial de la web (caliente) | 71 | 352 | 57 | **~160** | < 3000 ms | ✅ |

### C.3 Cold start (registrado por separado)
En la **primera** petición tras inactividad, el servicio gratuito de Render tardó **más de 45 s** en
responder (una medición automatizada se interrumpió por este motivo), consistente con el cold start
del plan gratuito (~50 s). **No se incluye en los promedios**; mitigación: calentar la API/web antes
de la demostración.

### C.4 Mediciones pendientes (procedimiento manual para el equipo)
Para registrar tiempos **de la API desplegada** (no solo local), el equipo puede medir con Postman
(etiqueta *Time* de la respuesta) o con la pestaña *Network* del navegador, siguiendo
`docs/PRUEBAS_Y_EVIDENCIAS.md`, y completar una tabla equivalente a C.1 con ambiente "Render
(desplegado)". No se inventan esos valores aquí.

**Conclusión de rendimiento:** en las mediciones realizadas, **todas** las operaciones cumplen los
objetivos del informe (lecturas < 500 ms, escrituras < 1,5 s, carga web < 3 s), con el cold start como
única salvedad conocida, documentada y ajena al rendimiento en régimen normal.
