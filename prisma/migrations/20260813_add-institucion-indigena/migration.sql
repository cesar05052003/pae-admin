-- Migration: add-institucion-indigena
-- Adds esIndigena boolean flag to Institucion to mark indigenous institutions in the Planes module

ALTER TABLE "Institucion" ADD COLUMN IF NOT EXISTS "esIndigena" BOOLEAN NOT NULL DEFAULT false;
