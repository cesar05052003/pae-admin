-- Baseline: schema existing before Prisma migrations were introduced.
-- On existing databases this is applied via: prisma migrate resolve --applied
-- On fresh databases this runs normally to create the initial schema.

CREATE TYPE "TipoInstitucion" AS ENUM ('RURAL', 'URBANA');
CREATE TYPE "TipoMunicipio" AS ENUM ('ACTAS', 'PLANES', 'AMBOS');

CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoUso" "TipoMunicipio" NOT NULL DEFAULT 'AMBOS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Municipio_nombre_key" ON "Municipio"("nombre");

CREATE TABLE "Institucion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "municipioId" INTEGER NOT NULL,
    "tipoInstitucion" "TipoInstitucion" NOT NULL DEFAULT 'URBANA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Institucion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Institucion_nombre_municipioId_key" ON "Institucion"("nombre", "municipioId");

CREATE TABLE "Acta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,
    "archivoUrl" TEXT,
    "municipioId" INTEGER NOT NULL,
    "institucionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Acta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanPedagogico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT,
    "municipioId" INTEGER NOT NULL,
    "institucionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlanPedagogico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Anotacion" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "municipioId" INTEGER,
    "institucionId" INTEGER,
    "actaId" INTEGER,
    "planId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Anotacion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Institucion" ADD CONSTRAINT "Institucion_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Acta" ADD CONSTRAINT "Acta_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Acta" ADD CONSTRAINT "Acta_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanPedagogico" ADD CONSTRAINT "PlanPedagogico_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanPedagogico" ADD CONSTRAINT "PlanPedagogico_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "Municipio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_actaId_fkey" FOREIGN KEY ("actaId") REFERENCES "Acta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Anotacion" ADD CONSTRAINT "Anotacion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PlanPedagogico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
