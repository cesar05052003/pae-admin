import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const EXCEL_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

const excelFilter: Prisma.PlanPedagogicoWhereInput = {
  OR: EXCEL_EXTENSIONS.map(ext => ({
    archivoUrl: { endsWith: ext, mode: 'insensitive' as const },
  })),
};

export async function GET() {
  try {
    const municipios = await prisma.municipio.findMany({
      where: { tipoUso: 'PLANES' },
      orderBy: { nombre: 'asc' },
      include: {
        instituciones: {
          where: { planes: { some: excelFilter } },
          orderBy: { nombre: 'asc' },
          include: {
            planes: {
              where: excelFilter,
              orderBy: { createdAt: 'desc' },
              select: { id: true, nombre: true, archivoUrl: true, createdAt: true },
            },
          },
        },
      },
    });

    const result = municipios
      .map(m => ({ id: m.id, nombre: m.nombre, instituciones: m.instituciones }))
      .filter(m => m.instituciones.length > 0);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Error al obtener instituciones con registro Excel' }, { status: 500 });
  }
}
