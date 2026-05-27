'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import * as XLSX from 'xlsx';

type Institucion = { id: number; nombre: string; municipioId: number; tipoInstitucion?: string; municipio?: { nombre: string } };
type Municipio = { id: number; nombre: string };

const ZONA_TO_ENUM: Record<string, string> = {
  'RURAL':        'RURAL',
  'URBANA':       'URBANA',
  'RURAL,URBANA': 'RURAL_URBANA',
  'URBANA,RURAL': 'URBANA_RURAL',
};

const TIPO_LABELS: Record<string, string> = {
  RURAL:        'Rural',
  URBANA:       'Urbana',
  RURAL_URBANA: 'Rural / Urbana',
  URBANA_RURAL: 'Urbana / Rural',
};

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMunicipio, setFilterMunicipio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAssignZonesModalOpen, setIsAssignZonesModalOpen] = useState(false);
  const [assignZonesLoading, setAssignZonesLoading] = useState(false);
  const [assignZonesResult, setAssignZonesResult] = useState<{ updated: number; notFound: string[]; errors: string[] } | null>(null);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formMunicipioId, setFormMunicipioId] = useState('');
  const [formTipoInstitucion, setFormTipoInstitucion] = useState('URBANA');
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
        body: JSON.stringify({ nombre: formNombre, municipioId: formMunicipioId, tipoInstitucion: formTipoInstitucion })
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
    setFormTipoInstitucion('URBANA');
    setFormError('');
    setFormMunicipioId(filterMunicipio || (municipios[0]?.id ? String(municipios[0].id) : ''));
    setIsModalOpen(true);
  };

  const openEdit = (i: Institucion) => {
    setEditingId(i.id);
    setFormNombre(i.nombre);
    setFormMunicipioId(String(i.municipioId));
    setFormTipoInstitucion(i.tipoInstitucion || 'URBANA');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar institución?')) return;
    await fetch(`/api/instituciones/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAssignZones = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAssignZonesResult(null);
    setAssignZonesLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const getCol = (row: any, keys: string[]) => {
          for (const k of Object.keys(row)) {
            if (keys.includes(k.trim().toUpperCase())) return row[k];
          }
          return undefined;
        };

        const payload = data.map(row => ({
          municipio: String(getCol(row, ['MUNICIPIO']) || '').trim(),
          nombre: String(getCol(row, ['NOMBRE', 'INSTITUCION', 'INSTITUCIÓN']) || '').trim(),
          zona: String(getCol(row, ['ZONA']) || '').trim().toUpperCase(),
        })).filter(r => r.municipio && r.nombre && r.zona);

        const res = await fetch('/api/instituciones/assign-zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        setAssignZonesResult(result);
        if (result.updated > 0) fetchData();
      } catch {
        setAssignZonesResult({ updated: 0, notFound: [], errors: ['Error al procesar el archivo'] });
      } finally {
        setAssignZonesLoading(false);
      }
    };
    reader.readAsBinaryString(file);
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
        municipioId: Number(item.municipioId || item.MunicipioId),
        tipoInstitucion: (item.tipoInstitucion || item.TipoInstitucion || 'URBANA').toUpperCase()
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
          <button className="btn" style={{ background: '#d1fae5', color: '#065f46' }} onClick={() => { setIsAssignZonesModalOpen(true); setAssignZonesResult(null); }}>Asignar Zonas</button>
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Institución</label>
            <select required className="input-field" value={formTipoInstitucion} onChange={e => setFormTipoInstitucion(e.target.value)}>
              {Object.entries(TIPO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
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
          <p>Sube un archivo Excel (.xlsx, .csv) con las columnas <b>nombre</b>, <b>municipioId</b> y <b>tipoInstitucion</b> (valores: RURAL, URBANA, RURAL_URBANA o URBANA_RURAL).</p>
          <input type="file" accept=".xlsx, .xls, .csv" className="input-field" onChange={handleFileUpload} />
        </div>
      </Modal>

      <Modal isOpen={isAssignZonesModalOpen} onClose={() => setIsAssignZonesModalOpen(false)} title="Asignar Zonas desde REGISTROS.xlsx">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.9rem', color: '#475569' }}>
            Sube el archivo <b>REGISTROS.xlsx</b> con columnas <b>Municipio</b>, <b>Nombre</b> (o <b>Institucion</b>) y <b>Zona</b>.
            Valores válidos de Zona: <code>RURAL</code>, <code>URBANA</code>, <code>RURAL,URBANA</code>, <code>URBANA,RURAL</code>.
          </p>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="input-field"
            disabled={assignZonesLoading}
            onChange={handleAssignZones}
          />
          {assignZonesLoading && <p style={{ color: '#2563eb' }}>Procesando...</p>}
          {assignZonesResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', borderRadius: '0.5rem', color: '#065f46', fontWeight: 600 }}>
                {assignZonesResult.updated} institución{assignZonesResult.updated !== 1 ? 'es' : ''} actualizada{assignZonesResult.updated !== 1 ? 's' : ''}
              </div>
              {assignZonesResult.notFound.length > 0 && (
                <details style={{ fontSize: '0.85rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#b45309', fontWeight: 500 }}>
                    {assignZonesResult.notFound.length} no encontradas
                  </summary>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {assignZonesResult.notFound.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                </details>
              )}
              {assignZonesResult.errors.length > 0 && (
                <details style={{ fontSize: '0.85rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#dc2626', fontWeight: 500 }}>
                    {assignZonesResult.errors.length} errores
                  </summary>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', maxHeight: '120px', overflowY: 'auto' }}>
                    {assignZonesResult.errors.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
