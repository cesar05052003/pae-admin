'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const showInformeButtons = pathname === '/actas';
  const isIndigena = pathname.startsWith('/poblacion-indigena');

  const headerBg = isIndigena ? 'rgba(253,246,238,0.92)' : 'rgba(255, 165, 100, 0.9)';
  const headerBorder = isIndigena ? '2px solid rgba(232,160,32,0.5)' : '1px solid rgba(255, 127, 39, 0.6)';

  return (
    <header style={{ padding: '1rem 2rem', background: headerBg, backdropFilter: 'blur(12px)', borderBottom: headerBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
      <Link href="/" className="header-brand">
        <img src="/BOTON-LOGO.png" alt="Gobernación de Córdoba" className="app-logo" />
      </Link>
      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {showInformeButtons && (
          <>
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
              href="/poblacion-indigena"
              style={{
                fontWeight: 500,
                color: '#ffffff',
                background: '#10b981',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#0f766e'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
            >
              Población Indígena
            </Link>
          </>
        )}
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
