"use client";

import { RefObject, useState } from "react";
import { Table as MTable, ScrollArea, Skeleton } from "@mantine/core";
import { Zap, ZapOff } from "react-feather";
import classes from "./Table.module.css";
import cx from 'clsx';
import { BoatWithClass, RaceWithStart, SetError, useRace } from "./hooks";
import { RowsAdmin } from "./Rows";

type Props = {
  data: BoatWithClass[]
  races: RaceWithStart[]
  loading: boolean
  setError: SetError,
  tableRef: RefObject<HTMLTableElement | null>,
};

export default function AdminTable({ data, races, loading, setError, tableRef }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [hideInactiveRace, setHideInactiveRace] = useState(false);
  useRace(races, loading, setError);

  const toggleHideInactiveRace = () => setHideInactiveRace(!hideInactiveRace);

  if (loading) {
    return (
      <div className={classes.tableContainer}>
        <Skeleton height={15} radius="xl" />
        <Skeleton height={15} mt={6} radius="xl" />
        <Skeleton height={15} mt={6} width="70%" radius="xl" />
      </div>
    );
  }

  return (
    <>
      <div className={classes.hideRaceContainer}>
        {
          hideInactiveRace
            ? <ZapOff className={classes.hideRaceBtn} onClick={toggleHideInactiveRace} />
            : <Zap className={classes.hideRaceBtn} onClick={toggleHideInactiveRace} />
        }
      </div>
      <div className={classes.tableContainer}>
        <ScrollArea h='calc(100vh - 135px)' onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
          <MTable ref={tableRef} miw={700} mr='none' verticalSpacing="5">
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
            <MTable.Tbody>
              <RowsAdmin data={data} races={races} setError={setError} hideInactiveRace={hideInactiveRace} />
            </MTable.Tbody>
          </MTable>
        </ScrollArea>
      </div>
    </>
  );
}