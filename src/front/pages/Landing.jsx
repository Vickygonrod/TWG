import React from "react";
import "../styles/landingStyle.css"
import ebookimg from "../images/booksNBG.png"
import logo from "../images/logo.png"
import { NavbarLanding } from "../components/NavbarLanding";
import axios from "axios";
import { Link } from "react-router-dom";


export const Landing = () => {

    const BACKEND_URL = "https://animated-space-invention-r47gg4gqjrx53wwg6-3001.app.github.dev"; 

    const handlePurchaseClick = async () => {
        try {
            // Envía una solicitud POST a tu backend para crear la sesión de checkout de Stripe
            const response = await axios.post(`${BACKEND_URL}/api/create-checkout-session`, {
                // Puedes enviar aquí un ID de producto si tuvieras varios,
                // pero por ahora el backend ya sabe que es el "ebook_pack"
                product_id: 'ebook_pack' 
            });

            const { checkout_url } = response.data; // El backend nos devuelve la URL de Stripe

            if (checkout_url) {
                // Redirige al usuario directamente a la página de pago de Stripe
                window.location.href = checkout_url;
            } else {
                console.error("No se recibió una URL de checkout de Stripe.");
                alert("Hubo un problema al iniciar el pago. Inténtalo de nuevo más tarde.");
            }

        } catch (error) {
            console.error("Error al crear la sesión de checkout:", error);
            // Muestra un mensaje de error más amigable al usuario
            if (error.response && error.response.data && error.response.data.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                alert("Ocurrió un error inesperado al procesar tu solicitud de pago.");
            }
        }
    };


    return(
        <>
        <NavbarLanding />
        <div className="landing-page-wrapper">

            {/* --- Sección Principal/Hero --- */}
            <header className="hero">
                <div className="row headerRow">
                    <div className="leftheader col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <h1>Juega a Crear:</h1>
                        <h2>Reconecta con tu creatividad desde tu Niña Interior</h2>
                        <h4 className="subtitle">La guía esencial para mujeres que quieren transformar su perspectiva y reconectar con su esencia creativa a través del juego y la autoexploración.</h4>
                    </div>
                    <div className="col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                    <img src={ebookimg} className=""/>
                    </div>
                </div>
                <div className="cta-header">
                    <span className="pack-title">Pack eBook + Cuaderno de Ejercicios</span>
                    <div className="price-box">
                        <span className="original-price">20€</span>
                        <span className="current-price">15€</span>
                    </div>
                </div>
                <button className="btn btn-orange"
                onClick={handlePurchaseClick}
                >Comprar Pack</button>
            </header>

            {/* --- Sección de Descripción Libros --- */}
            <section className="features-section">
                <div className="container">
                    <p className="intro">Imagina que dentro de ti reside un jardín secreto de creatividad, un terreno fértil que quizás ha quedado un poco olvidado.  <br />
                            <br />Este eBook + Cuaderno de Ejercicios es tu llamado a <span className="bold">redescubrir tu esencia creativa</span> y a abrazar una <span className="bold">experiencia transformadora</span> que llenará tu vida de significado. </p>
                    <h3>Este pack incluye:</h3>
                    <div className="feature-grid">
                        <div className="feature-item">
                            <h4>eBook: Juega a Crear: Reconecta con tu creatividad desde tu Niña Interior</h4>
                            <p>
                            <br />
                            <br />
                            En esta guía interactiva aprenderás: 
                            <br />
                            <br />
                            <ul> 

                            <li><span className="bold">Descomprimir tu mente:</span> Libera el flujo de pensamientos y reduce la sensación de una mente congestionada. </li>
                            <br />
                            <li><span className="bold">Prepararte para crear:</span> Afina tus sentidos y crea un espacio mental y emocional fértil para que germinen las ideas. </li>
                            <br />
                            <li><span className="bold">Reflexionar y crecer:</span> Contempla tu obra, analiza el proceso y aprende de cada experiencia creativa. </li>
                            <br />
                            <li><span className="bold">Conectar con tu musa:</span> Un reencuentro con esa parte de ti que siempre ha sabido crear, jugar y expresarse sin barreras.</li></ul>
                            </p> 
                      
                        
                        </div>

                        <div className="feature-item">
                            <h4>Juega a Crear: Cuaderno de Ejercicios</h4>
                            <br /> <br />
                            <p>Este cuaderno interactivo es tu compañera perfecta para tu viaje con "The Women's Ground".  <br /> 
                                <br />Es tu espacio sagrado personal, tu <span className="bold">lienzo en blanco y tu laboratorio para la exploración creativa.</span>  Aquí, la inspiración cobra vida a través de la acción, invitándote a sumergirte profundamente en cada concepto. 
                                <br /><br />Prepárate para dibujar, escribir, pegar, sentir y, sobre todo, jugar.  Este es un lugar seguro para experimentar, celebrar tu progreso y honrar a la artista única que reside en ti.  <span className="bold">Tu creatividad es tu poder</span>, y este cuaderno es tu invitación a desatarla, paso a paso, página a página. 
                                <br />No dejes que la crítica interna te detenga.  <br />
                                <br /><span className="bold">¡Es hora de empezar a jugar y a sentirte libre!</span></p>
                          
                        </div>
                    
                    </div>
                </div>
            </section>

            

            {/* --- Sección Sobre la Autora/Comunidad --- */}
            <section className="about-author-section">
                <div className="container row">
                    <h3>Sobre The Women's Ground</h3>
                    <img src={logo} alt="logo" className="logo col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12"/>
                    <div className="author-content col-md-6 col-lg-6 col-xl-6 col-sm-12 col-xs-12">
                        <div>
                            <p>Soy Victoria González, y creé The Women's Ground y las técnicas que descubrirás en mis libros porque, como muchas mujeres, pasé años sintiéndome desconectada de mi esencia creativa. <br />
                            <br /> Este es un espacio único donde, a través del juego y actividades lúdicas, podrás reconectar con tu artista interior sin la presión de la perfección. <br />
                            <br />¡Es hora de soltar las expectativas y sentirte libre!</p>
                        <Link to="/community" className="btn btn-secondary"> Únete a la Comunidad</Link>  
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Testimonials --- */}
            <section className="testimonial-section">
                    <div className="testimonial-container row">
                        <div className="testimonial-item col-md-4 col-lg-4 col-xl-4 col-sm-12 col-xs-12">
                            <h5>¡Me ha devuelto mi chispa!</h5>
                            <p>
                            <br />
                            Como mamá y diseñadora, sentía que había perdido mi conexión con la creatividad. Pero el pack 'Juega a Crear' ha sido un antes y un después. 
                            <br /><br />El eBook me guió para encontrar esos momentos sagrados y el Cuaderno de Ejercicios me dio las herramientas prácticas para soltarme y jugar. Es increíble cómo puedo integrar mi arte en mi día a día sin culpa, 
                            ¡me ha devuelto mi chispa!
                            <br /><br /> Isabella García                        
                            </p> 
                        </div>

                        <div className="testimonial-item col-md-4 col-lg-4 col-xl-4 col-sm-12 col-xs-12">
                            <h5>Calma e inspiración</h5>
                            <p>
                            <br />
                            Mi trabajo es muy demandante y buscaba algo que me ayudara a desconectar y encontrar un equilibrio. 'Juega a Crear' es exactamente lo que necesitaba. Los ejercicios del cuaderno son súper efectivos para liberar el estrés y el enfoque del libro en la 'niña interior' me ayudó a redescubrir la alegría de crear sin presiones. 
                            <br /><br />Ahora siento una calma y una inspiración que antes no tenía.
                            <br /><br /> Sofía Rodríguez                        
                            </p> 
                        </div>

                         <div className="testimonial-item col-md-4 col-lg-4 col-xl-4 col-sm-12 col-xs-12">
                            <h5>¡Es liberador!</h5>
                            <p>
                            <br />
                            Siempre quise ser más creativa, pero la inseguridad me paralizaba. Este pack de 'Juega a Crear' fue la invitación perfecta. El libro me dio la confianza para empezar y el cuaderno me empujó a experimentar con ejercicios divertidos y sin juicios, como 'Dibuja sin Mirar'. 
                            <br /><br />Por primera vez, me siento libre para explorar mi lado artístico y no tengo miedo de equivocarme. ¡Es liberador!
                            <br /><br /> Valentina Hernández                        
                            </p> 
                        </div>

                    
                    </div>
            </section>

            {/* --- Last CTA --- */}
            <section id="buy-section" className="cta-section">
                <div className="container">
                    <h3>"La creatividad es la voz del alma femenina." </h3>
                    <p>Obtén tu copia del eBook y el Cuaderno de Ejercicios "Juega a Crear: Reconecta con tu creatividad desde tu Niña Interior" y descúbrela.</p>
                    <div className="cta-final-group">
                        <div className="price-box">
                            <span className="original-price">20€</span>
                            <span className="current-price">15€</span>
                        </div>
                        <button className="btn btn-orange"
                        onClick={handlePurchaseClick}
                        >Comprar Pack</button>  
                        </div>
                </div>
            </section>

        </div>
        </>
    );
};