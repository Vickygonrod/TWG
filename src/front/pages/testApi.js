// testApi.js
const testApiCall = async () => {
    try {
        const response = await fetch('https://animated-space-invention-r47gg4gqjrx53wwg6-3001.app.github.dev/api/events/1');
        const text = await response.text();
        console.log("Respuesta bruta de la API:", text);
    } catch (error) {
        console.error("Error al llamar a la API:", error);
    }
}

testApiCall();