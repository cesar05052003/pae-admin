import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const actasMunicipios = await prisma.municipio.findMany({
      where: { tipoUso: 'ACTAS' },
      include: { instituciones: { select: { nombre: true, tipoInstitucion: true } } },
      orderBy: { nombre: 'asc' },
    });

    let municipiosCreados = 0;
    let institucionesCreadas = 0;

    for (const actas of actasMunicipios) {
      let planesMuni = await prisma.municipio.findUnique({
        where: { nombre_tipoUso: { nombre: actas.nombre, tipoUso: 'PLANES' } },
      });
      if (!planesMuni) {
        planesMuni = await prisma.municipio.create({
          data: { nombre: actas.nombre, tipoUso: 'PLANES' },
        });
        municipiosCreados++;
      }

      for (const inst of actas.instituciones) {
        const exists = await prisma.institucion.findUnique({
          where: { nombre_municipioId: { nombre: inst.nombre, municipioId: planesMuni.id } },
        });
        if (!exists) {
          await prisma.institucion.create({
            data: { nombre: inst.nombre, municipioId: planesMuni.id, tipoInstitucion: inst.tipoInstitucion },
          });
          institucionesCreadas++;
        }
      }
    }

    return NextResponse.json({ municipiosCreados, institucionesCreadas });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
