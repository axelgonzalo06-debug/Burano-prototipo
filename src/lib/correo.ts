import { Resend } from 'resend';
import { db } from './db';
import { getAjustes } from './ajustes';

// Todo correo pasa por la cola. Si Resend falla (por ejemplo, cupo diario agotado) queda pendiente
// y se reintenta desde /admin/consultas o al próximo envío.
export async function encolarCorreo(para: string, asunto: string, html: string) {
  const c = await db.correo.create({ data: { para, asunto, html } });
  await enviarPendientes(c.id);
}

export async function enviarPendientes(soloId?: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { enviados: 0, pendientes: await db.correo.count({ where: { estado: 'pendiente' } }) };
  const resend = new Resend(key);
  const { remitente } = await getAjustes();
  const cola = await db.correo.findMany({ where: { estado: 'pendiente', ...(soloId ? { id: soloId } : {}) }, orderBy: { creado: 'asc' }, take: 20 });
  let enviados = 0;
  for (const c of cola) {
    const r = await resend.emails.send({ from: remitente, to: c.para.split(',').map((s) => s.trim()), subject: c.asunto, html: c.html });
    if (r.error) {
      await db.correo.update({ where: { id: c.id }, data: { intentos: { increment: 1 }, error: r.error.message } });
      break; // si el cupo se agotó, no tiene sentido seguir intentando ahora
    }
    await db.correo.update({ where: { id: c.id }, data: { estado: 'enviado', enviado: new Date(), intentos: { increment: 1 }, error: '' } });
    enviados++;
  }
  return { enviados, pendientes: await db.correo.count({ where: { estado: 'pendiente' } }) };
}

export function esc(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}
