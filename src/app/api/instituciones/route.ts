import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipioId = searchParams.get('municipioId');

  try {
    const instituciones = await prisma.institucion.findMany({
      where: municipioId ? { municipioId: Number(municipioId) } : undefined,
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { actas: true, planes: true }
        }
      }
    });

    return NextResponse.json(instituciones);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching institutions' }, { status: 500 });
  }
}
