'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#C8621A', '#E8A020', '#5A7E28', '#8B3A12', '#D4962A', '#3D6B1C'];
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

  const PI = {
    maroon: '#3D0E18',
    orange: '#C8621A',
    amber: '#E8A020',
    green: '#5A7E28',
    cream: '#F5E8D0',
    rust: '#8B3A12',
    darkAmber: '#A06810',
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Título */}
      <div style={{
        background: 'rgba(61,14,24,0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        marginBottom: '2rem',
        padding: '1.75rem 2rem',
        border: '1px solid rgba(232,160,32,0.3)',
      }}>
        <Link href="/poblacion-indigena" className="btn" style={{ background: 'rgba(245,232,208,0.15)', color: PI.cream, border: `1px solid rgba(245,232,208,0.35)`, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', backdropFilter: 'blur(6px)' }}>← Regresar</Link>
        <h1 style={{ fontSize: '2rem', color: PI.cream, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Estadísticas — Población Indígena</h1>
      </div>

      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', textAlign: 'center', background: `linear-gradient(135deg, ${PI.maroon} 0%, #5C1525 100%)`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(61,14,24,0.25)` }}>
          <p style={{ color: `${PI.cream}bb`, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Municipios</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: PI.amber, margin: 0 }}>{totales.totalMunicipios}</p>
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center', background: `linear-gradient(135deg, ${PI.rust} 0%, #C8621A 100%)`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(139,58,18,0.25)` }}>
          <p style={{ color: `${PI.cream}bb`, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Instituciones</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: PI.cream, margin: 0 }}>{totales.totalInstituciones}</p>
        </div>
        <div style={{ padding: '1.5rem', textAlign: 'center', background: `linear-gradient(135deg, #3D6B1C 0%, ${PI.green} 100%)`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(90,126,40,0.25)` }}>
          <p style={{ color: `${PI.cream}bb`, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Registros</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: PI.cream, margin: 0 }}>{totales.totalRegistros}</p>
        </div>
      </div>

      {/* Distribución */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: '#fdf6ee', border: `2px solid ${PI.amber}44`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(61,14,24,0.08)` }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: PI.maroon }}>Distribución por Tipo de Institución</h3>
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
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: PI.rust }}>
            {distribucionTipo.map((d, i) => (
              <p key={d.tipo} style={{ margin: '0.25rem 0' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', background: COLORS[i % COLORS.length], borderRadius: '2px', marginRight: '0.5rem' }} />
                {d.tipo}: <b>{d.count}</b>
              </p>
            ))}
          </div>
        </div>

        <div style={{ padding: '1.5rem', background: '#fdf6ee', border: `2px solid ${PI.amber}44`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(61,14,24,0.08)` }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: PI.maroon }}>Resumen de Distribución</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: PI.rust }}>
                <span>Rural</span>
                <b>{distribucion.rurales}</b>
              </div>
              <div style={{ height: '10px', background: `${PI.amber}33`, borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (distribucion.rurales / totales.totalInstituciones) * 100)}%`, background: PI.amber, borderRadius: '99px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', color: PI.rust }}>
                <span>Urbana</span>
                <b>{distribucion.urbanas}</b>
              </div>
              <div style={{ height: '10px', background: `${PI.orange}33`, borderRadius: '99px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (distribucion.urbanas / totales.totalInstituciones) * 100)}%`, background: PI.orange, borderRadius: '99px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Municipios */}
      {municipiosData.length > 0 && (
        <div style={{ padding: '1.5rem', marginBottom: '2rem', background: '#fdf6ee', border: `2px solid ${PI.amber}44`, borderRadius: '14px', boxShadow: `0 4px 18px rgba(61,14,24,0.08)` }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: PI.maroon }}>Municipios con Más Registros</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={municipiosData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${PI.amber}55`} />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={80} tick={{ fill: PI.rust }} />
              <YAxis tick={{ fill: PI.rust }} />
              <Tooltip contentStyle={{ background: '#fdf6ee', border: `1px solid ${PI.amber}66`, color: PI.maroon }} />
              <Bar dataKey="registros" fill={PI.orange} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}