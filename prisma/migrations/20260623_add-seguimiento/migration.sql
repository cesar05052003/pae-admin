-- Migration: add-seguimiento
-- Adds PoblacionIndigenaSeguimiento table for follow-up records (not counted in CAE stats)

CREATE TABLE IF NOT EXISTS "PoblacionIndigenaSeguimiento" (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  descripcion TEXT,
  "archivoUrl" TEXT,
  "municipioId" INT NOT NULL,
  "institucionId" INT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_pi_seg_muni FOREIGN KEY ("municipioId") REFERENCES "PoblacionIndigenaMunicipio"(id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_seg_inst FOREIGN KEY ("institucionId") REFERENCES "PoblacionIndigenaInstitucion"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pi_seguimiento_institucion ON "PoblacionIndigenaSeguimiento"("institucionId");
CREATE INDEX IF NOT EXISTS idx_pi_seguimiento_municipio ON "PoblacionIndigenaSeguimiento"("municipioId");
