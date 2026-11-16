# 2.1.3.6 — Criterios de aceptación y estándares normativos

## A. Criterios de aceptación (BL-01 a BL-05)

| BL | Criterio de aceptación | Implementación | Prueba | Evidencia | Estado |
|---|---|---|---|---|---|
| BL-01 | Login válido entrega JWT; sin token 401; sin rol 403; acceso denegado auditado | `modules/auth/*`, `middlewares/authenticate.js`, `middlewares/authorize.js` | `api.test.js` #1–#5, #16, #17, #19 | Salida `npm test` (20/20); verificado en vivo | **COMPLETO Y PROBADO** |
| BL-02 | Web y móvil consumen la misma API; respuestas JSON consistentes; manejo de errores | `app.js`, `utils/httpResponse.js`, `middlewares/error.js`, `modules/health` | #15; consumo real web (Render) + móvil (iPhone) | Flujo móvil→API→web verificado | **COMPLETO Y PROBADO** |
| BL-03 | Se registra predio, fecha, responsable, especie y volumen; el origen queda consultable | `POST /api/predios`, `POST /api/cosechas`, `GET /api/cosechas/:id` | #6–#9 | Predio/cosecha creados desde iPhone y confirmados vía API | **COMPLETO Y PROBADO** |
| BL-04 | La recepción compara despachado vs recibido, registra la diferencia y exige resolución/observación | `modules/despachos/despachos.service.js`, `POST /api/despachos/:id/recepcion` | #10–#13 | Verificado por curl (dif −2.5, resolución) | **COMPLETO Y PROBADO** |
| BL-05 | Recepción + movimiento + inventario + estado + auditoría atómicos; rollback ante fallo; sin pérdida en concurrencia | `despachos.service.js` (`$transaction`, incremento atómico) | #14, #14b, **#18 (concurrencia)** | Verificado; inventario 150→268 | **COMPLETO Y PROBADO** |

Cada criterio está respaldado por **código + prueba automatizada + resultado real**. Las capturas de
pantalla (evidencia visual) quedan listadas en `evidencias/README.md` como pendientes del equipo.

## B. Estándares y normas de referencia

> **Advertencia de vigencia.** No se afirma el estado legal vigente como definitivo. Las referencias
> legales se citan con fuente y, donde hay cambios en trámite, se indica expresamente que **el estado
> legal debe validarse antes de una implementación productiva**.

### IEEE 830 (referencia histórica de requisitos)
Guía clásica para la especificación de requisitos de software (SRS). Se usa como **referencia
histórica**: el proyecto documenta requisitos funcionales (BL-01 a BL-05) y no funcionales
(seguridad, rendimiento). Nota: IEEE 830 fue reemplazada por ISO/IEC/IEEE 29148; se menciona solo
como marco conceptual.

### BPMN 2.0.2 (modelamiento de procesos)
Notación estándar para modelar procesos de negocio. Aplicable al flujo **despacho → recepción →
diferencia → resolución → inventario**, que en este repositorio se representa con diagramas de flujo
(ver `03_ARQUITECTURA.md`). El modelado BPMN formal del proceso se considera trabajo complementario.

### OWASP Top 10 (seguridad de aplicaciones web)
Referencia de los riesgos más comunes. Aplicación concreta en el proyecto:
- **A01 Control de acceso roto:** autorización por rol verificada **en el backend**
  (`middlewares/authorize.js`), probada (#4, #16, #19).
- **A02 Fallas criptográficas:** contraseñas con **bcrypt**; secretos en variables de entorno; HTTPS
  en el despliegue.
- **A03 Inyección:** consultas parametrizadas vía **Prisma** (no concatenación de SQL).
- **A05 Configuración de seguridad:** **Helmet**, CORS restringido, errores sin trazas internas.
- **A07 Fallas de identificación/autenticación:** **JWT con expiración** + **rate limiting** en login.
- **A09 Fallas de registro/monitoreo:** **auditoría** de accesos y operaciones sensibles.

### Ley N.º 19.628 (Protección de la vida privada)
Ley chilena publicada en **1999**, primera normativa de protección de datos personales. Es la base
que la Ley 21.719 moderniza/reemplaza. Fuente: Biblioteca del Congreso Nacional (LeyChile).

### Ley N.º 21.719 (nuevo régimen de protección de datos personales)
Según las fuentes consultadas, la Ley 21.719 **se publicó en el Diario Oficial el 13 de diciembre de
2024** y, conforme a su **artículo primero transitorio**, su entrada en vigor está prevista para el
**1 de diciembre de 2026**; además crea la Agencia de Protección de Datos Personales y reescribe gran
parte de la Ley 19.628. **Importante:** existe un **proyecto de ley en trámite en el Congreso**
(ingresado en septiembre de 2026; aprobado en primer trámite por el Senado en octubre de 2026) que
propone **postergar su entrada en vigencia a 2027**; mientras ese proyecto no sea ley, rige la fecha
del 1 de diciembre de 2026. **El estado legal definitivo debe validarse con fuentes oficiales antes de
cualquier implementación productiva.**

Fuentes consultadas (noviembre 2026):
- Garrigues — evolución y entrada en vigor: https://www.garrigues.com/es_ES/noticia/evolucion-regulacion-datos-personales-chile-modernizacion-marco-normativo-nueva
- Carey — proyecto que posterga la vigencia: https://www.carey.cl/api/archivo/gobierno-ingresa-proyecto-de-ley-que-posterga-en-un-ano-entrada-en-vigor-de-la-ley-sobre-proteccion-de-datos-personales?lang=es

> Para el texto oficial de ambas leyes, consultar la Biblioteca del Congreso Nacional (LeyChile):
> https://www.bcn.cl/leychile

## C. Cómo el sistema aplica los principios de protección de datos

| Principio | Cómo lo aplica el prototipo | Dónde |
|---|---|---|
| **Minimización de datos** | Solo se almacenan datos necesarios (usuario, predios, cosechas, despachos, recepciones, inventario, auditoría); no se recogen datos personales sensibles del cliente real | esquema `schema.prisma` |
| **Control de acceso** | Autorización por rol verificada en el backend | `middlewares/authorize.js` |
| **Contraseñas protegidas** | Hash bcrypt; nunca en texto plano | `utils/password.js` |
| **Registro de operaciones** | Auditoría de login, accesos denegados, creación y recepción | `utils/audit.js`, tabla `audit_logs` |
| **Variables de entorno** | Secretos (JWT, BD) fuera del repositorio | `config/env.js`, `.gitignore` |
| **Comunicación cifrada** | HTTPS/TLS en el despliegue de Render | infra Render |
| **Restricción por roles** | ADMIN, TERRENO, BODEGA, GERENCIA con permisos acotados | `authorize(...)` por ruta |
| **Sin integración real con el SII** | El prototipo **no** integra el Servicio de Impuestos Internos; es un alcance explícitamente excluido | `README.md` (fuera de alcance) |
