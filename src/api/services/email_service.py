import os
import requests # Necesario para la API de MailerLite (gestión de suscriptores)
from mailersend import emails # <-- ¡ESTA ES LA IMPORTACIÓN CORRECTA SEGÚN TU DOC!

# --- FUNCIÓN PARA ENVIAR EMAILS TRANSACCIONALES (NOTIFICACIÓN DE CONTACTO) CON MAILERSEND ---
def send_contact_form_email(
    to_email,
    from_email,
    from_name,
    subject,
    template_data
):
    """
    Envía un email usando MailerSend (para notificaciones transaccionales como el formulario de contacto).

    :param to_email: La dirección de correo del destinatario (tú).
    :param from_email: La dirección de correo verificada en MailerLite/MailerSend (tu Sender Identity).
    :param from_name: El nombre que aparecerá como remitente.
    :param subject: El asunto del email.
    :param template_data: Un diccionario con los datos a mostrar en el email.
    """

    mailersend_api_key = os.getenv("MAILERSEND_API_KEY")
    if not mailersend_api_key:
        print("ERROR: MAILERSEND_API_KEY no configurada. No se puede enviar el email de notificación.")
        return False

    try:
        # Crea una instancia de NewEmail (según la documentación)
        mailer = emails.NewEmail(mailersend_api_key)

        # Define el cuerpo del email como un diccionario vacío para poblar
        mail_body = {}

        # Remitente
        mail_from = {
            "name": from_name,
            "email": from_email,
        }
        mailer.set_mail_from(mail_from, mail_body)

        # Destinatario
        recipients = [
            {
                "name": template_data.get('first_name'), # Podemos usar el nombre del remitente del form
                "email": to_email,
            }
        ]
        mailer.set_mail_to(recipients, mail_body)

        # Asunto
        mailer.set_subject(subject, mail_body)

        # Contenido HTML
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

        # Envía el email
        response = mailer.send(mail_body) # <-- EL MÉTODO SEND RECIBE EL mail_body

        # La documentación sugiere que print(mailer.send(mail_body)) devuelve el estado y los datos
        # Así que 'response' debería contener esa información.
        # Por ejemplo, si imprime un diccionario, podríamos buscar 'status_code' o similar.
        print(f"DEBUG: Email de notificación enviado con MailerSend. Respuesta: {response}")

        # La librería MailerSend devuelve un diccionario o None si hay error.
        # Si la respuesta es un diccionario con 'message' o similar y no hay excepción,
        # asumimos que fue exitoso.
        if response and "message" in response and "success" in response.get("message", "").lower():
            return True
        elif response and "status_code" in response and response["status_code"] in [200, 202]: # Por si acaso lo devuelve así
            return True
        else:
            print(f"ERROR: Fallo al enviar email con MailerSend. Detalles: {response}")
            return False

    except Exception as e: # Captura cualquier excepción que pueda ocurrir durante el envío
        print(f"ERROR inesperado al enviar email con MailerSend: {e}")
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