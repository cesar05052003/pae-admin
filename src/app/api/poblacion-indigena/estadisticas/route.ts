import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalMunicipios = await prisma.poblacionIndigenaMunicipio.count();
    const totalInstituciones = await prisma.poblacionIndigenaInstitucion.count();
    const totalRegistros = await prisma.poblacionIndigenaRegistro.count();
    const instConRegistroPI = await prisma.poblacionIndigenaInstitucion.count({ where: { registros: { some: {} } } });

    const rurales = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'RURAL' } });
    const urbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'URBANA' } });
    const ruralesUrbanas = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'RURAL_URBANA' } });
    const urbanasRurales = await prisma.poblacionIndigenaInstitucion.count({ where: { tipoInstitucion: 'URBANA_RURAL' } });

    // porTipo compatible con estadisticas-modulo (para fusionar en estadisticas/actas)
    const tiposConCae = await prisma.$queryRaw<Array<{ tipo: string; total: bigint; con_cae: bigint }>>`
      SELECT
        i."tipoInstitucion"::text AS tipo,
        COUNT(*) AS total,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM "PoblacionIndigenaRegistro" r WHERE r."institucionId" = i.id
        ) THEN 1 END) AS con_cae
      FROM "PoblacionIndigenaInstitucion" i
      GROUP BY i."tipoInstitucion"::text
      ORDER BY i."tipoInstitucion"::text
    `;

    const ZONA_LABELS: Record<string, string> = {
      RURAL: 'Rural', URBANA: 'Urbana', RURAL_URBANA: 'Rural / Urbana', URBANA_RURAL: 'Urbana / Rural',
    };

    const porTipo = tiposConCae.map(r => {
      const total = Number(r.total);
      const conCae = Number(r.con_cae);
      return {
        tipo: r.tipo,
        label: ZONA_LABELS[r.tipo] ?? r.tipo,
        total,
        conCae,
        sinCae: total - conCae,
        cobertura: total > 0 ? Math.round((conCae / total) * 100) : 0,
      };
    });

    // municipiosData con formato { nombre, con, sin } compatible con estadisticas-modulo
    const municipios = await prisma.poblacionIndigenaMunicipio.findMany({
      include: {
        instituciones: {
          select: { id: true, registros: { select: { id: true }, take: 1 } },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    const municipiosDataCombined = municipios.map(m => {
      const con = m.instituciones.filter(i => i.registros.length > 0).length;
      return { nombre: m.nombre, con, sin: m.instituciones.length - con };
    });

    // Registros por municipio (para la página propia de PI)
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
    const registrosPorMesRaw = await prisma.poblacionIndigenaRegistro.groupBy({
      by: ['fecha'],
      _count: { id: true },
    });

    const registrosAgrupados: Record<string, number> = {};
    registrosPorMesRaw.forEach(r => {
      const fecha = new Date(r.fecha);
      const mesAño = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      registrosAgrupados[mesAño] = (registrosAgrupados[mesAño] || 0) + r._count.id;
    });

    const registrosPorMes = Object.entries(registrosAgrupados)
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
      instConRegistroPI,
      porTipo,
      municipiosDataCombined,
      distribucion: { rurales, urbanas, ruralesUrbanas, urbanasRurales },
      distribucionTipo,
      municipiosData,
      registrosPorMes,
      topInstituciones,
    });
  } catch (error) {
    console.error('Estadísticas error:', error);
    return NextResponse.json({ error: 'Error generando estadísticas' }, { status: 500 });
  }
}
