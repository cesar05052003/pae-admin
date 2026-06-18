import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = json.data as any[] || [];
    let createdRegistros = 0;
    let createdMunicipios = 0;
    let createdInstituciones = 0;
    let errors = 0;

    for (const row of data) {
      try {
        const nombreM = String(row.municipio || row.Municipio || row.MUNICIPIO || '').trim();
        const nombreI = String(row.institucion || row.Institucion || row.INSTITUCION || row.institución || '').trim();
        if (!nombreM || !nombreI) { errors++; continue; }

        let municipio = await prisma.poblacionIndigenaMunicipio.findUnique({ where: { nombre: nombreM } });
        if (!municipio) { municipio = await prisma.poblacionIndigenaMunicipio.create({ data: { nombre: nombreM } }); createdMunicipios++; }

        let institucion = await prisma.poblacionIndigenaInstitucion.findFirst({ where: { nombre: nombreI, municipioId: municipio.id } });
        if (!institucion) { institucion = await prisma.poblacionIndigenaInstitucion.create({ data: { nombre: nombreI, municipioId: municipio.id } }); createdInstituciones++; }

        await prisma.poblacionIndigenaRegistro.create({ data: { descripcion: row.descripcion || row.Descripcion || '', archivoUrl: row.archivoUrl || null, municipioId: municipio.id, institucionId: institucion.id } });
        createdRegistros++;
      } catch (err) {
        errors++;
      }
    }

    return NextResponse.json({ municipios: createdMunicipios, instituciones: createdInstituciones, registros: createdRegistros, errors });
  } catch (error) {
    return NextResponse.json({ error: 'Error en importación' }, { status: 500 });
  }
}
