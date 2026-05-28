import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Step 1: delete the bad copies I added (exact ACTAS names, no plans)
    const deleted = await prisma.$executeRawUnsafe(`
      DELETE FROM "Municipio"
      WHERE "tipoUso"::text = 'PLANES'
        AND nombre IN (SELECT nombre FROM "Municipio" WHERE "tipoUso"::text = 'ACTAS')
        AND NOT EXISTS (
          SELECT 1 FROM "PlanPedagogico" pp
          JOIN "Institucion" i ON pp."institucionId" = i.id
          WHERE i."municipioId" = "Municipio".id
        )
    `);

    // Step 2: strip trailing dots from original PLANES municipality names ("AYAPEL." → "AYAPEL")
    const renamed = await prisma.$executeRawUnsafe(`
      UPDATE "Municipio"
      SET nombre = RTRIM(nombre, '.'), "updatedAt" = NOW()
      WHERE "tipoUso"::text = 'PLANES'
        AND nombre LIKE '%.';
    `);

    return NextResponse.json({ deleted, renamed });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
