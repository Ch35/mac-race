"use client";

import { useState } from "react";
import { Table as MTable, ScrollArea, Skeleton } from "@mantine/core";
import classes from "./Table.module.css";
import cx from 'clsx';
import { useTable } from "./hooks";
import { Rows } from "./Rows";

export default function Table() {
  const [scrolled, setScrolled] = useState(false);
  const { data, loading } = useTable();

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
    <div className={classes.tableContainer}>
      <ScrollArea h='calc(100vh - 135px)' onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <MTable miw={700} mr='none' verticalSpacing="xs">
          <MTable.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <MTable.Tr>
              <MTable.Th>Race</MTable.Th>
              <MTable.Th>Sail Number</MTable.Th>
              <MTable.Th>Name</MTable.Th>
              <MTable.Th>Class</MTable.Th>
              <MTable.Th>Handicap</MTable.Th>
              <MTable.Th>Laps</MTable.Th>
              <MTable.Th>Laps (Handicap)</MTable.Th>
              <MTable.Th>Lap Time (Avg)</MTable.Th>
              <MTable.Th>Lap Time (Fastest)</MTable.Th>
            </MTable.Tr>
          </MTable.Thead>
          <MTable.Tbody><Rows data={data} /></MTable.Tbody>
        </MTable>
      </ScrollArea>
    </div>
  );
}