"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Subscriber, EventRegistration, Admins, Contact, Order
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.config import Config
import stripe

from api.services.email_service import (
    send_contact_form_email,
    add_subscriber_to_mailerlite,
    send_ebook_download_email,
    remove_subscriber_from_group
)

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

# --- VARIABLES DE ENTORNO PARA GRUPOS DE IDIOMA ---
MAILERLITE_GROUP_ES = os.getenv("MAILERLITE_GROUP_ES")
MAILERLITE_GROUP_EN = os.getenv("MAILERLITE_GROUP_EN")
MAILERLITE_DEFAULT_GROUP_ID = os.getenv("MAILERLITE_DEFAULT_GROUP_ID")
MAILERLITE_GROUP_LM1_ES = os.getenv("MAILERLITE_GROUP_LM1_ES")
MAILERLITE_GROUP_LM1_EN = os.getenv("MAILERLITE_GROUP_LM1_EN")
# IDs para los nuevos grupos de compradores
MAILERLITE_GROUP_BUYER_ES = "159915664912417882"
MAILERLITE_GROUP_BUYER_EN = os.getenv("MAILERLITE_GROUP_BUYER_EN")

# --- NUEVA VARIABLE DE ENTORNO PARA LA WEBHOOK DE STRIPE ---
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

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

@api.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    print("DEBUG: Entrando a create_checkout-session.")
    try:
        data = request.json
        price_id = data.get('price_id')
        customer_email = data.get('customer_email') # <-- Línea importante para la automatización
        customer_name = data.get('customer_name')   # <-- Nuevo: para el nombre completo
        
        if not price_id or not customer_email:
            print("ERROR: Faltan Price ID o Email del frontend.")
            return jsonify(error="Price ID or email missing"), 400

        allowed_price_ids = [Config.STRIPE_PRICE_ID_ES, Config.STRIPE_PRICE_ID_EN]
        if price_id not in allowed_price_ids:
            print(f"ERROR: Price ID {price_id} no autorizado.")
            return jsonify(error="Unauthorized Price ID"), 403

        print(f"DEBUG: Creando sesión de Stripe para Price ID: {price_id}, Email: {customer_email}, Nombre: {customer_name}")

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
            customer_email=customer_email, # <-- Pasando el email aquí
            customer_creation='if_required',
            metadata={
                'requested_price_id': price_id,
                'customer_name': customer_name, # <-- Almacenamos el nombre en los metadatos
            },
            allow_promotion_codes=True,
        )
        print(f"DEBUG: Sesión de Stripe creada, URL: {checkout_session.url}")
        return jsonify({'checkout_url': checkout_session.url}), 200

    except stripe.error.StripeError as e:
        print(f"ERROR STRIPE al crear sesión: {e}")
        return jsonify(error=str(e)), 400
    except Exception as e:
        print(f"ERROR GENERAL en /create-checkout-session: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar su solicitud de pago."), 500

@api.route('/get-session-data', methods=['GET'])
def get_session_data():
    session_id = request.args.get('session_id')
    if not session_id:
        return jsonify({'error': 'Session ID missing'}), 400

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        customer_email = session.customer_details.get('email') if session.customer_details else None
        customer_name = session.customer_details.get('name') if session.customer_details else None

        if not customer_email:
            return jsonify({'error': 'Customer data not found in session'}), 404
        
        return jsonify({
            'email': customer_email,
            'name': customer_name
        }), 200
        
    except stripe.error.StripeError as e:
        print(f"ERROR STRIPE al obtener datos de la sesión: {e}")
        return jsonify(error="Error verifying payment session."), 500
    except Exception as e:
        print(f"ERROR GENERAL al intentar obtener datos de la sesión: {e}")
        return jsonify(error="An unexpected error occurred."), 500

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

@api.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    print("DEBUG: Webhook de Stripe recibido. Procesando...")
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    event = None
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        print(f"ERROR: Invalid payload - {e}")
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        print(f"ERROR: Invalid signature - {e}")
        return 'Invalid signature', 400
    except Exception as e:
        print(f"ERROR: An unexpected error occurred - {e}")
        return 'Webhook error', 500

    if event['type'] == 'checkout.session.completed':
        print("DEBUG: Evento 'checkout.session.completed' detectado.")
        session = event['data']['object']
        
        # Extracción de datos de la sesión de Stripe
        customer_email = session['customer_details']['email']
        customer_name = session['metadata'].get('customer_name', '')
        
        # --- LÍNEA CORREGIDA ---
        # El price_id se encuentra en los 'line_items', no en la 'metadata'.
        # Es necesario expandir la sesión para acceder a 'line_items'.
        try:
            line_items = stripe.checkout.Session.list_line_items(session['id'], limit=1)
            purchased_price_id = line_items.data[0].price.id if line_items.data else None
            print(f"DEBUG: Price ID obtenido de line_items: {purchased_price_id}")
        except Exception as e:
            print(f"ERROR: No se pudo obtener el price_id de los line_items. Error: {e}")
            purchased_price_id = None
        
        first_name = customer_name.split(' ')[0] if customer_name else ''
        last_name = ' '.join(customer_name.split(' ')[1:]) if customer_name and ' ' in customer_name else ''
        product_name = "Ebook Español" if purchased_price_id == Config.STRIPE_PRICE_ID_ES else "Ebook English"

        print(f"DEBUG: Webhook recibido para pago completado. Email: {customer_email}, Nombre: {customer_name}, Price ID: {purchased_price_id}")

        # --- LÓGICA: GUARDAR LA ORDEN EN LA BASE DE DATOS ---
        print("DEBUG: Intentando guardar la orden en la base de datos.")
        try:
            new_order = Order(
                stripe_checkout_session_id=session['id'],
                customer_email=customer_email,
                customer_name=customer_name,
                product_name=product_name,
                amount_total=session['amount_total'],
                currency=session['currency'],
                payment_status=session['payment_status']
            )
            db.session.add(new_order)
            db.session.commit()
            print("DEBUG: Compra registrada en la base de datos con éxito.")
        except Exception as db_e:
            db.session.rollback()
            print(f"ERROR: Fallo al guardar la compra en la base de datos: {db_e}")
        # --- FIN DE LA LÓGICA DE LA BASE DE DATOS ---

        download_link = None
        if purchased_price_id == Config.STRIPE_PRICE_ID_ES:
            download_link = f"{Config.BACKEND_URL}/api/download-ebook?session_id={session['id']}"
        elif purchased_price_id == Config.STRIPE_PRICE_ID_EN:
            download_link = f"{Config.BACKEND_URL}/api/download-ebook?session_id={session['id']}"

        if download_link:
            email_sent = send_ebook_download_email(
                to_email=customer_email,
                download_link=download_link,
                language='es' if purchased_price_id == Config.STRIPE_PRICE_ID_ES else 'en'
            )
            
            if email_sent:
                print("DEBUG: Email de descarga enviado con éxito vía webhook.")
            else:
                print("ERROR: Fallo al enviar email de descarga vía webhook.")

            # --- LÓGICA: MOVER AL SUSCRIPTOR DE GRUPO EN MAILERLITE ---
            if purchased_price_id == Config.STRIPE_PRICE_ID_ES:
                add_subscriber_to_mailerlite(
                    email=customer_email,
                    first_name=first_name,
                    last_name=last_name,
                    group_id=MAILERLITE_GROUP_BUYER_ES
                )
                remove_subscriber_from_group(
                    email=customer_email,
                    group_id=MAILERLITE_GROUP_LM1_ES
                )
            elif purchased_price_id == Config.STRIPE_PRICE_ID_EN:
                add_subscriber_to_mailerlite(
                    email=customer_email,
                    first_name=first_name,
                    last_name=last_name,
                    group_id=MAILERLITE_GROUP_BUYER_EN
                )
                remove_subscriber_from_group(
                    email=customer_email,
                    group_id=MAILERLITE_GROUP_LM1_EN
                )

    return jsonify({'success': True}), 200

# --- NUEVO ENDPOINT PARA GESTIONAR EL FORMULARIO DE LEAD MAGNET ---
@api.route('/lead-magnet-subscribe', methods=['POST'])
def handle_lead_magnet_subscribe():
    print("DEBUG: Entrando a handle_lead_magnet_subscribe.")
    try:
        data = request.json
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        language = data.get('language')

        if not all([first_name, last_name, email, language]):
            return jsonify(error="Faltan campos obligatorios."), 400
        
        try:
            existing_subscriber = Subscriber.query.filter_by(email=email).first()
            if existing_subscriber:
                existing_subscriber.first_name = first_name
                existing_subscriber.last_name = last_name
                db.session.commit()
                print(f"DEBUG: Email {email} ya suscrito en tu DB. Datos actualizados.")
            else:
                new_subscriber = Subscriber(
                    first_name=first_name,
                    last_name=last_name,
                    email=email
                )
                db.session.add(new_subscriber)
                db.session.commit()
                print(f"DEBUG: Nuevo suscriptor añadido a tu DB: {email}")
        except Exception as db_e:
            db.session.rollback()
            print(f"ERROR: Fallo al guardar suscriptor en la base de datos: {db_e}")
        
        target_group_id = None
        if language == 'es':
            target_group_id = MAILERLITE_GROUP_LM1_ES
        elif language == 'en':
            target_group_id = MAILERLITE_GROUP_LM1_EN
        
        if not target_group_id:
            print(f"ERROR: No se encontró un ID de grupo válido para el idioma '{language}'.")
            return jsonify(error="No se pudo procesar la suscripción debido a un error de configuración."), 500

        mailerlite_added = add_subscriber_to_mailerlite(
            email=email,
            first_name=first_name,
            last_name=last_name,
            group_id=target_group_id
        )

        if not mailerlite_added:
            print(f"ERROR: Fallo al añadir suscriptor {email} en MailerLite.")
            return jsonify(error="Error al suscribirte. Por favor, inténtalo de nuevo."), 500
        
        return jsonify(message="¡Gracias por suscribirte! Revisa tu bandeja de entrada."), 200

    except Exception as e:
        print(f"ERROR GENERAL en /api/lead-magnet-subscribe: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar tu solicitud."), 500

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
        language = data.get('language')

        if not all([first_name, last_name, email, message_content]):
            return jsonify(error="Faltan campos obligatorios."), 400

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
            
        email_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "message": message_content,
            "subscribe_to_newsletter": subscribe_to_newsletter,
            "language": language
        }
        #email_subject = f"Nuevo Contacto desde la Web ({language.upper() if language else 'N/A'}): {first_name} {last_name}"
        email_subject = "Nuevo Contacto desde la Web"

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

        if subscribe_to_newsletter:
            print(f"DEBUG: Procesando suscripción a newsletter para {email} (Idioma: {language})...")
            
            target_group_id = None
            if language == 'es':
                target_group_id = MAILERLITE_GROUP_ES
            elif language == 'en':
                target_group_id = MAILERLITE_GROUP_EN
            else:
                print(f"WARNING: Idioma '{language}' no reconocido. Usando grupo por defecto si está configurado.")
                target_group_id = MAILERLITE_DEFAULT_GROUP_ID

            try:
                existing_subscriber = Subscriber.query.filter_by(email=email).first()
                if existing_subscriber:
                    existing_subscriber.first_name = first_name
                    existing_subscriber.last_name = last_name
                    db.session.commit()
                    print(f"DEBUG: Email {email} ya suscrito en tu DB. Datos actualizados.")
                else:
                    new_subscriber = Subscriber(
                        first_name=first_name,
                        last_name=last_name,
                        email=email
                    )
                    db.session.add(new_subscriber)
                    db.session.commit()
                    print(f"DEBUG: Nuevo suscriptor añadido a tu DB: {email}")

                if target_group_id:
                    mailerlite_added = add_subscriber_to_mailerlite(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        group_id=target_group_id
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
        language = data.get('language')

        if not all([full_name, email, event_name]):
            print("ERROR: Missing required fields for event registration.")
            return jsonify(error="Missing required fields: fullName, email, eventName."), 400
        
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

        if data.get('subscribeToNewsletter'):
            print(f"DEBUG: Procesando suscripción a newsletter desde registro de evento para {email} (Idioma: {language})...")
            
            target_group_id = None
            if language == 'es':
                target_group_id = MAILERLITE_GROUP_ES
            elif language == 'en':
                target_group_id = MAILERLITE_GROUP_EN
            else:
                print(f"WARNING: Idioma '{language}' no reconocido en registro de evento. Usando grupo por defecto si está configurado.")
                target_group_id = MAILERLITE_DEFAULT_GROUP_ID

            try:
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

                if target_group_id:
                    mailerlite_added = add_subscriber_to_mailerlite(
                        email=email,
                        first_name=full_name.split(' ')[0] if full_name else '',
                        last_name=' '.join(full_name.split(' ')[1:]) if full_name else '',
                        group_id=target_group_id
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


@api.route('/fake-checkout-session', methods=['POST'])
def fake_checkout_session():
    data = request.json
    price_id = data.get('price_id')

    if not price_id:
        return jsonify(error="Price ID missing"), 400

    # Simula una sesión de compra
    fake_session_id = "fake_" + price_id
    fake_checkout_url = f"https://fake-checkout.com/session/{fake_session_id}"

    # Aquí puedes disparar tus automatizaciones de prueba (email, grupo, etc.)
    # Por ejemplo, llamar a send_ebook_download_email, add_subscriber_to_mailerlite, etc.

    return jsonify({
        "checkout_url": fake_checkout_url,
        "session_id": fake_session_id,
        "price_id": price_id,
        "status": "created"
    }), 200