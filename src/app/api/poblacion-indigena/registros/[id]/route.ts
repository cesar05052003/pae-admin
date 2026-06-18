import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const updated = await prisma.poblacionIndigenaRegistro.update({ 
      where: { id: Number(id) }, 
      data: { 
        descripcion: json.descripcion,
        ...(json.archivoUrl && { archivoUrl: json.archivoUrl })
      } 
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Error actualizando registro' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.poblacionIndigenaRegistro.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error eliminando registro' }, { status: 500 });
  }
}

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const reg = await prisma.poblacionIndigenaRegistro.findUnique({ where: { id: Number(id) } });
    if (!reg) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    return NextResponse.json(reg);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo registro' }, { status: 500 });
  }
}
