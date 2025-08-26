"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Subscriber, Admins, Contact, Order, EventParticipant, Event, InformationRequest, Reservation, RetreatDetails, Photo
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.config import Config
import stripe
import cloudinary
import cloudinary.uploader
import cloudinary.api

from api.services.email_service import (
    send_contact_form_email,
    add_subscriber_to_mailerlite,
    send_ebook_download_email,
    remove_subscriber_from_group,
    send_admin_reservation_notification,   
    send_admin_info_request_notification   
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

# --- Configuración de Cloudinary ---
cloudinary.config(
    cloud_name=os.getenv('CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)


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
        customer_email = data.get('customer_email')
        customer_name = data.get('customer_name')
        event_id = data.get('event_id')  # Para distinguir los eventos del ebook

        if not all([price_id, customer_email]):
            print("ERROR: Faltan Price ID o Email del frontend.")
            return jsonify(error="Price ID or email missing"), 400

        checkout_metadata = {} # Inicializamos los metadatos
        success_path = "/success" # URL de éxito por defecto (para el ebook)

        # Lógica para manejar eventos
        if event_id:
            print(f"DEBUG: Solicitud de pago para evento con ID: {event_id}")
            event = db.session.get(Event, event_id)
            if not event:
                print(f"ERROR: Evento con ID {event_id} no encontrado.")
                return jsonify(error="Event not found"), 404
            
            # Validamos que el price_id coincida con el almacenado en el evento
            if not event.stripe_price_id or event.stripe_price_id != price_id:
                print(f"ERROR: Price ID {price_id} no autorizado para el evento {event_id}.")
                return jsonify(error="Unauthorized Price ID for this event"), 403
            
            checkout_metadata = {
                'event_id': event_id, 
                'customer_name': customer_name,
                'customer_email': customer_email # Añadimos el email a metadatos también
            }
            success_path = "/event-success" # <--- CAMBIO: URL de éxito para eventos
            print("DEBUG: La validación del evento fue exitosa.")

        # Lógica para manejar el ebook (se ejecuta si no hay event_id)
        else:
            print("DEBUG: Solicitud de pago para el ebook.")
            allowed_price_ids = [Config.STRIPE_PRICE_ID_ES, Config.STRIPE_PRICE_ID_EN]
            if price_id not in allowed_price_ids:
                print(f"ERROR: Price ID {price_id} no autorizado.")
                return jsonify(error="Unauthorized Price ID"), 403
            
            checkout_metadata = {
                'customer_name': customer_name,
                'customer_email': customer_email # Añadimos el email a metadatos también
            }
            # success_path ya es "/success" por defecto
            print("DEBUG: La validación del ebook fue exitosa.")

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
            success_url=f"{Config.FRONTEND_URL}{success_path}?session_id={{CHECKOUT_SESSION_ID}}", # <--- URL dinámica
            cancel_url=f"{Config.FRONTEND_URL}/cancel",
            ui_mode='hosted',
            customer_email=customer_email,
            customer_creation='if_required',
            metadata=checkout_metadata,  # Usa los metadatos definidos condicionalmente
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
    
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')

    event = None
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not webhook_secret:
        print("ERROR: STRIPE_WEBHOOK_SECRET no configurado. Abortando verificación.")
        return 'Webhook secret not configured', 500

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
        
        customer_email = session['customer_details']['email']
        customer_name = session['metadata'].get('customer_name', '')
        event_id = session['metadata'].get('event_id') # <--- OBTENEMOS EL ID DEL EVENTO
        
        try:
            line_items = stripe.checkout.Session.list_line_items(session['id'], limit=1)
            purchased_price_id = line_items.data[0].price.id if line_items.data else None
            print(f"DEBUG: Price ID obtenido de line_items: {purchased_price_id}")
        except Exception as e:
            print(f"ERROR: No se pudo obtener el price_id de los line_items. Error: {e}")
            purchased_price_id = None
        
        first_name = customer_name.split(' ')[0] if customer_name else ''
        last_name = ' '.join(customer_name.split(' ')[1:]) if customer_name and ' ' in customer_name else ''
        
        print(f"DEBUG: Webhook recibido para pago completado. Email: {customer_email}, Nombre: {customer_name}, Price ID: {purchased_price_id}, Event ID: {event_id}")

        # --- LÓGICA PARA PAGOS DE EVENTOS ---
        if event_id:
            print("DEBUG: Es un pago de evento.")
            try:
                # Actualizar el contador de participantes del evento
                event_obj = db.session.get(Event, event_id)
                if event_obj:
                    event_obj.current_participants += 1
                    # Guardar la reserva del evento
                    new_reservation = Reservation(
                        stripe_checkout_session_id=session['id'],
                        customer_email=customer_email,
                        customer_name=customer_name,
                        event_id=event_id,
                        amount_paid=session['amount_total'],
                        currency=session['currency'],
                        payment_status=session['payment_status']
                    )
                    db.session.add(new_reservation)
                    db.session.commit()
                    print("DEBUG: Reserva de evento y contador de participantes actualizados con éxito.")
                else:
                    print(f"ERROR: Evento con ID {event_id} no encontrado en la base de datos.")
                    
                # Añadir suscriptor a la lista de eventos en MailerLite
                add_subscriber_to_mailerlite(
                    email=customer_email,
                    first_name=first_name,
                    last_name=last_name,
                    group_id=Config.MAILERLITE_EVENT_GROUP_ID # Usamos la nueva variable
                )
                
                # Opcional: remover de otras listas si ya estaban suscriptos, por ejemplo
                # remove_subscriber_from_group(email=customer_email, group_id=Config.MAILERLITE_GROUP_LM1_ES)

            except Exception as e:
                db.session.rollback()
                print(f"ERROR: Fallo al procesar la reserva del evento o añadir a MailerLite: {e}")

        # --- LÓGICA PARA PAGOS DE EBOOKS ---
        else:
            print("DEBUG: Es un pago de ebook.")
            product_name = "Ebook Español" if purchased_price_id == Config.STRIPE_PRICE_ID_ES else "Ebook English"
            
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
                print("DEBUG: Compra de ebook registrada en la base de datos con éxito.")
            except Exception as db_e:
                db.session.rollback()
                print(f"ERROR: Fallo al guardar la compra del ebook en la base de datos: {db_e}")
            
            download_link = None
            if purchased_price_id == Config.STRIPE_PRICE_ID_ES:
                download_link = f"{Config.BACKEND_URL}/api/download-ebook?session_id={session['id']}"
                add_subscriber_to_mailerlite(email=customer_email, first_name=first_name, last_name=last_name, group_id=Config.MAILERLITE_GROUP_BUYER_ES)
                remove_subscriber_from_group(email=customer_email, group_id=Config.MAILERLITE_GROUP_LM1_ES)
            elif purchased_price_id == Config.STRIPE_PRICE_ID_EN:
                download_link = f"{Config.BACKEND_URL}/api/download-ebook?session_id={session['id']}"
                add_subscriber_to_mailerlite(email=customer_email, first_name=first_name, last_name=last_name, group_id=Config.MAILERLITE_GROUP_BUYER_EN)
                remove_subscriber_from_group(email=customer_email, group_id=Config.MAILERLITE_GROUP_LM1_EN)

            if download_link:
                email_sent = send_ebook_download_email(to_email=customer_email, download_link=download_link, language='es' if purchased_price_id == Config.STRIPE_PRICE_ID_ES else 'en')
                if email_sent:
                    print("DEBUG: Email de descarga de ebook enviado con éxito vía webhook.")
                else:
                    print("ERROR: Fallo al enviar email de descarga de ebook vía webhook.")

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

        # Obtenemos los datos del formulario, incluyendo el nombre del evento
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

        # --- CAMBIO CRÍTICO: BUSCAR EL EVENTO EXISTENTE ---
        # Buscamos el evento en la base de datos por su nombre
        event = Event.query.filter_by(name=event_name).first()
        
        if not event:
            print(f"ERROR: Event with name '{event_name}' not found.")
            return jsonify(error=f"Event '{event_name}' does not exist."), 404

        # Opcional: Validar si el evento ya está lleno
        if event.max_participants and event.current_participants >= event.max_participants:
            print(f"ERROR: Event '{event_name}' is already full.")
            return jsonify(error=f"Event '{event_name}' is already full."), 400
            
        # Opcional: Evitar registros duplicados para el mismo evento
        existing_participant = EventParticipant.query.filter_by(event_id=event.id, email=email).first()
        if existing_participant:
            print(f"ERROR: Email {email} is already registered for event '{event_name}'.")
            return jsonify(error="You are already registered for this event."), 409

        # --- CAMBIO CRÍTICO: CREAR UNA INSTANCIA DEL NUEVO MODELO ---
        # Creamos una nueva instancia del modelo EventParticipant, enlazándolo al evento encontrado
        new_participant = EventParticipant(
            event_id=event.id, # Enlazamos el participante al ID del evento
            name=full_name,
            email=email,
            how_did_you_hear=how_did_you_hear,
            artistic_expression=artistic_expression,
            why_interested=why_interested,
            comments=comments
        )

        db.session.add(new_participant)
        
        # Incrementamos el contador de participantes del evento
        event.current_participants += 1
        
        db.session.commit()
        
        print(f"DEBUG: New event participant saved to DB: {new_participant.name} for event ID {new_participant.event_id}.")
        print(f"DEBUG: Event '{event.name}' now has {event.current_participants} participants.")

        # La lógica de suscripción a MailerLite se mantiene igual
        if data.get('subscribeToNewsletter'):
            # ... (tu código para MailerLite va aquí, se mantiene casi idéntico) ...
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


@api.route('/event', methods=['POST'])
@jwt_required()  # Requerir token JWT para esta ruta
def create_event():
    # Identificar al usuario que hizo la solicitud
    current_user_email = get_jwt_identity()

    # Verificar si el usuario es un administrador
    admin = Admins.query.filter_by(email=current_user_email).first()
    if not admin:
        return jsonify({"msg": "Admin privileges required"}), 403

    try:
        data = request.get_json()

        # Validación de campos obligatorios
        if not all(k in data for k in ('name', 'date', 'location')):
            return jsonify({"msg": "Missing required fields: name, date, location"}), 400

        # Validación de la fecha
        try:
            event_date = datetime.fromisoformat(data['date'])
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        
        # Opcional: Validar si el evento ya existe para evitar duplicados
        existing_event = Event.query.filter_by(name=data['name']).first()
        if existing_event:
            return jsonify({"msg": f"An event with the name '{data['name']}' already exists."}), 409

        # Crear una nueva instancia del modelo Event
        new_event = Event(
            name=data['name'],
            short_description=data.get('short_description'),
            long_description=data.get('long_description'),
            date=event_date,
            location=data['location'],
            max_participants=data.get('max_participants'),
            price_1=data.get('price_1'),
            price_2=data.get('price_2'),
            price_3=data.get('price_3'),
            price_4=data.get('price_4'),
            is_active=data.get('is_active', True),  # Por defecto activo
            image_url=data.get('image_url')
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify(new_event.serialize()), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating event: {e}")
        return jsonify({"msg": "Internal server error"}), 500


@api.route('/events', methods=['GET']) # Se cambia a 'events' para diferenciarla de la ruta de admin.
def get_public_events():
    """
    Ruta para que los clientes obtengan una lista de todos los eventos activos.
    """
    try:
        events = Event.query.filter_by(is_active=True).order_by(Event.priority_order.asc()).all()
        if not events:
            return jsonify({"msg": "No active events found"}), 404

        serialized_events = [event.serialize() for event in events]
        return jsonify(serialized_events), 200

    except Exception as e:
        print(f"Error retrieving public events: {e}")
        return jsonify({"msg": "Internal server error"}), 500

# ...
@api.route('/events/<int:event_id>', methods=['GET'])
def get_single_event(event_id):
    """
    Ruta para obtener un solo evento.
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"msg": "Event not found"}), 404

        return jsonify(event.serialize()), 200

    except Exception as e:
        print(f"Error retrieving event with id {event_id}: {e}")
        return jsonify({"msg": "Internal server error"}), 500



@api.route('/admin/events/<int:event_id>/photos', methods=['POST'])
@jwt_required()
def upload_photo(event_id):
    """
    Ruta para que un admin suba una foto a un evento específico.
    """
    try:
        # 1. Obtener la identidad (que es un diccionario)
        admin_identity = get_jwt_identity()
        # 2. Extraer el email del diccionario para la consulta
        admin_email = admin_identity.get('email')

        # Esto es lo que estaba fallando
        admin = Admins.query.filter_by(email=admin_email).first()
        if not admin:
            return jsonify({"msg": "Admin privileges required"}), 403

        event = Event.query.get(event_id)
        if not event:
            return jsonify({"msg": "Event not found"}), 404

        if 'file' not in request.files:
            return jsonify({"msg": "No se encontró el archivo"}), 400

        file_to_upload = request.files['file']

        if file_to_upload.filename == '':
            return jsonify({"msg": "No se seleccionó un archivo"}), 400

        # Subir el archivo a Cloudinary
        folder_name = f'event_photos/event_{event_id}'
        upload_result = cloudinary.uploader.upload(file_to_upload, folder=folder_name)
        photo_url = upload_result['secure_url']

        new_photo = Photo(event_id=event_id, url=photo_url)
        db.session.add(new_photo)
        db.session.commit()

        return jsonify({"msg": "Foto subida con éxito", "photo": new_photo.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al subir la foto: {e}")
        return jsonify({"msg": f"Error al subir la foto: {e}"}), 500
        

@api.route('/events/<int:event_id>/photos', methods=['GET'])
def get_event_photos(event_id):
    """
    Ruta pública para obtener todas las fotos de un evento específico.
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"msg": "Event not found"}), 404
        
        # Como ya configuramos la relación en el modelo, podemos acceder directamente
        # a las fotos del evento.
        photos = [photo.serialize() for photo in event.photos]
        
        return jsonify(photos), 200

    except Exception as e:
        print(f"Error retrieving photos for event {event_id}: {e}")
        return jsonify({"msg": "Internal server error"}), 500



@api.route('/admin/event/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
   
    try:
        # Verificar si el usuario es un administrador
        current_user_email = get_jwt_identity()
        admin = Admins.query.filter_by(email=current_user_email).first()
        if not admin:
            return jsonify({"msg": "Admin privileges required"}), 403

        # Buscar el evento por su ID
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"msg": "Event not found"}), 404

        data = request.get_json()

        # Actualizar solo los campos que se envían en el JSON
        if 'name' in data:
            event.name = data['name']
        if 'short_description' in data:
            event.short_description = data['short_description']
        if 'long_description' in data:
            event.long_description = data['long_description']
        if 'date' in data:
            try:
                event.date = datetime.fromisoformat(data['date'])
            except ValueError:
                return jsonify({"msg": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        if 'location' in data:
            event.location = data['location']
        if 'max_participants' in data:
            event.max_participants = data['max_participants']
        if 'price_1' in data:
            event.price_1 = data['price_1']
        if 'price_2' in data:
            event.price_2 = data['price_2']
        if 'price_3' in data:
            event.price_3 = data['price_3']
        if 'price_4' in data:
            event.price_4 = data['price_4']
        if 'is_active' in data:
            event.is_active = data['is_active']
        if 'image_url' in data:
            event.image_url = data['image_url']

        db.session.commit()

        return jsonify(event.serialize()), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating event with id {event_id}: {e}")
        return jsonify({"msg": "Internal server error"}), 500


@api.route('/admin/event/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    """
    Ruta para que los administradores eliminen un evento y sus participantes asociados.
    """
    try:
        # Verificar si el usuario es un administrador
        current_user_email = get_jwt_identity()
        admin = Admins.query.filter_by(email=current_user_email).first()
        if not admin:
            return jsonify({"msg": "Admin privileges required"}), 403

        # Buscar el evento por su ID
        event = Event.query.get(event_id)
        if not event:
            return jsonify({"msg": "Event not found"}), 404

        # Eliminar el evento
        # Con el borrado en cascada configurado en el modelo (si lo haces),
        # también se borrarán los participantes.
        # Si no lo tienes, deberías borrarlos manualmente primero.
        # Por ejemplo: EventParticipant.query.filter_by(event_id=event.id).delete()
        db.session.delete(event)
        db.session.commit()

        return jsonify({"msg": f"Event with ID {event_id} has been deleted."}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting event with id {event_id}: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@api.route('/information-request', methods=['POST'])
def handle_information_request():
    payload = request.get_json()
    # ... tu validación de campos ...
    
    try:
        event = Event.query.get(payload['event_id'])
        if not event:
            return jsonify({"msg": "Evento no encontrado."}), 404

        new_request = InformationRequest(
            event_id=payload['event_id'],
            name=payload['name'],
            email=payload['email'],
            phone=payload.get('phone'),
            comments=payload.get('comments'),
            is_read=False
        )
        
        db.session.add(new_request)
        db.session.commit()

        # --- ENVÍO DE EMAIL AL ADMINISTRADOR ---
        admin_notification_data = {
            'event_name': event.name,
            'name': payload['name'],
            'email': payload['email'],
            'phone': payload.get('phone'),
            'comments': payload.get('comments')
        }
        send_admin_info_request_notification(admin_notification_data)
        
        return jsonify({"msg": "Solicitud de información enviada con éxito!", "id": new_request.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Fallo en la ruta /information-request: {str(e)}")
        return jsonify({"msg": "Ocurrió un error al procesar la solicitud."}), 500


@api.route('/payment-failure', methods=['POST'])
def handle_payment_failure():
    """
    Registra una solicitud de información para un usuario que no completó un pago.
    Esto permite hacer seguimiento a leads que abandonaron el proceso de compra.
    """
    payload = request.get_json()
    if not payload:
        return jsonify({"msg": "No se recibió el cuerpo de la solicitud en formato JSON."}), 400

    required_fields = ['event_id', 'name', 'email']
    for field in required_fields:
        if field not in payload or not payload[field]:
            return jsonify({"msg": f"El campo '{field}' es obligatorio."}), 400
            
    try:
        # Se crea una nueva solicitud de información, reutilizando el modelo
        new_request = InformationRequest(
            event_id=payload['event_id'],
            name=payload['name'],
            email=payload['email'],
            # Opcionalmente, puedes añadir un comentario para diferenciar este tipo de solicitud
            comments=f"Posible lead: El usuario abandonó el proceso de pago para el evento ID {payload['event_id']}.",
            phone=payload.get('phone'),
            is_read=False
        )
        
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify({"msg": "Fallo de pago registrado y lead capturado."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Ocurrió un error al procesar el fallo de pago: {str(e)}"}), 500


@api.route('/reservation', methods=['POST'])
def handle_reservation():
    payload = request.get_json()
    # ... tu validación de campos ...
    
    try:
        event = Event.query.get(payload['event_id'])
        if not event:
            return jsonify({"msg": "Evento no encontrado."}), 404

        new_reservation = Reservation(
            event_id=payload['event_id'],
            name=payload['name'],
            email=payload['email'],
            phone=payload.get('phone'),
            participants_count=payload['participants_count'],
            status='pending'
        )
        
        db.session.add(new_reservation)
        db.session.commit()
        
        # --- ENVÍO DE EMAIL AL ADMINISTRADOR ---
        admin_notification_data = {
            'event_name': event.name,
            'name': payload['name'],
            'email': payload['email'],
            'phone': payload.get('phone'),
            'participants_count': payload['participants_count']
        }
        send_admin_reservation_notification(admin_notification_data)
        
        return jsonify({"msg": "Reserva registrada con éxito!", "id": new_reservation.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Fallo en la ruta /reservation: {str(e)}")
        return jsonify({"msg": "Ocurrió un error al procesar la reserva."}), 500