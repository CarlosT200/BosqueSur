-- BosqueSur ES3 - Migracion inicial (Sprint 1)
-- Crea enums, tablas, indices y claves foraneas del esquema Prisma.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TERRENO', 'BODEGA', 'GERENCIA');
CREATE TYPE "DespachoEstado" AS ENUM ('PENDIENTE', 'RECIBIDO');
CREATE TYPE "ResolucionRecepcion" AS ENUM ('INCIDENCIA_ABIERTA', 'AJUSTE_ACEPTADO', 'RECHAZADO');
CREATE TYPE "MovimientoTipo" AS ENUM ('ENTRADA_RECEPCION');
CREATE TYPE "AuditResultado" AS ENUM ('EXITO', 'FALLO', 'DENEGADO');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateTable predios
CREATE TABLE "predios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "predios_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "predios_nombre_idx" ON "predios"("nombre");

-- CreateTable cosechas
CREATE TABLE "cosechas" (
    "id" TEXT NOT NULL,
    "predioId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "responsableId" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "volumenM3" DECIMAL(12,3) NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cosechas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cosechas_predioId_idx" ON "cosechas"("predioId");
CREATE INDEX "cosechas_especie_idx" ON "cosechas"("especie");
CREATE INDEX "cosechas_fecha_idx" ON "cosechas"("fecha");

-- CreateTable despachos
CREATE TABLE "despachos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cosechaId" TEXT,
    "especie" TEXT NOT NULL,
    "volumenDespachadoM3" DECIMAL(12,3) NOT NULL,
    "fechaDespacho" TIMESTAMP(3) NOT NULL,
    "estado" "DespachoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "creadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "despachos_codigo_key" ON "despachos"("codigo");
CREATE INDEX "despachos_estado_idx" ON "despachos"("estado");
CREATE INDEX "despachos_especie_idx" ON "despachos"("especie");
CREATE INDEX "despachos_fechaDespacho_idx" ON "despachos"("fechaDespacho");

-- CreateTable recepciones
CREATE TABLE "recepciones" (
    "id" TEXT NOT NULL,
    "despachoId" TEXT NOT NULL,
    "volumenRecibidoM3" DECIMAL(12,3) NOT NULL,
    "diferenciaM3" DECIMAL(12,3) NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL,
    "resolucion" "ResolucionRecepcion",
    "observacion" TEXT,
    "receptorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recepciones_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "recepciones_despachoId_key" ON "recepciones"("despachoId");
CREATE INDEX "recepciones_fechaRecepcion_idx" ON "recepciones"("fechaRecepcion");
CREATE INDEX "recepciones_resolucion_idx" ON "recepciones"("resolucion");

-- CreateTable inventory_items
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "cantidadM3" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inventory_items_especie_key" ON "inventory_items"("especie");

-- CreateTable inventory_movements
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "tipo" "MovimientoTipo" NOT NULL,
    "cantidadM3" DECIMAL(12,3) NOT NULL,
    "saldoAnteriorM3" DECIMAL(14,3) NOT NULL,
    "saldoPosteriorM3" DECIMAL(14,3) NOT NULL,
    "recepcionId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inventory_movements_inventoryItemId_idx" ON "inventory_movements"("inventoryItemId");
CREATE INDEX "inventory_movements_recepcionId_idx" ON "inventory_movements"("recepcionId");
CREATE INDEX "inventory_movements_createdAt_idx" ON "inventory_movements"("createdAt");

-- CreateTable audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "resultado" "AuditResultado" NOT NULL,
    "detalle" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");
CREATE INDEX "audit_logs_accion_idx" ON "audit_logs"("accion");
CREATE INDEX "audit_logs_entidad_idx" ON "audit_logs"("entidad");
CREATE INDEX "audit_logs_fecha_idx" ON "audit_logs"("fecha");

-- Foreign Keys
ALTER TABLE "cosechas" ADD CONSTRAINT "cosechas_predioId_fkey" FOREIGN KEY ("predioId") REFERENCES "predios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cosechas" ADD CONSTRAINT "cosechas_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_cosechaId_fkey" FOREIGN KEY ("cosechaId") REFERENCES "cosechas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recepciones" ADD CONSTRAINT "recepciones_despachoId_fkey" FOREIGN KEY ("despachoId") REFERENCES "despachos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "recepciones" ADD CONSTRAINT "recepciones_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_recepcionId_fkey" FOREIGN KEY ("recepcionId") REFERENCES "recepciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
