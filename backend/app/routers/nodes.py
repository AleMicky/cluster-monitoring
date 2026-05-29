from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.storage_node_repository import StorageNodeRepository
from app.schemas.metric_snapshot import MetricSnapshotResponse
from app.schemas.storage_disk import StorageDiskResponse
from app.schemas.storage_node import (
    StorageNodeCreate,
    StorageNodeResponse,
    StorageNodeUpdate,
    StorageNodeWithCapacity,
)
from app.services.cluster_service import ClusterService

router = APIRouter(prefix="/nodes", tags=["Nodes"])


@router.get("", response_model=list[StorageNodeWithCapacity])
def list_nodes(db: Session = Depends(get_db)) -> list[StorageNodeWithCapacity]:
    service = ClusterService(db)
    return service.get_nodes_with_capacity()


@router.post("", response_model=StorageNodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(data: StorageNodeCreate, db: Session = Depends(get_db)) -> StorageNodeResponse:
    repo = StorageNodeRepository(db)
    existing = repo.get_by_name(data.name)
    if existing:
        raise HTTPException(status_code=400, detail=f"El nodo '{data.name}' ya existe")
    return repo.create(data)


@router.get("/{node_id}", response_model=StorageNodeWithCapacity)
def get_node(node_id: int, db: Session = Depends(get_db)) -> StorageNodeWithCapacity:
    repo = StorageNodeRepository(db)
    node = repo.get_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    service = ClusterService(db)
    nodes = service.get_nodes_with_capacity()
    for n in nodes:
        if n.id == node_id:
            return n

    raise HTTPException(status_code=404, detail="Nodo no encontrado")


@router.put("/{node_id}", response_model=StorageNodeResponse)
def update_node(
    node_id: int, data: StorageNodeUpdate, db: Session = Depends(get_db)
) -> StorageNodeResponse:
    repo = StorageNodeRepository(db)
    node = repo.get_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    return repo.update(node, data)


@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(node_id: int, db: Session = Depends(get_db)) -> None:
    repo = StorageNodeRepository(db)
    node = repo.get_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    repo.delete(node)


@router.get("/{node_id}/disks", response_model=list[StorageDiskResponse])
def get_node_disks(node_id: int, db: Session = Depends(get_db)) -> list[StorageDiskResponse]:
    repo = StorageNodeRepository(db)
    node = repo.get_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    return node.disks


@router.get("/{node_id}/metrics", response_model=list[MetricSnapshotResponse])
def get_node_metrics(node_id: int, db: Session = Depends(get_db)) -> list[MetricSnapshotResponse]:
    from app.repositories.metric_snapshot_repository import MetricSnapshotRepository

    repo = StorageNodeRepository(db)
    node = repo.get_by_id(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    metric_repo = MetricSnapshotRepository(db)
    return metric_repo.get_history_by_node_id(node_id)
