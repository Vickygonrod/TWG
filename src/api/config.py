import os
from dotenv import load_dotenv

load_dotenv() # Carga las variables de entorno

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')
    FRONTEND_URL = os.getenv('FRONTEND_URL')

    # Configuración del producto (puedes moverlo a una DB más adelante si tienes muchos productos)
    PRODUCT_INFO = {
        "ebook_pack": {
            "name": "Pack eBook + Cuaderno de Ejercicios",
            "price_cents": 1500, # Precio en centavos (15.00 EUR)
            "currency": "eur",
            "description": "Tu guía esencial para reconectar con la creatividad.",
            "image_url": "https://example.com/your-ebook-image.png" # URL pública de una imagen de tu producto
        }
    }