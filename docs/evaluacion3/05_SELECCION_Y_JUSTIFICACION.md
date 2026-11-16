# 2.1.2.5 — Selección y justificación de tecnologías

Justificación individual de cada herramienta, lenguaje, hardware y servicio, relacionada con el
problema de BosqueSur: **trazabilidad de la materia prima, descuadre de inventario y coordinación
entre terreno, bodega y oficina**.

Para cada elemento: función en el proyecto · necesidad que resuelve · beneficio estratégico · razón
de selección · alternativas · limitaciones · uso real en el código.

---

### Node.js
- **Función:** entorno de ejecución del backend (API).
- **Necesidad:** un servidor central que atienda web y móvil.
- **Beneficio:** un solo lenguaje (JavaScript) en todo el stack → menos costo de aprendizaje y
  mantenimiento para BosqueSur.
- **Selección / alternativas:** elegido sobre Python/Java por la experiencia del equipo (ver `04`).
- **Limitaciones:** menor rendimiento CPU-intensivo que Java; no aplica al alcance.
- **Uso real:** `apps/api/src/server.js`, toda la API.

### Express
- **Función:** framework HTTP/rutas de la API.
- **Necesidad:** definir endpoints REST y middlewares (auth, validación, errores).
- **Beneficio:** minimalista y ampliamente documentado; rápido de implementar.
- **Alternativas:** Fastify, NestJS (más estructura, más curva).
- **Limitaciones:** no impone arquitectura (se mitiga con la estructura modular propia).
- **Uso real:** `apps/api/src/app.js`, `routes/`, `modules/*/*.routes.js`.

### JavaScript (ESM)
- **Función:** lenguaje de API, web y móvil.
- **Necesidad:** unificar el desarrollo.
- **Beneficio:** reutilización de conocimiento y utilidades entre componentes.
- **Alternativas:** TypeScript (más seguridad de tipos; mayor configuración).
- **Limitaciones:** sin verificación de tipos estática (se compensa con validación Zod en runtime).
- **Uso real:** todo el código fuente.

### React
- **Función:** librería de UI de la app web.
- **Necesidad:** interfaz de bodega/gerencia con vistas por rol.
- **Beneficio:** ecosistema maduro; comparte modelo con React Native.
- **Alternativas:** Angular, Vue (ver `04`).
- **Uso real:** `apps/web/src/pages/*`, `components/*`.

### Vite
- **Función:** bundler/servidor de desarrollo y build de la web.
- **Necesidad:** desarrollo ágil y build de producción optimizado (sitio estático para Render).
- **Beneficio:** arranque y recarga muy rápidos; build simple.
- **Alternativas:** Create React App (en desuso), Webpack.
- **Uso real:** `apps/web/vite.config.js`, `npm run build:web` → `apps/web/dist`.

### React Native
- **Función:** framework de la app móvil.
- **Necesidad:** capturar predios y cosechas en terreno.
- **Beneficio:** una base de código para Android e iOS, con React.
- **Alternativas:** Flutter, nativo (ver `04`).
- **Uso real:** `apps/mobile/src/screens/*`.

### Expo
- **Función:** plataforma/tooling para React Native.
- **Necesidad:** ejecutar en teléfonos reales sin compilar (Expo Go) y acceder a APIs nativas
  (SecureStore).
- **Beneficio:** acelera el desarrollo y las pruebas en terreno.
- **Alternativas:** React Native CLI "puro" (más configuración nativa).
- **Limitaciones:** en iOS, abrir *Snacks* exige iniciar sesión en Expo Go (restricción de Apple).
- **Uso real:** `apps/mobile/app.json`, `expo-secure-store`, `expo-status-bar`.

### PostgreSQL
- **Función:** base de datos relacional.
- **Necesidad:** integridad del inventario y precisión de volúmenes.
- **Beneficio:** transacciones ACID y tipo `Decimal` → evita descuadres y errores de punto flotante.
- **Alternativas:** MySQL, MongoDB (ver `04`).
- **Uso real:** esquema `apps/api/prisma/schema.prisma`; transacción de recepción.

### Prisma
- **Función:** ORM entre la API y PostgreSQL.
- **Necesidad:** modelar entidades, migraciones versionadas y consultas seguras.
- **Beneficio:** esquema declarativo, tipos, `$transaction` para atomicidad; consultas
  parametrizadas (evitan inyección SQL).
- **Alternativas:** TypeORM, Sequelize, Knex.
- **Limitaciones:** en este entorno el binario nativo está bloqueado por red → se usa el **motor
  WebAssembly** con `@prisma/adapter-pg` (sin binario nativo). Documentado.
- **Uso real:** `prisma/schema.prisma`, `src/db/prisma.js`, servicios de cada módulo.

### JWT (jsonwebtoken)
- **Función:** autenticación sin estado.
- **Necesidad:** identificar al usuario y su rol en cada petición de web y móvil.
- **Beneficio:** escalable, común a ambos clientes.
- **Alternativas:** sesiones con cookies (requiere almacenamiento de sesión).
- **Uso real:** `src/utils/jwt.js`, `middlewares/authenticate.js`.

### Bcrypt (bcryptjs)
- **Función:** hash de contraseñas.
- **Necesidad:** no almacenar contraseñas en texto plano.
- **Beneficio:** resistente a fuerza bruta (factor de costo).
- **Alternativas:** argon2 (requiere binario nativo).
- **Uso real:** `src/utils/password.js`, `prisma/seed.js`.

### Zod
- **Función:** validación/normalización de datos de entrada.
- **Necesidad:** rechazar datos inválidos (volumen ≤ 0, campos faltantes, fechas).
- **Beneficio:** mensajes de error claros; esquemas reutilizables.
- **Alternativas:** Joi, express-validator.
- **Uso real:** `middlewares/validate.js`, `modules/*/*.validators.js`.

### Helmet
- **Función:** cabeceras HTTP de seguridad.
- **Necesidad:** reducir vectores de ataque comunes.
- **Uso real:** `src/app.js` (`app.use(helmet())`).

### CORS
- **Función:** controlar qué orígenes consumen la API.
- **Necesidad:** permitir solo la web autorizada.
- **Beneficio:** configurable por entorno (`CORS_ORIGINS`).
- **Uso real:** `src/app.js`.

### express-rate-limit
- **Función:** limitar intentos de login.
- **Necesidad:** mitigar fuerza bruta de credenciales.
- **Uso real:** `middlewares/rateLimit.js`.

### Docker
- **Función:** PostgreSQL local reproducible.
- **Necesidad:** mismo motor de BD en todos los equipos sin instalación manual.
- **Uso real:** `docker-compose.yml`.

### GitHub
- **Función:** control de versiones y origen del despliegue.
- **Necesidad:** trabajo en equipo e historial; disparar despliegues en Render.
- **Uso real:** repositorio del proyecto; Blueprint conectado.

### Render
- **Función:** hospedaje de web, API y PostgreSQL.
- **Necesidad:** exponer el prototipo con URLs reales a costo cero.
- **Limitaciones:** cold start y límites del plan gratuito (ver `02`).
- **Uso real:** `render.yaml`.

### Postman / Thunder Client
- **Función:** probar y medir la API.
- **Necesidad:** verificar endpoints y tiempos de respuesta.
- **Uso real:** `docs/bosquesur.postman_collection.json`.

### Computadores (notebooks)
- **Función:** desarrollo y uso de la web por oficina/bodega.
- **Beneficio:** aprovechan hardware existente; sin inversión.

### Smartphones (Android/iPhone)
- **Función:** captura en terreno con Expo Go.
- **Beneficio:** usan dispositivos del personal; evitan reingreso manual en oficina.

---

**Síntesis estratégica.** Cada decisión apunta a resolver el problema de BosqueSur con el menor costo
de aprendizaje y dinero: un stack unificado en JavaScript reduce fricción entre terreno, bodega y
oficina; PostgreSQL + Prisma + transacciones garantizan que el inventario sea una **fuente única y
consistente** (sin descuadres); JWT/bcrypt/Helmet/CORS/rate-limit/Zod aportan la seguridad mínima
razonable; y Render + GitHub permiten mostrar el prototipo funcionando sin inversión.
