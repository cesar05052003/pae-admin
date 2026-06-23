'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Registro = { id: number; fecha: string; descripcion: string; archivoUrl?: string };
type Seguimiento = { id: number; fecha: string; descripcion: string; archivoUrl?: string };
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

function RecordForm({ onSubmit, uploading, desc, setDesc, fecha, setFecha, file, setFile, onCancel, title }: {
  onSubmit: (e: React.FormEvent) => void; uploading: boolean;
  desc: string; setDesc: (v: string) => void;
  fecha: string; setFecha: (v: string) => void;
  file: File | null; setFile: (v: File | null) => void;
  onCancel: () => void; title: string;
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Fecha</label>
        <input type="date" className="input-field" value={fecha} onChange={e => setFecha(e.target.value)} required />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Descripción</label>
        <textarea className="input-field" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ingresa una descripción..." style={{ minHeight: '80px' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Seleccionar Archivo (opcional)</label>
        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp" className="input-field" onChange={e => setFile(e.target.files?.[0] || null)} />
        {file && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Archivo: {file.name}</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
}

export default function PIRegistrosPage(props: RouteParams) {
  const params = use(props.params) as any;
  const { municipioId, institucionId } = params;

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [instNombre, setInstNombre] = useState('');
  const [loading, setLoading] = useState(true);

  // Registro CAE modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formDesc, setFormDesc] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);

  // Seguimiento modal
  const [isSegModalOpen, setIsSegModalOpen] = useState(false);
  const [editingSegId, setEditingSegId] = useState<number | null>(null);
  const [segDesc, setSegDesc] = useState('');
  const [segFile, setSegFile] = useState<File | null>(null);
  const [segFecha, setSegFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [segUploading, setSegUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetch(`/api/poblacion-indigena/instituciones/${institucionId}`).then(r => r.json()).then(d => setInstNombre(d.nombre)),
      fetch(`/api/poblacion-indigena/registros?municipioId=${municipioId}&institucionId=${institucionId}`).then(r => r.json()).then(setRegistros),
      fetch(`/api/poblacion-indigena/seguimientos?institucionId=${institucionId}`).then(r => r.json()).then(setSeguimientos),
    ]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [municipioId, institucionId]);

  const uploadFile = async (file: File): Promise<string | undefined> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    return (await res.json()).url;
  };

  // ── Registro CAE handlers ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc && !formFile) { alert('Por favor ingresa descripción o selecciona un archivo'); return; }
    setUploading(true);
    try {
      const archivoUrl = formFile ? await uploadFile(formFile) : undefined;
      const url = editingId ? `/api/poblacion-indigena/registros/${editingId}` : '/api/poblacion-indigena/registros';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descripcion: formDesc, fecha: formFecha, municipioId: Number(municipioId), institucionId: Number(institucionId), ...(archivoUrl && { archivoUrl }) }) });
      if (!res.ok) throw new Error('Save failed');
      setIsModalOpen(false); fetchData();
    } catch { alert('Error al guardar registro'); }
    setUploading(false);
  };

  const openCreate = () => { setEditingId(null); setFormDesc(''); setFormFile(null); setFormFecha(new Date().toISOString().split('T')[0]); setIsModalOpen(true); };
  const openEdit = (a: Registro) => { setEditingId(a.id); setFormDesc(a.descripcion || ''); setFormFile(null); setFormFecha(new Date(a.fecha).toISOString().split('T')[0]); setIsModalOpen(true); };
  const handleDelete = async (id: number) => { if (!confirm('¿Eliminar registro?')) return; await fetch(`/api/poblacion-indigena/registros/${id}`, { method: 'DELETE' }); fetchData(); };

  // ── Seguimiento handlers ──
  const handleSaveSeg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!segDesc && !segFile) { alert('Por favor ingresa descripción o selecciona un archivo'); return; }
    setSegUploading(true);
    try {
      const archivoUrl = segFile ? await uploadFile(segFile) : undefined;
      const url = editingSegId ? `/api/poblacion-indigena/seguimientos/${editingSegId}` : '/api/poblacion-indigena/seguimientos';
      const method = editingSegId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descripcion: segDesc, fecha: segFecha, municipioId: Number(municipioId), institucionId: Number(institucionId), ...(archivoUrl && { archivoUrl }) }) });
      if (!res.ok) throw new Error('Save failed');
      setIsSegModalOpen(false); fetchData();
    } catch { alert('Error al guardar seguimiento'); }
    setSegUploading(false);
  };

  const openCreateSeg = () => { setEditingSegId(null); setSegDesc(''); setSegFile(null); setSegFecha(new Date().toISOString().split('T')[0]); setIsSegModalOpen(true); };
  const openEditSeg = (s: Seguimiento) => { setEditingSegId(s.id); setSegDesc(s.descripcion || ''); setSegFile(null); setSegFecha(new Date(s.fecha).toISOString().split('T')[0]); setIsSegModalOpen(true); };
  const handleDeleteSeg = async (id: number) => { if (!confirm('¿Eliminar seguimiento?')) return; await fetch(`/api/poblacion-indigena/seguimientos/${id}`, { method: 'DELETE' }); fetchData(); };

  const handleFileUploadImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) as any[];
      const payload = data.map(item => ({ descripcion: item.descripcion || item.Descripcion || '', fecha: item.fecha || item.Fecha || undefined, municipioId: Number(municipioId), institucionId: Number(institucionId) }));
      await fetch('/api/poblacion-indigena/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: payload }) });
      setIsImportModalOpen(false); fetchData();
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href={`/poblacion-indigena/${municipioId}`} className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{instNombre}</h1>
        </div>
      </div>

      {/* ── Sección Registro CAE ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Registro CAE
          <span style={{ marginLeft: '0.6rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '99px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>cuenta en estadísticas</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel</button>
          {registros.length === 0 && <button className="btn btn-primary" onClick={openCreate}>+ Registrar</button>}
        </div>
      </div>

      <div className="table-container" style={{ marginBottom: '2.5rem' }}>
        {loading ? <p style={{ padding: '1rem' }}>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Fecha</th>
                <th>Descripción</th>
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
              {registros.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Sin registro CAE</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Sección Seguimientos ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Seguimientos
          <span style={{ marginLeft: '0.6rem', fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '99px', background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>no cuenta en estadísticas</span>
        </h2>
        <button className="btn" style={{ background: '#8b5cf6', color: '#fff' }} onClick={openCreateSeg}>+ Seguimiento</button>
      </div>

      <div className="table-container">
        {loading ? <p style={{ padding: '1rem' }}>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Archivo</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {seguimientos.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#8b5cf6' }}>{String(idx + 1).padStart(2, '0')}</td>
                  <td>{new Date(s.fecha).toLocaleDateString()}</td>
                  <td>{s.descripcion || '-'}</td>
                  <td>{s.archivoUrl ? <FileIcon url={s.archivoUrl} /> : <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin archivo</span>}</td>
                  <td>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.25rem 0.5rem' }} onClick={() => openEditSeg(s)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDeleteSeg(s.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {seguimientos.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Sin seguimientos</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Registro CAE */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Registro CAE' : 'Nuevo Registro CAE'}>
        <RecordForm onSubmit={handleSave} uploading={uploading} desc={formDesc} setDesc={setFormDesc} fecha={formFecha} setFecha={setFormFecha} file={formFile} setFile={setFormFile} onCancel={() => setIsModalOpen(false)} title="Registro CAE" />
      </Modal>

      {/* Modal Seguimiento */}
      <Modal isOpen={isSegModalOpen} onClose={() => setIsSegModalOpen(false)} title={editingSegId ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}>
        <RecordForm onSubmit={handleSaveSeg} uploading={segUploading} desc={segDesc} setDesc={setSegDesc} fecha={segFecha} setFecha={setSegFecha} file={segFile} setFile={setSegFile} onCancel={() => setIsSegModalOpen(false)} title="Seguimiento" />
      </Modal>

      {/* Modal Importar */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Registros por Excel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube un Excel con columnas <b>descripcion</b> y <b>fecha</b> (opcional).</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUploadImport} />
        </div>
      </Modal>
    </div>
  );
}
