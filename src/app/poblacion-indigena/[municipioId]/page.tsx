'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

type Institucion = { id: number; nombre: string; tipoInstitucion?: string };
type RouteParams = { params: Promise<{ municipioId: string }> };

const ZONA_LABELS: Record<string, string> = { RURAL: 'Rural', URBANA: 'Urbana', RURAL_URBANA: 'Rural / Urbana', URBANA_RURAL: 'Urbana / Rural' };
const ZONA_BG: Record<string, string>     = { RURAL: '#fdf0d8', URBANA: '#fde8d0', RURAL_URBANA: '#e8f4e0', URBANA_RURAL: '#f5e8d0' };
const ZONA_COLOR: Record<string, string>  = { RURAL: '#A06810', URBANA: '#C8621A', RURAL_URBANA: '#5A7E28', URBANA_RURAL: '#8B3A12' };

export default function PIInstitucionesPage(props: RouteParams) {
  const params = use(props.params);
  const municipioId = params.municipioId;
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [municipioNombre, setMunicipioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<Institucion | null>(null);
  const [instNombre, setInstNombre] = useState('');
  const [instZona, setInstZona] = useState('URBANA');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/poblacion-indigena/municipios/${municipioId}`).then(res => res.json()).then(data => { setMunicipioNombre(data.nombre); });
    fetch(`/api/poblacion-indigena/instituciones?municipioId=${municipioId}`).then(res => res.json()).then(data => { setInstituciones(data); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [municipioId]);

  const handleSaveInst = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const url = editingInst ? `/api/poblacion-indigena/instituciones/${editingInst.id}` : '/api/poblacion-indigena/instituciones';
    const method = editingInst ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: instNombre, municipioId: Number(municipioId), tipoInstitucion: instZona }) });
    setSaving(false); setIsInstModalOpen(false); fetchData();
  };

  const openCreateInst = () => { setEditingInst(null); setInstNombre(''); setInstZona('URBANA'); setIsInstModalOpen(true); };
  const openEditInst = (e: React.MouseEvent, i: Institucion) => { e.preventDefault(); e.stopPropagation(); setEditingInst(i); setInstNombre(i.nombre); setInstZona(i.tipoInstitucion || 'URBANA'); setIsInstModalOpen(true); };
  const deleteInst = async (e: React.MouseEvent, id: number) => { e.preventDefault(); e.stopPropagation(); if (!confirm('¿Eliminar esta institución y todos sus registros asociados?')) return; await fetch(`/api/poblacion-indigena/instituciones/${id}`, { method: 'DELETE' }); fetchData(); };

  const filteredInstituciones = instituciones.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const PI = {
    maroon: '#3D0E18', orange: '#C8621A', amber: '#E8A020',
    green: '#5A7E28', cream: '#F5E8D0', rust: '#8B3A12', darkAmber: '#A06810',
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Título */}
      <div style={{
        background: 'rgba(255,255,255,0.14)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        marginBottom: '2rem',
        padding: '1.75rem 2rem',
        border: '1px solid rgba(232,160,32,0.4)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <Link href="/poblacion-indigena" className="btn" style={{ background: 'rgba(245,232,208,0.15)', color: PI.cream, border: `1px solid rgba(245,232,208,0.35)`, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', backdropFilter: 'blur(6px)' }}>← Regresar</Link>
          <h1 style={{ fontSize: '1.8rem', color: PI.cream, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Instituciones en {municipioNombre}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input-field" placeholder="Buscar institución..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ minWidth: '220px', maxWidth: '320px' }} />
          <button className="btn" style={{ background: PI.green, color: '#fff', fontWeight: 600 }} onClick={openCreateInst}>+ Nueva Institución</button>
        </div>
      </div>

      {loading ? <p>Cargando instituciones...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredInstituciones.map((i, idx) => (
            <Link key={i.id} href={`/poblacion-indigena/${municipioId}/${i.id}`} style={{
              display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative',
              background: 'linear-gradient(135deg, #fdf6ee 0%, #faebd7 100%)',
              border: `2px solid ${PI.amber}55`, borderRadius: '14px',
              padding: '1.25rem', boxShadow: `0 4px 18px rgba(61,14,24,0.10)`,
            }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.75rem', fontWeight: 700, color: PI.rust }}>{String(idx + 1).padStart(2, '0')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: PI.maroon, margin: 0, flex: 1, fontWeight: 700 }}>{i.nombre}</h3>
                {i.tipoInstitucion && (
                  <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', background: ZONA_BG[i.tipoInstitucion] ?? '#fdf0d8', color: ZONA_COLOR[i.tipoInstitucion] ?? PI.rust, border: `1px solid ${ZONA_COLOR[i.tipoInstitucion] ?? PI.rust}44` }}>
                    {ZONA_LABELS[i.tipoInstitucion] ?? i.tipoInstitucion}
                  </span>
                )}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: PI.darkAmber, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ver registros →</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn" style={{ background: `${PI.amber}22`, color: PI.rust, border: `1px solid ${PI.amber}66`, fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={(e) => openEditInst(e, i)}>Editar</button>
                  <button className="btn" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={(e) => deleteInst(e, i.id)}>Eliminar</button>
                </div>
              </div>
            </Link>
          ))}
          {instituciones.length === 0 && <p>No hay instituciones registradas en este municipio.</p>}
        </div>
      )}

      <Modal isOpen={isInstModalOpen} onClose={() => setIsInstModalOpen(false)} title={editingInst ? 'Editar Institución' : 'Nueva Institución'}>
        <form onSubmit={handleSaveInst} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Nombre de la Institución</label>
            <input required className="input-field" value={instNombre} onChange={e => setInstNombre(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>Zona</label>
            <select className="input-field" value={instZona} onChange={e => setInstZona(e.target.value)}>
              <option value="RURAL">Rural</option>
              <option value="URBANA">Urbana</option>
              <option value="RURAL_URBANA">Rural / Urbana</option>
              <option value="URBANA_RURAL">Urbana / Rural</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsInstModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
