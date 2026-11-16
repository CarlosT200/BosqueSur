# Checklist de entrega — Evaluación Sumativa 3

Estado real al 2026-11-16 (verificado localmente). `[x]` hecho · `[ ]` pendiente (responsable).

## Código
- [x] API (Node + Express + Prisma) — `apps/api`
- [x] Web (React + Vite) — `apps/web`
- [x] Móvil (React Native + Expo) — `apps/mobile` (real) + `apps/mobile/snack/App.js` (Snack)
- [x] Base de datos (PostgreSQL) — esquema Prisma
- [x] Migraciones — `apps/api/prisma/migrations/0_init/migration.sql`
- [x] Seed — `apps/api/prisma/seed.js`
- [x] Demo reset seguro — `apps/api/prisma/demo-reset.js` (`npm run demo:reset`)
- [x] Lockfile móvil reproducible — `apps/mobile/package-lock.json` (verificado con `npm ci`)
- [x] Variables de entorno — `.env.example` (raíz, api, web, mobile)
- [x] Sin secretos en el repositorio — `.gitignore` excluye `.env`

## Rúbrica
- [x] Topología — `docs/evaluacion3/01_TOPOLOGIA.md` + `.mmd`
- [x] Infraestructura — `02_INFRAESTRUCTURA.md` + `.mmd`
- [x] Arquitectura — `03_ARQUITECTURA.md` + `.mmd`
- [x] Análisis cualitativo y cuantitativo — `04_ANALISIS_TECNOLOGIAS.md`
- [x] Selección y justificación — `05_SELECCION_Y_JUSTIFICACION.md`
- [x] Criterios y normas — `06_CRITERIOS_Y_NORMAS.md`
- [x] Buenas prácticas — `07_SEGURIDAD_RENDIMIENTO.md` (A)
- [x] Seguridad — `07_SEGURIDAD_RENDIMIENTO.md` (B)
- [x] Rendimiento (mediciones reales) — `07_SEGURIDAD_RENDIMIENTO.md` (C)

## Verificación
- [x] Pruebas — `npm test` → **20/20**
- [x] Linter — `npm run lint` → exit 0 (API y Web)
- [x] Build web — `npm run build:web` → OK
- [x] Aplicación móvil (empaquetado) — `npm ci --prefix apps/mobile` OK; `expo export --platform android` bundle OK; `expo-doctor` **20/20 en GitHub** (18/20 local por red; aviso `splash` corregido); sintaxis 17/17
- [ ] Evidencia visual de la app móvil **en dispositivo** — pendiente (equipo); la variante Snack sí corrió en iPhone
- [x] API — `/api/health` → `db: ok`
- [x] Web — carga medida (desplegada, caliente ~160 ms)
- [ ] Capturas (web y móvil) — **pendiente, equipo** (ver `evidencias/README.md`)
- [~] Mediciones — API local medida; **API desplegada pendiente** (procedimiento en `evidencias`/`PRUEBAS_Y_EVIDENCIAS.md`)
- [x] Guion de presentación — `docs/GUIA_DEMO.md`

## Externo / despliegue
- [x] Repositorio en GitHub — `CarlosT200/BosqueSur`
- [x] Web, API y PostgreSQL desplegados en Render
- [x] CI (GitHub Actions) — **ejecutado con éxito**: jobs `build-test` y `mobile-validate` en success; 20/20 pruebas; `expo-doctor` 20/20
- [x] Publicación de los cambios — **publicado en `main`** (push autorizado); API y Web redesplegadas en Render

Leyenda: `[~]` = parcial / con pendiente asignado.
