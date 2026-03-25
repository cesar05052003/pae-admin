import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conActas = searchParams.get('conActas');
  const tipo = searchParams.get('tipo'); // ACTAS, PLANES, o AMBOS
  
  try {
    let where: Prisma.MunicipioWhereInput | undefined = undefined;

    // Si se especifica tipo (ACTAS o PLANES), filtrar por tipoUso
    if (tipo === 'ACTAS') {
      where = {
        OR: [
          { tipoUso: 'ACTAS' },
          { tipoUso: 'AMBOS' }
        ]
      };
    } else if (tipo === 'PLANES') {
      where = {
        OR: [
          { tipoUso: 'PLANES' },
          { tipoUso: 'AMBOS' }
        ]
      };
    } else if (conActas === 'true') {
      where = { actas: { some: {} } };
    }

    const municipios = await prisma.municipio.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
    return NextResponse.json(municipios);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener municipios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const municipio = await prisma.municipio.create({
      data: { 
        nombre: json.nombre,
        tipoUso: json.tipoUso || 'AMBOS'
      },
    });
    return NextResponse.json(municipio, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear municipio' }, { status: 500 });
  }
}
