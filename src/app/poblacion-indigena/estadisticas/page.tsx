'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#ec4899'];
const ZONA_LABELS: Record<string, string> = { RURAL: 'Rural', URBANA: 'Urbana' };

type Stats = {
  totales: { totalMunicipios: number; totalInstituciones: number; totalRegistros: number };
  distribucion: { rurales: number; urbanas: number };
  distribucionTipo: { tipo: string; count: number }[];
  municipiosData: { nombre: string; registros: number }[];
  registrosPorMes: { mes: string; registros: number }[];
  topInstituciones: { nombre: string; registros: number; tipo: string }[];
};

export default function EstadisticasPI() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/poblacion-indigena/estadisticas')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="container"><p>Cargando estadísticas...</p></div>;
  if (!stats) return <div className="container"><p>Error al cargar estadísticas</p></div>;

  const { totales, distribucion, distribucionTipo, municipiosData, registrosPorMes } = stats;

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/poblacion-indigena" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Estadísticas — Población Indígena</h1>
      </div>

      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Municipios</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{totales.totalMunicipios}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Instituciones</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#8b5cf6' }}>{totales.totalInstituciones}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Registros</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#10b981' }}>{totales.totalRegistros}</p>
        </div>
      </div>

      {/* Distribución de Instituciones por Tipo */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Distribución por Tipo de Institución</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={distribucionTipo} dataKey="count" nameKey="tipo" cx="50%" cy="50%" outerRadius={80} label>
                {distribucionTipo.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            {distribucionTipo.map((d, i) => (
              <p key={d.tipo} style={{ margin: '0.25rem 0' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: COLORS[i % COLORS.length], borderRadius: '2px', marginRight: '0.5rem' }} />
                {d.tipo}: <b>{d.count}</b>
              </p>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Resumen de Distribución</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span>Rural</span>
                <b>{distribucion.rurales}</b>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (distribucion.rurales / totales.totalInstituciones) * 100)}%`, background: '#f59e0b', borderRadius: '99px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span>Urbana</span>
                <b>{distribucion.urbanas}</b>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (distribucion.urbanas / totales.totalInstituciones) * 100)}%`, background: '#8b5cf6', borderRadius: '99px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Municipios */}
      {municipiosData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Municipios con Más Registros</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={municipiosData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registros" fill="var(--primary-color)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}