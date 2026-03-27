"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Table from "@/components/Table/Table";

function HomeContent() {
  const searchParams = useSearchParams();
  const autoScroll = searchParams.get("autoscroll") === "true";

  return <Table autoScroll={autoScroll} />;
}

export default function Home() {
  return (
    <Suspense fallback={<Table autoScroll={false} />}>
      <HomeContent />
    </Suspense>
  );
}
