'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

type Anotacion = {
  id: number; titulo: string; contenido: string; createdAt: string;
  municipio?: { nombre: string };
  institucion?: { nombre: string };
};

export default function AnotacionesPage() {
  const [anotaciones, setAnotaciones] = useState<Anotacion[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitulo, setFormTitulo] = useState('');
  const [formCont, setFormCont] = useState('');

  const fetchAnotaciones = async () => {
    setLoading(true);
    const res = await fetch('/api/anotaciones');
    setAnotaciones(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchAnotaciones(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/anotaciones/${editingId}` : '/api/anotaciones';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: formTitulo, contenido: formCont })
    });
    setIsModalOpen(false);
    fetchAnotaciones();
  };

  const openCreate = () => {
    setEditingId(null); setFormTitulo(''); setFormCont('');
    setIsModalOpen(true);
  };
  const openEdit = (a: Anotacion) => {
    setEditingId(a.id); setFormTitulo(a.titulo || ''); setFormCont(a.contenido || '');
    setIsModalOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar anotación?')) return;
    await fetch(`/api/anotaciones/${id}`, { method: 'DELETE' });
    fetchAnotaciones();
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Anotaciones Grales.</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nueva Nota</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? <p>Cargando...</p> : anotaciones.map(a => (
          <div key={a.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{a.titulo}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {new Date(a.createdAt).toLocaleDateString()}
            </p>
            <p style={{ flex: 1, marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{a.contenido}</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto' }}>
              <button className="btn" style={{ background: '#e2e8f0', padding: '0.3rem 0.6rem' }} onClick={() => openEdit(a)}>Editar</button>
              <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(a.id)}>Borrar</button>
            </div>
          </div>
        ))}
        {!loading && anotaciones.length === 0 && <p>No hay anotaciones registradas.</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Anotación' : 'Nueva Anotación'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Título</label>
            <input required className="input-field" value={formTitulo} onChange={e => setFormTitulo(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contenido</label>
            <textarea required className="input-field" value={formCont} onChange={e => setFormCont(e.target.value)} rows={5} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
