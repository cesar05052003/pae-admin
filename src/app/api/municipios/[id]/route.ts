import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoMunicipio } from '@prisma/client';

// Next.js App Router dynamic route params
type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const municipio = await prisma.municipio.findUnique({
      where: { id: Number(id) },
      include: { instituciones: true },
    });
    if (!municipio) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(municipio);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    const json = await request.json();
    const dataToUpdate: { nombre: string; tipoUso?: TipoMunicipio } = {
      nombre: json.nombre,
    };
    if (json.tipoUso) {
      dataToUpdate.tipoUso = json.tipoUso;
    }
    const municipio = await prisma.municipio.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
    return NextResponse.json(municipio);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: RouteParams) {
  const { id } = await props.params;
  try {
    await prisma.municipio.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
