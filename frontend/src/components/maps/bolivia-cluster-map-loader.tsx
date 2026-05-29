"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const BoliviaClusterMap = dynamic(
  () => import("@/components/maps/bolivia-cluster-map").then((m) => m.BoliviaClusterMap),
  {
    ssr: false,
    loading: () => (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Mapa del Storage Cluster</CardTitle>
          <CardDescription>Estado geográfico de los nodos de almacenamiento</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </CardContent>
      </Card>
    ),
  }
);

export function BoliviaClusterMapLoader() {
  return <BoliviaClusterMap />;
}
