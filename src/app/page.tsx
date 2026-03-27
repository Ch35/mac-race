"use client";

import { useSearchParams } from "next/navigation";
import Table from "@/components/Table/Table";

export default function Home() {
  const searchParams = useSearchParams();
  const autoScroll = searchParams.get("autoscroll") === "true";

  return <Table autoScroll={autoScroll} />;
}
