import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conActas = searchParams.get('conActas');
  try {
    const municipios = await prisma.municipio.findMany({
      where: conActas === 'true' ? {
        actas: { some: {} }
      } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(municipios);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener municipios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipio = await prisma.municipio.create({
      data: { nombre: json.nombre },
    });
    return NextResponse.json(municipio, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear municipio' }, { status: 500 });
  }
}
