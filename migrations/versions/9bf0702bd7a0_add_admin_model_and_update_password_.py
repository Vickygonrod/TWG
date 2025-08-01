"""Add Admin model and update password fields

Revision ID: 9bf0702bd7a0
Revises: 3c780174dfbb
Create Date: 2025-06-24 18:04:11.353457

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9bf0702bd7a0'
down_revision = '3c780174dfbb'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('admin',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('title', sa.String(length=100), nullable=True),
    sa.Column('department', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('name', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('lastname', sa.String(length=100), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('lastname')
        batch_op.drop_column('name')

    op.drop_table('admin')
    # ### end Alembic commands ###
