import { Race } from "@prisma/client";

export const isActive = (race: Race) => {
  const currentTime = Date.now();
  return new Date(race.start).getTime() <= currentTime && new Date(race.end).getTime() >= currentTime;
}
