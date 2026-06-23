'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import Link from 'next/link';
import styles from '../page.module.css';

type Totales = { municipios: number; instituciones: number; con: number; sin: number; cobertura: number };
type MunicipioData = { nombre: string; con: number; sin: number };
type PorTipoItem = { tipo: string; label: string; total: number; conCae: number; sinCae: number; cobertura: number };

type StatsPI = {
  totales: { totalMunicipios: number; totalInstituciones: number; totalRegistros: number };
  distribucion: { rurales: number; urbanas: number; ruralesUrbanas: number; urbanasRurales: number };
  distribucionTipo: { tipo: string; count: number }[];
  municipiosData: { nombre: string; registros: number }[];
};

const TIPO_COLORS: Record<string, string> = {
  RURAL:        '#f59e0b',
  URBANA:       '#8b5cf6',
  RURAL_URBANA: '#3b82f6',
  URBANA_RURAL: '#10b981',
};

const PI_COLORS = ['#C8621A', '#E8A020', '#5A7E28', '#8B3A12'];

const PI = {
  maroon: '#3D0E18',
  orange: '#C8621A',
  amber: '#E8A020',
  green: '#5A7E28',
  cream: '#F5E8D0',
  rust: '#8B3A12',
};

export default function EstadisticasActas() {
  const [totales, setTotales] = useState<Totales | null>(null);
  const [dataChart, setDataChart] = useState<MunicipioData[]>([]);
  const [porTipo, setPorTipo] = useState<PorTipoItem[]>([]);
  const [statsPI, setStatsPI] = useState<StatsPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/estadisticas-modulo?modo=actas').then(res => res.json()),
      fetch('/api/poblacion-indigena/estadisticas').then(res => res.json()),
    ])
      .then(([actas, pi]) => {
        setTotales(actas.totales);
        setDataChart(actas.municipiosData);
        setPorTipo(actas.porTipo ?? []);
        setStatsPI(pi);
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

      {/* ── Sección Población Indígena ── */}
      {statsPI && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2.5rem 0 1.5rem' }}>
            <div style={{ flex: 1, height: '2px', background: `linear-gradient(to right, transparent, ${PI.amber})` }} />
            <h2 style={{ fontSize: '1.3rem', color: PI.rust, whiteSpace: 'nowrap', margin: 0 }}>Población Indígena</h2>
            <div style={{ flex: 1, height: '2px', background: `linear-gradient(to left, transparent, ${PI.amber})` }} />
          </div>

          {/* Totales PI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.25rem', textAlign: 'center', background: '#fdf6ee', border: `2px solid ${PI.amber}55`, borderRadius: '14px', boxShadow: `0 4px 14px rgba(61,14,24,0.1)` }}>
              <p style={{ color: PI.rust, fontSize: '0.85rem', marginBottom: '0.4rem', margin: '0 0 0.4rem' }}>Municipios</p>
              <p style={{ fontSize: '2.2rem', fontWeight: 700, color: PI.maroon, margin: 0 }}>{statsPI.totales.totalMunicipios}</p>
            </div>
            <div style={{ padding: '1.25rem', textAlign: 'center', background: `linear-gradient(135deg, ${PI.rust} 0%, ${PI.orange} 100%)`, borderRadius: '14px', boxShadow: `0 4px 14px rgba(139,58,18,0.2)` }}>
              <p style={{ color: `${PI.cream}bb`, fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Instituciones</p>
              <p style={{ fontSize: '2.2rem', fontWeight: 700, color: PI.cream, margin: 0 }}>{statsPI.totales.totalInstituciones}</p>
            </div>
            <div style={{ padding: '1.25rem', textAlign: 'center', background: `linear-gradient(135deg, #3D6B1C 0%, ${PI.green} 100%)`, borderRadius: '14px', boxShadow: `0 4px 14px rgba(90,126,40,0.2)` }}>
              <p style={{ color: `${PI.cream}bb`, fontSize: '0.85rem', margin: '0 0 0.4rem' }}>Registros</p>
              <p style={{ fontSize: '2.2rem', fontWeight: 700, color: PI.cream, margin: 0 }}>{statsPI.totales.totalRegistros}</p>
            </div>
          </div>

          {/* Distribución + Gráfica por municipio */}
          <div style={{ display: 'grid', gridTemplateColumns: statsPI.municipiosData.length > 0 ? '1fr 1fr' : '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Distribución por tipo */}
            <div style={{ padding: '1.5rem', background: '#fdf6ee', border: `2px solid ${PI.amber}44`, borderRadius: '14px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: PI.maroon, fontSize: '1rem' }}>Distribución por Tipo</h3>
              {statsPI.distribucionTipo.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={statsPI.distribucionTipo} dataKey="count" nameKey="tipo" cx="50%" cy="50%" outerRadius={70} label>
                        {statsPI.distribucionTipo.map((_, idx) => (
                          <Cell key={idx} fill={PI_COLORS[idx % PI_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fdf6ee', border: `1px solid ${PI.amber}66`, color: PI.maroon }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: PI.rust }}>
                    {statsPI.distribucionTipo.map((d, i) => (
                      <p key={d.tipo} style={{ margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', background: PI_COLORS[i % PI_COLORS.length], borderRadius: '2px', flexShrink: 0 }} />
                        {d.tipo}: <b>{d.count}</b>
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ color: PI.rust, fontSize: '0.9rem' }}>Sin datos</p>
              )}
            </div>

            {/* Municipios con más registros */}
            {statsPI.municipiosData.length > 0 && (
              <div style={{ padding: '1.5rem', background: '#fdf6ee', border: `2px solid ${PI.amber}44`, borderRadius: '14px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: PI.maroon, fontSize: '1rem' }}>Municipios con más Registros</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={statsPI.municipiosData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${PI.amber}55`} vertical={false} />
                    <XAxis dataKey="nombre" angle={-45} textAnchor="end" tick={{ fill: PI.rust, fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fill: PI.rust }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#fdf6ee', border: `1px solid ${PI.amber}66`, color: PI.maroon }} />
                    <Bar dataKey="registros" fill={PI.orange} radius={[6, 6, 0, 0]} name="Registros" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
