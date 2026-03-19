import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const anotaciones = await prisma.anotacion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        municipio: true,
        institucion: true,
        acta: true,
        plan: true,
      },
    });
    return NextResponse.json(anotaciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const anotacion = await prisma.anotacion.create({
      data: { 
        titulo: json.titulo,
        contenido: json.contenido,
        municipioId: json.municipioId ? Number(json.municipioId) : undefined,
        institucionId: json.institucionId ? Number(json.institucionId) : undefined,
        actaId: json.actaId ? Number(json.actaId) : undefined,
        planId: json.planId ? Number(json.planId) : undefined,
      },
    });
    return NextResponse.json(anotacion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
