import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const soloActas = { tipoUso: { in: ['ACTAS', 'AMBOS'] as const } };

    const [totalMunicipios, totalInstituciones, conCae] = await Promise.all([
      prisma.municipio.count({ where: soloActas }),
      prisma.institucion.count({ where: { municipio: soloActas } }),
      prisma.institucion.count({ where: { municipio: soloActas, actas: { some: {} } } }),
    ]);

    const sinCae = totalInstituciones - conCae;
    const cobertura = totalInstituciones > 0 ? Math.round((conCae / totalInstituciones) * 100) : 0;

    const municipios = await prisma.municipio.findMany({
      where: soloActas,
      include: {
        instituciones: {
          where: { actas: { none: {} } },
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
      sinCae: m.instituciones.length,
      conCae: m._count.instituciones - m.instituciones.length,
      instituciones: m.instituciones,
    }));

    return NextResponse.json({
      totales: { municipios: totalMunicipios, instituciones: totalInstituciones, sinCae, conCae, cobertura },
      municipios: municipiosData,
    });
  } catch {
    return NextResponse.json({ error: 'Error al obtener el informe' }, { status: 500 });
  }
}
