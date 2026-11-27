from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
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


class Admins(UserMixin, db.Model): # Cambiado de Admins a Admin (singular, más convencional para un modelo)
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

class RetreatDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    event_id = db.Column(
        db.Integer,
        db.ForeignKey('event.id'),
        unique=True,
        nullable=False
    )

    # Información general del retiro
    end_date = db.Column(db.DateTime, nullable=True)
    duration_days = db.Column(db.Integer, nullable=True)
    nights = db.Column(db.Integer, nullable=True)

    # Información de la casa
    house_name = db.Column(db.String(255), nullable=True)
    house_description = db.Column(db.Text, nullable=True)
    house_address = db.Column(db.String(500), nullable=True)

    # Campos antiguos (compatibilidad)
    room_type_1_name = db.Column(db.String(255), nullable=True)
    room_type_1_price = db.Column(db.Float, nullable=True)
    room_type_2_name = db.Column(db.String(255), nullable=True)
    room_type_2_price = db.Column(db.Float, nullable=True)

    # Relación con las habitaciones
    rooms = db.relationship(
        'RetreatRoom',
        backref='retreat',
        lazy=True
    )

    def __repr__(self):
        return f'<RetreatDetails for Event ID: {self.event_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "duration_days": self.duration_days,
            "nights": self.nights,
            "house_name": self.house_name,
            "house_description": self.house_description,

            # Compatibilidad
            "room_type_1_name": self.room_type_1_name,
            "room_type_1_price": self.room_type_1_price,
            "room_type_2_name": self.room_type_2_name,
            "room_type_2_price": self.room_type_2_price,

            "rooms": [
                room.serialize()
                for room in self.rooms
                if room.is_active
            ]
        }

class RetreatRoom(db.Model):
    __tablename__ = 'retreat_rooms'

    id = db.Column(db.Integer, primary_key=True)

    retreat_id = db.Column(
        db.Integer,
        db.ForeignKey('retreat_details.id'),
        nullable=False
    )

    # Identificador utilizado en las rutas de React
    slug = db.Column(db.String(100), nullable=False)

    name = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)

    # Capacidad por habitación
    capacity = db.Column(db.Integer, nullable=False)

    # Número de habitaciones de este tipo
    room_count = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    # Características
    bed_type = db.Column(db.String(255), nullable=True)
    private_bathroom = db.Column(db.Boolean, nullable=True)

    # Fotografías
    image_url = db.Column(db.String(500), nullable=True)
    second_image_url = db.Column(db.String(500), nullable=True)
    third_image_url = db.Column(db.String(500), nullable=True)

    # Visibilidad y orden
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )

    priority_order = db.Column(
        db.Integer,
        default=999,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relaciones
    payment_options = db.relationship(
        'RetreatPaymentOption',
        backref='room',
        lazy=True
    )

    reservations = db.relationship(
        'Reservation',
        backref='retreat_room',
        lazy=True
    )

    __table_args__ = (
        db.UniqueConstraint(
            'retreat_id',
            'slug',
            name='uq_retreat_room_slug'
        ),
        db.CheckConstraint(
            'capacity > 0',
            name='ck_retreat_room_capacity'
        ),
        db.CheckConstraint(
            'room_count > 0',
            name='ck_retreat_room_count'
        ),
    )

    @property
    def total_spots(self):
        return self.capacity * self.room_count

    def __repr__(self):
        return f'<RetreatRoom {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "retreat_id": self.retreat_id,
            "slug": self.slug,
            "name": self.name,
            "subtitle": self.subtitle,
            "description": self.description,
            "capacity": self.capacity,
            "room_count": self.room_count,
            "total_spots": self.total_spots,
            "bed_type": self.bed_type,
            "private_bathroom": self.private_bathroom,
            "image_url": self.image_url,
            "second_image_url": self.second_image_url,
            "third_image_url": self.third_image_url,
            "is_active": self.is_active,
            "priority_order": self.priority_order,
            "payment_options": [
                option.serialize()
                for option in self.payment_options
                if option.is_active
            ]
        }

class RetreatPaymentOption(db.Model):
    __tablename__ = 'retreat_payment_options'

    id = db.Column(db.Integer, primary_key=True)

    room_id = db.Column(
        db.Integer,
        db.ForeignKey('retreat_rooms.id'),
        nullable=False
    )

    name = db.Column(db.String(255), nullable=False)

    # 1 = pago único
    # 2 = dos cuotas
    # 3 = tres cuotas
    installments = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    # Precio total en céntimos
    total_price = db.Column(db.Integer, nullable=False)

    currency = db.Column(
        db.String(3),
        nullable=False,
        default='EUR'
    )

    # Frecuencia entre pagos
    interval_months = db.Column(
        db.Integer,
        nullable=False,
        default=1
    )

    # Integración con pagos
    stripe_price_id = db.Column(
        db.String(255),
        nullable=True
    )

    checkout_url = db.Column(
        db.String(1000),
        nullable=True
    )

    # Mostrar u ocultar en el frontend
    is_active = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        db.UniqueConstraint(
            'room_id',
            'installments',
            name='uq_room_payment_installments'
        ),
        db.CheckConstraint(
            'installments IN (1, 2, 3)',
            name='ck_payment_installments'
        ),
        db.CheckConstraint(
            'total_price > 0',
            name='ck_payment_total_price'
        ),
        db.CheckConstraint(
            'interval_months > 0',
            name='ck_payment_interval'
        ),
    )

    @property
    def installment_amounts(self):
        base, remainder = divmod(
            self.total_price,
            self.installments
        )

        return (
            [base] * (self.installments - 1)
            + [base + remainder]
        )

    def __repr__(self):
        return f'<RetreatPaymentOption {self.name}>'

    def serialize(self):
        return {
            "id": self.id,
            "room_id": self.room_id,
            "name": self.name,
            "installments": self.installments,
            "total_price": self.total_price,
            "installment_amounts": self.installment_amounts,
            "currency": self.currency,
            "interval_months": self.interval_months,
            "is_active": self.is_active
        }
# Modelo de Evento modificado
class Event(db.Model):
    # Sin __tablename__, SQLAlchemy usará el nombre por defecto 'event'.
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)
    short_description = db.Column(db.String(500), nullable=True)
    long_description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    max_participants = db.Column(db.Integer, nullable=True)
    current_participants = db.Column(db.Integer, default=0, nullable=False)
    event_type = db.Column(db.String(50), nullable=False, default='pagado')
    price_1 = db.Column(db.Float, nullable=True)
    price_2 = db.Column(db.Float, nullable=True)
    price_3 = db.Column(db.Float, nullable=True)
    price_4 = db.Column(db.Float, nullable=True)
    price_5 = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    second_image_url = db.Column(db.String(500), nullable=True)
    third_image_url = db.Column(db.String(500), nullable=True)
    fourth_image_url = db.Column(db.String(500), nullable=True)
    fifth_image_url = db.Column(db.String(500), nullable=True)
    priority_order = db.Column(db.Integer, default=999, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    stripe_price_id = db.Column(db.String(255), nullable=True, default=None)
    mailerlite_group_id = db.Column(db.String(255), nullable=True)

    # Relación con RetreatDetails (uno a uno)
    retreat_details = db.relationship('RetreatDetails', backref='event', uselist=False)

    # Relación con los participantes y reservas
    participants = db.relationship('EventParticipant', backref='event', lazy=True)
    reservations = db.relationship('Reservation', backref='event', lazy=True)
    
    # --- AÑADIDO: Relación con las fotos ---
    photos = db.relationship('Photo', backref='event', lazy=True)

    def __repr__(self):
        return f'<Event {self.name} - {self.date} - Type: {self.event_type}>'

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
            "event_type": self.event_type,
            "price_1": self.price_1,
            "price_2": self.price_2,
            "price_3": self.price_3,
            "price_4": self.price_4,
            "price_5": self.price_5,
            "is_active": self.is_active,
            "image_url": self.image_url,
            "second_image_url": self.second_image_url,
            "third_image_url": self.third_image_url,
            "fourth_image_url": self.fourth_image_url,
            "fifth_image_url": self.fifth_image_url,
            "priority_order": self.priority_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "retreat_details": self.retreat_details.serialize() if self.retreat_details else None,
            "photos": [photo.serialize() for photo in self.photos],
            "stripe_price_id": self.stripe_price_id,
            "mailerlite_group_id": self.mailerlite_group_id
        }


# --- NUEVO MODELO Photo (para almacenar las URLs) ---
class Photo(db.Model):
    __tablename__ = 'photos'
    id = db.Column(db.Integer, primary_key=True)
    # `db.ForeignKey('event.id')` apunta al id de la tabla 'event'
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Photo {self.id} for Event {self.event_id}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "url": self.url,
            "event_id": self.event_id,
            "created_at": self.created_at.isoformat()
        }


# Nuevo modelo para manejar las reservas del formulario que creamos
class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stripe_checkout_session_id = db.Column(db.String(255), nullable=True) # ID de la sesión de Stripe
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    customer_name = db.Column(db.String(120), nullable=False) # Renombrado de 'name'
    customer_email = db.Column(db.String(120), nullable=False) # Renombrado de 'email'
    phone = db.Column(db.String(20), nullable=True) # Mantienes el campo
    participants_count = db.Column(db.Integer, nullable=False, default=1) # Mantienes el campo
    amount_paid = db.Column(db.Integer, nullable=True) # Cantidad pagada
    currency = db.Column(db.String(10), nullable=True) # Moneda del pago
    payment_status = db.Column(db.String(50), default='pending') # Estado del pago en Stripe
    status = db.Column(db.String(50), default='pending') # Estado de la reserva
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    retreat_room_id = db.Column(db.Integer, db.ForeignKey('retreat_rooms.id'), nullable=True)
    payment_option_id = db.Column(db.Integer, db.ForeignKey('retreat_payment_options.id'), nullable=True)
    total_amount = db.Column(db.Integer, nullable=True)
    installments = db.Column(db.Integer, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True) # Fecha de expiración del bloqueo temporal de plaza
    confirmed_at = db.Column(db.DateTime, nullable=True)  # Fecha de confirmación
    stripe_customer_id = db.Column(db.String(255), nullable=True)     # Identificadores adicionales de Stripe
    stripe_subscription_id = db.Column(db.String(255),nullable=True)
    payment_option = db.relationship('RetreatPaymentOption') # Relaciones
    payments = db.relationship('ReservationPayment', backref='reservation', lazy=True)
    how_did_you_hear = db.Column(db.String(255), nullable=True)
    artistic_expression = db.Column(db.Text, nullable=True)
    why_interested = db.Column(db.Text, nullable=True)
    comments = db.Column(db.Text, nullable=True)

    # Consentimientos opcionales
    subscribe_to_newsletter = db.Column(
        db.Boolean, nullable=False, default=False,
        server_default="false"
    )

    consent_for_image = db.Column(
        db.Boolean, nullable=False, default=False,
        server_default="false"
    )

    health_consent_at = db.Column(db.DateTime, nullable=True)
    health_consent_version = db.Column(db.String(50), nullable=True)

    # Condiciones de reserva
    terms_accepted_at = db.Column(db.DateTime, nullable=True)
    terms_version = db.Column(db.String(50), nullable=True)

    language = db.Column(db.String(10), nullable=True)

    @property
    def remaining_amount(self):
        if self.total_amount is None:
            return None

        return max(
            0,
            self.total_amount - (self.amount_paid or 0)
        )

    def __repr__(self):
        return f'<Reservation {self.customer_name} for Event ID: {self.event_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "stripe_checkout_session_id": self.stripe_checkout_session_id,
            "event_id": self.event_id,
            "customer_name": self.customer_name,
            "customer_email": self.customer_email,
            "phone": self.phone,
            "participants_count": self.participants_count,
            "amount_paid": self.amount_paid,
            "currency": self.currency,
            "payment_status": self.payment_status,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "retreat_room_id": self.retreat_room_id,
            "payment_option_id": self.payment_option_id,
            "total_amount": self.total_amount,
            "installments": self.installments,
            "remaining_amount": self.remaining_amount,
            "confirmed_at": (
                self.confirmed_at.isoformat()
                if self.confirmed_at else None
            ),  
        }

class ReservationPayment(db.Model):
    __tablename__ = 'reservation_payments'

    id = db.Column(db.Integer, primary_key=True)

    reservation_id = db.Column(
        db.Integer,
        db.ForeignKey('reservation.id'),
        nullable=False
    )

    installment_number = db.Column(
        db.Integer,
        nullable=False
    )

    amount = db.Column(
        db.Integer,
        nullable=False
    )

    currency = db.Column(
        db.String(3),
        default='EUR',
        nullable=False
    )

    # pending, paid, failed, cancelled, refunded
    status = db.Column(
        db.String(50),
        default='pending',
        nullable=False
    )

    due_date = db.Column(
        db.DateTime,
        nullable=True
    )

    paid_at = db.Column(
        db.DateTime,
        nullable=True
    )

    stripe_payment_intent_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True
    )

    stripe_invoice_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    __table_args__ = (
        db.UniqueConstraint(
            'reservation_id',
            'installment_number',
            name='uq_reservation_installment'
        ),
        db.CheckConstraint(
            'amount > 0',
            name='ck_reservation_payment_amount'
        ),
        db.CheckConstraint(
            'installment_number > 0',
            name='ck_reservation_installment_number'
        ),
    )

    def __repr__(self):
        return (
            f'<ReservationPayment '
            f'{self.reservation_id} - '
            f'Cuota {self.installment_number}>'
        )

    def serialize(self):
        return {
            "id": self.id,
            "reservation_id": self.reservation_id,
            "installment_number": self.installment_number,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "due_date": (
                self.due_date.isoformat()
                if self.due_date else None
            ),
            "paid_at": (
                self.paid_at.isoformat()
                if self.paid_at else None
            )
        }

# Modelos que no cambian, por conveniencia los dejo.
class EventParticipant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    how_did_you_hear = db.Column(db.String(255), nullable=True)
    artistic_expression = db.Column(db.String(255), nullable=True)
    why_interested = db.Column(db.Text, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    image_conset = db.Column(db.Boolean, default=False, nullable=True)
    price_paid = db.Column(db.Float, nullable=True)
    payment_status = db.Column(db.String(50), default='pending')
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
            "image_conset": self.image_conset,
            "price_paid": self.price_paid,
            "payment_status": self.payment_status,
            "registration_date": self.registration_date.isoformat() if self.registration_date else None,
            "is_read": self.is_read
        }

class InformationRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Relaciona la solicitud con un evento específico
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    comments = db.Column(db.Text, nullable=True)
    # Para saber cuándo se hizo la solicitud
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Para que el administrador sepa si la solicitud ya ha sido revisada
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    # Relación de vuelta para acceder a los datos del evento desde la solicitud
    event = db.relationship('Event', backref='information_requests', lazy=True)

    def __repr__(self):
        return f'<InformationRequest {self.name} for Event ID: {self.event_id}>'

    def serialize(self):
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "comments": self.comments,
            "created_at": self.created_at.isoformat() if self.created_at else None,
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