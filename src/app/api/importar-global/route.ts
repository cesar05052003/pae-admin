import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { mode, data } = await request.json();
    if (!Array.isArray(data) || !mode) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    let countMunicipios = 0;
    let countInstituciones = 0;
    let countRegistros = 0;
    let errors = 0;

    for (const row of data) {
      const getVal = (keys: string[]) => {
        for (const k of Object.keys(row)) {
          const normalizedKey = k.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (keys.includes(normalizedKey)) {
            return row[k];
          }
        }
        return undefined;
      };

      const municipioName = getVal(['municipio', 'ciudad', 'pueblo']);
      const institucionName = getVal(['institucion', 'colegio', 'escuela', 'sede']);
      const descripcion = getVal(['descripcion', 'detalle', 'observacion', 'observaciones']);
      
      if (!municipioName || !institucionName) {
        errors++;
        continue;
      }

      try {
        const muniNameStr = String(municipioName).trim();
        let municipio = await prisma.municipio.findUnique({ where: { nombre: muniNameStr } });
        if (!municipio) {
          municipio = await prisma.municipio.create({ 
            data: { 
              nombre: muniNameStr,
              tipoUso: mode === 'actas' ? 'ACTAS' : mode === 'planes' ? 'PLANES' : 'AMBOS'
            } 
          });
          countMunicipios++;
        }

        const instNameStr = String(institucionName).trim();
        let institucion = await prisma.institucion.findUnique({
          where: { nombre_municipioId: { nombre: instNameStr, municipioId: municipio.id } }
        });
        
        if (!institucion) {
          institucion = await prisma.institucion.create({
            data: { nombre: instNameStr, municipioId: municipio.id }
          });
          countInstituciones++;
        }

        if (mode === 'actas') {
          let fecha = getVal(['fecha', 'date', 'creacion']);
          let convertedDate = undefined;
          if (fecha) {
            if (typeof fecha === 'number') {
              convertedDate = new Date(Math.round((fecha - 25569) * 86400 * 1000));
            } else {
              convertedDate = new Date(fecha as string);
            }
          }

          const descStr = descripcion ? String(descripcion).trim() : null;
          
          // Only create if there's content or a date
          if (descStr || convertedDate) {
            // Duplicate check
            const existing = await prisma.acta.findFirst({
              where: {
                institucionId: institucion.id,
                descripcion: descStr,
                ...(convertedDate && !isNaN(convertedDate.getTime()) ? { fecha: convertedDate } : {})
              }
            });

            if (!existing) {
              await prisma.acta.create({
                data: {
                  municipioId: municipio.id,
                  institucionId: institucion.id,
                  descripcion: descStr,
                  ...(convertedDate && !isNaN(convertedDate.getTime()) ? { fecha: convertedDate } : {})
                }
              });
              countRegistros++;
            }
          }
        } else if (mode === 'planes') {
          const nombrePlan = getVal(['nombre', 'nombreplan', 'titulo']);
          const nameStr = nombrePlan ? String(nombrePlan).trim() : null;
          const descStr = descripcion ? String(descripcion).trim() : null;

          // Only create if there's content
          if (nameStr || descStr) {
            // Duplicate check
            const existing = await prisma.planPedagogico.findFirst({
              where: {
                institucionId: institucion.id,
                nombre: nameStr || 'Plan Pedagógico',
                descripcion: descStr
              }
            });

            if (!existing) {
              await prisma.planPedagogico.create({
                data: {
                  municipioId: municipio.id,
                  institucionId: institucion.id,
                  nombre: nameStr || 'Plan Pedagógico',
                  descripcion: descStr
                }
              });
              countRegistros++;
            }
          }
        }

      } catch (e) {
        console.error("Row import error:", e);
        errors++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      municipios: countMunicipios,
      instituciones: countInstituciones,
      registros: countRegistros,
      errors 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Error processing global import' }, { status: 500 });
  }
}
