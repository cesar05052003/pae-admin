'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Municipios', href: '/municipios' },
    { label: 'Instituciones', href: '/instituciones' },
    { label: 'Actas', href: '/actas' },
    { label: 'Planes Pedagógicos', href: '/planes' },
    { label: 'Anotaciones', href: '/anotaciones' },
    { label: 'Informe Sin CAE', href: '/informe-sin-cae' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>PAE Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`nav-link ${pathname === item.href ? 'active' : ''}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
