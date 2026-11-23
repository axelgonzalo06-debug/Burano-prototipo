import { db } from '@/lib/db';
import { exigirAdmin } from '@/lib/auth';
import Panel from '../Panel';
import { guardarUsuario } from '../acciones';

const ERR: Record<string, string> = { clave: 'La contraseña tiene que tener al menos 10 caracteres.', datos: 'Falta el nombre o el email.' };

function Form({ u }: { u?: { id: string; nombre: string; email: string; rol: string; activo: boolean } }) {
  return (
    <form action={guardarUsuario} className="campos">
      <input type="hidden" name="id" value={u?.id ?? ''} />
      <label>Nombre<input name="nombre" defaultValue={u?.nombre} required /></label>
      <label>Email<input name="email" type="email" defaultValue={u?.email} required /></label>
      <label>Rol<select name="rol" defaultValue={u?.rol ?? 'EDITOR'}><option value="EDITOR">Editor (contenido)</option><option value="ADMIN">Administrador (todo)</option></select></label>
      <label>{u ? 'Nueva contraseña' : 'Contraseña'}<input name="clave" type="password" autoComplete="new-password" placeholder={u ? 'dejar vacío para no cambiarla' : 'mínimo 10 caracteres'} /></label>
      <label className="check"><input type="checkbox" name="activo" defaultChecked={u?.activo ?? true} /> Activo</label>
      <div className="acciones full" style={{ marginTop: 0 }}><button className="b pri" type="submit">{u ? 'Guardar' : 'Crear usuario'}</button></div>
    </form>
  );
}

export default async function Usuarios(props: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const searchParams = await props.searchParams;
  await exigirAdmin();
  const lista = await db.usuario.findMany({ orderBy: { creado: 'asc' } });
  return (
    <Panel ruta="/admin/usuarios">
      <h1>Usuarios</h1>
      <p className="sub">El editor maneja contenido y consultas. Ajustes y usuarios quedan solo para administradores.</p>
      {searchParams.ok && <p className="aviso">Guardado.</p>}
      {searchParams.error && <p className="aviso error">{ERR[searchParams.error] ?? 'Revisá los datos.'}</p>}
      <div className="lista-simple">
        {lista.map((u) => (
          <details className="item" key={u.id}>
            <summary><span>{u.nombre} · {u.email}</span><span className={`pill ${u.activo ? 'p-pub' : 'p-borr'}`}>{u.rol === 'ADMIN' ? 'Administrador' : 'Editor'}{u.activo ? '' : ' · inactivo'}</span></summary>
            <div><Form u={u} /></div>
          </details>
        ))}
        <details className="item"><summary><span>Nuevo usuario</span><span className="b chico pri">Agregar</span></summary><div><Form /></div></details>
      </div>
    </Panel>
  );
}
