import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const municipios = await prisma.poblacionIndigenaMunicipio.findMany({ orderBy: { nombre: 'asc' } });

    const detailed = await Promise.all(municipios.map(async (m) => {
      const totalInstituciones = await prisma.poblacionIndigenaInstitucion.count({ where: { municipioId: m.id } });
      const rurales = await prisma.poblacionIndigenaInstitucion.count({ where: { municipioId: m.id, tipoInstitucion: 'RURAL' } });
      const urbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { municipioId: m.id, tipoInstitucion: 'URBANA' } });
      const registros = await prisma.poblacionIndigenaRegistro.count({ where: { municipioId: m.id } });
      return { id: m.id, nombre: m.nombre, totalInstituciones, rurales, urbanas, registros };
    }));

    return NextResponse.json(detailed);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo municipios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    if (!json.nombre) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    const muni = await prisma.poblacionIndigenaMunicipio.create({ data: { nombre: json.nombre } });
    return NextResponse.json(muni, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creando municipio' }, { status: 500 });
  }
}
