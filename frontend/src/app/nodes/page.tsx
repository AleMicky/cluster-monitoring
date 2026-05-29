"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { nodesApi } from "@/lib/api";
import { DEPARTMENTS, formatBytes, formatPercent } from "@/lib/utils";
import type { StorageNode, StorageNodeCreate, StorageNodeUpdate } from "@/types";

const emptyForm: StorageNodeCreate = {
  name: "",
  department: "La Paz",
  hostname: "",
  ip_address: "",
  prometheus_job: "storage-nodes",
};

export default function NodesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingNode, setEditingNode] = useState<StorageNode | null>(null);
  const [form, setForm] = useState<StorageNodeCreate>(emptyForm);

  const { data: nodes, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["nodes"],
    queryFn: nodesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: nodesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setDialogOpen(false);
      setForm(emptyForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StorageNodeUpdate }) => nodesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setDialogOpen(false);
      setEditingNode(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: nodesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditingNode(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (node: StorageNode) => {
    setEditingNode(node);
    setForm({
      name: node.name,
      department: node.department,
      hostname: node.hostname,
      ip_address: node.ip_address,
      prometheus_job: node.prometheus_job,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNode) {
      updateMutation.mutate({ id: editingNode.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Nodos"
        description="Infraestructura de almacenamiento por departamento — gestión completa"
        badge="9 regiones"
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo nodo
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="glass-panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Hostname</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes?.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium text-cyan-300/90">{node.name}</TableCell>
                  <TableCell>{node.department}</TableCell>
                  <TableCell>{node.hostname}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{node.ip_address}</TableCell>
                  <TableCell>
                    <StatusBadge value={node.status} />
                  </TableCell>
                  <TableCell>{formatBytes(node.total_capacity_bytes || 0)}</TableCell>
                  <TableCell>{formatPercent(node.usage_percent || 0)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/nodes/${node.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(node)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(node.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNode ? "Editar nodo" : "Nuevo nodo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="storage-lpz-01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <select
                id="department"
                className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                value={form.hostname}
                onChange={(e) => setForm({ ...form, hostname: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">Dirección IP</Label>
              <Input
                id="ip"
                value={form.ip_address}
                onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
                placeholder="10.10.1.10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job">Prometheus Job</Label>
              <Input
                id="job"
                value={form.prometheus_job}
                onChange={(e) => setForm({ ...form, prometheus_job: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingNode ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            ¿Estás seguro de eliminar este nodo? Se eliminarán también sus discos, métricas y alertas.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
