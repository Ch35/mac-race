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
  const [boatsUndoConfirm, setBoatsUndoConfirm] = useState<Record<string, boolean>>({});
  const [boatsUndoDisabled, setBoatsUndoConfirmDisabled] = useState<Record<string, boolean>>({});
  const boatsFlagged = useBoatsFlagged(data, races);

  // const editBoat = () => {
  //   // TODO:
  //   // Open modal to edit boat
  // }

  const lap = (boatId: string, updateData = true) => {
    setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: true });
    setBoatsUndoConfirmDisabled({ ...boatsUndoDisabled, [boatId]: true });

    setTimeout(() => {
      setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });
    }, lapButtonTimeout);

    fetch("/api/boats/lap", {
      method: "POST",
      body: JSON.stringify({ id: boatId }),
    }).then((res) => {
      setBoatsUndoConfirmDisabled({ ...boatsUndoDisabled, [boatId]: false });

      if (!res.ok) {
        setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });

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
    setBoatsUndoConfirm({ ...boatsUndoConfirm, [boatId]: true });

    setTimeout(() => {
      setBoatsUndoConfirm({ ...boatsUndoConfirm, [boatId]: false });
    }, 3000);

    if (boatsUndoConfirm[boatId]) {
      setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: true });
      setBoatsUndoConfirmDisabled({ ...boatsUndoDisabled, [boatId]: true });
      const config = {
        method: "POST",
        body: JSON.stringify({ id: boatId }),
      };

      fetch("/api/boats/lap/undo", config).then((res) => {
        setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });
        setBoatsUndoConfirmDisabled({ ...boatsUndoDisabled, [boatId]: false });

        if (!res.ok) {
          setError(`Failed to undo lap for [${boatId}]`);
        } else {
          setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });
          if (updateData) mutate("/api/boats");
        }

        setBoatsUndoConfirm({ ...boatsUndoConfirm, [boatId]: false });
      });
    }
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
    const flagged = boatsFlagged.hasOwnProperty(boat.id) ? boatsFlagged[boat.id] : false;

    const undoLapProps = {
      disabled: !raceActive || !hasLaps || undoLapBtnDisabled,
      variant: "light",
      onClick: () => undoLap(boat.id),
      text: confirmUndoLap ? "Confirm?" : "Reset Lap",
      color: confirmUndoLap ? "red" : "green",
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
    };
  }

  return data.map((boat) => {
    const { 
      hasLaps,
      start,
      hasRaces,
      raceActive,
      lapBtnDisabled,
      numLaps,
      flagged,
      undoLapProps 
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
              <Button disabled={lapBtnDisabled} variant="outline" id={boat.id} onClick={() => lap(boat.id)}>Lap</Button>
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