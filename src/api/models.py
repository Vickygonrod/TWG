from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Cambiamos 'password' a '_password' para la propiedad segura
    _password = db.Column("password", db.String(255), unique=False, nullable=False) # Guardará el hash
    is_active = db.Column(db.Boolean(), unique=False, nullable=False, default=True) # Añadido default
    name = db.Column(db.String(100), unique=False, nullable=True) # Asumo un límite de 100 caracteres
    lastname = db.Column(db.String(100), unique=False, nullable=True) # Asumo un límite de 100 caracteres
    
    def __repr__(self):
        return f'<User {self.email}>'

    # Propiedad para establecer la contraseña (la hashea automáticamente)
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)

    # Método para verificar la contraseña
    def verify_password(self, password):
        return check_password_hash(self._password, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "lastname": self.lastname,
            "is_active": self.is_active
            # NO SERIALIZAR LA CONTRASEÑA POR SEGURIDAD
        }


class Admins(db.Model): # Cambiado de Admins a Admin (singular, más convencional para un modelo)
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Cambiamos 'password' a '_password' para la propiedad segura
    _password = db.Column("password", db.String(255), unique=False, nullable=False) # Guardará el hash
    name = db.Column(db.String(100), nullable=True)
    title = db.Column(db.String(100), nullable=True) # Asumo un límite de 100 caracteres
    department = db.Column(db.String(100), nullable=True) # Asumo un límite de 100 caracteres

    def __repr__(self):
        # Es mejor incluir el email en __repr__ para facilitar la depuración
        return f'<Admin {self.email} - {self.name}>' 

    # Propiedad para establecer la contraseña (la hashea automáticamente)
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self._password = generate_password_hash(password)

    # Método para verificar la contraseña
    def verify_password(self, password):
        return check_password_hash(self._password, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # NUNCA SERIALIZAR LA CONTRASEÑA EN EL MÉTODO SERIALIZE DEL MODELO
            "name": self.name,
            "title": self.title,
            "department": self.department
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

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True) # El nombre del evento, único
    short_description = db.Column(db.String(500), nullable=True)
    long_description = db.Column(db.Text, nullable=True) # Usamos Text para descripciones largas
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    max_participants = db.Column(db.Integer, nullable=True)
    # Contador para no tener que contar cada vez que se necesite
    current_participants = db.Column(db.Integer, default=0, nullable=False)
    price_1 = db.Column(db.Float, nullable=True)
    price_2 = db.Column(db.Float, nullable=True)
    price_3 = db.Column(db.Float, nullable=True)
    price_4 = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    priority_order = db.Column(db.Integer, default=999, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación con los participantes (el modelo que modificaremos de EventRegistration)
    participants = db.relationship('EventParticipant', backref='event', lazy=True)

    def __repr__(self):
        return f'<Event {self.name} - {self.date}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "short_description": self.short_description,
            "long_description": self.long_description,
            "date": self.date.isoformat(),
            "location": self.location,
            "max_participants": self.max_participants,
            "current_participants": self.current_participants,
            "price_1": self.price_1,
            "price_2": self.price_2,
            "price_3": self.price_3,
            "price_4": self.price_4,
            "is_active": self.is_active,
            "image_url": self.image_url,
            "priority_order": self.priority_order,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class EventParticipant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Clave foránea que lo relaciona con un evento
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    # En vez de "full_name", mejor name y email, ya que son los que se usarán en el futuro para relacionarlos con los usuarios
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    
    # Mantenemos los campos adicionales que ya tenías
    how_did_you_hear = db.Column(db.String(255), nullable=True)
    artistic_expression = db.Column(db.String(255), nullable=True)
    why_interested = db.Column(db.Text, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    
    # Y añadimos campos nuevos necesarios
    price_paid = db.Column(db.Float, nullable=True) # Para registrar el precio exacto pagado
    payment_status = db.Column(db.String(50), default='pending') # Pagado, pendiente, fallido
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f'<EventParticipant {self.name} - Event ID: {self.event_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "email": self.email,
            "how_did_you_hear": self.how_did_you_hear,
            "artistic_expression": self.artistic_expression,
            "why_interested": self.why_interested,
            "comments": self.comments,
            "price_paid": self.price_paid,
            "payment_status": self.payment_status,
            "registration_date": self.registration_date.isoformat() if self.registration_date else None,
            "is_read": self.is_read
        }

# --- Contact Messages ---

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(250), nullable=True)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False, nullable=False) # <--- AÑADE ESTA LÍNEA

    def __repr__(self):
        return f'<Contact {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat(),
            "is_read": self.is_read # <--- AÑADE ESTA LÍNEA
        }