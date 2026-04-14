import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

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
          <Header />
          <main className="main-content" style={{ padding: '2rem 1rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
