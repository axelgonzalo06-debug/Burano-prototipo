'use client';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { enviarConsulta, type EstadoForm } from '@/app/(sitio)/contacto/acciones';

const TEMAS = [
  ['Proyecto de arquitectura', 'Proyecto de arquitectura'],
  ['Reforma', 'Reforma y reciclaje'],
  ['Azotea', 'Impermeabilización de azotea'],
  ['Cálculo de estructuras', 'Cálculo de estructuras'],
  ['Patologías edilicias', 'Estudio de patologías edilicias'],
  ['Mantenimiento', 'Mantenimiento de edificio'],
];

function Enviar() {
  const { pending } = useFormStatus();
  return <button className="btn primario" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar'}</button>;
}

export default function FormContacto({ proyecto, proyectoId, whatsapp }: { proyecto?: string; proyectoId?: string; whatsapp: string }) {
  const [estado, accion] = useFormState<EstadoForm, FormData>(enviarConsulta, { ok: false, error: '' });
  const [asunto, setAsunto] = useState(proyecto ? `Consulta por ${proyecto}` : '');
  const [mensaje, setMensaje] = useState(proyecto ? `Hola, vi la obra «${proyecto}» en el sitio y quisiera consultar por un trabajo similar. Ubicación de la obra: ` : '');
  const [tema, setTema] = useState('');
  const wa = whatsapp.replace(/\D/g, '');
  const linkWa = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(mensaje || 'Hola, quisiera hacer una consulta.')}` : '';

  if (estado.ok) return <p className="ok" role="status">{estado.mensaje}</p>;
  return (
    <>
      {!proyecto && (
        <div className="asist">
          <p className="eyebrow" style={{ color: 'var(--accent)' }}>Consulta guiada</p>
          <p style={{ marginTop: 6, fontSize: 15 }}>Elegí qué necesitás y el mensaje se arma solo.</p>
          <div className="chips" role="group" aria-label="Tipo de consulta">
            {TEMAS.map(([etq, tx]) => (
              <button key={etq} type="button" className="chip" aria-pressed={tema === etq} onClick={() => {
                setTema(etq);
                setAsunto(tx);
                setMensaje(`Hola, quisiera hacer una consulta sobre: ${tx.toLowerCase()}. Ubicación de la obra: `);
              }}>{etq}</button>
            ))}
          </div>
        </div>
      )}
      <form className="form" action={accion}>
        <input type="hidden" name="proyectoId" value={proyectoId ?? ''} />
        <input type="hidden" name="origen" value={proyecto ? 'proyecto' : tema ? 'consulta guiada' : 'formulario'} />
        <label className="trampa" aria-hidden="true">No completar <input name="web" tabIndex={-1} autoComplete="off" /></label>
        <input className="campo" id="f-nombre" name="nombre" placeholder="Nombre *" aria-label="Nombre" required autoComplete="name" />
        <input className="campo" id="f-email" name="email" type="email" placeholder="Email *" aria-label="Email" required autoComplete="email" />
        <input className="campo full" id="f-tel" name="telefono" placeholder="Teléfono" aria-label="Teléfono" autoComplete="tel" inputMode="tel" />
        <input className="campo full" id="f-asunto" name="asunto" placeholder="Asunto" aria-label="Asunto" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
        <textarea className="campo full" id="f-msj" name="mensaje" placeholder="Mensaje" aria-label="Mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
        {estado.error && <p className="err full" role="alert">{estado.error}</p>}
        <div className="full btns">
          <Enviar />
          {linkWa && <a className="btn wa" href={linkWa} target="_blank" rel="noopener">WhatsApp</a>}
        </div>
      </form>
    </>
  );
}
