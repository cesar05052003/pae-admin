import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  const institucionId = searchParams.get('institucionId');

  // Always require both municipio + institución to avoid returning planes de otra institución con el mismo nombre.
  if (!municipioId || !institucionId) {
    return NextResponse.json([], { status: 200 });
  }
  
  try {
    const planes = await prisma.planPedagogico.findMany({
      where: {
        municipioId: Number(municipioId),
        institucionId: Number(institucionId),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        municipio: true,
        institucion: true,
      },
    });
    return NextResponse.json(planes);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
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

    const plan = await prisma.planPedagogico.create({
      data: { 
        nombre: json.nombre,
        descripcion: json.descripcion,
        archivoUrl: json.archivoUrl,
        municipioId,
        institucionId
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
