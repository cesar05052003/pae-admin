import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalMunicipios = await prisma.poblacionIndigenaMunicipio.count();
    const totalInstituciones = await prisma.poblacionIndigenaInstitucion.count();
    const totalRegistros = await prisma.poblacionIndigenaRegistro.count();

    const rurales = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'RURAL' } });
    const urbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'URBANA' } });
    const ruralesUrbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'RURAL_URBANA' } });
    const urbanasRurales = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'URBANA_RURAL' } });

    // Registros por municipio
    const registrosPorMunicipio = await prisma.poblacionIndigenaRegistro.groupBy({
      by: ['municipioId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const municipiosConRegistros = await prisma.poblacionIndigenaMunicipio.findMany({
      where: { id: { in: registrosPorMunicipio.map(r => r.municipioId) } },
    });

    const municipiosData = registrosPorMunicipio.map(r => {
      const municipio = municipiosConRegistros.find(m => m.id === r.municipioId);
      return { nombre: municipio?.nombre || 'Desconocido', registros: r._count.id };
    }).sort((a, b) => b.registros - a.registros);

    // Instituciones por tipo
    const distribucionTipo = [
      { tipo: 'Rural', count: rurales },
      { tipo: 'Urbana', count: urbanas },
      { tipo: 'Rural/Urbana', count: ruralesUrbanas },
      { tipo: 'Urbana/Rural', count: urbanasRurales },
    ].filter(d => d.count > 0);

    // Registros por mes (últimos 12 meses)
    const registrosPorMes = await prisma.poblacionIndigenaRegistro.groupBy({
      by: ['fecha'],
      _count: { id: true },
    });

    const registrosAgrupados: Record<string, number> = {};
    registrosPorMes.forEach(r => {
      const fecha = new Date(r.fecha);
      const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      registrosAgrupados[mesAño] = (registrosAgrupados[mesAño] || 0) + r._count.id;
    });

    const registrosPorMesOrdenado = Object.entries(registrosAgrupados)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([mes, count]) => ({ mes, registros: count }));

    // Instituciones con más registros
    const institucionesConRegistros = await prisma.poblacionIndigenaInstitucion.findMany({
      include: { _count: { select: { registros: true } } },
      orderBy: { registros: { _count: 'desc' } },
      take: 10,
    });

    const topInstituciones = institucionesConRegistros.map(i => ({
      nombre: i.nombre,
      registros: i._count.registros,
      tipo: i.tipoInstitucion,
    }));

    return NextResponse.json({
      totales: { totalMunicipios, totalInstituciones, totalRegistros },
      distribucion: { rurales, urbanas, ruralesUrbanas, urbanasRurales },
      distribucionTipo,
      municipiosData,
      registrosPorMes: registrosPorMesOrdenado,
      topInstituciones,
    });
  } catch (error) {
    console.error('Estadísticas error:', error);
    return NextResponse.json({ error: 'Error generando estadísticas' }, { status: 500 });
  }
}
