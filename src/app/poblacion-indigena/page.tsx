'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Muni = { id: number; nombre: string; totalInstituciones: number; rurales: number; urbanas: number; registros: number };
type ImportResult = { municipios: number; instituciones: number; registros: number; errors: number; };

export default function PoblacionIndigenaPage() {
  const [municipios, setMunicipios] = useState<Muni[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const [isMuniModalOpen, setIsMuniModalOpen] = useState(false);
  const [editingMuni, setEditingMuni] = useState<Muni | null>(null);
  const [muniNombre, setMuniNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchMunicipios = useCallback(() => {
    setLoading(true);
    fetch('/api/poblacion-indigena/municipios')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          console.error('Error cargando municipios de Población Indígena', data);
          setMunicipios([]);
        } else {
          setMunicipios(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setMunicipios([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => { fetchMunicipios(); }, [fetchMunicipios]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true); setImportResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];

        const res = await fetch('/api/poblacion-indigena/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data }) });
        const json = await res.json();
        setImportResult(json);
        setImportLoading(false);
        fetchMunicipios();
      };
      reader.readAsBinaryString(file);
    } catch (err) { alert('Error leyendo el archivo Excel'); setImportLoading(false); }
  };

  const handleSaveMuni = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const url = editingMuni ? `/api/poblacion-indigena/municipios/${editingMuni.id}` : '/api/poblacion-indigena/municipios';
    const method = editingMuni ? 'PUT' : 'POST';
    const body = editingMuni ? { nombre: muniNombre } : { nombre: muniNombre };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false); setIsMuniModalOpen(false); fetchMunicipios();
  };

  const openEditMuni = (e: React.MouseEvent, m: Muni) => { e.preventDefault(); e.stopPropagation(); setEditingMuni(m); setMuniNombre(m.nombre); setIsMuniModalOpen(true); };

  const deleteMuni = async (e: React.MouseEvent, id: number) => { e.preventDefault(); e.stopPropagation(); if (!confirm('¿Eliminar municipio y todas sus instituciones asociadas?')) return; await fetch(`/api/poblacion-indigena/municipios/${id}`, { method: 'DELETE' }); fetchMunicipios(); };

  const openCreateMuni = () => { setEditingMuni(null); setMuniNombre(''); setIsMuniModalOpen(true); };

  const filteredMunicipios = municipios.filter(m => m.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container" style={{ padding: 0 }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" className="btn" style={{ background: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>← Regresar</Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Población Indígena: Seleccionar Municipio</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input className="input-field" placeholder="Buscar municipio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ minWidth: '220px', maxWidth: '320px' }} />
          <button className="btn" style={{ background: '#e2e8f0' }} onClick={() => setIsImportModalOpen(true)}>Importar Excel (Registros)</button>
          <button className="btn" style={{ background: 'var(--success-color)', color: 'white' }} onClick={openCreateMuni}>+ Nuevo Municipio</button>
          <button className="btn btn-primary" onClick={() => router.push('/poblacion-indigena/estadisticas')}>Ver Estadísticas</button>
        </div>
      </div>

      {loading ? <p>Cargando municipios...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredMunicipios.map((m, idx) => (
            <Link key={m.id} href={`/poblacion-indigena/${m.id}`} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.8rem', fontWeight: 600, color: '#000000' }}>{String(idx + 1).padStart(2, '0')}</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', margin: '1.5rem 0 0.75rem' }}>{m.nombre}</h3>
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#dcfce7', borderRadius: '10px', padding: '0.3rem 0.65rem', minWidth: '48px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, color: '#16a34a' }}>{m.registros}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#16a34a', marginTop: '2px' }}>Registros</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f0fdf4', borderRadius: '10px', padding: '0.3rem 0.65rem', minWidth: '48px' }}>
                  <span style={{ fontSize: '1.0rem', fontWeight: 700, lineHeight: 1, color: '#0f766e' }}>{m.totalInstituciones}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#0f766e', marginTop: '2px' }}>Instituciones</span>
                </div>
              </div>
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

      <Modal isOpen={isImportModalOpen} onClose={() => { setIsImportModalOpen(false); setImportResult(null); }} title="Importación Registros Población Indígena">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p>Sube tu Excel maestro para registros de Población Indígena. El sistema creará municipios e instituciones si no existen.</p>
          {importLoading ? (
            <p style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Procesando registros, por favor espera...</p>
          ) : (
            <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUpload} />
          )}
          {importResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px', color: '#166534' }}>
              <p><b>Importación finalizada:</b></p>
              <ul>
                <li>Municipios creados: {importResult.municipios}</li>
                <li>Instituciones creadas: {importResult.instituciones}</li>
                <li><b>Registros generados: {importResult.registros}</b></li>
                {importResult.errors > 0 && <li style={{ color: 'red' }}>Errores: {importResult.errors}</li>}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
