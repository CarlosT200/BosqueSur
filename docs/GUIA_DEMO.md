# Guion de demostración — BosqueSur ES3 (7–10 min)

Preparación previa:
- API, Web y PostgreSQL corriendo (`npm run db:up`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`).
- App móvil abierta en Expo Go, con `EXPO_PUBLIC_API_URL` apuntando a la IP local del PC.
- Tener a mano las credenciales de demostración.

---

## Integrante 1 — Problema e integración (≈ 2–3 min)

1. **Problema de BosqueSur**: la empresa forestal mantiene registros inconsistentes entre terreno,
   bodega y oficina, lo que provoca descuadres de inventario y diferencias no controladas entre lo
   despachado y lo recibido.
2. **Alcance de la Evaluación 3**: los 5 elementos del Sprint 1 (BL-01 a BL-05), funcionando de
   punta a punta, priorizando calidad sobre cantidad.
3. **Arquitectura** (mostrar el diagrama del README): app móvil y app web consumen **la misma API
   REST** y **una sola base de datos PostgreSQL**; el inventario es la **fuente única de información**.
4. **Inicio de sesión y roles**: iniciar sesión en la web como `BODEGA` y mostrar que la navegación
   cambia según el rol. Mencionar que la autorización se verifica **siempre en el backend** (ocultar
   botones no es seguridad).

> Evidencia criterio **2.1.3** (integración tecnológica con beneficio para el negocio): una sola API
> y una sola base de datos eliminan los registros paralelos.

## Integrante 2 — Captura de información en terreno (≈ 2–3 min)

1. En la **app móvil (Expo Go)**, iniciar sesión como `TERRENO` (`terreno@bosquesur.cl`).
2. **Registrar un predio** (nombre + comuna) y mostrar el mensaje de confirmación.
3. **Registrar una cosecha**: seleccionar el predio, fecha, especie y volumen (mostrar la validación
   de volumen > 0).
4. Abrir la cosecha recién creada y **mostrar su origen** (predio, responsable, especie, fecha, volumen).
5. Explicar que esa información queda **centralizada** en la misma base de datos que usa la bodega.

> Evidencia criterio **2.1.4** (implementación según los requerimientos): BL-03 completo desde el móvil.

## Integrante 3 — Recepción e inventario (≈ 3–4 min)

1. En la **web**, iniciar sesión como `BODEGA`.
2. Mostrar la **lista de despachos pendientes**.
3. Abrir un despacho y **mostrar el inventario de esa especie antes** de recibir (pestaña Inventario).
4. **Registrar una recepción con diferencia** (ej. recibir 118 m³ de un despacho de 120,5 m³):
   - La interfaz calcula la diferencia en vivo e indica **Faltante**.
   - Como hay diferencia, exige **seleccionar una resolución** (p. ej. *Incidencia abierta*) y una
     **observación**.
   - **Confirmar** la recepción (aparece un diálogo de confirmación).
5. Mostrar que el **inventario se actualizó automáticamente** (saldo anterior → posterior) y que el
   despacho pasó a **RECIBIDO**.
6. Mostrar el **movimiento de inventario** y, como `ADMIN`, la **auditoría** (login, recepción,
   actualización de inventario, accesos denegados).
7. Intentar recibir el mismo despacho de nuevo para mostrar el control **"no recibir dos veces"** (409).
8. Cerrar mostrando **`npm test`** (17 criterios) y explicando el **alcance ajustado**: todo lo del
   Sprint 1 funciona de punta a punta; producción, QR, SII, etc. quedan para sprints posteriores.

> Evidencia criterio **2.1.6** (ajuste del alcance y tareas según el avance): se priorizaron los 5
> flujos completos y se dejaron explícitamente fuera los módulos de evaluaciones posteriores.

---

## Mapa criterio → momento de la demo

| Criterio | Se evidencia en |
|----------|-----------------|
| **2.1.3** Integración tecnológica y beneficio | Integrante 1 (arquitectura: una API + una BD) |
| **2.1.4** Implementación según requerimientos | Integrantes 2 y 3 (BL-03, BL-04, BL-05 funcionando) |
| **2.1.6** Ajuste de alcance y tareas | Integrante 3 (cierre: Sprint 1 completo, resto fuera de alcance) |
