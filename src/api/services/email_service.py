import os
import requests 
from mailersend import emails 

def send_contact_form_email(
    to_email,
    from_email,
    from_name,
    subject,
    template_data
):
    # --- TEMPORALMENTE DESHABILITADO PARA DEBUGGING ---
    print("WARNING: send_contact_form_email está deshabilitado temporalmente para debugging.")
    return True
    # -------------------------------------------------

    mailersend_api_key = os.getenv("MAILERSEND_API_KEY")
    print(f"DEBUG: MAILERSEND_API_KEY cargada: {'Sí' if mailersend_api_key else 'No'} (Longitud: {len(mailersend_api_key) if mailersend_api_key else 0})")
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
    
    TEMPLATE_ID_ES = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_ES")
    TEMPLATE_ID_EN = os.getenv("MAILERSEND_TEMPLATE_DOWNLOAD_EN")
    
    template_id = TEMPLATE_ID_ES if language == 'es' else TEMPLATE_ID_EN
    
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
        

# --- NUEVAS FUNCIONES PARA MOVER SUSCRIPTORES ---

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
        return True # Retorna True para no romper el flujo
    
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
        # La API devuelve 204 No Content para éxito, o 404 si el suscriptor no está en el grupo.
        if e.response and e.response.status_code == 404:
            print(f"WARNING: Suscriptor {email} no estaba en el grupo {group_id}. No se requiere acción.")
            return True
        print(f"ERROR al remover suscriptor del grupo {group_id}: {e}")
        return False
    except Exception as e:
        print(f"ERROR inesperado al remover suscriptor: {e}")
        return False