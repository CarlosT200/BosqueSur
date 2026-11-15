# Pruebas y evidencias — BosqueSur ES3

## 1. Pruebas automatizadas

```bash
npm test
```

Se ejecutan con Vitest + Supertest contra una base de datos de prueba
(`bosquesur_es3_test`). Cubren los 17 criterios del punto 10 de la pauta:

| # | Criterio | Estado |
|---|----------|:------:|
| 1 | Login válido devuelve JWT | ✅ |
| 2 | Contraseña incorrecta rechazada (401) | ✅ |
| 3 | Solicitud sin token → 401 | ✅ |
| 4 | Rol no permitido → 403 | ✅ |
| 5 | Intento no autorizado queda en auditoría | ✅ |
| 6 | TERRENO registra un predio | ✅ |
| 7 | TERRENO registra una cosecha válida | ✅ |
| 8 | Cosecha con volumen ≤ 0 se rechaza | ✅ |
| 9 | Cosecha consultable con su predio de origen | ✅ |
| 10 | Recepción exacta actualiza inventario y cierra despacho | ✅ |
| 11 | Recepción con diferencia exige resolución | ✅ |
| 12 | Recepción con diferencia exige observación | ✅ |
| 13 | No se puede recibir dos veces el mismo despacho | ✅ |
| 14 | Recepción + movimiento + inventario + estado + auditoría es atómica | ✅ |
| 15 | Errores entregan respuestas JSON controladas | ✅ |
| 16 | GERENCIA consulta inventario pero no modifica | ✅ |
| 17 | ADMIN consulta auditoría | ✅ |

> Reemplaza esta tabla con la **salida real** de `npm test` al generar la evidencia.

## 2. Objetivos de rendimiento (según el informe)

| Operación | Objetivo |
|-----------|----------|
| Lecturas simples de la API | < 500 ms |
| Escrituras | < 1,5 s |
| Carga inicial del dashboard | < 3 s |
| Caídas no planificadas durante la demo | 0 |

## 3. Cómo medir tiempos con Postman

1. Importa `docs/bosquesur.postman_collection.json`.
2. Ejecuta **Auth → Login (BODEGA)** (guarda el token automáticamente).
3. Ejecuta el endpoint a medir (ej. `GET /inventario`).
4. Lee el tiempo en la etiqueta **Time** de la respuesta (ms).
5. Repite 3 veces y registra el promedio en la tabla de abajo.

## 4. Cómo medir tiempos desde el navegador

1. Abre la web y presiona **F12 → pestaña Network (Red)**.
2. Marca **Disable cache**.
3. Recarga la página o ejecuta la acción (ej. abrir el dashboard).
4. Observa la columna **Time** de cada petición y el **Load** total abajo.
5. Registra el tiempo en la tabla.

## 5. Tabla de resultados (completar con datos reales)

**Ambiente:** ____________  **Fecha:** ____________

| Endpoint / Acción | Tiempo obtenido | Resultado esperado | ¿Cumple? | Observaciones |
|-------------------|-----------------|--------------------|:--------:|---------------|
| `GET /api/health` | | < 500 ms | | |
| `POST /api/auth/login` | | < 1,5 s | | |
| `GET /api/inventario` | | < 500 ms | | |
| `GET /api/despachos?estado=PENDIENTE` | | < 500 ms | | |
| `POST /api/despachos/:id/recepcion` | | < 1,5 s | | |
| Carga inicial del dashboard (web) | | < 3 s | | |

> No inventes mediciones: deben provenir del sistema funcionando.

## 6. Nota sobre el *cold start* de Render

En el plan gratuito de Render, los servicios se **suspenden tras un período de inactividad**. La
primera petición después de una pausa puede tardar **30–60 s** mientras el servicio vuelve a
iniciarse (*cold start*). Esto **no refleja** el rendimiento normal: para medir, realiza primero una
petición de "calentamiento" y luego mide las siguientes. En local no ocurre este efecto.

## 7. Checklist de evidencias para la Evaluación 3

Capturar desde el **sistema funcionando** (no generar evidencia falsa):

- [ ] Pantalla de inicio de sesión
- [ ] Navegación diferenciada por rol
- [ ] Respuesta `403` ante una operación no autorizada
- [ ] Registro del acceso denegado en auditoría
- [ ] Registro móvil de un predio
- [ ] Registro móvil de una cosecha
- [ ] Consulta de la cosecha con su predio de origen
- [ ] Lista de despachos pendientes
- [ ] Recepción exacta
- [ ] Recepción con diferencia
- [ ] Selección de resolución
- [ ] Inventario antes de la recepción
- [ ] Inventario después de la recepción
- [ ] Movimiento automático de inventario
- [ ] Registro de auditoría
- [ ] Pruebas automatizadas aprobadas (salida de `npm test`)
- [ ] URL del repositorio
- [ ] URL de la web desplegada
- [ ] URL de la API
- [ ] App móvil ejecutándose mediante Expo Go
