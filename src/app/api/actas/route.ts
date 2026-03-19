import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  const institucionId = searchParams.get('institucionId');
  
  try {
    const actas = await prisma.acta.findMany({
      where: {
        ...(municipioId && { municipioId: Number(municipioId) }),
        ...(institucionId && { institucionId: Number(institucionId) }),
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
    const acta = await prisma.acta.create({
      data: { 
        descripcion: json.descripcion,
        archivoUrl: json.archivoUrl,
        municipioId: Number(json.municipioId),
        institucionId: Number(json.institucionId)
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
