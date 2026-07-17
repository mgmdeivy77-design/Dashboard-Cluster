import React, { useState } from "react";
import { Sparkles, BookOpen, ArrowRight, CheckSquare, Calendar, AlertCircle, Loader2, Info, ChevronRight, Check, Target, Trash2, ArrowDown, Church, User, Users, Globe, Edit3, Save, X, PlusCircle, MinusCircle, Plus, RefreshCw } from "lucide-react";
import { User as UserType, Task as TaskType } from '../types';

interface GoalAndSteps {
  id: string;
  goal: string;
  steps: string[];
  outcome?: string;
}

interface AreaConfig {
  name: string;
  iconName: string;
  description: string;
  goals: GoalAndSteps[];
}

const AREAS_DATA: Record<string, AreaConfig> = {
  iglesia: {
    name: "La Iglesia",
    iconName: "Church",
    description: "Desarrollar la pertenencia, capacidad y movilización de recursos para ministrar sosteniblemente a niños y jóvenes.",
    goals: [
      {
        id: "iglesia-g1",
        goal: "Movilizar la iglesia para llegar a los niños y jóvenes",
        outcome: "Pertenencia Local",
        steps: [
          "Establecer una visión bíblica sólida de los niños, los jóvenes y el rol de la iglesia local.",
          "Comprender profundamente los retos y realidades de los niños y jóvenes en el contexto de la comunidad.",
          "Movilizar activamente las capacidades y recursos internos de la congregación para ayudar a la niñez."
        ]
      },
      {
        id: "iglesia-g2",
        goal: "Establecer su propio ministerio activo de niños y jóvenes",
        outcome: "Pertenencia Local",
        steps: [
          "Diseñar planes estratégicos y presupuestos efectivos y sustentables para el ministerio.",
          "Establecer compromisos de aprendizaje continuo, mejora y rendición de cuentas integral."
        ]
      },
      {
        id: "iglesia-g3",
        goal: "Estructurar un gobierno y liderazgo efectivos para el ministerio",
        outcome: "Pertenencia Local",
        steps: [
          "Integrar y gobernar formalmente las actividades del ministerio de niños y jóvenes.",
          "Formar líderes comprometidos y capacitados con un liderazgo efectivo."
        ]
      },
      {
        id: "iglesia-g4",
        goal: "Desarrollar un programa bien definido para el ministerio",
        outcome: "Capacidad Local",
        steps: [
          "Diseñar un programa estructurado con materiales, herramientas y currículos adecuados.",
          "Establecer servicios y redes de apoyo locales para el ministerio."
        ]
      },
      {
        id: "iglesia-g5",
        goal: "Tener personas capacitadas y entrenadas para el ministerio",
        outcome: "Capacidad Local",
        steps: [
          "Reclutar y seleccionar efectivamente a voluntarios y personal para el ministerio.",
          "Entrenar, capacitar y dirigir efectivamente al personal asignado."
        ]
      },
      {
        id: "iglesia-g6",
        goal: "Compromiso con personas influyentes a nivel local",
        outcome: "Recursos Locales",
        steps: [
          "Mantener una excelente reputación de la iglesia dentro de la comunidad local.",
          "Identificar y comprometer aportes de familias, líderes y personas influyentes de la zona."
        ]
      },
      {
        id: "iglesia-g7",
        goal: "Movilización de recursos financieros y materiales para el ministerio",
        outcome: "Recursos Locales",
        steps: [
          "Comprometerse de manera transparente y efectiva con patrocinadores, donantes y aliados.",
          "Motivar y equipar a la iglesia para ser exitosa en la movilización de recursos propios."
        ]
      }
    ]
  },
  jovenes: {
    name: "Los Jóvenes (Participantes)",
    iconName: "User",
    description: "Guiar a los participantes a ser discípulos de Jesucristo, liberarse de la pobreza y influir positivamente.",
    goals: [
      {
        id: "jovenes-g1",
        goal: "Crecimiento en Cristo: Verdad, compromiso, contribución",
        steps: [
          "Ayudar a los jóvenes a internalizar y vivir la verdad bíblica diariamente.",
          "Consolidar un compromiso personal y genuino con el Señor Jesucristo.",
          "Involucrar a los jóvenes a contribuir positivamente a través del servicio activo.",
          "Fomentar su participación en una comunidad cristiana de edificación mutua."
        ]
      },
      {
        id: "jovenes-g2",
        goal: "Bienestar Físico Saludable",
        steps: [
          "Proporcionar conocimientos esenciales sobre salud, nutrición y prevención.",
          "Promover la elección de prácticas y hábitos de vida saludables.",
          "Garantizar que el entorno inmediato del joven favorezca una buena salud integral."
        ]
      },
      {
        id: "jovenes-g3",
        goal: "Bienestar Mental Saludable",
        steps: [
          "Fomentar un ambiente de paz, seguridad y salud socioemocional.",
          "Facilitar el acceso a tratamiento, apoyo profesional y rehabilitación de ser necesario."
        ]
      },
      {
        id: "jovenes-g4",
        goal: "Identidad Propia Saludable",
        steps: [
          "Construir resiliencia frente a la adversidad y cultivar esperanza en el futuro.",
          "Desarrollar una autoimagen positiva, realista y con dignidad según el diseño de Dios."
        ]
      },
      {
        id: "jovenes-g5",
        goal: "Mantener Relaciones Saludables",
        steps: [
          "Fomentar el respeto, perdón y valoración mutua en el círculo familiar y de amigos.",
          "Enseñar una visión bíblica de uno mismo y de los demás.",
          "Desarrollar habilidades interpersonales de comunicación y resolución pacífica de conflictos."
        ]
      },
      {
        id: "jovenes-g6",
        goal: "Agentes de Cambio: Visión, habilidades y carácter",
        steps: [
          "Inculcar una visión motivadora de impacto positivo en su familia, iglesia o colegio.",
          "Equipar con habilidades esenciales de pensamiento crítico, resolución de problemas y liderazgo.",
          "Desarrollar un carácter moral sólido basado en empatía, integridad, honestidad y caridad."
        ]
      },
      {
        id: "jovenes-g7",
        goal: "Suficiencia Económica: Motivación, habilidades y educación",
        steps: [
          "Motivar a los jóvenes a perseguir activamente su independencia económica sustentable.",
          "Capacitar en habilidades técnicas, empresariales, comerciales o profesionales.",
          "Alcanzar un nivel óptimo de educación académica y entrenamiento vocacional según su contexto."
        ]
      }
    ]
  },
  familia: {
    name: "La Familia",
    iconName: "Users",
    description: "Movilizar y apoyar a las familias de los jóvenes para que entiendan su rol y asuman el cuidado.",
    goals: [
      {
        id: "familia-g1",
        goal: "Entendimiento del rol, responsabilidad y cuidado esencial",
        steps: [
          "Asegurar que las familias comprendan su responsabilidad primaria como cuidadores directos.",
          "Capacitar en conocimientos fundamentales de crianza, higiene y cuidado infantil."
        ]
      },
      {
        id: "familia-g2",
        goal: "Valoración bíblica de los niños y niñas",
        steps: [
          "Enseñar el valor sagrado de los niños como seres creados a imagen y semejanza de Dios.",
          "Erradicar visiones de los niños como capital de trabajo o seguro de vejez, reconociéndolos como sujetos de derechos."
        ]
      },
      {
        id: "familia-g3",
        goal: "Priorizar oportunidades para el desarrollo infantil y juvenil",
        steps: [
          "Motivar a las familias a invertir recursos, tiempo y sacrificios para la educación.",
          "Apoyar cursos de capacitación profesional y terminar estudios por encima de las presiones de trabajo inmediato."
        ]
      },
      {
        id: "familia-g4",
        goal: "Proteger activamente a los niños contra peligros",
        steps: [
          "Asegurar un hogar libre de negligencia, violencia, abuso o explotación.",
          "Colaborar en medidas externas de protección como rutas seguras a pie y documentación legal (registro)."
        ]
      },
      {
        id: "familia-g5",
        goal: "Mejorar la capacidad para apoyar económicamente el hogar",
        steps: [
          "Empoderar a las familias para crecer económicamente y proveer para las necesidades básicas del hogar.",
          "Adquirir habilidades de lectura, escritura, selección de alimentos nutritivos y dar soporte emocional."
        ]
      }
    ]
  },
  comunidad: {
    name: "La Comunidad",
    iconName: "Globe",
    description: "Movilizar y concientizar a los sistemas colectivos para establecer condiciones favorables para la niñez.",
    goals: [
      {
        id: "comunidad-g1",
        goal: "Mitigación de riesgos locales y fomento de condiciones favorables",
        steps: [
          "Impulsar la reflexión local sobre las condiciones comunitarias que afectan el bienestar de los niños.",
          "Desarrollar planes conjuntos con líderes comunitarios para mitigar riesgos específicos del entorno."
        ]
      },
      {
        id: "comunidad-g2",
        goal: "La iglesia local como Sal y Luz comunitaria",
        steps: [
          "Vivir el llamado bíblico de impactar activamente la vecindad con programas integrales.",
          "Implementar iniciativas de desarrollo social y comunitario que mejoren el entorno inmediato."
        ]
      }
    ]
  }
};

const AREA_STYLES: Record<string, {
  selectedBg: string;
  selectedBorder: string;
  selectedRing: string;
  iconBg: string;
  iconColor: string;
  textAccent: string;
  hoverBg: string;
  lightBg: string;
  accentBorder: string;
}> = {
  iglesia: {
    selectedBg: "bg-indigo-50/75 dark:bg-indigo-950/35",
    selectedBorder: "border-indigo-500",
    selectedRing: "ring-indigo-500/20",
    iconBg: "bg-indigo-100/70 dark:bg-indigo-950/70",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    textAccent: "text-indigo-600 dark:text-indigo-400",
    hoverBg: "hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 hover:border-indigo-300 dark:hover:border-indigo-800/60",
    lightBg: "bg-indigo-50/10 dark:bg-indigo-950/5",
    accentBorder: "border-indigo-100 dark:border-indigo-950/60",
  },
  jovenes: {
    selectedBg: "bg-teal-50/75 dark:bg-teal-950/35",
    selectedBorder: "border-teal-500",
    selectedRing: "ring-teal-500/20",
    iconBg: "bg-teal-100/70 dark:bg-teal-950/70",
    iconColor: "text-teal-600 dark:text-teal-400",
    textAccent: "text-teal-600 dark:text-teal-400",
    hoverBg: "hover:bg-teal-50/30 dark:hover:bg-teal-950/15 hover:border-teal-300 dark:hover:border-teal-800/60",
    lightBg: "bg-teal-50/10 dark:bg-teal-950/5",
    accentBorder: "border-teal-100 dark:border-teal-950/60",
  },
  familia: {
    selectedBg: "bg-rose-50/75 dark:bg-rose-950/35",
    selectedBorder: "border-rose-500",
    selectedRing: "ring-rose-500/20",
    iconBg: "bg-rose-100/70 dark:bg-rose-950/70",
    iconColor: "text-rose-600 dark:text-rose-400",
    textAccent: "text-rose-600 dark:text-rose-400",
    hoverBg: "hover:bg-rose-50/30 dark:hover:bg-rose-950/15 hover:border-rose-300 dark:hover:border-rose-800/60",
    lightBg: "bg-rose-50/10 dark:bg-rose-950/5",
    accentBorder: "border-rose-100 dark:border-rose-950/60",
  },
  comunidad: {
    selectedBg: "bg-emerald-50/75 dark:bg-emerald-950/35",
    selectedBorder: "border-emerald-500",
    selectedRing: "ring-emerald-500/20",
    iconBg: "bg-emerald-100/70 dark:bg-emerald-950/70",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    textAccent: "text-emerald-600 dark:text-emerald-400",
    hoverBg: "hover:bg-emerald-50/30 dark:hover:bg-emerald-950/15 hover:border-emerald-300 dark:hover:border-emerald-800/60",
    lightBg: "bg-emerald-50/10 dark:bg-emerald-950/5",
    accentBorder: "border-emerald-100 dark:border-emerald-950/60",
  }
};

const AreaIcon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "Church":
      return <Church className={className} />;
    case "User":
      return <User className={className} />;
    case "Users":
      return <Users className={className} />;
    case "Globe":
      return <Globe className={className} />;
    default:
      return <Target className={className} />;
  }
};

interface SuggestedTask {
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  category: string;
  subtasks: string[];
}

interface SuggestedEvent {
  title: string;
  description: string;
  dateOffset: number;
  category: string;
}

interface SmartGoalComponents {
  S: string;
  M: string;
  A: string;
  R: string;
  T: string;
}

interface SmartGoal {
  title: string;
  statement: string;
  components: SmartGoalComponents;
}

interface GeneratedPlan {
  smartGoal?: SmartGoal;
  strategicOverview?: string; // fallback if needed
  suggestedTasks: SuggestedTask[];
  suggestedEvents: SuggestedEvent[];
  selectedStep?: string;
  parentGoal?: string;
  isFallback?: boolean;
  importance?: string;
  metrics?: string[];
  practicalSteps?: { title: string; description: string }[];
}

interface SavedPlan {
  id: string;
  selectedStep: string;
  parentGoal: string;
  area: string;
  smartGoal?: SmartGoal;
  strategicOverview?: string;
  suggestedTasks: SuggestedTask[];
  suggestedEvents: SuggestedEvent[];
  addedTasksIndices: number[];
  addedEventsIndices: number[];
  createdAt: string;
  isFallback?: boolean;
  importance?: string;
  metrics?: string[];
  practicalSteps?: { title: string; description: string }[];
}

interface AIAssistantProps {
  onAddTask: (task: {
    title: string;
    description: string;
    priority: 'Alta' | 'Media' | 'Baja';
    category: string;
    subtasks: { id: string; title: string; completed: boolean }[];
    dueDate: string;
  }) => void;
  onAddEvent: (event: {
    title: string;
    description: string;
    date: string;
    category: string;
    color: string;
  }) => void;
  triggerNotification: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  currentUser?: UserType;
  tasks?: TaskType[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onAddTask, onAddEvent, triggerNotification, currentUser, tasks = [] }) => {
  const [selectedArea, setSelectedArea] = useState<string>(() => {
    return localStorage.getItem('compas_ai_area') || "iglesia";
  });
  
  // Selected official step from the list
  const [selectedStep, setSelectedStep] = useState<string>(() => {
    return localStorage.getItem('compas_ai_selected_step') || "";
  });

  // Selected step's parent goal
  const [selectedStepParentGoal, setSelectedStepParentGoal] = useState<string>(() => {
    return localStorage.getItem('compas_ai_selected_step_parent_goal') || "";
  });

  const [customContext, setCustomContext] = useState<string>(() => {
    return localStorage.getItem('compas_ai_context') || "";
  });

  // Which goal section is expanded (accordion state for steps explorer)
  const [expandedGoalId, setExpandedGoalId] = useState<string>(() => {
    const saved = localStorage.getItem('compas_ai_expanded_goal');
    return saved || "";
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref for cancellation
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Manual creation state
  const [isCreatingManually, setIsCreatingManually] = useState<boolean>(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualStatement, setManualStatement] = useState("");
  const [manualComponents, setManualComponents] = useState<SmartGoalComponents>({ S: "", M: "", A: "", R: "", T: "" });
  const [manualTasks, setManualTasks] = useState<SuggestedTask[]>([
    { title: "Primera reunión de coordinación", description: "Establecer roles, fechas límite y recursos necesarios.", priority: "Alta", category: "", subtasks: ["Definir líder del proyecto", "Asignar presupuesto inicial"] }
  ]);
  const [manualArea, setManualArea] = useState("iglesia");

  // Inline editing of active plan SMART goal
  const [isEditingSmartGoal, setIsEditingSmartGoal] = useState<boolean>(false);
  const [editGoalTitle, setEditGoalTitle] = useState<string>("");
  const [editGoalStatement, setEditGoalStatement] = useState<string>("");
  const [editGoalComponents, setEditGoalComponents] = useState<SmartGoalComponents>({ S: "", M: "", A: "", R: "", T: "" });

  // Inline editing of active plan task
  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState<string>("");
  const [editTaskDescription, setEditTaskDescription] = useState<string>("");
  const [editTaskPriority, setEditTaskPriority] = useState<'Alta' | 'Media' | 'Baja'>("Media");
  const [editTaskSubtasks, setEditTaskSubtasks] = useState<string[]>([]);
  const [editTaskNewSubtaskInput, setEditTaskNewSubtaskInput] = useState<string>("");

  // Adding custom task inline to active plan
  const [isAddingCustomTask, setIsAddingCustomTask] = useState<boolean>(false);
  const [newCustomTaskTitle, setNewCustomTaskTitle] = useState<string>("");
  const [newCustomTaskDescription, setNewCustomTaskDescription] = useState<string>("");
  const [newCustomTaskPriority, setNewCustomTaskPriority] = useState<'Alta' | 'Media' | 'Baja'>("Media");
  const [newCustomTaskSubtasks, setNewCustomTaskSubtasks] = useState<string[]>([]);
  const [newCustomTaskSubtaskInput, setNewCustomTaskSubtaskInput] = useState<string>("");

  // Secure delete verification states
  const [deleteConfirmPlanId, setDeleteConfirmPlanId] = useState<string | null>(null);
  const [deleteVerificationInput, setDeleteVerificationInput] = useState<string>("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");

  // Sub-step Detail generation states
  const [substepModalOpen, setSubstepModalOpen] = useState<boolean>(false);
  const [selectedSubstepTitle, setSelectedSubstepTitle] = useState<string>("");
  const [selectedSubstepDesc, setSelectedSubstepDesc] = useState<string>("");
  const [substepLoading, setSubstepLoading] = useState<boolean>(false);
  const [substepDetail, setSubstepDetail] = useState<any>(null);
  const [substepError, setSubstepError] = useState<string | null>(null);
  
  // Which saved plan's details (Importance, Sub-steps) are expanded
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Secure regeneration confirmation state
  const [regenerateConfirmPlanId, setRegenerateConfirmPlanId] = useState<string | null>(null);
  
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('compas_ai_saved_plans');
    try {
      if (saved) {
        return JSON.parse(saved);
      }
      // Migration from legacy single plan
      const legacyPlanStr = localStorage.getItem('compas_ai_plan');
      if (legacyPlanStr) {
        const legacyPlan = JSON.parse(legacyPlanStr);
        let legacyAddedTasks: number[] = [];
        let legacyAddedEvents: number[] = [];
        try {
          const tSaved = localStorage.getItem('compas_ai_added_tasks');
          if (tSaved) legacyAddedTasks = JSON.parse(tSaved);
        } catch (e) {}
        try {
          const eSaved = localStorage.getItem('compas_ai_added_events');
          if (eSaved) legacyAddedEvents = JSON.parse(eSaved);
        } catch (e) {}

        const migrated: SavedPlan = {
          id: "migrated-legacy",
          selectedStep: legacyPlan.selectedStep || "",
          parentGoal: legacyPlan.parentGoal || "",
          area: localStorage.getItem('compas_ai_area') || "iglesia",
          smartGoal: legacyPlan.smartGoal,
          strategicOverview: legacyPlan.strategicOverview,
          suggestedTasks: legacyPlan.suggestedTasks || [],
          suggestedEvents: legacyPlan.suggestedEvents || [],
          addedTasksIndices: legacyAddedTasks,
          addedEventsIndices: legacyAddedEvents,
          createdAt: new Date().toISOString()
        };
        return [migrated];
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    const savedId = localStorage.getItem('compas_ai_active_plan_id');
    if (savedId) return savedId;
    
    // Fallback to first plan in savedPlans
    const saved = localStorage.getItem('compas_ai_saved_plans');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length > 0) return parsed[0].id;
      if (localStorage.getItem('compas_ai_plan')) return "migrated-legacy";
    } catch (e) {}
    return "";
  });

  // Keep savedPlans and activePlanId in sync with localStorage
  React.useEffect(() => {
    localStorage.setItem('compas_ai_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  React.useEffect(() => {
    localStorage.setItem('compas_ai_active_plan_id', activePlanId);
  }, [activePlanId]);

  // Derived active plan
  const activePlan = savedPlans.find(p => p.id === activePlanId) || null;
  const generatedPlan = activePlan; // for backward compatibility in render

  const addedTasksIndices = React.useMemo(() => {
    return new Set(activePlan?.addedTasksIndices || []);
  }, [activePlan]);

  const addedEventsIndices = React.useMemo(() => {
    return new Set(activePlan?.addedEventsIndices || []);
  }, [activePlan]);

  // Save changes to localStorage on state transitions
  React.useEffect(() => {
    localStorage.setItem('compas_ai_area', selectedArea);
  }, [selectedArea]);

  React.useEffect(() => {
    localStorage.setItem('compas_ai_selected_step', selectedStep);
  }, [selectedStep]);

  React.useEffect(() => {
    localStorage.setItem('compas_ai_selected_step_parent_goal', selectedStepParentGoal);
  }, [selectedStepParentGoal]);

  React.useEffect(() => {
    localStorage.setItem('compas_ai_context', customContext);
  }, [customContext]);

  React.useEffect(() => {
    localStorage.setItem('compas_ai_expanded_goal', expandedGoalId);
  }, [expandedGoalId]);

  const currentAreaConfig = AREAS_DATA[selectedArea] || AREAS_DATA.iglesia;

  const handleAreaChange = (areaKey: string) => {
    setSelectedArea(areaKey);
    setExpandedGoalId("");
    setError(null);
  };

  const handleSelectStep = (stepText: string, goalText: string) => {
    setSelectedStep(stepText);
    setSelectedStepParentGoal(goalText);
    triggerNotification(`Seleccionado: "${stepText.substring(0, 35)}..."`, "info");
  };

  const handleClearPlan = () => {
    setSelectedStep("");
    setSelectedStepParentGoal("");
    setCustomContext("");
    triggerNotification("Listo para diseñar otra estrategia. Tu meta anterior sigue guardada en tu panel.", "info");
  };

  const getPlanHasAssignedTasks = (plan: SavedPlan) => {
    // 1. Check if we have indices marked as added in the plan state
    if (plan.addedTasksIndices && plan.addedTasksIndices.length > 0) {
      return true;
    }
    // 2. Scan active tasks list for references to the SMART Goal title or statement in description
    if (tasks && plan.smartGoal?.title) {
      const titleLower = plan.smartGoal.title.toLowerCase().trim();
      if (titleLower) {
        return tasks.some(t => 
          t.title?.toLowerCase().includes(titleLower) || 
          t.description?.toLowerCase().includes(titleLower)
        );
      }
    }
    return false;
  };

  const handleDeletePlan = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const planToDelete = savedPlans.find(p => p.id === id);
    if (!planToDelete) return;

    // A. Check if the plan has assigned tasks
    const hasAssignedTasks = getPlanHasAssignedTasks(planToDelete);

    // B. If it has assigned tasks, only Facilitador (admin) can delete it
    if (hasAssignedTasks && currentUser?.role !== 'admin') {
      triggerNotification(
        "Esta meta SMART ya tiene tareas asignadas en el Kanban. Solo el Facilitador (Super Facilitador / Admin) tiene permisos para eliminarla.", 
        "warning"
      );
      return;
    }

    // C. Open security confirmation dialog
    setDeleteConfirmPlanId(id);
    setDeleteVerificationInput("");
    setDeleteErrorMessage("");
  };

  const handleConfirmSecureDelete = () => {
    if (!deleteConfirmPlanId) return;
    
    if (deleteVerificationInput.trim().toUpperCase() !== "ELIMINAR") {
      setDeleteErrorMessage("Debes escribir la palabra 'ELIMINAR' exactamente para confirmar.");
      return;
    }

    const id = deleteConfirmPlanId;
    const planToDelete = savedPlans.find(p => p.id === id);
    if (!planToDelete) return;

    setSavedPlans(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // Select another plan if the deleted one was active
      if (activePlanId === id) {
        if (filtered.length > 0) {
          setActivePlanId(filtered[0].id);
        } else {
          setActivePlanId("");
        }
      }
      if (expandedPlanId === id) {
        setExpandedPlanId(null);
      }
      return filtered;
    });

    setDeleteConfirmPlanId(null);
    setDeleteVerificationInput("");
    setDeleteErrorMessage("");
    triggerNotification("¡Meta SMART y plan de acción eliminados de forma segura!", "success");
  };

  const handleSubstepClick = async (title: string, description: string) => {
    setSelectedSubstepTitle(title);
    setSelectedSubstepDesc(description);
    setSubstepModalOpen(true);
    setSubstepLoading(true);
    setSubstepError(null);
    setSubstepDetail(null);

    try {
      const response = await fetch("/api/generate-substep-detail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          area: selectedArea,
          goal: selectedStepParentGoal || activePlan?.parentGoal || "Meta General",
          step: selectedStep || activePlan?.selectedStep || "Paso Oficial",
          substep: title,
          substepDescription: description,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      setSubstepDetail(data);
    } catch (err: any) {
      console.error("Error generating substep detail:", err);
      setSubstepError("No se pudo generar el plan detallado. Por favor, inténtalo de nuevo.");
      triggerNotification("Error al conectar con la Inteligencia Artificial.", "warning");
    } finally {
      setSubstepLoading(false);
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      triggerNotification("Se detuvo la generación de la IA.", "info");
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedStep) {
      triggerNotification("Por favor, selecciona primero una acción o paso del documento oficial a la izquierda.", "warning");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate-smart-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          area: currentAreaConfig.name,
          goal: selectedStepParentGoal,
          step: selectedStep,
          context: customContext.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Falló la comunicación con el servicio de IA.");
      }

      const data = await response.json();
      
      const newPlanId = `plan-${Date.now()}`;
      const newSavedPlan: SavedPlan = {
        id: newPlanId,
        selectedStep,
        parentGoal: selectedStepParentGoal,
        area: selectedArea,
        importance: data.importance,
        metrics: data.metrics || [],
        practicalSteps: data.practicalSteps || [],
        suggestedTasks: [],
        suggestedEvents: [],
        addedTasksIndices: [],
        addedEventsIndices: [],
        createdAt: new Date().toISOString(),
        isFallback: !!data.isFallback
      };

      setSavedPlans(prev => [newSavedPlan, ...prev]);
      setActivePlanId(newPlanId);
      
      if (data.isFallback) {
        triggerNotification("Servidor saturado. ¡Hemos diseñado una guía informativa pre-configurada de alta calidad para ti!", "info");
      } else {
        triggerNotification("¡Guía práctica e informativa del paso oficial generada con éxito!", "success");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Generación cancelada manualmente.");
        return;
      }
      console.error(err);
      setError(err?.message || "Ocurrió un error inesperado al conectar con el Asistente de IA.");
      triggerNotification("Error al generar el plan de acción.", "warning");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegeneratePlan = async (planId: string) => {
    const planToRegenerate = savedPlans.find(p => p.id === planId);
    if (!planToRegenerate) return;

    const areaName = AREAS_DATA[planToRegenerate.area]?.name || "Iglesia";

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate-smart-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          area: areaName,
          goal: planToRegenerate.parentGoal,
          step: planToRegenerate.selectedStep,
          context: customContext.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Falló la comunicación con el servicio de IA.");
      }

      const data = await response.json();

      setSavedPlans(prev => prev.map(p => {
        if (p.id === planId) {
          return {
            ...p,
            importance: data.importance,
            metrics: data.metrics || [],
            practicalSteps: data.practicalSteps || [],
            isFallback: !!data.isFallback
          };
        }
        return p;
      }));

      // Keep it expanded so the user can inspect the fresh new results!
      setExpandedPlanId(planId);

      if (data.isFallback) {
        triggerNotification("Servidor saturado. ¡Hemos diseñado una guía pre-configurada para este paso de desarrollo!", "info");
      } else {
        triggerNotification("¡Guía práctica regenerada con éxito!", "success");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Regeneración cancelada manualmente.");
        return;
      }
      console.error(err);
      setError(err?.message || "Ocurrió un error inesperado al conectar con el Asistente de IA.");
      triggerNotification("Error al regenerar el plan de acción.", "warning");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Save manually created plan
  const handleSaveManualPlan = () => {
    if (!manualTitle.trim()) {
      triggerNotification("Por favor, ingresa un título para la meta.", "warning");
      return;
    }
    const newPlanId = `plan-manual-${Date.now()}`;
    const newSavedPlan: SavedPlan = {
      id: newPlanId,
      selectedStep: `Paso Manual: ${manualTitle}`,
      parentGoal: `Meta Manual: ${manualTitle}`,
      area: manualArea,
      smartGoal: {
        title: manualTitle,
        statement: manualStatement,
        components: manualComponents,
      },
      suggestedTasks: manualTasks,
      suggestedEvents: [],
      addedTasksIndices: [],
      addedEventsIndices: [],
      createdAt: new Date().toISOString(),
    };

    setSavedPlans(prev => [newSavedPlan, ...prev]);
    setActivePlanId(newPlanId);
    setIsCreatingManually(false);
    triggerNotification("¡Meta SMART y plan de acción manual creados con éxito!", "success");

    // Clear form
    setManualTitle("");
    setManualStatement("");
    setManualComponents({ S: "", M: "", A: "", R: "", T: "" });
    setManualTasks([
      { title: "Primera reunión de coordinación", description: "Establecer roles, fechas límite y recursos necesarios.", priority: "Alta", category: "", subtasks: ["Definir líder del proyecto", "Asignar presupuesto inicial"] }
    ]);
  };

  // Start editing active SMART Goal
  const startEditingSmartGoal = () => {
    if (!activePlan || !activePlan.smartGoal) return;
    setEditGoalTitle(activePlan.smartGoal.title || "");
    setEditGoalStatement(activePlan.smartGoal.statement || "");
    setEditGoalComponents(activePlan.smartGoal.components || { S: "", M: "", A: "", R: "", T: "" });
    setIsEditingSmartGoal(true);
  };

  // Save edited active SMART Goal
  const saveEditedSmartGoal = () => {
    if (!editGoalTitle.trim()) {
      triggerNotification("El título no puede estar vacío.", "warning");
      return;
    }
    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlanId) {
        return {
          ...p,
          smartGoal: {
            title: editGoalTitle,
            statement: editGoalStatement,
            components: editGoalComponents,
          }
        };
      }
      return p;
    }));
    setIsEditingSmartGoal(false);
    triggerNotification("¡Meta SMART actualizada!", "success");
  };

  // Start editing a task
  const startEditingTask = (idx: number) => {
    if (!activePlan) return;
    const task = activePlan.suggestedTasks[idx];
    if (!task) return;
    setEditingTaskIdx(idx);
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description);
    setEditTaskPriority(task.priority);
    setEditTaskSubtasks(task.subtasks || []);
    setEditTaskNewSubtaskInput("");
  };

  // Save edited task
  const saveEditedTask = (idx: number) => {
    if (!editTaskTitle.trim()) {
      triggerNotification("El título de la tarea no puede estar vacío.", "warning");
      return;
    }
    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlanId) {
        const updatedTasks = [...p.suggestedTasks];
        updatedTasks[idx] = {
          ...updatedTasks[idx],
          title: editTaskTitle,
          description: editTaskDescription,
          priority: editTaskPriority,
          subtasks: editTaskSubtasks,
        };
        return {
          ...p,
          suggestedTasks: updatedTasks,
        };
      }
      return p;
    }));
    setEditingTaskIdx(null);
    triggerNotification("¡Tarea actualizada con éxito!", "success");
  };

  // Delete a task from suggestions
  const handleDeleteSuggestedTask = (idx: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea del plan?")) return;
    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlanId) {
        const updatedTasks = p.suggestedTasks.filter((_, i) => i !== idx);
        // Also fix the addedTasksIndices since the positions shifted
        const updatedAddedIndices = p.addedTasksIndices
          .filter(i => i !== idx)
          .map(i => i > idx ? i - 1 : i);
        return {
          ...p,
          suggestedTasks: updatedTasks,
          addedTasksIndices: updatedAddedIndices,
        };
      }
      return p;
    }));
    triggerNotification("Se eliminó la tarea de las sugerencias.", "info");
  };

  // Save a custom task inside the active plan
  const handleSaveCustomTask = () => {
    if (!newCustomTaskTitle.trim()) {
      triggerNotification("Por favor, ingresa el título de la tarea.", "warning");
      return;
    }
    const newTask: SuggestedTask = {
      title: newCustomTaskTitle,
      description: newCustomTaskDescription,
      priority: newCustomTaskPriority,
      category: activePlan?.area ? AREAS_DATA[activePlan.area]?.name : "",
      subtasks: newCustomTaskSubtasks,
    };

    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlanId) {
        return {
          ...p,
          suggestedTasks: [...p.suggestedTasks, newTask]
        };
      }
      return p;
    }));

    setIsAddingCustomTask(false);
    setNewCustomTaskTitle("");
    setNewCustomTaskDescription("");
    setNewCustomTaskPriority("Media");
    setNewCustomTaskSubtasks([]);
    setNewCustomTaskSubtaskInput("");
    triggerNotification("¡Tarea personalizada añadida al plan!", "success");
  };

  const handleAddSuggestedTask = (task: SuggestedTask, index: number) => {
    if (!activePlan) return;
    if (addedTasksIndices.has(index)) return;

    // Distribute due dates logically based on index (e.g. step 1 in 7 days, step 2 in 14 days...)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (index + 1) * 7);
    const dateStr = targetDate.toISOString().split("T")[0];

    const smartGoalSection = activePlan.smartGoal ? `

---

### 🎯 Meta SMART Vinculada
**${activePlan.smartGoal.title}**
> ${activePlan.smartGoal.statement}

#### 📋 Criterios SMART de la Meta:
*   **Específico (S):** ${activePlan.smartGoal.components?.S || ''}
*   **Medible (M):** ${activePlan.smartGoal.components?.M || ''}
*   **Alcanzable (A):** ${activePlan.smartGoal.components?.A || ''}
*   **Relevante (R):** ${activePlan.smartGoal.components?.R || ''}
*   **Temporal (T):** ${activePlan.smartGoal.components?.T || ''}` : `\n\n*Creada desde el Asistente de IA basada en el paso: ${activePlan.selectedStep}*`;

    onAddTask({
      title: task.title,
      description: `${task.description}${smartGoalSection}`,
      priority: task.priority,
      category: task.category || currentAreaConfig.name,
      subtasks: task.subtasks.map((st, i) => ({
        id: `st-ai-${Math.random().toString(36).substr(2, 9)}-${i}`,
        title: st,
        completed: false,
      })),
      dueDate: dateStr,
    });

    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlan.id) {
        return {
          ...p,
          addedTasksIndices: [...p.addedTasksIndices, index]
        };
      }
      return p;
    }));

    triggerNotification(`¡Paso ${index + 1} agregado al Kanban!: "${task.title}"`, "success");
  };

  const handleAddSuggestedEvent = (event: SuggestedEvent, index: number) => {
    if (!activePlan) return;
    if (addedEventsIndices.has(index)) return;

    // Schedule date based on offset days
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (event.dateOffset || 7));
    const dateStr = targetDate.toISOString().split("T")[0];

    // Select color based on area
    let color = "#3b82f6"; // blue
    if (activePlan.area === "iglesia") color = "#6366f1"; // indigo
    if (activePlan.area === "jovenes") color = "#06b6d4"; // cyan
    if (activePlan.area === "familia") color = "#ec4899"; // pink
    if (activePlan.area === "comunidad") color = "#10b981"; // emerald

    onAddEvent({
      title: event.title,
      description: `${event.description}\n\n*Reunión clave para lograr la meta SMART: ${activePlan.smartGoal?.title || activePlan.selectedStep}*`,
      date: dateStr,
      category: event.category || currentAreaConfig.name,
      color,
    });

    setSavedPlans(prev => prev.map(p => {
      if (p.id === activePlan.id) {
        return {
          ...p,
          addedEventsIndices: [...p.addedEventsIndices, index]
        };
      }
      return p;
    }));

    triggerNotification(`Se agendó el evento: "${event.title}" para el día ${dateStr}`, "success");
  };

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start gap-5">
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 rounded-2xl shrink-0">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
            Asistente Estratégico IA (Plan de Acción Estratégico)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
            Esta sección integra las directrices oficiales de desarrollo para la Iglesia, los Jóvenes, la Familia y la Comunidad. El Asistente de Inteligencia Artificial analiza las metas y los pasos esperados, y te sugiere un plan de acción práctico con tareas y reuniones agendadas que puedes añadir directamente a tu tablero con un solo clic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration Forms (5 Cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-5">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="p-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-[10px]">1</span>
              <span>Selecciona el Área de Trabajo</span>
            </h3>

            {/* Areas Selector Cards */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(AREAS_DATA).map(([key, config]) => {
                const isSelected = selectedArea === key;
                const style = AREA_STYLES[key] || {
                  selectedBg: "bg-blue-50/50 dark:bg-blue-950/20",
                  selectedBorder: "border-blue-500/80",
                  selectedRing: "ring-blue-500/20",
                  iconBg: "bg-blue-50 dark:bg-blue-950",
                  iconColor: "text-blue-600 dark:text-blue-400",
                  textAccent: "text-blue-600 dark:text-blue-400",
                  hoverBg: "hover:bg-slate-50 dark:hover:bg-slate-800/40",
                  lightBg: "bg-slate-100 dark:bg-slate-800",
                  accentBorder: "border-slate-200 dark:border-slate-800"
                };

                return (
                  <button
                    key={key}
                    onClick={() => handleAreaChange(key)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col gap-2.5 relative overflow-hidden group ${
                      isSelected
                        ? `${style.selectedBg} ${style.selectedBorder} ring-1 ${style.selectedRing} shadow-xs`
                        : `bg-slate-50/40 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 ${style.hoverBg}`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isSelected 
                          ? style.iconBg
                          : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200/50 dark:group-hover:bg-slate-800/80"
                      } ${isSelected ? style.iconColor : ""}`}>
                        <AreaIcon name={config.iconName} className="w-4 h-4" />
                      </div>
                      <span className={`text-[12px] font-extrabold tracking-tight leading-none transition-colors ${
                        isSelected ? style.textAccent : "text-slate-700 dark:text-slate-200"
                      }`}>
                        {config.name}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {config.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Steps Visual Guidance - Interactive Accordion */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest pb-1 flex items-center gap-2">
                <span className="p-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg text-[10px]">2</span>
                <span>Haz clic en un Paso Oficial del Documento</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                Haz clic en una de las metas de abajo para ver sus pasos oficiales, luego selecciona el paso específico sobre el cual deseas que la IA genere un plan.
              </p>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {(() => {
                  let lastOutcome = "";
                  return currentAreaConfig.goals.map((goalGroup) => {
                    const isExpanded = expandedGoalId === goalGroup.id;
                    const showOutcomeHeader = goalGroup.outcome && goalGroup.outcome !== lastOutcome;
                    if (goalGroup.outcome) {
                      lastOutcome = goalGroup.outcome;
                    }
                    return (
                      <React.Fragment key={goalGroup.id}>
                        {showOutcomeHeader && (
                          <div className="pt-4 pb-1.5 first:pt-0">
                            <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200/50 dark:border-blue-900/30">
                              Resultado: {goalGroup.outcome}
                            </span>
                          </div>
                        )}
                        <div 
                          className="border border-slate-200/60 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20"
                        >
                          <button
                            onClick={() => setExpandedGoalId(isExpanded ? "" : goalGroup.id)}
                            className="w-full px-4 py-3 text-left flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors cursor-pointer"
                          >
                            <div className="flex gap-2 items-start">
                              <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-snug">
                                {goalGroup.goal}
                              </span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform shrink-0 mt-0.5 ${isExpanded ? "rotate-90" : ""}`} />
                          </button>

                          {isExpanded && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 space-y-2 divide-y divide-slate-100 dark:divide-slate-850">
                              {goalGroup.steps.map((step, sIdx) => {
                                const isSelected = selectedStep === step;
                                return (
                                  <button
                                    key={sIdx}
                                    onClick={() => handleSelectStep(step, goalGroup.goal)}
                                    className={`w-full text-left p-2.5 rounded-xl text-[11px] leading-relaxed transition-all cursor-pointer flex gap-2.5 items-start ${
                                      sIdx > 0 ? "pt-2" : ""
                                    } ${
                                      isSelected
                                        ? "bg-blue-50/85 dark:bg-blue-950/40 text-blue-750 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-extrabold ${
                                      isSelected 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    }`}>
                                      {isSelected ? "✓" : sIdx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Selected Step & Form Options */}
            {selectedStep ? (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                <div className="bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-2xl space-y-1.5">
                  <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Paso Seleccionado para Plan SMART:</span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    "{selectedStep}"
                  </p>
                </div>

                {/* Custom context input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>Contexto o Retos Locales (Opcional)</span>
                    <span className="text-slate-400 italic">Opcional</span>
                  </label>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="Ej: Solo tenemos 2 voluntarios, o la iglesia tiene retos financieros en este momento..."
                    className="w-full min-h-[80px] bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed text-[11px]"
                  />
                </div>

                {/* Trigger Button */}
                <button
                  onClick={handleGeneratePlan}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analizando Paso y Diseñando Guía...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>Generar Guía de Implementación del Paso</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center p-5 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 space-y-2">
                <ArrowDown className="w-5 h-5 text-indigo-500 mx-auto animate-bounce" />
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
                  Por favor, selecciona uno de los <strong>Pasos Oficiales</strong> de arriba para activar el generador de guías de implementación con IA.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output / Action Plan (7 Cols) */}
        <div className="xl:col-span-7">
          {isCreatingManually ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-white">
                      Diseño Manual de Meta SMART y Plan
                    </h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-none">
                      Define tu meta y lista de tareas paso a paso de forma manual
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreatingManually(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Area Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Área de Trabajo
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(AREAS_DATA).map(([key, config]) => {
                      const isSelected = manualArea === key;
                      const style = AREA_STYLES[key] || {
                        selectedBg: "bg-blue-50/50 dark:bg-blue-950/20",
                        selectedBorder: "border-blue-500",
                        textAccent: "text-blue-600 dark:text-blue-400"
                      };
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setManualArea(key)}
                          className={`py-2 px-1 text-center rounded-xl border text-[10px] font-extrabold cursor-pointer transition-colors ${
                            isSelected
                              ? `${style.selectedBg} ${style.selectedBorder} ${style.textAccent}`
                              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500"
                          }`}
                        >
                          {config.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Título de la Meta SMART
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej: Formar un equipo de 5 voluntarios para niños"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>

                {/* Declaración */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Declaración SMART Completa
                  </label>
                  <textarea
                    value={manualStatement}
                    onChange={(e) => setManualStatement(e.target.value)}
                    placeholder="Ej: Para el 30 de agosto de 2026, la iglesia contará con 5 personas formalmente capacitadas que dictarán talleres semanales..."
                    className="w-full min-h-[70px] bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* SMART Components */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Componentes de la Meta SMART (Opcional)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {[
                      { key: "S", label: "S (Específico)", placeholder: "Qué", color: "border-blue-500/50" },
                      { key: "M", label: "M (Medible)", placeholder: "Cuánto", color: "border-emerald-500/50" },
                      { key: "A", label: "A (Alcanzable)", placeholder: "Cómo", color: "border-indigo-500/50" },
                      { key: "R", label: "R (Relevante)", placeholder: "Por qué", color: "border-amber-500/50" },
                      { key: "T", label: "T (Temporal)", placeholder: "Cuándo", color: "border-rose-500/50" }
                    ].map((comp) => (
                      <div key={comp.key} className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 block">{comp.label}</span>
                        <input
                          type="text"
                          value={(manualComponents as any)[comp.key]}
                          onChange={(e) => setManualComponents(prev => ({ ...prev, [comp.key]: e.target.value }))}
                          placeholder={comp.placeholder}
                          className={`w-full bg-slate-50 dark:bg-slate-950 border ${comp.color} rounded-lg px-2 py-1 text-[10px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-hidden`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tareas de Implementación ({manualTasks.length})</span>
                    <button
                      type="button"
                      onClick={() => setManualTasks(prev => [...prev, { title: "", description: "", priority: "Media", category: "", subtasks: [] }])}
                      className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir Tarea</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {manualTasks.map((t, tIdx) => (
                      <div key={tIdx} className="bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => setManualTasks(prev => prev.filter((_, idx) => idx !== tIdx))}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500">Paso {tIdx + 1} - Título</span>
                            <input
                              type="text"
                              value={t.title}
                              onChange={(e) => {
                                const updated = [...manualTasks];
                                updated[tIdx].title = e.target.value;
                                setManualTasks(updated);
                              }}
                              placeholder="Ej: Primera reunión organizadora"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-500">Prioridad</span>
                            <select
                              value={t.priority}
                              onChange={(e) => {
                                const updated = [...manualTasks];
                                updated[tIdx].priority = e.target.value as any;
                                setManualTasks(updated);
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300"
                            >
                              <option value="Alta">Alta</option>
                              <option value="Media">Media</option>
                              <option value="Baja">Baja</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500">Descripción de la Tarea</span>
                          <input
                            type="text"
                            value={t.description}
                            onChange={(e) => {
                              const updated = [...manualTasks];
                              updated[tIdx].description = e.target.value;
                              setManualTasks(updated);
                            }}
                            placeholder="Qué se hará y quién se encargará..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleSaveManualPlan}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Plan de Acción</span>
                  </button>
                  <button
                    onClick={() => setIsCreatingManually(false)}
                    className="py-2.5 px-4 border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Saved Plans List Dashboard */}
              {savedPlans.length > 0 && (
            <div className="mb-6 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold text-slate-850 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>Mis Pasos Estratégicos Activos ({savedPlans.length})</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {savedPlans.map((plan) => {
                  const isActive = plan.id === activePlanId;
                  const totalTasks = plan.suggestedTasks.length;
                  const completedCount = plan.addedTasksIndices.length;
                  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
                  
                  let areaLabel = "Iglesia";
                  let areaColor = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50";
                  if (plan.area === "jovenes") {
                    areaLabel = "Jóvenes";
                    areaColor = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/50";
                  } else if (plan.area === "familia") {
                    areaLabel = "Familia";
                    areaColor = "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200/50";
                  } else if (plan.area === "comunidad") {
                    areaLabel = "Comunidad";
                    areaColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50";
                  }

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        if (activePlanId !== plan.id) {
                          setActivePlanId(plan.id);
                          setExpandedPlanId(plan.id);
                        } else {
                          if (expandedPlanId === plan.id) {
                            setExpandedPlanId(null);
                          } else {
                            setExpandedPlanId(plan.id);
                          }
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group hover:shadow-xs ${
                        isActive && expandedPlanId === plan.id
                          ? "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/20"
                          : isActive
                            ? "bg-slate-50/70 dark:bg-slate-950/30 border-slate-450 dark:border-slate-700 ring-1 ring-slate-400/20"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5 pr-14">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 border uppercase tracking-wider rounded ${areaColor}`}>
                            {areaLabel}
                          </span>
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">
                            {new Date(plan.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold line-clamp-2 ${isActive ? "text-indigo-950 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                          {plan.smartGoal?.title || plan.selectedStep}
                        </h4>
                      </div>

                      {/* Action overlays on top-right */}
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRegenerateConfirmPlanId(plan.id);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Regenerar plan con IA"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Eliminar este plan permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Micro progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-450 dark:text-slate-400">
                          <span>Avance en Tablero</span>
                          <span>{progressPercent}% ({completedCount}/{totalTasks})</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPercent === 100 ? "bg-emerald-500" : "bg-indigo-500"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Expand / Collapse Indicator */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-850/80 flex items-center justify-between">
                        <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase">Detalles de la Guía</span>
                        {expandedPlanId === plan.id ? (
                          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors">
                            <span>Ocultar</span>
                            <span>▲</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-colors">
                            <span>Ver Resultados</span>
                            <span className="animate-pulse">✨ ▼</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4 min-h-[400px] animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full animate-bounce">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Diseñando plan con la IA
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                  Estamos analizando los pasos específicos del documento y tu contexto local para generar tareas prácticas de seguimiento y reuniones clave para el equipo. Por favor, espera unos segundos...
                </p>
                <button
                  onClick={handleCancelGeneration}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 mx-auto border border-slate-200 dark:border-slate-700"
                >
                  <X className="w-3.5 h-3.5 text-red-500" />
                  <span>Detener Generación Manualmente</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30 rounded-3xl p-6 text-slate-800 dark:text-slate-200 flex items-start gap-4 min-h-[200px] animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-red-800 dark:text-red-400">
                  Fallo al generar el plan de acción sugerido
                </h4>
                <p className="text-[11px] text-red-700/80 dark:text-red-400/80 leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={handleGeneratePlan}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg mt-2 cursor-pointer transition-colors"
                >
                  Reintentar generación
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && savedPlans.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs flex flex-col items-center justify-center gap-4 min-h-[450px]">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ¡Obtén Guías de Implementación con IA!
                </h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                  Selecciona uno de los pasos oficiales de acción en el panel izquierdo, escribe opcionalmente algún reto o contexto local adicional, y haz clic en "Generar Guía de Paso Oficial" para recibir la importancia, métricas y sub-pasos específicos.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && generatedPlan && expandedPlanId === generatedPlan.id && (
            <div className="space-y-6 animate-fadeIn">
              
              {generatedPlan.isFallback && (
                <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-850 dark:text-amber-300">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider">Guía de Contingencia Activada</h4>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Debido a la altísima demanda actual en el servidor de Inteligencia Artificial (Gemini), hemos estructurado una excelente guía práctica pre-configurada para este paso de desarrollo.
                    </p>
                  </div>
                </div>
              )}

              {/* Header Info & Clear Buttons */}
              <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Guía Práctica del Paso Oficial</span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Basado en: <strong>{generatedPlan.selectedStep ? `"${generatedPlan.selectedStep}"` : "Paso de Desarrollo"}</strong>
                  </div>
                </div>
                <button
                  onClick={handleClearPlan}
                  className="text-[10px] font-bold text-slate-500 hover:text-red-500 cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200/60 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cerrar Guía</span>
                </button>
              </div>

              {/* Importancia del Paso Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-white">
                      Importancia del Paso Estratégico
                    </h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-none">
                      Análisis profundo del por qué este paso es vital para la iglesia
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {generatedPlan.importance || "No se ha generado una descripción para esta guía."}
                </p>
              </div>

              {/* Sub-pasos Prácticos de Implementación List */}
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Sub-pasos Prácticos de Implementación
                    </h3>
                  </div>
                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Haz clic en un sub-paso para planificar con IA ✨
                  </span>
                </div>

                {generatedPlan.practicalSteps && generatedPlan.practicalSteps.length > 0 ? (
                  <div className="space-y-4 relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-3 pt-1">
                    {generatedPlan.practicalSteps.map((pStep, idx) => (
                      <div key={idx} className="relative animate-fadeIn" style={{ animationDelay: `${idx * 80}ms` }}>
                        {/* Number bullet node */}
                        <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-indigo-600 text-white border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black shadow-xs">
                          {idx + 1}
                        </div>

                        <div 
                          onClick={() => handleSubstepClick(pStep.title, pStep.description)}
                          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-2 hover:border-indigo-500/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/10 cursor-pointer transition-all duration-250 shadow-xs relative group/item"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-xs font-black text-slate-850 dark:text-white leading-snug group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                              {pStep.title}
                            </h4>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full shrink-0">
                              <span>Planificar con IA</span>
                              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {pStep.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-455 italic pl-1">No se han configurado sub-pasos prácticos para esta guía.</p>
                )}
              </div>

              {/* Informative Help Alert */}
              <div className="text-[10px] text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex items-center gap-2 mt-2">
                <span className="text-emerald-500 font-bold">💾</span>
                <span><strong>Guardado Automático:</strong> Esta guía práctica e informativa se mantendrá en tu navegador. Puedes consultarla o cambiar de pestaña para guiar a tu equipo en la implementación real de este paso estratégico.</span>
              </div>

            </div>
          )}

            </>
          )}

        </div>

      </div>

      {/* Securised Deletion Confirmation Modal */}
      {deleteConfirmPlanId && (() => {
        const planToDelete = savedPlans.find(p => p.id === deleteConfirmPlanId);
        if (!planToDelete) return null;
        const hasAssignedTasks = getPlanHasAssignedTasks(planToDelete);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-850 dark:text-white">
                    Confirmar Eliminación Segura
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nivel de Seguridad de Compas AI
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Meta SMART a eliminar:
                  </span>
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">
                    {planToDelete.smartGoal?.title || planToDelete.selectedStep}
                  </p>
                </div>

                {hasAssignedTasks && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                    🛡️ <strong>Aviso para Facilitador:</strong> Esta meta tiene tareas asignadas en el Kanban. Se eliminará la meta del panel de IA, pero las tareas activas continuarán en el tablero para conservar el histórico de trabajo.
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                  Para confirmar la eliminación permanente de este plan de acción y su meta vinculada, escribe la palabra de seguridad <strong className="text-red-600 dark:text-red-400 font-black">ELIMINAR</strong> a continuación:
                </p>

                <input
                  type="text"
                  value={deleteVerificationInput}
                  onChange={(e) => {
                    setDeleteVerificationInput(e.target.value);
                    if (deleteErrorMessage) setDeleteErrorMessage("");
                  }}
                  placeholder="Escribe ELIMINAR aquí"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold placeholder-slate-450 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-hidden"
                />

                {deleteErrorMessage && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{deleteErrorMessage}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={handleConfirmSecureDelete}
                  disabled={deleteVerificationInput.trim().toUpperCase() !== "ELIMINAR"}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 dark:disabled:bg-slate-800/60 text-white disabled:text-slate-400 dark:disabled:text-slate-650 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Permanentemente</span>
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmPlanId(null);
                    setDeleteVerificationInput("");
                    setDeleteErrorMessage("");
                  }}
                  className="py-2.5 px-4 border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Securised Regeneration Confirmation Modal */}
      {regenerateConfirmPlanId && (() => {
        const planToRegenerate = savedPlans.find(p => p.id === regenerateConfirmPlanId);
        if (!planToRegenerate) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-850 dark:text-white">
                    ¿Regenerar Plan con IA?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Confirmación de seguridad
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Paso a regenerar:
                </span>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-snug">
                  {planToRegenerate.smartGoal?.title || planToRegenerate.selectedStep}
                </p>
              </div>

              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                Esta acción volverá a consultar a la Inteligencia Artificial para diseñar un nuevo plan de acción, incluyendo la importancia, las métricas de éxito y los sub-pasos específicos de este paso. Esto sobrescribirá la información de la guía actual. ¿Deseas continuar?
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    const id = regenerateConfirmPlanId;
                    setRegenerateConfirmPlanId(null);
                    handleRegeneratePlan(id);
                  }}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sí, Regenerar Plan</span>
                </button>
                <button
                  onClick={() => setRegenerateConfirmPlanId(null)}
                  className="py-2.5 px-4 border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {substepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 dark:text-white">
                    Planificación Detallada con IA
                  </h3>
                  <p className="text-[10px] text-slate-455 dark:text-slate-400 font-bold">
                    Sub-paso: {selectedSubstepTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubstepModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {substepLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
                  <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold animate-pulse">
                    Diseñando meta SMART y tareas secuenciales...
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-sm text-center font-medium leading-relaxed">
                    Nuestro facilitador virtual de IA está construyendo un plan secuencial lógico donde cada tarea depende de la anterior para garantizar el éxito local.
                  </p>
                </div>
              ) : substepError ? (
                <div className="py-8 text-center space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-2xl inline-block">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-750 dark:text-slate-350 font-bold">{substepError}</p>
                  <button
                    onClick={() => handleSubstepClick(selectedSubstepTitle, selectedSubstepDesc)}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Reintentar Generación
                  </button>
                </div>
              ) : substepDetail ? (
                <div className="space-y-6">
                  {/* 1. SMART Goal Card */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Meta SMART Específica
                      </h4>
                    </div>
                    <p className="text-xs text-slate-750 dark:text-slate-350 font-black leading-relaxed">
                      "{substepDetail.smartGoal?.statement}"
                    </p>
                    
                    {/* SMART components grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
                      {['S', 'M', 'A', 'R', 'T'].map((letter) => {
                        const names: Record<string, string> = {
                          S: "Específica (S)",
                          M: "Medible (M)",
                          A: "Alcanzable (A)",
                          R: "Relevante (R)",
                          T: "Tiempo (T)"
                        };
                        const desc = substepDetail.smartGoal?.components?.[letter as keyof typeof substepDetail.smartGoal.components] || "";
                        return (
                          <div key={letter} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-3 rounded-xl shadow-2xs">
                            <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mb-0.5">{names[letter]}</div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium">{desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Sequential Tasks */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Tareas Lógicas y Secuenciales (Ruta de Implementación)
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
                      Cadena de dependencias lógicas: Cada acción habilita y desencadena la siguiente fase del plan.
                    </p>
                    
                    <div className="space-y-3 relative pl-4 border-l border-indigo-100 dark:border-indigo-950 ml-3">
                      {substepDetail.tasks?.map((task: any, index: number) => (
                        <div key={index} className="relative group">
                          {/* Line dot */}
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 group-hover:scale-125 transition-transform" />
                          
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl space-y-1.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-slate-850 dark:text-white">{task.title}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                                task.priority === 'Alta' 
                                  ? 'bg-rose-50 text-rose-650 border border-rose-100 dark:bg-rose-950/30 dark:text-rose-450' 
                                  : task.priority === 'Media'
                                    ? 'bg-amber-50 text-amber-650 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-450'
                                    : 'bg-slate-50 text-slate-650 border border-slate-100 dark:bg-slate-950/30 dark:text-slate-450'
                              }`}>
                                Prioridad {task.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{task.description}</p>
                            
                            {/* Dependency note */}
                            <div className="text-[9px] font-black flex items-center gap-1.5 text-indigo-650 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 p-1.5 rounded-lg w-max max-w-full">
                              <span>🔗 Dependencia:</span>
                              <span className="italic truncate">{task.dependency || 'Ninguna (Inicio del ciclo)'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Resources Needed & Metrics (Bento Row) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Resources */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        🎒 Recursos Necesarios
                      </h5>
                      <ul className="space-y-2">
                        {substepDetail.resources?.map((res: string, idx: number) => (
                          <li key={idx} className="text-[11px] text-slate-650 dark:text-slate-400 flex items-start gap-2 font-semibold">
                            <span className="text-indigo-500 shrink-0 select-none">•</span>
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Metrics */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        📊 Métricas de Éxito de la Meta
                      </h5>
                      <ul className="space-y-2">
                        {substepDetail.metrics?.map((met: string, idx: number) => (
                          <li key={idx} className="text-[11px] text-slate-650 dark:text-slate-400 flex items-start gap-2 font-semibold">
                            <span className="text-emerald-500 shrink-0 select-none">•</span>
                            <span>{met}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/20">
              {substepDetail && (
                <button
                  onClick={() => {
                    substepDetail.tasks.forEach((t: any) => {
                      onAddTask({
                        title: `${t.title} (${selectedSubstepTitle})`,
                        description: `${t.description} [Dependencia: ${t.dependency || 'Ninguna'}]`,
                        priority: t.priority,
                        category: selectedArea === 'iglesia' ? 'Iglesia' : selectedArea === 'jovenes' ? 'Jóvenes' : selectedArea === 'familia' ? 'Familia' : 'Comunidad',
                        subtasks: [
                          { id: Math.random().toString(), title: "Verificar recursos requeridos", completed: false },
                          { id: Math.random().toString(), title: "Completar tareas precedentes", completed: false }
                        ],
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      });
                    });
                    triggerNotification(`Se han incorporado ${substepDetail.tasks.length} tareas lógicas al Tablero de Trabajo Kanban.`, "success");
                    setSubstepModalOpen(false);
                  }}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Asignar Tareas al Kanban</span>
                </button>
              )}
              <button
                onClick={() => setSubstepModalOpen(false)}
                className="px-4 py-2.5 border border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
