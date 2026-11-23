import { db } from '@/lib/db';
import Panel from '../Panel';
import Fila, { Aviso, type Campo } from '../Fila';

const C: Campo[] = [
  { k: 'nombre', etq: 'Nombre', ayuda: 'Ej.: Arq. Carolina Cantieri' },
  { k: 'titulo', etq: 'Título', ayuda: 'Ej.: 2008 Arquitecta | UDELAR' },
  { k: 'celular', etq: 'Celular' },
  { k: 'linkedin', etq: 'LinkedIn (dirección completa)' },
  { k: 'orden', etq: 'Orden', tipo: 'num' },
  { k: 'activo', etq: 'Visible', tipo: 'check' },
  { k: 'experiencia', etq: 'Experiencia', tipo: 'area', ayuda: 'Una por línea.' },
  { k: 'diplomas', etq: 'Diplomas extracurriculares', tipo: 'area', ayuda: 'Uno por línea.' },
];

export default async function Equipo(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const lista = await db.integrante.findMany({ orderBy: { orden: 'asc' } });
  return (
    <Panel ruta="/admin/equipo">
      <h1>Equipo</h1>
      <p className="sub">Integrantes del equipo técnico (página Información). Los textos de introducción están en Ajustes.</p>
      <Aviso sp={searchParams} />
      <div className="lista-simple">
        {lista.map((m) => <Fila key={m.id} modelo="integrante" volver="/admin/equipo" campos={C} fila={m} imagen={{ campo: 'foto', max: 1000, etiqueta: 'Cambiar foto' }} titulo={`${m.nombre}${m.activo ? '' : ' (oculto)'}`} />)}
        <Fila modelo="integrante" volver="/admin/equipo" campos={C} imagen={{ campo: 'foto', max: 1000, etiqueta: 'Foto' }} titulo="Nuevo integrante" />
      </div>
    </Panel>
  );
}
