"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-05-28

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "storage_nodes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("department", sa.String(length=100), nullable=False),
        sa.Column("hostname", sa.String(length=255), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=False),
        sa.Column("prometheus_job", sa.String(length=100), nullable=False),
        sa.Column("status", sa.Enum("UP", "DOWN", name="node_status"), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "storage_disks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.Integer(), nullable=False),
        sa.Column("device_name", sa.String(length=50), nullable=False),
        sa.Column("mount_point", sa.String(length=255), nullable=False),
        sa.Column("filesystem", sa.String(length=50), nullable=False),
        sa.Column("disk_type", sa.Enum("HDD", "SSD", "NVME", name="disk_type"), nullable=False),
        sa.Column("total_bytes", sa.BigInteger(), nullable=False),
        sa.Column("used_bytes", sa.BigInteger(), nullable=False),
        sa.Column("free_bytes", sa.BigInteger(), nullable=False),
        sa.Column("usage_percent", sa.Float(), nullable=False),
        sa.Column("health_status", sa.Enum("HEALTHY", "WARNING", "CRITICAL", name="health_status"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["node_id"], ["storage_nodes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "metric_snapshots",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.Integer(), nullable=False),
        sa.Column("cpu_usage_percent", sa.Float(), nullable=False),
        sa.Column("memory_usage_percent", sa.Float(), nullable=False),
        sa.Column("disk_usage_percent", sa.Float(), nullable=False),
        sa.Column("total_capacity_bytes", sa.BigInteger(), nullable=False),
        sa.Column("used_capacity_bytes", sa.BigInteger(), nullable=False),
        sa.Column("free_capacity_bytes", sa.BigInteger(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["node_id"], ["storage_nodes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.Integer(), nullable=False),
        sa.Column("disk_id", sa.Integer(), nullable=True),
        sa.Column(
            "type",
            sa.Enum("NODE_DOWN", "DISK_USAGE", "CPU_USAGE", "MEMORY_USAGE", name="alert_type"),
            nullable=False,
        ),
        sa.Column("severity", sa.Enum("INFO", "WARNING", "CRITICAL", name="alert_severity"), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("ACTIVE", "RESOLVED", name="alert_status"), nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["disk_id"], ["storage_disks.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["node_id"], ["storage_nodes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("metric_snapshots")
    op.drop_table("storage_disks")
    op.drop_table("storage_nodes")
    op.execute("DROP TYPE IF EXISTS alert_status")
    op.execute("DROP TYPE IF EXISTS alert_severity")
    op.execute("DROP TYPE IF EXISTS alert_type")
    op.execute("DROP TYPE IF EXISTS health_status")
    op.execute("DROP TYPE IF EXISTS disk_type")
    op.execute("DROP TYPE IF EXISTS node_status")
