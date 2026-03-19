import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const plan = await prisma.planPedagogico.findUnique({
      where: { id: Number(id) },
      include: { municipio: true, institucion: true, anotaciones: true },
    });
    if (!plan) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const municipioId = json.municipioId ? Number(json.municipioId) : undefined;
    const institucionId = json.institucionId ? Number(json.institucionId) : undefined;

    if (municipioId && institucionId) {
      const institucion = await prisma.institucion.findUnique({ where: { id: institucionId } });
      if (!institucion) {
        return NextResponse.json({ error: 'Institución no encontrada' }, { status: 404 });
      }
      if (institucion.municipioId !== municipioId) {
        return NextResponse.json({ error: 'El municipio no coincide con la institución' }, { status: 400 });
      }
    }

    const plan = await prisma.planPedagogico.update({
      where: { id: Number(id) },
      data: { 
        nombre: json.nombre,
        descripcion: json.descripcion,
        archivoUrl: json.archivoUrl,
        municipioId,
        institucionId
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.planPedagogico.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
