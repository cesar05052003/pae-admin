'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';
import styles from '../page.module.css';

type Totales = { municipios: number; instituciones: number; con: number; sin: number; cobertura: number };
type MunicipioData = { nombre: string; con: number; sin: number };

export default function EstadisticasPlanes() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [dataChart, setDataChart] = useState<MunicipioData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/estadisticas-modulo?modo=planes')
      .then(res => res.json())
      .then(data => { setTotales(data.totales); setDataChart(data.municipiosData); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Cargando...</p></div>;

  const globalData = [
    { nombre: 'Sin Plan', cantidad: totales?.sin || 0 },
    { nombre: 'Con Plan', cantidad: totales?.con || 0 },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/planes" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>← Regresar</Link>
      </div>
      <h1 className={styles.title}>Estadísticas — Planes Pedagógicos</h1>

      {/* Totales */}
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}><h3>Municipios</h3><p className={styles.statValue}>{totales?.municipios}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Instituciones</h3><p className={styles.statValue}>{totales?.instituciones}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Con Plan</h3><p className={styles.statValue} style={{ color: 'var(--success-color)' }}>{totales?.con}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Sin Plan</h3><p className={styles.statValue} style={{ color: '#ef4444' }}>{totales?.sin}</p></div>
      </div>

      {/* Coverage bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Cobertura General</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
          <span>Progreso</span><span>{totales?.cobertura}%</span>
        </div>
        <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totales?.cobertura || 0}%`, background: 'var(--success-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Chart 1 — General Sin / Con */}
      <div className={`glass-panel ${styles.chartContainer}`} style={{ marginBottom: '2rem' }}>
        <h2>General: Instituciones Sin / Con Plan</h2>
        <div style={{ width: '100%', height: 280, margin: '16px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={globalData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
              <Bar dataKey="cantidad" name="Instituciones" radius={[6, 6, 0, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="var(--success-color)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 — Por Municipio Sin / Con */}
      <div className={`glass-panel ${styles.chartContainer}`}>
        <h2>Por Municipio: Sin / Con Plan</h2>
        <div style={{ width: '100%', height: 420, margin: '20px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nombre" stroke="var(--text-secondary)" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
              <Legend verticalAlign="top" />
              <Bar dataKey="sin" name="Sin Plan" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="con" name="Con Plan" fill="var(--success-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
