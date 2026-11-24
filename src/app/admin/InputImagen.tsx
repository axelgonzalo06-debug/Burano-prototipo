'use client';

// Campo de imagen que achica en el navegador antes de enviar (límite de 4,5 MB por envío en Vercel).
export default function InputImagen({ max = 2600, etiqueta = 'Imagen' }: { max?: number; etiqueta?: string }) {
  async function cambio(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const f = input.files?.[0];
    if (!f || !f.type.startsWith('image/') || f.type === 'image/svg+xml') return;
    const img = await createImageBitmap(f, { imageOrientation: 'from-image' });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
    const tipo = f.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((ok) => cv.toBlob((b) => ok(b!), tipo, 0.9));
    const dt = new DataTransfer();
    dt.items.add(new File([blob], f.name.replace(/\.[a-z0-9]+$/i, tipo === 'image/png' ? '.png' : '.jpg'), { type: tipo }));
    input.files = dt.files;
  }
  return <label>{etiqueta}<input type="file" name="_imagen" accept="image/*" onChange={cambio} /><span className="ayuda">Sin recortar; se optimiza al subir.</span></label>;
}
