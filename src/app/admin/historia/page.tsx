import { db } from '@/lib/db';
import Panel from '../Panel';
import Fila, { Aviso, type Campo } from '../Fila';

const HITO: Campo[] = [
  { k: 'anio', etq: 'Año', tipo: 'num' },
  { k: 'orden', etq: 'Orden dentro del año', tipo: 'num' },
  { k: 'titulo', etq: 'Título', full: true },
  { k: 'texto', etq: 'Texto', tipo: 'area' },
];
const CLI: Campo[] = [
  { k: 'nombre', etq: 'Nombre' },
  { k: 'url', etq: 'Sitio web (opcional)' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
];

export default async function Historia({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const [hitos, clientes] = await Promise.all([db.hito.findMany({ orderBy: [{ anio: 'asc' }, { orden: 'asc' }] }), db.cliente.findMany({ orderBy: { orden: 'asc' } })]);
  return (
    <Panel ruta="/admin/historia">
      <h1>Historia y clientes</h1>
      <p className="sub">Línea de tiempo y clientes de la página Información. Si una lista está vacía, esa sección no se muestra.</p>
      <Aviso sp={searchParams} />
      <h2>Línea de tiempo</h2>
      <div className="lista-simple">
        {hitos.map((h) => <Fila key={h.id} modelo="hito" volver="/admin/historia" campos={HITO} fila={h} titulo={`${h.anio} · ${h.titulo}`} />)}
        <Fila modelo="hito" volver="/admin/historia" campos={HITO} titulo="Nuevo hito" />
      </div>
      <h2 style={{ marginTop: 30 }}>Clientes</h2>
      <div className="lista-simple">
        {clientes.map((c) => <Fila key={c.id} modelo="cliente" volver="/admin/historia" campos={CLI} fila={c} imagen={{ campo: 'logo', max: 600, etiqueta: 'Logo' }} titulo={c.nombre} />)}
        <Fila modelo="cliente" volver="/admin/historia" campos={CLI} imagen={{ campo: 'logo', max: 600, etiqueta: 'Logo' }} titulo="Nuevo cliente" />
      </div>
    </Panel>
  );
}
