'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Registro = { id: number; fecha: string; descripcion: string; archivoUrl?: string };
type RouteParams = { params: Promise<{ municipioId: string; institucionId: string }> };

function FileIcon({ url }: { url: string }) {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const emoji = isImage ? '🖼️' : isPdf ? '📄' : '📎';
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', fontSize: '0.85rem' }}>
      {emoji} Ver archivo
    </a>
  );
}

export default function PIRegistrosPage(props: RouteParams) {
  const params = use(props.params) as any;
  const { municipioId, institucionId } = params;
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [instNombre, setInstNombre] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    fetch(`/api/poblacion-indigena/instituciones/${institucionId}`).then(res => res.json()).then(data => { setInstNombre(data.nombre); });
    fetch(`/api/poblacion-indigena/registros?municipioId=${municipioId}&institucionId=${institucionId}`).then(res => res.json()).then(data => { setRegistros(data); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [municipioId, institucionId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc && !formFile) {
      alert('Por favor ingresa descripción o selecciona un archivo');
      return;
    }
    setUploading(true);
    let archivoUrl: string | undefined;

    if (formFile) {
      try {
        const fd = new FormData();
        fd.append('file', formFile);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const json = await res.json();
        archivoUrl = json.url;
        console.log('File uploaded:', archivoUrl);
      } catch (err) {
        console.error('Upload error:', err);
        alert('Error al subir archivo');
        setUploading(false);
        return;
      }
    }

    try {
      const url = editingId ? `/api/poblacion-indigena/registros/${editingId}` : '/api/poblacion-indigena/registros';
      const method = editingId ? 'PUT' : 'POST';
      const body = { 
        descripcion: formDesc, 
        fecha: formFecha,
        municipioId: Number(municipioId), 
        institucionId: Number(institucionId), 
        ...(archivoUrl && { archivoUrl }) 
      };
      console.log('Saving registro:', body);
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      setUploading(false);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
      alert('Error al guardar registro');
      setUploading(false);
    }
  };

  const openCreate = () => { setEditingId(null); setFormDesc(''); setFormFile(null); setFormFecha(new Date().toISOString().split('T')[0]); setIsModalOpen(true); };
  const openEdit = (a: Registro) => { setEditingId(a.id); setFormDesc(a.descripcion || ''); setFormFile(null); setFormFecha(new Date(a.fecha).toISOString().split('T')[0]); setIsModalOpen(true); };
  const handleDelete = async (id: number) => { if (!confirm('¿Eliminar registro?')) return; await fetch(`/api/poblacion-indigena/registros/${id}`, { method: 'DELETE' }); fetchData(); };

  const handleFileUploadImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];
      const payload = data.map(item => ({ descripcion: item.descripcion || item.Descripcion || '', fecha: item.fecha || item.Fecha || undefined, municipioId: Number(municipioId), institucionId: Number(institucionId) }));
      await fetch('/api/poblacion-indigena/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: payload }) });
      setIsImportModalOpen(false); fetchData();
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href={`/poblacion-indigena/${municipioId}`} className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Registros: {instNombre}</h1>
        </div>
        <div>
          <button className="btn" style={{ background: '#e2e8f0', marginRight: '1rem' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel</button>
          {registros.length === 0 && <button className="btn btn-primary" onClick={openCreate}>+ Registrar</button>}
        </div>
      </div>

      <div className="table-container">
        {loading ? <p style={{ padding: '1rem' }}>Cargando registros...</p> : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Fecha</th>
                <th>Descripción / Archivo</th>
                <th>Archivo</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((a, idx) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{String(idx + 1).padStart(2, '0')}</td>
                  <td>{new Date(a.fecha).toLocaleDateString()}</td>
                  <td>{a.descripcion || '-'}</td>
                  <td>{a.archivoUrl ? <FileIcon url={a.archivoUrl} /> : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin archivo</span>}</td>
                  <td>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.25rem 0.5rem' }} onClick={() => openEdit(a)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(a.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {registros.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No hay registros para esta institución.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Editar Registro" : "Nuevo Registro"}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Fecha</label>
            <input type="date" className="input-field" value={formFecha} onChange={e => setFormFecha(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción</label>
            <textarea className="input-field" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Ingresa una descripción..." style={{ minHeight: '80px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Seleccionar Archivo (opcional)</label>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp" className="input-field" onChange={e => setFormFile(e.target.files?.[0] || null)} />
            {formFile && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Archivo: {formFile.name}</p>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Registros por Excel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube un Excel con columnas <b>descripcion</b> y <b>fecha</b> (opcional).</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUploadImport} />
        </div>
      </Modal>
    </div>
  );
}
