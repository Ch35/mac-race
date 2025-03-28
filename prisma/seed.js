import { PrismaClient } from "@prisma/client";
import classes from './classes.json' assert { type: 'json' };
import races from './races.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  const minLapTime = 5;
  const maxLapTime = 10;

  for (const race of races) {
    if (!await prisma.race.findFirst({ where: { name: race.name } })) {
      await prisma.race.create({
        data: {
          name: race.name,
          start: new Date(race.start),
          end: new Date(race.end),
          minLapTime,
          maxLapTime,
        },
      });

      console.log(`Seeding ${race.name}`);
    }
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
