"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Subscriber
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.config import Config
import stripe
from flask import send_from_directory
from api.services.email_service import send_contact_form_email, add_subscriber_to_mailerlite
import os


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

YOUR_RECEIVING_EMAIL = os.getenv("YOUR_RECEIVING_EMAIL")
MAILERSEND_SENDER_EMAIL = os.getenv("MAILERSEND_SENDER_EMAIL")
MAILERSEND_SENDER_NAME = os.getenv("MAILERSEND_SENDER_NAME", "Victoria from The Women Ground")


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


# ---  ENDPOINT PARA INICIAR EL CHECKOUT DE STRIPE ---


@api.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    print("DEBUG: Entrando a create_checkout_session.")
    try:
        # Asegurarse de que el frontend envió el product_id
        data = request.json
        product_id = data.get('product_id')

        if product_id != 'ebook_pack':  # O si tienes otros productos, maneja sus IDs
            print(f"ERROR: Product ID {product_id} no reconocido.")
            return jsonify(error="Product not found"), 404

        product_info = Config.PRODUCT_INFO.get(product_id)
        if not product_info:
            print("ERROR: Product info no encontrada en Config.")
            return jsonify(error="Product configuration not found"), 500

        print(f"DEBUG: Product info cargada: {product_info}")

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': product_info['currency'],
                        'product_data': {
                            'name': product_info['name'],
                            'description': product_info['description'],
                            'images': [product_info['image_url']],
                        },
                        'unit_amount': product_info['price_cents'],
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{Config.FRONTEND_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{Config.FRONTEND_URL}/cancel",
            ui_mode='hosted',
            customer_creation='if_required',  # Crea un objeto Customer en Stripe si no existe
            metadata={
                'product_id': product_id,
                # Puedes añadir más metadatos útiles aquí, ej. user_id si tienes usuarios autenticados
            }
        )
        print(f"DEBUG: Sesión de Stripe creada, URL: {checkout_session.url}")
        return jsonify({'checkout_url': checkout_session.url}), 200

    except stripe.error.StripeError as e:
        # Errores específicos de la API de Stripe
        print(f"ERROR STRIPE al crear sesión: {e}")
        return jsonify(error=str(e)), 400
    except Exception as e:
        # Cualquier otro error inesperado
        print(f"ERROR GENERAL en /create-checkout-session: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar su solicitud de pago."), 500

# --- FIN DEL ENDPOINT de Stripe ---

# ---  ENDPOINT SEGURO PARA LA DESCARGA DEL EBOOK ---


@api.route('/download-ebook/<string:session_id>', methods=['GET'])
def download_ebook(session_id):
    print(f"DEBUG: Intentando descargar eBook para session_id: {session_id}")
    try:
        # 1. Verificar la sesión de Stripe
        # Obtenemos la sesión de Stripe usando el session_id
        session = stripe.checkout.Session.retrieve(session_id)

        # 2. Comprobar que la sesión se ha completado y el pago ha sido exitoso
        # Es crucial que 'payment_status' sea 'paid' y 'status' sea 'complete'.
        # Además, puedes verificar el 'product_id' si lo guardaste en metadata.
        if session.payment_status == 'paid' and session.status == 'complete':
            print(f"DEBUG: Sesión {session_id} verificada. Pago completado.")

            # Opcional: Verifica si el producto asociado a esta sesión es el correcto
            # Si tienes varios productos, podrías obtener el product_id de los metadatos de la sesión
            # y usarlo para decidir qué archivo servir.
            # current_product_id = session.metadata.get('product_id')
            # if current_product_id != 'ebook_pack':
            #     print(f"ERROR: Product ID no coincide para la descarga: {current_product_id}")
            #     return jsonify(error="Product mismatch"), 403

            # 3. Servir el archivo del eBook
            # Define la ruta segura donde tienes tus eBooks
            downloads_dir = os.path.join(
                os.path.dirname(__file__), 'downloads')
            # <-- ¡Asegúrate de que este sea el nombre EXACTO de tu archivo!
            ebook_filename = "Juega_a_Crear_Pack.zip"
            mimetype = 'application/zip'

            # Verificar si el archivo existe
            if not os.path.isfile(os.path.join(downloads_dir, ebook_filename)):
                print(
                    f"ERROR: Archivo {ebook_filename} no encontrado en {downloads_dir}")
                return jsonify(error="Ebook file not found on server"), 500

            print(f"DEBUG: Sirviendo el Zip: {ebook_filename}")
            # send_from_directory es seguro porque solo sirve archivos dentro de 'downloads_dir'
            return send_from_directory(
                directory=downloads_dir,
                path=ebook_filename,
                as_attachment=True,  # Fuerza la descarga en lugar de abrir en el navegador
                mimetype=mimetype  # Tipo MIME para PDF
            )
        else:
            print(
                f"ERROR: Sesión {session_id} no válida para descarga. Estado: {session.status}, Pago: {session.payment_status}")
            # 403 Forbidden
            return jsonify(error="Payment not confirmed for this session"), 403

    except stripe.error.StripeError as e:
        print(f"ERROR STRIPE al verificar sesión para descarga: {e}")
        return jsonify(error="Error verifying payment session."), 500
    except Exception as e:
        print(f"ERROR GENERAL al intentar descargar eBook: {e}")
        return jsonify(error="An unexpected error occurred during download."), 500

# --- FIN DEL ENDPOINT DE DESCARGA ---

# --- NUEVO ENDPOINT PARA EL FORMULARIO DE CONTACTO ---


@api.route('/contact', methods=['POST']) # ¡Ruta corregida a /contact!
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
                mailerlite_added = add_subscriber_to_mailerlite(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    group_id=MAILERLITE_NEWSLETTER_GROUP_ID # Esto ahora se carga al inicio del archivo
                )

                if mailerlite_added:
                    print(f"DEBUG: Suscriptor {email} añadido/actualizado en MailerLite.")
                else:
                    print(f"ERROR: Fallo al añadir/actualizar suscriptor {email} en MailerLite.")

            except Exception as db_e:
                db.session.rollback() # Solo si la transacción está abierta
                print(f"ERROR: Fallo al gestionar suscriptor en DB o MailerLite para {email}: {db_e}")
                # Puedes decidir si quieres devolver un error aquí o que el resto del flujo siga
                # Por ahora, simplemente imprimimos el error y el resto de la función continuará

        return jsonify(message="Mensaje recibido con éxito."), 200

    except Exception as e:
        # Solo haz rollback si hubo un error de DB y una transacción activa
        # print(f"DEBUG: Rollback de sesión de DB debido a un error general.")
        # db.session.rollback() # Coméntalo o úsalo con cuidado si tu DB está bien manejada

        print(f"ERROR GENERAL en /api/contact: {e}")
        return jsonify(error="Ocurrió un error inesperado al procesar tu mensaje."), 500



