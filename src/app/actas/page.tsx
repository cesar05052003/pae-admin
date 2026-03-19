'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Municipio = { id: number; nombre: string };

export default function ActasMunicipiosPage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const [isMuniModalOpen, setIsMuniModalOpen] = useState(false);
  const [editingMuni, setEditingMuni] = useState<Municipio | null>(null);
  const [muniNombre, setMuniNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const fetchMunicipios = () => {
    setLoading(true);
    fetch('/api/municipios').then(res => res.json()).then(data => {
      setMunicipios(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMunicipios();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];

        const res = await fetch('/api/importar-global', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'actas', data })
        });
        
        const json = await res.json();
        setImportResult(json);
        setImportLoading(false);
        fetchMunicipios();
      };
      reader.readAsBinaryString(file);
    } catch(err) {
      alert('Error leyendo el archivo Excel');
      setImportLoading(false);
    }
  };

  const handleSaveMuni = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editingMuni ? `/api/municipios/${editingMuni.id}` : '/api/municipios';
    const method = editingMuni ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: muniNombre })
    });
    setSaving(false);
    setIsMuniModalOpen(false);
    fetchMunicipios();
  };

  const openEditMuni = (e: React.MouseEvent, m: Municipio) => {
    e.preventDefault(); e.stopPropagation();
    setEditingMuni(m);
    setMuniNombre(m.nombre);
    setIsMuniModalOpen(true);
  };

  const deleteMuni = async (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('¿Eliminar municipio y todas sus instituciones asociadas?')) return;
    await fetch(`/api/municipios/${id}`, { method: 'DELETE' });
    fetchMunicipios();
  };

  const openCreateMuni = () => {
    setEditingMuni(null);
    setMuniNombre('');
    setIsMuniModalOpen(true);
  };

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>← Regresar</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Actas: Seleccionar Municipio</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel Global (Actas)</button>
          <button className="btn" style={{ background: 'var(--success-color)', color: 'white' }} onClick={openCreateMuni}>+ Nuevo Municipio</button>
          <button className="btn btn-primary" onClick={() => router.push('/estadisticas/actas')}>Ver Estadísticas</button>
        </div>
      </div>
      
      {loading ? <p>Cargando municipios...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {municipios.map((m, idx) => (
            <Link key={m.id} href={`/actas/${m.id}`} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', margin: '1.5rem 0' }}>{m.nombre}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button className="btn" style={{ background: '#f1f5f9', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={(e) => openEditMuni(e, m)}>Editar</button>
                <button className="btn" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }} onClick={(e) => deleteMuni(e, m.id)}>Eliminar</button>
              </div>
            </Link>
          ))}
          {municipios.length === 0 && <p>No hay municipios registrados.</p>}
        </div>
      )}

      <Modal isOpen={isMuniModalOpen} onClose={() => setIsMuniModalOpen(false)} title={editingMuni ? 'Editar Municipio' : 'Nuevo Municipio'}>
        <form onSubmit={handleSaveMuni} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontWeight: 500 }}>Nombre del Municipio</label>
          <input required className="input-field" value={muniNombre} onChange={e => setMuniNombre(e.target.value)} autoFocus />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsMuniModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportResult(null); }} title="Importación Global de Actas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube tu Excel maestro exclusivo de <b>Actas de Conformación</b>. El sistema creará todo automáticamente <b>sin afectar los Planes Pedagógicos</b>.</p>
          
          {importLoading ? (
             <p style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Procesando registros, por favor espera...</p>
          ) : (
            <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUpload} />
          )}

          {importResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px', color: '#166534' }}>
              <p><b>Importación finalizada con éxito:</b></p>
              <ul>
                <li>Municipios listos: {importResult.municipios}</li>
                <li>Instituciones listas: {importResult.instituciones}</li>
                <li><b>Actas generadas: {importResult.registros}</b></li>
                {importResult.errors > 0 && <li style={{ color: 'red' }}>Errores o filas omitidas (sin municipio/institución): {importResult.errors}</li>}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
