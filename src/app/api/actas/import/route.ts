import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    if (!Array.isArray(json)) return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });

    let createdCount = 0;
    let errorCount = 0;

    for (const item of json) {
      if (!item.municipioId || !item.institucionId) {
        errorCount++;
        continue;
      }
      try {
        const descStr = item.descripcion ? String(item.descripcion).trim() : null;
        const dateObj = item.fecha ? new Date(item.fecha) : undefined;

        // Duplicate check
        const existing = await prisma.acta.findFirst({
          where: {
            institucionId: item.institucionId,
            descripcion: descStr,
            ...(dateObj && !isNaN(dateObj.getTime()) ? { fecha: dateObj } : {})
          }
        });

        if (!existing) {
          await prisma.acta.create({
            data: {
              descripcion: descStr,
              municipioId: item.municipioId,
              institucionId: item.institucionId,
              ...(dateObj && !isNaN(dateObj.getTime()) ? { fecha: dateObj } : {})
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
