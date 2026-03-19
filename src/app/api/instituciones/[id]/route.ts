import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const institucion = await prisma.institucion.findUnique({
      where: { id: Number(id) },
      include: { municipio: true },
    });
    if (!institucion) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(institucion);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const institucion = await prisma.institucion.update({
      where: { id: Number(id) },
      data: { 
        nombre: json.nombre,
        municipioId: json.municipioId ? Number(json.municipioId) : undefined
      },
      include: { municipio: true }
    });
    return NextResponse.json(institucion);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.institucion.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
