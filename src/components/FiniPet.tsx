import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Coins, 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Key, 
  Info, 
  Trash2, 
  AlertTriangle,
  Flame,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Transaction } from '../types';

interface FiniPetProps {
  balance: number;
  savings: number;
  setSavings: React.Dispatch<React.SetStateAction<number>>;
  setChildCoins: React.Dispatch<React.SetStateAction<number>>;
  goal: number;
  onFeed: (amount: number) => void;
  petStats: {
    level: number;
    exp: number;
    happiness: number;
    nutrition?: number;
    iq?: number;
    emergencyFund?: number;
  };
  setPetStats: React.Dispatch<React.SetStateAction<any>>;
  lastTxType?: 'ingreso' | 'gasto' | null;
  transactions?: Transaction[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'fini';
  text: string;
  timestamp: string;
}

export const FiniPet: React.FC<FiniPetProps> = ({
  balance,
  savings,
  setSavings,
  setChildCoins,
  goal,
  onFeed,
  petStats,
  setPetStats,
  lastTxType,
  transactions = []
}) => {
  const computedNutrition = petStats.nutrition ?? 80;
  const computedIq = petStats.iq ?? 50;
  const computedEmergencyFund = petStats.emergencyFund ?? 40;
  const computedHappiness = petStats.happiness;

  const evolutionStage = (savings >= 250 && computedIq >= 80 && computedEmergencyFund >= 70) 
    ? 3 
    : (savings < 80 || computedNutrition < 40) 
      ? 1 
      : 2;

  const progressPercent = goal > 0 ? (savings / goal) * 100 : 0;

  const [mood, setMood] = useState<'feliz' | 'preocupado' | 'dormido' | 'enfermo' | 'graduado' | 'trabajando'>('feliz');
  const [bubbleText, setBubbleText] = useState('¡Hola! Soy Fini, tu compañero de ahorros de Cayma. ¡Cuidemos juntos tu dinero! 🌱');
  const [actionClass, setActionClass] = useState('');
  const [feedAmount, setFeedAmount] = useState('10');
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Estados de Cuidado e Interactividad (Tamagotchi) ---
  const [showTriviaModal, setShowTriviaModal] = useState(false);
  const [currentTrivia, setCurrentTrivia] = useState<any>(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);

  const [isWorking, setIsWorking] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [workCountdown, setWorkCountdown] = useState(0);

  const [showSyringe, setShowSyringe] = useState(false);

  const TRIVIA_POOL = [
    {
      question: "¿Qué es un 'Gasto Hormiga'?",
      options: [
        { text: "Un gasto muy grande para comprar comida de hormigas.", correct: false },
        { text: "Pequeñas compras diarias que parecen insignificantes pero suman mucho.", correct: true },
        { text: "Dinero que se pierde en la calle por accidente.", correct: false }
      ],
      explanation: "¡Correcto! Los gastos hormiga son consumos cotidianos de bajo costo (como snacks, café o suscripciones no usadas) que, acumulados, dañan seriamente tu presupuesto mensual."
    },
    {
      question: "¿Qué nos dice la regla presupuestaria 50/30/20?",
      options: [
        { text: "50% para Deseos, 30% para Necesidades y 20% para Ahorro.", correct: false },
        { text: "50% para Ahorro, 30% para Necesidades y 20% para Gustos.", correct: false },
        { text: "50% para Necesidades básicas, 30% para Deseos y 20% para Ahorro/Futuro.", correct: true }
      ],
      explanation: "¡Correcto! Esta regla nos ayuda a equilibrar nuestras finanzas dividiendo los ingresos mensuales en necesidades básicas, gustos o caprichos, y ahorros para el futuro."
    },
    {
      question: "¿Qué es el 'Fondo de Emergencia'?",
      options: [
        { text: "Dinero reservado exclusivamente para salir de fiesta el fin de semana.", correct: false },
        { text: "Un ahorro específico para cubrir imprevistos médicos, reparaciones o urgencias sin endeudarse.", correct: true },
        { text: "Dinero prestado por el banco que debes pagar con altos intereses.", correct: false }
      ],
      explanation: "¡Exacto! El fondo de emergencia te da tranquilidad y evita que caigas en deudas costosas cuando ocurre un imprevisto."
    },
    {
      question: "¿Qué es el 'Interés Compuesto'?",
      options: [
        { text: "Intereses que se calculan sobre el capital inicial más los intereses ya acumulados.", correct: true },
        { text: "Un cobro que te hace el banco por no pagar a tiempo tus deudas.", correct: false },
        { text: "El interés que pagas cuando compras ropa en cuotas mensuales.", correct: false }
      ],
      explanation: "¡Así es! Albert Einstein lo llamó la octava maravilla del mundo: tus intereses generan nuevos intereses, haciendo crecer tu alcancía exponencialmente."
    },
    {
      question: "¿Qué es el 'Costo de Oportunidad'?",
      options: [
        { text: "El precio con descuento que consigues en una tienda outlet.", correct: false },
        { text: "La alternativa a la que renuncias cuando tomas una decisión económica.", correct: true },
        { text: "El dinero que te regala un familiar en tu cumpleaños.", correct: false }
      ],
      explanation: "¡Excelente! Al elegir comprar un videojuego, el costo de oportunidad es lo que podrías haber hecho con ese dinero, como invertir en un curso o guardarlo para tu fondo de estudios."
    }
  ];

  const MINI_TASKS = [
    { name: "Optimizar presupuesto familiar", duration: 8, payout: 25, icon: "📊" },
    { name: "Cazar y registrar gastos hormiga", duration: 10, payout: 35, icon: "🐜" },
    { name: "Inversión Pasiva Simulada", duration: 12, payout: 50, icon: "📈" }
  ];

  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('finanzapp_chat_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-init-1',
        sender: 'fini',
        text: '¡Hola! Soy Fini, tu tutor de finanzas personales. Estoy aquí para analizar tus movimientos en FinanzApp, ayudarte a combatir los gastos hormiga y armar una estrategia sólida para alcanzar tu meta de ahorro. ¿Qué consulta técnica o presupuesto deseas analizar hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('finanzapp_user_api_key') || '';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('finanzapp_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('finanzapp_user_api_key', userApiKey);
  }, [userApiKey]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Determine Fini's active mood and initial trigger (Interactividad Cruzada)
  useEffect(() => {
    const checkMoodAndInitiate = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // If Fini is working or graduated, let the animation finish
      if (isWorking) {
        setMood('trabajando');
        return;
      }

      // Night Sleeping State (9 PM - 6 AM)
      if (currentHour >= 21 || currentHour < 6) {
        setMood('dormido');
        setBubbleText('Zzz... contando moneditas de oro... Guarda tu energía y tus soles para mañana... 🌙');
        return;
      }

      // Sick State
      if (computedNutrition < 40 || computedHappiness < 40) {
        setMood('enfermo');
        setBubbleText('Me duele la pancita y me siento muy desanimado... 🤢 Necesitamos medicina de la Caja de Emergencia (S/. 15) o comer algo saludable.');
        return;
      }

      // Find the latest transaction
      const latestTx = transactions && transactions.length > 0 ? transactions[0] : null;
      
      if (latestTx && latestTx.type === 'gasto') {
        // If the last registered transaction is a expense, Fini turns "Preocupado"
        setMood('preocupado');
        setBubbleText(`¡Oh no! Veo que registraste un gasto de S/. ${latestTx.amount.toFixed(2)} en "${latestTx.description}". 🥶 ¡Hablemos en el chat de cómo afecta esto a nuestra meta!`);
        
        // Push a proactive warning to chat history if it wasn't already generated for this transaction
        const lastMsgText = chatHistory[chatHistory.length - 1]?.text || '';
        const triggerKeyword = `S/. ${latestTx.amount.toFixed(2)} en "${latestTx.description}"`;
        
        if (!lastMsgText.includes(triggerKeyword)) {
          const proactiveMessage: ChatMessage = {
            id: 'proactive-' + Date.now(),
            sender: 'fini',
            text: `⚠️ **¡ALERTA DE CONTROL DE GASTOS!** ⚠️\n\n**Diagnóstico del Estado Actual**: Acabas de registrar un gasto de **S/. ${latestTx.amount.toFixed(2)}** por el concepto de **"${latestTx.description}"**. Tu saldo restante se sitúa en S/. ${balance.toFixed(2)}, con un ahorro acumulado de S/. ${savings.toFixed(2)} frente a la meta de S/. ${goal.toFixed(2)}.\n\n**Consejo Económico de Alta Fidelidad**: Cada egreso no planificado altera tu flujo de caja neto. En finanzas llamamos a esto "costo de oportunidad": el dinero destinado a este gasto es dinero que deja de acumular rendimientos en tu alcancía de ahorros.\n\n**Acción Recomendada**: Evalúa si este gasto fue una *necesidad vital* o un *deseo circunstancial* (gasto hormiga). Para compensar este egreso, te sugiero depositar S/. 5 o S/. 10 en mi alcancía hoy mismo usando el panel inferior para reequilibrar nuestras finanzas. ¡Hablemos al respecto!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatHistory(prev => [...prev, proactiveMessage]);
        }
      } else {
        const progressPercent = goal > 0 ? (savings / goal) * 100 : 0;
        if (progressPercent < 20) {
          setMood('preocupado');
          setBubbleText('¡Tengo hambre de ahorros! 🥺 ¿Podrías transferir algo a la alcancía? El progreso es menor al 20%.');
        } else {
          setMood('feliz');
          setBubbleText('¡Qué gran día para ahorrar! Siento que mis hojitas brillan de felicidad. Sigue así. 🌱✨');
        }
      }
    };

    checkMoodAndInitiate();
  }, [savings, goal, lastTxType, transactions, computedNutrition, computedHappiness, isWorking]);

  const speakQuote = () => {
    const quotes = [
      "¡Siento que mis hojitas crecen con cada sol guardado! 🌿",
      "¡S/. S/. S/. ¡Me encantan los ahorros saludables! 🥳",
      "¡Estás cumpliendo tus metas! Eres mi héroe financiero. 🏆",
      "¡Qué rico es ver crecer nuestra cuenta! Sigamos así. ✨",
      "¿Sabías que ahorrar un sol hoy es sembrar un árbol de abundancia mañana? 🌳"
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setBubbleText(quotes[randomIndex]);
  };

  // Petting action
  const handlePet = () => {
    setActionClass('animate-bounce');
    setTimeout(() => setActionClass(''), 1000);

    setPetStats(prev => {
      const newExp = prev.exp + 15;
      const leveledUp = newExp >= 100;
      return {
        level: leveledUp ? prev.level + 1 : prev.level,
        exp: leveledUp ? newExp - 100 : newExp,
        happiness: Math.min(100, prev.happiness + 10)
      };
    });

    if (mood !== 'dormido') {
      speakQuote();
    } else {
      setBubbleText('Mmm... me agrada que me acaricies... pero tengo sueñito... Zzz... 💤');
    }
  };

  // Feeding action (Direct Savings)
  const handleFeed = () => {
    const amt = parseFloat(feedAmount);
    if (isNaN(amt) || amt <= 0) {
      setBubbleText('¡Por favor, introduce un monto de ahorro válido! 🍎');
      return;
    }
    if (balance < amt) {
      setBubbleText('¡No tienes suficiente saldo disponible en tu cuenta para alimentar la alcancía! 🪙');
      return;
    }

    onFeed(amt);
    setActionClass('animate-pulse');
    setShowConfetti(true);
    setTimeout(() => {
      setActionClass('');
      setShowConfetti(false);
    }, 1500);

    setPetStats(prev => {
      const newExp = prev.exp + 25;
      const leveledUp = newExp >= 100;
      return {
        ...prev,
        level: leveledUp ? prev.level + 1 : prev.level,
        exp: leveledUp ? newExp - 100 : newExp,
        happiness: Math.min(100, (prev.happiness ?? 85) + 20),
        nutrition: Math.min(100, (prev.nutrition ?? 80) + 15)
      };
    });

    // Add saving to chat history as a system/user event
    const savingMessage: ChatMessage = {
      id: 'saving-' + Date.now(),
      sender: 'fini',
      text: `🎉 **¡Depósito Exitoso!** Alimentaste mi alcancía con **S/. ${amt.toFixed(2)}**. ¡Muchas gracias! Con esto, tus ahorros totales ascienden a **S/. ${(savings + amt).toFixed(2)}**, representando un progreso del **${(((savings + amt) / goal) * 100).toFixed(1)}%** hacia tu meta de S/. ${goal.toFixed(2)}. ¡Tu constancia nos protege contra los gastos hormiga!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, savingMessage]);
    setBubbleText(`¡Mmm, qué delicioso! S/. ${amt} depositados a mi alcancía de ahorros. ¡Siento que subimos de nivel! 🌱✨`);
  };

  // --- Acciones de Cuidado del Tamagotchi ---

  // 1. Alimentar con Comida Saludable (Rendimiento de Ahorros)
  const handleFeedHealthy = () => {
    if (savings < 10) {
      setBubbleText('¡Oh no! Necesitas tener al menos S/. 10 ahorrados en tu alcancía para comprar comida saludable de alto rendimiento. 🥗');
      return;
    }
    setSavings(prev => prev - 10);
    setActionClass('animate-pulse');
    setShowConfetti(true);
    setTimeout(() => {
      setActionClass('');
      setShowConfetti(false);
    }, 1500);

    setPetStats(prev => {
      const newExp = prev.exp + 15;
      const leveledUp = newExp >= 100;
      return {
        ...prev,
        level: leveledUp ? prev.level + 1 : prev.level,
        exp: leveledUp ? newExp - 100 : newExp,
        nutrition: Math.min(100, (prev.nutrition ?? 80) + 30),
        happiness: Math.min(100, prev.happiness + 15),
        emergencyFund: Math.min(100, (prev.emergencyFund ?? 40) + 10)
      };
    });

    setBubbleText('¡Mmm! ¡Qué delicia de ensalada! Siento que mis hojitas brillan con energía y salud financiera. 🥗✨');
  };

  // 1b. Alimentar con Snack Chatarra (Representa Gasto Hormiga)
  const handleFeedJunk = () => {
    if (balance < 5) {
      setBubbleText('¡No tienes ni S/. 5 sueltos en tu saldo para comprar un snack chatarra! 🪙');
      return;
    }
    // Gasto hormiga: bota dinero
    setSavings(prev => Math.max(0, prev - 5));
    setActionClass('animate-shake');
    setTimeout(() => setActionClass(''), 1000);

    setPetStats(prev => {
      return {
        ...prev,
        nutrition: Math.max(0, (prev.nutrition ?? 80) - 15),
        happiness: Math.min(100, prev.happiness + 35),
        exp: Math.max(0, prev.exp - 10)
      };
    });

    setBubbleText('¡Yuy! ¡Qué rico pastel de chocolate! Me dio mucha felicidad rápida... pero me duele un poquito la pancita y perdimos experiencia por gasto hormiga. 🍔🤢');
  };

  // 2. Entrenar / Estudiar (IQ Financiero)
  const handleOpenTrivia = () => {
    const randomTrivia = TRIVIA_POOL[Math.floor(Math.random() * TRIVIA_POOL.length)];
    setCurrentTrivia(randomTrivia);
    setTriviaAnswered(false);
    setSelectedTriviaOption(null);
    setShowTriviaModal(true);
  };

  const handleAnswerTrivia = (optionIdx: number) => {
    setSelectedTriviaOption(optionIdx);
    setTriviaAnswered(true);
    const correct = currentTrivia.options[optionIdx].correct;

    if (correct) {
      setPetStats(prev => {
        const newExp = prev.exp + 25;
        const leveledUp = newExp >= 100;
        return {
          ...prev,
          level: leveledUp ? prev.level + 1 : prev.level,
          exp: leveledUp ? newExp - 100 : newExp,
          iq: Math.min(100, (prev.iq ?? 50) + 20),
          happiness: Math.min(100, prev.happiness + 15)
        };
      });
      setMood('graduado');
      setBubbleText('¡EXCELENTE! ¡Respondiste correctamente! Mi IQ financiero ha subido un 20%. ¡Mira mi gorrito de graduado! 🎓🥳');
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setMood('feliz');
      }, 4000);
    } else {
      setPetStats(prev => ({
        ...prev,
        iq: Math.min(100, (prev.iq ?? 50) + 5) // learns a little anyway
      }));
      setBubbleText('¡Oh! Esa no era la respuesta correcta, pero no te preocupes, ¡hemos aprendido algo nuevo hoy! 🧠');
    }
  };

  // 3. Poner a Trabajar / Invertir (Ingreso Pasivo)
  const handleStartWork = (task: any) => {
    if (isWorking) return;
    setIsWorking(true);
    setActiveTask(task);
    setWorkCountdown(task.duration);
    setMood('trabajando');
    setBubbleText(`¡Me pongo manos a la obra! Tarea: "${task.name}". Regresaré en unos segundos con monedas virtuales. 💼🔨`);
  };

  // Timer effect for work countdown
  useEffect(() => {
    let timer: any;
    if (isWorking && workCountdown > 0) {
      timer = setTimeout(() => {
        setWorkCountdown(prev => prev - 1);
      }, 1000);
    } else if (isWorking && workCountdown === 0) {
      setIsWorking(false);
      setMood('feliz');
      const payout = activeTask?.payout ?? 20;
      setChildCoins(prev => prev + payout);
      setPetStats(prev => {
        const newExp = prev.exp + 15;
        const leveledUp = newExp >= 100;
        return {
          ...prev,
          level: leveledUp ? prev.level + 1 : prev.level,
          exp: leveledUp ? newExp - 100 : newExp,
          iq: Math.min(100, (prev.iq ?? 50) + 10)
        };
      });
      setBubbleText(`¡He vuelto! Logré completar la tarea de inversión exitosamente. Traje de vuelta S/. ${payout} monedas virtuales para nuestro Club. 🪙🎉`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [isWorking, workCountdown]);

  // 4. Curar / Fondo de Salud (Usa fondo de emergencia/ahorros)
  const handleHealPet = () => {
    if (savings < 15) {
      setBubbleText('¡Oh no! Necesitamos al menos S/. 15 guardados en tu alcancía/fondo de emergencia para costear mi medicina y curarme. 🩺');
      return;
    }
    setSavings(prev => prev - 15);
    setShowSyringe(true);
    setActionClass('animate-pulse');
    setTimeout(() => {
      setShowSyringe(false);
      setActionClass('');
    }, 2000);

    setPetStats(prev => {
      return {
        ...prev,
        nutrition: 100,
        happiness: 100,
        emergencyFund: Math.min(100, (prev.emergencyFund ?? 40) + 25)
      };
    });
    setMood('feliz');
    setBubbleText('💉 ¡Ssshh... piquetito de salud! ¡Wao, la medicina con el Fondo de Emergencia funcionó de maravilla! Me siento al 100% de salud y felicidad. 💖🩺');
  };

  // Fallback Local NLP Hybrid Engine (3-Part Responses)
  const generateLocalNlpResponse = (userMsg: string): string => {
    const msg = userMsg.toLowerCase().trim();
    const progress = goal > 0 ? (savings / goal) * 100 : 0;
    const latestTx = transactions && transactions.length > 0 ? transactions[0] : null;

    // Strict Financial Redirect Filter
    const financeKeywords = [
      'ahorro', 'gasto', 'presupuesto', 'comprar', 'dinero', 'moneda', 'soles', 'billeton',
      'meta', 'finanzas', 'banco', 'invertir', 'interes', 'costo', 'tiendita', 'taller', 'charla',
      'hormiga', 'ingreso', 'egreso', 'saldo', 'cuenta', 'tarjeta', 'deuda', 'propina', 'fini', 'hola', 'ayuda'
    ];

    const isFinanceTopic = financeKeywords.some(keyword => msg.includes(keyword));

    if (!isFinanceTopic) {
      return `🧭 **Foco Financiero Estricto**:

**Explicación sencilla con analogía**: Imagina que FinanzApp es un barco diseñado para navegar hacia la "Isla del Ahorro". Cuando conversamos de temas que no son financieros, es como si soltáramos el timón para ponernos a pescar nubes: ¡el barco se detiene o se desvía del rumbo!

**Ejemplo práctico**: Si me hablas de videojuegos o chistes en vez de presupuesto, es como comprar una espada de juguete en lugar de guardar para una bicicleta real. ¡No avanzamos a la meta!

**Consejo de Fini**: Pregúntame sobre cómo vencer los gastos hormiga, cómo crear un presupuesto equilibrado o de qué manera el interés compuesto duplicará tus propinas en mi alcancía.`;
    }

    // --- Keyword Based Finance Fallbacks ---
    if (msg.includes('ahorro') || msg.includes('ahorrar')) {
      return `🌱 **Estrategias de Ahorro Inteligente**:

**Explicación sencilla con analogía**: Ahorrar es como sembrar una pequeña semilla en una maceta. Al principio no se ve nada, pero si la riegas con moneditas constantes todas las semanas, ¡crecerá un árbol fuerte que te dará frutos y sombra en el futuro!

**Ejemplo práctico**: Con tu saldo de S/. ${balance.toFixed(2)} y tus ahorros acumulados de S/. ${savings.toFixed(2)} (${progress.toFixed(1)}% de la meta de S/. ${goal.toFixed(2)}), si decides guardar S/. 5 semanales de tus propinas en lugar de gastarlos en gaseosas, en un año habrás acumulado S/. 260 extra sin esfuerzo.

**Consejo de Fini**: No ahorres "lo que te sobra" al final del día. Apenas recibas tu dinero, págate a ti mismo primero apartando el 10% en mi alcancía mediante el botón "Depositar" de abajo.`;
    }

    if (msg.includes('gasto') || msg.includes('comprar') || msg.includes('hormiga')) {
      const gastoContext = latestTx && latestTx.type === 'gasto' 
        ? `hiciste un gasto de S/. ${latestTx.amount.toFixed(2)} en "${latestTx.description}"`
        : `tienes S/. ${balance.toFixed(2)} de saldo propenso a gastos`;

      return `🐜 **Venciendo a los Gastos Hormiga**:

**Explicación sencilla con analogía**: Los "gastos hormiga" son como tener una pequeña gotera en un balde de agua limpia. Cada gotita parece insignificante y no hace ruido, pero si dejas el balde toda la noche, ¡al día siguiente amanecerá completamente vacío!

**Ejemplo práctico**: En tu historial veo que ${gastoContext}. Si compras golosinas, caramelos o skins de S/. 3 todos los días camino a casa, al mes habrás gastado S/. 90. ¡Ese dinero podría haber ido directo a comprar tu nueva bicicleta!

**Consejo de Fini**: Antes de realizar cualquier compra, apliquemos la prueba de las 48 horas: espera dos días antes de pagar. Si después de ese tiempo aún lo necesitas, es una necesidad; si te olvidaste, ¡era un gasto hormiga!`;
    }

    if (msg.includes('meta') || msg.includes('objetivo')) {
      return `👑 **Cómo Lograr tus Metas Financieras**:

**Explicación sencilla con analogía**: Lograr una meta financiera es como entrenar para correr una gran maratón. No puedes correr los 10 kilómetros en el primer día; tienes que dar pequeños pasos diarios de forma constante y disciplinada.

**Ejemplo práctico**: Tu meta en FinanzApp es de S/. ${goal.toFixed(2)} y te restan S/. ${(goal - savings).toFixed(2)} por conseguir. Si ahorras de forma constante S/. 15 cada semana, ¡conquistarás tu meta entera en aproximadamente ${Math.ceil((goal - savings) / 15)} semanas!

**Consejo de Fini**: Ponle un nombre motivador a tu meta (como "Mi primera tablet" o "Estudios futuros") en el tablero de finanzas y mírala todos los días. ¡Visualizar el premio hace que ahorrar sea súper divertido!`;
    }

    // Default friendly financial response
    return `🦊 **La Conciencia Financiera de Fini**:

**Explicación sencilla con analogía**: El dinero es como la energía eléctrica: bien canalizado puede encender bombillas y hacer funcionar grandes motores, pero si se deja libre o se gasta sin control, se disipa y desaparece sin dejar rastro.

**Ejemplo práctico**: Actualmente tienes S/. ${balance.toFixed(2)} disponibles para decidir su destino. Si dejas ese saldo libre en tu billetera, la tentación de gastarlo en impulsos es muy alta. Si lo mueves a tu alcancía, se convierte en energía acumulada.

**Consejo de Fini**: Pon a prueba tus habilidades en los simuladores de 'FinanPlay' para ganar más monedas 🪙 de experiencia. ¡La educación financiera es el mejor superpoder que puedes tener!`;
  };

  // Handle Send Chat
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMsg = chatInput.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add User Message to history
    const userMessageObj: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userMsg,
      timestamp: timestamp
    };

    setChatHistory(prev => [...prev, userMessageObj]);
    setChatInput('');
    setIsLoading(true);

    // Call Gemini API server-side
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.slice(-10), // Pass recent history
          userApiKey: userApiKey, // Pass client key if pasted
          context: {
            balance,
            savings,
            goal,
            transactions: transactions.slice(0, 10)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Server response failed');
      }

      const data = await response.json();
      
      let replyText = '';
      if (data.success && data.text) {
        replyText = data.text;
      } else {
        // Fallback to local NLP engine if API has error/disabled
        console.warn("Using local hybrid NLP fallback due to server API setup");
        replyText = generateLocalNlpResponse(userMsg);
      }

      const finiMessageObj: ChatMessage = {
        id: 'fini-' + Date.now(),
        sender: 'fini',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, finiMessageObj]);

    } catch (err) {
      console.error("Chat communication error:", err);
      // Local fallback on absolute network failure
      const fallbackText = generateLocalNlpResponse(userMsg);
      const finiMessageObj: ChatMessage = {
        id: 'fini-' + Date.now(),
        sender: 'fini',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, finiMessageObj]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    if (window.confirm("¿Seguro que deseas reiniciar el historial de conversación con Fini?")) {
      setChatHistory([
        {
          id: 'msg-init-1',
          sender: 'fini',
          text: '¡Hola! Soy Fini, tu tutor de finanzas personales. Estoy aquí para analizar tus movimientos en FinanzApp, ayudarte a combatir los gastos hormiga y armar una estrategia sólida para alcanzar tu meta de ahorro. ¿Qué consulta técnica o presupuesto deseas analizar hoy?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div id="fini-mascota-seccion" className="space-y-6">
      
      {/* 1. VISUALIZACIÓN INTERACTIVA DE FINI */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2.5rem] p-5 shadow-xl relative overflow-hidden flex flex-col items-center">
        {/* Ambient background glow according to active mood */}
        <div className={`absolute top-0 w-full h-24 blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
          mood === 'feliz' ? 'bg-emerald-400' : mood === 'preocupado' ? 'bg-amber-400' : mood === 'enfermo' ? 'bg-rose-400' : 'bg-indigo-400'
        }`} />

        {/* Level & Stats */}
        <div className="w-full flex justify-between items-center z-10 mb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fini Nivel {petStats.level}</span>
            </div>
            <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wide">
              {evolutionStage === 1 ? "🌱 Semilla de Ahorro" : evolutionStage === 2 ? "🌿 Brote Alegre" : "👑 Guardián Dorado"}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-[10px] uppercase bg-rose-500/10 px-2.5 py-1 rounded-full h-fit">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-rose-500" />
            <span>{petStats.happiness}% Felicidad</span>
          </div>
        </div>

        {/* Experience Progression Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4 z-10 border border-slate-200/40 dark:border-slate-700/40">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500" 
            style={{ width: `${petStats.exp}%` }}
          />
        </div>

        {/* Tamagotchi Status Bars Grid */}
        <div className="w-full grid grid-cols-2 gap-3 z-10 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* Nutrition */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">🍏 Nutrición</span>
              <span className={computedNutrition < 40 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-emerald-500'}>{computedNutrition}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${computedNutrition < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                style={{ width: `${computedNutrition}%` }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">😊 Felicidad</span>
              <span className="text-pink-500">{computedHappiness}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-pink-500 h-full transition-all duration-500" 
                style={{ width: `${computedHappiness}%` }}
              />
            </div>
          </div>

          {/* IQ */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">🧠 IQ Financiero</span>
              <span className="text-violet-500">{computedIq}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-violet-500 h-full transition-all duration-500" 
                style={{ width: `${computedIq}%` }}
              />
            </div>
          </div>

          {/* Emergency Fund */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">🛡️ Fondo Emergencia</span>
              <span className="text-amber-500">{computedEmergencyFund}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${computedEmergencyFund}%` }}
              />
            </div>
          </div>
        </div>

        {/* Care Actions Buttons Grid */}
        <div className="w-full grid grid-cols-4 gap-2 z-10 mb-4">
          {/* Feed choices trigger button */}
          <div className="relative group">
            <button 
              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center gap-1 cursor-pointer transition-all"
              title="Alimentar a Fini"
            >
              <span className="text-base">🍎</span>
              <span>Alimentar</span>
            </button>
            {/* Popover choice on hover/click */}
            <div className="absolute bottom-full left-0 mb-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 hidden group-hover:flex flex-col gap-1.5 z-30 transition-all">
              <button 
                onClick={handleFeedHealthy}
                className="w-full p-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[9px] flex flex-col cursor-pointer"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200">🥗 Comida Saludable</span>
                <span className="text-slate-400">Cuesta S/. 10 (Ahorro) • +30 Nut, +15 Fel</span>
              </button>
              <button 
                onClick={handleFeedJunk}
                className="w-full p-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[9px] flex flex-col cursor-pointer"
              >
                <span className="font-bold text-rose-500">🍔 Snack Chatarra</span>
                <span className="text-slate-400">Cuesta S/. 5 • +35 Fel, -15 Nut (Hormiga)</span>
              </button>
            </div>
          </div>

          {/* Study quiz button */}
          <button 
            onClick={handleOpenTrivia}
            className="py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:border-violet-500/40 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center gap-1 cursor-pointer transition-all"
            title="Entrenar con Trivias"
          >
            <span className="text-base">📚</span>
            <span>Entrenar</span>
          </button>

          {/* Work task trigger */}
          <div className="relative group">
            <button 
              disabled={isWorking}
              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-45"
              title="Poner a trabajar"
            >
              <span className="text-base">💼</span>
              <span>Invertir</span>
            </button>
            {!isWorking && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 hidden group-hover:flex flex-col gap-1.5 z-30">
                {MINI_TASKS.map((task, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleStartWork(task)}
                    className="w-full p-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[9px] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-xs">{task.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{task.name}</span>
                      <span className="text-slate-400">Regresa en {task.duration}s • Gana {task.payout} monedas</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heal syringe trigger */}
          <button 
            onClick={handleHealPet}
            className="py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-[9px] font-bold uppercase flex flex-col items-center gap-1 cursor-pointer transition-all"
            title="Curar a Fini"
          >
            <span className="text-base">🩺</span>
            <span>Curar</span>
          </button>
        </div>

        {/* Pet Dialogue Bubble */}
        <div className="relative w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3.5 mb-4 text-[11px] text-slate-600 dark:text-slate-300 shadow-sm text-center font-semibold leading-relaxed">
          <p>{bubbleText}</p>
          {isWorking && (
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${(workCountdown / (activeTask?.duration ?? 10)) * 100}%` }}
              />
            </div>
          )}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-200/60 dark:border-slate-800 rotate-45" />
        </div>

        {/* Interactive SVG / Click triggers petting */}
        <div 
          onClick={handlePet}
          className={`relative w-36 h-36 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 select-none ${actionClass}`}
        >
          {showConfetti && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <span className="absolute animate-bounce text-2xl">🪙</span>
              <span className="absolute animate-ping text-xl translate-x-8 -translate-y-8">✨</span>
              <span className="absolute animate-ping text-xl -translate-x-8 translate-y-8">✨</span>
            </div>
          )}

          {showSyringe && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className="text-4xl animate-bounce">💉</span>
              <span className="absolute text-xl text-rose-500 animate-ping">💖</span>
            </div>
          )}

          {/* SVG Animado de Fini */}
          <svg className="w-full h-full" viewBox="0 0 120 120" fill="none">
            {/* Shadow */}
            <ellipse cx="60" cy="100" rx="32" ry="5" fill="#000" opacity="0.1" />

            {/* Aura */}
            <circle cx="60" cy="60" r="42" fill={
              evolutionStage === 3 ? '#F59E0B' : (mood === 'feliz' ? '#10B981' : mood === 'preocupado' ? '#F59E0B' : mood === 'enfermo' ? '#EF4444' : '#6366F1')
            } opacity="0.08" className="animate-pulse" />

            {/* EVOLUTIONARY SHAPES */}
            {evolutionStage === 1 && (
              <>
                {/* Stage 1: Semilla / Huevo de Oro */}
                <ellipse 
                  cx="60" 
                  cy="68" 
                  rx="24" 
                  ry="30" 
                  fill="url(#fSeed)" 
                  stroke={mood === 'enfermo' ? '#EF4444' : '#10B981'}
                  strokeWidth="3" 
                />
                
                {/* Cracking patterns */}
                <path d="M52,60 L57,66 L62,59 L67,64" stroke={mood === 'enfermo' ? '#991B1B' : '#047857'} strokeWidth="1.5" strokeLinecap="round" fill="none" />

                {/* Tiny little sprout cracking on top */}
                <path d="M60,38 Q64,30 70,32" stroke={mood === 'enfermo' ? '#EF4444' : '#10B981'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M60,38 Q56,31 50,33" stroke={mood === 'enfermo' ? '#EF4444' : '#10B981'} strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Tiny sleeping/sparkling eyes */}
                {mood === 'dormido' ? (
                  <>
                    <path d="M48,68 Q52,71 56,68" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d="M64,68 Q68,71 72,68" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  </>
                ) : mood === 'enfermo' ? (
                  <>
                    <path d="M48,69 L54,64 M48,64 L54,69" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M64,69 L70,64 M64,64 L70,69" stroke="#991B1B" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M55,75 Q60,70 65,75" stroke="#991B1B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </>
                ) : (
                  <>
                    <circle cx="51" cy="66" r="2.2" fill="#047857" />
                    <circle cx="69" cy="66" r="2.2" fill="#047857" />
                    <path d="M57,75 Q60,78 63,75" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </>
                )}
              </>
            )}

            {evolutionStage === 2 && (
              <>
                {/* Stage 2: Brote Alegre (Droplet shape) */}
                <path
                  d="M60,22 C32,51 32,94 60,94 C88,94 88,51 60,22 Z"
                  fill={
                    mood === 'feliz' 
                      ? 'url(#fGreen)' 
                      : mood === 'preocupado' 
                        ? 'url(#fOrange)' 
                        : mood === 'enfermo'
                          ? '#FCA5A5'
                          : 'url(#fBlue)'
                  }
                  stroke={
                    mood === 'feliz' ? '#059669' : mood === 'preocupado' ? '#D97706' : mood === 'enfermo' ? '#EF4444' : '#4F46E5'
                  }
                  strokeWidth="3"
                />

                {/* Top Leaf */}
                <path
                  d="M60,22 C60,7 51,2 51,2 C51,2 64,7 60,22 Z"
                  fill="#10B981"
                  stroke="#047857"
                  strokeWidth="1.2"
                />

                {/* Graduation cap */}
                {(mood === 'graduado' || computedIq >= 70) && (
                  <g transform="translate(42, 6)">
                    <polygon points="18,5 34,11 18,17 2,11" fill="#1E293B" stroke="#000" strokeWidth="1" />
                    <rect x="13" y="11" width="10" height="6" fill="#1E293B" />
                    <path d="M30,11 L32,22" stroke="#F59E0B" strokeWidth="1.2" />
                    <circle cx="32" cy="22" r="1.5" fill="#F59E0B" />
                  </g>
                )}

                {/* Face details */}
                {(mood === 'feliz' || mood === 'graduado' || mood === 'trabajando') && (
                  <>
                    <text x="44" y="61" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">✨</text>
                    <text x="76" y="61" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">✨</text>
                    <path d="M52,70 Q60,78 68,70" stroke="#047857" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <circle cx="41" cy="67" r="3.5" fill="#F87171" opacity="0.5" />
                    <circle cx="79" cy="67" r="3.5" fill="#F87171" opacity="0.5" />
                  </>
                )}

                {mood === 'preocupado' && (
                  <>
                    <path d="M41,55 Q45,53 48,56" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M72,55 Q75,53 78,56" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <circle cx="44" cy="61" r="2" fill="#92400E" />
                    <circle cx="76" cy="61" r="2" fill="#92400E" />
                    <path d="M54,71 Q60,67 66,71" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d="M28,48 L23,46 M92,48 L97,46" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                  </>
                )}

                {mood === 'enfermo' && (
                  <>
                    <path d="M41,57 L47,51 M41,51 L47,57" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                    <path d="M73,57 L79,51 M73,51 L79,57" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                    <path d="M52,72 Q60,65 68,72" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
                    {/* Bandage */}
                    <rect x="36" y="38" width="48" height="8" rx="2" fill="#FFF" stroke="#64748B" strokeWidth="1" opacity="0.9" />
                  </>
                )}

                {mood === 'dormido' && (
                  <>
                    <path d="M40,59 Q45,63 50,59" stroke="#312E81" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <path d="M70,59 Q75,63 80,59" stroke="#312E81" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <circle cx="60" cy="71" r="2" fill="#312E81" />
                    <text x="88" y="34" fontSize="8" fontWeight="bold" fill="#6366F1">Zzz</text>
                  </>
                )}
              </>
            )}

            {evolutionStage === 3 && (
              <>
                {/* Stage 3: Guardián Dorado */}
                {/* Little golden wings */}
                <path d="M36,65 C12,50 18,85 34,75 Z" fill="url(#fGold)" opacity="0.85" stroke="#D97706" strokeWidth="1.2" />
                <path d="M84,65 C108,50 102,85 86,75 Z" fill="url(#fGold)" opacity="0.85" stroke="#D97706" strokeWidth="1.2" />

                {/* Main Body */}
                <path
                  d="M60,22 C32,51 32,94 60,94 C88,94 88,51 60,22 Z"
                  fill={mood === 'enfermo' ? '#FCA5A5' : 'url(#fGold)'}
                  stroke={mood === 'enfermo' ? '#EF4444' : '#D97706'}
                  strokeWidth="3.5"
                />

                {/* Golden Crown on top */}
                <path 
                  d="M48,22 L52,10 L60,18 L68,10 L72,22" 
                  fill="url(#fGold)" 
                  stroke="#B45309" 
                  strokeWidth="1.8" 
                  strokeLinejoin="round" 
                />
                <circle cx="60" cy="11" r="2" fill="#F59E0B" />
                <circle cx="52" cy="7" r="1.5" fill="#EF4444" />
                <circle cx="68" cy="7" r="1.5" fill="#EF4444" />

                {/* Graduation cap instead of crown if graduated */}
                {(mood === 'graduado' || computedIq >= 70) && (
                  <g transform="translate(42, -2)">
                    <polygon points="18,5 34,11 18,17 2,11" fill="#1E293B" stroke="#000" strokeWidth="1" />
                    <rect x="13" y="11" width="10" height="6" fill="#1E293B" />
                    <path d="M30,11 L32,22" stroke="#F59E0B" strokeWidth="1.2" />
                  </g>
                )}

                {/* Face details */}
                {(mood === 'feliz' || mood === 'graduado' || mood === 'trabajando') && (
                  <>
                    <text x="44" y="61" fontSize="12" fontWeight="bold" fill="#78350F" textAnchor="middle">⭐</text>
                    <text x="76" y="61" fontSize="12" fontWeight="bold" fill="#78350F" textAnchor="middle">⭐</text>
                    <path d="M52,70 Q60,78 68,70" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="41" cy="67" r="4.5" fill="#F59E0B" opacity="0.6" />
                    <circle cx="79" cy="67" r="4.5" fill="#F59E0B" opacity="0.6" />
                  </>
                )}

                {mood === 'preocupado' && (
                  <>
                    <path d="M41,55 Q45,53 48,56" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M72,55 Q75,53 78,56" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="44" cy="61" r="3.5" fill="#78350F" />
                    <circle cx="76" cy="61" r="3.5" fill="#78350F" />
                    <path d="M54,71 Q60,67 66,71" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </>
                )}

                {mood === 'enfermo' && (
                  <>
                    <path d="M41,57 L47,51 M41,51 L47,57" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                    <path d="M73,57 L79,51 M73,51 L79,57" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" />
                    <path d="M52,72 Q60,65 68,72" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
                    <rect x="36" y="38" width="48" height="8" rx="2" fill="#FFF" stroke="#64748B" strokeWidth="1" opacity="0.9" />
                  </>
                )}

                {mood === 'dormido' && (
                  <>
                    <path d="M40,59 Q45,63 50,59" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M70,59 Q75,63 80,59" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <circle cx="60" cy="71" r="2.5" fill="#78350F" />
                    <text x="92" y="32" fontSize="9" fontWeight="bold" fill="#D97706">Zzz</text>
                  </>
                )}
              </>
            )}

            {/* Shiny light reflections */}
            <circle cx="48" cy="38" r="4.5" fill="#FFF" opacity="0.25" />

            {/* Definitions */}
            <defs>
              <linearGradient id="fSeed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="50%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="fGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="fOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="fBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="60%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="fGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 2. CHAT CON EL TUTOR IA - CONCIENCIA COLECTIVA */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2.5rem] p-5 shadow-xl flex flex-col h-[480px]">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 text-emerald-600 p-1.5 rounded-xl">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Consultas con Fini AI 🦊</h4>
              <p className="text-[9px] text-slate-400">Tutor Financiero Inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              title="Configurar API Key"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearChatHistory}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
              title="Reiniciar chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible API Key Config */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-100 dark:border-slate-800"
            >
              <div className="py-3 px-1 space-y-2">
                <div className="flex items-start gap-1.5 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10 text-[9.5px] text-amber-800 dark:text-amber-400 leading-normal">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Para obtener respuestas ultra-personalizadas de Gemini, FinanzApp usa un proxy de servidor seguro. Si deseas, puedes pegar tu propia API Key de Gemini aquí. Se guarda localmente.</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={e => setUserApiKey(e.target.value)}
                    placeholder="Pega tu GEMINI_API_KEY..."
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
                  />
                  {userApiKey && (
                    <button
                      onClick={() => setUserApiKey('')}
                      className="text-xs text-rose-500 font-bold hover:underline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 scrollbar-none">
          {chatHistory.map((msg) => {
            const isFini = msg.sender === 'fini';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isFini ? 'justify-start' : 'justify-end'}`}
              >
                {isFini && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                )}

                <div className="max-w-[85%] flex flex-col space-y-0.5">
                  <div className={`p-3.5 rounded-2xl text-[11px] leading-relaxed whitespace-pre-line font-medium ${
                    isFini 
                      ? 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                      : 'bg-emerald-500 text-white rounded-tr-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-[8px] text-slate-400 font-bold px-1 ${isFini ? 'text-left' : 'text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isFini && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-900 text-slate-400 p-3 rounded-2xl rounded-tl-none text-[10px] italic font-bold">
                Fini está analizando tus balances y razonando...
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pregunta a Fini (ej: ¿Cómo ahorro mejor?)..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isLoading}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center shadow-md shadow-emerald-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 3. NUTRICIÓN DE ALCANCÍA */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2.5rem] p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="w-4.5 h-4.5 text-amber-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Depósito Directo de Ahorro Real</h4>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
          Alimenta a tu mascota Fini transfiriendo tus soles líquidos disponibles directos a tu Cuenta de Ahorro de la App.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {['5', '10', '20', '50'].map(val => (
              <button
                key={val}
                onClick={() => setFeedAmount(val)}
                className={`py-2 rounded-xl text-[10.5px] font-black border transition-all cursor-pointer ${
                  feedAmount === val
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                S/. {val}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">S/.</span>
              <input
                type="number"
                value={feedAmount}
                onChange={e => setFeedAmount(e.target.value)}
                placeholder="Otro..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              onClick={handleFeed}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span>Depositar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trivia Training Modal */}
      <AnimatePresence>
        {showTriviaModal && currentTrivia && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 relative"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Entrenamiento IQ con Fini</h4>
              </div>

              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentTrivia.question}
              </p>

              <div className="space-y-2">
                {currentTrivia.options.map((opt: any, idx: number) => {
                  let btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100";
                  if (triviaAnswered) {
                    if (opt.correct) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
                    } else if (selectedTriviaOption === idx) {
                      btnStyle = "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400";
                    } else {
                      btnStyle = "bg-slate-100 dark:bg-slate-900 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={triviaAnswered}
                      onClick={() => handleAnswerTrivia(idx)}
                      className={`w-full p-3 text-[10.5px] text-left border rounded-xl transition-all cursor-pointer ${btnStyle}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {triviaAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-normal"
                >
                  {currentTrivia.explanation}
                </motion.div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowTriviaModal(false)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  {triviaAnswered ? "Cerrar" : "Saltar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
