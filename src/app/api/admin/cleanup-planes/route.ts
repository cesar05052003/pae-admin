import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Deletes PLANES municipalities that have no plan records and whose name also
// exists as an ACTAS municipality — these are the ones incorrectly auto-copied.
export async function POST() {
  try {
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
    return NextResponse.json({ deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
