'use client';
import Link from 'next/link';
import styles from './page.module.css';
import { useEffect, useState } from 'react';

type Stats = {
  instConActas: number;
  instConPlanes: number;
};

export default function Home() {
  const [stats, setStats] = useState<Stats>({ instConActas: 0, instConPlanes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/estadisticas');
        const data = await res.json();
        setStats({
          instConActas: data.totales.instConActas,
          instConPlanes: data.totales.instConPlanes
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Polling cada 5 segundos para actualizaciones en tiempo real
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <h1 className={styles.title} style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Sistema de Gestión</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/actas" className={`glass-panel ${styles.mainCard}`} style={{ backgroundColor: 'rgba(255, 165, 100, 1.0)' }}>
          <h2>Actas de Conformación</h2>
          <p>Gestionar actas por municipio e institución</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
            {loading ? 'Cargando...' : `${stats.instConActas} instituciones con acta`}
          </p>
        </Link>
        <Link href="/planes" className={`glass-panel ${styles.mainCard}`} style={{ backgroundColor: 'rgba(239, 68, 68, 1.0)' }}>
          <h2>Planes Pedagógicos</h2>
          <p>Gestionar planes por municipio e institución</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
            {loading ? 'Cargando...' : `${stats.instConPlanes} instituciones con planes`}
          </p>
        </Link>
      </div>
    </div>
  );
}
