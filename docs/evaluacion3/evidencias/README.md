# Evidencias — Evaluación Sumativa 3

Índice de evidencias. **No se generan imágenes falsas ni simuladas.** Las capturas que requieren un
teléfono o interacción manual quedan asignadas al equipo y marcadas como pendientes.

Estado: `GENERADA` (archivo presente aquí) · `PENDIENTE` (debe capturarla el responsable).

| ID | Evidencia | Archivo esperado | Estado | Responsable |
|---|---|---|---|---|
| E01 | Pantalla de login (web) | `evidencias/e01_login_web.png` | PENDIENTE | Equipo |
| E02 | Navegación diferenciada por rol | `evidencias/e02_nav_rol.png` | PENDIENTE | Equipo |
| E03 | Respuesta 401 (sin token) | `evidencias/e03_401.png` | PENDIENTE | Equipo |
| E04 | Respuesta 403 (sin permiso) | `evidencias/e04_403.png` | PENDIENTE | Equipo |
| E05 | Auditoría del acceso denegado | `evidencias/e05_auditoria_403.png` | PENDIENTE | Equipo |
| E06 | Registro móvil de predio | `evidencias/e06_movil_predio.png` | PENDIENTE | Equipo (teléfono) |
| E07 | Registro móvil de cosecha | `evidencias/e07_movil_cosecha.png` | PENDIENTE | Equipo (teléfono) |
| E08 | Consulta del origen de la cosecha | `evidencias/e08_origen.png` | PENDIENTE | Equipo (teléfono) |
| E09 | Lista de despachos pendientes | `evidencias/e09_despachos.png` | PENDIENTE | Equipo |
| E10 | Recepción exacta | `evidencias/e10_recepcion_exacta.png` | PENDIENTE | Equipo |
| E11 | Recepción con diferencia | `evidencias/e11_recepcion_diferencia.png` | PENDIENTE | Equipo |
| E12 | Selección de resolución obligatoria | `evidencias/e12_resolucion.png` | PENDIENTE | Equipo |
| E13 | Inventario antes de la recepción | `evidencias/e13_inventario_antes.png` | PENDIENTE | Equipo |
| E14 | Inventario después de la recepción | `evidencias/e14_inventario_despues.png` | PENDIENTE | Equipo |
| E15 | Movimiento automático de inventario | `evidencias/e15_movimiento.png` | PENDIENTE | Equipo |
| E16 | Registro de auditoría | `evidencias/e16_auditoria.png` | PENDIENTE | Equipo |
| E17 | Pruebas automatizadas aprobadas (salida real) | `evidencias/e17_npm_test.txt` | PENDIENTE | Equipo (pegar salida de `npm test`) |
| E18 | Linter sin errores | `evidencias/e18_lint.txt` | PENDIENTE | Equipo |
| E19 | Build de la web | `evidencias/e19_build.txt` | PENDIENTE | Equipo |
| E20 | Web desplegada (URL en vivo) | `evidencias/e20_web_desplegada.png` | PENDIENTE | Equipo |
| E21 | API desplegada (`/api/health`) | `evidencias/e21_api_health.png` | PENDIENTE | Equipo |
| E22 | App móvil **real** en dispositivo/emulador | `evidencias/e22_movil_real.png` | PENDIENTE | Equipo (teléfono/emulador) |
| E23 | Mediciones de rendimiento (API desplegada) | `evidencias/e23_rendimiento.md` | PENDIENTE | Equipo |
| E24 | Diagramas (topología/infra/arquitectura) | `docs/evaluacion3/diagramas/*.mmd` + `01..03_*.md` | **GENERADA** | — |

## Notas
- Las evidencias **E24** (diagramas) ya están en el repositorio y GitHub las renderiza.
- Para **E17–E19**, basta pegar la salida real de `npm test`, `npm run lint` y `npm run build:web`.
- Las capturas **móviles (E06–E08, E22)** requieren un teléfono con Expo Go; el equipo las toma.
- **App móvil real (multiarchivo) — validación de empaquetado (ya realizada, a nivel de código, no
  imagen):** `npm ci --prefix apps/mobile` (instalación limpia OK) + `npx expo export --platform
  android` (Metro empaqueta el bundle `.hbc`) + `npx expo-doctor` (18/20; 2 fallos solo por falta de
  red a `exp.host`/RN Directory). Esto **no** es ejecución en dispositivo; E22 (captura en
  dispositivo/emulador) sigue pendiente del equipo. La variante **Snack** sí se ejecutó en un iPhone.
- No se generaron capturas automáticas con Playwright en este entorno porque **no fue posible
  instalar el navegador headless** (descarga bloqueada por la red del entorno de trabajo). Para
  generarlas localmente: `npx playwright install chromium` y un script que navegue a la web
  desplegada; alternativamente, capturas manuales del navegador.
