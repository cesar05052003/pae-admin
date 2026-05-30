'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ padding: '1rem 2rem', background: 'rgba(255, 165, 100, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 127, 39, 0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
      <Link href="/" className="header-brand">
        <img src="/BOTON-LOGO.png" alt="Gobernación de Córdoba" className="app-logo" />
      </Link>
      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/estadisticas"
          style={{
            fontWeight: 500,
            color: '#ffffff',
            background: '#7c3aed',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#6d28d9'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#7c3aed'}
        >
          Estadísticas
        </Link>
        <Link
          href="/informe-sin-cae"
          style={{
            fontWeight: 500,
            color: '#ffffff',
            background: '#ef4444',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
        >
          Informe Sin CAE
        </Link>
        <Link
          href="/anotaciones"
          style={{
            fontWeight: 500,
            color: '#ffffff',
            background: '#2563eb',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            transition: 'background 0.2s ease',
            display: 'inline-block'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          Anotaciones
        </Link>
      </nav>
    </header>
  );
}
