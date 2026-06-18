import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');
  const institucionId = searchParams.get('institucionId');

  if (!municipioId || !institucionId) return NextResponse.json([], { status: 200 });

  try {
    const registros = await prisma.poblacionIndigenaRegistro.findMany({ where: { municipioId: Number(municipioId), institucionId: Number(institucionId) }, orderBy: { fecha: 'desc' }, include: { municipio: true, institucion: true } });
    return NextResponse.json(registros);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo registros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipioId = Number(json.municipioId);
    const institucionId = Number(json.institucionId);
    if (!municipioId || !institucionId) return NextResponse.json({ error: 'municipioId e institucionId requeridos' }, { status: 400 });

    const institucion = await prisma.poblacionIndigenaInstitucion.findUnique({ where: { id: institucionId } });
    if (!institucion) return NextResponse.json({ error: 'Institución no encontrada' }, { status: 404 });
    if (institucion.municipioId !== municipioId) return NextResponse.json({ error: 'El municipio no coincide con la institución' }, { status: 400 });

    const registro = await prisma.poblacionIndigenaRegistro.create({ 
      data: { 
        descripcion: json.descripcion, 
        fecha: json.fecha ? new Date(json.fecha) : new Date(),
        archivoUrl: json.archivoUrl, 
        municipioId, 
        institucionId 
      }, 
      include: { municipio: true, institucion: true } 
    });
    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Error creando registro' }, { status: 500 });
  }
}
