'use client';
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import styles from './page.module.css';

type Totales = {
  municipios: number;
  instituciones: number;
  actas: number;
  planes: number;
  coberturaActas: number;
  coberturaPlanes: number;
};

type MunicipioData = { nombre: string; actas: number; planes: number };

type RuralesData = {
  distribucion: { zona: string; count: number }[];
  rurales: {
    total: number;
    conActas: number; sinActas: number; coberturaActas: number;
    conPlanes: number; sinPlanes: number; coberturaPlanes: number;
  };
  municipiosData: { nombre: string; total: number; conActas: number; sinActas: number; conPlanes: number; sinPlanes: number }[];
};

const ZONA_PIE_COLORS: Record<string, string> = {
  'Rural':          '#f59e0b',
  'Urbana':         '#8b5cf6',
  'Rural / Urbana': '#3b82f6',
  'Urbana / Rural': '#10b981',
};

export default function EstadisticasDashboard() {
  const [totales, setTotales]     = useState<Totales | null>(null);
  const [dataChart, setDataChart] = useState<MunicipioData[]>([]);
  const [rurales, setRurales]     = useState<RuralesData | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/estadisticas')
      .then(r => r.json())
      .then(data => {
        setTotales(data.totales);
        setDataChart(data.municipiosData);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });

    fetch('/api/estadisticas-rurales')
      .then(r => r.json())
      .then(data => { if (data.rurales) setRurales(data); })
      .catch(err => console.error('Rural stats error:', err));
  }, []);

  if (loading) return <div className="container"><p>Cargando estadísticas...</p></div>;

  return (
    <div className="container">
      <h1 className={styles.title}>Dashboard — PAE</h1>

      {/* Totales */}
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Municipios</h3>
          <p className={styles.statValue}>{totales?.municipios}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Instituciones</h3>
          <p className={styles.statValue}>{totales?.instituciones}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Actas Registradas</h3>
          <p className={styles.statValue}>{totales?.actas}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <h3>Planes Pedagógicos</h3>
          <p className={styles.statValue}>{totales?.planes}</p>
        </div>
      </div>

      {/* Coverage bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Cobertura de Actas por Institución</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
            <span>Progreso</span><span>{totales?.coberturaActas}%</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totales?.coberturaActas || 0}%`, background: 'var(--primary-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Cobertura de Planes por Institución</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
            <span>Progreso</span><span>{totales?.coberturaPlanes}%</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totales?.coberturaPlanes || 0}%`, background: 'var(--success-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Chart — Actas y Planes por municipio */}
      <div className={`glass-panel ${styles.chartContainer}`}>
        <h2>Actas y Planes por Municipio</h2>
        <div style={{ width: '100%', height: 420, margin: '20px 0', overflowX: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nombre" stroke="var(--text-secondary)" angle={-40} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
              <Legend verticalAlign="top" />
              <Bar dataKey="actas" name="Actas" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="planes" name="Planes Pedagógicos" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Análisis por Zona Rural ── */}
      {rurales && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.12)' }} />
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-color)', whiteSpace: 'nowrap', margin: 0 }}>
              Análisis por Zona Rural
            </h2>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.12)' }} />
          </div>

          {/* Distribución de zonas + métricas rurales */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>

            {/* Pie chart distribución */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Distribución por Zona</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={rurales.distribucion}
                    dataKey="count"
                    nameKey="zona"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {rurales.distribucion.map((entry, i) => (
                      <Cell key={i} fill={ZONA_PIE_COLORS[entry.zona] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, name) => [v, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Métricas rurales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Instituciones Rurales</h3>
                <p style={{ fontSize: '2.2rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>{rurales.rurales.total}</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Rural + Rural/Urbana + Urbana/Rural
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Cobertura Actas — Rurales</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>{rurales.rurales.conActas} con acta / {rurales.rurales.sinActas} sin acta</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{rurales.rurales.coberturaActas}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rurales.rurales.coberturaActas}%`, background: 'var(--primary-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Cobertura Planes — Rurales</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
                  <span>{rurales.rurales.conPlanes} con plan / {rurales.rurales.sinPlanes} sin plan</span>
                  <span style={{ fontWeight: 700, color: 'var(--success-color)' }}>{rurales.rurales.coberturaPlanes}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${rurales.rurales.coberturaPlanes}%`, background: 'var(--success-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Bar chart — rurales por municipio */}
          <div className={`glass-panel ${styles.chartContainer}`} style={{ marginBottom: '2rem' }}>
            <h2>Instituciones Rurales por Municipio — Cobertura de Actas</h2>
            <div style={{ width: '100%', height: 420, margin: '20px 0' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rurales.municipiosData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
                  <XAxis dataKey="nombre" stroke="var(--text-secondary)" angle={-40} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="conActas"  name="Con Acta"  fill="var(--primary-color)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="sinActas"  name="Sin Acta"  fill="#ef4444"              radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
