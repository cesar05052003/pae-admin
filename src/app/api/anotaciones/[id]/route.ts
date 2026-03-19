import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const anotacion = await prisma.anotacion.findUnique({
      where: { id: Number(id) },
    });
    if (!anotacion) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(anotacion);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const anotacion = await prisma.anotacion.update({
      where: { id: Number(id) },
      data: { 
        titulo: json.titulo,
        contenido: json.contenido,
        municipioId: json.municipioId ? Number(json.municipioId) : undefined,
        institucionId: json.institucionId ? Number(json.institucionId) : undefined,
        actaId: json.actaId ? Number(json.actaId) : undefined,
        planId: json.planId ? Number(json.planId) : undefined,
      },
    });
    return NextResponse.json(anotacion);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.anotacion.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
