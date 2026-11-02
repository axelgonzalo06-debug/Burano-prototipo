'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { exigirUsuario } from '@/lib/auth';
import { MENU_BASE } from '@/components/Cabecera';

export async function cargarMenuBase() {
  await exigirUsuario();
  if (!(await db.itemMenu.count())) {
    for (const [k, m] of MENU_BASE.entries()) {
      const r = await db.itemMenu.create({ data: { texto: m.texto, href: m.href, orden: k } });
      for (const [j, h] of (m.hijos ?? []).entries()) await db.itemMenu.create({ data: { texto: h.texto, href: h.href, orden: j, padre: r.id } });
    }
  }
  revalidatePath('/', 'layout');
  redirect('/admin/menu?ok=1');
}
