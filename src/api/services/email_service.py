import os
import requests 
from mailersend import emails 
from dotenv import load_dotenv

load_dotenv()

# --- Obtener variables de entorno ---
MAILERSEND_API_KEY = os.getenv("MAILERSEND_API_KEY")
MAILERSEND_SENDER_EMAIL = os.getenv("MAILERSEND_SENDER_EMAIL")
MAILERSEND_SENDER_NAME = os.getenv("MAILERSEND_SENDER_NAME")
YOUR_RECEIVING_EMAIL = os.getenv("YOUR_RECEIVING_EMAIL")
MAILERSEND_TEMPLATE_DOWNLOAD_ES = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_ES")
MAILERSEND_TEMPLATE_DOWNLOAD_EN = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_EN")
MAILERLITE_API_KEY = os.getenv("MAILERLITE_API_KEY")
MAILERLITE_GROUP_ES = os.getenv("MAILERLITE_GROUP_ES")
MAILERLITE_GROUP_EN = os.getenv("MAILERLITE_GROUP_EN")
MAILERLITE_DEFAULT_GROUP_ID = os.getenv("MAILERLITE_DEFAULT_GROUP_ID")
MAILERLITE_EVENT_GROUP_ID = "163787617687569474" 
MAILERLITE_GROUP_YOGA_PORTRAIT = os.getenv("MAILERLITE_GROUP_YOGA_PORTRAIT")

# --- Funciones de envío de email al administrador ---

def send_admin_reservation_notification(data):
    """
    Envía un email de notificación al administrador sobre una nueva reserva.
    """
    if not MAILERSEND_API_KEY or not YOUR_RECEIVING_EMAIL:
        print("ERROR: MAILERSEND_API_KEY o YOUR_RECEIVING_EMAIL no configuradas.")
        return False
        
    try:
        mailer = emails.NewEmail(MAILERSEND_API_KEY)
        mail_body = {}

        mail_from = {
            "name": MAILERSEND_SENDER_NAME,
            "email": MAILERSEND_SENDER_EMAIL,
        }
        mailer.set_mail_from(mail_from, mail_body)

        recipients = [{"email": YOUR_RECEIVING_EMAIL}]
        mailer.set_mail_to(recipients, mail_body)
        
        subject = f"Nueva Reserva: {data['event_name']}"
        mailer.set_subject(subject, mail_body)

        html_content = f"""
        <html>
        <body>
            <h2>Nueva Reserva de Evento</h2>
            <p><strong>Evento:</strong> {data.get('event_name')}</p>
            <p><strong>Nombre:</strong> {data.get('name')}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Teléfono:</strong> {data.get('phone', 'N/A')}</p>
            <p><strong>Participantes:</strong> {data.get('participants_count')}</p>
        </body>
        </html>
        """
        mailer.set_html_content(html_content, mail_body)
        response = mailer.send(mail_body)
        print(f"DEBUG: Email de notificación de reserva enviado a admin. Respuesta API: {response}")
        return True
    except Exception as e:
        print(f"ERROR al enviar email de notificación de reserva: {e}")
        return False

def send_admin_info_request_notification(data):
    """
    Envía un email de notificación al administrador sobre una nueva solicitud de información.
    """
    if not MAILERSEND_API_KEY or not YOUR_RECEIVING_EMAIL:
        print("ERROR: MAILERSEND_API_KEY o YOUR_RECEIVING_EMAIL no configuradas.")
        return False
    
    try:
        mailer = emails.NewEmail(MAILERSEND_API_KEY)
        mail_body = {}

        mail_from = {
            "name": MAILERSEND_SENDER_NAME,
            "email": MAILERSEND_SENDER_EMAIL,
        }
        mailer.set_mail_from(mail_from, mail_body)

        recipients = [{"email": YOUR_RECEIVING_EMAIL}]
        mailer.set_mail_to(recipients, mail_body)
        
        subject = f"Nueva Solicitud de Información: {data['event_name']}"
        mailer.set_subject(subject, mail_body)

        html_content = f"""
        <html>
        <body>
            <h2>Nueva Solicitud de Información</h2>
            <p><strong>Evento:</strong> {data.get('event_name')}</p>
            <p><strong>Nombre:</strong> {data.get('name')}</p>
            <p><strong>Email:</strong> {data.get('email')}</p>
            <p><strong>Teléfono:</strong> {data.get('phone', 'N/A')}</p>
            <p><strong>Comentarios:</strong> {data.get('comments', 'N/A')}</p>
        </body>
        </html>
        """
        mailer.set_html_content(html_content, mail_body)
        response = mailer.send(mail_body)
        print(f"DEBUG: Email de notificación de solicitud de información enviado a admin. Respuesta API: {response}")
        return True
    except Exception as e:
        print(f"ERROR al enviar email de notificación de solicitud: {e}")
        return False

# --- Funciones de contacto y MailerLite (tus funciones originales) ---

def send_contact_form_email(
    to_email,
    from_email,
    from_name,
    subject,
    template_data
):
    # --- IMPORTANTE: DESCOMENTA LAS LÍNEAS DE ABAJO para que la función envíe emails de nuevo ---
    # print("WARNING: send_contact_form_email está deshabilitado temporalmente para debugging.")
    # return True
    # -------------------------------------------------

    mailersend_api_key = os.getenv("MAILERSEND_API_KEY")
    if not mailersend_api_key:
        print("ERROR: MAILERSEND_API_KEY no configurada. No se puede enviar el email de notificación.")
        return False
        
    try:
        mailer = emails.NewEmail(mailersend_api_key)
        mail_body = {}

        mail_from = {
            "name": from_name,
            "email": from_email,
        }
        mailer.set_mail_from(mail_from, mail_body)

        recipients = [
            {
                "name": template_data.get('first_name'),
                "email": to_email,
            }
        ]
        mailer.set_mail_to(recipients, mail_body)
        mailer.set_subject(subject, mail_body)

        html_content = f"""
        <html>
        <body>
            <h2>Nuevo Mensaje de Contacto desde tu Web</h2>
            <p><strong>De:</strong> {template_data.get('first_name')} {template_data.get('last_name')}</p>
            <p><strong>Email:</strong> {template_data.get('email')}</p>
            <p><strong>Mensaje:</strong></p>
            <p>{template_data.get('message')}</p>
            <p><strong>¿Suscribirse a la Newsletter?:</strong> {'Sí' if template_data.get('subscribe_to_newsletter') else 'No'}</p>
            <hr>
            <p>Este es un mensaje automático.</p>
        </body>
        </html>
        """
        mailer.set_html_content(html_content, mail_body)

        response = mailer.send(mail_body)

        print(f"DEBUG: Email de notificación enviado con MailerSend. Respuesta API: {response}")

        return True

    except Exception as e:
        print(f"ERROR al enviar email con MailerSend: {e}")
        return False

def send_ebook_download_email(to_email, download_link, language):
  
    mailersend_api_key = os.getenv("MAILERSEND_API_KEY")
    if not mailersend_api_key:
        print("ERROR: MAILERSEND_API_KEY no configurada. No se puede enviar el email de descarga.")
        return False
    
    template_id_es = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_ES")
    template_id_en = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_EN")
    
    template_id = template_id_es if language == 'es' else template_id_en
    
    if not template_id:
        print(f"ERROR: No se encontró la ID de la plantilla de Mailersend para el idioma {language}.")
        return False

    try:
        mailer = emails.NewEmail(mailersend_api_key)
        mail_body = {}

        mail_from = {
            "name": os.getenv("MAILERSEND_SENDER_NAME"),
            "email": os.getenv("MAILERSEND_SENDER_EMAIL"),
        }
        mailer.set_mail_from(mail_from, mail_body)
        
        recipients = [{"email": to_email}]
        mailer.set_mail_to(recipients, mail_body)

        mailer.set_template_id(template_id, mail_body)
        mailer.set_variables([{"email": to_email, "substitutions": [{"var": "download_link", "value": download_link}]}], mail_body)
        
        response = mailer.send(mail_body)
        
        print(f"DEBUG: Email de descarga enviado a {to_email}. Respuesta API: {response}")
        return True

    except Exception as e:
        print(f"ERROR al enviar email de descarga con MailerSend: {e}")
        return False

def add_subscriber_to_mailerlite(email, first_name, last_name, group_id=None):
    mailerlite_api_key = os.getenv("MAILERLITE_API_KEY")
    if not mailerlite_api_key:
        print("ERROR: MAILERLITE_API_KEY no configurada. No se puede añadir suscriptor a MailerLite.")
        return False

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {mailerlite_api_key}"
    }

    URL = "https://connect.mailerlite.com/api/subscribers"
   
    payload = {
        "email": email,
        "fields": {
            "name": first_name,
            "last_name": last_name
        }
    }

    if group_id:
        payload["groups"] = [group_id]

    try:
        response = requests.post(URL, headers=headers, json=payload)
        response.raise_for_status()

        print(f"DEBUG: Suscriptor {email} enviado a MailerLite. Status Code: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"ERROR al añadir suscriptor a MailerLite (RequestException): {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"MailerLite API Response: {e.response.json()}")
        return False
    except Exception as e:
        print(f"ERROR inesperado al añadir suscriptor a MailerLite: {e}")
        return False
        
def get_subscriber_id_by_email(email):
    mailerlite_api_key = os.getenv("MAILERLITE_API_KEY")
    if not mailerlite_api_key:
        return None

    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {mailerlite_api_key}"
    }
    
    URL = f"https://connect.mailerlite.com/api/subscribers?filter[email]={email}"

    try:
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        if data and 'data' in data and len(data['data']) > 0:
            subscriber_id = data['data'][0]['id']
            print(f"DEBUG: Subscriber ID for {email} found: {subscriber_id}")
            return subscriber_id
        else:
            print(f"DEBUG: No subscriber found with email: {email}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"ERROR al buscar suscriptor en MailerLite: {e}")
        return None
    except Exception as e:
        print(f"ERROR inesperado al buscar suscriptor: {e}")
        return None

def remove_subscriber_from_group(email, group_id):
    mailerlite_api_key = os.getenv("MAILERLITE_API_KEY")
    if not mailerlite_api_key:
        print("ERROR: MAILERLITE_API_KEY no configurada. No se puede remover suscriptor.")
        return False
    
    subscriber_id = get_subscriber_id_by_email(email)
    if not subscriber_id:
        print(f"WARNING: Suscriptor con email {email} no encontrado para eliminar del grupo {group_id}.")
        return True
    
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {mailerlite_api_key}"
    }
    
    URL = f"https://connect.mailerlite.com/api/groups/{group_id}/subscribers/{subscriber_id}"
    
    try:
        response = requests.delete(URL, headers=headers)
        response.raise_for_status()
        
        print(f"DEBUG: Suscriptor {email} eliminado del grupo {group_id} exitosamente. Status: {response.status_code}")
        return True
    
    except requests.exceptions.RequestException as e:
        if e.response and e.response.status_code == 404:
            print(f"WARNING: Suscriptor {email} no estaba en el grupo {group_id}.")
            return True
        print(f"ERROR al remover suscriptor del grupo {group_id}: {e}")
        return False
    except Exception as e:
        print(f"ERROR inesperado al remover suscriptor: {e}")
        return False

