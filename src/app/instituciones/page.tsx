'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Institucion = { id: number; nombre: string; municipioId: number; municipio?: { nombre: string } };
type Municipio = { id: number; nombre: string };

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formMunicipioId, setFormMunicipioId] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [resInst, resMuni] = await Promise.all([
      fetch(`/api/instituciones${filterMunicipio ? '?municipioId='+filterMunicipio : ''}`),
      fetch('/api/municipios')
    ]);
    const datInst = await resInst.json();
    const datMuni = await resMuni.json();
    setInstituciones(datInst);
    setMunicipios(datMuni);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filterMunicipio]);

  const filteredInstituciones = instituciones.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    const url = editingId ? `/api/instituciones/${editingId}` : '/api/instituciones';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: formNombre, municipioId: formMunicipioId })
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json?.error || 'Error al guardar institución');
        return;
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError('Error de red. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormNombre('');
    setFormError('');
    setFormMunicipioId(filterMunicipio || (municipios[0]?.id ? String(municipios[0].id) : ''));
    setIsModalOpen(true);
  };

  const openEdit = (i: Institucion) => {
    setEditingId(i.id);
    setFormNombre(i.nombre);
    setFormMunicipioId(String(i.municipioId));
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
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      const payload = data.map(item => ({
        nombre: item.nombre || item.Nombre,
        municipioId: Number(item.municipioId || item.MunicipioId)
      })).filter(i => i.nombre && i.municipioId);

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
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>Instituciones</h1>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="input-field"
              placeholder="Buscar institución..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ minWidth: '220px', maxWidth: '320px' }}
            />
          <select className="input-field" style={{ width: '200px' }} value={filterMunicipio} onChange={e => setFilterMunicipio(e.target.value)}>
            <option value="">Todos los Municipios</option>
            {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
          <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel</button>
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
                <th>Municipio</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstituciones.map(i => (
                <tr key={i.id}>
                  <td>{i.id}</td>
                  <td>{i.nombre}</td>
                  <td>{i.municipio?.nombre}</td>
                  <td>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.25rem 0.5rem' }} onClick={() => openEdit(i)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(i.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {instituciones.length === 0 && <tr><td colSpan={4} style={{textAlign:'center'}}>No hay instituciones</td></tr>}
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Municipio</label>
            <select required className="input-field" value={formMunicipioId} onChange={e => setFormMunicipioId(e.target.value)}>
              <option value="">Seleccione un municipio</option>
              {municipios.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          {formError && (
            <div style={{ color: '#b91c1c', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{formError}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Instituciones">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube un archivo Excel (.xlsx, .csv) con las columnas <b>nombre</b> y <b>municipioId</b>.</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUpload} />
        </div>
      </Modal>
    </div>
  );
}
