'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EstadisticasPI() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch('/api/poblacion-indigena/estadisticas').then(r => r.json()).then(setData); }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/poblacion-indigena" className="btn" style={{ background: '#e2e8f0' }}>← Regresar</Link>
      </div>
      <h1>Estadísticas — Población Indígena</h1>
      {!data ? <p>Cargando...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3>Total Municipios</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.totalMunicipios}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3>Total Instituciones</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.totalInstituciones}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3>Total Registros</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.totalRegistros}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3>Instituciones Rurales</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.rurales}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3>Instituciones Urbanas</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.urbanas}</p>
          </div>
        </div>
      )}
    </div>
  );
}
