'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Plan = { id: number; nombre: string; descripcion: string; createdAt: string; archivoUrl?: string };
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

export default function PlanesFinalPage(props: RouteParams) {
  const params = use(props.params);
  const { municipioId, institucionId } = params;
  
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [instNombre, setInstNombre] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    fetch(`/api/instituciones/${institucionId}`).then(res => res.json()).then(data => {
      setInstNombre(data.nombre);
    });
    fetch(`/api/planes?municipioId=${municipioId}&institucionId=${institucionId}`).then(res => res.json()).then(data => {
      setPlanes(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [municipioId, institucionId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFile) { alert('Por favor selecciona un archivo'); return; }
    setUploading(true);
    let archivoUrl: string | undefined;

    const fd = new FormData();
    fd.append('file', formFile);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const json = await res.json();
    archivoUrl = json.url;

    const url = editingId ? `/api/planes/${editingId}` : '/api/planes';
    const method = editingId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: formFile?.name || 'Archivo adjunto', municipioId: Number(municipioId), institucionId: Number(institucionId), ...(archivoUrl && { archivoUrl }) })
    });
    setUploading(false);
    setIsModalOpen(false);
    fetchData();
  };

  const openCreate = () => { setEditingId(null); setFormNombre(''); setFormDesc(''); setFormFile(null); setIsModalOpen(true); };
  const openEdit = (p: Plan) => { setEditingId(p.id); setFormNombre(p.nombre || ''); setFormDesc(p.descripcion || ''); setFormFile(null); setIsModalOpen(true); };
  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar plan pedagógico?')) return;
    await fetch(`/api/planes/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleFileUploadImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        descripcion: item.descripcion || item.Descripción || item.Descripcion || '',
        municipioId: Number(municipioId),
        institucionId: Number(institucionId)
      })).filter(p => p.nombre);
      await fetch('/api/planes/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setIsImportModalOpen(false);
      fetchData();
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link href={`/planes/${municipioId}`} className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>← Regresar</Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Planes: {instNombre}</h1>
        </div>
        <div>
          <button className="btn" style={{ background: '#e2e8f0', marginRight: '1rem' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Registrar Plan</button>
        </div>
      </div>
      
      <div className="table-container">
        {loading ? <p style={{padding: '1rem'}}>Cargando planes...</p> : (
          <table>
            <thead>
              <tr>
                <th>Fecha Ingreso</th>
                <th>Nombre del Plan</th>
                <th>Descripción</th>
                <th>Archivo Adjunto</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion || '-'}</td>
                  <td>{p.archivoUrl ? <FileIcon url={p.archivoUrl} /> : <span style={{color:'#94a3b8', fontSize:'0.85rem'}}>Sin archivo</span>}</td>
                  <td>
                    <button className="btn" style={{ marginRight: '0.5rem', background: '#e2e8f0', padding: '0.25rem 0.5rem' }} onClick={() => openEdit(p)}>Editar</button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(p.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {planes.length === 0 && <tr><td colSpan={5} style={{textAlign:'center'}}>No hay planes registrados para esta institución.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adjuntar Archivo al Plan">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Seleccionar Archivo <span style={{ fontWeight: 400, color: '#94a3b8' }}>(PDF, foto, Word, Excel, PowerPoint…)</span></label>
            <input required type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp" className="input-field" onChange={e => setFormFile(e.target.files?.[0] || null)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Subiendo...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Importar Planes por Excel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube un Excel con las columnas <b>nombre</b> y <b>descripcion</b> (opcional).</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUploadImport} />
        </div>
      </Modal>
    </div>
  );
}
