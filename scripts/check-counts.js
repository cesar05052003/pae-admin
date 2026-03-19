const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const munis = await prisma.municipio.count();
  const insts = await prisma.institucion.count();
  const actas = await prisma.acta.count();
  console.log(`Counts - Municipios: ${munis}, Inst: ${insts}, Actas: ${actas}`);
  await prisma.$disconnect();
}

main();
