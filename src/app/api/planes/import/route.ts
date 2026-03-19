import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    if (!Array.isArray(json)) return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });

    let createdCount = 0;
    let errorCount = 0;

    for (const item of json) {
      if (!item.nombre || !item.municipioId || !item.institucionId) {
        errorCount++;
        continue;
      }

      // Ensure the institution belongs to the expected municipality.
      const institución = await prisma.institucion.findUnique({ where: { id: Number(item.institucionId) } });
      if (!institución || institución.municipioId !== Number(item.municipioId)) {
        errorCount++;
        continue;
      }

      try {
        const nameStr = item.nombre ? String(item.nombre).trim() : 'Plan Pedagógico';
        const descStr = item.descripcion ? String(item.descripcion).trim() : null;

        // Duplicate check
        const existing = await prisma.planPedagogico.findFirst({
          where: {
            institucionId: item.institucionId,
            nombre: nameStr,
            descripcion: descStr
          }
        });

        if (!existing) {
          await prisma.planPedagogico.create({
            data: {
              nombre: nameStr,
              descripcion: descStr,
              municipioId: item.municipioId,
              institucionId: item.institucionId
            }
          });
          createdCount++;
        }
      } catch (e) {
        errorCount++;
      }
    }

    return NextResponse.json({ success: true, created: createdCount, errors: errorCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error importing data' }, { status: 500 });
  }
}
