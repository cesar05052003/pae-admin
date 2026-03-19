'use client';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <h1 className={styles.title} style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Sistema de Gestión</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/actas" className={`glass-panel ${styles.mainCard}`}>
          <h2>Actas de Conformación</h2>
          <p>Gestionar actas por municipio e institución</p>
        </Link>
        <Link href="/planes" className={`glass-panel ${styles.mainCard}`}>
          <h2>Planes Pedagógicos</h2>
          <p>Gestionar planes por municipio e institución</p>
        </Link>
      </div>
    </div>
  );
}
