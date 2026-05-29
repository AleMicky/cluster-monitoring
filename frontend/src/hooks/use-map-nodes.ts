"use client";

import { useQuery } from "@tanstack/react-query";
import { mapService } from "@/services/map.service";

export function useMapNodes() {
  return useQuery({
    queryKey: ["map-nodes"],
    queryFn: mapService.getNodes,
    refetchInterval: 30_000,
  });
}
