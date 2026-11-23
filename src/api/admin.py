
import os
from flask_admin import Admin, AdminIndexView, expose
from .models import db, User, Order, Subscriber, Admins, Contact, EventParticipant, Event, InformationRequest, Reservation, RetreatDetails, Photo
from flask_admin.contrib.sqla import ModelView
from flask_wtf import FlaskForm
from wtforms import FloatField, StringField, SelectField, IntegerField
from wtforms_sqlalchemy.fields import QuerySelectField
from flask_login import current_user
from flask import abort, redirect, url_for
from api.config import Config



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

    can_delete = False
    action_disallowed_list = ['delete']
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
    form_columns = [
        'room_type_1_name',
        'room_type_1_price',
        'room_type_2_name',
        'room_type_2_price',
        'event'
    ]

    form_extra_fields = {
    'room_type_1_price': FloatField('Precio habitación 1'),
    'room_type_2_price': FloatField('Precio habitación 2'),
    'event': QuerySelectField(
        'Evento',
        query_factory=lambda: db.session.query(Event).all(),
        get_label='name',
        allow_blank=False
        )
    }

    def on_model_change(self, form, model, is_created):
        model.event = form.event.data


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
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

    admin = Admin(
        app,
        name='The Womens Ground Admin Panel',
        template_mode='bootstrap3',
        index_view=SecureAdminIndexView()
    )

    
    # admin.add_view(SecureModelView(Admins, db.session))

    admin.add_view(SecureUserView(User, db.session))

    admin.add_view(ReadOnlyView(Order, db.session))
    admin.add_view(ReadOnlyView(Subscriber, db.session))

    admin.add_view(ReadStatusView(EventParticipant, db.session))
    admin.add_view(ReadStatusView(Contact, db.session))
    admin.add_view(ReadStatusView(InformationRequest, db.session))

    admin.add_view(EventView(Event, db.session))
    admin.add_view(ReadOnlyView(Reservation, db.session))
    admin.add_view(RetreatDetailsView(RetreatDetails, db.session))
    admin.add_view(PhotoView(Photo, db.session))


