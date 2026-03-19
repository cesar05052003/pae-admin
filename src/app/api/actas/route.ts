import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  const institucionId = searchParams.get('institucionId');

  // Always require both municipio + institución to avoid returning actas de otra institución con el mismo nombre.
  if (!municipioId || !institucionId) {
    return NextResponse.json([], { status: 200 });
  }
  
  try {
    const actas = await prisma.acta.findMany({
      where: {
        municipioId: Number(municipioId),
        institucionId: Number(institucionId),
      },
      orderBy: { fecha: 'desc' },
      include: {
        municipio: true,
        institucion: true,
      },
    });
    return NextResponse.json(actas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener actas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipioId = Number(json.municipioId);
    const institucionId = Number(json.institucionId);

    if (!municipioId || !institucionId) {
      return NextResponse.json({ error: 'Municipio e institución son requeridos' }, { status: 400 });
    }

    const institucion = await prisma.institucion.findUnique({ where: { id: institucionId } });
    if (!institucion) {
      return NextResponse.json({ error: 'Institución no encontrada' }, { status: 404 });
    }
    if (institucion.municipioId !== municipioId) {
      return NextResponse.json({ error: 'El municipio no coincide con la institución' }, { status: 400 });
    }

    const acta = await prisma.acta.create({
      data: { 
        descripcion: json.descripcion,
        archivoUrl: json.archivoUrl,
        municipioId,
        institucionId
      },
      include: {
        municipio: true,
        institucion: true,
      }
    });
    return NextResponse.json(acta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear acta' }, { status: 500 });
  }
}
