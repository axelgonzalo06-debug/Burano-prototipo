'use server';
import { db } from '@/lib/db';
import { getAjustes } from '@/lib/ajustes';
import { encolarCorreo, esc } from '@/lib/correo';

export type EstadoForm = { ok: boolean; error: string; mensaje?: string };

export async function enviarConsulta(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  if (String(fd.get('web') || '')) return { ok: true, error: '', mensaje: 'Gracias.' }; // trampa para robots
  const nombre = String(fd.get('nombre') || '').trim().slice(0, 120);
  const email = String(fd.get('email') || '').trim().slice(0, 160);
  if (!nombre) return { ok: false, error: 'Escribí tu nombre para que sepamos a quién responder.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Revisá el email: parece incompleto.' };
  const datos = {
    nombre,
    email,
    telefono: String(fd.get('telefono') || '').trim().slice(0, 40),
    asunto: String(fd.get('asunto') || '').trim().slice(0, 200),
    mensaje: String(fd.get('mensaje') || '').trim().slice(0, 5000),
    origen: String(fd.get('origen') || 'formulario').slice(0, 40),
    proyectoId: String(fd.get('proyectoId') || '') || null,
  };
  const c = await db.consulta.create({ data: datos, include: { proyecto: true } });
  const a = await getAjustes();
  const html = `<h2>Nueva consulta desde el sitio</h2>
<p><b>${esc(c.nombre)}</b> · ${esc(c.email)}${c.telefono ? ` · ${esc(c.telefono)}` : ''}</p>
<p><b>Asunto:</b> ${esc(c.asunto || '(sin asunto)')}${c.proyecto ? `<br><b>Proyecto:</b> ${esc(c.proyecto.titulo)}` : ''}<br><b>Origen:</b> ${esc(c.origen)}</p>
<p style="white-space:pre-line">${esc(c.mensaje)}</p>`;
  if (a.avisoConsultas) await encolarCorreo(a.avisoConsultas, `Consulta web: ${c.asunto || c.nombre}`, html).catch(() => {});
  return { ok: true, error: '', mensaje: a.formOk };
}
