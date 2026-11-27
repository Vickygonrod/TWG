import privateRoomImage from "../images/habIndi.png";
import doubleRoomImage from "../images/hab2.png";
import sharedRoomImage from "../images/hab4.png";

export const retreatConfig = {
    location: "Gran Canaria",
    duration: 4,
    nights: 3,
    dates: null,
    currency: "EUR",

    // Cambiar manualmente a 3, 2 o 0.
    installmentCount: 3
};

export const retreatRooms = {
    private: {
        id: "private",
        name: "Habitación privada",
        subtitle: "Un espacio solo para ti.",
        description: "Disfruta de la tranquilidad de tener tu propio espacio durante el retiro.",
        image: privateRoomImage,

        gallery: [
            {
                src: privateRoomImage,
                caption: "Habitación privada"
            }
        ],

        capacity: 1,
        features: [
            "Uso individual",
            "Alojamiento durante el retiro"
        ],

        price: null,

        paymentOptions: {
            full: {
                enabled: true,
                checkoutUrl: null
            },
            installments: {
                enabled: true,
                checkoutUrls: {
                    3: null,
                    2: null
                }
            }
        }
    },

    double: {
        id: "double",
        name: "Habitación doble",
        subtitle: "Comparte la experiencia.",
        description: "Un espacio para compartir, descansar y disfrutar de estos días en compañía.",
        image: doubleRoomImage,

        gallery: [
            {
                src: doubleRoomImage,
                caption: "Habitación doble"
            }
        ],

        capacity: 2,
        features: [
            "Habitación para dos personas",
            "Alojamiento durante el retiro"
        ],

        price: null,

        paymentOptions: {
            full: {
                enabled: true,
                checkoutUrl: null
            },
            installments: {
                enabled: true,
                checkoutUrls: {
                    3: null,
                    2: null
                }
            }
        }
    },

    shared: {
        id: "shared",
        name: "Habitación compartida",
        subtitle: "Disfruta en compañía.",
        description: "Una opción para compartir la experiencia con otras participantes del retiro.",
        image: sharedRoomImage,

        gallery: [
            {
                src: sharedRoomImage,
                caption: "Habitación compartida"
            }
        ],

        capacity: 4,
        features: [
            "Habitación compartida",
            "Alojamiento durante el retiro"
        ],

        price: null,

        paymentOptions: {
            full: {
                enabled: true,
                checkoutUrl: null
            },
            installments: {
                enabled: true,
                checkoutUrls: {
                    3: null,
                    2: null
                }
            }
        }
    }
};