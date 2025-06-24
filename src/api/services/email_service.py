import os
import requests 
from mailersend import emails 

# --- FUNCIÓN PARA ENVIAR EMAILS TRANSACCIONALES (NOTIFICACIÓN DE CONTACTO) CON MAILERSEND ---
def send_contact_form_email(
    to_email,
    from_email,
    from_name,
    subject,
    template_data
):
    mailersend_api_key = os.getenv("MAILERSEND_API_KEY")
    print(f"DEBUG: MAILERSEND_API_KEY cargada: {'Sí' if mailersend_api_key else 'No'} (Longitud: {len(mailersend_api_key) if mailersend_api_key else 0})") # <--- AÑADE ESTA LÍNEA
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

        # Si el envío es exitoso, el SDK no lanzará una excepción
        response = mailer.send(mail_body)

        print(f"DEBUG: Email de notificación enviado con MailerSend. Respuesta API: {response}")

        # Si llegamos a este punto sin que se lance ninguna excepción, el envío fue exitoso.
        return True

    except Exception as e: # <-- Capturamos la excepción general aquí. Esto es seguro.
        # Esto capturará cualquier error, incluyendo los de la librería MailerSend
        # o problemas de red. El mensaje 'e' contendrá los detalles.
        print(f"ERROR al enviar email con MailerSend: {e}")
        return False

# --- FUNCIÓN PARA AÑADIR SUSCRIPTORES A MAILERLITE (PLATAFORMA DE MARKETING) ---
def add_subscriber_to_mailerlite(email, first_name, last_name, group_id=None):
    """
    Añade o actualiza un suscriptor en una lista/grupo en MailerLite (la plataforma de marketing).

    :param email: Email del suscriptor.
    :param first_name: Nombre del suscriptor.
    :param last_name: Apellido del suscriptor.
    :param group_id: ID del grupo al que añadir el suscriptor (opcional, recomendado si organizas por grupos).
    """
    mailerlite_api_key = os.getenv("MAILERLITE_API_KEY")
    if not mailerlite_api_key:
        print("ERROR: MAILERLITE_API_KEY no configurada. No se puede añadir suscriptor a MailerLite.")
        return False

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {mailerlite_api_key}"
    }

    # ¡IMPORTANTE! VERIFICA LA URL DE LA API DE MAILERLITE EN TU CUENTA.
    # La URL más común para la API v3 (con endpoint v2) es:
    URL = "https://api.mailerlite.com/api/v2/subscribers"
    # Si estás en una cuenta muy antigua de MailerLite "Classic", podría ser:
    # URL = "https://connect.mailerlite.com/api/subscribers"

    payload = {
        "email": email,
        "fields": {
            "name": first_name,
            "last_name": last_name
        }
    }

    # Si se proporciona un group_id, añade el suscriptor a ese grupo
    if group_id:
        payload["groups"] = [group_id]

    try:
        response = requests.post(URL, headers=headers, json=payload)
        response.raise_for_status() # Esto lanzará un error si el código de estado HTTP es 4xx o 5xx

        print(f"DEBUG: Suscriptor {email} enviado a MailerLite. Status Code: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"ERROR al añadir suscriptor a MailerLite (RequestException): {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"MailerLite API Response: {e.response.json()}") # Imprime la respuesta JSON de la API si está disponible
        return False
    except Exception as e:
        print(f"ERROR inesperado al añadir suscriptor a MailerLite: {e}")
        return False