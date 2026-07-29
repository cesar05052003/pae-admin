'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type ExcelPlan = { id: number; nombre: string; archivoUrl: string; createdAt: string };
type InstitucionConExcel = { id: number; nombre: string; planes: ExcelPlan[] };
type MunicipioConExcel = { id: number; nombre: string; instituciones: InstitucionConExcel[] };

export default function SeguimientoExcelPage() {
  const [municipios, setMunicipios] = useState<MunicipioConExcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/planes/con-excel')
      .then(res => res.json())
      .then(data => {
        setMunicipios(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const search = searchTerm.trim().toLowerCase();
  const filteredMunicipios = municipios
    .map(m => ({
      ...m,
      instituciones: m.instituciones.filter(i =>
        !search || i.nombre.toLowerCase().includes(search) || m.nombre.toLowerCase().includes(search)
      ),
    }))
    .filter(m => m.instituciones.length > 0);

  const totalInstituciones = municipios.reduce((acc, m) => acc + m.instituciones.length, 0);

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/planes" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Seguimiento de Actividades (Excel)</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Instituciones que tienen un formato de seguimiento de actividades en Excel cargado.
            {!loading && ` (${totalInstituciones})`}
          </p>
        </div>
        <input
          className="input-field"
          placeholder="Buscar municipio o institución..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ minWidth: '220px', maxWidth: '320px' }}
        />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : filteredMunicipios.length === 0 ? (
        <p>{searchTerm ? 'No se encontraron resultados.' : 'No hay instituciones con registro Excel todavía.'}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredMunicipios.map(m => (
            <div key={m.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--success-color)', marginBottom: '1rem' }}>{m.nombre}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {m.instituciones.map(i => {
                  const ultimoExcel = i.planes[0];
                  return (
                    <div
                      key={i.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{i.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {i.planes.length} {i.planes.length === 1 ? 'archivo Excel' : 'archivos Excel'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {ultimoExcel && (
                          <a
                            href={ultimoExcel.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}
                          >
                            📊 Ver Excel
                          </a>
                        )}
                        {i.planes.length > 1 && (
                          <Link href={`/planes/${m.id}/${i.id}`} style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Ver todos
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
