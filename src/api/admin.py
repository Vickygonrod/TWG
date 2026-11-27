
import os
from flask_admin import Admin, AdminIndexView, expose
from sqlalchemy.orm import configure_mappers
from .models import db, User, Order, Subscriber, Admins, Contact, EventParticipant, Event, InformationRequest, Reservation, RetreatDetails, Photo, RetreatRoom, RetreatPaymentOption, ReservationPayment
from flask_admin.contrib.sqla import ModelView
from flask_wtf import FlaskForm
from wtforms import FloatField, StringField, SelectField, IntegerField, DecimalField, BooleanField, TextAreaField
from wtforms_sqlalchemy.fields import QuerySelectField
from flask_login import current_user
from flask import abort, redirect, url_for
from api.config import Config
from decimal import Decimal
from wtforms.validators import InputRequired, NumberRange



class SecureAdminIndexView(AdminIndexView):
    @expose("/")
    def index(self):
        if not self.is_accessible():
            return self.inaccessible_callback("index")
        
        self._template = 'admin/index.html'
        return super().index()

    def is_accessible(self):
        return (
            current_user.is_authenticated
            and isinstance(current_user._get_current_object(), Admins)
            and current_user.is_active
        )

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin_login_page'))


class SecureModelView(ModelView):
    form_base_class = FlaskForm

    can_delete = True
    can_export = True
    export_types = ['csv']

    def is_accessible(self):
        return (
            current_user.is_authenticated
            and isinstance(current_user._get_current_object(), Admins)
            and current_user.is_active
        )

    def inaccessible_callback(self, name, **kwargs):
        abort(403)

class SecureUserView(SecureModelView):
    # Nunca mostrar el hash de contraseña
    column_exclude_list = ['_password']
    column_export_exclude_list = ['_password']
    form_excluded_columns = ['_password']

    # Evitar que se editen contraseñas desde Flask-Admin
    # hasta implementar un formulario específico.
    can_create = False

class ReadOnlyView(SecureModelView):
    can_create = False
    can_edit = False


class ReadStatusView(SecureModelView):
    can_create = False
    form_columns = ['is_read']


class EventView(SecureModelView):
    form_excluded_columns = [
        'participants',
        'reservations',
        'information_requests',
        'retreat_details',
        'photos'
    ]


class RetreatDetailsView(SecureModelView):

    column_list = [
        'event',
        'house_name',
        'duration_days',
        'nights',
        'end_date'
    ]

    form_columns = [
        'event',
        'end_date',
        'duration_days',
        'nights',
        'house_name',
        'house_description',
        'house_address'
    ]

    column_labels = {
        'event': 'Evento',
        'end_date': 'Fecha de finalización',
        'duration_days': 'Duración en días',
        'nights': 'Número de noches',
        'house_name': 'Nombre del alojamiento',
        'house_description': 'Descripción del alojamiento',
        'house_address': 'Dirección del alojamiento'
    }

    form_extra_fields = {
        'event': QuerySelectField(
            'Evento',
            query_factory=lambda: db.session.query(Event).all(),
            get_label='name',
            allow_blank=False
        )
    }

    def on_model_change(self, form, model, is_created):
        model.event = form.event.data

class RetreatRoomView(SecureModelView):

    column_list = [
        'retreat',
        'name',
        'slug',
        'capacity',
        'room_count',
        'total_spots',
        'is_active',
        'priority_order'
    ]

    column_searchable_list = [
        'name',
        'slug'
    ]

    column_filters = [
        'is_active',
        'capacity',
        'private_bathroom'
    ]

    column_default_sort = ('priority_order', False)

    form_columns = [
        'retreat',
        'slug',
        'name',
        'subtitle',
        'description',
        'capacity',
        'room_count',
        'bed_type',
        'private_bathroom',
        'image_url',
        'second_image_url',
        'third_image_url',
        'is_active',
        'priority_order'
    ]

    column_labels = {
        'retreat': 'Retiro',
        'slug': 'Identificador URL',
        'name': 'Nombre',
        'subtitle': 'Subtítulo',
        'description': 'Descripción',
        'capacity': 'Personas por habitación',
        'room_count': 'Número de habitaciones',
        'total_spots': 'Plazas totales',
        'bed_type': 'Tipo de cama',
        'private_bathroom': 'Baño privado',
        'image_url': 'Foto principal',
        'second_image_url': 'Segunda foto',
        'third_image_url': 'Tercera foto',
        'is_active': 'Visible',
        'priority_order': 'Orden'
    }

    form_choices = {
        'slug': [
            ('private', 'Habitación privada'),
            ('double', 'Habitación doble'),
            ('shared', 'Habitación compartida')
        ]
    }

    form_extra_fields = {
        'retreat': QuerySelectField(
            'Retiro',
            query_factory=lambda: db.session.query(
                RetreatDetails
            ).all(),
            get_label=lambda retreat: retreat.event.name,
            allow_blank=False
        )
    }


class RetreatPaymentOptionView(SecureModelView):

    column_list = [
        'room',
        'name',
        'installments',
        'total_price',
        'currency',
        'is_active'
    ]

    column_filters = [
        'room',
        'installments',
        'is_active'
    ]

    form_columns = [
        'room',
        'name',
        'installments',
        'price_euros',
        'currency',
        'interval_months',
        'stripe_price_id',
        'checkout_url',
        'is_active'
    ]

    column_labels = {
        'room': 'Habitación',
        'name': 'Modalidad de pago',
        'installments': 'Número de cuotas',
        'total_price': 'Precio total',
        'currency': 'Moneda',
        'interval_months': 'Meses entre cuotas',
        'stripe_price_id': 'Stripe Price ID',
        'checkout_url': 'Enlace de pago',
        'is_active': 'Activo'
    }

    column_formatters = {
        'total_price': lambda v, c, m, p: (
            f'{m.total_price / 100:.2f} {m.currency}'
        )
    }

    form_extra_fields = {

        'price_euros': DecimalField(
            'Precio total en euros',
            places=2,
            validators=[
                InputRequired(),
                NumberRange(min=Decimal('0.01'))
            ]
        ),

        'installments': SelectField(
            'Número de cuotas',
            choices=[
                (1, 'Pago único'),
                (2, 'Dos cuotas'),
                (3, 'Tres cuotas')
            ],
            coerce=int
        ),

        'room': QuerySelectField(
            'Habitación',
            query_factory=lambda: db.session.query(
                RetreatRoom
            ).all(),
            get_label=lambda room: (
                f'{room.retreat.event.name} - {room.name}'
            ),
            allow_blank=False
        )
    }

    def on_form_prefill(self, form, id):
        model = self.get_one(id)

        form.price_euros.data = (
            Decimal(model.total_price) / Decimal(100)
        )

    def on_model_change(self, form, model, is_created):

        model.total_price = int(
            (form.price_euros.data * 100).quantize(
                Decimal('1')
            )
        )

class ReservationView(ReadOnlyView):

    column_list = [
        'customer_name',
        'customer_email',
        'event',
        'retreat_room',
        'participants_count',
        'total_amount',
        'amount_paid',
        'remaining_amount',
        'installments',
        'payment_status',
        'status',
        'created_at'
    ]

    column_searchable_list = [
        'customer_name',
        'customer_email'
    ]

    column_filters = [
        'event',
        'retreat_room',
        'payment_status',
        'status',
        'created_at'
    ]

    column_default_sort = ('created_at', True)

    column_labels = {
        'customer_name': 'Nombre',
        'customer_email': 'Email',
        'event': 'Evento',
        'retreat_room': 'Habitación',
        'participants_count': 'Participantes',
        'total_amount': 'Importe total',
        'amount_paid': 'Importe pagado',
        'remaining_amount': 'Importe pendiente',
        'installments': 'Número de cuotas',
        'payment_status': 'Estado del pago',
        'status': 'Estado de la reserva',
        'created_at': 'Fecha de reserva'
    }

    column_formatters = {
        field: (
            lambda v, c, m, p, field=field:
            f'{getattr(m, field) / 100:.2f} {m.currency or "EUR"}'
            if getattr(m, field) is not None
            else '—'
        )
        for field in [
            'total_amount',
            'amount_paid',
            'remaining_amount'
        ]
    }

class ReservationPaymentView(ReadOnlyView):

    column_list = [
        'reservation',
        'installment_number',
        'amount',
        'currency',
        'status',
        'due_date',
        'paid_at'
    ]

    column_filters = [
        'status',
        'installment_number',
        'due_date',
        'paid_at'
    ]

    column_default_sort = ('due_date', False)

    column_labels = {
        'reservation': 'Reserva',
        'installment_number': 'Número de cuota',
        'amount': 'Importe',
        'currency': 'Moneda',
        'status': 'Estado',
        'due_date': 'Fecha de vencimiento',
        'paid_at': 'Fecha de pago'
    }

    column_formatters = {
        'amount': lambda v, c, m, p: (
            f'{m.amount / 100:.2f} {m.currency}'
        )
    }

class PhotoView(SecureModelView):
    form_columns = [
        'url',
        'event'
    ]

    form_extra_fields = {
        'event': QuerySelectField(
            'Evento',
            query_factory=lambda: db.session.query(Event).all(),
            get_label='name',
            allow_blank=False
        )
    }

    def on_model_change(self, form, model, is_created):
        model.event = form.event.data


def setup_admin(app):

    configure_mappers()

    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

    admin = Admin(
        app,
        name='The Womens Ground Admin Panel',
        template_mode='bootstrap3',
        index_view=SecureAdminIndexView()
    )

    # USUARIOS

    admin.add_view(SecureUserView(
        User, db.session,
        name='Usuarios',
        category='Comunidad'
    ))

    admin.add_view(ReadOnlyView(
        Subscriber, db.session,
        name='Suscriptores',
        category='Comunidad'
    ))

    # COMUNICACIONES

    admin.add_view(ReadStatusView(
        Contact, db.session,
        name='Mensajes',
        category='Comunicaciones'
    ))

    admin.add_view(ReadStatusView(
        InformationRequest, db.session,
        name='Solicitudes de información',
        category='Comunicaciones'
    ))

    # EVENTOS

    admin.add_view(EventView(
        Event, db.session,
        name='Eventos',
        category='Eventos'
    ))

    admin.add_view(ReadStatusView(
        EventParticipant, db.session,
        name='Participantes',
        category='Eventos'
    ))

    admin.add_view(PhotoView(
        Photo, db.session,
        name='Fotografías',
        category='Eventos'
    ))

    # RETIROS

    admin.add_view(RetreatDetailsView(
        RetreatDetails, db.session,
        name='Detalles del retiro',
        category='Retiros'
    ))

    admin.add_view(RetreatRoomView(
        RetreatRoom, db.session,
        name='Habitaciones',
        category='Retiros'
    ))

    admin.add_view(RetreatPaymentOptionView(
        RetreatPaymentOption, db.session,
        name='Modalidades de pago',
        category='Retiros'
    ))

    # RESERVAS Y PAGOS

    admin.add_view(ReservationView(
        Reservation, db.session,
        name='Reservas',
        category='Ventas'
    ))

    admin.add_view(ReservationPaymentView(
        ReservationPayment, db.session,
        name='Cuotas',
        category='Ventas'
    ))

    admin.add_view(ReadOnlyView(
        Order, db.session,
        name='Pedidos',
        category='Ventas'
    ))

    
    