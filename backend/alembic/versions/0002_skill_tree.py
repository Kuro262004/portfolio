"""skill tree: parent + earned-in-project links

Revision ID: 0002
Revises: 0001
"""
import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The old flat skill list can't express a tree; it is replaced by the seed on next start.
    op.execute("DELETE FROM skills")
    with op.batch_alter_table("skills") as batch:
        batch.add_column(sa.Column("description", sa.String(300), nullable=False, server_default=""))
        batch.add_column(sa.Column("parent_id", sa.Integer, nullable=True))
        batch.add_column(sa.Column("project_id", sa.Integer, nullable=True))
        batch.create_foreign_key("fk_skills_parent", "skills", ["parent_id"], ["id"], ondelete="SET NULL")
        batch.create_foreign_key("fk_skills_project", "projects", ["project_id"], ["id"], ondelete="SET NULL")


def downgrade() -> None:
    with op.batch_alter_table("skills") as batch:
        batch.drop_constraint("fk_skills_project", type_="foreignkey")
        batch.drop_constraint("fk_skills_parent", type_="foreignkey")
        batch.drop_column("project_id")
        batch.drop_column("parent_id")
        batch.drop_column("description")
