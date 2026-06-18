import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const updated = await prisma.poblacionIndigenaMunicipio.update({ where: { id: Number(id) }, data: { nombre: json.nombre } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando municipio' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.poblacionIndigenaMunicipio.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error eliminando municipio' }, { status: 500 });
  }
}

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const muni = await prisma.poblacionIndigenaMunicipio.findUnique({ where: { id: Number(id) } });
    if (!muni) return NextResponse.json({ error: 'Municipio no encontrado' }, { status: 404 });
    return NextResponse.json(muni);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo municipio' }, { status: 500 });
  }
}
