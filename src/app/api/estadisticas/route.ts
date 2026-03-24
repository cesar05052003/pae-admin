import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [muniCount, instCount, actaCount, planesCount, instConActas, instConPlanes] = await Promise.all([
      prisma.municipio.count(),
      prisma.institucion.count(),
      prisma.acta.count(),
      prisma.planPedagogico.count(),
      prisma.institucion.count({ where: { actas: { some: {} } } }),
      prisma.institucion.count({ where: { planes: { some: {} } } })
    ]);

    const municipios = await prisma.municipio.findMany({
      include: {
        _count: {
          select: { actas: true, planes: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    const municipiosData = municipios.map(m => ({
      nombre: m.nombre,
      actas: m._count.actas,
      planes: m._count.planes
    }));

    return NextResponse.json({
      totales: {
        municipios: muniCount,
        instituciones: instCount,
        actas: actaCount,
        planes: planesCount,
        coberturaActas: instCount > 0 ? Math.round((instConActas / instCount) * 100) : 0,
        coberturaPlanes: instCount > 0 ? Math.round((instConPlanes / instCount) * 100) : 0,
      },
      municipiosData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
