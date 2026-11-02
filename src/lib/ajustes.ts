import { cache } from 'react';
import { db } from './db';

// Valores por defecto = textos actuales del sitio en Wix. Todo se puede cambiar desde /admin/ajustes.
export const AJUSTES_BASE = {
  nombre: 'Burano S.R.L.',
  lema: 'Arquitectura | Ingeniería | Construcción',
  intro:
    'Burano construcciones nace en el año 2014 como una empresa que brinda servicios de proyecto, dirección y ejecución de obras, desarrollando nuestra actividad en el sector de la construcción, manejando proyectos con principios de calidad, tiempo, alcances y costos. Adaptamos las especificaciones técnicas y los planes a los diversos requerimientos de nuestros clientes, concientizados en respetar al máximo las condiciones del medio ambiente y la prevención de accidentes y seguridad en obra.',
  mision:
    'Nuestra principal misión es el trabajo en equipo, la ética profesional y un trato cordial con nuestros clientes, garantizando una alta satisfacción de los mismos.',
  equipoTitulo: 'Equipo técnico',
  equipoTexto1:
    'Los técnicos que integramos esta empresa somos Profesionales Universitarios, jóvenes y con una sólida experiencia de más de 10 años, garantizando un asesoramiento profesional de primera línea que respalda las obras que realizamos.',
  equipoTexto2:
    'Nuestra actitud por una actualización permanente y la aplicación de tecnologías de vanguardia, brinda a nuestros clientes una mayor seguridad y tranquilidad a la hora de contratar nuestros servicios.',
  serviciosTitulo: 'Servicios brindados',
  calculoTitulo: 'Algunos de los trabajos realizados:',
  razonSocial: 'BURANO S.R.L.',
  direccion: 'Avenida Sarmiento N° 2504 /102',
  ciudad: 'Montevideo / Uruguay',
  telefono: '2711 3877',
  email: 'contacto@burano.com.uy',
  whatsapp: '',
  facebook: 'https://www.facebook.com/BuranoSRL/',
  instagram: '',
  linkedin: '',
  pie: '© 2018 Burano srl | Diseño web Datatex',
  formOk: '¡Tus datos se enviaron con éxito!',
  avisoConsultas: 'contacto@burano.com.uy',
  remitente: 'Burano <onboarding@resend.dev>',
  lat: '-34.9116',
  lng: '-56.1580',
};
export type Ajustes = typeof AJUSTES_BASE;
export type ClaveAjuste = keyof Ajustes;

export const getAjustes = cache(async (): Promise<Ajustes> => {
  const filas = await db.ajuste.findMany().catch(() => []);
  const a = { ...AJUSTES_BASE };
  for (const f of filas) if (f.clave in a) (a as Record<string, string>)[f.clave] = f.valor;
  return a;
});

export function waLink(numero: string, texto: string) {
  const n = numero.replace(/\D/g, '');
  if (!n) return '';
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
