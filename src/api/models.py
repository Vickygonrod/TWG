from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stripe_checkout_session_id = db.Column(
        db.String(255), unique=True, nullable=False)
    customer_email = db.Column(db.String(255), nullable=False)
    # A veces Stripe no devuelve el nombre completo
    customer_name = db.Column(db.String(255), nullable=True)
    product_name = db.Column(db.String(255), nullable=False)
    # Cantidad en centavos
    amount_total = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    # 'paid', 'unpaid', 'no_payment_required'
    payment_status = db.Column(db.String(50), nullable=False)
    # 'pending_delivery', 'delivered', 'failed'
    order_status = db.Column(db.String(50), default='pending_delivery')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
    db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Order {self.id} - {self.customer_email} - {self.payment_status}>"


# --- Model for subscribers ---
class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(120), nullable=True)
    last_name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Subscriber {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

# --- Event Registrations ---
class EventRegistration(db.Model):
    __tablename__ = 'event_registrations' # Table name in the database
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=False, nullable=False) # Not unique, one person can register for multiple events
    event_name = db.Column(db.String(120), nullable=False)
    how_did_you_hear = db.Column(db.String(255), nullable=True) # E.g., "Social Media", "Friend"
    artistic_expression = db.Column(db.String(255), nullable=True) # E.g., "Painting", "Writing"
    why_interested = db.Column(db.Text, nullable=True) # Longer text field for motivations
    comments = db.Column(db.Text, nullable=True) # Additional comments
    registration_date = db.Column(db.DateTime, default=db.func.now(), nullable=False) # Auto-set timestamp

    def __repr__(self):
        return f'<EventRegistration {self.full_name} - {self.event_name}>'

    def serialize(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "event_name": self.event_name,
            "how_did_you_hear": self.how_did_you_hear,
            "artistic_expression": self.artistic_expression,
            "why_interested": self.why_interested,
            "comments": self.comments,
            "registration_date": self.registration_date.isoformat() if self.registration_date else None
        }