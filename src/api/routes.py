"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Subscriber, EventRegistration, Admins, Contact
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.config import Config 
import stripe

from api.services.email_service import send_contact_form_email, add_subscriber_to_mailerlite

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager 

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Carga las variables de entorno para los emails y grupos de MailerLite
YOUR_RECEIVING_EMAIL = os.getenv("YOUR_RECEIVING_EMAIL")
MAILERSEND_SENDER_EMAIL = os.getenv("MAILERSEND_SENDER_EMAIL")
MAILERSEND_SENDER_NAME = os.getenv("MAILERSEND_SENDER_NAME", "Victoria from The Women Ground")

# --- NUEVAS VARIABLES DE ENTORNO PARA GRUPOS DE IDIOMA ---
MAILERLITE_GROUP_ES = os.getenv("MAILERLITE_GROUP_ES") # ID del grupo para suscriptores en español
MAILERLITE_GROUP_EN = os.getenv("MAILERLITE_GROUP_EN") # ID del grupo para suscriptores en inglés
# Opcional: un grupo por defecto si el idioma no se reconoce o no se envía
MAILERLITE_DEFAULT_GROUP_ID = os.getenv("MAILERLITE_DEFAULT_GROUP_ID") 


# Configura la clave secreta de Stripe al inicio
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

@api.route("/adminlogin", methods=["POST"])
def admin_login():
    response_body = {}
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    admin = db.session.execute(db.select(Admins).where(Admins.email == email)).scalar_one_or_none()

    if admin is None:
        return jsonify({"msg": "Email no registrado."}), 401
    
    if not admin.verify_password(password):
        return jsonify({"msg": "Contraseña incorrecta."}), 401
    
    access_token = create_access_token(identity={'admin_id': admin.id, 'email': admin.email})
    
    response_body['message'] = 'Admin logueado con éxito.'
    response_body['access_token'] = access_token
    response_body['data'] = admin.serialize()

    return jsonify(response_body), 200


# ---  ENDPOINT PARA INICIAR EL CHECKOUT DE STRIPE (ACTUALIZADO) ---

@api.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    print("DEBUG: Entrando a create_checkout_session.")
    try:
        data = request.json
        price_id = data.get('price_id')

        if not price_id:
            print("ERROR: No se recibió price_id del frontend.")
            return jsonify(error="Price ID missing"), 400

        allowed_price_ids = [Config.STRIPE_PRICE_ID_ES, Config.STRIPE_PRICE_ID_EN]
        if price_id not in allowed_price_ids:
            print(f"ERROR: Price ID {price_id} no autorizado.")
            return jsonify(error="Unauthorized Price ID"), 403

        print(f"DEBUG: Creando sesión de Stripe para Price ID: {price_id}")

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{Config.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{Config.FRONTEND_URL}/cancel",
            ui_mode='hosted',
            customer_creation='if_required',
            metadata={
                'requested_price_id': price_id,
            }
        )
        print(f"DEBUG: Sesión de Stripe creada, URL: {checkout_session.url}")
        return jsonify({'checkout_url': checkout_session.url}), 200

    except stripe.error.StripeError as e:
        print(f"ERROR STRIPE al crear sesión: {e}")
        return jsonify(error=str(e)), 400
    except Exception as e:
        print(f"ERROR GENERAL en /create-checkout-session: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar su solicitud de pago."), 500


# --- ENDPOINT SEGURO PARA LA DESCARGA DEL EBOOK (ACTUALIZADO) ---

@api.route('/download-ebook', methods=['GET'])
def download_ebook():
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({'error': 'Session ID missing'}), 400

    print(f"DEBUG: Intentando descargar eBook para session_id: {session_id}")
    try:
        session = stripe.checkout.Session.retrieve(session_id, expand=['line_items'])

        if session.payment_status == 'paid' and session.status == 'complete':
            print(f"DEBUG: Sesión {session_id} verificada. Pago completado.")

            purchased_price_id = None
            if session.line_items and len(session.line_items.data) > 0:
                purchased_price_id = session.line_items.data[0].price.id

            ebook_filename = None
            if purchased_price_id == Config.STRIPE_PRICE_ID_ES:
                ebook_filename = 'Juega_a_Crear_Pack_ES.zip'
                print(f"DEBUG: Descarga solicitada para eBook en español: {ebook_filename}")
            elif purchased_price_id == Config.STRIPE_PRICE_ID_EN:
                ebook_filename = 'Play_and_Create_Pack.zip'
                print(f"DEBUG: Descarga solicitada para eBook en inglés: {ebook_filename}")
            else:
                print(f"ERROR: Price ID {purchased_price_id} no reconocido para la descarga.")
                return jsonify({'error': 'Product not recognized for download'}), 404

            downloads_dir = os.path.join(os.path.dirname(__file__), 'downloads')
            full_file_path = os.path.join(downloads_dir, ebook_filename)

            if not os.path.isfile(full_file_path):
                print(f"ERROR: Archivo no encontrado en la ruta: {full_file_path}")
                return jsonify(error="Ebook file not found on server"), 500

            print(f"DEBUG: Sirviendo el archivo: {ebook_filename}")
            return send_from_directory(
                directory=downloads_dir,
                path=ebook_filename,
                as_attachment=True,
                mimetype='application/zip'
            )
        else:
            print(f"ERROR: Sesión {session_id} no válida para descarga. Estado: {session.status}, Pago: {session.payment_status}")
            return jsonify(error="Payment not confirmed for this session"), 403

    except stripe.error.StripeError as e:
        print(f"ERROR STRIPE al verificar sesión para descarga: {e}")
        return jsonify(error="Error verifying payment session."), 500
    except Exception as e:
        print(f"ERROR GENERAL al intentar descargar eBook: {e}")
        return jsonify(error="An unexpected error occurred during download."), 500


# --- ENDPOINT PARA EL FORMULARIO DE CONTACTO ---

@api.route('/contact', methods=['POST'])
def handle_contact_form():
    print("DEBUG: Entrando a handle_contact_form.")
    try:
        data = request.json

        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        message_content = data.get('message')
        subscribe_to_newsletter = data.get('subscribeToNewsletter')
        language = data.get('language') # <-- ¡NUEVO! Obtener el idioma del frontend

        # VALIDACIÓN DE CAMPOS OBLIGATORIOS
        if not all([first_name, last_name, email, message_content]):
            return jsonify(error="Faltan campos obligatorios."), 400

        # --- NUEVA LÓGICA: GUARDAR MENSAJE EN LA BASE DE DATOS ---
        try:
            full_name = f"{first_name} {last_name}"

            new_contact_message = Contact(
                name=full_name,
                email=email,
                message=message_content
            )
            db.session.add(new_contact_message)
            db.session.commit()
            print("DEBUG: Mensaje de contacto guardado en la base de datos exitosamente.")
        except Exception as db_save_e:
            db.session.rollback()
            print(f"ERROR: Fallo al guardar mensaje de contacto en la base de datos: {db_save_e}")

        # --- LÓGICA EXISTENTE: ENVÍO DE EMAIL (notificación al admin) ---
        email_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "message": message_content,
            "subscribe_to_newsletter": subscribe_to_newsletter,
            "language": language # <-- Opcional: pasar el idioma también al email de notificación
        }
        email_subject = f"Nuevo Contacto desde la Web ({language.upper() if language else 'N/A'}): {first_name} {last_name}"

        email_sent = send_contact_form_email(
            to_email=YOUR_RECEIVING_EMAIL,
            from_email=MAILERSEND_SENDER_EMAIL,
            from_name=MAILERSEND_SENDER_NAME,
            subject=email_subject,
            template_data=email_data
        )

        if email_sent:
            print("DEBUG: Email de notificación de contacto enviado con éxito (vía MailerSend).")
        else:
            print("ERROR: Fallo al enviar email de notificación de contacto (vía MailerSend).")

        # --- LÓGICA PARA GESTIÓN DE SUSCRIPCIÓN A NEWSLETTER (EN TU DB Y MAILERLITE) ---
        if subscribe_to_newsletter:
            print(f"DEBUG: Procesando suscripción a newsletter para {email} (Idioma: {language})...")
            
            # --- SELECCIÓN DEL ID DE GRUPO BASADO EN EL IDIOMA ---
            target_group_id = None
            if language == 'es':
                target_group_id = MAILERLITE_GROUP_ES
            elif language == 'en':
                target_group_id = MAILERLITE_GROUP_EN
            else:
                # Si el idioma no se reconoce, puedes usar un grupo por defecto
                print(f"WARNING: Idioma '{language}' no reconocido. Usando grupo por defecto si está configurado.")
                target_group_id = MAILERLITE_DEFAULT_GROUP_ID

            try:
                # 1. Guardar en tu propia base de datos
                existing_subscriber = Subscriber.query.filter_by(email=email).first()
                if existing_subscriber:
                    # Opcional: Actualizar datos si el suscriptor ya existe
                    existing_subscriber.first_name = first_name
                    existing_subscriber.last_name = last_name
                    # Aquí podrías añadir lógica para actualizar el idioma del suscriptor en tu DB si lo guardas
                    db.session.commit()
                    print(f"DEBUG: Email {email} ya suscrito en tu DB. Datos actualizados.")
                else:
                    new_subscriber = Subscriber(
                        first_name=first_name,
                        last_name=last_name,
                        email=email
                        # Aquí podrías añadir un campo 'language' a tu modelo Subscriber si lo necesitas
                    )
                    db.session.add(new_subscriber)
                    db.session.commit()
                    print(f"DEBUG: Nuevo suscriptor añadido a tu DB: {email}")

                # 2. Añadir/Actualizar en MailerLite (solo si tenemos un group_id válido)
                if target_group_id:
                    mailerlite_added = add_subscriber_to_mailerlite(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        group_id=target_group_id # <-- ¡Pasamos el ID de grupo seleccionado!
                    )

                    if mailerlite_added:
                        print(f"DEBUG: Suscriptor {email} añadido/actualizado en MailerLite al grupo {target_group_id}.")
                    else:
                        print(f"ERROR: Fallo al añadir/actualizar suscriptor {email} en MailerLite.")
                else:
                    print("WARNING: No se pudo determinar un ID de grupo de MailerLite válido. Suscriptor no añadido a MailerLite.")

            except Exception as db_e:
                db.session.rollback()
                print(f"ERROR: Fallo al gestionar suscriptor en DB o MailerLite para {email}: {db_e}")

        return jsonify(message="Mensaje recibido con éxito."), 200

    except Exception as e:
        print(f"ERROR GENERAL en /api/contact: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar tu mensaje."), 500


@api.route('/event-registration', methods=['POST'])
def handle_event_registration():
    print("DEBUG: Entrando a handle_event_registration.")
    try:
        data = request.json

        full_name = data.get('fullName')
        email = data.get('email')
        event_name = data.get('eventName')
        how_did_you_hear = data.get('howDidYouHear', None)
        artistic_expression = data.get('artisticExpression', None)
        why_interested = data.get('whyInterested', None)
        comments = data.get('comments', None)
        language = data.get('language') # <-- ¡NUEVO! Obtener el idioma del frontend

        # Validación básica de campos obligatorios
        if not all([full_name, email, event_name]):
            print("ERROR: Missing required fields for event registration.")
            return jsonify(error="Missing required fields: fullName, email, eventName."), 400
        
        # Validación de formato de email simple
        if not '@' in email or not '.' in email:
            print("ERROR: Invalid email format.")
            return jsonify(error="Invalid email format."), 400

        new_registration = EventRegistration(
            full_name=full_name,
            email=email,
            event_name=event_name,
            how_did_you_hear=how_did_you_hear,
            artistic_expression=artistic_expression,
            why_interested=why_interested,
            comments=comments
        )

        db.session.add(new_registration)
        db.session.commit()
        
        print(f"DEBUG: New event registration saved to DB: {new_registration.email} for {new_registration.event_name}")

        # --- LÓGICA PARA GESTIÓN DE SUSCRIPCIÓN A NEWSLETTER DESDE REGISTRO DE EVENTO ---
        # Si el checkbox de suscripción está marcado en el formulario de evento
        if data.get('subscribeToNewsletter'): # Usamos data.get directamente ya que viene del payload
            print(f"DEBUG: Procesando suscripción a newsletter desde registro de evento para {email} (Idioma: {language})...")
            
            # --- SELECCIÓN DEL ID DE GRUPO BASADO EN EL IDIOMA ---
            target_group_id = None
            if language == 'es':
                target_group_id = MAILERLITE_GROUP_ES
            elif language == 'en':
                target_group_id = MAILERLITE_GROUP_EN
            else:
                print(f"WARNING: Idioma '{language}' no reconocido en registro de evento. Usando grupo por defecto si está configurado.")
                target_group_id = MAILERLITE_DEFAULT_GROUP_ID

            try:
                # 1. Guardar en tu propia base de datos (reutilizando la lógica de Subscriber)
                existing_subscriber = Subscriber.query.filter_by(email=email).first()
                if existing_subscriber:
                    existing_subscriber.first_name = full_name.split(' ')[0] if full_name else ''
                    existing_subscriber.last_name = ' '.join(full_name.split(' ')[1:]) if full_name else ''
                    db.session.commit()
                    print(f"DEBUG: Email {email} ya suscrito en tu DB desde registro de evento. Datos actualizados.")
                else:
                    new_subscriber = Subscriber(
                        first_name=full_name.split(' ')[0] if full_name else '',
                        last_name=' '.join(full_name.split(' ')[1:]) if full_name else '',
                        email=email
                    )
                    db.session.add(new_subscriber)
                    db.session.commit()
                    print(f"DEBUG: Nuevo suscriptor añadido a tu DB desde registro de evento: {email}")

                # 2. Añadir/Actualizar en MailerLite (solo si tenemos un group_id válido)
                if target_group_id:
                    mailerlite_added = add_subscriber_to_mailerlite(
                        email=email,
                        first_name=full_name.split(' ')[0] if full_name else '',
                        last_name=' '.join(full_name.split(' ')[1:]) if full_name else '',
                        group_id=target_group_id # <-- ¡Pasamos el ID de grupo seleccionado!
                    )

                    if mailerlite_added:
                        print(f"DEBUG: Suscriptor {email} añadido/actualizado en MailerLite al grupo {target_group_id} desde registro de evento.")
                    else:
                        print(f"ERROR: Fallo al añadir/actualizar suscriptor {email} en MailerLite desde registro de evento.")
                else:
                    print("WARNING: No se pudo determinar un ID de grupo de MailerLite válido para registro de evento. Suscriptor no añadido a MailerLite.")

            except Exception as db_e:
                db.session.rollback()
                print(f"ERROR: Fallo al gestionar suscriptor en DB o MailerLite desde registro de evento para {email}: {db_e}")


        return jsonify(message="Event registration successful!"), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR GENERAL in /api/event-registration: {e}")
        return jsonify(error="An unexpected error occurred during registration."), 500