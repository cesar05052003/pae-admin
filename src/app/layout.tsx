import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sistema de Gestión PAE',
  description: 'Aplicación para la gestión del Programa de Alimentación Escolar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="app-container" style={{ flexDirection: 'column' }}>
          <header style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
            <Link href="/" className="header-brand">
              <img src="/logo.svg" alt="Gobernación de Córdoba" className="app-logo" />
            </Link>
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/anotaciones" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Anotaciones</Link>
            </nav>
          </header>
          <main className="main-content" style={{ padding: '2rem 1rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
