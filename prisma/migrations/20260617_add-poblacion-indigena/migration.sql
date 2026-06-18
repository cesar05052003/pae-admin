-- Migration: add-poblacion-indigena
-- This migration file was created manually to add the Poblacion Indigena tables
-- It intentionally uses IF NOT EXISTS and does not modify existing Municipio indexes to avoid data loss.

CREATE TABLE IF NOT EXISTS "PoblacionIndigenaMunicipio" (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS "PoblacionIndigenaInstitucion" (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  "municipioId" INT NOT NULL,
  "tipoInstitucion" "TipoInstitucion" NOT NULL DEFAULT 'URBANA',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (nombre, "municipioId"),
  CONSTRAINT fk_pi_municipio FOREIGN KEY ("municipioId") REFERENCES "PoblacionIndigenaMunicipio"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "PoblacionIndigenaRegistro" (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  descripcion TEXT,
  "archivoUrl" TEXT,
  "municipioId" INT NOT NULL,
  "institucionId" INT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_pi_reg_muni FOREIGN KEY ("municipioId") REFERENCES "PoblacionIndigenaMunicipio"(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_reg_inst FOREIGN KEY ("institucionId") REFERENCES "PoblacionIndigenaInstitucion"(id) ON DELETE CASCADE
);

-- Optional indexes for performance
CREATE INDEX IF NOT EXISTS idx_pi_institucion_municipio ON "PoblacionIndigenaInstitucion"("municipioId");
CREATE INDEX IF NOT EXISTS idx_pi_registro_municipio ON "PoblacionIndigenaRegistro"("municipioId");
CREATE INDEX IF NOT EXISTS idx_pi_registro_institucion ON "PoblacionIndigenaRegistro"("institucionId");
