import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoInstitucion } from '@prisma/client';

export const dynamic = 'force-dynamic';

function normalize(str: string): string {
  return str
    .trim()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

const ZONA_TO_ENUM: Record<string, TipoInstitucion> = {
  'RURAL':        TipoInstitucion.RURAL,
  'URBANA':       TipoInstitucion.URBANA,
  'RURAL,URBANA': TipoInstitucion.RURAL_URBANA,
  'URBANA,RURAL': TipoInstitucion.URBANA_RURAL,
};

type InputRow = { municipio: string; nombre: string; zona: string };

export async function POST(request: Request) {
  try {
    const json = await request.json();

    if (!Array.isArray(json) || json.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de registros' }, { status: 400 });
    }

    const allMunicipios = await prisma.municipio.findMany({
      select: { id: true, nombre: true },
    });

    const municipioMap = new Map<string, number>();
    for (const m of allMunicipios) {
      municipioMap.set(normalize(m.nombre), m.id);
    }

    const allInstituciones = await prisma.institucion.findMany({
      select: { id: true, nombre: true, municipioId: true },
    });

    const institucionMap = new Map<string, number>();
    for (const inst of allInstituciones) {
      const key = `${inst.municipioId}:${normalize(inst.nombre)}`;
      institucionMap.set(key, inst.id);
    }

    let updated = 0;
    const notFound: string[] = [];
    const errors: string[] = [];

    for (const row of json as InputRow[]) {
      if (!row.municipio || !row.nombre || !row.zona) {
        errors.push(`Fila incompleta: ${JSON.stringify(row)}`);
        continue;
      }

      const zonaKey = String(row.zona).trim().toUpperCase();
      const tipoInstitucion = ZONA_TO_ENUM[zonaKey];
      if (!tipoInstitucion) {
        errors.push(`Zona desconocida "${row.zona}" para institución "${row.nombre}"`);
        continue;
      }

      const normMuni = normalize(row.municipio);
      const municipioId = municipioMap.get(normMuni);
      if (!municipioId) {
        notFound.push(`Municipio no encontrado: "${row.municipio}"`);
        continue;
      }

      const normNombre = normalize(row.nombre);
      const key = `${municipioId}:${normNombre}`;
      const institucionId = institucionMap.get(key);
      if (!institucionId) {
        notFound.push(`Institución no encontrada: "${row.nombre}" en "${row.municipio}"`);
        continue;
      }

      try {
        await prisma.institucion.update({
          where: { id: institucionId },
          data: { tipoInstitucion },
        });
        updated++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error desconocido';
        errors.push(`Error actualizando "${row.nombre}": ${msg}`);
      }
    }

    return NextResponse.json({ updated, notFound, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: `Error procesando zonas: ${message}` }, { status: 500 });
  }
}
