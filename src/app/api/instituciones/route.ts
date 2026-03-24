import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');

  try {
    const instituciones = await prisma.institucion.findMany({
      where: municipioId ? { municipioId: Number(municipioId) } : undefined,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { actas: true, planes: true }
        }
      }
    });

    return NextResponse.json(instituciones);
  } catch (error) {
    console.error('Error fetching instituciones:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error fetching institutions: ${message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const nombre = String(json.nombre || '').trim();
    const municipioId = Number(json.municipioId);
    const tipoInstitucion = json.tipoInstitucion || 'URBANA';

    if (!nombre || !municipioId) {
      return NextResponse.json({ error: 'Nombre y municipio son requeridos' }, { status: 400 });
    }

    if (!['RURAL', 'URBANA'].includes(tipoInstitucion)) {
      return NextResponse.json({ error: 'Tipo de institución debe ser RURAL o URBANA' }, { status: 400 });
    }

    const institucion = await prisma.institucion.create({
      data: {
        nombre,
        municipioId,
        tipoInstitucion,
      },
    });

    return NextResponse.json(institucion, { status: 201 });
  } catch (error) {
    console.error('Error creating institucion:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una institución con ese nombre en el municipio' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error al crear institución: ${message}` }, { status: 500 });
  }
}
