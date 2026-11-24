'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubirArchivo({ proyectoId }: { proyectoId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState('');
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append('proyectoId', proyectoId);
    setEstado('Subiendo…');
    const r = await fetch('/api/admin/archivos', { method: 'POST', body: fd });
    setEstado(r.ok ? '' : 'No se pudo subir. Probá de nuevo.');
    if (r.ok) { (e.target as HTMLFormElement).reset(); router.refresh(); }
  }
  return (
    <form onSubmit={enviar} className="campos" style={{ marginTop: 14 }}>
      <label>Nombre visible<input name="nombre" required placeholder="Plano de albañilería" /></label>
      <label>Tipo<select name="tipo" defaultValue="Plano"><option>Plano</option><option>Brochure</option><option>Memoria</option><option>Otro</option></select></label>
      <label className="full">Archivo (PDF o imagen)<input name="archivo" type="file" accept="application/pdf,image/*" required /></label>
      <div className="acciones full" style={{ marginTop: 0 }}><button className="b" type="submit">Agregar descargable</button>{estado && <span>{estado}</span>}</div>
    </form>
  );
}
