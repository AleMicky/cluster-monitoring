import { api } from "@/lib/api";
import type { MapNode } from "@/types";

export const mapService = {
  getNodes: () => api.get<MapNode[]>("/map/nodes").then((r) => r.data),
};
