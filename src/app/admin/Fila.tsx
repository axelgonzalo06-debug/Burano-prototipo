import { borrarFila, guardarFila } from './acciones';
import InputImagen from './InputImagen';

export type Campo = { k: string; etq: string; tipo?: 'texto' | 'num' | 'area' | 'check' | 'select'; ayuda?: string; full?: boolean; opciones?: [string, string][] };

// Formulario genérico para las tablas simples (portada, indicadores, servicios, equipo, menú, historia, clientes).
export default function Fila({ modelo, volver, campos, fila, imagen, titulo, abierta }: {
  modelo: string; volver: string; campos: Campo[]; fila?: Record<string, unknown> | null; imagen?: { campo: string; max?: number; etiqueta?: string }; titulo: string; abierta?: boolean;
}) {
  const v = (k: string) => (fila?.[k] ?? '') as string | number;
  return (
    <details className="item" open={abierta}>
      <summary><span>{titulo}</span>{fila ? <span className="sub" style={{ margin: 0, fontWeight: 400 }}>Editar</span> : <span className="b chico pri">Agregar</span>}</summary>
      <div>
        <form action={guardarFila} className="campos">
          <input type="hidden" name="_modelo" value={modelo} />
          <input type="hidden" name="_volver" value={volver} />
          <input type="hidden" name="_id" value={(fila?.id as string) ?? ''} />
          {imagen && (
            <div className="full" style={{ display: 'flex', gap: 14, alignItems: 'end', flexWrap: 'wrap' }}>
              {fila?.[imagen.campo] ? <img src={String(fila[imagen.campo])} alt="" style={{ height: 90, borderRadius: 6 }} /> : null}
              <InputImagen max={imagen.max} etiqueta={imagen.etiqueta} />
            </div>
          )}
          {campos.map((c) => {
            const cls = c.full || c.tipo === 'area' ? 'full' : undefined;
            if (c.tipo === 'check') return <label key={c.k} className="check"><input type="checkbox" name={c.k} defaultChecked={fila ? Boolean(fila[c.k]) : true} /> {c.etq}</label>;
            return (
              <label key={c.k} className={cls}>{c.etq}
                {c.tipo === 'area' ? <textarea name={c.k} defaultValue={String(v(c.k))} rows={5} />
                  : c.tipo === 'select' ? <select name={c.k} defaultValue={String(v(c.k))}>{c.opciones!.map(([val, t]) => <option key={val} value={val}>{t}</option>)}</select>
                  : <input name={c.k} type={c.tipo === 'num' ? 'number' : 'text'} defaultValue={String(v(c.k))} />}
                {c.ayuda && <span className="ayuda">{c.ayuda}</span>}
              </label>
            );
          })}
          <div className="acciones full"><button className="b pri" type="submit">Guardar</button></div>
        </form>
        {fila && (
          <form action={borrarFila} className="acciones" style={{ marginTop: 8 }}>
            <input type="hidden" name="_modelo" value={modelo} />
            <input type="hidden" name="_volver" value={volver} />
            <input type="hidden" name="_id" value={String(fila.id)} />
            <button className="b chico rojo" type="submit">Borrar</button>
          </form>
        )}
      </div>
    </details>
  );
}

export function Aviso({ sp }: { sp: { ok?: string; error?: string } }) {
  if (sp.error) return <p className="aviso error">{sp.error === 'imagen' ? 'Falta la imagen.' : 'Revisá los datos.'}</p>;
  if (sp.ok) return <p className="aviso">{sp.ok === 'borrado' ? 'Borrado.' : 'Guardado. El sitio se actualiza en segundos.'}</p>;
  return null;
}
