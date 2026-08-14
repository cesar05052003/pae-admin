import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const soloPlanes = { tipoUso: { in: ['PLANES' as const, 'AMBOS' as const] } };

    const [totalMunicipios, totalInstituciones, conPlan] = await Promise.all([
      prisma.municipio.count({ where: soloPlanes }),
      prisma.institucion.count({ where: { municipio: soloPlanes } }),
      prisma.institucion.count({ where: { municipio: soloPlanes, planes: { some: {} } } }),
    ]);

    const sinPlan = totalInstituciones - conPlan;
    const cobertura = totalInstituciones > 0 ? Math.round((conPlan / totalInstituciones) * 100) : 0;

    const municipios = await prisma.municipio.findMany({
      where: soloPlanes,
      include: {
        instituciones: {
          where: { planes: { none: {} } },
          select: { id: true, nombre: true, tipoInstitucion: true },
          orderBy: { nombre: 'asc' },
        },
        _count: { select: { instituciones: true } },
      },
      orderBy: { nombre: 'asc' },
    });

    const municipiosData = municipios.map(m => ({
      id: m.id,
      nombre: m.nombre,
      totalInstituciones: m._count.instituciones,
      sinPlanes: m.instituciones.length,
      conPlanes: m._count.instituciones - m.instituciones.length,
      instituciones: m.instituciones,
    }));

    return NextResponse.json({
      totales: { municipios: totalMunicipios, instituciones: totalInstituciones, sinPlanes: sinPlan, conPlanes: conPlan, cobertura },
      municipios: municipiosData,
    });
  } catch {
    return NextResponse.json({ error: 'Error al obtener el informe' }, { status: 500 });
  }
}
