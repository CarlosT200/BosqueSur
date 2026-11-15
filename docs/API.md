# API REST — BosqueSur ES3

Base URL local: `http://localhost:4000/api`

## Convenciones

Todas las respuestas usan una estructura consistente.

**Éxito:**
```json
{ "success": true, "data": { }, "message": "Operación realizada correctamente" }
```

**Error:**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Los datos ingresados no son válidos", "details": [] } }
```

Autenticación: enviar `Authorization: Bearer <token>` en los endpoints protegidos.

Códigos HTTP: `200` OK, `201` creado, `400` validación, `401` sin token / credenciales inválidas,
`403` sin permisos, `404` no encontrado, `409` conflicto (ej. recepción duplicada), `429` demasiados
intentos, `500` error interno.

## Roles y permisos

| Recurso | ADMIN | TERRENO | BODEGA | GERENCIA |
|---------|:-----:|:-------:|:------:|:--------:|
| Predios (ver/crear) | ✓ | ✓ | | |
| Cosechas (ver/crear) | ✓ | ✓ | | |
| Despachos (ver) | ✓ | | ✓ | ✓ |
| Recepción (registrar) | ✓ | | ✓ | |
| Inventario / Movimientos (ver) | ✓ | | ✓ | ✓ |
| Recepciones (ver) | ✓ | | ✓ | ✓ |
| Resumen (ver) | ✓ | | ✓ | ✓ |
| Auditoría (ver) | ✓ | | | |

## Endpoints

### Salud
```
GET /api/health
```
Respuesta: estado del servicio y de la base de datos. No requiere token.

### Autenticación — BL-01

```
POST /api/auth/login
Body: { "email": "bodega@bosquesur.cl", "password": "Bodega123*" }
→ 200 { data: { token, user: { id, nombre, email, role } } }
→ 401 INVALID_CREDENTIALS
```

```
GET /api/auth/me          (requiere token)
→ 200 { data: { user } }
```

### Predios — BL-03  (ADMIN, TERRENO)

```
GET  /api/predios
POST /api/predios
Body: { "nombre": "Fundo El Pinar", "ubicacion": "San Clemente", "descripcion": "opcional" }
→ 201 { data: { predio } }
```

### Cosechas — BL-03  (ADMIN, TERRENO)

```
GET  /api/cosechas               (?predioId=&especie= opcionales)
GET  /api/cosechas/:id           (incluye predio de origen y responsable)
POST /api/cosechas
Body: {
  "predioId": "prd_pinar_sur",
  "fecha": "2026-11-15",
  "especie": "Pino",
  "volumenM3": 120.5,
  "responsableId": "usr_terreno",   // opcional; por defecto el usuario autenticado
  "observacion": "opcional"
}
→ 201 { data: { cosecha } }
Validaciones: volumen > 0, campos obligatorios, fecha válida, predio existente.
```

### Despachos y recepción — BL-04 / BL-05  (ver: ADMIN/BODEGA/GERENCIA · recepción: ADMIN/BODEGA)

```
GET /api/despachos?estado=PENDIENTE
GET /api/despachos/:id            (detalle con origen y recepción si existe)

POST /api/despachos/:id/recepcion
Body: {
  "volumenRecibidoM3": 118.0,
  "fechaRecepcion": "2026-10-03",
  "resolucion": "INCIDENCIA_ABIERTA",   // obligatoria si diferencia != 0
  "observacion": "Faltan 2.5 m3"        // obligatoria si diferencia != 0
}
→ 201 { data: { recepcion, movimiento, inventario, despacho } }
→ 409 DESPACHO_YA_RECIBIDO
→ 400 RESOLUCION_REQUERIDA | OBSERVACION_REQUERIDA
```

Regla: `diferencia = volumenRecibido - volumenDespachado`
(`= 0` exacta · `< 0` faltante · `> 0` sobrante).

Al confirmar, en **una sola transacción** se: (1) crea la recepción, (2) crea/actualiza el item de
inventario de la especie, (3) crea el movimiento (saldo anterior/posterior), (4) cambia el despacho
a `RECIBIDO` y (5) registra auditoría. Si algo falla, se revierte todo.

### Recepciones — (ADMIN, BODEGA, GERENCIA)
```
GET /api/recepciones
```

### Inventario — BL-05  (ADMIN, BODEGA, GERENCIA)
```
GET /api/inventario                      (existencias por especie)
GET /api/inventario/movimientos?limit=50 (movimientos recientes)
```

### Resumen  (ADMIN, BODEGA, GERENCIA)
```
GET /api/resumen
→ { despachosPendientes, despachosRecibidos, recepcionesTotales,
    recepcionesConDiferencia, stockTotalM3, diferenciasPorResolucion }
```

### Auditoría — BL-01  (ADMIN)
```
GET /api/auditoria?limit=100
```
Acciones auditadas: `LOGIN` (éxito/fallo), `ACCESO_DENEGADO`, `CREAR_PREDIO`, `CREAR_COSECHA`,
`CONFIRMAR_RECEPCION`, `ACTUALIZAR_INVENTARIO`, `RECEPCION_DUPLICADA`.

## Colección importable

`docs/bosquesur.postman_collection.json` — importable en **Postman**, **Thunder Client** y **Bruno**.
Define la variable `baseUrl` (por defecto `http://localhost:4000/api`) y `token` (se completa tras el login).
