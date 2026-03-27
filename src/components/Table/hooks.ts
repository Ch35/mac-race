'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Boat, Class, Lap, Race } from "@prisma/client";
import _ from 'lodash';
import { isActive } from "@/lib/race";

export type BoatWithClass = Boat & { class: Class, laps: Lap[], races: Race[] };
export type RaceWithBoats = Race & { boats: Boat[] };
export type RaceWithStart = RaceWithBoats & { active: boolean };

const hasBothRacesStarted = (races: RaceWithStart[]) => {
  const race24hStarted = !!races.find((race) => race.name === '24h')?.active;
  const race12hStarted = !!races.find((race) => race.name.includes('12h') && race.active)?.active;

  return race24hStarted && race12hStarted;
}

export const useTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BoatWithClass[]>([]);
  const [races, setRaces] = useState<RaceWithStart[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE stream
    const eventSource = new EventSource('/api/boats/stream');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const { boats, races: raceData } = JSON.parse(event.data);

        if (boats) setData(boats);
        if (raceData) {
          setRaces(raceData.map((race: RaceWithBoats) => ({
            ...race,
            active: isActive(race),
          })));
        }

        if (boats && raceData) setLoading(false);
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // EventSource will automatically try to reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, []);

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

export type SetError = Dispatch<SetStateAction<string>>;

export const useError = (errorReset = 10000) => {
  const [error, setError] = useState('');
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(() => {
      setError('');
      setErrorCount(0);
    }, errorReset);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return {
    error,
    setError: (error: SetStateAction<string>) => {
      setError(error);
      setErrorCount(errorCount + 1);
    },
    errorCount,
  };
}

export const useRace = (races: RaceWithStart[], loading: boolean, setError: SetError) => {
  useEffect(() => {
    if (!races) {
      if (!loading) setError('No races found!');
      return;
    };

    const now = Date.now();

    races.forEach((race) => {
      const raceStart = new Date(race.start).getTime();

      if (!race.active && raceStart > now) {
        const timeout = setTimeout(() => {
          fetch('/api/races/start', {
            method: 'POST',
            body: JSON.stringify({ raceId: race.id }),
          }).then((res) => {
            if (!res.ok) {
              setError(`Failed to start race ${race.name}`);
            }
            // SSE stream will automatically push updated data
          }).catch(() => {
            setError(`Failed to start race ${race.name}`);
          });
        }, raceStart - now);

        return () => clearTimeout(timeout);
      }
    });
  }, [races, loading, setError]);
}

export const useBoatsFlagged = (boats: BoatWithClass[], races: RaceWithStart[]) => {
  const [boatsFlagged, setBoatsFlagged] = useState<Record<string, boolean>>({});

  const setFlags = () => {
    const newFlags: Record<string, boolean> = {};

    boats.forEach((boat) => {
      const hasLaps = boat.laps.length > 0;
      const lastLapIndex = boat.laps.length - 1;
      const start = new Date(hasLaps ? boat.laps[lastLapIndex].start : 0);
      const raceIdList = boat.races.map((race) => race.id);
      const hasRaces = raceIdList.length > 0;
      const raceActive = hasRaces ? races.find((race) => raceIdList.includes(race.id) && race.active)?.active : false;
      const { maxLapTime } = hasRaces ? boat.races[0] : { maxLapTime: 0 };

      const lapTime = hasLaps ? (new Date().getTime() - start.getTime()) / 1000 : 0;
      const flagLastLap = hasLaps
        ? lapTime >= maxLapTime * 60
        : false;
      const flagged = !!(!hasRaces || flagLastLap || (raceActive && !hasLaps));

      newFlags[boat.id] = flagged;
    });

    setBoatsFlagged(newFlags);
  }

  useEffect(() => {
    if (!boats) return;

    setFlags();
    const interval = setInterval(() => setFlags(), 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boats, races]);

  return boatsFlagged;
}