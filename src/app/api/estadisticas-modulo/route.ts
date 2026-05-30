import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ZONA_LABELS: Record<string, string> = {
  RURAL:        'Rural',
  URBANA:       'Urbana',
  RURAL_URBANA: 'Rural / Urbana',
  URBANA_RURAL: 'Urbana / Rural',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modo = searchParams.get('modo'); // 'actas' | 'planes'

  const tipoUso = modo === 'planes' ? 'PLANES' : 'ACTAS';

  try {
    const [muniCount, instCount, instConRegistro, porTipoRaw] = await Promise.all([
      prisma.municipio.count({ where: { tipoUso } }),
      prisma.institucion.count({ where: { municipio: { tipoUso } } }),
      modo === 'planes'
        ? prisma.institucion.count({ where: { municipio: { tipoUso }, planes: { some: {} } } })
        : prisma.institucion.count({ where: { municipio: { tipoUso }, actas: { some: {} } } }),
      prisma.$queryRaw<Array<{ tipo: string; total: bigint; con_cae: bigint }>>`
        SELECT
          i."tipoInstitucion"::text AS tipo,
          COUNT(*)                  AS total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "Acta" a WHERE a."institucionId" = i.id
          ) THEN 1 END)             AS con_cae
        FROM "Institucion" i
        JOIN "Municipio" m ON i."municipioId" = m.id
        WHERE m."tipoUso"::text = ${tipoUso}
        GROUP BY i."tipoInstitucion"::text
        ORDER BY i."tipoInstitucion"::text
      `,
    ]);

    const cobertura = instCount > 0 ? Math.round((instConRegistro / instCount) * 100) : 0;
    const instSinRegistro = instCount - instConRegistro;

    const municipios = await prisma.municipio.findMany({
      where: { tipoUso },
      include: {
        instituciones: {
          select: {
            id: true,
            actas: { select: { id: true }, take: 1 },
            planes: { select: { id: true }, take: 1 },
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    const municipiosData = municipios.map(m => {
      const conRegistro = m.instituciones.filter(i =>
        modo === 'planes' ? i.planes.length > 0 : i.actas.length > 0
      ).length;
      const sinRegistro = m.instituciones.length - conRegistro;
      return {
        nombre: m.nombre,
        con: conRegistro,
        sin: sinRegistro
      };
    });

    const porTipo = porTipoRaw.map(r => {
      const total  = Number(r.total);
      const conCae = Number(r.con_cae);
      return {
        tipo:      r.tipo,
        label:     ZONA_LABELS[r.tipo] ?? r.tipo,
        total,
        conCae,
        sinCae:    total - conCae,
        cobertura: total > 0 ? Math.round((conCae / total) * 100) : 0,
      };
    });

    return NextResponse.json({
      totales: {
        municipios: muniCount,
        instituciones: instCount,
        con: instConRegistro,
        sin: instSinRegistro,
        cobertura
      },
      municipiosData,
      porTipo,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
