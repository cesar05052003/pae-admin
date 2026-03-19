'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

type InstitucionWithCount = {
  id: number;
  nombre: string;
  _count: { actas: number; planes: number };
};
type RouteParams = { params: Promise<{ municipioId: string }> };

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>
        <span>{label}</span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

export default function PlanesInstitucionesPage(props: RouteParams) {
  const params = use(props.params);
  const municipioId = params.municipioId;
  const [instituciones, setInstituciones] = useState<InstitucionWithCount[]>([]);
  const [municipioNombre, setMunicipioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<InstitucionWithCount | null>(null);
  const [instNombre, setInstNombre] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/municipios/${municipioId}`).then(res => res.json()).then(data => {
      setMunicipioNombre(data.nombre);
    });
    fetch(`/api/instituciones?municipioId=${municipioId}`).then(res => res.json()).then(data => {
      setInstituciones(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [municipioId]);

  const handleSaveInst = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editingInst ? `/api/instituciones/${editingInst.id}` : '/api/instituciones';
    const method = editingInst ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: instNombre, municipioId: Number(municipioId) })
    });
    setSaving(false);
    setIsInstModalOpen(false);
    fetchData();
  };

  const openCreateInst = () => {
    setEditingInst(null);
    setInstNombre('');
    setIsInstModalOpen(true);
  };

  const openEditInst = (e: React.MouseEvent, i: InstitucionWithCount) => {
    e.preventDefault(); e.stopPropagation();
    setEditingInst(i);
    setInstNombre(i.nombre);
    setIsInstModalOpen(true);
  };

  const deleteInst = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('¿Eliminar esta institución y todos sus registros asociados?')) return;
    await fetch(`/api/instituciones/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const maxPlanes = Math.max(...instituciones.map(i => i._count?.planes || 0), 1);
  const filteredInstituciones = instituciones.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/planes" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Instituciones en {municipioNombre}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input-field"
            placeholder="Buscar institución..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ minWidth: '220px', maxWidth: '320px' }}
          />
          <button className="btn" style={{ background: 'var(--success-color)', color: 'white' }} onClick={openCreateInst}>+ Nueva Institución</button>
        </div>
      </div>
      
      {loading ? <p>Cargando instituciones...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredInstituciones.map((i, idx) => (
            <Link key={i.id} href={`/planes/${municipioId}/${i.id}`} className="glass-panel" style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', marginTop: '1rem' }}>{i.nombre}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <ProgressBar
                  value={i._count?.planes || 0}
                  max={maxPlanes}
                  color="var(--success-color)"
                  label="Planes Pedagógicos"
                />
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: i._count?.planes > 0 ? '#22c55e' : '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{i._count?.planes > 0 ? '✔ Tiene planes registrados' : 'Sin planes aún'}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn" style={{ background: '#f1f5f9', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={(e) => openEditInst(e, i)}>Edit</button>
                  <button className="btn" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={(e) => deleteInst(e, i.id)}>Del</button>
                </div>
              </div>
            </Link>
          ))}
          {instituciones.length === 0 && <p>No hay instituciones registradas en este municipio.</p>}
        </div>
      )}

      <Modal isOpen={isInstModalOpen} onClose={() => setIsInstModalOpen(false)} title={editingInst ? 'Editar Institución' : 'Nueva Institución'}>
        <form onSubmit={handleSaveInst} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Nombre de la Institución</label>
          <input required className="input-field" value={instNombre} onChange={e => setInstNombre(e.target.value)} autoFocus />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsInstModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
