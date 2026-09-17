/**
 * ============================================================
 * SENAIR — Motor de Internacionalización Completo (i18n ES / EN)
 * Traduce el 100% del portal dinámicamente: textos, inputs,
 * selects, botones, calendarios, cards y estado de vuelos.
 * ============================================================
 */

(function () {
  "use strict";

  const STORAGE_KEY = "senair_lang";
  let isTranslating = false; // Flag para evitar bucles con MutationObserver

  // Diccionario maestro bidireccional (Español <-> Inglés)
  const PHRASE_PAIRS = [
    // ── Topbar, Header & Navbar ────────────────────────────────
    ["Viaja con tranquilidad. Atención 24/7.", "Travel with peace of mind. 24/7 Support."],
    ["Vuelos", "Flights"],
    ["Destinos", "Destinations"],
    ["Ofertas", "Offers"],
    ["Contacto", "Contact"],
    ["Iniciar Sesión", "Log In"],
    ["Iniciar sesión", "Log In"],
    ["Cerrar sesión", "Log Out"],
    ["Gestionar reserva", "Manage booking"],
    ["Mis viajes", "My trips"],
    ["Usuario", "User"],
    ["Volver", "Back"],
    ["Volver al inicio", "Back to home"],
    ["Asistente Virtual SENAIR", "SENAIR Virtual Assistant"],
    ["Inicio de SENAIR", "SENAIR Home"],
    ["Abrir menú", "Open menu"],
    ["Cargando SENAIR", "Loading SENAIR"],

    // ── Buscador de Vuelos (Hero) ──────────────────────────────
    ["Una nueva forma de volar", "A new way to fly"],
    ["El mundo comienza donde termina la pista.", "The world begins where the runway ends."],
    ["Conecta con tus destinos favoritos disfrutando de una experiencia sencilla, cómoda y pensada para ti.", "Connect with your favorite destinations enjoying a simple, comfortable experience designed for you."],
    ["Ver Ofertas", "View Offers"],
    ["Tipo de viaje", "Trip type"],
    ["Ida y vuelta", "Round trip"],
    ["Solo ida", "One way"],
    ["Origen", "Origin"],
    ["Destino", "Destination"],
    ["Intercambiar origen y destino", "Swap origin and destination"],
    ["Salida", "Departure"],
    ["Regreso", "Return"],
    ["Fecha ida", "Departure date"],
    ["Fecha regreso", "Return date"],
    ["Selecciona una fecha", "Select a date"],
    ["Elige tu fecha", "Choose your date"],
    ["Mes anterior", "Previous month"],
    ["Mes siguiente", "Next month"],
    ["Cerrar calendario", "Close calendar"],
    ["Pasajeros", "Passengers"],
    ["Pasajero", "Passenger"],
    ["¿Quiénes vuelan?", "Who is flying?"],
    ["Adultos", "Adults"],
    ["Desde 15 años", "Age 15 and above"],
    ["Jóvenes", "Youths"],
    ["De 12 a 14 años", "Age 12 to 14"],
    ["Niños", "Children"],
    ["De 2 a 11 años", "Age 2 to 11"],
    ["Bebés", "Infants"],
    ["Menores de 2 años (1 por adulto)", "Under 2 years (1 per adult)"],
    ["Conoce la política para jóvenes.", "Learn about youth policy."],
    ["Confirmar", "Confirm"],
    ["Buscar", "Search"],
    ["Buscar vuelos", "Search flights"],
    ["Disminuir adultos", "Decrease adults"],
    ["Aumentar adultos", "Increase adults"],
    ["Disminuir jóvenes", "Decrease youths"],
    ["Aumentar jóvenes", "Increase youths"],
    ["Disminuir niños", "Decrease children"],
    ["Aumentar niños", "Increase children"],
    ["Disminuir bebés", "Decrease infants"],
    ["Aumentar bebés", "Increase infants"],

    // ── Quick Links (Bajo el buscador) ─────────────────────────
    ["Prepárate para viajar", "Prepare to travel"],
    ["Check-in", "Check-in"],
    ["Obtén tu pase de abordar online", "Get your boarding pass online"],
    ["Equipaje", "Baggage"],
    ["Consulta nuestras condiciones", "Check our baggage policy"],
    ["Estado del vuelo", "Flight status"],
    ["Información en tiempo real", "Real-time information"],
    ["Centro de ayuda", "Help Center"],
    ["Estamos aquí para ayudarte", "We are here to help you"],

    // ── Secciones de Inicio (Destinos & Ofertas destacadas) ─────
    ["Descubre Colombia", "Discover Colombia"],
    ["¿A dónde quieres ir?", "Where do you want to go?"],
    ["Escapadas urbanas, playas inolvidables y experiencias que recordarás siempre.", "Urban getaways, unforgettable beaches and moments you'll always cherish."],
    ["Historia, mar y color", "History, sea and colors"],
    ["La ciudad de la eterna primavera", "The city of eternal spring"],
    ["Una capital por descubrir", "A capital to discover"],
    ["Naturaleza junto al Caribe", "Nature along the Caribbean"],
    ["Ritmo y sabor del Pacífico", "Rhythm and flavor of the Pacific"],
    ["Vuelos desde", "Flights from"],
    ["Explora el mundo", "Explore the world"],
    ["Destinos internacionales", "International destinations"],
    ["Desde", "From"],
    ["Ver ofertas de París", "View Paris offers"],
    ["Ver ofertas de Barcelona", "View Barcelona offers"],
    ["Ver ofertas de Egipto", "View Egypt offers"],
    ["Ver ofertas de Tokio", "View Tokyo offers"],
    ["Ideas para tu próxima escapada", "Ideas for your next getaway"],
    ["Inspírate para tu próximo viaje", "Get inspired for your next journey"],
    ["Historias, sabores y paisajes colombianos que ya están esperando por ti.", "Colombian stories, flavors and landscapes waiting for you."],
    ["01 / Caribe", "01 / Caribbean"],
    ["02 / Montaña", "02 / Mountain"],
    ["03 / Isla", "03 / Island"],
    ["Caribe", "Caribbean"],
    ["Montaña", "Mountain"],
    ["Isla", "Island"],
    ["Historia, playas y calles llenas de color.", "History, beaches and colorful streets."],
    ["Naturaleza, café y paisajes increíbles.", "Nature, coffee and incredible landscapes."],
    ["El mar de siete colores te espera.", "The sea of seven colors awaits you."],
    ["Descubrir destinos", "Discover destinations"],
    ["Viaja a tu ritmo", "Travel at your own pace"],
    ["Tu viaje, a tu manera", "Your journey, your way"],
    ["Todo empieza con una ruta y se convierte en una experiencia hecha para ti.", "Everything begins with a route and turns into an experience made just for you."],
    ["Comodidad", "Comfort"],
    ["Espacios pensados para que disfrutes cada momento del viaje.", "Spaces designed so you enjoy every moment of your trip."],
    ["Experiencia sencilla", "Simple experience"],
    ["Todo lo que necesitas, en un solo lugar.", "Everything you need, all in one place."],
    ["Siempre contigo", "Always with you"],
    ["Estamos disponibles cuando nos necesites.", "We are available whenever you need us."],
    ["Mantente al día de las novedades", "Stay up to date with news"],
    ["Recibe ofertas exclusivas, novedades y consejos para tu próximo viaje.", "Get exclusive offers, news and tips for your next trip."],
    ["Tu correo electrónico", "Your email address"],
    ["Suscribirme", "Subscribe"],

    // ── Destinos (destinos.html) ───────────────────────────────
    ["Tu próxima historia empieza aquí", "Your next journey starts here"],
    ["Hay un lugar esperando por ti.", "There is a place waiting for you."],
    ["Descubre rutas llenas de sabor, naturaleza y nuevas perspectivas. Elige un destino y deja que SENAIR te acerque.", "Discover routes full of flavor, nature and new perspectives. Choose a destination and let SENAIR take you there."],
    ["Explorar destinos", "Explore destinations"],
    ["RUTA DESTACADA · COLOMBIA", "FEATURED ROUTE · COLOMBIA"],
    ["Elige tu próximo destino", "Choose your next destination"],
    ["Viajes para cada forma de explorar", "Trips for every way of exploring"],
    ["Busca una ciudad o experiencia", "Search for a city or experience"],
    ["Todos", "All"],
    ["Playa", "Beach"],
    ["Ciudad", "City"],
    ["Naturaleza", "Nature"],
    ["Internacional", "International"],
    ["Favorito del mes", "Favorite of the month"],
    ["Caribe colombiano", "Colombian Caribbean"],
    ["Vuelo directo", "Direct flight"],
    ["Calles con historia, mar turquesa y noches que se quedan contigo.", "Streets steeped in history, turquoise sea and nights that stay with you."],
    ["Ver vuelos", "View flights"],
    ["Antioquia", "Antioquia"],
    ["Todo el año", "All year round"],
    ["Arte, montañas y una energía creativa que transforma cada visita.", "Art, mountains and creative energy that transforms every visit."],
    ["Capital colombiana", "Colombian capital"],
    ["Conexiones", "Connections"],
    ["Museos, sabores y barrios que cuentan el pulso de Colombia.", "Museums, flavors and neighborhoods that tell the pulse of Colombia."],
    ["Caribe natural", "Natural Caribbean"],
    ["Sierra, selva y mar en una misma aventura frente al Caribe.", "Mountains, jungle and sea in a single Caribbean adventure."],
    ["Valle del Cauca", "Cauca Valley"],
    ["Ritmo local", "Local rhythm"],
    ["Salsa, cocina del Pacífico y atardeceres que invitan a quedarse.", "Salsa, Pacific cuisine and sunsets that invite you to stay."],
    ["Isla colombiana", "Colombian island"],
    ["Escapada", "Getaway"],
    ["El mar de siete colores y una pausa que se siente como vacaciones.", "The sea of seven colors and a break that feels like vacation."],
    ["Europa", "Europe"],
    ["Con conexión", "With connection"],
    ["Una escapada para mirar el mundo distinto.", "A getaway to look at the world differently."],
    ["Asia", "Asia"],
    ["Tradición, energía y una nueva perspectiva.", "Tradition, energy and a new perspective."],
    ["España", "Spain"],
    ["Arquitectura, mar y una ciudad para caminar.", "Architecture, sea and a city to walk around."],
    ["Arte, plazas y noches llenas de vida.", "Art, town squares and nights full of life."],
    ["Reino Unido", "United Kingdom"],
    ["Historia, diseño y rincones para descubrir.", "History, design and corners waiting to be discovered."],

    // ── Ofertas (ofertas.html) ─────────────────────────────────
    ["Elige tu próxima historia", "Choose your next story"],
    ["Ofertas que te llevan más lejos.", "Offers that take you further."],
    ["Rutas especiales, precios que inspiran y experiencias listas para despegar desde Colombia.", "Special routes, inspiring fares and experiences ready for takeoff from Colombia."],
    ["Explorar ofertas", "Explore offers"],
    ["SENAIR / DESTINO DESTACADO", "SENAIR / FEATURED DESTINATION"],
    ["Equipaje incluido", "Baggage included"],
    ["Selecciona tu plan", "Select your plan"],
    ["Encuentra una oferta hecha para ti", "Find an offer made for you"],
    ["Todas", "All"],
    ["Más elegida", "Most chosen"],
    ["Ver vuelo", "View flight"],
    ["Montaña y café", "Mountain and coffee"],
    ["Fin de semana", "Weekend"],
    ["La ciudad de la eterna primavera te espera.", "The city of eternal spring awaits you."],
    ["Cultura", "Culture"],
    ["Museos, sabores y una ciudad por descubrir.", "Museums, flavors and a city to discover."],
    ["Sol y mar", "Sun and sea"],
    ["Naturaleza junto al mar y días sin prisa.", "Nature by the sea and unhurried days."],
    ["Mar de siete colores", "Sea of seven colors"],
    ["Sabor local", "Local flavor"],
    ["Pacífico colombiano", "Colombian Pacific"],
    ["Ritmo, sabor y noches que se quedan contigo.", "Rhythm, flavor and nights that stay with you."],
    ["Mediterráneo", "Mediterranean"],
    ["Sol y ciudad", "Sun and city"],
    ["Estados Unidos", "United States"],
    ["Playas, música y una energía imposible de ignorar.", "Beaches, music and energy impossible to ignore."],
    ["Sabor y cultura", "Flavor and culture"],
    ["Perú", "Peru"],
    ["Una mesa increíble entre océano, historia y ciudad.", "An incredible culinary table between ocean, history and city."],
    ["Río de la Plata", "River Plate"],
    ["Argentina", "Argentina"],
    ["Tango, arquitectura y una ciudad que nunca duerme.", "Tango, architecture and a city that never sleeps."],
    ["No encontramos ofertas con ese filtro.", "No offers found with that filter."],
    ["Viaja como quieres", "Travel the way you want"],
    ["Una buena oferta también se siente en el camino.", "A great offer is also felt on the journey."],
    ["Elige tu ruta y deja que SENAIR se encargue de acercarte a lo que importa.", "Choose your route and let SENAIR bring you closer to what matters."],
    ["Las mejores ofertas llegan a tu correo.", "The best deals arrive in your email."],

    // ── Vuelos (vuelos.html & vuelos.js) ───────────────────────
    ["Encuentra tu próxima ruta", "Find your next route"],
    ["Vuelos disponibles", "Available flights"],
    ["Compara horarios, precios y conexiones para elegir cómo quieres llegar.", "Compare schedules, prices and connections to choose how you want to arrive."],
    ["Consultando tu ruta...", "Checking your route..."],
    ["Editar búsqueda", "Edit search"],
    ["Opciones para ti", "Options for you"],
    ["Vuelos encontrados", "Flights found"],
    ["Buscando...", "Searching..."],
    ["Ver resultados", "View results"],
    ["Todas las opciones", "All options"],
    ["Precio más bajo", "Lowest price"],
    ["Los precios mostrados son por pasajero e incluyen impuestos.", "Prices shown are per passenger and include taxes."],
    ["Buscando las mejores opciones...", "Searching for the best options..."],
    ["Estamos consultando la ruta seleccionada.", "We are querying the selected route."],
    ["No encontramos vuelos para esta búsqueda.", "We couldn't find flights for this search."],
    ["Prueba otra fecha o cambia el origen y destino.", "Try another date or change origin and destination."],
    ["Nueva búsqueda", "New search"],
    ["Equipaje de mano incluido", "Carry-on baggage included"],
    ["Equipaje de bodega incluido", "Checked baggage included"],
    ["Seleccionar", "Select"],
    ["Seleccionar asientos", "Select seats"],
    ["Seleccionar puestos", "Select seats"],
    ["Selecciona tu asiento", "Select your seat"],
    ["Asiento", "Seat"],
    ["Asientos", "Seats"],
    ["Asientos seleccionados", "Selected seats"],
    ["Total a pagar", "Total to pay"],
    ["Realizar pago", "Proceed to payment"],
    ["Pagar vuelo", "Pay flight"],
    ["Pago con tarjeta", "Card payment"],
    ["Pagar en cuotas", "Pay in installments"],
    ["Cuotas", "Installments"],
    ["Número de cuotas", "Number of installments"],
    ["1 cuota (sin interés)", "1 installment (interest-free)"],
    ["1 cuota", "1 installment"],
    ["3 cuotas", "3 installments"],
    ["6 cuotas", "6 installments"],
    ["12 cuotas", "12 installments"],
    ["24 cuotas", "24 installments"],
    ["36 cuotas", "36 installments"],
    ["Valor por cuota", "Amount per installment"],
    ["Factura de compra", "Purchase Invoice"],
    ["Factura comercial", "Commercial Invoice"],
    ["Factura electrónica", "Electronic Invoice"],
    ["Reserva confirmada", "Booking confirmed"],
    ["Código de reserva", "Booking code"],
    ["Pasajero principal", "Lead passenger"],
    ["Fecha de emisión", "Issue date"],
    ["Fecha de vuelo", "Flight date"],
    ["Hora de salida", "Departure time"],
    ["Hora de llegada", "Arrival time"],
    ["Descargar factura", "Download invoice"],
    ["Imprimir comprobante", "Print receipt"],
    ["Confirmación de reserva", "Booking confirmation"],
    ["Duración", "Duration"],
    ["Precio final por pasajero", "Final price per passenger"],

    // ── Mis Viajes & Millas (viajes.html) ──────────────────────
    ["Tu espacio SENAIR", "Your SENAIR space"],
    ["Mis viajes.", "My trips."],
    ["Guarda los destinos que te inspiran y tenlos listos para planear tu próxima ruta.", "Save the destinations that inspire you and have them ready to plan your next route."],
    ["SENAIR Rewards", "SENAIR Rewards"],
    ["Programa de Millas SENAIR Rewards", "SENAIR Rewards Miles Program"],
    ["Millas Acumuladas", "Accumulated Miles"],
    ["Millas acumuladas", "Accumulated Miles"],
    ["millas", "miles"],
    ["Nivel de viajero", "Traveler tier"],
    ["Nivel actual", "Current tier"],
    ["Plata · Explorador", "Silver · Explorer"],
    ["Oro · Aventurero", "Gold · Adventurer"],
    ["Platino · Trotamundos", "Platinum · Globetrotter"],
    ["Vuelos acumulados", "Accumulated flights"],
    ["vuelos", "flights"],
    ["Beneficio activo", "Active benefit"],
    ["Descuento en próximo vuelo", "Discount on next flight"],
    ["Próximos vuelos", "Upcoming flights"],
    ["Próximo viaje", "Next trip"],
    ["reservas", "bookings"],
    ["Aún no tienes vuelos confirmados.", "You don't have confirmed flights yet."],
    ["No tienes reservas activas por ahora.", "You have no active bookings right now."],
    ["Destinos guardados", "Saved destinations"],
    ["destinos guardados", "saved destinations"],
    ["Busca un destino", "Search a destination"],
    ["Buscar destino guardado", "Search saved destination"],
    ["Tu próximo viaje empieza con un favorito.", "Your next trip starts with a favorite."],
    ["Guarda destinos usando el corazón y aparecerán aquí.", "Save destinations using the heart and they will appear here."],

    // ── Contacto (contacto.html) ───────────────────────────────
    ["Estamos para ayudarte", "We are here to help you"],
    ["Hablemos de tu próximo viaje.", "Let's talk about your next trip."],
    ["¿Tienes una pregunta, necesitas ayuda con una reserva o quieres compartir una idea? El equipo SENAIR está listo para escucharte.", "Have a question, need help with a booking or want to share an idea? The SENAIR team is ready to listen."],
    ["Envíanos un mensaje", "Send us a message"],
    ["Cuéntanos cómo podemos ayudarte y te responderemos lo antes posible.", "Tell us how we can help and we'll reply as soon as possible."],
    ["Nombre completo", "Full name"],
    ["Tu nombre", "Your name"],
    ["Correo electrónico", "Email address"],
    ["Motivo de contacto", "Contact reason"],
    ["Selecciona una opción", "Select an option"],
    ["Ayuda con una reserva", "Help with a booking"],
    ["Consulta sobre vuelos", "Inquiry about flights"],
    ["Equipaje y documentación", "Baggage and documentation"],
    ["Sugerencia o comentario", "Suggestion or feedback"],
    ["(opcional)", "(optional)"],
    ["Ejemplo: AB12CD", "Example: AB12CD"],
    ["Mensaje", "Message"],
    ["Escribe aquí tu mensaje", "Write your message here"],
    ["Enviar mensaje", "Send message"],
    ["Enviar", "Send"],
    ["Canales de atención", "Customer care channels"],
    ["Correo", "Email"],
    ["Línea SENAIR", "SENAIR Helpline"],
    ["Línea de atención nacional", "National support helpline"],
    ["Resolvemos tus dudas todos los días.", "We resolve your doubts every day."],
    ["Horarios", "Hours"],
    ["Horario de atención", "Working hours"],
    ["Lunes a domingo, 24 horas", "Monday to Sunday, 24 hours"],
    ["Lunes a viernes: 7:00 a. m. a 8:00 p. m.", "Monday to Friday: 7:00 AM to 8:00 PM"],
    ["Sábados, domingos y festivos: 8:00 a. m. a 6:00 p. m.", "Saturdays, Sundays & Holidays: 8:00 AM to 6:00 PM"],
    ["Preguntas rápidas", "Quick FAQs"],
    ["¿Dónde consulto mi reserva?", "Where can I check my booking?"],
    ["Ingresa a tu cuenta para revisar tus viajes y el estado de cada reserva.", "Log into your account to review your trips and the status of each booking."],
    ["¿Puedo cambiar mi vuelo?", "Can I change my flight?"],
    ["Escríbenos con tu código de reserva y revisaremos las opciones disponibles.", "Write to us with your booking reference and we'll check available options."],
    ["¿Necesitas ayuda urgente?", "Need urgent help?"],
    ["Nuestra línea de atención está disponible para orientarte durante tu viaje.", "Our support line is available to guide you during your journey."],

    // ── Nosotros (nosotros.html) ───────────────────────────────
    ["Conócenos", "About Us"],
    ["Somos SENAIR.", "We are SENAIR."],
    ["Conectamos personas con sus destinos a través de una plataforma sencilla, confiable y pensada para cada viajero colombiano.", "We connect people with their destinations through a simple, reliable platform tailored for every Colombian traveler."],
    ["Nuestra misión", "Our Mission"],
    ["Facilitar la búsqueda, reserva y gestión de vuelos, acercando a las personas a los lugares y momentos que más importan.", "Facilitate flight search, booking and management, bringing people closer to the places and moments that matter most."],
    ["Nuestra visión", "Our Vision"],
    ["Ser la plataforma de viajes preferida en Colombia, reconocida por su transparencia, atención y facilidad de uso.", "To be Colombia's preferred travel platform, recognized for transparency, service and ease of use."],
    ["Nuestros valores", "Our Values"],
    ["Confianza, cercanía con el viajero, mejora constante y compromiso con la calidad del servicio en cada etapa del viaje.", "Trust, closeness with the traveler, continuous improvement and commitment to quality service at every stage of the trip."],
    ["El equipo detrás de SENAIR", "The team behind SENAIR"],
    ["Coordinación y Desarrollo Full Stack", "Full Stack Coordination & Development"],
    ["Diseño UI/UX y Frontend", "UI/UX Design & Frontend"],
    ["Arquitectura y Desarrollo", "Architecture & Development"],
    ["Desarrollo de Sistemas y QA", "Systems Development & QA"],

    // ── Login & Registro (login.html) ──────────────────────────
    ["Tu viaje empieza aquí", "Your journey starts here"],
    ["Todo SENAIR,", "All of SENAIR,"],
    ["más cerca de ti.", "closer to you."],
    ["Inicia sesión para guardar tus rutas, consultar tus reservas y volver a tus destinos favoritos en segundos.", "Log in to save your routes, check your bookings and return to your favorite destinations in seconds."],
    ["Registrarse", "Register"],
    ["Correo Electrónico", "Email Address"],
    ["Contraseña", "Password"],
    ["Confirmar contraseña", "Confirm password"],
    ["¿Olvidaste tu contraseña?", "Forgot your password?"],
    ["¿No tienes cuenta?", "Don't have an account?"],
    ["¿Ya tienes cuenta?", "Already have an account?"],
    ["Continuar con Google", "Continue with Google"],
    ["O Inicia Sesión con", "Or Log In with"],
    ["O Regístrate con", "Or Register with"],
    ["Aprende el acuerdo de licencia de usuario", "Read user license agreement"],
    ["Nombre", "Name"],
    // ── Checkout & Facturación (checkout.html & checkout.js) ──
    ["Completa tu viaje", "Complete your journey"],
    ["Elige tu asiento y confirma tu reserva.", "Choose your seat and confirm your booking."],
    ["Tu asiento estará reservado mientras completas este paso.", "Your seat will be reserved while you complete this step."],
    ["Selecciona tus asientos", "Select your seats"],
    ["Escoge tus asientos disponibles para continuar.", "Choose your available seats to continue."],
    ["Disponible", "Available"],
    ["Seleccionado", "Selected"],
    ["Ocupado", "Occupied"],
    ["Selecciona un asiento para continuar", "Select a seat to continue"],
    ["Tu vuelo", "Your flight"],
    ["Cargando vuelo...", "Loading flight..."],
    ["Sin seleccionar", "None selected"],
    ["Volver a vuelos", "Back to flights"],
    ["Formulario de pago", "Payment form"],
    ["Cerrar modal", "Close modal"],
    ["or pay using credit card", "or pay using credit card"],
    ["Card holder full name", "Card holder full name"],
    ["Enter your full name", "Enter your full name"],
    ["Card Number", "Card Number"],
    ["Expiry Date / CVV", "Expiry Date / CVV"],
    ["Pagar ahora", "Pay now"],
    ["PAGADA", "PAID"],
    ["Factura Electrónica de Venta", "Electronic Sales Invoice"],
    ["Facturado a:", "Billed to:"],
    ["Método de pago:", "Payment method:"],
    ["Tarjeta de Crédito", "Credit Card"],
    ["Código de Reserva:", "Booking Reference:"],
    ["Estado: Confirmado", "Status: Confirmed"],
    ["Descripción del servicio", "Service description"],
    ["Ruta y Fecha", "Route & Date"],
    ["Asiento(s)", "Seat(s)"],
    ["Total", "Total"],
    ["Tiquete Aéreo Nacional", "Domestic Airline Ticket"],
    ["Operado por SENAIR", "Operated by SENAIR"],
    ["Información legal:", "Legal information:"],
    ["Este documento representa el comprobante fiscal y ticket digital emitido por SENAIR. Vuelo sujeto a condiciones tarifarias y regulación de la Aeronáutica Civil.", "This document represents the official tax receipt and digital ticket issued by SENAIR. Flight subject to fare rules and Civil Aeronautics regulations."],
    ["Tarifa base del vuelo:", "Base flight fare:"],
    ["Tasas aeroportuarias e IVA (19%):", "Airport taxes and VAT (19%):"],
    ["Total pagado:", "Total paid:"],
    ["Imprimir factura", "Print invoice"],
    ["Reserva confirmada", "Booking confirmed"],
    ["¡Tu viaje está listo!", "Your trip is ready!"],
    ["Ver mis viajes", "View my trips"],
    ["1 cuota (pago directo)", "1 installment (direct payment)"],

    // ── Modales & Footer ───────────────────────────────────────
    ["Gestiona tu viaje", "Manage your trip"],
    ["Introduce tus datos para continuar.", "Enter your details to continue."],
    ["Código de reserva o correo electrónico", "Booking reference or email address"],
    ["Cerrar", "Close"],
    ["Continuar", "Continue"],
    ["Conectando destinos, impulsando oportunidades.", "Connecting destinations, inspiring opportunities."],
    ["Sobre nosotros", "About us"],
    ["Nosotros", "About us"],
    ["Ayuda", "Help"],
    ["Legal", "Legal"],
    ["Términos y condiciones", "Terms and conditions"],
    ["Política de privacidad", "Privacy policy"],
    ["© 2026 SENAIR. Todos los derechos reservados.", "© 2026 SENAIR. All rights reserved."],
    ["Colombia · COP · Español", "Colombia · COP · English"]
  ];

  // Mapas compilados
  const ES_TO_EN = new Map();
  const EN_TO_ES = new Map();

  PHRASE_PAIRS.forEach(([es, en]) => {
    const esTrim = es.trim();
    const enTrim = en.trim();
    ES_TO_EN.set(esTrim, enTrim);
    EN_TO_ES.set(enTrim, esTrim);
    // Versiones minúsculas para comparaciones insensibles a mayúsculas
    ES_TO_EN.set(esTrim.toLowerCase(), enTrim);
    EN_TO_ES.set(enTrim.toLowerCase(), esTrim);
  });

  function getCurrentLanguage() {
    return localStorage.getItem(STORAGE_KEY) || "es";
  }

  function setLanguage(lang) {
    if (lang !== "es" && lang !== "en") lang = "es";
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    applyTranslationsToPage(lang);
    updateSwitcherButtons(lang);

    // Disparar evento para componentes dinámicos (Chatbot, etc.)
    window.dispatchEvent(new CustomEvent("senair:langchange", { detail: { lang } }));
  }

  function updateSwitcherButtons(lang) {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang");
      if (btnLang === lang) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // Traducción de un texto individual
  function translateString(raw, targetLang) {
    if (!raw || typeof raw !== "string") return raw;
    const clean = raw.trim();
    if (!clean) return raw;

    // 1. Coincidencia exacta en mapa
    if (targetLang === "en") {
      if (ES_TO_EN.has(clean)) return ES_TO_EN.get(clean);
      if (ES_TO_EN.has(clean.toLowerCase())) return ES_TO_EN.get(clean.toLowerCase());
    } else {
      if (EN_TO_ES.has(clean)) return EN_TO_ES.get(clean);
      if (EN_TO_ES.has(clean.toLowerCase())) return EN_TO_ES.get(clean.toLowerCase());
    }

    // 2. Patrones con números y dinámicos
    if (targetLang === "en") {
      // "6 destinos disponibles" -> "6 destinations available"
      if (/^(\d+)\s+destinos?\s+disponibles?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+destinos?\s+disponibles?$/i, "$1 destinations available");
      }
      // "12 ofertas disponibles" -> "12 offers available"
      if (/^(\d+)\s+ofertas?\s+disponibles?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+ofertas?\s+disponibles?$/i, "$1 offers available");
      }
      // "0 reservas" -> "0 bookings"
      if (/^(\d+)\s+reservas?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+reservas?$/i, "$1 bookings");
      }
      // "0 destinos guardados" -> "0 saved destinations"
      if (/^(\d+)\s+destinos?\s+guardados?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+destinos?\s+guardados?$/i, "$1 saved destinations");
      }
      // "0 vuelos" -> "0 flights"
      if (/^(\d+)\s+vuelos?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+vuelos?$/i, "$1 flights");
      }
      // "1 vuelo visible de 10" -> "1 visible flight out of 10"
      if (/^(\d+)\s+vuelo\s+visible\s+de\s+(\d+)$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+vuelo\s+visible\s+de\s+(\d+)$/i, "$1 visible flight out of $2");
      }
      // "0 millas" -> "0 miles"
      if (/^(\d+)\s+millas?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+millas?$/i, "$1 miles");
      }
      // "Vuelos desde $189.000 COP" -> "Flights from $189.000 COP"
      if (/^Vuelos\s+desde\s+([$\d.,]+)\s*COP$/i.test(clean)) {
        return clean.replace(/^Vuelos\s+desde\s+([$\d.,]+)\s*COP$/i, "Flights from $1 COP");
      }
      // "Desde $189.000 COP" -> "From $189.000 COP"
      if (/^Desde\s+([$\d.,]+)\s*COP$/i.test(clean)) {
        return clean.replace(/^Desde\s+([$\d.,]+)\s*COP$/i, "From $1 COP");
      }
      // "Meta: 3.000 millas (Nivel Oro)"
      if (/^Meta:\s*([\d.,]+)\s*millas\s*\(([^)]+)\)$/i.test(clean)) {
        return clean.replace(/^Meta:\s*([\d.,]+)\s*millas\s*\(([^)]+)\)$/i, "Target: $1 miles ($2)");
      }
      // "1 adulto" -> "1 adult", "2 adultos" -> "2 adults"
      if (/^(\d+)\s+adultos?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "adult" : "adults"}`;
      }
      // "1 pasajero" -> "1 passenger", "2 pasajeros" -> "2 passengers"
      if (/^(\d+)\s+pasajeros?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "passenger" : "passengers"}`;
      }
      // "1 escala" -> "1 stop", "2 escalas" -> "2 stops"
      if (/^(\d+)\s+escalas?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "stop" : "stops"}`;
      }
      // "Escoge X asientos disponibles para continuar."
      if (/^Escoge\s+(\d+)\s+asientos?\s+disponibles?\s+para\s+continuar\.$/i.test(clean)) {
        return clean.replace(/^Escoge\s+(\d+)\s+asientos?\s+disponibles?\s+para\s+continuar\.$/i, "Choose $1 available seat(s) to continue.");
      }
      // "X cuotas de $Y / mes"
      if (/^(\d+)\s+cuotas\s+de\s+([$\d.,]+)\s*\/\s*mes$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+cuotas\s+de\s+([$\d.,]+)\s*\/\s*mes$/i, "$1 installments of $2 / month");
      }
      // "Operado por X"
      if (/^Operado\s+por\s+(.+)$/i.test(clean)) {
        return clean.replace(/^Operado\s+por\s+(.+)$/i, "Operated by $1");
      }
      // "Vuelos de X a Y"
      if (/^Vuelos\s+de\s+(.+)\s+a\s+(.+)$/i.test(clean)) {
        return clean.replace(/^Vuelos\s+de\s+(.+)\s+a\s+(.+)$/i, "Flights from $1 to $2");
      }
    } else {
      // Reversos de inglés a español
      if (/^(\d+)\s+destinations?\s+available$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+destinations?\s+available$/i, "$1 destinos disponibles");
      }
      if (/^(\d+)\s+offers?\s+available$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+offers?\s+available$/i, "$1 ofertas disponibles");
      }
      if (/^(\d+)\s+bookings?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+bookings?$/i, "$1 reservas");
      }
      if (/^(\d+)\s+saved\s+destinations?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+saved\s+destinations?$/i, "$1 destinos guardados");
      }
      if (/^(\d+)\s+flights?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+flights?$/i, "$1 vuelos");
      }
      if (/^(\d+)\s+visible\s+flight\s+out\s+of\s+(\d+)$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+visible\s+flight\s+out\s+of\s+(\d+)$/i, "$1 vuelo visible de $2");
      }
      if (/^(\d+)\s+miles?$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+miles?$/i, "$1 millas");
      }
      if (/^Flights\s+from\s+([$\d.,]+)\s*COP$/i.test(clean)) {
        return clean.replace(/^Flights\s+from\s+([$\d.,]+)\s*COP$/i, "Vuelos desde $1 COP");
      }
      if (/^From\s+([$\d.,]+)\s*COP$/i.test(clean)) {
        return clean.replace(/^From\s+([$\d.,]+)\s*COP$/i, "Desde $1 COP");
      }
      if (/^Target:\s*([\d.,]+)\s*miles\s*\(([^)]+)\)$/i.test(clean)) {
        return clean.replace(/^Target:\s*([\d.,]+)\s*miles\s*\(([^)]+)\)$/i, "Meta: $1 millas ($2)");
      }
      if (/^(\d+)\s+adults?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "adulto" : "adultos"}`;
      }
      if (/^(\d+)\s+passengers?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "pasajero" : "pasajeros"}`;
      }
      if (/^(\d+)\s+stops?$/i.test(clean)) {
        const count = parseInt(clean, 10);
        return `${count} ${count === 1 ? "escala" : "escalas"}`;
      }
      if (/^Choose\s+(\d+)\s+available\s+seat\(s\)\s+to\s+continue\.$/i.test(clean)) {
        return clean.replace(/^Choose\s+(\d+)\s+available\s+seat\(s\)\s+to\s+continue\.$/i, "Escoge $1 asientos disponibles para continuar.");
      }
      if (/^(\d+)\s+installments\s+of\s+([$\d.,]+)\s*\/\s*month$/i.test(clean)) {
        return clean.replace(/^(\d+)\s+installments\s+of\s+([$\d.,]+)\s*\/\s*month$/i, "$1 cuotas de $2 / mes");
      }
      if (/^Operated\s+by\s+(.+)$/i.test(clean)) {
        return clean.replace(/^Operated\s+by\s+(.+)$/i, "Operado por $1");
      }
      if (/^Flights\s+from\s+(.+)\s+to\s+(.+)$/i.test(clean)) {
        return clean.replace(/^Flights\s+from\s+(.+)\s+to\s+(.+)$/i, "Vuelos de $1 a $2");
      }
    }

    return raw;
  }

  function translateNode(node, targetLang) {
    if (node.nodeType === Node.TEXT_NODE) {
      const raw = node.nodeValue;
      if (!raw || !raw.trim()) return;

      // Guardar el texto español original en el nodo
      if (!node._senairOrig) {
        node._senairOrig = raw;
      }

      const original = node._senairOrig;
      const leading = original.match(/^\s*/)[0];
      const trailing = original.match(/\s*$/)[0];
      const core = original.trim();

      if (targetLang === "en") {
        const trans = translateString(core, "en");
        if (trans !== core) {
          node.nodeValue = leading + trans + trailing;
        }
      } else {
        // Restaurar español original
        node.nodeValue = original;
      }
    }
  }

  function applyTranslationsToPage(targetLang) {
    if (isTranslating) return;
    isTranslating = true;

    try {
      // 1. Árbol de nodos de texto
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (["script", "style", "code", "pre"].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest(".ai-messages-list, .lang-switch, .choices__list--dropdown")) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
      }
      textNodes.forEach((node) => translateNode(node, targetLang));

      // 2. Elementos de formulario: Placeholders
      document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
        if (!el._senairOrigPh) {
          el._senairOrigPh = el.getAttribute("placeholder");
        }
        if (targetLang === "en") {
          const trans = translateString(el._senairOrigPh, "en");
          el.setAttribute("placeholder", trans);
        } else {
          el.setAttribute("placeholder", el._senairOrigPh);
        }
      });

      // 3. Botones tipo submit / input con value
      document.querySelectorAll("input[type='submit'][value], input[type='button'][value]").forEach((el) => {
        if (!el._senairOrigVal) {
          el._senairOrigVal = el.value;
        }
        if (targetLang === "en") {
          el.value = translateString(el._senairOrigVal, "en");
        } else {
          el.value = el._senairOrigVal;
        }
      });

      // 4. Opciones de selectores
      document.querySelectorAll("select option").forEach((opt) => {
        if (!opt._senairOrigText) {
          opt._senairOrigText = opt.textContent;
        }
        if (targetLang === "en") {
          opt.textContent = translateString(opt._senairOrigText, "en");
        } else {
          opt.textContent = opt._senairOrigText;
        }
      });

      // 5. Botones interactivos con aria-label o title
      document.querySelectorAll("[aria-label], [title]").forEach((el) => {
        if (el.classList.contains("lang-btn")) return;
        const aria = el.getAttribute("aria-label");
        if (aria) {
          if (!el._senairOrigAria) el._senairOrigAria = aria;
          el.setAttribute("aria-label", targetLang === "en" ? translateString(el._senairOrigAria, "en") : el._senairOrigAria);
        }
        const title = el.getAttribute("title");
        if (title) {
          if (!el._senairOrigTitle) el._senairOrigTitle = title;
          el.setAttribute("title", targetLang === "en" ? translateString(el._senairOrigTitle, "en") : el._senairOrigTitle);
        }
      });

      // 6. Botón de Iniciar Sesión en Navbar
      const loginNavText = document.querySelector(".login-link .text, .mobile-login-link");
      if (loginNavText) {
        loginNavText.textContent = targetLang === "en" ? "Log In" : "Iniciar Sesión";
      }

      // 7. Copyright & Locale en footer
      const localeEl = document.querySelector(".copyright span:last-child, .footer-row span:first-child");
      if (localeEl && (localeEl.textContent.includes("Colombia") || localeEl.textContent.includes("©"))) {
        if (localeEl.textContent.includes("Español") || localeEl.textContent.includes("English")) {
          localeEl.textContent = targetLang === "en" ? "Colombia · COP · English" : "Colombia · COP · Español";
        }
      }

    } finally {
      isTranslating = false;
    }
  }

  // Observador de cambios en el DOM para traducir contenido dinámico (resultados de vuelos, modales, etc.)
  function setupMutationObserver() {
    let debounceTimer = null;
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      const currentLang = getCurrentLanguage();
      if (currentLang === "es") return; // Si es español, ya viene en español del DOM

      let hasRelevantMutation = false;
      for (const m of mutations) {
        if (m.type === "childList" && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && !node.closest(".ai-messages-list, .lang-switch")) {
              hasRelevantMutation = true;
              break;
            }
          }
        }
        if (hasRelevantMutation) break;
      }

      if (hasRelevantMutation) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          applyTranslationsToPage(currentLang);
        }, 120);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function initI18n() {
    // Delegación de clic para botones de idioma
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn) return;
      const lang = btn.getAttribute("data-lang");
      if (lang) {
        setLanguage(lang);
      }
    });

    const initialLang = getCurrentLanguage();
    setLanguage(initialLang);
    setupMutationObserver();

    window.addEventListener("load", () => {
      const cur = getCurrentLanguage();
      if (cur === "en") {
        applyTranslationsToPage("en");
      }
    });
  }

  // API pública
  window.SenairI18n = {
    getLanguage: getCurrentLanguage,
    setLanguage: setLanguage,
    t: (text) => translateString(text, getCurrentLanguage())
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initI18n);
  } else {
    initI18n();
  }
})();
