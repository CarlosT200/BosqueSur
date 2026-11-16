# 2.1.2.4 — Análisis cualitativo y cuantitativo de tecnologías

Matrices comparativas transparentes. Escala **1 a 5** (5 = mejor). Criterios ponderados:

| Criterio | Ponderación |
|---|---:|
| Curva de aprendizaje del equipo | 25% |
| Costo | 20% |
| Alineación con requerimientos no funcionales (RNF) | 25% |
| Documentación y comunidad | 15% |
| Facilidad de integración | 15% |

> Los puntajes buscan ser razonables según el **plazo académico**, la **experiencia del equipo**
> (ya maneja JavaScript/React), el **costo cero** exigido y el **alcance** del prototipo. No se
> ajustaron artificialmente para favorecer la opción elegida: donde una alternativa es objetivamente
> superior en un criterio (p. ej. rendimiento nativo), así se refleja.

Cálculo ponderado = Σ (puntaje × ponderación).

---

## Backend

| Opción | Aprend. (25%) | Costo (20%) | RNF (25%) | Doc/Com. (15%) | Integr. (15%) | **Total** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Node.js + Express** | 5 | 5 | 4 | 5 | 5 | **4.75** |
| Python + Django | 3 | 5 | 4 | 5 | 3 | 3.95 |
| Java + Spring Boot | 2 | 4 | 5 | 5 | 3 | 3.75 |

**Explicación.** El equipo ya domina JavaScript, por lo que Node+Express tiene la menor curva de
aprendizaje y **unifica el lenguaje** con la web (React) y el móvil (React Native). Django y Spring
son más robustos (Spring destaca en RNF para sistemas grandes), pero añaden lenguaje/stack nuevo y
mayor ceremonia, innecesarios para el alcance. **Seleccionado: Node.js + Express.**

---

## Frontend web

| Opción | Aprend. (25%) | Costo (20%) | RNF (25%) | Doc/Com. (15%) | Integr. (15%) | **Total** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **React** | 4 | 5 | 4 | 5 | 5 | **4.50** |
| Vue | 4 | 5 | 4 | 4 | 3 | 4.05 |
| Angular | 2 | 5 | 5 | 4 | 3 | 3.80 |

**Explicación.** React comparte modelo mental y ecosistema con React Native (móvil), lo que maximiza
la **reutilización de conocimiento** del equipo. Angular es más estructurado (mejor para equipos
grandes y RNF estrictos) pero su curva es mayor. **Seleccionado: React (+ Vite).**

---

## Aplicación móvil

| Opción | Aprend. (25%) | Costo (20%) | RNF (25%) | Doc/Com. (15%) | Integr. (15%) | **Total** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **React Native + Expo** | 5 | 5 | 3 | 5 | 5 | **4.50** |
| Flutter | 2 | 5 | 4 | 4 | 2 | 3.40 |
| Nativo Android/iOS | 1 | 3 | 5 | 4 | 2 | 3.00 |

**Explicación.** React Native + Expo reutiliza React/JS, permite probar en **Expo Go sin compilar** y
acelera el desarrollo en el plazo académico. El desarrollo **nativo** ofrece el mejor rendimiento
(RNF) pero exige dos bases de código y conocimientos que el equipo no tiene. Flutter es sólido pero
implica aprender Dart. **Seleccionado: React Native + Expo.**

---

## Base de datos

| Opción | Aprend. (25%) | Costo (20%) | RNF (25%) | Doc/Com. (15%) | Integr. (15%) | **Total** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **PostgreSQL** | 4 | 5 | 5 | 5 | 5 | **4.75** |
| MySQL | 4 | 5 | 4 | 5 | 5 | 4.50 |
| MongoDB | 3 | 5 | 2 | 4 | 4 | 3.45 |

**Explicación.** El caso exige **integridad transaccional** (recepción + inventario atómicos) y
**precisión decimal** en volúmenes (m³). PostgreSQL ofrece ACID robusto, tipo `Decimal` y excelente
soporte en Prisma. MongoDB (documental) penaliza fuerte en RNF para un inventario relacional con
transacciones. **Seleccionado: PostgreSQL.**

---

## Proveedor / infraestructura

| Opción | Aprend. (25%) | Costo (20%) | RNF (25%) | Doc/Com. (15%) | Integr. (15%) | **Total** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Render** | 5 | 5 | 3 | 4 | 5 | **4.35** |
| Railway | 4 | 4 | 3 | 4 | 4 | 3.75 |
| AWS | 2 | 2 | 5 | 5 | 3 | 3.35 |

**Explicación.** Render permite desplegar web estática + API + PostgreSQL con un **Blueprint
(`render.yaml`)** conectado a GitHub, en plan **gratuito**, ideal para un prototipo académico. AWS es
muy superior en RNF (escalabilidad, SLAs) pero su complejidad y costo no se justifican en este
alcance; sus desventajas en RNF para Render (cold start, límites del plan gratuito) están documentadas
en `02_INFRAESTRUCTURA.md`. **Seleccionado: Render.**

---

## Herramientas, hardware y servicios de apoyo (análisis cualitativo)

| Elemento | Rol | Por qué se eligió | Alternativas | Observación |
|---|---|---|---|---|
| **Visual Studio Code** | IDE | Gratuito, extensiones (ESLint, Prisma), amplio uso | WebStorm, Sublime | Estándar del equipo |
| **GitHub** | Control de versiones / repo | Gratis, integra con Render (CI/CD) | GitLab, Bitbucket | Repo público del proyecto |
| **Postman / Thunder Client** | Pruebas de API | Colección importable incluida en `docs/` | Bruno, Insomnia | Mide tiempos de endpoints |
| **Prisma** | ORM | Esquema declarativo, migraciones, tipos; motor WASM sin binario nativo | TypeORM, Sequelize, Knex | Ver `05` para justificación |
| **Docker** | PostgreSQL local reproducible | Mismo motor en local y nube; sin instalar PostgreSQL manualmente | PostgreSQL nativo | `docker-compose.yml` |
| **Computadores (notebooks)** | Desarrollo y consulta web | Hardware existente del equipo; Node 22 corre sin requisitos especiales | — | Sin costo adicional |
| **Smartphones (Android/iPhone)** | Captura en terreno | Dispositivos ya disponibles; Expo Go gratis | Tablets rugerizadas | Sin inversión en hardware |
| **Conectividad (internet/Wi-Fi)** | Comunicación cliente-API | Requisito básico; móvil contra API en nube solo necesita internet | Datos móviles | Red compartida para desarrollo local |
| **Servicios de nube (Render)** | Hospedaje | Analizado arriba | Railway, AWS, Azure | Plan gratuito |

**Conclusión del análisis.** La pila seleccionada (Node/Express, React, React Native+Expo, PostgreSQL,
Prisma, Render) maximiza la **reutilización del conocimiento del equipo** (un solo lenguaje,
JavaScript), cumple el **costo cero** y satisface los RNF del prototipo (integridad transaccional,
seguridad, tiempos de respuesta medidos en `07`). Los puntos débiles conocidos —rendimiento del plan
gratuito y curva en escenarios de gran escala— están documentados y no comprometen el alcance de la
Evaluación 3.
