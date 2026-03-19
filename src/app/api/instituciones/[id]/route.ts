import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
    console.error('Error fetching institucion:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error fetching institucion: ${message}` }, { status: 500 });
  }
}

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const nombre = String(json.nombre || '').trim();
    const municipioId = json.municipioId ? Number(json.municipioId) : undefined;

    const institucion = await prisma.institucion.update({
      where: { id: Number(id) },
      data: { 
        nombre,
        municipioId
      },
      include: { municipio: true }
    });
    return NextResponse.json(institucion);
  } catch (error) {
    console.error('Error updating institucion:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una institución con ese nombre en el municipio' }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error al actualizar: ${message}` }, { status: 500 });
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
    console.error('Error deleting institucion:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error al eliminar: ${message}` }, { status: 500 });
  }
}
