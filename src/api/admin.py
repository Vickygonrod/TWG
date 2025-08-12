
import os
from flask_admin import Admin
from .models import db, User, Order, Subscriber, Admins, Contact, EventParticipant, Event, InformationRequest, Reservation, RetreatDetails, Photo
from flask_admin.contrib.sqla import ModelView
from api.config import Config


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='4Geeks Admin', template_mode='bootstrap3')

    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Order, db.session))
    admin.add_view(ModelView(Subscriber, db.session))
    admin.add_view(ModelView(EventParticipant, db.session))
    admin.add_view(ModelView(Admins, db.session))
    admin.add_view(ModelView(Contact, db.session))
    admin.add_view(ModelView(Event, db.session))
    admin.add_view(ModelView(InformationRequest, db.session))
    admin.add_view(ModelView(Reservation, db.session))
    admin.add_view(ModelView(RetreatDetails, db.session))
    admin.add_view(ModelView(Photo, db.session))

