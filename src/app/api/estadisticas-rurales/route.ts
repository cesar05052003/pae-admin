import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const RURAL_TIPOS = ['RURAL', 'RURAL_URBANA', 'URBANA_RURAL'];

const ZONA_LABELS: Record<string, string> = {
  RURAL:        'Rural',
  URBANA:       'Urbana',
  RURAL_URBANA: 'Rural / Urbana',
  URBANA_RURAL: 'Urbana / Rural',
};

export async function GET() {
  try {
    // Use ::text cast so queries work even before enum migration runs
    const [distribucionRaw, ruralesCounts, municipiosRaw, porTipoRaw] = await Promise.all([
      prisma.$queryRaw<Array<{ tipo: string; count: bigint }>>`
        SELECT "tipoInstitucion"::text AS tipo, COUNT(*) AS count
        FROM "Institucion"
        GROUP BY "tipoInstitucion"::text
        ORDER BY count DESC
      `,
      prisma.$queryRaw<Array<{ total: bigint; con_actas: bigint; con_planes: bigint }>>`
        SELECT
          COUNT(*) AS total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "Acta" a WHERE a."institucionId" = i.id
          ) THEN 1 END) AS con_actas,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "PlanPedagogico" p WHERE p."institucionId" = i.id
          ) THEN 1 END) AS con_planes
        FROM "Institucion" i
        WHERE "tipoInstitucion"::text = ANY(ARRAY['RURAL','RURAL_URBANA','URBANA_RURAL'])
      `,
      prisma.$queryRaw<Array<{ nombre: string; total: bigint; con_actas: bigint; con_planes: bigint }>>`
        SELECT
          m.nombre,
          COUNT(i.id)           AS total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "Acta" a WHERE a."institucionId" = i.id
          ) THEN 1 END)         AS con_actas,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "PlanPedagogico" p WHERE p."institucionId" = i.id
          ) THEN 1 END)         AS con_planes
        FROM "Municipio" m
        JOIN "Institucion" i ON i."municipioId" = m.id
        WHERE i."tipoInstitucion"::text = ANY(ARRAY['RURAL','RURAL_URBANA','URBANA_RURAL'])
        GROUP BY m.nombre
        HAVING COUNT(i.id) > 0
        ORDER BY m.nombre
      `,
      prisma.$queryRaw<Array<{ tipo: string; total: bigint; con_cae: bigint }>>`
        SELECT
          "tipoInstitucion"::text AS tipo,
          COUNT(*)                AS total,
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM "Acta" a WHERE a."institucionId" = i.id
          ) THEN 1 END)           AS con_cae
        FROM "Institucion" i
        GROUP BY "tipoInstitucion"::text
        ORDER BY "tipoInstitucion"::text
      `,
    ]);

    const distribucion = distribucionRaw.map(d => ({
      zona:  ZONA_LABELS[d.tipo] ?? d.tipo,
      count: Number(d.count),
    }));

    const r = ruralesCounts[0];
    const total     = Number(r?.total     ?? 0);
    const conActas  = Number(r?.con_actas  ?? 0);
    const conPlanes = Number(r?.con_planes ?? 0);

    const municipiosData = municipiosRaw.map(m => {
      const tot = Number(m.total);
      const ca  = Number(m.con_actas);
      const cp  = Number(m.con_planes);
      return {
        nombre:    m.nombre,
        total:     tot,
        conActas:  ca,
        sinActas:  tot - ca,
        conPlanes: cp,
        sinPlanes: tot - cp,
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
      distribucion,
      porTipo,
      rurales: {
        total,
        conActas,
        sinActas:        total - conActas,
        coberturaActas:  total > 0 ? Math.round((conActas  / total) * 100) : 0,
        conPlanes,
        sinPlanes:       total - conPlanes,
        coberturaPlanes: total > 0 ? Math.round((conPlanes / total) * 100) : 0,
      },
      municipiosData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
