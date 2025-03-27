"use client";

import { useState } from "react";
import { Table as MTable, ScrollArea, Button, Skeleton, SimpleGrid } from "@mantine/core";
import { Flag, Edit } from "react-feather";
import classes from "./Table.module.css";
import cx from 'clsx';
import { useTable } from "./hooks";
import { mutate } from "swr";

// const editBoat = () => {
//   // TODO:
//   // Open modal to edit boat
// }

export default function AdminTable() {
  const [scrolled, setScrolled] = useState(false);
  const { data, loading, races } = useTable();
  const [boatsLapDisabled, setBoatsLapDisabled] = useState<Record<string, boolean>>({});
  const [boatsUndoConfirm, setBoatsUndoConfirm] = useState<Record<string, boolean>>({});

  const lap = (boatId: string, updateData = true) => {
    setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: true });

    setTimeout(() => {
      setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });
    }, 10000);

    if (updateData) mutate("/api/boats");

    fetch("/api/boats/lap", {
      method: "POST",
      body: JSON.stringify({ id: boatId }),
    }).then((res) => {
      if (!res.ok) {
        setBoatsLapDisabled({ ...boatsLapDisabled, [boatId]: false });
        console.error('Failed to create lap');
      }
    });
  }

  const undoLap = (boatId: string) => {
    setBoatsUndoConfirm({ ...boatsUndoConfirm, [boatId]: true });

    setTimeout(() => {
      setBoatsUndoConfirm({ ...boatsUndoConfirm, [boatId]: false });
    }, 5000);

    if (boatsUndoConfirm[boatId]) {
      // TODO:
      // Confirm previous lap
      // Send undo lap request

      mutate("/api/boats");
    }

  }

  if (loading) {
    return (
      <div className={classes.tableContainer}>
        <Skeleton height={15} radius="xl" />
        <Skeleton height={15} mt={6} radius="xl" />
        <Skeleton height={15} mt={6} width="70%" radius="xl" />
      </div>
    );
  }

  const rows = data.map((boat) => {
    const hasLaps = boat.laps.length > 0;
    const lastLapIndex = boat.laps.length - 1;
    const start = new Date(hasLaps ? boat.laps[lastLapIndex].start : 0);
    const end = new Date(hasLaps ? boat.laps[lastLapIndex].end : 0);
    const lapTime = hasLaps ? (end.getTime() - start.getTime()) / 1000 : 0;
    const raceIdList = boat.races.map((race) => race.id);
    const hasRaces = raceIdList.length > 0;
    const raceActive = hasRaces ? races.find((race) => raceIdList.includes(race.id) && race.active)?.active : false;
    const { minLapTime, maxLapTime } = hasRaces ? boat.races[0] : { minLapTime: 0, maxLapTime: 0 };

    console.log({ boat, start, sstart: boat.laps[lastLapIndex]?.start, lastLapIndex, hasLaps }); //! d

    // Flag if lap time is less than min or greater than max
    const flagLastLap = hasLaps
      ? lapTime <= minLapTime || lapTime >= maxLapTime
      : false;
    const flagged = !hasRaces && flagLastLap;
    const lapBtnDisabled = !raceActive || (boatsLapDisabled.hasOwnProperty(boat.id) ? boatsLapDisabled[boat.id] : false);
    const numLaps = hasLaps ? boat.laps.filter((lap) => lap.end && lap.start).length : 0;

    return (
      <MTable.Tr key={boat.id}>
        <MTable.Td>
          {/* <Button variant="transparent" onClick={editBoat}><Edit /></Button> */}
        </MTable.Td>
        <MTable.Td>{boat.races[0].name.slice(0, 3)}</MTable.Td>
        <MTable.Td>{boat.class.handicap}</MTable.Td>
        <MTable.Td>{numLaps}</MTable.Td>
        <MTable.Td>{numLaps * boat.class.handicap}</MTable.Td>
        <MTable.Td>
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
        </MTable.Td>
        <MTable.Td>TODO AVG</MTable.Td>
        <MTable.Td>TODO FASTEST</MTable.Td>
        <MTable.Td>{boat.class.name}</MTable.Td>
        <MTable.Td>{boat.name}</MTable.Td>
        <MTable.Td><b>{boat.id}</b></MTable.Td>
        <MTable.Td>
          {hasRaces && (
            <SimpleGrid cols={2} spacing="5">
              <Button disabled={!raceActive} variant="light" onClick={() => undoLap(boat.id)}>Undo Lap</Button>
              <Button disabled={lapBtnDisabled} variant="outline" id={boat.id} onClick={() => lap(boat.id)}>Lap</Button>
            </SimpleGrid>
          )}
        </MTable.Td>
        <MTable.Td>{flagged && <Flag color="red" />}</MTable.Td>
      </MTable.Tr>
    );
  });

  return (
    <div className={classes.tableContainer}>
      <ScrollArea h='calc(100vh - 135px)' onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <MTable miw={700} mr='none' verticalSpacing="xs">
          <MTable.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <MTable.Tr>
              <MTable.Th>Edit</MTable.Th>
              <MTable.Th>Race</MTable.Th>
              <MTable.Th>Handicap</MTable.Th>
              <MTable.Th>Laps</MTable.Th>
              <MTable.Th>Laps (H)</MTable.Th>
              <MTable.Th>Last Lap Start</MTable.Th>
              <MTable.Th>Lap Time (Avg)</MTable.Th>
              <MTable.Th>Lap Time (Fastest)</MTable.Th>
              <MTable.Th>Class</MTable.Th>
              <MTable.Th>Name</MTable.Th>
              <MTable.Th>Sail Number</MTable.Th>
              <MTable.Th></MTable.Th>
              <MTable.Th>Status</MTable.Th>
            </MTable.Tr>
          </MTable.Thead>
          <MTable.Tbody>{rows}</MTable.Tbody>
        </MTable>
      </ScrollArea>
    </div>
  );
}