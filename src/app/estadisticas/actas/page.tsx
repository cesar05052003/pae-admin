'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';
import styles from '../page.module.css';

type Totales = { municipios: number; instituciones: number; con: number; sin: number; cobertura: number };
type MunicipioData = { nombre: string; con: number; sin: number };
type PorTipoItem = { tipo: string; label: string; total: number; conCae: number; sinCae: number; cobertura: number };

const TIPO_COLORS: Record<string, string> = {
  RURAL:        '#f59e0b',
  URBANA:       '#8b5cf6',
  RURAL_URBANA: '#3b82f6',
  URBANA_RURAL: '#10b981',
};

export default function EstadisticasActas() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [dataChart, setDataChart] = useState<MunicipioData[]>([]);
  const [porTipo, setPorTipo] = useState<PorTipoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/estadisticas-modulo?modo=actas')
      .then(res => res.json())
      .then(data => {
        setTotales(data.totales);
        setDataChart(data.municipiosData);
        setPorTipo(data.porTipo ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><p>Cargando...</p></div>;

  const globalData = [
    { nombre: 'Sin Acta', cantidad: totales?.sin || 0 },
    { nombre: 'Con Acta', cantidad: totales?.con || 0 },
  ];

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/actas" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>← Regresar</Link>
      </div>
      <h1 className={styles.title}>Estadísticas — Actas de Conformación</h1>

      {/* Totales */}
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}><h3>Municipios</h3><p className={styles.statValue}>{totales?.municipios}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Instituciones</h3><p className={styles.statValue}>{totales?.instituciones}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Con Acta</h3><p className={styles.statValue} style={{ color: 'var(--primary-color)' }}>{totales?.con}</p></div>
        <div className={`glass-panel ${styles.statCard}`}><h3>Sin Acta</h3><p className={styles.statValue} style={{ color: '#ef4444' }}>{totales?.sin}</p></div>
      </div>

      {/* Coverage bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Cobertura General</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>
          <span>Progreso</span><span>{totales?.cobertura}%</span>
        </div>
        <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totales?.cobertura || 0}%`, background: 'var(--primary-color)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Chart 1 — General Sin / Con */}
      <div className={`glass-panel ${styles.chartContainer}`} style={{ marginBottom: '2rem' }}>
        <h2>General: Instituciones Sin / Con Acta</h2>
        <div style={{ width: '100%', height: 280, margin: '16px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={globalData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nombre" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
              <Bar dataKey="cantidad" name="Instituciones" radius={[6, 6, 0, 0]}>
                <Cell fill="#ef4444" />
                <Cell fill="var(--primary-color)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 — Por Municipio Sin / Con */}
      <div className={`glass-panel ${styles.chartContainer}`} style={{ marginBottom: '2rem' }}>
        <h2>Por Municipio: Sin / Con Acta</h2>
        <div style={{ width: '100%', height: 420, margin: '20px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="nombre" stroke="var(--text-secondary)" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '10px' }} />
              <Legend verticalAlign="top" />
              <Bar dataKey="sin" name="Sin Acta" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="con" name="Con Acta" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CAE por Tipo de Institución */}
      {porTipo.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0 1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.12)' }} />
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-color)', whiteSpace: 'nowrap', margin: 0 }}>CAE por Tipo de Institución</h2>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.12)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {porTipo.map(item => {
              const color = TIPO_COLORS[item.tipo] ?? '#94a3b8';
              return (
                <div key={item.tipo} className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: 0 }}>{item.label}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{item.total} instituciones</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#16a34a', margin: 0 }}>{item.conCae}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>con CAE</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>{item.sinCae}</p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>sin CAE</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                    <span>Cobertura</span>
                    <span style={{ fontWeight: 700, color }}>{item.cobertura}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.cobertura}%`, background: color, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
