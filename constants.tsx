
import { Scenario, Language } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: 'collaborator-feedback',
    title: { en: 'Feedback to Collaborator', es: 'Feedback a Colaborador' },
    description: { 
      en: 'Deliver constructive performance reviews using SBI, Radical Candor, and SMART objectives.', 
      es: 'Entrega evaluaciones de desempeño constructivas usando SBI, Radical Candor y objetivos SMART.' 
    },
    icon: '👤'
  },
  {
    id: 'team-feedback',
    title: { en: 'Feedback to Team', es: 'Feedback al Equipo' },
    description: { 
      en: 'Align collective vision and celebrate group wins with professional and SMART-aligned communication.', 
      es: 'Alinea la visión colectiva y celebra logros grupales con comunicación profesional y alineada a SMART.' 
    },
    icon: '🙌'
  },
  {
    id: 'one-on-one',
    title: { en: '1-on-1 Conversations', es: 'Conversaciones 1 a 1' },
    description: { 
      en: 'Build psychological safety. Focus on growth, active listening, and bi-directional career development.', 
      es: 'Construye seguridad psicológica. Enfócate en crecimiento, escucha activa y desarrollo bidireccional.' 
    },
    icon: '💬'
  },
  {
    id: 'recognition',
    title: { en: 'Recognition', es: 'Reconocimiento' },
    description: { 
      en: 'Master positive reinforcement. Connect achievements to business impact and core company values.', 
      es: 'Domina el refuerzo positivo. Conecta logros con el impacto al negocio y los valores de la compañía.' 
    },
    icon: '🌟'
  }
];

export const getSystemInstruction = (lang: Language, phase: 'COACHING' | 'SIMULATION') => {
  const isEs = lang === 'es';
  
  if (phase === 'COACHING') {
    return isEs ? 
      `ERES UN MENTOR COACH DE LIDERAZGO EJECUTIVO. DEBES RESPONDER SIEMPRE EN ESPAÑOL.
      Tu misión es preparar al Líder para una conversación de alto impacto.
      1. Pregunta por el escenario: ¿Es un 1-on-1, Reconocimiento o Feedback?
      2. Si es 1-on-1: Insiste en la escucha activa y preguntas abiertas para generar seguridad psicológica.
      3. Si es Reconocimiento: Guíalo a conectar el logro con un VALOR de la empresa y el impacto real.
      4. Si es Feedback: Usa el marco SBI (Situación, Comportamiento, Impacto) y compromiso SMART.
      Sé breve, directo y profesional.` :
      `YOU ARE AN EXECUTIVE LEADERSHIP MENTOR COACH. ALWAYS RESPOND IN ENGLISH.
      Your mission is to prepare the Leader for high-impact conversations.
      1. Ask about the scenario: Is it a 1-on-1, Recognition, or Feedback session?
      2. If 1-on-1: Stress active listening and open-ended questions to build psychological safety.
      3. If Recognition: Guide them to connect the achievement to a company VALUE and real business impact.
      4. If Feedback: Use the SBI framework (Situation, Behavior, Impact) and SMART commitments.
      Be brief, direct, and professional.`;
  }

  return isEs ?
    `ERES UN OBSERVADOR SILENCIOSO DE LIDERAZGO. RESPONDE SIEMPRE EN ESPAÑOL.
    Tu rol es ESTRICTAMENTE ESCUCHAR Y ANALIZAR. 
    NO INTERVENGAS. NO HABLES. NO RESPONDAS AL LÍDER.
    Incluso si el líder te hace una pregunta, mantente en silencio. 
    Solo procesa la entrada para la transcripción y el análisis posterior.` :
    `YOU ARE A SILENT LEADERSHIP OBSERVER. ALWAYS RESPOND IN ENGLISH.
    Your role is STRICTLY TO LISTEN AND ANALYZE.
    DO NOT INTERVENE. DO NOT SPEAK. DO NOT RESPOND TO THE LEADER.
    Even if the leader asks you a question, remain silent.
    Only process the input for transcription and subsequent analysis.`;
};

export const UI_STRINGS = {
  en: {
    landingTag: "Master the Art of Leadership Feedback",
    landingTitle: "Master the art of",
    landingTitleSpan: "Feedback",
    landingDesc: "Elite coaching for leaders. Master SBI, Radical Candor, and SMART objectives.",
    startTraining: "Start Training",
    dashboardTitle: "Welcome, Leader",
    dashboardDesc: "Select a scenario to analyze your communication maturity.",
    statSessions: "Total Sessions",
    statConfidence: "Leadership Score",
    statReduction: "SMART Compliance",
    sessionPractice: "Feedback Practice Session",
    sessionReady: "Ready to start?",
    sessionReadyDesc: "Evaluated on SBI, SMART, and Ethics. Select a mode above.",
    sessionInitialize: "Initialize Session",
    sessionEnd: "Finalize Analysis",
    sessionEndCoaching: "Finalize Mentoring",
    sessionStart: "Start Analysis",
    sessionAnalyzing: "Processing Data...",
    sessionCoachTitle: "FeedbackAI Mentor",
    sessionActive: "LISTENING & ANALYZING TONE",
    sessionClarity: "Feedback",
    sessionFiller: "Fillers",
    phaseCoaching: "Mentoring",
    phaseSimulation: "Simulation Analysis",
    startSimBtn: "Enter Simulation",
    simulationTarget: "Collaborator (Target)",
    resultsTitle: "Leadership Performance Report",
    resultsDesc: "Deep-dive analysis based on executive coaching standards.",
    resultsReturn: "Panel",
    resultsGlobal: "LEADERSHIP SCORE",
    resultsCompetencies: "Dimensional Maturity",
    resultsTakeaways: "Key Strengths",
    resultsImprovement: "Growth Opportunities",
    resultsActionPlan: "Action Plan",
    resultsSuggestions: "Executive Suggestions",
    smartTitle: "SMART Validation",
    languageSafety: "ETHOS & PROFESSIONALISM",
    saveReport: "Save Report",
    saving: "Saving...",
    saved: "Saved!",
    saveError: "Error",
    verbalTitle: "Verbal Analysis",
    emotionalTitle: "Emotional Analysis",
    bodyTitle: "Body Language",
    feature1Title: "Expert AI Coaching",
    feature1Desc: "Real-time guidance using SBI and Radical Candor frameworks.",
    feature2Title: "Safe Simulation",
    feature2Desc: "Practice high-stakes conversations with realistic AI collaborators.",
    feature3Title: "Executive Insights",
    feature3Desc: "Comprehensive performance reports for continuous growth."
  },
  es: {
    landingTag: "Domina el Arte del Feedback de Liderazgo",
    landingTitle: "Domina el arte del",
    landingTitleSpan: "Feedback",
    landingDesc: "Coaching de élite para líderes. Domina SBI, Radical Candor y objetivos SMART.",
    startTraining: "Empezar Entrenamiento",
    dashboardTitle: "Bienvenido, Líder",
    dashboardDesc: "Selecciona un escenario para iniciar tu análisis de madurez.",
    statSessions: "Sesiones Totales",
    statConfidence: "Madurez de Liderazgo",
    statReduction: "Cumplimiento SMART",
    sessionPractice: "Sesión de Práctica de Feedback",
    sessionReady: "¿Listo para empezar?",
    sessionReadyDesc: "Evaluación en SBI, SMART y Ética. Selecciona un modo arriba.",
    sessionInitialize: "Inicializar Sesión",
    sessionEnd: "Finalizar Análisis",
    sessionEndCoaching: "Finalizar Mentoría",
    sessionStart: "Iniciar Análisis",
    sessionAnalyzing: "Procesando Datos...",
    sessionCoachTitle: "Mentor FeedbackAI",
    sessionActive: "ESCUCHANDO Y ANALIZANDO TONO",
    sessionClarity: "Feedback",
    sessionFiller: "Muletillas",
    phaseCoaching: "Mentoría",
    phaseSimulation: "Análisis de Simulación",
    startSimBtn: "Entrar a Simulación",
    simulationTarget: "Colaborador (Objetivo)",
    resultsTitle: "Reporte de Desempeño de Liderazgo",
    resultsDesc: "Análisis integral basado en estándares de coaching ejecutivo.",
    resultsReturn: "Panel",
    resultsGlobal: "PUNTAJE DE LIDERAZGO",
    resultsCompetencies: "Madurez por Dimensión",
    resultsTakeaways: "Fortalezas Clave",
    resultsImprovement: "Oportunidades de Crecimiento",
    resultsActionPlan: "Plan de Acción",
    resultsSuggestions: "Sugerencias Ejecutivas",
    smartTitle: "Validación SMART",
    languageSafety: "ÉTICA Y PROFESIONALISMO",
    saveReport: "Guardar Reporte",
    saving: "Guardando...",
    saved: "¡Guardado!",
    saveError: "Error",
    verbalTitle: "Análisis Verbal",
    emotionalTitle: "Análisis Emocional",
    bodyTitle: "Lenguaje Corporal",
    feature1Title: "Coaching Experto",
    feature1Desc: "Guía en tiempo real usando marcos SBI y Radical Candor.",
    feature2Title: "Simulación Segura",
    feature2Desc: "Practica conversaciones difíciles con colaboradores IA realistas.",
    feature3Title: "Insights Ejecutivos",
    feature3Desc: "Reportes exhaustivos de desempeño para crecimiento continuo."
  }
};
