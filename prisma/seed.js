import { PrismaClient } from "@prisma/client";
import classes from './classes.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  const minLapTime = 5;
  const maxLapTime = 10;

  if (!await prisma.race.findFirst({ where: { name: '24h' } })) {
    await prisma.race.create({
      data: {
        name: '24h',
        start: new Date('2025-03-29T12:00:00+02:00'),
        end: new Date('2025-03-30T12:00:00+02:00'),
        minLapTime,
        maxLapTime,
      }
    });

    console.log('Seeding 24h');
  }

  if (!await prisma.race.findFirst({ where: { name: '12h day 1' } })) {
    await prisma.race.create({
      data: {
        name: '12h day 1',
        start: new Date('2025-03-29T12:00:00+02:00'),
        end: new Date('2025-03-30T18:30:00+02:00'),
        minLapTime,
        maxLapTime,
      }
    });

    console.log('Seeding 12h day 1');
  }
  
  if (!await prisma.race.findFirst({ where: { name: '12h day 2' } })) {
    await prisma.race.create({
      data: {
        name: '12h day 2',
        start: new Date('2025-03-30T06:30:00+02:00'),
        end: new Date('2025-03-30T12:00:00+02:00'),
        minLapTime,
        maxLapTime,
      }
    });

    console.log('Seeding 12h day 2');
  }

  for (const boatClass of classes) {
    if (!await prisma.class.findFirst({ where: { name: boatClass.name } })) {
      await prisma.class.create({
        data: {
          name: boatClass.name,
          handicap: boatClass.handicap,
        },
      });

      console.log(`Seeding ${boatClass.name} [${boatClass.handicap}]`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
