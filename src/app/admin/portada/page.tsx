import { db } from '@/lib/db';
import Panel from '../Panel';
import Fila, { Aviso, type Campo } from '../Fila';

const SLIDE: Campo[] = [
  { k: 'titulo', etq: 'Texto alternativo', ayuda: 'Qué se ve en la foto (para buscadores y lectores de pantalla).' },
  { k: 'pie', etq: 'Pie visible', ayuda: 'Ej.: nombre de la obra.' },
  { k: 'enlace', etq: 'Enlace (opcional)' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
  { k: 'activa', etq: 'Visible', tipo: 'check' },
];
const IND: Campo[] = [
  { k: 'valor', etq: 'Número', tipo: 'num' },
  { k: 'prefijo', etq: 'Antes del número', ayuda: 'Ej.: +' },
  { k: 'sufijo', etq: 'Después del número', ayuda: 'Ej.: m², años' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
  { k: 'texto', etq: 'Texto', full: true },
];

export default async function Portada(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const [slides, ind] = await Promise.all([db.diapositiva.findMany({ orderBy: { orden: 'asc' } }), db.indicador.findMany({ orderBy: { orden: 'asc' } })]);
  return (
    <Panel ruta="/admin/portada">
      <h1>Portada e indicadores</h1>
      <p className="sub">Las fotos del carrusel y las cifras animadas de la página de inicio. Los textos de la portada están en Ajustes.</p>
      <Aviso sp={searchParams} />
      <h2>Carrusel</h2>
      <div className="lista-simple">
        {slides.map((s) => <Fila key={s.id} modelo="diapositiva" volver="/admin/portada" campos={SLIDE} fila={s} imagen={{ campo: 'imagen', etiqueta: 'Cambiar foto' }} titulo={`${s.orden}. ${s.pie || s.titulo}${s.activa ? '' : ' (oculta)'}`} />)}
        <Fila modelo="diapositiva" volver="/admin/portada" campos={SLIDE} imagen={{ campo: 'imagen', etiqueta: 'Foto' }} titulo="Nueva foto del carrusel" />
      </div>
      <h2 style={{ marginTop: 30 }}>Indicadores</h2>
      <div className="lista-simple">
        {ind.map((s) => <Fila key={s.id} modelo="indicador" volver="/admin/portada" campos={IND} fila={s} titulo={`${s.prefijo}${s.valor.toLocaleString('es-UY')} ${s.sufijo} · ${s.texto}`} />)}
        <Fila modelo="indicador" volver="/admin/portada" campos={IND} titulo="Nuevo indicador" />
      </div>
    </Panel>
  );
}
