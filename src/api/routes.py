"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os # Asegúrate de que esto esté importado
from flask import Flask, request, jsonify, url_for, Blueprint, send_from_directory
from api.models import db, User, Subscriber # Asegúrate de que Subscriber y User están bien definidos
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.config import Config # Asegúrate de que Config está accesible y correcto
import stripe

# Asegúrate de que estos imports sean correctos para tu estructura
from api.services.email_service import send_contact_form_email, add_subscriber_to_mailerlite


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Carga las variables de entorno para los emails
YOUR_RECEIVING_EMAIL = os.getenv("YOUR_RECEIVING_EMAIL")
MAILERSEND_SENDER_EMAIL = os.getenv("MAILERSEND_SENDER_EMAIL")
MAILERSEND_SENDER_NAME = os.getenv("MAILERSEND_SENDER_NAME", "Victoria from The Women Ground")
# Asegúrate de que esta variable de entorno o valor por defecto esté configurada
MAILERLITE_NEWSLETTER_GROUP_ID = os.getenv("MAILERLITE_NEWSLETTER_GROUP_ID")


# Configura la clave secreta de Stripe al inicio
stripe.api_key = os.getenv("STRIPE_SECRET_KEY") # Es más seguro cargarla desde variables de entorno


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


# ---  ENDPOINT PARA INICIAR EL CHECKOUT DE STRIPE (ACTUALIZADO) ---

@api.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    print("DEBUG: Entrando a create_checkout_session.")
    try:
        data = request.json
        # --- CAMBIO CLAVE AQUÍ: Espera 'price_id' en lugar de 'product_id' ---
        price_id = data.get('price_id') # <--- CORRECTO: Ahora obtenemos 'price_id'

        if not price_id:
            print("ERROR: No se recibió price_id del frontend.")
            return jsonify(error="Price ID missing"), 400

        # Validación: Asegurarse de que el price_id sea uno de los esperados
        allowed_price_ids = [Config.STRIPE_PRICE_ID_ES, Config.STRIPE_PRICE_ID_EN]
        if price_id not in allowed_price_ids:
            print(f"ERROR: Price ID {price_id} no autorizado.")
            return jsonify(error="Unauthorized Price ID"), 403

        print(f"DEBUG: Creando sesión de Stripe para Price ID: {price_id}")

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id, # Usamos el Price ID directamente aquí
                    'quantity': 1,
                },
            ],
            mode='payment',
            # --- ASEGÚRATE QUE Config.FRONTEND_URL TIENE https://tudominio.com ---
            success_url=f"{Config.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{Config.FRONTEND_URL}/cancel",
            ui_mode='hosted',
            customer_creation='if_required',
            metadata={
                'requested_price_id': price_id, # Guarda el Price ID en los metadatos de la sesión para futura referencia
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
        # --- LÍNEA CORREGIDA (asegúrate de que todo lo siguiente esté indentado correctamente) ---
        session = stripe.checkout.Session.retrieve(session_id, expand=['line_items'])

        if session.payment_status == 'paid' and session.status == 'complete':
            print(f"DEBUG: Sesión {session_id} verificada. Pago completado.")

            purchased_price_id = None
            if session.line_items and len(session.line_items.data) > 0:
                purchased_price_id = session.line_items.data[0].price.id

            ebook_filename = None # Variable para almacenar el nombre del archivo final
            if purchased_price_id == Config.STRIPE_PRICE_ID_ES:
                ebook_filename = 'Juega_a_Crear_Pack_ES.zip' # Archivo para español
                print(f"DEBUG: Descarga solicitada para eBook en español: {ebook_filename}")
            elif purchased_price_id == Config.STRIPE_PRICE_ID_EN:
                ebook_filename = 'Play_and_Create_Pack.zip' # Archivo para inglés (el nuevo nombre)
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

        if not all([first_name, last_name, email, message_content]):
            return jsonify(error="Faltan campos obligatorios."), 400

        email_data = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "message": message_content,
            "subscribe_to_newsletter": subscribe_to_newsletter
        }
        email_subject = f"Nuevo Contacto desde la Web: {first_name} {last_name}"

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

        # --- GESTIÓN DE SUSCRIPCIÓN A NEWSLETTER (EN TU DB Y MAILERLITE) ---
        if subscribe_to_newsletter:
            print(f"DEBUG: Procesando suscripción a newsletter para {email}...")
            try:
                # 1. Guardar en tu propia base de datos
                existing_subscriber = Subscriber.query.filter_by(email=email).first()
                if existing_subscriber:
                    print(f"DEBUG: Email {email} ya suscrito en tu DB. No se añade de nuevo.")
                else:
                    new_subscriber = Subscriber(
                        first_name=first_name,
                        last_name=last_name,
                        email=email
                    )
                    db.session.add(new_subscriber)
                    db.session.commit()
                    print(f"DEBUG: Nuevo suscriptor añadido a tu DB: {email}")

                # 2. Añadir/Actualizar en MailerLite
                if MAILERLITE_NEWSLETTER_GROUP_ID:
                    mailerlite_added = add_subscriber_to_mailerlite(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        group_id=MAILERLITE_NEWSLETTER_GROUP_ID
                    )

                    if mailerlite_added:
                        print(f"DEBUG: Suscriptor {email} añadido/actualizado en MailerLite.")
                    else:
                        print(f"ERROR: Fallo al añadir/actualizar suscriptor {email} en MailerLite.")
                else:
                    print("WARNING: MAILERLITE_NEWSLETTER_GROUP_ID no está configurado. No se intentó añadir a MailerLite.")

            except Exception as db_e:
                db.session.rollback()
                print(f"ERROR: Fallo al gestionar suscriptor en DB o MailerLite para {email}: {db_e}")

        return jsonify(message="Mensaje recibido con éxito."), 200

    except Exception as e:
        print(f"ERROR GENERAL en /api/contact: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar tu mensaje."), 500