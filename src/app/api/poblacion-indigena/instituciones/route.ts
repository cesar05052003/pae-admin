import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  if (!municipioId) return NextResponse.json([], { status: 200 });

  try {
    const instituciones = await prisma.poblacionIndigenaInstitucion.findMany({ where: { municipioId: Number(municipioId) }, orderBy: { nombre: 'asc' } });
    return NextResponse.json(instituciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo instituciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipioId = Number(json.municipioId);
    if (!municipioId || !json.nombre) return NextResponse.json({ error: 'municipioId y nombre requeridos' }, { status: 400 });
    const instituc = await prisma.poblacionIndigenaInstitucion.create({ data: { nombre: json.nombre, municipioId, tipoInstitucion: json.tipoInstitucion || 'URBANA' } });
    return NextResponse.json(instituc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando institución' }, { status: 500 });
  }
}
