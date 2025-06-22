import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_cors import CORS
from flask_migrate import Migrate
from flask_swagger import swagger # Esto puede que no lo uses, pero lo mantengo

# --- CORRECCIÓN CLAVE AQUÍ: 'from api.' CAMBIA A 'from src.api.' ---
from src.api.utils import APIException, generate_sitemap
from src.api.models import db, Order, Subscriber
from src.api.routes import api
from src.api.admin import setup_admin
from src.api.commands import setup_commands
from src.api.config import Config
# --- FIN DE LAS CORRECCIONES DE IMPORTACIÓN ---

import stripe

# Stripe conf
stripe.api_key = Config.STRIPE_SECRET_KEY

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app, resources={r"/*": {"origins": os.getenv("FRONTEND_URL", "*")}})

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, directory=os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'migrations')), compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    # Obtiene el cuerpo crudo de la solicitud POST.
    # Es crucial que sea el cuerpo crudo, no 'request.json', para la verificación de firma.
    payload = request.get_data()

    # Obtiene la cabecera 'stripe-signature' que Stripe envía para verificar la autenticidad.
    sig_header = request.headers.get('stripe-signature')
    event = None  # Inicializa la variable del evento

    try:
        # CONSTRUYE EL OBJETO DE EVENTO DE STRIPE Y VERIFICA LA FIRMA DEL WEBHOOK.
        # Esto es CRÍTICO para la seguridad: asegura que la notificación es de Stripe
        # y no ha sido manipulado por un tercero malintencionado.
        event = stripe.Webhook.construct_event(
            payload, sig_header, Config.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Error al analizar el payload (cuerpo) de la solicitud.
        print(f"Webhook Error (Payload): {e}")
        return jsonify(success=False, error="Invalid payload"), 400
    except stripe.error.SignatureVerificationError as e:
        # Error al verificar la firma del webhook.
        print(f"Webhook Error (Signature): {e}")
        return jsonify(success=False, error="Invalid signature"), 400
    except Exception as e:
        # Otros errores inesperados durante el procesamiento inicial del webhook.
        print(f"Webhook Error (General): {e}")
        return jsonify(success=False, error="An unexpected error occurred"), 500

    # --- MANEJO DE EVENTOS ESPECÍFICOS ---
    # Procesamos solo el evento 'checkout.session.completed' que indica un pago exitoso.
    if event['type'] == 'checkout.session.completed':
        # El objeto de sesión de checkout de Stripe.
        session = event['data']['object']

        print(
            f"*** Webhook recibido: Checkout Session Completada para ID: {session.id} ***")

        # Extrae los datos relevantes de la sesión de Stripe.
        # Asegúrate de que estos campos existen antes de acceder a ellos.
        customer_email = session.customer_details.email if session.customer_details and session.customer_details.email else "Email no disponible"
        customer_name = session.customer_details.name if session.customer_details and session.customer_details.name else "Nombre no disponible"

        # Obtenemos la información del producto de nuestra configuración local.
        # En un sistema más complejo, el 'product_id' se pasaría como metadata en la sesión de Stripe.
        product_info = Config.PRODUCT_INFO.get("ebook_pack")
        product_name = product_info["name"] if product_info else "Producto Desconocido"

        amount_total = session.amount_total
        currency = session.currency
        payment_status = session.payment_status

        # --- GUARDA LA ORDEN EN TU BASE DE DATOS (PostgreSQL) ---
        try:
            new_order = Order(
                stripe_checkout_session_id=session.id,
                customer_email=customer_email,
                customer_name=customer_name,
                product_name=product_name,
                amount_total=amount_total,
                currency=currency,
                payment_status=payment_status,
                order_status='delivered'  # O 'pending_delivery' si el envío es asíncrono
            )
            db.session.add(new_order)
            db.session.commit()
            print(
                f"Orden {session.id} para {customer_email} guardada en la DB.")

            # --- LÓGICA DE ENVÍO DE EBOOK AQUÍ ---
            # Este es el lugar ideal para enviar el email con el eBook al cliente.
            # Puedes llamar a una función de un servicio de email (ej. SendGrid, Mailgun) aquí.
            print(f"¡Activando envío de eBook a {customer_email}!")
            # Ejemplo: send_ebook_email(customer_email, product_name) # <-- Crearías esta función en services/email_service.py

        except Exception as db_error:
            # Si algo falla al guardar en la DB, deshaz la transacción.
            db.session.rollback()
            print(f"ERROR: No se pudo guardar la orden en la DB: {db_error}")
            # Puedes loguear este error de forma más robusta o enviar una alerta a ti mismo.
            # Stripe reintentará enviar el webhook si no recibe un 200 OK.
            return jsonify(success=False, message="Internal server error processing order"), 500

    else:
        # Otros tipos de eventos de webhook que no estamos manejando explícitamente.
        print(
            f"Webhook recibido - Tipo de evento no manejado: {event['type']}")

    # Importante: siempre responde con un 200 OK a Stripe para confirmar que recibiste el webhook.
    return jsonify(success=True), 200

# --- FIN DEL ENDPOINT DE WEBHOOK ---

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)