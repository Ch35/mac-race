"use client";

import { useState, useRef, useEffect } from "react";
import { Table as MTable, ScrollArea, Skeleton } from "@mantine/core";
import classes from "./Table.module.css";
import cx from 'clsx';
import { useTable } from "./hooks";
import { Rows } from "./Rows";

type Props = {
  autoScroll?: boolean;
};

export default function Table({ autoScroll = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { data, loading } = useTable();
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollDirectionRef = useRef<'down' | 'up'>('down');

  useEffect(() => {
    if (!autoScroll || loading || !viewportRef.current) return;

    const scrollSpeed = 1; // pixels per interval
    const scrollInterval = 70; // ms between scroll steps
    const pauseAtEnds = 3000; // pause at top/bottom in ms

    let isPaused = false;

    const interval = setInterval(() => {
      if (!viewportRef.current || isPaused) return;

      const viewport = viewportRef.current;
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      const currentScroll = viewport.scrollTop;

      if (scrollDirectionRef.current === 'down') {
        if (currentScroll >= maxScroll - 1) {
          isPaused = true;
          setTimeout(() => {
            scrollDirectionRef.current = 'up';
            isPaused = false;
          }, pauseAtEnds);
        } else {
          viewport.scrollTop = currentScroll + scrollSpeed;
        }
      } else {
        if (currentScroll <= 1) {
          isPaused = true;
          setTimeout(() => {
            scrollDirectionRef.current = 'down';
            isPaused = false;
          }, pauseAtEnds);
        } else {
          viewport.scrollTop = currentScroll - scrollSpeed;
        }
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, loading]);

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
      <ScrollArea h='calc(100vh - 20px)' viewportRef={viewportRef} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
        <MTable miw={700} mr='none' verticalSpacing="xs">
          <MTable.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
            <MTable.Tr>
              <MTable.Th>Overall Position</MTable.Th>
              <MTable.Th>Boat Number</MTable.Th>
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