import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoInstitucion } from '@prisma/client';

export const dynamic = 'force-dynamic';

const RURALES: TipoInstitucion[] = [
  TipoInstitucion.RURAL,
  TipoInstitucion.RURAL_URBANA,
  TipoInstitucion.URBANA_RURAL,
];

export async function GET() {
  try {
    const [distribucionRaw, totalRurales, ruralesConActas, ruralesConPlanes, municipios] =
      await Promise.all([
        prisma.institucion.groupBy({
          by: ['tipoInstitucion'],
          _count: { id: true },
        }),
        prisma.institucion.count({ where: { tipoInstitucion: { in: RURALES } } }),
        prisma.institucion.count({ where: { tipoInstitucion: { in: RURALES }, actas: { some: {} } } }),
        prisma.institucion.count({ where: { tipoInstitucion: { in: RURALES }, planes: { some: {} } } }),
        prisma.municipio.findMany({
          include: {
            instituciones: {
              where: { tipoInstitucion: { in: RURALES } },
              select: {
                id: true,
                actas:  { select: { id: true }, take: 1 },
                planes: { select: { id: true }, take: 1 },
              },
            },
          },
          orderBy: { nombre: 'asc' },
        }),
      ]);

    const ZONA_LABELS: Record<string, string> = {
      RURAL:        'Rural',
      URBANA:       'Urbana',
      RURAL_URBANA: 'Rural / Urbana',
      URBANA_RURAL: 'Urbana / Rural',
    };

    const distribucion = distribucionRaw.map(d => ({
      zona:  ZONA_LABELS[d.tipoInstitucion] ?? d.tipoInstitucion,
      count: d._count.id,
    }));

    const municipiosData = municipios
      .filter(m => m.instituciones.length > 0)
      .map(m => {
        const conActas  = m.instituciones.filter(i => i.actas.length  > 0).length;
        const conPlanes = m.instituciones.filter(i => i.planes.length > 0).length;
        return {
          nombre:    m.nombre,
          total:     m.instituciones.length,
          conActas,
          sinActas:  m.instituciones.length - conActas,
          conPlanes,
          sinPlanes: m.instituciones.length - conPlanes,
        };
      });

    return NextResponse.json({
      distribucion,
      rurales: {
        total:          totalRurales,
        conActas:       ruralesConActas,
        sinActas:       totalRurales - ruralesConActas,
        coberturaActas: totalRurales > 0 ? Math.round((ruralesConActas  / totalRurales) * 100) : 0,
        conPlanes:      ruralesConPlanes,
        sinPlanes:      totalRurales - ruralesConPlanes,
        coberturaPlanes:totalRurales > 0 ? Math.round((ruralesConPlanes / totalRurales) * 100) : 0,
      },
      municipiosData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
