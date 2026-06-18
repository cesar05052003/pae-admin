import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const updated = await prisma.poblacionIndigenaInstitucion.update({ where: { id: Number(id) }, data: { nombre: json.nombre, tipoInstitucion: json.tipoInstitucion } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando institución' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.poblacionIndigenaInstitucion.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error eliminando institución' }, { status: 500 });
  }
}

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const inst = await prisma.poblacionIndigenaInstitucion.findUnique({ where: { id: Number(id) } });
    if (!inst) return NextResponse.json({ error: 'Institución no encontrada' }, { status: 404 });
    return NextResponse.json(inst);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo institución' }, { status: 500 });
  }
}

