import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalMunicipios = await prisma.poblacionIndigenaMunicipio.count();
    const totalInstituciones = await prisma.poblacionIndigenaInstitucion.count();
    const totalRegistros = await prisma.poblacionIndigenaRegistro.count();

    const rurales = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'RURAL' } });
    const urbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'URBANA' } });

    return NextResponse.json({ totalMunicipios, totalInstituciones, totalRegistros, rurales, urbanas });
  } catch (error) {
    return NextResponse.json({ error: 'Error generando estadísticas' }, { status: 500 });
  }
}
