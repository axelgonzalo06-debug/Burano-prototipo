import { db } from '@/lib/db';
import Panel from '../Panel';
import Fila, { Aviso, type Campo } from '../Fila';

const SERV: Campo[] = [
  { k: 'titulo', etq: 'Título' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
  { k: 'intro', etq: 'Introducción', full: true },
  { k: 'items', etq: 'Ítems', tipo: 'area', ayuda: 'Uno por línea.' },
  { k: 'destacados', etq: 'Ítems resaltados en rojo', tipo: 'area', ayuda: 'Copiá acá, idénticas, las líneas que se resaltan.' },
];
const CALC: Campo[] = [
  { k: 'nombre', etq: 'Obra' },
  { k: 'lugar', etq: 'Lugar' },
  { k: 'metros', etq: 'Superficie', ayuda: 'Ej.: 12.300 m2' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
];

export default async function Servicios(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const [serv, calc] = await Promise.all([db.servicio.findMany({ orderBy: { orden: 'asc' } }), db.trabajoCalculo.findMany({ orderBy: { orden: 'asc' } })]);
  return (
    <Panel ruta="/admin/servicios">
      <h1>Servicios</h1>
      <p className="sub">Columnas de la página Servicios y la lista de trabajos de cálculo.</p>
      <Aviso sp={searchParams} />
      <div className="lista-simple">
        {serv.map((s) => <Fila key={s.id} modelo="servicio" volver="/admin/servicios" campos={SERV} fila={s} titulo={s.titulo} />)}
        <Fila modelo="servicio" volver="/admin/servicios" campos={SERV} titulo="Nuevo servicio" />
      </div>
      <h2 style={{ marginTop: 30 }}>Trabajos de cálculo de estructuras</h2>
      <div className="lista-simple">
        {calc.map((s) => <Fila key={s.id} modelo="trabajoCalculo" volver="/admin/servicios" campos={CALC} fila={s} titulo={`${s.nombre} / ${s.lugar} · ${s.metros}`} />)}
        <Fila modelo="trabajoCalculo" volver="/admin/servicios" campos={CALC} titulo="Nuevo trabajo" />
      </div>
    </Panel>
  );
}
