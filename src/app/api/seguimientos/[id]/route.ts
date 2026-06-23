import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const json = await request.json();
    const seguimiento = await prisma.seguimiento.update({
      where: { id: Number(id) },
      data: {
        descripcion: json.descripcion,
        fecha: json.fecha ? new Date(json.fecha) : undefined,
        ...(json.archivoUrl && { archivoUrl: json.archivoUrl }),
      },
    });
    return NextResponse.json(seguimiento);
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando seguimiento' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.seguimiento.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error eliminando seguimiento' }, { status: 500 });
  }
}
