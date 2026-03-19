import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  const institucionId = searchParams.get('institucionId');
  
  try {
    const planes = await prisma.planPedagogico.findMany({
      where: {
        ...(municipioId && { municipioId: Number(municipioId) }),
        ...(institucionId && { institucionId: Number(institucionId) }),
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
    const plan = await prisma.planPedagogico.create({
      data: { 
        nombre: json.nombre,
        descripcion: json.descripcion,
        archivoUrl: json.archivoUrl,
        municipioId: Number(json.municipioId),
        institucionId: Number(json.institucionId)
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
