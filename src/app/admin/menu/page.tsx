import { db } from '@/lib/db';
import { MENU_BASE } from '@/components/Cabecera';
import Panel from '../Panel';
import Fila, { Aviso, type Campo } from '../Fila';
import { cargarMenuBase } from './acciones';

export default async function Menu(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  const items = await db.itemMenu.findMany({ orderBy: { orden: 'asc' } });
  const raices = items.filter((i) => !i.padre);
  const C: Campo[] = [
    { k: 'texto', etq: 'Texto' },
    { k: 'href', etq: 'Dirección', ayuda: 'Ej.: /servicios o /proyectos?tipo=vivienda' },
    { k: 'orden', etq: 'Orden', tipo: 'num' },
    { k: 'padre', etq: 'Dentro de', tipo: 'select', opciones: [['', '— Menú principal —'], ...raices.map((r) => [r.id, r.texto] as [string, string])] },
    { k: 'activo', etq: 'Visible', tipo: 'check' },
  ];
  return (
    <Panel ruta="/admin/menu">
      <h1>Menú</h1>
      <p className="sub">Mientras esta lista esté vacía, el sitio usa el menú original de Wix.</p>
      <Aviso sp={searchParams} />
      {!items.length && (
        <form action={cargarMenuBase} className="tarjeta">
          <p style={{ margin: 0 }}>Menú actual: {MENU_BASE.map((m) => m.texto).join(' · ')}</p>
          <div className="acciones"><button className="b pri" type="submit">Cargarlo para editarlo</button></div>
        </form>
      )}
      <div className="lista-simple">
        {raices.flatMap((r) => [r, ...items.filter((h) => h.padre === r.id)]).map((i) => (
          <Fila key={i.id} modelo="itemMenu" volver="/admin/menu" campos={C} fila={i} titulo={`${i.padre ? '— ' : ''}${i.texto}  ${i.href}${i.activo ? '' : ' (oculto)'}`} />
        ))}
        <Fila modelo="itemMenu" volver="/admin/menu" campos={C} titulo="Nuevo ítem" />
      </div>
    </Panel>
  );
}
