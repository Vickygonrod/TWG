import os
from dotenv import load_dotenv

load_dotenv() # Carga las variables de entorno

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    FRONTEND_URL = os.getenv('FRONTEND_URL')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://127.0.0.1:5000')
    MAILERLITE_EVENT_GROUP_ID = os.getenv('MAILERLITE_EVENT_GROUP_ID')
    MAILERLITE_GROUP_YOGA_PORTRAIT = os.getenv("MAILERLITE_GROUP_YOGA_PORTRAIT")
   

    STRIPE_PRICE_ID_ES = 'price_1RXrctCdOcKHFOeVgQHbd1Lb'
    STRIPE_PRICE_ID_EN = 'price_1RXrdaCdOcKHFOeV2PJwznvr'


    PRODUCT_INFO = {
        'price_1RXrctCdOcKHFOeVgQHbd1Lb': { # Usa el Price ID como clave
        'name': 'Juega a Crear Pack (Español)',
        'description': 'Pack de Ebooks en español',
        'file_path': 'files/Juega_a_Crear_Pack.zip' # Para la descarga
        },

        'price_1RXrdaCdOcKHFOeV2PJwznvr': { # Usa el Price ID como clave
        'name': 'Play and Create (English)',
        'description': 'eBook pack',
        'file_path': 'files/Play_and_Create_Pack.zip' # Para la descarga
        },
        }
    
