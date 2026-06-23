-- Migration: add-seguimiento-regular
-- Adds Seguimiento table for regular institutions (not counted in CAE stats)

CREATE TABLE IF NOT EXISTS "Seguimiento" (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  descripcion TEXT,
  "archivoUrl" TEXT,
  "municipioId" INT NOT NULL,
  "institucionId" INT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_seg_muni FOREIGN KEY ("municipioId") REFERENCES "Municipio"(id) ON DELETE CASCADE,
  CONSTRAINT fk_seg_inst FOREIGN KEY ("institucionId") REFERENCES "Institucion"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_seguimiento_institucion ON "Seguimiento"("institucionId");
CREATE INDEX IF NOT EXISTS idx_seguimiento_municipio ON "Seguimiento"("municipioId");
