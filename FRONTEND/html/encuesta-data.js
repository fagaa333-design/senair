/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Encuesta Scrollytelling de Alta Gama
 * Configuración Central de Datos, Preguntas y Escenas
 * ═════════════════════════════════════════════════════════════════════════
 */

const SURVEY_DATA = {
  ENDPOINT: "/api/survey/submit",

  // Preguntas de la experiencia
  QUESTIONS: [
    {
      id: "q1_satisfaction",
      escena: 7,
      parte: "part1",
      numero: "01",
      tipo: "rating5",
      obligatoria: true,
      texto: "¿Cuál es tu nivel de satisfacción general con SENAIR?",
      subtexto: "Evalúa tu percepción global del servicio y la experiencia de vuelo.",
      labels: {
        1: "Muy insatisfecho",
        2: "Insatisfecho",
        3: "Aceptable",
        4: "Satisfecho",
        5: "¡Totalmente satisfecho!"
      }
    },
    {
      id: "q2_ease",
      escena: 7,
      parte: "part1",
      numero: "02",
      tipo: "rating5",
      obligatoria: true,
      texto: "¿Qué tan fácil e intuitivo fue comprar y gestionar tu reserva?",
      subtexto: "Califica la agilidad de nuestra plataforma web y procesos digitales.",
      labels: {
        1: "Muy complejo",
        2: "Algo difícil",
        3: "Estándar",
        4: "Rápido y claro",
        5: "¡Excelente y sin fricción!"
      }
    },
    {
      id: "q3_punctuality",
      escena: 7,
      parte: "part1",
      numero: "03",
      tipo: "single",
      obligatoria: true,
      texto: "¿Cómo calificas la puntualidad e itinerarios de tu vuelo?",
      subtexto: "El cumplimiento de horarios es un pilar fundamental en SENAIR.",
      opciones: [
        { val: "Excelente", label: "Excelente", sub: "Despegue y arribo con total puntualidad" },
        { val: "Buena", label: "Buena", sub: "Cumplimiento adecuado de la programación" },
        { val: "Regular", label: "Regular", sub: "Ligeros minutos de espera en puerta" },
        { val: "Mala", label: "Mala", sub: "Retrasos notorios que afectaron mi viaje" }
      ]
    },
    {
      id: "q4_improvements",
      escena: 9,
      parte: "part2",
      numero: "04",
      tipo: "multiple",
      obligatoria: true,
      texto: "¿Qué aspectos de SENAIR consideras que podríamos potenciar?",
      subtexto: "Selecciona una o más opciones que marquen la diferencia para ti.",
      opciones: [
        { val: "Servicio a bordo", label: "Servicio a bordo", icon: "☕" },
        { val: "Comodidad del asiento", label: "Comodidad del asiento", icon: "💺" },
        { val: "Equipaje y bodega", label: "Gestión de equipaje", icon: "🧳" },
        { val: "Atención al cliente", label: "Atención y soporte 24/7", icon: "💬" },
        { val: "Precios y ofertas", label: "Precios y tarifas claras", icon: "🏷️" },
        { val: "Check-in y web", label: "Check-in web y mapa 3D", icon: "📱" }
      ]
    },
    {
      id: "q5_nps",
      escena: 9,
      parte: "part2",
      numero: "05",
      tipo: "nps",
      obligatoria: true,
      texto: "¿Qué tan probable es que recomiendes SENAIR a amigos o colegas?",
      subtexto: "Escala NPS oficial del 0 (Poco probable) al 10 (¡Definitivamente sí!)."
    },
    {
      id: "q6_feedback",
      escena: 10,
      parte: "resumen",
      numero: "06",
      tipo: "text",
      obligatoria: false,
      texto: "Comentario adicional o sugerencia libre",
      subtexto: "Tus ideas son revisadas directamente por nuestro equipo de innovación.",
      maxCaracteres: 500
    }
  ]
};

window.SURVEY_DATA = SURVEY_DATA;
