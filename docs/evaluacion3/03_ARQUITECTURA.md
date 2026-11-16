# 2.1.1.3 — Diagrama de arquitectura

Estructura, lógica y funcionalidad del sistema desde una perspectiva de alto nivel, organizada en
**tres capas**.

> Código fuente del diagrama: [`diagramas/arquitectura.mmd`](diagramas/arquitectura.mmd).

```mermaid
flowchart TB
    subgraph P["Capa de Presentacion"]
        WEB["React + Vite (web)<br/>Dashboard · vistas por rol"]
        MOB["React Native + Expo (movil)<br/>vistas protegidas por rol"]
    end

    subgraph L["Capa de Logica de Negocio · API Express"]
        AUTH["Autenticacion / Autorizacion<br/>JWT · roles"]
        MOD["Predios · Cosechas · Despachos<br/>Recepciones · Inventario · Auditoria · Resumen"]
        VAL["Validaciones (Zod)"]
        ERR["Manejo central de errores"]
    end

    subgraph D["Capa de Datos"]
        PRISMA["Prisma ORM"]
        PG[("PostgreSQL")]
        TX["Transacciones · Migraciones · Seed"]
    end

    WEB -->|HTTP · JSON · JWT| AUTH
    MOB -->|HTTP · JSON · JWT| AUTH
    AUTH --> MOD
    MOD --> VAL
    VAL --> PRISMA
    PRISMA --> PG
    TX -.-> PRISMA
    ERR -.-> MOD
```

## Capa de Presentación
- **React + Vite (web):** pantalla de login, dashboard con indicadores, despachos, recepción,
  inventario, movimientos, recepciones, resumen y auditoría. Navegación **protegida por rol**
  (`components/ProtectedRoute.jsx`, `components/Layout.jsx`).
- **React Native + Expo (móvil):** login, predios, cosechas y detalle de origen; vistas acordes al
  rol TERRENO.

## Capa de Lógica de Negocio (API Express)
Organizada por módulos con responsabilidades separadas (`apps/api/src/modules/*`), cada uno con
rutas, controlador, servicio y validadores:
- **Autenticación / Autorización:** `middlewares/authenticate.js`, `middlewares/authorize.js`.
- **Dominios:** predios, cosechas, despachos, recepciones, inventario, auditoría, resumen.
- **Validaciones:** `middlewares/validate.js` + `*.validators.js` (Zod).
- **Manejo centralizado de errores:** `middlewares/error.js` (respuestas JSON controladas, sin trazas).

## Capa de Datos
- **Prisma ORM** (`apps/api/prisma/schema.prisma`) sobre **PostgreSQL**.
- **Transacciones** para la recepción (atómica), **migraciones** versionadas y **seed** idempotente.

## Flujos principales

### Registro móvil de cosecha
```mermaid
flowchart LR
    A["App movil: registrar cosecha"] --> B["POST /api/cosechas (JWT TERRENO)"]
    B --> C["Validacion Zod + verificar predio"]
    C --> D["Prisma: INSERT cosecha"]
    D --> E[("PostgreSQL")]
    E --> F["GET /api/cosechas/:id<br/>origen consultable (predio + responsable)"]
```

### Recepción de despacho con diferencia
```mermaid
flowchart LR
    R["POST /api/despachos/:id/recepcion (JWT BODEGA)"] --> DIF["Calcular diferencia<br/>recibido - despachado"]
    DIF --> TX["TRANSACCION PostgreSQL"]
    subgraph TX["Transaccion atomica"]
        T1["Crear recepcion"] --> T2["Inventario: incremento atomico"]
        T2 --> T3["Crear movimiento<br/>(saldo anterior/posterior)"]
        T3 --> T4["Despacho → RECIBIDO"]
        T4 --> T5["Auditoria"]
    end
    TX --> OK["Inventario actualizado<br/>o rollback total si falla"]
```

Esta arquitectura de tres capas mantiene la **separación de responsabilidades**, permite que web y
móvil reutilicen la lógica del backend y garantiza que el inventario sea consistente mediante
transacciones.
