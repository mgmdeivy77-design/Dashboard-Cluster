import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Users File-based Storage for multi-user shared environment
const USERS_FILE = path.join(process.cwd(), "users.json");

const BASE_CDIS = [
  { id: 'usr-1', num: '128', color: '#ec4899' },
  { id: 'usr-2', num: '130', color: '#3b82f6' },
  { id: 'usr-3', num: '135', color: '#10b981' },
  { id: 'usr-4', num: '201', color: '#f59e0b' },
  { id: 'usr-5', num: '291', color: '#8b5cf6' },
  { id: 'usr-6', num: '305', color: '#a855f7' },
  { id: 'usr-7', num: '387', color: '#f43f5e' },
  { id: 'usr-8', num: '453', color: '#06b6d4' },
  { id: 'usr-9', num: '495', color: '#059669' },
  { id: 'usr-10', num: '529', color: '#ea580c' },
  { id: 'usr-11', num: '721', color: '#3b82f6' },
  { id: 'usr-12', num: '845', color: '#10b981' },
  { id: 'usr-13', num: '863', color: '#8b5cf6' },
  { id: 'usr-14', num: '864', color: '#f59e0b' },
  { id: 'usr-15', num: '909', color: '#ec4899' },
  { id: 'usr-16', num: '910', color: '#06b6d4' },
];

const INITIAL_SERVER_USERS = [
  { id: 'usr-admin', name: 'Facilitador', color: '#4f46e5', role: 'admin', password: 'admin' },
  ...BASE_CDIS.flatMap(cdi => [
    { 
      id: `${cdi.id}-pastor`, 
      name: `CDI-${cdi.num} (Pastor)`, 
      color: cdi.color, 
      role: 'pastor', 
      password: '123' 
    },
    { 
      id: cdi.id, 
      name: `CDI-${cdi.num} (Director)`, 
      color: cdi.color, 
      role: 'supervisor', 
      supervisorId: `${cdi.id}-pastor`, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-1`, 
      name: `CDI-${cdi.num} (Asist Adm)`, 
      color: cdi.color, 
      role: 'user', 
      supervisorId: cdi.id, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-2`, 
      name: `CDI-${cdi.num} (Asist Pat)`, 
      color: cdi.color, 
      role: 'user', 
      supervisorId: cdi.id, 
      password: '123' 
    },
    { 
      id: `${cdi.id}-colab-3`, 
      name: `CDI-${cdi.num} (Tutora Lid)`, 
      color: cdi.color, 
      role: 'user', 
      supervisorId: cdi.id, 
      password: '123' 
    }
  ])
];

function getUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading users file:", err);
  }
  saveUsers(INITIAL_SERVER_USERS);
  return INITIAL_SERVER_USERS;
}

function saveUsers(usersList: any[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

// REST User Management API
app.get("/api/users", (req, res) => {
  res.json(getUsers());
});

app.post("/api/users", (req, res) => {
  const { name, color, role, password, supervisorId } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Faltan datos requeridos (nombre y clave)." });
  }

  const usersList = getUsers();
  const exists = usersList.some((u: any) => u.name.toLowerCase().trim() === name.toLowerCase().trim());
  if (exists) {
    return res.status(400).json({ error: "Este usuario ya se encuentra registrado." });
  }

  const newUser = {
    id: `usr-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    color: color || "#4f46e5",
    role: role || "user",
    password: password,
    supervisorId: supervisorId || ""
  };

  usersList.push(newUser);
  saveUsers(usersList);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, color, role, password, supervisorId } = req.body;
  
  const usersList = getUsers();
  const index = usersList.findIndex((u: any) => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  const updatedUser = {
    ...usersList[index],
    name: name !== undefined ? name.trim() : usersList[index].name,
    color: color !== undefined ? color : usersList[index].color,
    role: role !== undefined ? role : usersList[index].role,
    password: password !== undefined ? password : usersList[index].password,
    supervisorId: supervisorId !== undefined ? supervisorId : usersList[index].supervisorId
  };

  usersList[index] = updatedUser;
  saveUsers(usersList);
  res.json(updatedUser);
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  
  let usersList = getUsers();
  const exists = usersList.some((u: any) => u.id === id);
  if (!exists) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  usersList = usersList.filter((u: any) => u.id !== id);
  saveUsers(usersList);
  res.json({ success: true });
});

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Retry mechanism with exponential backoff for transient Gemini errors (like 503 UNAVAILABLE or 429 RESOURCE_EXHAUSTED)
async function generateContentWithRetry(params: any, retries = 3, delay = 800) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const status = error?.status || error?.code;
      const errorMessage = String(error?.message || "");
      const isTransient = 
        status === "UNAVAILABLE" || 
        status === 503 || 
        status === "RESOURCE_EXHAUSTED" || 
        status === 429 ||
        errorMessage.includes("experiencing high demand") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("try again later") ||
        errorMessage.includes("Service Unavailable");

      if (isTransient && i < retries - 1) {
        console.warn(`[Gemini API] Transient error detected (${status}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content after retries");
}

// Fallback Plan Generator for /api/generate-plan
function getFallbackPlan(area: string, goal: string, steps: any, context?: string) {
  const stepsList = Array.isArray(steps) ? steps : (steps ? [steps] : []);
  const stepsText = stepsList.length > 0 ? stepsList.join(", ") : "Pasos de desarrollo oficiales";
  const areaLabel = area.charAt(0).toUpperCase() + area.slice(1);
  
  return {
    isFallback: true,
    strategicOverview: `Plan estratégico de contingencia para la meta de ${areaLabel}: "${goal}". Diseñado de forma robusta y secuencial para permitirte avanzar con tus tareas locales de inmediato mientras se restablece la comunicación con el servicio de Inteligencia Artificial de alta demanda.`,
    suggestedTasks: [
      {
        title: "Fase 1: Reunión estratégica y diagnóstico de recursos",
        description: `Coordinar una mesa de trabajo ministerial para alinear al equipo sobre la meta "${goal}" y el paso: "${stepsText}".`,
        priority: "Alta",
        category: areaLabel,
        subtasks: [
          "Definir el equipo coordinador responsable y los canales de comunicación",
          "Elaborar un listado de recursos materiales, espaciales y presupuestarios"
        ]
      },
      {
        title: "Fase 2: Capacitación y sensibilización del voluntariado",
        description: `Preparar de forma práctica a los líderes y voluntarios que facilitarán las dinámicas y jornadas de atención comunitaria.`,
        priority: "Media",
        category: areaLabel,
        subtasks: [
          "Diseñar una guía metodológica simple basada en el paso oficial",
          "Llevar a cabo un taller lúdico explicativo para simular la ejecución"
        ]
      },
      {
        title: "Fase 3: Ejecución de la primera jornada comunitaria",
        description: `Desplegar la actividad principal del plan convocando activamente a las familias locales, recolectando listas de asistencia y evidencias de progreso.`,
        priority: "Alta",
        category: areaLabel,
        subtasks: [
          "Hacer la convocatoria oficial casa por casa o vía digital",
          "Desarrollar el taller/dinámica y tomar registros de participación y retos"
        ]
      },
      {
        title: "Fase 4: Evaluación, retroalimentación y plan de mejora",
        description: `Analizar los logros y cuellos de botella con el equipo organizador para reportar el avance e implementar ajustes oportunas.`,
        priority: "Baja",
        category: areaLabel,
        subtasks: [
          "Reunir testimonios de impacto de por lo menos tres participantes",
          "Elaborar una minuta quincenal de seguimiento y enviarla a la coordinación"
        ]
      }
    ],
    suggestedEvents: [
      {
        title: `Mesa de Alineación: ${goal.substring(0, 30)}...`,
        description: `Taller de inicio para delegar tareas, revisar alcances y calendarizar las jornadas de trabajo.`,
        dateOffset: 3,
        category: areaLabel
      },
      {
        title: "Evaluación Comunitaria y Lecciones Aprendidas",
        description: "Reunión grupal para socializar los resultados de las tareas y proyectar los siguientes hitos de avance.",
        dateOffset: 15,
        category: areaLabel
      }
    ]
  };
}

// Fallback Plan Generator for /api/generate-smart-plan
function getFallbackSmartPlan(area: string, goal: string, step: string, context?: string) {
  const areaLabel = area.charAt(0).toUpperCase() + area.slice(1);
  
  return {
    isFallback: true,
    importance: `Este paso estratégico, "${step}", es fundamental en el área de ${areaLabel} porque permite sentar las bases operativas, de capacitación y de concientización necesarias para cumplir con la meta ministerial "${goal}". Al enfocarse en este paso, la iglesia local y sus ministerios aseguran un desarrollo sostenible a largo plazo, reduciendo riesgos y optimizando los recursos disponibles para un mayor impacto.`,
    metrics: [
      `Número de líderes capacitados y comprometidos en el paso de "${step}"`,
      `Porcentaje de avance en las sesiones de diagnóstico locales (meta de cumplimiento: 100%)`,
      `Nivel de satisfacción y claridad expresado por los colaboradores locales (mínimo de aceptación: 90%)`,
      `Sistematización formal y aprobación del informe por parte del comité pastoral`
    ],
    practicalSteps: [
      {
        title: "Paso Práctico 1: Diagnóstico inicial y mesa de trabajo coordinada",
        description: `Reunir a los líderes de área para analizar el contexto local y las necesidades del proyecto con respecto a "${step}". Definir responsabilidades claras para cada coordinador de ministerio.`
      },
      {
        title: "Paso Práctico 2: Preparación técnica y adaptaciones metodológicas",
        description: `Adaptar y validar las guías didácticas o materiales informativos al lenguaje y contexto sociocultural de la comunidad para asegurar un aprendizaje claro, interactivo y cercano.`
      },
      {
        title: "Paso Práctico 3: Ejecución piloto y retroalimentación interactiva",
        description: `Implementar las primeras actividades con un grupo representativo de participantes para probar la dinámica y realizar ajustes inmediatos basados en la retroalimentación en tiempo real.`
      },
      {
        title: "Paso Práctico 4: Cierre estratégico, sistematización y plan de mejora",
        description: `Consolidar las lecciones aprendidas en un documento breve y presentarlo al liderazgo para integrarlo en la planificación anual del CDI.`
      }
    ],
    // Empty fallbacks for backward compatibility
    suggestedTasks: [],
    suggestedEvents: []
  };
}

// API Route: Generar plan de acción basado en la meta y contexto del documento
app.post("/api/generate-plan", async (req, res) => {
  const { area, goal, steps, context } = req.body;

  if (!area || !goal) {
    return res.status(400).json({ error: "Faltan los parámetros 'area' y 'goal'." });
  }

  try {
    const systemPrompt = `Eres un Asistente de Planificación Estratégica Ministerial y Comunitaria de primer nivel. Tu labor es ayudar a las iglesias locales y sus Centros de Desarrollo Infantil (CDI) a diseñar planes de acción sumamente específicos, concretos, realistas y personalizados basados en sus metas y pasos de desarrollo en cuatro áreas clave: Iglesia, Jóvenes (Participantes), Familia y Comunidad.

REGLA DE ORO DE ESPECIFICIDAD EXTREMA:
Queda ESTRICTAMENTE PROHIBIDO generar respuestas genéricas, plantillas o textos vacíos aplicables a cualquier proyecto. Todo el contenido generado (la descripción estratégica, las tareas sugeridas, las subtareas y los eventos) debe estar impregnado de detalles concretos, terminología propia del área ministerial elegida (${area}), la meta específica (${goal}) y el contexto local del CDI.

- Si el tema es de la "Iglesia" (Pertenencia, Capacidad o Recursos Locales): Las tareas deben detallar metodologías de movilización pastoral, ofrendas locales, capacitación de tutores del CDI, comités de apoyo o reuniones específicas de la Junta Eclesiástica del CDI.
- Si el tema es de "Jóvenes" o niños (Discipulado, Educación, Salud): Describe metodologías pedagógicas reales, dinámicas de liderazgo juvenil, currículos de enseñanza bíblica, tutorías escolares, pautas de prevención contra la violencia o tamizaje de salud física y mental para los participantes inscritos en el CDI.
- Si el tema es de la "Familia" (Soporte familiar, Consejería, Visitas): Detalla planes de visitas domiciliarias con la trabajadora social, talleres de pautas de crianza e involucramiento de padres de familia en dinámicas de salud y nutrición familiar.
- Si el tema es de la "Comunidad" (Alianzas locales, Reputación): Describe coordinaciones con centros de salud locales, municipalidades locales, comités de barrio e iniciativas comunitarias tangibles.

Evita rotundamente tareas generales como "Realizar reuniones", "Hacer capacitaciones" o "Planificar logística". Cada tarea sugerida debe especificar el "qué", "quién" y "cómo" operativamente. Por ejemplo, en lugar de "Planificar actividades", describe "Coordinación entre el pastor y los tutores del CDI para calendarizar los talleres de discipulado usando el material curricular correspondiente". Tu respuesta debe ser estrictamente en formato JSON válido de acuerdo con el esquema proporcionado. El plan de acción sugerido debe contener pasos altamente prácticos, alcanzables en el contexto local y listos para ser implementados como tareas y eventos de calendario.`;

    const userPrompt = `Por favor, genera un plan de acción sumamente específico, detallado y sin generalidades para el siguiente contexto particular:
- **Área de Enfoque**: ${area}
- **Meta Seleccionada**: ${goal}
- **Pasos de Desarrollo Asociados**: ${JSON.stringify(steps)}
${context ? `- **Información y Desafíos Adicionales**: ${context}` : ""}

Escribe con precisión clínica y tono sumamente profesional y adaptado al trabajo real con niños, jóvenes y familias en contextos de desarrollo integral.

Genera:
1. Una descripción estratégica ("strategicOverview") clara, inspiradora y profundamente contextualizada que explique la ruta de éxito para esta meta en particular en el CDI.
2. Una lista de 4 a 6 tareas concretas ("suggestedTasks"). Para cada tarea, define un título corto y representativo (máximo 50 caracteres), una descripción detallada que especifique actividades operacionales reales de este tema, nivel de prioridad ('Alta', 'Media' o 'Baja'), categoría ('Iglesia', 'Jóvenes', 'Familia' o 'Comunidad' según corresponda) y una lista de 2 a 3 subtareas específicas e instruccionales.
3. Una lista de 2 a 3 eventos o reuniones clave ("suggestedEvents") con un "dateOffset" (número de días a partir de hoy, ej: 3, 7, 14 o 30 días), un título específico y una descripción detallada de su propósito.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["strategicOverview", "suggestedTasks", "suggestedEvents"],
          properties: {
            strategicOverview: {
              type: Type.STRING,
              description: "Resumen estratégico e inspiracional de cómo abordar esta meta y lograr el impacto deseado en la comunidad local."
            },
            suggestedTasks: {
              type: Type.ARRAY,
              description: "Tareas concretas y prácticas para agregar al organizador de tareas (Kanban).",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "priority", "category", "subtasks"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Título corto y directo de la tarea (máximo 50 caracteres)."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Detalle de qué se debe hacer y cómo se relaciona con los pasos del documento."
                  },
                  priority: {
                    type: Type.STRING,
                    description: "Prioridad sugerida.",
                    enum: ["Alta", "Media", "Baja"]
                  },
                  category: {
                    type: Type.STRING,
                    description: "Categoría de la tarea (generalmente igual al área de enfoque)."
                  },
                  subtasks: {
                    type: Type.ARRAY,
                    description: "Paso a paso o lista de control interna para completar la tarea.",
                    items: {
                      type: Type.STRING
                    }
                  }
                }
              }
            },
            suggestedEvents: {
              type: Type.ARRAY,
              description: "Reuniones, talleres o eventos clave del calendario relacionados con la meta.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "dateOffset", "category"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Nombre del evento."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Descripción del propósito y participantes clave del evento."
                  },
                  dateOffset: {
                    type: Type.INTEGER,
                    description: "Días recomendados a partir de hoy para programar este evento (ej: 3, 7, 14, 21)."
                  },
                  category: {
                    type: Type.STRING,
                    description: "Categoría del evento."
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating plan with Gemini, executing fallback:", error);
    try {
      const fallback = getFallbackPlan(area, goal, steps, context);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: error?.message || "Ocurrió un error al procesar la solicitud." });
    }
  }
});

// API Route: Generar una descripción de importancia, métricas y pasos específicos para un paso oficial del documento
app.post("/api/generate-smart-plan", async (req, res) => {
  const { area, goal, step, context } = req.body;

  if (!area || !goal || !step) {
    return res.status(400).json({ error: "Faltan los parámetros requeridos 'area', 'goal' y 'step'." });
  }

  try {
    const systemPrompt = `Eres un Asistente Experto y Consultor de Planificación Estratégica Eclesiástica y de Centros de Desarrollo Infantil (CDI). Tu labor es instruir a los colaboradores locales con un análisis profundo, sumamente específico y accionable de los pasos del plan de desarrollo oficial.

REGLA DE NO GENERICIDAD ABSOLUTA:
Queda terminantemente prohibido generar respuestas generales, plantillas o sugerencias aplicables a cualquier proyecto. Todo el análisis, las métricas de éxito y los sub-pasos deben ser creados específicamente para el paso oficial seleccionado: "${step}". Debes usar ejemplos de actividades del CDI reales, contemplando el rol de tutores, pastores, directores de CDI, especialistas de salud, cocineros y las familias del CDI en América Latina.

Tu respuesta debe constar de:
1. "importance": Una fundamentación profunda, teológica u operativa de por qué este paso es vital para el desarrollo integral del niño y la iglesia local (1 o 2 párrafos de alta densidad de información, explicando los beneficios a largo plazo y riesgos de omitirlo).
2. "metrics": De 3 a 5 métricas de éxito sumamente específicas, cuantificables y tangibles (evita términos vagos como 'alto porcentaje' y usa indicadores claros como 'Número de tutores certificados en disciplina positiva', 'Porcentaje de niños con carpeta de salud anual al día', 'Ficha de auditoría firmada por el comité de finanzas').
3. "practicalSteps": De 3 a 5 sub-pasos metodológicos específicos con títulos descriptivos ricos (no títulos genéricos como 'Paso 1') y explicaciones de cómo implementarlos operacionalmente con el equipo del CDI. Cada sub-paso debe ser altamente descriptivo, mostrando metodologías, recomendaciones de facilitación y entregables tangibles.

Tu respuesta debe ser estrictamente en formato JSON de acuerdo con el esquema especificado.`;

    const userPrompt = `Genera un análisis ministerial exhaustivo y una guía de implementación de especificidad máxima para el siguiente paso oficial de desarrollo:
- **Área Temática**: ${area}
- **Meta Eclesiástica Global**: ${goal}
- **Paso Oficial de Desarrollo**: "${step}"
- **Desafíos y Contexto Local del CDI**: "${context || "Foco en efectividad operacional del CDI"}"

No uses terminología abstracta. Traduce cada componente a la realidad operativa de un Centro de Desarrollo Infantil (CDI) que atiende a niños en riesgo social.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["importance", "metrics", "practicalSteps"],
          properties: {
            importance: {
              type: Type.STRING,
              description: "Descripción detallada sobre la importancia del paso estratégico."
            },
            metrics: {
              type: Type.ARRAY,
              description: "Listado de métricas claras para medir el progreso o éxito.",
              items: { type: Type.STRING }
            },
            practicalSteps: {
              type: Type.ARRAY,
              description: "Listado de sub-pasos específicos y prácticos para lograr el paso.",
              items: {
                type: Type.OBJECT,
                required: ["title", "description"],
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Título breve del sub-paso práctico."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Descripción detallada y explicativa de cómo ejecutar este sub-paso."
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating SMART plan with Gemini, executing fallback:", error);
    try {
      const fallback = getFallbackSmartPlan(area, goal, step, context);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: error?.message || "Ocurrió un error al procesar la solicitud con la Inteligencia Artificial." });
    }
  }
});

// Fallback Substep Detail Generator
function getFallbackSubstepDetail(substep: string, substepDescription: string) {
  return {
    smartGoal: {
      title: `Meta SMART: ${substep}`,
      statement: `Establecer e implementar con éxito el paso "${substep}" en nuestra iglesia local para optimizar el alcance del ministerio, midiendo el logro con indicadores clave de participación.`,
      components: {
        S: `Implementar el sub-paso específico: "${substep}".`,
        M: `Alcanzar un 100% de ejecución de las tareas lógicas planificadas.`,
        A: `Asignar responsables locales calificados y recursos mínimos necesarios.`,
        R: `Directamente alineado con la meta estratégica de desarrollo de la iglesia.`,
        T: `Completar todas las fases en un plazo máximo de 30 días.`
      }
    },
    tasks: [
      {
        title: "Fase 1: Reunión inicial y socialización",
        description: `Socializar el sub-paso "${substep}" con el equipo local de trabajo para definir roles y expectativas básicas.`,
        priority: "Alta",
        dependency: "Ninguna"
      },
      {
        title: "Fase 2: Adquisición de recursos y logística",
        description: `Coordinar la adquisición de los recursos necesarios y preparar la logística del sub-paso.`,
        priority: "Media",
        dependency: "Fase 1: Reunión inicial y socialización"
      },
      {
        title: "Fase 3: Ejecución de la actividad clave",
        description: `Llevar a cabo la ejecución práctica del sub-paso "${substep}" involucrando a los destinatarios principales.`,
        priority: "Alta",
        dependency: "Fase 2: Adquisición de recursos y logística"
      },
      {
        title: "Fase 4: Evaluación y reporte de avance",
        description: `Evaluar el impacto con el comité local y documentar las métricas de éxito alcanzadas.`,
        priority: "Baja",
        dependency: "Fase 3: Ejecución de la actividad clave"
      }
    ],
    resources: [
      "Espacio de reunión (físico o virtual)",
      "Material didáctico e informativo sobre el paso estratégico",
      "Equipo de facilitadores o voluntarios locales capacitados",
      "Formatos de registro y retroalimentación"
    ],
    metrics: [
      "100% de asistencia de los líderes convocados",
      "Nivel de claridad de los participantes superior al 85%",
      "Entregable o reporte consolidado y archivado"
    ]
  };
}

// API Route: Generar una meta SMART, tareas secuenciales, recursos y métricas de un sub-paso seleccionado
app.post("/api/generate-substep-detail", async (req, res) => {
  const { area, goal, step, substep, substepDescription } = req.body;

  if (!area || !goal || !step || !substep) {
    return res.status(400).json({ error: "Faltan parámetros requeridos." });
  }

  try {
    const systemPrompt = `Eres un Asistente Experto y Mentor de Capacitación Estratégica para el Desarrollo Infantil Integral. Tu labor es guiar a la iglesia y a los colaboradores del CDI a traducir un sub-paso específico en un Plan de Trabajo SMART sumamente detallado, secuencial y libre de generalidades.

REGLA DE CONTEXTO ESTRICTO DE NO-GENERICIDAD:
Queda ESTRICTAMENTE PROHIBIDO generar títulos o descripciones vagas como "Fase 1: Planificación" o "Fase 2: Ejecución". Cada elemento de la meta SMART, cada tarea secuencial, cada recurso y cada métrica debe hacer referencia explícita, directa y vívida al sub-paso "${substep}", al paso general "${step}", y a la meta "${goal}".

Para lograr esto:
- Define la meta SMART incorporando de forma explícita el alcance de "${substep}" y describe detalladamente qué significa cada letra (S, M, A, R, T) adaptado a la acción.
- Genera tareas con títulos sumamente operativos, de acción directa (ej: "Mapeo de familias vulnerables en el sector X con fichas de tamizaje", "Taller práctico con tutores para la simulación del currículo de discipulado", "Revisión final de planillas presupuestarias por la Junta del CDI").
- Las tareas DEBEN ser secuenciales (Fase 1, Fase 2, Fase 3, etc.) y la "dependency" de cada tarea (excepto la primera) debe coincidir exactamente con el "title" de la tarea inmediatamente anterior para formar una cadena lógica de dependencias impecable.
- Describe recursos de manera muy concreta (ej: "Guías curriculares oficiales de Compassion", "Fichas impresas de registro de talla y peso", "Estipendio aprobado para el facilitador externo").
- Define métricas de éxito altamente precisas y cuantitativas vinculadas al logro del sub-paso.`;

    const userPrompt = `Por favor, genera una meta SMART brillante y una planificación detallada secuencial de especificidad máxima para este sub-paso de desarrollo:
- **Área Temática**: ${area}
- **Meta Global**: ${goal}
- **Paso Estratégico General**: "${step}"
- **Sub-paso Práctico Seleccionado**: "${substep}"
- **Descripción Inicial del Sub-paso**: "${substepDescription || ""}"

Proporciona un desglose detallado donde cada tarea, recurso y métrica de éxito esté totalmente focalizado en la ejecución operativa en un Centro de Desarrollo Infantil (CDI) y la iglesia local.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["smartGoal", "tasks", "resources", "metrics"],
          properties: {
            smartGoal: {
              type: Type.OBJECT,
              required: ["title", "statement", "components"],
              properties: {
                title: { type: Type.STRING },
                statement: { type: Type.STRING },
                components: {
                  type: Type.OBJECT,
                  required: ["S", "M", "A", "R", "T"],
                  properties: {
                    S: { type: Type.STRING },
                    M: { type: Type.STRING },
                    A: { type: Type.STRING },
                    R: { type: Type.STRING },
                    T: { type: Type.STRING }
                  }
                }
              }
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "priority", "dependency"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["Alta", "Media", "Baja"] },
                  dependency: { type: Type.STRING }
                }
              }
            },
            resources: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            metrics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating substep detail with Gemini, executing fallback:", error);
    try {
      const fallback = getFallbackSubstepDetail(substep, substepDescription);
      res.json(fallback);
    } catch (fallbackError) {
      res.status(500).json({ error: error?.message || "Ocurrió un error al procesar la solicitud con la Inteligencia Artificial." });
    }
  }
});

// API Route: Generar informe inteligente personalizado adaptado al rol del solicitante
app.post("/api/generate-role-report", async (req, res) => {
  const { role, userName, statsSummary, customDirectives } = req.body;

  if (!role || !userName) {
    return res.status(400).json({ error: "Faltan los parámetros requeridos 'role' y 'userName'." });
  }

  try {
    const systemPrompt = `Eres un Asistente de IA de Nivel Directivo y Consultor de Desarrollo Eclesiástico CDI. Tu labor es generar un informe estratégico profesional, profundo y sumamente adaptado al rol del usuario solicitante, sus estadísticas de rendimiento locales y sus directrices personalizadas.

REGLA DE CONTEXTO ABSOLUTO DE NO-GENERICIDAD:
No generes informes genéricos con las mismas recomendaciones vacías de siempre. Debes incorporar EXPLICITAMENTE en la redacción los datos numéricos reales, cantidades de tareas y estado del CDI según el Resumen Estadístico recibido. Menciona al usuario por su nombre (${userName}) y adecúa el nivel de detalle técnico, espiritual o administrativo según su rol:
- Facilitador (admin): Análisis de gobernanza de datos, cumplimiento de indicadores nacionales del CDI, estandarización y auditorías.
- Pastor (pastor): Cuidado espiritual de los colaboradores, alineación de la visión bíblica de la iglesia local, sostenibilidad financiera y KPIs agregados.
- Director (supervisor): Gestión operativa de los tutores del CDI, cuellos de botella específicos en las tareas y eventos pendientes de calendario, asignaciones semanales.
- Colaborador (user): Tareas individuales de campo, acompañamiento directo a los participantes del CDI y autoevaluación.

El informe debe responder directamente y de manera prioritaria a las directrices personalizadas proporcionadas por el usuario. Si el usuario solicita un tema en particular, la totalidad del informe (resumen, insights, recomendaciones y plan de acción) debe centrarse en ese tema y no en plantillas predefinidas.`;

    const userPrompt = `Por favor, genera un informe estratégico detallado con asistencia de IA de especificidad máxima para:
- **Usuario Solicitante**: ${userName}
- **Rol del Solicitante**: ${role}
- **Datos Estadísticos del CDI**: ${JSON.stringify(statsSummary || {})}
- **Directrices de Enfoque Requeridas**: "${customDirectives || "Sin directrices adicionales, realizar análisis general de desempeño"}"

INSTRUCCIONES CLAVE DE REDACCIÓN:
1. Haz referencia explícita a las directrices de enfoque en el título y en el resumen.
2. Si los datos estadísticos muestran tareas pendientes, tareas completadas o indicadores específicos, úsalos en los Insights y Recomendaciones.
3. El tono debe ser formal, corporativo, pastoral y altamente analítico.`;

    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "summary", "keyInsights", "recommendations", "actionPlan"],
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["action", "timeline"],
                properties: {
                  action: { type: Type.STRING },
                  timeline: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating role report with Gemini, executing fallback:", error);
    const fallbackTitle = role === 'admin' 
      ? 'Informe de Gobernanza e Impacto Nacional'
      : role === 'pastor'
        ? 'Reporte de Salud Espiritual, Administrativa y de Alianza CDI'
        : 'Guía de Control de Operaciones y Avance Táctico CDI';
        
    res.json({
      title: `${fallbackTitle} - ${userName}`,
      summary: `Este informe ha sido generado de manera adaptativa para el rol de ${role}. Se centra en asegurar la continuidad de los procesos de desarrollo integral infantil y la alineación con los objetivos nacionales de CDI. El análisis resalta que la consistencia, la dedicación en las tareas ministeriales y la supervisión oportuna son pilares fundamentales para potenciar el impacto en la comunidad.`,
      keyInsights: [
        "Alineación con las directrices nacionales de servicio y desarrollo espiritual.",
        "Necesidad de optimizar la asignación y seguimiento oportuno de tareas locales.",
        "Oportunidad de estrechar la comunicación pastoral y administrativa del equipo."
      ],
      recommendations: [
        "Establecer reuniones periódicas de revisión táctica para mitigar cuellos de botella.",
        "Reforzar el uso del gestor de tareas digital para centralizar la información.",
        "Implementar jornadas breves de devocional grupal para fortalecer la cohesión ministerial."
      ],
      actionPlan: [
        { action: "Socializar el estado actual de las metas con el equipo local.", timeline: "Esta semana" },
        { action: "Revisar las tareas de alta prioridad pendientes de entrega.", timeline: "Próximos 3 días" },
        { action: "Documentar los desafíos operativos principales para la próxima sesión.", timeline: "Fin de mes" }
      ]
    });
  }
});

// Setup Vite middleware for development or serve build output in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
