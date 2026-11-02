import Link from 'next/link';

export default function NoEncontrado() {
  return (
    <section className="sec">
      <div className="wrap">
        <h1 style={{ fontSize: 'clamp(30px,4vw,54px)' }}>No encontramos esta página</h1>
        <p style={{ marginTop: 16, color: 'var(--muted)' }}>Puede que la dirección haya cambiado con el sitio nuevo.</p>
        <div className="btns" style={{ marginTop: 26 }}>
          <Link className="btn primario" href="/obras">Galería de trabajos</Link>
          <Link className="btn" href="/">Inicio</Link>
        </div>
      </div>
    </section>
  );
}
