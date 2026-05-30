'use client';
import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import styles from '../estadisticas/page.module.css';

type Institucion = { id: number; nombre: string; tipoInstitucion: string };

type MunicipioData = {
  id: number;
  nombre: string;
  totalInstituciones: number;
  sinCae: number;
  conCae: number;
  instituciones: Institucion[];
};

type Totales = {
  municipios: number;
  instituciones: number;
  sinCae: number;
  conCae: number;
  cobertura: number;
};

export default function InformeSinCae() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [municipios, setMunicipios] = useState<MunicipioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [soloSinCae, setSoloSinCae] = useState(true);

  useEffect(() => {
    fetch('/api/informe-sin-cae')
      .then(res => res.json())
      .then(data => {
        setTotales(data.totales);
        setMunicipios(data.municipios);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const municipiosFiltrados = useMemo(() => {
    return municipios
      .filter(m => !soloSinCae || m.sinCae > 0)
      .filter(m => m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.instituciones.some(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      );
  }, [municipios, busqueda, soloSinCae]);

  function exportarExcel() {
    const filas: Record<string, string | number>[] = [];
    municipios.forEach(m => {
      if (m.instituciones.length === 0) return;
      m.instituciones.forEach(inst => {
        filas.push({
          Municipio: m.nombre,
          Institución: inst.nombre,
          Tipo: inst.tipoInstitucion,
          Estado: 'Sin CAE',
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    ws['!cols'] = [{ wch: 28 }, { wch: 48 }, { wch: 12 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sin CAE');
    XLSX.writeFile(wb, 'informe-sin-cae.xlsx');
  }

  if (loading) return <div className="container"><p>Cargando informe...</p></div>;

  const totalMunicipiosConPendientes = municipios.filter(m => m.sinCae > 0).length;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 className={styles.title} style={{ marginBottom: 0 }}>Informe — Instituciones sin CAE</h1>
        <button
          onClick={exportarExcel}
          className="btn"
          style={{ background: '#16a34a', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
        >
          ↓ Exportar Excel
        </button>
      </div>

      {/* Tarjetas de resumen */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Municipios</h3>
          <p className={styles.statValue}>{totales?.municipios}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Total instituciones</h3>
          <p className={styles.statValue}>{totales?.instituciones}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Con CAE</h3>
          <p className={styles.statValue} style={{ color: 'var(--primary-color)' }}>{totales?.conCae}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Sin CAE</h3>
          <p className={styles.statValue} style={{ color: '#ef4444' }}>{totales?.sinCae}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Municipios con pendientes</h3>
          <p className={styles.statValue} style={{ color: '#f97316' }}>{totalMunicipiosConPendientes}</p>
        </div>
      </div>

      {/* Barra de cobertura */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Cobertura CAE</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
          <span>{totales?.conCae} instituciones con CAE conformado</span>
          <span style={{ fontWeight: 700 }}>{totales?.cobertura}%</span>
        </div>
        <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${totales?.cobertura || 0}%`,
            background: (totales?.cobertura ?? 0) >= 80 ? 'var(--success-color)' : (totales?.cobertura ?? 0) >= 50 ? '#f97316' : '#ef4444',
            borderRadius: '99px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar municipio o institución..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '0.6rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={soloSinCae}
            onChange={e => setSoloSinCae(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Solo municipios con pendientes
        </label>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {municipiosFiltrados.length} municipio{municipiosFiltrados.length !== 1 ? 's' : ''} mostrado{municipiosFiltrados.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla por municipio */}
      {municipiosFiltrados.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          {busqueda ? 'No se encontraron resultados para la búsqueda.' : '¡Todas las instituciones tienen CAE conformado!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {municipiosFiltrados.map(m => (
            <div key={m.id} className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
              {/* Encabezado del municipio */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: m.instituciones.length > 0 ? '1rem' : 0 }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{m.nombre}</h2>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    {m.totalInstituciones} institución{m.totalInstituciones !== 1 ? 'es' : ''} en total
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '56px', background: '#dcfce7', borderRadius: '12px', padding: '0.35rem 0.75rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: '#16a34a' }}>{m.conCae}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#16a34a', marginTop: '2px' }}>con CAE</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '56px', background: m.sinCae > 0 ? '#fee2e2' : '#f0fdf4', borderRadius: '12px', padding: '0.35rem 0.75rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1, color: m.sinCae > 0 ? '#ef4444' : '#16a34a' }}>{m.sinCae > 0 ? m.sinCae : '✓'}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: m.sinCae > 0 ? '#ef4444' : '#16a34a', marginTop: '2px' }}>{m.sinCae > 0 ? 'sin CAE' : 'completo'}</span>
                  </div>
                </div>
              </div>

              {/* Tabla de instituciones sin CAE */}
              {m.instituciones.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(239,68,68,0.06)' }}>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.9rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.9rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Institución</th>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.9rem', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.instituciones.map((inst, idx) => (
                      <tr key={inst.id} style={{ borderBottom: idx < m.instituciones.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '0.55rem 0.9rem', color: '#94a3b8', width: '40px' }}>{idx + 1}</td>
                        <td style={{ padding: '0.55rem 0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{inst.nombre}</td>
                        <td style={{ padding: '0.55rem 0.9rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '99px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: ({ RURAL: '#fef3c7', URBANA: '#ede9fe', RURAL_URBANA: '#dbeafe', URBANA_RURAL: '#d1fae5' } as Record<string, string>)[inst.tipoInstitucion] ?? '#f1f5f9',
                            color: ({ RURAL: '#b45309', URBANA: '#6d28d9', RURAL_URBANA: '#1d4ed8', URBANA_RURAL: '#065f46' } as Record<string, string>)[inst.tipoInstitucion] ?? '#475569',
                          }}>
                            {inst.tipoInstitucion}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {m.instituciones.length === 0 && (
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#16a34a', fontWeight: 500 }}>
                  ✓ Todas las instituciones tienen CAE conformado
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
