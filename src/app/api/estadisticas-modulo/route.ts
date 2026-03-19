import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modo = searchParams.get('modo'); // 'actas' | 'planes'

  try {
    const [muniCount, instCount, instConRegistro] = await Promise.all([
      prisma.municipio.count(),
      prisma.institucion.count(),
      modo === 'planes'
        ? prisma.institucion.count({ where: { planes: { some: {} } } })
        : prisma.institucion.count({ where: { actas: { some: {} } } }),
    ]);

    const cobertura = instCount > 0 ? Math.round((instConRegistro / instCount) * 100) : 0;
    const instSinRegistro = instCount - instConRegistro;

    const municipios = await prisma.municipio.findMany({
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

    return NextResponse.json({
      totales: {
        municipios: muniCount,
        instituciones: instCount,
        con: instConRegistro,
        sin: instSinRegistro,
        cobertura
      },
      municipiosData
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
