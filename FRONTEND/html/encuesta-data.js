/**
 * ═════════════════════════════════════════════════════════════════════════
 * SENAIR — Encuesta Scrollytelling "La Encuesta es un Vuelo"
 * Archivo de Configuración de Datos, Preguntas y Etapas de Vuelo
 * ═════════════════════════════════════════════════════════════════════════
 */

const SURVEY_CONFIG = {
  // Endpoint de guardado del backend SENAIR (con fallback automático a localStorage)
  SURVEY_ENDPOINT: "/api/survey/submit",

  // Rutas y metadatos del vuelo temático
  FLIGHT_INFO: {
    airline: "SENAIR",
    flightNumber: "SE-2026",
    origin: "Tierra (Check-in)",
    destination: "Destino (Llegada)",
    totalStages: 6
  },

  // Etapas del Viaje para el Scrollytelling
  STAGES: [
    {
      id: "stage-0",
      type: "hero",
      name: "Check-in",
      altitude: "0 m",
      skyClass: "sky-dawn",
      planeProgress: 0,
      planeAngle: 0
    },
    {
      id: "stage-1",
      questionId: "q1_satisfaction",
      name: "Despegue",
      altitude: "1.500 m",
      skyClass: "sky-morning",
      planeProgress: 0.18,
      planeAngle: 18
    },
    {
      id: "stage-2",
      questionId: "q2_ease",
      name: "Ascenso",
      altitude: "5.000 m",
      skyClass: "sky-day",
      planeProgress: 0.36,
      planeAngle: 12
    },
    {
      id: "stage-3",
      questionId: "q3_punctuality",
      name: "Crucero I",
      altitude: "10.000 m",
      skyClass: "sky-cruising",
      planeProgress: 0.54,
      planeAngle: 0
    },
    {
      id: "stage-4",
      questionId: "q4_improvements",
      name: "Crucero II",
      altitude: "10.500 m",
      skyClass: "sky-sunset-start",
      planeProgress: 0.72,
      planeAngle: -4
    },
    {
      id: "stage-5",
      questionId: "q5_nps",
      name: "Descenso",
      altitude: "3.500 m",
      skyClass: "sky-sunset",
      planeProgress: 0.88,
      planeAngle: -15
    },
    {
      id: "stage-6",
      questionId: "q6_feedback",
      name: "Aterrizaje",
      altitude: "200 m",
      skyClass: "sky-dusk",
      planeProgress: 0.98,
      planeAngle: -6
    },
    {
      id: "stage-7",
      type: "final",
      name: "Llegada",
      altitude: "0 m",
      skyClass: "sky-night",
      planeProgress: 1.0,
      planeAngle: 0
    }
  ],

  // Cuestionario Interactivo
  QUESTIONS: [
    {
      id: "q1_satisfaction",
      stageIndex: 1,
      stageLabel: "Despegue",
      stageStep: "1 de 5",
      type: "rating5",
      required: true,
      title: "¿Qué tan satisfecho estás con tu experiencia general con SENAIR?",
      desc: "Evalúa tu nivel de satisfacción general con nuestra aerolínea tocando las estrellas.",
      labels: {
        1: "1 Estrella • Muy insatisfecho",
        2: "2 Estrellas • Insatisfecho",
        3: "3 Estrellas • Neutral",
        4: "4 Estrellas • Muy satisfecho",
        5: "5 Estrellas • ¡Excelente y extraordinario!"
      }
    },
    {
      id: "q2_ease",
      stageIndex: 2,
      stageLabel: "Ascenso",
      stageStep: "2 de 5",
      type: "rating5",
      required: true,
      title: "¿Qué tan fácil e intuitivo fue comprar y gestionar tu reserva?",
      desc: "Califica la agilidad, claridad y facilidad de navegación en la plataforma de SENAIR.",
      labels: {
        1: "1 Estrella • Proceso confuso",
        2: "2 Estrellas • Algo complejo",
        3: "3 Estrellas • Experiencia estándar",
        4: "4 Estrellas • Rápido y claro",
        5: "5 Estrellas • ¡Súper fácil e intuitivo!"
      }
    },
    {
      id: "q3_punctuality",
      stageIndex: 3,
      stageLabel: "Vuelo Crucero",
      stageStep: "3 de 5",
      type: "single",
      required: true,
      title: "¿Cómo calificas la puntualidad y el cumplimiento de itinerarios?",
      desc: "Para nosotros llegar a tiempo a cada destino es una prioridad de primer nivel.",
      options: [
        { val: "Excelente", label: "Excelente", sub: "Despegue y arribo con total puntualidad" },
        { val: "Buena", label: "Buena", sub: "Cumplimiento satisfactorio de la programación" },
        { val: "Regular", label: "Regular", sub: "Se presentaron pequeños minutos de espera" },
        { val: "Mala", label: "Por mejorar", sub: "Retrasos que impactaron mi planificación" }
      ]
    },
    {
      id: "q4_improvements",
      stageIndex: 4,
      stageLabel: "Vuelo Crucero",
      stageStep: "4 de 5",
      type: "multiple",
      required: true,
      title: "¿Qué aspectos consideras que podríamos mejorar o potenciar?",
      desc: "Selecciona una o más opciones que marcarían la diferencia en tus próximos viajes:",
      options: [
        { val: "Servicio a bordo", label: "Servicio a bordo y menú gourmet", icon: "☕" },
        { val: "Comodidad de asientos", label: "Comodidad y espacio en cabina", icon: "💺" },
        { val: "Políticas de equipaje", label: "Equipaje y agilidad en bodega", icon: "🧳" },
        { val: "Atención al cliente", label: "Atención al cliente y soporte", icon: "💬" },
        { val: "Precios y promociones", label: "Precios y promociones exclusivas", icon: "🏷️" },
        { val: "Check-in y mapa digital", label: "Check-in digital y mapa de asientos", icon: "📱" }
      ]
    },
    {
      id: "q5_nps",
      stageIndex: 5,
      stageLabel: "Descenso",
      stageStep: "5 de 5",
      type: "nps",
      required: true,
      title: "¿Qué tan probable es que recomiendes SENAIR a tus amigos o colegas?",
      desc: "Escala NPS oficial del 0 (Poco probable) al 10 (¡Totalmente seguro!)."
    },
    {
      id: "q6_feedback",
      stageIndex: 6,
      stageLabel: "Aterrizaje",
      stageStep: "Cierre",
      type: "closure",
      required: false,
      title: "Última etapa: Déjanos tus comentarios o sugerencias",
      desc: "Tu voz es el combustible que hace volar a SENAIR hacia el futuro.",
      placeholder: "Escribe aquí cualquier recomendación, felicitación al equipo o función que te gustaría ver en la plataforma..."
    }
  ]
};

// Exportar globalmente
window.SURVEY_CONFIG = SURVEY_CONFIG;
