# Matriz final de cumplimiento de la rúbrica

Estados posibles: `COMPLETO Y VERIFICADO` · `COMPLETO PENDIENTE DE EVIDENCIA MANUAL` · `PARCIAL` ·
`NO IMPLEMENTADO`.

> Un indicador se marca completo solo si existe un **archivo, diagrama, matriz, prueba o medición
> concreta** que lo respalde (no basta texto explicativo).

| Indicador | Evidencia principal | Evidencias complementarias | Estado | Qué falta |
|---|---|---|---|---|
| **2.1.1.1 Topología** | `docs/evaluacion3/01_TOPOLOGIA.md` + `diagramas/topologia.mmd` (Mermaid renderizable en GitHub) | Explicación de patrón cliente-servidor, protocolos, puertos | **COMPLETO Y VERIFICADO** | (Opcional) exportar SVG/PNG en un entorno con render de Mermaid |
| **2.1.1.2 Infraestructura** | `02_INFRAESTRUCTURA.md` + `diagramas/infraestructura.mmd` | `render.yaml`, distinción local/desplegado, restricciones plan gratuito | **COMPLETO Y VERIFICADO** | (Opcional) SVG/PNG |
| **2.1.1.3 Arquitectura** | `03_ARQUITECTURA.md` + `diagramas/arquitectura.mmd` | Diagramas de flujo (cosecha, recepción) | **COMPLETO Y VERIFICADO** | (Opcional) SVG/PNG |
| **2.1.2.4 Análisis cualitativo y cuantitativo** | `04_ANALISIS_TECNOLOGIAS.md` (matrices ponderadas 1–5) | Backend, frontend, móvil, BD, proveedor + herramientas | **COMPLETO Y VERIFICADO** | — |
| **2.1.2.5 Selección y justificación** | `05_SELECCION_Y_JUSTIFICACION.md` | 21 elementos justificados con uso real en el código | **COMPLETO Y VERIFICADO** | — |
| **2.1.3.6 Criterios de aceptación y normas** | `06_CRITERIOS_Y_NORMAS.md` + `tests/api.test.js` (20/20) | OWASP, IEEE 830, BPMN, Ley 19.628/21.719 con fuentes | **COMPLETO Y VERIFICADO** | Validar vigencia legal definitiva antes de producción (indicado) |
| **2.1.3.7 Buenas prácticas, seguridad y rendimiento** | `07_SEGURIDAD_RENDIMIENTO.md` (mediciones reales) | Seguridad por archivo + pruebas; rendimiento local y web medido | **COMPLETO Y VERIFICADO** | Mediciones de la **API desplegada** (procedimiento manual indicado) |

## Estado del prototipo funcional (soporte de la rúbrica)

| Elemento | Estado | Evidencia |
|---|---|---|
| BL-01 a BL-05 | **COMPLETO Y VERIFICADO** | `tests/api.test.js` (20/20), verificación en vivo |
| Pruebas automatizadas | **COMPLETO Y VERIFICADO** | `npm test` → 20/20 |
| Linter | **COMPLETO Y VERIFICADO** | `npm run lint` → exit 0 |
| Build web | **COMPLETO Y VERIFICADO** | `npm run build:web` → OK |
| Arranque API | **COMPLETO Y VERIFICADO** | `/api/health` → `db: ok` |
| App móvil real (multiarchivo) | **COMPLETO Y VERIFICADO (empaquetado)** | `npm ci --prefix apps/mobile` OK; `expo export --platform android` empaqueta el bundle; `expo-doctor` **20/20 en GitHub** (18/20 local por red); sintaxis 17/17. **No ejecutada en dispositivo** (evidencia visual pendiente) |
| App móvil (variante Snack) | **COMPLETO Y VERIFICADO** | ejecutada en **iPhone físico**; creó predio/cosecha que persistió en la BD compartida |
| Despliegue (web, API, BD) | **COMPLETO Y VERIFICADO** | URLs en vivo (`INFORME_VERIFICACION_ES3.md`, sección M) |
| CI (GitHub Actions) | **COMPLETO Y VERIFICADO** | `.github/workflows/ci.yml` **ejecutado en GitHub Actions** (run `43849653316` y la corrida posterior al fix de `splash`): jobs `build-test` y `mobile-validate` en **success**; 20/20 pruebas; `expo-doctor` 20/20 |
| Capturas de evidencia (web/móvil) | **COMPLETO PENDIENTE DE EVIDENCIA MANUAL** | checklist en `evidencias/README.md` |

## Resumen
Los siete indicadores de la rúbrica cuentan con **archivo/diagrama/matriz/medición concreta** y se
marcan `COMPLETO Y VERIFICADO`. El **CI ya se ejecutó en GitHub Actions con éxito** (ambos jobs). Lo
que resta para "Excelente" es **evidencia manual** (capturas y mediciones de la API desplegada),
además de las validaciones legales y, opcionalmente, exportar los diagramas a imagen.
