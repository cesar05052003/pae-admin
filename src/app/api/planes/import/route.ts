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
      try {
        await prisma.planPedagogico.create({
          data: {
             nombre: item.nombre,
             descripcion: item.descripcion || null,
             municipioId: item.municipioId,
             institucionId: item.institucionId
          }
        });
        createdCount++;
      } catch (e) {
        errorCount++;
      }
    }

    return NextResponse.json({ success: true, created: createdCount, errors: errorCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error importing data' }, { status: 500 });
  }
}
