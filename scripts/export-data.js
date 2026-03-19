const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const data = {
    municipios: await prisma.municipio.findMany(),
    instituciones: await prisma.institucion.findMany(),
    actas: await prisma.acta.findMany(),
    planes: await prisma.planPedagogico.findMany(),
    anotaciones: await prisma.anotacion.findMany(),
  };
  fs.writeFileSync('prisma/data-export.json', JSON.stringify(data, null, 2));
  console.log("Data exported to prisma/data-export.json");
  await prisma.$disconnect();
}

main();
