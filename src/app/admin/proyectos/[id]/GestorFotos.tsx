'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarFoto, borrarFoto, ordenarFotos, usarDePortada } from '../../acciones';

type F = { id: string; url: string; pie: string; previa: boolean; avance: boolean; fecha: string };
type Pendiente = { file: File; url: string; formato: 'original' | '4:3' | '16:9' | '1:1'; x: number; y: number; estado: string };
const PROP: Record<string, number> = { '4:3': 4 / 3, '16:9': 16 / 9, '1:1': 1 };

// Recorta (si se pidió) y achica en el navegador a 3000 px como máximo, para no superar el límite
// de 4,5 MB por envío de Vercel. El servidor después la optimiza a WebP 2400 px.
async function preparar(p: Pendiente): Promise<Blob> {
  const img = await createImageBitmap(p.file, { imageOrientation: 'from-image' });
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  const r = PROP[p.formato];
  if (r) {
    sw = img.width; sh = img.width / r;
    if (sh > img.height) { sh = img.height; sw = sh * r; }
    sx = ((img.width - sw) * p.x) / 100;
    sy = ((img.height - sh) * p.y) / 100;
  }
  const k = Math.min(1, 3000 / Math.max(sw, sh));
  const cv = document.createElement('canvas');
  cv.width = Math.round(sw * k); cv.height = Math.round(sh * k);
  cv.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
  return new Promise((ok) => cv.toBlob((b) => ok(b!), 'image/jpeg', 0.9));
}

export default function GestorFotos({ proyectoId, fotos: inicial, portada }: { proyectoId: string; fotos: F[]; portada: string }) {
  const router = useRouter();
  const [fotos, setFotos] = useState(inicial);
  const [arrastra, setArrastra] = useState<number | null>(null);
  const [sobre, setSobre] = useState<number | null>(null);
  const [cola, setCola] = useState<Pendiente[]>([]);
  const [zona, setZona] = useState(false);
  const [ocupado, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  function mover(de: number, a: number) {
    if (de === a || a < 0 || a >= fotos.length) return;
    const nueva = [...fotos];
    const [x] = nueva.splice(de, 1);
    nueva.splice(a, 0, x);
    setFotos(nueva);
    start(() => ordenarFotos(nueva.map((f) => f.id)));
  }
  const cambiar = (id: string, c: Partial<F>) => {
    setFotos((fs) => fs.map((f) => (f.id === id ? { ...f, ...c } : f)));
    start(() => actualizarFoto(id, { pie: c.pie, previa: c.previa, avance: c.avance, fecha: c.fecha }));
  };
  const agregar = (files: FileList | null) => {
    if (!files) return;
    setCola((c) => [...c, ...[...files].filter((f) => f.type.startsWith('image/')).map((file) => ({ file, url: URL.createObjectURL(file), formato: 'original' as const, x: 50, y: 50, estado: '' }))]);
  };

  async function subirTodo() {
    for (let i = 0; i < cola.length; i++) {
      const p = cola[i];
      if (p.estado === 'listo') continue;
      setCola((c) => c.map((x, k) => (k === i ? { ...x, estado: 'subiendo…' } : x)));
      const fd = new FormData();
      fd.append('archivo', await preparar(p), p.file.name.replace(/\.[a-z0-9]+$/i, '') + '.jpg');
      fd.append('proyectoId', proyectoId);
      const res = await fetch('/api/admin/fotos', { method: 'POST', body: fd });
      if (!res.ok) { setCola((c) => c.map((x, k) => (k === i ? { ...x, estado: `error: ${res.statusText || res.status}` } : x))); continue; }
      const nueva = (await res.json()) as F;
      setFotos((fs) => [...fs, nueva]);
      setCola((c) => c.map((x, k) => (k === i ? { ...x, estado: 'listo' } : x)));
    }
    setCola((c) => c.filter((x) => x.estado !== 'listo'));
    router.refresh();
  }

  return (
    <>
      <div className="fotos">
        {fotos.map((f, i) => (
          <div key={f.id} className={`foto${arrastra === i ? ' arrastrando' : ''}${sobre === i ? ' sobre' : ''}`}
            draggable onDragStart={() => setArrastra(i)} onDragEnd={() => { setArrastra(null); setSobre(null); }}
            onDragOver={(e) => { e.preventDefault(); setSobre(i); }} onDrop={(e) => { e.preventDefault(); if (arrastra !== null) mover(arrastra, i); setArrastra(null); setSobre(null); }}>
            <div className="img"><img src={f.url} alt="" loading="lazy" /><span className="n">{i + 1}</span>{f.url === portada && <span className="por">Portada</span>}</div>
            <div className="cuerpo">
              <input type="text" defaultValue={f.pie} placeholder="Pie de foto" aria-label={`Pie de la foto ${i + 1}`} onBlur={(e) => e.target.value !== f.pie && cambiar(f.id, { pie: e.target.value })} />
              <div className="fila">
                <label className="check"><input type="checkbox" checked={f.previa} onChange={(e) => cambiar(f.id, { previa: e.target.checked })} /> Previa</label>
                <label className="check"><input type="checkbox" checked={f.avance} onChange={(e) => cambiar(f.id, { avance: e.target.checked })} /> Avance</label>
              </div>
              {f.avance && <input type="date" defaultValue={f.fecha} aria-label="Fecha de la foto" onChange={(e) => cambiar(f.id, { fecha: e.target.value })} />}
              <div className="fila">
                <button type="button" className="b chico" onClick={() => mover(i, i - 1)} aria-label="Mover antes">←</button>
                <button type="button" className="b chico" onClick={() => mover(i, i + 1)} aria-label="Mover después">→</button>
                <button type="button" className="b chico" disabled={f.url === portada} onClick={() => start(async () => { await usarDePortada(f.id); router.refresh(); })}>Portada</button>
                <button type="button" className="b chico rojo" onClick={() => { setFotos((fs) => fs.filter((x) => x.id !== f.id)); start(() => borrarFoto(f.id)); }}>Quitar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`zona${zona ? ' activa' : ''}`} style={{ marginTop: 16 }}
        onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setZona(true); } }} onDragLeave={() => setZona(false)}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setZona(false); agregar(e.dataTransfer.files); } }}>
        <strong>Subir fotos</strong>
        <span className="sub" style={{ margin: 0 }}>Arrastrá fotos acá o elegilas. Se optimizan solas (2400 px, WebP). Por defecto se suben sin recortar.</span>
        <div><button type="button" className="b" onClick={() => input.current?.click()}>Elegir fotos</button>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { agregar(e.target.files); e.target.value = ''; }} /></div>
        {cola.length > 0 && (
          <div className="cola">
            {cola.map((p, i) => {
              const r = PROP[p.formato];
              return (
                <div className="recorte" key={p.url}>
                  <div className="vista">
                    <img src={p.url} alt="" />
                    {r && <span className="marco" style={{ aspectRatio: String(r), width: r >= 4 / 3 ? '100%' : `${r * 75}%`, left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-${p.x}%, -${p.y}%)` }} />}
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <span style={{ overflowWrap: 'anywhere' }}>{p.file.name} {p.estado && <b>· {p.estado}</b>}</span>
                    <div className="fila" role="group" aria-label="Recorte">
                      {(['original', '4:3', '16:9', '1:1'] as const).map((fm) => (
                        <button key={fm} type="button" className={`b chico${p.formato === fm ? ' pri' : ''}`} onClick={() => setCola((c) => c.map((x, k) => (k === i ? { ...x, formato: fm } : x)))}>{fm === 'original' ? 'Sin recortar' : fm}</button>
                      ))}
                    </div>
                    {p.formato !== 'original' && (
                      <div className="fila">
                        <label style={{ fontWeight: 400 }}>Horizontal<input type="range" min={0} max={100} value={p.x} onChange={(e) => setCola((c) => c.map((x, k) => (k === i ? { ...x, x: +e.target.value } : x)))} /></label>
                        <label style={{ fontWeight: 400 }}>Vertical<input type="range" min={0} max={100} value={p.y} onChange={(e) => setCola((c) => c.map((x, k) => (k === i ? { ...x, y: +e.target.value } : x)))} /></label>
                      </div>
                    )}
                    <div><button type="button" className="b chico rojo" onClick={() => setCola((c) => c.filter((_, k) => k !== i))}>Descartar</button></div>
                  </div>
                </div>
              );
            })}
            <div className="acciones"><button type="button" className="b pri" onClick={subirTodo} disabled={ocupado}>Subir {cola.length} {cola.length === 1 ? 'foto' : 'fotos'}</button></div>
          </div>
        )}
      </div>
    </>
  );
}
