// Copia el contenido (no usuarios, consultas ni correos) de una base a otra.
// Uso: ORIGEN="postgresql://…" node --env-file=.env.production.local scripts/copiar-base.mjs
// El destino es DATABASE_URL. Se niega a escribir si el destino ya tiene proyectos.
import { PrismaClient } from '@prisma/client';

if (!process.env.ORIGEN) throw new Error('Falta ORIGEN');
const origen = new PrismaClient({ datasources: { db: { url: process.env.ORIGEN } } });
const destino = new PrismaClient();

if (await destino.proyecto.count()) throw new Error('El destino ya tiene proyectos: no copio para no duplicar.');
const TABLAS = ['ajuste', 'itemMenu', 'diapositiva', 'indicador', 'servicio', 'trabajoCalculo', 'integrante', 'hito', 'cliente', 'proyecto', 'foto', 'archivo', 'noticia'];
for (const t of TABLAS) {
  const filas = await origen[t].findMany();
  for (let i = 0; i < filas.length; i += 200) await destino[t].createMany({ data: filas.slice(i, i + 200) });
  console.log(`${t}: ${filas.length}`);
}
await origen.$disconnect();
await destino.$disconnect();
