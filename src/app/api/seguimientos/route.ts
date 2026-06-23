import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const institucionId = searchParams.get('institucionId');
  if (!institucionId) return NextResponse.json([], { status: 200 });

  try {
    const seguimientos = await prisma.seguimiento.findMany({
      where: { institucionId: Number(institucionId) },
      orderBy: { fecha: 'desc' },
    });
    return NextResponse.json(seguimientos);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo seguimientos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipioId = Number(json.municipioId);
    const institucionId = Number(json.institucionId);
    if (!municipioId || !institucionId) return NextResponse.json({ error: 'municipioId e institucionId requeridos' }, { status: 400 });

    const seguimiento = await prisma.seguimiento.create({
      data: {
        descripcion: json.descripcion,
        fecha: json.fecha ? new Date(json.fecha) : new Date(),
        archivoUrl: json.archivoUrl,
        municipioId,
        institucionId,
      },
    });
    return NextResponse.json(seguimiento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando seguimiento' }, { status: 500 });
  }
}
