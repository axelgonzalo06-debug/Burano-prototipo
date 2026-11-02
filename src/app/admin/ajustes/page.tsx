import { exigirAdmin } from '@/lib/auth';
import { getAjustes, type ClaveAjuste } from '@/lib/ajustes';
import Panel from '../Panel';
import { guardarAjustes } from '../acciones';

const GRUPOS: { titulo: string; campos: [ClaveAjuste, string, 'area'?, string?][] }[] = [
  { titulo: 'Portada y textos', campos: [
    ['lema', 'Lema (separá con |)'], ['nombre', 'Nombre de la empresa'],
    ['intro', 'Texto de presentación', 'area'], ['mision', 'Misión', 'area'],
    ['serviciosTitulo', 'Título de Servicios'], ['calculoTitulo', 'Título de la lista de cálculo'],
    ['equipoTitulo', 'Título de Equipo'], ['equipoTexto1', 'Equipo: primer párrafo', 'area'], ['equipoTexto2', 'Equipo: segundo párrafo', 'area'],
  ] },
  { titulo: 'Contacto', campos: [
    ['razonSocial', 'Razón social'], ['direccion', 'Dirección'], ['ciudad', 'Ciudad / país'], ['telefono', 'Teléfono'], ['email', 'Email público'],
    ['whatsapp', 'WhatsApp', undefined, 'Con código de país, ej.: 59899123456. Vacío = sin botón de WhatsApp.'],
    ['formOk', 'Mensaje al enviar el formulario'],
  ] },
  { titulo: 'Redes y pie', campos: [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['pie', 'Texto del pie']] },
  { titulo: 'Correos', campos: [
    ['avisoConsultas', 'Avisar consultas nuevas a', undefined, 'Uno o varios correos separados por coma.'],
    ['remitente', 'Remitente', undefined, 'Ej.: Burano <web@burano.com.uy>. El dominio tiene que estar verificado en Resend.'],
  ] },
];

export default async function Ajustes({ searchParams }: { searchParams: { ok?: string } }) {
  await exigirAdmin();
  const a = await getAjustes();
  return (
    <Panel ruta="/admin/ajustes">
      <h1>Ajustes y textos</h1>
      <p className="sub">Todo lo que se ve en el sitio y no es un proyecto. Los cambios se ven en segundos, sin volver a publicar.</p>
      {searchParams.ok && <p className="aviso">Guardado.</p>}
      <form action={guardarAjustes}>
        {GRUPOS.map((g) => (
          <div className="tarjeta" key={g.titulo}>
            <h2>{g.titulo}</h2>
            <div className="campos">
              {g.campos.map(([k, etq, tipo, ayuda]) => (
                <label key={k} className={tipo === 'area' ? 'full' : undefined}>{etq}
                  {tipo === 'area' ? <textarea name={k} defaultValue={a[k]} rows={4} /> : <input name={k} defaultValue={a[k]} />}
                  {ayuda && <span className="ayuda">{ayuda}</span>}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="acciones"><button className="b pri" type="submit">Guardar ajustes</button></div>
      </form>
    </Panel>
  );
}
