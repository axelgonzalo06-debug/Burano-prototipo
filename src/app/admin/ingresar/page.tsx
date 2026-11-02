'use client';
import { useFormState } from 'react-dom';
import { ingresar } from '../acciones';

export default function Ingresar() {
  const [error, accion] = useFormState(ingresar, '');
  return (
    <div className="ingreso">
      <form action={accion}>
        <img src="/isotipo.png" alt="" width={56} />
        <h1>Administrador de Burano</h1>
        <label>Email<input id="email" name="email" type="email" required autoComplete="username" /></label>
        <label>Contraseña<input id="clave" name="clave" type="password" required autoComplete="current-password" /></label>
        {error && <p className="aviso error" role="alert">{error}</p>}
        <button className="b pri" type="submit">Ingresar</button>
      </form>
    </div>
  );
}
