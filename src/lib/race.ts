import { Race } from "@prisma/client";

export const isActive = (race: Race) => {
  const currentTime = Date.now();
  const started = +new Date(race.start).getTime() <= +currentTime;
  const notEnded = +new Date(race.end).getTime() >= +currentTime;

  const isActive = started && notEnded;
  return isActive;
}
