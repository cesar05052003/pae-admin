'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';

type Municipio = { id: number; nombre: string; tipoUso: string };

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formTipoUso, setFormTipoUso] = useState('ACTAS');

  const fetchMunicipios = useCallback(() => {
    setLoading(true);
    fetch('/api/municipios').then(res => res.json()).then(data => {
      setMunicipios(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchMunicipios();
  }, [fetchMunicipios]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/municipios/${editingId}` : '/api/municipios';
    const method = editingId ? 'PUT' : 'POST';
    
    const body = { 
      nombre: formNombre,
      tipoUso: formTipoUso
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    setIsModalOpen(false);
    fetchMunicipios();
  };

  const openEdit = (m: Municipio) => {
    setEditingId(m.id);
    setFormNombre(m.nombre);
    setFormTipoUso(m.tipoUso);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormNombre('');
    setFormTipoUso('ACTAS');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que desea eliminar este municipio? (Se eliminarán también sus instituciones y registros asociados)')) return;
    await fetch(`/api/municipios/${id}`, { method: 'DELETE' });
    fetchMunicipios();
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Municipios</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Municipio</button>
      </div>

      <div className="table-container">
        {loading ? <p style={{padding: '1rem'}}>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo de Uso</th>
                <th style={{ width: '300px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {municipios.map((m, idx) => (
                <tr key={m.id}>
                  <td>{String(idx + 1).padStart(2, '0')}</td>
                  <td>{m.nombre}</td>
                  <td>
                    <span className={`tag ${m.tipoUso.toLowerCase()}`}>{m.tipoUso}</span>
                  </td>
                  <td>
                    <Link href={`/municipios/${m.id}`} className="btn" style={{ marginRight: '0.5rem', background: '#e0f2fe', color: 'var(--primary-hover)' }}>Instituciones</Link>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0' }} onClick={() => openEdit(m)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(m.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {municipios.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center'}}>No hay municipios registrados</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Municipio' : 'Nuevo Municipio'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nombre del Municipio</label>
            <input 
              required
              className="input-field" 
              value={formNombre} 
              onChange={e => setFormNombre(e.target.value)} 
              placeholder="Ej: Bogotá"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Uso</label>
            <select 
              required
              className="input-field" 
              value={formTipoUso} 
              onChange={e => setFormTipoUso(e.target.value)}
            >
              <option value="ACTAS">Actas</option>
              <option value="PLANES">Planes</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .tag {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .tag.actas { background-color: #e0f2fe; color: #0ea5e9; }
        .tag.planes { background-color: #dcfce7; color: #22c55e; }
        .tag.ambos { background-color: #e2e8f0; color: #475569; }
      `}</style>
    </div>
  );
}
