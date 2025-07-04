"""Add Admin model

Revision ID: 50a68f0edebc
Revises: 9bf0702bd7a0
Create Date: 2025-06-24 18:08:02.245196

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '50a68f0edebc'
down_revision = '9bf0702bd7a0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('admins',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=120), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('title', sa.String(length=100), nullable=True),
    sa.Column('department', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.drop_table('admin')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('admin',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('email', sa.VARCHAR(length=120), autoincrement=False, nullable=False),
    sa.Column('password', sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('title', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.Column('department', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('admin_pkey')),
    sa.UniqueConstraint('email', name=op.f('admin_email_key'), postgresql_include=[], postgresql_nulls_not_distinct=False)
    )
    op.drop_table('admins')
    # ### end Alembic commands ###
