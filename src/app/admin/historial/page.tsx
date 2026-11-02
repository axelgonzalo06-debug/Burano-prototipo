import { APP_VERSION, HISTORIAL } from '@/lib/version';
import Panel from '../Panel';

export default function Historial() {
  return (
    <Panel ruta="/admin/historial">
      <h1>Historial de versiones</h1>
      <p className="sub">Versión publicada: {APP_VERSION}. Cada cambio en el sitio suma una entrada acá.</p>
      {HISTORIAL.map((h) => (
        <div className="tarjeta" key={h.version}>
          <h2>{h.version} · {new Date(h.fecha + 'T12:00').toLocaleDateString('es-UY', { dateStyle: 'long' })}</h2>
          <ul className="hist" style={{ margin: 0, paddingLeft: 18 }}>{h.cambios.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      ))}
    </Panel>
  );
}
