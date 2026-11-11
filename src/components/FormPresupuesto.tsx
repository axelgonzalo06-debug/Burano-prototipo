'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { enviarConsulta, type EstadoForm } from '@/app/(sitio)/contacto/acciones';
import { TEMAS } from './FormContacto';

function Enviar() {
  const { pending } = useFormStatus();
  return <button className="btn primario" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Pedir presupuesto'}</button>;
}

// Formulario corto de la home: guarda la consulta igual que el de /contacto (el tipo de trabajo va como asunto).
export default function FormPresupuesto() {
  const [estado, accion] = useFormState<EstadoForm, FormData>(enviarConsulta, { ok: false, error: '' });
  if (estado.ok) return <p className="ok" role="status">{estado.mensaje}</p>;
  return (
    <form className="form-pres" action={accion}>
      <input type="hidden" name="origen" value="presupuesto" />
      <label className="trampa" aria-hidden="true">No completar <input name="web" tabIndex={-1} autoComplete="off" /></label>
      <label>Nombre<input name="nombre" required autoComplete="name" /></label>
      <label>Correo<input name="email" type="email" required autoComplete="email" /></label>
      <label className="full">Tipo de trabajo
        <select name="asunto" defaultValue="">
          <option value="">Elegí una opción</option>
          {TEMAS.map(([, tx]) => <option key={tx} value={tx}>{tx}</option>)}
        </select>
      </label>
      <label className="full">Contanos tu obra<textarea name="mensaje" rows={4} /></label>
      {estado.error && <p className="err full" role="alert">{estado.error}</p>}
      <div className="full"><Enviar /></div>
    </form>
  );
}
