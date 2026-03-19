'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Institucion = { id: number; nombre: string };
type RouteParams = { params: Promise<{ id: string }> };

export default function MunicipioInstitucionesPage(props: RouteParams) {
  const params = use(props.params);
  const municipioId = params.id;

  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [municipioNombre, setMunicipioNombre] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [resInst, resMuni] = await Promise.all([
      fetch(`/api/instituciones?municipioId=${municipioId}`),
      fetch(`/api/municipios/${municipioId}`)
    ]);
    const datInst = await resInst.json();
    const datMuni = await resMuni.json();
    setInstituciones(datInst);
    setMunicipioNombre(datMuni.nombre || '');
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [municipioId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/instituciones/${editingId}` : '/api/instituciones';
    const method = editingId ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: formNombre, municipioId: Number(municipioId) })
    });
    
    setIsModalOpen(false);
    fetchData();
  };

  const openCreate = () => {
    setEditingId(null);
    setFormNombre('');
    setIsModalOpen(true);
  };

  const openEdit = (i: Institucion) => {
    setEditingId(i.id);
    setFormNombre(i.nombre);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar institución?')) return;
    await fetch(`/api/instituciones/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];
      
      const payload = data.map(item => ({
        nombre: item.nombre || item.Nombre,
        municipioId: Number(municipioId)
      })).filter(i => i.nombre);

      await fetch('/api/instituciones/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsImportModalOpen(false);
      fetchData();
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href="/municipios" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Instituciones en {municipioNombre}</h1>
        </div>
        <div>
          <button className="btn" style={{ background: '#e2e8f0', marginRight: '1rem' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Nueva Inst.</button>
        </div>
      </div>

      <div className="table-container">
        {loading ? <p style={{padding: '1rem'}}>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instituciones.map((i, idx) => (
                <tr key={i.id}>
                  <td>{String(idx + 1).padStart(2, '0')}</td>
                  <td>{i.nombre}</td>
                  <td>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.25rem 0.5rem' }} onClick={() => openEdit(i)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(i.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {instituciones.length === 0 && <tr><td colSpan={3} style={{textAlign:'center'}}>No hay instituciones registradas en este municipio.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Institución' : 'Nueva Institución'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nombre</label>
            <input required className="input-field" value={formNombre} onChange={e => setFormNombre(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Instituciones">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube un archivo Excel (.xlsx, .csv) con la columna <b>nombre</b>. Las instituciones se asignarán automáticamente a este municipio.</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUpload} />
        </div>
      </Modal>
    </div>
  );
}
