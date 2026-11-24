import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { sesion } from '@/lib/auth';
import { ESTADOS, TIPOS, rutaProyecto } from '@/lib/proyectos';
import Panel from '../../Panel';
import { borrarArchivo, borrarProyecto, guardarProyecto } from '../../acciones';
import GestorFotos from './GestorFotos';
import SubirArchivo from './SubirArchivo';

const fechaLocal = (d: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');

export default async function Editar(props: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const nuevo = params.id === 'nuevo';
  const p = nuevo ? null : await db.proyecto.findUnique({ where: { id: params.id }, include: { fotos: { orderBy: { orden: 'asc' } }, archivos: { orderBy: { orden: 'asc' } } } });
  if (!nuevo && !p) notFound();
  const s = await sesion();
  return (
    <Panel ruta="/admin/proyectos">
      <div className="cab-pag">
        <div>
          <p className="sub" style={{ margin: 0 }}><Link href="/admin/proyectos">← Proyectos y obras</Link></p>
          <h1>{p ? p.titulo : 'Nuevo proyecto u obra'}</h1>
        </div>
        {p && <a className="b" href={`/api/vista-previa?ruta=${encodeURIComponent(rutaProyecto(p))}`} target="_blank">Vista previa ↗</a>}
      </div>
      {searchParams.ok && <p className="aviso">Guardado.</p>}
      {searchParams.error === 'titulo' && <p className="aviso error">Falta el título.</p>}

      <form action={guardarProyecto} className="tarjeta">
        <input type="hidden" name="id" value={p?.id ?? ''} />
        <div className="campos">
          <label className="full">Título<input name="titulo" defaultValue={p?.titulo} required /></label>
          <label>Tipo<select name="tipo" defaultValue={p?.tipo ?? 'OBRA'}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <span className="ayuda">«Obras» aparece en Galería de trabajos; el resto en Proyectos.</span></label>
          <label>Estado<select name="estado" defaultValue={p?.estado ?? 'TERMINADO'}>{Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Subtítulo<input name="subtitulo" defaultValue={p?.subtitulo} /><span className="ayuda">Opcional, para distinguir fichas con el mismo nombre.</span></label>
          <label>Dirección web<input name="slug" defaultValue={p?.slug} placeholder="se arma sola con el título" /></label>
          <label>Ubicación<input name="ubicacion" defaultValue={p?.ubicacion} /></label>
          <label>Zona<input name="zona" defaultValue={p?.zona} /><span className="ayuda">Para el filtro por zona (ej.: Montevideo, Maldonado).</span></label>
          <label>Programa<input name="programa" defaultValue={p?.programa} /></label>
          <label>Superficies<textarea name="superficies" defaultValue={p?.superficies} rows={3} /><span className="ayuda">Una por línea, «Etiqueta: valor».</span></label>
          <label className="full">Situación previa<textarea name="situacionPrevia" defaultValue={p?.situacionPrevia} /></label>
          <label className="full">Trabajos realizados<textarea name="trabajos" defaultValue={p?.trabajos} /></label>
          <label className="full">Descripción<textarea name="descripcion" defaultValue={p?.descripcion} rows={5} /></label>
          <label>Avance de obra (%)<input name="avance" type="number" min={0} max={100} defaultValue={p?.avance ?? ''} /><span className="ayuda">Vacío si la obra está terminada.</span></label>
          <label>Fecha de entrega<input name="entrega" defaultValue={p?.entrega} placeholder="ej.: diciembre 2027" /></label>
          <label>Latitud<input name="lat" inputMode="decimal" defaultValue={p?.lat ?? ''} /></label>
          <label>Longitud<input name="lng" inputMode="decimal" defaultValue={p?.lng ?? ''} /></label>
          <label>Orden<input name="orden" type="number" defaultValue={p?.orden ?? 0} /></label>
          <label>Publicar desde<input name="publicarDesde" type="datetime-local" defaultValue={fechaLocal(p?.publicarDesde ?? null)} /><span className="ayuda">Vacío = apenas se marque «Publicado».</span></label>
          <label className="check"><input type="checkbox" name="publicado" defaultChecked={p?.publicado ?? false} /> Publicado</label>
          <label className="check"><input type="checkbox" name="destacado" defaultChecked={p?.destacado ?? false} /> Mostrar en la portada</label>
        </div>
        <div className="acciones"><button className="b pri" type="submit">Guardar</button>{!p && <span className="sub" style={{ margin: 0 }}>Después de guardar se habilitan las fotos.</span>}</div>
      </form>

      {p && (
        <>
          <div className="tarjeta">
            <h2>Fotos</h2>
            <p className="sub">Arrastrá para ordenar. La portada es independiente de la galería. Marcá «Previa» para el comparador antes/después y «Avance» para el registro de obra fechado.</p>
            <GestorFotos proyectoId={p.id} portada={p.portada} fotos={p.fotos.map((f) => ({ id: f.id, url: f.url, pie: f.pie, previa: f.previa, avance: f.avance, fecha: f.fecha ? f.fecha.toISOString().slice(0, 10) : '' }))} />
          </div>
          <div className="tarjeta">
            <h2>Descargables</h2>
            <p className="sub">Planos, brochure o memoria en PDF.</p>
            {p.archivos.map((a) => (
              <form key={a.id} action={borrarArchivo} className="acciones" style={{ marginTop: 6 }}>
                <input type="hidden" name="id" value={a.id} />
                <a href={a.url} target="_blank">{a.nombre}</a><span className="sub" style={{ margin: 0 }}>{a.tipo}</span>
                <button className="b chico rojo" type="submit">Quitar</button>
              </form>
            ))}
            <SubirArchivo proyectoId={p.id} />
          </div>
          {s?.rol === 'ADMIN' && (
            <form action={borrarProyecto} className="tarjeta">
              <input type="hidden" name="id" value={p.id} />
              <h2>Borrar ficha</h2>
              <p className="sub">Borra la ficha con todas sus fotos. No se puede deshacer.</p>
              <label className="check"><input type="checkbox" required /> Entiendo que se borran {p.fotos.length} fotos</label>
              <div className="acciones"><button className="b rojo" type="submit">Borrar definitivamente</button></div>
            </form>
          )}
        </>
      )}
    </Panel>
  );
}
