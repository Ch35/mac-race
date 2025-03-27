import { useEffect, useState } from "react";
// import { BoatWithClass, getRaces, getTableData, RacesWithStart } from "./_actions";
import { Boat, Class, Lap, Race } from "@prisma/client";
import _ from 'lodash';
import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type BoatWithClass = Boat & { class: Class, laps: Lap[], races: Race[] };
export type RaceWithStart = Race & { active: boolean };

const hasBothRacesStarted = (races: RaceWithStart[]) => {
  const race24hStarted = !!races.find((race) => race.name === '24h')?.active;
  const race12hStarted = !!races.find((race) => race.name.includes('12h') && race.active)?.active;
  console.debug({ bothRacesStarted: race24hStarted && race12hStarted });

  return race24hStarted && race12hStarted;
}

const swrConfig = {
  refreshInterval: 10000,
  compare: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
  dedupingInterval: 10000,
};

const isActive = (race: Race) => {
  const currentTime = Date.now();
  return new Date(race.start).getTime() <= currentTime && new Date(race.end).getTime() >= currentTime;
}

export const useTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BoatWithClass[]>([]);
  const [races, setRaces] = useState<RaceWithStart[]>([]);
  const { data: boatData }: { data: BoatWithClass[] } = useSWR("/api/boats", fetcher, swrConfig);
  const { data: raceData }: { data: Race[] } = useSWR("/api/races", fetcher);

  useEffect(() => {
    if (boatData) setData(boatData);
    if (raceData) setRaces(raceData.map((race) => ({
      ...race,
      active: isActive(race),
    })));

    if(boatData && raceData) setLoading(false);
  }, [boatData, raceData]);

  useEffect(() => {
    // no need to run this if both races have started
    if (loading || !races || races.length === 0 || hasBothRacesStarted(races)) return;

    const checkRaceStatus = () => {
      const newRaces = races.map((race) => ({
        ...race,
        active: isActive(race),
      }));

      if (!_.isEqual(races, newRaces)) setRaces(newRaces);
    };

    const interval = setInterval(checkRaceStatus, 1000);

    return () => clearInterval(interval);
  }, [setRaces, races, loading]);

  return {
    data: data || [],
    loading,
    races,
  };
}