import { Dispatch, SetStateAction, useState } from "react";
import { Table, Button, SimpleGrid } from "@mantine/core";
import { BoatWithClass, RaceWithStart, useBoatsFlagged } from "./hooks";
import { mutate } from "swr";
import { Flag } from "react-feather";
import { Lap } from "@prisma/client";

type RowsAdminProps = {
  data: BoatWithClass[],
  races: RaceWithStart[],
  setError: Dispatch<SetStateAction<string>>,
  hideInactiveRace: boolean,
};

const getAvgLapTime = (laps: Lap[]) => {
  const validLaps = laps.filter((lap) => lap.start && lap.end);
  if (validLaps.length === 0) return '';

  const totalLapTime = validLaps.reduce((total, lap) => {
    if (!lap.end) return total;

    const start = new Date(lap.start).getTime();
    const end = new Date(lap.end).getTime();
    return total + (end - start);
  }, 0);

  const avgLapTime = totalLapTime / validLaps.length;
  const minutes = Math.floor(avgLapTime / 60000);
  const seconds = ((avgLapTime % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
}

const getBestLapTime = (laps: Lap[]) => {
  const validLaps = laps.filter((lap) => lap.start && lap.end);
  if (validLaps.length === 0) return '';

  const bestLap = validLaps.reduce((best, lap) => {
    const start = new Date(lap.start).getTime();
    const end = lap.end ? new Date(lap.end).getTime() : 0;
    const lapTime = end - start;

    if (lapTime > 0 && lapTime < best) {
      return lapTime;
    }
    return best;
  }, Infinity);

  if (bestLap === Infinity) return '';

  const minutes = Math.floor(bestLap / 60000);
  const seconds = ((bestLap % 60000) / 1000).toFixed(2);
  return `${minutes}m ${seconds}s`;
}

const lapButtonTimeout = 1000;

export const RowsAdmin = ({ data, races, setError, hideInactiveRace }: RowsAdminProps) => {
  const [boatsLapDisabled, setBoatsLapDisabled] = useState<Record<string, boolean>>({});
  const [boatsLapConfirm, setBoatsLapConfirm] = useState<Record<string, boolean>>({});
  const [boatsUndoConfirm, setBoatsUndoConfirm] = useState<Record<string, boolean>>({});
  const [boatsUndoDisabled, setBoatsUndoConfirmDisabled] = useState<Record<string, boolean>>({});
  const boatsFlagged = useBoatsFlagged(data, races);

  // const editBoat = () => {
  //   // TODO:
  //   // Open modal to edit boat
  // }

  const isLapUnderMinTime = (boat: BoatWithClass) => {
    const hasLaps = boat.laps.length > 0;
    if (!hasLaps) return false;

    const lastLap = boat.laps[boat.laps.length - 1];
    if (lastLap.end) return false; // No active lap

    const minLapTime = boat.races[0]?.minLapTime ?? 0;
    const lapTimeSec = (Date.now() - new Date(lastLap.start).getTime()) / 1000;
    return minLapTime * 60 > lapTimeSec;
  };

  const lap = (boatId: string, updateData = true, force = false) => {
    const boat = data.find(b => b.id === boatId);
    
    // Check if lap is under minimum time and needs confirmation
    if (!force && boat && isLapUnderMinTime(boat)) {
      setBoatsLapConfirm(prev => ({ ...prev, [boatId]: true }));
      setTimeout(() => {
        setBoatsLapConfirm(prev => ({ ...prev, [boatId]: false }));
      }, 3000);
      return;
    }

    setBoatsLapConfirm(prev => ({ ...prev, [boatId]: false }));
    setBoatsLapDisabled(prev => ({ ...prev, [boatId]: true }));
    setBoatsUndoConfirmDisabled(prev => ({ ...prev, [boatId]: true }));

    setTimeout(() => {
      setBoatsLapDisabled(prev => ({ ...prev, [boatId]: false }));
    }, lapButtonTimeout);

    fetch("/api/boats/lap", {
      method: "POST",
      body: JSON.stringify({ id: boatId, force }),
    }).then((res) => {
      setBoatsUndoConfirmDisabled(prev => ({ ...prev, [boatId]: false }));

      if (!res.ok) {
        setBoatsLapDisabled(prev => ({ ...prev, [boatId]: false }));

        res.json().then((data) => {
          let errorMsg = `Failed to create lap for [${boatId}]`;
          if (data.error) {
            errorMsg = `${errorMsg} | ${data.error}`;
          }
          setError(errorMsg);
        });
      } else {
        if (updateData) mutate("/api/boats");
      }
    });
  }

  const undoLap = (boatId: string, updateData = true) => {
    setBoatsUndoConfirm(prev => ({ ...prev, [boatId]: true }));

    setTimeout(() => {
      setBoatsUndoConfirm(prev => ({ ...prev, [boatId]: false }));
    }, 3000);

    if (!boatsUndoConfirm[boatId]) {
      return;
    }

    setBoatsLapDisabled(prev => ({ ...prev, [boatId]: true }));
    setBoatsUndoConfirmDisabled(prev => ({ ...prev, [boatId]: true }));
    const config = {
      method: "POST",
      body: JSON.stringify({ id: boatId }),
    };

    fetch("/api/boats/lap/undo", config).then((res) => {
      setBoatsLapDisabled(prev => ({ ...prev, [boatId]: false }));
      setBoatsUndoConfirmDisabled(prev => ({ ...prev, [boatId]: false }));

      if (!res.ok) {
        setError(`Failed to undo lap for [${boatId}]`);
      } else {
        if (updateData) mutate("/api/boats");
      }

      setBoatsUndoConfirm(prev => ({ ...prev, [boatId]: false }));
    });
  }

  const getRowData = (boat: BoatWithClass) => {
    const hasLaps = boat.laps.length > 0;
    const lastLapIndex = boat.laps.length - 1;
    const start = new Date(hasLaps ? boat.laps[lastLapIndex].start : 0);
    const end = new Date(hasLaps && boat.laps[lastLapIndex].end ? boat.laps[lastLapIndex].end : 0);
    const raceIdList = boat.races.map((race) => race.id);
    const hasRaces = raceIdList.length > 0;
    const raceActive = hasRaces ? races.find((race) => raceIdList.includes(race.id) && race.active)?.active : false;

    const lapBtnDisabled = !raceActive || (boatsLapDisabled.hasOwnProperty(boat.id) ? boatsLapDisabled[boat.id] : false);
    const undoLapBtnDisabled = !raceActive || (boatsUndoDisabled.hasOwnProperty(boat.id) ? boatsUndoDisabled[boat.id] : false);
    const numLaps = hasLaps ? boat.laps.filter((lap) => lap.end && lap.start).length : 0;
    const confirmUndoLap = boatsUndoConfirm.hasOwnProperty(boat.id) ? boatsUndoConfirm[boat.id] : false;
    const confirmLap = boatsLapConfirm.hasOwnProperty(boat.id) ? boatsLapConfirm[boat.id] : false;
    const flagged = boatsFlagged.hasOwnProperty(boat.id) ? boatsFlagged[boat.id] : false;

    const undoLapProps = {
      disabled: !raceActive || !hasLaps || undoLapBtnDisabled,
      variant: "light",
      onClick: () => undoLap(boat.id),
      text: confirmUndoLap ? "Confirm?" : "Undo Lap",
      color: confirmUndoLap ? "red" : "green",
    };

    const lapBtnProps = {
      disabled: lapBtnDisabled,
      variant: confirmLap ? "filled" : "outline",
      onClick: () => lap(boat.id, true, confirmLap),
      text: confirmLap ? "Confirm?" : "Lap",
      color: confirmLap ? "red" : "green",
    };

    return {
      hasLaps,
      start,
      end,
      hasRaces,
      raceActive,
      lapBtnDisabled,
      numLaps,
      flagged,
      undoLapProps,
      lapBtnProps,
    };
  }

  return data.map((boat) => {
    const {
      hasLaps,
      start,
      hasRaces,
      raceActive,
      numLaps,
      flagged,
      undoLapProps,
      lapBtnProps
    } = getRowData(boat);

    return (
      <Table.Tr key={boat.id} hidden={hideInactiveRace && !raceActive}>
        <Table.Td>
          {/* <Button variant="transparent" onClick={editBoat}><Edit /></Button> */}
        </Table.Td>
        <Table.Td>{boat.races[0].name.slice(0, 3)}</Table.Td>
        <Table.Td>{boat.class.handicap}</Table.Td>
        <Table.Td>{numLaps}</Table.Td>
        <Table.Td>{(numLaps * boat.class.handicap, 2).toFixed(2)}</Table.Td>
        <Table.Td>
          {
            hasLaps
              ? start.toLocaleTimeString('en-GB', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
              : null
          }
        </Table.Td>
        <Table.Td>{getAvgLapTime(boat.laps)}</Table.Td>
        <Table.Td>{getBestLapTime(boat.laps)}</Table.Td>
        <Table.Td>{boat.class.name}</Table.Td>
        <Table.Td>{boat.name}</Table.Td>
        <Table.Td><b>{boat.id}</b></Table.Td>
        <Table.Td>
          {hasRaces && (
            <SimpleGrid cols={2} spacing="5">
              <Button {...undoLapProps}>{undoLapProps.text}</Button>
              <Button {...lapBtnProps} id={boat.id}>{lapBtnProps.text}</Button>
            </SimpleGrid>
          )}
        </Table.Td>
        <Table.Td>{flagged && <Flag color="red" />}</Table.Td>
      </Table.Tr>
    );
  });
}

type RowsProps = { data: BoatWithClass[] };
export const Rows = ({ data }: RowsProps) => {
  const sortedData = [...data].sort((a, b) => {
    const lapsA = a.laps.filter((lap) => lap.end && lap.start).length;
    const lapsB = b.laps.filter((lap) => lap.end && lap.start).length;
    return lapsB - lapsA;
  });

  return sortedData.map((boat) => {
    const hasLaps = boat.laps.length > 0;
    const numLaps = hasLaps ? boat.laps.filter((lap) => lap.end && lap.start).length : 0;

    return (
      <Table.Tr key={boat.id}>
        <Table.Td>{boat.races.length > 0 ? boat.races[0].name.slice(0, 3) : null}</Table.Td>
        <Table.Td>{boat.id}</Table.Td>
        <Table.Td>{boat.name}</Table.Td>
        <Table.Td>{boat.class.name}</Table.Td>
        <Table.Td>{boat.class.handicap}</Table.Td>
        <Table.Td>{numLaps}</Table.Td>
        <Table.Td>{(numLaps * boat.class.handicap, 2).toFixed(2)}</Table.Td>
        <Table.Td>{getAvgLapTime(boat.laps)}</Table.Td>
        <Table.Td>{getBestLapTime(boat.laps)}</Table.Td>
      </Table.Tr>
    );
  });
}