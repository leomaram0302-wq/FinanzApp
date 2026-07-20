import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Coins, 
  Award, 
  RotateCcw, 
  Sparkles, 
  Briefcase, 
  ChevronRight, 
  Info,
  ShieldAlert,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  X,
  Play,
  Heart
} from 'lucide-react';

interface FinanPlayProps {
  childCoins: number;
  setChildCoins: React.Dispatch<React.SetStateAction<number>>;
  childScore: number;
  setChildScore: React.Dispatch<React.SetStateAction<number>>;
  petStats: {
    level: number;
    exp: number;
    happiness: number;
    nutrition?: number;
    iq?: number;
    emergencyFund?: number;
  };
  setPetStats: React.Dispatch<React.SetStateAction<any>>;
}

interface Customer {
  id: number;
  x: number;
  emoji: string;
  state: 'entering' | 'buying' | 'leaving';
  text: string;
  floatText: string;
  floatColor: string;
}

export const FinanPlay: React.FC<FinanPlayProps> = ({
  childCoins,
  setChildCoins,
  childScore,
  setChildScore,
  petStats,
  setPetStats
}) => {
  const [activeTab, setActiveTab] = useState<'stand' | 'presupuesto' | 'arcade'>('stand');

  // =========================================================================
  // JUEGO 2: SIMULADOR DE VIDA: EL DESAFÍO DEL PRESUPUESTO 50/30/20
  // =========================================================================
  const [budgetNeeds, setBudgetNeeds] = useState(500); // S/. 500 max (50%)
  const [budgetWants, setBudgetWants] = useState(300); // S/. 300 max (30%)
  const [budgetSavings, setBudgetSavings] = useState(200); // S/. 200 max (20%)
  const [budgetHappiness, setBudgetHappiness] = useState(80); // 0 to 100%
  const [budgetDebt, setBudgetDebt] = useState(0); // S/. 0
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [budgetGameActive, setBudgetGameActive] = useState(false);
  const [showBudgetDebrief, setShowBudgetDebrief] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [optionFeedback, setOptionFeedback] = useState<string | null>(null);

  const budgetCards = [
    {
      id: 1,
      title: "El Gran Estreno 🎮",
      description: "¡Salió el nuevo videojuego que tanto querías por S/. 200! Tus amigos de Cayma ya lo están jugando.",
      options: [
        {
          text: "A) Comprarlo con tarjeta de crédito (Deuda + S/. 150, Sube Felicidad)",
          feedback: "Sube tu felicidad temporalmente, pero rompes tu presupuesto de Deseos y acumulas S/. 150 de deuda.",
          effect: { needs: 0, wants: -150, savings: 0, happiness: 20, debt: 150 }
        },
        {
          text: "B) Esperar una oferta y ahorrar S/. 50 en la alcancía",
          feedback: "¡Excelente! Fini te felicita por evitar la compra impulsiva y hacer crecer tus ahorros en un 5% extra.",
          effect: { needs: 0, wants: 0, savings: 50, happiness: -5, debt: 0 }
        },
        {
          text: "C) Jugar un juego gratis en tu celular",
          feedback: "Te diviertes sin gastar un solo sol. ¡Gran demostración de costo de oportunidad!",
          effect: { needs: 0, wants: 0, savings: 0, happiness: 10, debt: 0 }
        }
      ]
    },
    {
      id: 2,
      title: "Urgencia de Fichas de Estudio 📚",
      description: "Tienes un examen muy importante mañana y necesitas imprimir las fichas de estudio de urgencia.",
      options: [
        {
          text: "A) Imprimir en copiadora local (S/. 15 de Necesidades)",
          feedback: "Cubre tu Necesidad básica escolar y te permite estudiar con total tranquilidad.",
          effect: { needs: -15, wants: 0, savings: 0, happiness: 15, debt: 0 }
        },
        {
          text: "B) Ignorar las copias y usar las S/. 15 para comprar chocolates",
          feedback: "Grave error: fallaste en una Necesidad básica para priorizar un Deseo. Jalaste el examen y Fini se preocupa.",
          effect: { needs: -30, wants: -15, savings: 0, happiness: -20, debt: 0 }
        }
      ]
    },
    {
      id: 3,
      title: "El Receso del Mediodía 🍔",
      description: "Olvidaste empacar tu almuerzo para el colegio. Tienes hambre y debes decidir qué comer.",
      options: [
        {
          text: "A) Comprar un menú escolar nutritivo y balanceado por S/. 15",
          feedback: "Cubre tu Necesidad básica de alimentación con un precio super justo. ¡Fini sonríe!",
          effect: { needs: -15, wants: 0, savings: 0, happiness: 5, debt: 0 }
        },
        {
          text: "B) Pedir una hamburguesa gigante con delivery por S/. 45",
          feedback: "Muy sabroso, pero es un capricho costoso que desbalancea el presupuesto de tus Deseos.",
          effect: { needs: 0, wants: -45, savings: 0, happiness: 18, debt: 0 }
        }
      ]
    },
    {
      id: 4,
      title: "El Regalo de Cumpleaños 🎁",
      description: "Es el cumpleaños de tu mejor amigo de Cayma y quieres darle un detalle para celebrar.",
      options: [
        {
          text: "A) Comprar un juguete de colección importado por S/. 100",
          feedback: "Un regalo hermoso, pero afecta seriamente tu presupuesto de Deseos por encima de tus límites.",
          effect: { needs: 0, wants: -100, savings: 0, happiness: 15, debt: 0 }
        },
        {
          text: "B) Hacer un regalo manual creativo o un pastel casero por S/. 20",
          feedback: "¡Excelente! El esfuerzo personal vale más que el precio de etiqueta. Sube tu felicidad y cuidas tu bolsillo.",
          effect: { needs: 0, wants: -20, savings: 0, happiness: 25, debt: 0 }
        }
      ]
    },
    {
      id: 5,
      title: "Celular un poco lento 📱",
      description: "Sientes que tu celular está un poco lento al abrir las tareas del colegio.",
      options: [
        {
          text: "A) Comprar un celular último modelo en cuotas mensuales de S/. 120",
          feedback: "Te endeudas por un gusto que no era indispensable. Fini se asusta al ver cargos de cuotas mensuales.",
          effect: { needs: 0, wants: -120, savings: 0, happiness: 10, debt: 120 }
        },
        {
          text: "B) Liberar memoria, optimizar el sistema y usarlo gratis",
          feedback: "¡Inteligente! Solucionaste el problema optimizando tus recursos sin contraer deudas innecesarias.",
          effect: { needs: 10, wants: 0, savings: 0, happiness: 10, debt: 0 }
        }
      ]
    },
    {
      id: 6,
      title: "Taller Práctico de Programación 🧠",
      description: "Se abre un taller extraescolar de Robótica y Finanzas que cuesta S/. 80.",
      options: [
        {
          text: "A) Inscribirse (Invertir S/. 80 en Educación/Ahorro Futuro)",
          feedback: "¡La mejor inversión es en ti mismo! Esto cuenta como crecimiento financiero. ¡Fini celebra!",
          effect: { needs: 0, wants: 0, savings: -80, happiness: 25, debt: 0 }
        },
        {
          text: "B) No inscribirse y quedarse durmiendo",
          feedback: "Pierdes la oportunidad de potenciar tus habilidades futuras. El costo de oportunidad fue alto.",
          effect: { needs: 0, wants: 0, savings: 0, happiness: -10, debt: 0 }
        }
      ]
    }
  ];

  const handleSelectBudgetOption = (optIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIndex);
    const card = budgetCards[currentCardIndex];
    const option = card.options[optIndex];
    
    setOptionFeedback(option.feedback);
    
    // Apply effects
    setBudgetNeeds(prev => Math.max(0, prev + option.effect.needs));
    setBudgetWants(prev => {
      const next = prev + option.effect.wants;
      if (next < 0) {
        setBudgetDebt(d => d + Math.abs(next));
        return 0;
      }
      return next;
    });
    setBudgetSavings(prev => Math.max(0, prev + option.effect.savings));
    setBudgetHappiness(prev => Math.min(100, Math.max(0, prev + option.effect.happiness)));
    if (option.effect.debt > 0) {
      setBudgetDebt(d => d + option.effect.debt);
    }
  };

  const handleNextBudgetCard = () => {
    setSelectedOption(null);
    setOptionFeedback(null);
    if (currentCardIndex < budgetCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // Game ended!
      setBudgetGameActive(false);
      setShowBudgetDebrief(true);
      
      // Calculate awards
      const diagnostic = getBudgetDiagnostic();
      let bonus = 10;
      let scoreBonus = 50;
      if (diagnostic.grade.includes('Maestro')) {
        bonus = 30;
        scoreBonus = 150;
      } else if (diagnostic.grade.includes('Equilibrado')) {
        bonus = 20;
        scoreBonus = 100;
      }
      
      setChildCoins(prev => prev + bonus);
      setChildScore(prev => prev + scoreBonus);
      
      // Level up Fini
      setPetStats(prev => {
        const nextExp = prev.exp + 25;
        const levelUp = nextExp >= 100;
        return {
          level: levelUp ? prev.level + 1 : prev.level,
          exp: levelUp ? nextExp - 100 : nextExp,
          happiness: Math.min(100, prev.happiness + 15)
        };
      });
    }
  };

  const getBudgetDiagnostic = () => {
    if (budgetDebt === 0 && budgetSavings >= 120 && budgetHappiness >= 70) {
      return {
        grade: "Maestro del Ahorro 🏆",
        text: "¡Increíble! Supiste balancear tus necesidades de estudio y alimentación, controlaste los deseos impulsivos y mantuviste tus ahorros sanos. Eres un verdadero maestro financiero.",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10 border-amber-500/20"
      };
    } else if (budgetDebt <= 100 && budgetHappiness >= 50 && budgetSavings >= 60) {
      return {
        grade: "Presupuestador Equilibrado ⚖️",
        text: "¡Buen trabajo! Lograste pasar el mes con un presupuesto bastante equilibrado. Tuviste algunos gustos y pequeñas deudas, pero mantuviste tus prioridades claras. ¡Sigue practicando!",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10 border-emerald-500/20"
      };
    } else {
      return {
        grade: "En Peligro de Deuda ⚠️",
        text: "¡Cuidado! Priorizaste compras impulsivas y te endeudaste demasiado o descuidaste tus necesidades básicas. Fini está preocupado. Recuerda que la regla 50/30/20 te ayuda a disfrutar hoy sin comprometer tu futuro.",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10 border-rose-500/20"
      };
    }
  };

  const resetBudgetGame = () => {
    setBudgetNeeds(500);
    setBudgetWants(300);
    setBudgetSavings(200);
    setBudgetHappiness(80);
    setBudgetDebt(0);
    setCurrentCardIndex(0);
    setSelectedOption(null);
    setOptionFeedback(null);
    setBudgetGameActive(true);
    setShowBudgetDebrief(false);
  };

  // =========================================================================
  // JUEGO 1: MI PRIMER NEGOCIO: EL STAND ANIMADO
  // =========================================================================
  const [shopMoney, setShopMoney] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_stand_money');
    return saved ? parseFloat(saved) : 50;
  });
  const [shopLemons, setShopLemons] = useState<number>(10);
  const [shopPublicity, setShopPublicity] = useState<number>(1);
  const [shopEmergencyFund, setShopEmergencyFund] = useState<number>(0);
  const [shopDay, setShopDay] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_stand_day');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [dayRunning, setDayRunning] = useState(false);
  const [dayProgress, setDayProgress] = useState(0);
  const [weather, setWeather] = useState<'normal' | 'calor' | 'tormenta'>('normal');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shopkeeperFace, setShopkeeperFace] = useState<'😊' | '😄' | '😭' | '😲'>('😊');
  
  // Dialogs & Feedback
  const [finiAdvice, setFiniAdvice] = useState<string>('¡Hola! Soy Fini. En este juego aprenderás a manejar tu negocio de limonadas. ¡Compremos insumos y empecemos el día! 🍋');
  const [showStandReport, setShowStandReport] = useState(false);
  const [standReportData, setStandReportData] = useState({
    ventas: 0,
    ingresos: 0,
    gastos: 0,
    leccion: '',
    bonusCoins: 0
  });

  // Persistencia de Puesto de Limonadas
  useEffect(() => {
    localStorage.setItem('finanzapp_stand_money', shopMoney.toString());
    localStorage.setItem('finanzapp_stand_day', shopDay.toString());
  }, [shopMoney, shopDay]);

  // Loop de Simulación de 10 segundos
  useEffect(() => {
    if (!dayRunning) return;

    let progress = 0;
    let customerIdCounter = 1;
    let salesCount = 0;
    let revenueCount = 0;
    
    // Determinar precio según clima
    const lemonadePrice = weather === 'calor' ? 10 : 5;

    // Reset customers
    setCustomers([]);
    setShopkeeperFace('😊');

    // Intervalo de juego de 100ms (100 pasos = 10 segundos)
    const interval = setInterval(() => {
      progress += 1;
      setDayProgress(progress);

      // Mover clientes existentes
      setCustomers(prev => 
        prev.map(c => {
          let nextX = c.x + 4;
          let nextState = c.state;
          let text = c.text;
          let floatText = c.floatText;
          let floatColor = c.floatColor;

          if (c.state === 'entering' && c.x >= 140) {
            nextState = 'buying';
            // Lógica de Compra
            setShopLemons(currentLemons => {
              if (currentLemons > 0) {
                salesCount += 1;
                revenueCount += lemonadePrice;
                setShopMoney(prevM => prevM + lemonadePrice);
                text = '¡Rica! 🍹';
                floatText = `+S/. ${lemonadePrice}`;
                floatColor = 'text-emerald-500';
                setShopkeeperFace('😄');
                return currentLemons - 1;
              } else {
                text = '¡No hay limones! 😢';
                floatText = 'Sin stock';
                floatColor = 'text-rose-500';
                setShopkeeperFace('😭');
                return 0;
              }
            });
          } else if (c.state === 'buying' && c.x >= 180) {
            nextState = 'leaving';
            text = '';
            floatText = '';
          }

          return { ...c, x: nextX, state: nextState, text, floatText, floatColor };
        }).filter(c => c.x < 360)
      );

      // Evento Imprevisto en la mitad del día (50% progress) si hay tormenta
      if (progress === 50 && weather === 'tormenta') {
        setShopkeeperFace('😲');
        // Chequear fondo de emergencia
        setShopEmergencyFund(prevFund => {
          if (prevFund >= 15) {
            // Salvado
            setFiniAdvice('⛈️ ¡Tormenta Imprevista! Se rompió el toldo, pero tu Fondo de Emergencia de S/. 15 cubrió la reparación sin tocar la caja. 🛡️');
            return prevFund - 15;
          } else {
            // Castigo
            setShopMoney(m => Math.max(0, m - 15));
            setShopLemons(l => Math.max(0, l - 5));
            setFiniAdvice('⛈️ ¡Tormenta Imprevista! Sin fondo de emergencia, tuviste que pagar S/. 15 de tu caja y perdiste 5 limones por la lluvia. 😭');
            return prevFund;
          }
        });
      }

      // Spawning de clientes basado en la publicidad (📢) y clima
      const spawnChance = weather === 'calor' ? 15 : (10 + shopPublicity * 3);
      if (progress % 12 === 0 && Math.random() * 100 < spawnChance && progress < 85) {
        const customerEmojis = ['😄', '😋', '😎', '😍', '🦊', '🦁', '🐻', '🐼'];
        const randomEmoji = customerEmojis[Math.floor(Math.random() * customerEmojis.length)];
        
        setCustomers(prev => [
          ...prev,
          {
            id: customerIdCounter++,
            x: 0,
            emoji: randomEmoji,
            state: 'entering',
            text: '',
            floatText: '',
            floatColor: 'text-emerald-500'
          }
        ]);
      }

      // Fin del día (10 segundos)
      if (progress >= 100) {
        clearInterval(interval);
        setDayRunning(false);

        // Terminar reporte
        const costoInsumos = 10; // Fijo simulado o basado en lo que gastó
        let leccion = '';
        if (salesCount === 0) {
          leccion = 'No lograste ventas. Recuerda comprar limones 🍋 antes de que empiece el día para poder vender.';
        } else if (shopLemons === 0 && progress >= 90) {
          leccion = '¡Buen trabajo! Pero te quedaste sin limones. Comprar más insumos te ayuda a no perder clientes con antojo.';
        } else if (weather === 'tormenta' && shopEmergencyFund === 0) {
          leccion = 'Los imprevistos pasan en cualquier negocio. Separar dinero para un Fondo de Emergencia te protege de pérdidas dolorosas.';
        } else {
          leccion = '¡Excelente día! Equilibraste tus insumos, atrajiste clientes y guardaste dinero. ¡Fini está orgulloso!';
        }

        const bonus = Math.max(2, Math.floor(revenueCount / 4));
        setChildCoins(prev => prev + bonus);
        setChildScore(prev => prev + salesCount * 15);
        
        // Levelf Fini stats
        setPetStats(prev => {
          const nextExp = prev.exp + 20;
          const levelUp = nextExp >= 100;
          return {
            level: levelUp ? prev.level + 1 : prev.level,
            exp: levelUp ? nextExp - 100 : nextExp,
            happiness: Math.min(100, prev.happiness + 12)
          };
        });

        setStandReportData({
          ventas: salesCount,
          ingresos: revenueCount,
          gastos: weather === 'tormenta' && shopEmergencyFund < 15 ? 15 : 0,
          leccion,
          bonusCoins: bonus
        });
        
        setShopDay(d => d + 1);
        setShowStandReport(true);
      }

    }, 100);

    return () => clearInterval(interval);
  }, [dayRunning, weather]);

  // Acciones de Puesto de Limonadas
  const comprarLimones = () => {
    if (shopMoney >= 5) {
      setShopMoney(m => m - 5);
      setShopLemons(l => l + 5);
      setFiniAdvice('🍋 ¡Excelente! Compraste 5 limones por S/. 5. Ya tienes insumos para atender a tus clientes.');
      setShopkeeperFace('😊');
    } else {
      setFiniAdvice('❌ No tienes suficiente dinero en caja para comprar limones. ¡Necesitas al menos S/. 5!');
      setShopkeeperFace('😭');
    }
  };

  const mejorarPublicidad = () => {
    if (shopMoney >= 10) {
      setShopMoney(m => m - 10);
      setShopPublicity(p => p + 1);
      setFiniAdvice('📢 ¡Genial! Invertiste S/. 10 en volantes. Vendrán más clientes al stand esta semana.');
      setShopkeeperFace('😄');
    } else {
      setFiniAdvice('❌ No te alcanza para publicidad. Cuesta S/. 10 mejorar la tienda.');
    }
  };

  const meterFondoEmergencia = () => {
    if (shopMoney >= 10) {
      setShopMoney(m => m - 10);
      setShopEmergencyFund(f => f + 10);
      setFiniAdvice('🛡️ ¡Sabia decisión! Guardaste S/. 10 en tu Fondo de Emergencia. Te protegerá de imprevistos climáticos.');
      setShopkeeperFace('😊');
    } else {
      setFiniAdvice('❌ Dinero insuficiente. Necesitas al menos S/. 10 para ahorrar en emergencias.');
    }
  };

  const iniciarDiaLimonadas = () => {
    if (dayRunning) return;
    
    // Elegir clima al azar
    const climas: ('normal' | 'calor' | 'tormenta')[] = ['normal', 'normal', 'calor', 'tormenta'];
    const climaElegido = climas[Math.floor(Math.random() * climas.length)];
    setWeather(climaElegido);

    if (climaElegido === 'calor') {
      setFiniAdvice('☀️ ¡ALERTA CLIMA! Hace una tremenda ola de calor en Cayma. ¡La gente pagará S/. 10 por vaso de limonada fría!');
    } else if (climaElegido === 'tormenta') {
      setFiniAdvice('⛈️ ¡ALERTA CLIMA! Se avecina una tormenta repentina. Podría haber daños si no tienes Fondo de Emergencia.');
    } else {
      setFiniAdvice('⛅ Clima agradable en Cayma. Los clientes pasarán con normalidad a comprar sus limonadas a S/. 5.');
    }

    setDayProgress(0);
    setDayRunning(true);
  };

  const reiniciarStandTotal = () => {
    if (window.confirm('¿Quieres reiniciar tu puesto de limonadas al Día 1 con S/. 50?')) {
      setShopMoney(50);
      setShopLemons(10);
      setShopPublicity(1);
      setShopEmergencyFund(0);
      setShopDay(1);
      setFiniAdvice('¡Reiniciaste tu negocio! Listos para planificar el nuevo Día 1.');
      setShopkeeperFace('😊');
    }
  };


  // =========================================================================
  // JUEGO 2: ARCADE FINANCIERO: ATRAPA EL AHORRO (CANVAS)
  // =========================================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [arcadeRunning, setArcadeRunning] = useState(false);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [arcadeHighScore, setArcadeHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_arcade_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [arcadeLives, setArcadeLives] = useState(3);
  const [comboCount, setComboCount] = useState(0);
  const [showArcadeDebrief, setShowArcadeDebrief] = useState(false);
  const [arcadeSummary, setArcadeSummary] = useState({
    puntos: 0,
    monedasGanadas: 0,
    consejo: ''
  });

  // Teclas y controles táctiles
  const playerXRef = useRef(200);
  const targetXRef = useRef(200);
  const touchActiveRef = useRef(false);

  useEffect(() => {
    if (!arcadeRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resoluciones internas fijas para física estable, se escala en CSS
    canvas.width = 400;
    canvas.height = 300;

    let localLives = 3;
    let localScore = 0;
    let localCombo = 0;
    let localHighScore = arcadeHighScore;
    let items: { x: number; y: number; type: 'coin' | 'bag' | 'snack' | 'monster' | 'shield'; size: number; speed: number }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number }[] = [];
    
    let shieldTimer = 0; // en frames
    let animId: number;
    let frameCount = 0;

    setArcadeScore(0);
    setArcadeLives(3);
    setComboCount(0);
    playerXRef.current = 200;
    targetXRef.current = 200;

    // Teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        targetXRef.current = Math.max(30, targetXRef.current - 45);
      } else if (e.key === 'ArrowRight') {
        targetXRef.current = Math.min(370, targetXRef.current + 45);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Bucle principal del Canvas (60 FPS)
    const updateGame = () => {
      frameCount++;

      // Limpiar lienzo
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo de rejilla espacial elegante
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Si el modo Interés Compuesto está activo (Combo >= 5)
      const isInterestCompActive = localCombo >= 5;
      if (isInterestCompActive) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('¡MODO INTERÉS COMPUESTO 2x ACTIVADO!', canvas.width / 2, 25);
      }

      // Decrementar escudo
      if (shieldTimer > 0) {
        shieldTimer--;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.arc(playerXRef.current, 265, 32, 0, Math.PI * 2);
        ctx.fill();
      }

      // Suavizado del movimiento del jugador (Easing)
      playerXRef.current += (targetXRef.current - playerXRef.current) * 0.25;

      // Dibujar Jugador (Fini / Alcancía de Oro)
      const px = playerXRef.current;
      const py = 265;

      // Dibujar aura dorada si está en combo
      if (isInterestCompActive) {
        ctx.shadowColor = '#F59E0B';
        ctx.shadowBlur = 15;
      }

      // Dibujar a Fini como una gotita dorada/esmeralda
      ctx.fillStyle = isInterestCompActive ? '#FBBF24' : '#10B981';
      ctx.beginPath();
      ctx.ellipse(px, py, 22, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ojos de Fini
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(px - 8, py - 4, 3, 0, Math.PI * 2);
      ctx.arc(px + 8, py - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Detalle de hojita feliz en Fini
      ctx.fillStyle = '#34D399';
      ctx.beginPath();
      ctx.ellipse(px, py - 18, 4, 7, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Boca contenta o herida
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (localCombo > 0) {
        ctx.arc(px, py + 2, 5, 0, Math.PI);
      } else {
        ctx.moveTo(px - 5, py + 4);
        ctx.lineTo(px + 5, py + 4);
      }
      ctx.stroke();

      // Quitar sombras de dibujo
      ctx.shadowBlur = 0;

      // Spawning de objetos descendentes
      if (frameCount % 45 === 0) {
        const randX = Math.random() * (canvas.width - 40) + 20;
        const types: ('coin' | 'bag' | 'snack' | 'monster' | 'shield')[] = [
          'coin', 'coin', 'coin', 'snack', 'snack', 'bag', 'monster', 'shield'
        ];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        
        items.push({
          x: randX,
          y: -10,
          type: chosenType,
          size: chosenType === 'bag' ? 14 : chosenType === 'monster' ? 16 : 11,
          speed: chosenType === 'monster' ? 4 : (Math.random() * 2 + 2)
        });
      }

      // Mover y procesar items que caen
      items = items.filter(item => {
        item.y += item.speed;

        // Dibujar Item
        ctx.save();
        if (item.type === 'coin') {
          // Moneda dorada brillante
          ctx.shadowColor = '#F59E0B';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FEF08A';
          ctx.font = 'bold 11px system-ui';
          ctx.fillText('S/.', item.x - 7, item.y + 4);
        } else if (item.type === 'bag') {
          // Saco de inversión verde
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(item.x, item.y + 4, item.size, 0, Math.PI * 2);
          ctx.fill();
          // Cierre del saquito
          ctx.fillStyle = '#059669';
          ctx.fillRect(item.x - 6, item.y - 7, 12, 5);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '9px system-ui';
          ctx.fillText('💰', item.x - 6, item.y + 5);
        } else if (item.type === 'snack') {
          // Snacks (Soda, comida chatarra, compras impulsivas)
          ctx.fillStyle = '#F87171';
          ctx.font = '14px system-ui';
          ctx.fillText('🍔', item.x - 8, item.y + 6);
        } else if (item.type === 'monster') {
          // Monstruo de inflación
          ctx.fillStyle = '#A855F7';
          ctx.font = '15px system-ui';
          ctx.fillText('👾', item.x - 9, item.y + 6);
        } else if (item.type === 'shield') {
          // Escudo de ahorro
          ctx.fillStyle = '#3B82F6';
          ctx.font = '14px system-ui';
          ctx.fillText('🛡️', item.x - 8, item.y + 6);
        }
        ctx.restore();

        // Colisiones con el Jugador
        const dist = Math.hypot(item.x - px, item.y - py);
        if (dist < item.size + 18) {
          // Tratar colisión
          if (item.type === 'coin') {
            const points = isInterestCompActive ? 20 : 10;
            localScore += points;
            localCombo++;
            
            // Spawn partículas
            for (let k = 0; k < 6; k++) {
              particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#FBBF24',
                size: Math.random() * 3 + 1,
                life: 25
              });
            }
          } else if (item.type === 'bag') {
            const points = isInterestCompActive ? 50 : 25;
            localScore += points;
            localCombo++;
            
            for (let k = 0; k < 8; k++) {
              particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: '#34D399',
                size: Math.random() * 3.5 + 1.5,
                life: 30
              });
            }
          } else if (item.type === 'shield') {
            shieldTimer = 300; // 5 segundos invulnerable
            localCombo = Math.max(localCombo, 5); // Activa el combo!
            for (let k = 0; k < 10; k++) {
              particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#60A5FA',
                size: Math.random() * 3 + 2,
                life: 35
              });
            }
          } else {
            // Snack o monstruo dañino
            if (shieldTimer > 0) {
              // El escudo lo absorbe
              localScore += 5; // Puntos por esquivar/bloquear!
            } else {
              localLives--;
              localCombo = 0; // Se cae el combo!
              // Flash de herida en canvas
              ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }

          setArcadeScore(localScore);
          setArcadeLives(localLives);
          setComboCount(localCombo);
          return false; // Eliminar item colisionado
        }

        // Si cae al suelo
        if (item.y > canvas.height + 10) {
          if (item.type === 'coin' || item.type === 'bag') {
            // Dejar caer ahorro reduce combo
            localCombo = Math.max(0, localCombo - 1);
            setComboCount(localCombo);
          }
          return false;
        }

        return true;
      });

      // Dibujar partículas
      particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return p.life > 0;
      });

      // Terminar si se acaban las vidas
      if (localLives <= 0) {
        cancelAnimationFrame(animId);
        setArcadeRunning(false);
        window.removeEventListener('keydown', handleKeyDown);

        // Procesar puntaje
        const monGanadas = Math.floor(localScore / 30);
        setChildCoins(prev => prev + monGanadas);
        setChildScore(prev => prev + Math.floor(localScore / 2));
        
        // Guardar record
        if (localScore > localHighScore) {
          localStorage.setItem('finanzapp_arcade_highscore', localScore.toString());
          setArcadeHighScore(localScore);
        }

        // Fini stats level
        setPetStats(prev => {
          const nextExp = prev.exp + 15;
          const levelUp = nextExp >= 100;
          return {
            level: levelUp ? prev.level + 1 : prev.level,
            exp: levelUp ? nextExp - 100 : nextExp,
            happiness: Math.min(100, prev.happiness + 10)
          };
        });

        // Generar consejo de Fini
        let consejo = '';
        if (localScore > 300) {
          consejo = '¡Increíble! Lograste activar la magia del Interés Compuesto consecutivamente. Al ignorar las tentaciones impulsivas, multiplicaste tus recursos de forma acelerada. ¡Eres un maestro!';
        } else if (localScore > 100) {
          consejo = '¡Muy bien jugado! Lograste acumular varias monedas y bolsas de inversión. La clave para que tu combo crezca es evitar esos gastos hormiga (las hamburguesas rojas). ¡Sigue practicando!';
        } else {
          consejo = 'El monstruo de la inflación y las compras impulsivas devoraron tus recursos velozmente. Trata de mantener el foco ahorrando de forma constante para que Fini gane más experiencia.';
        }

        setArcadeSummary({
          puntos: localScore,
          monedasGanadas: monGanadas,
          consejo
        });
        setShowArcadeDebrief(true);
        return;
      }

      animId = requestAnimationFrame(updateGame);
    };

    // Lanzar
    animId = requestAnimationFrame(updateGame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [arcadeRunning]);

  // Manejador del toque/arrastre en el Canvas (Mobile controls)
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const relativeX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    targetXRef.current = Math.max(20, Math.min(relativeX, 380));
    touchActiveRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    targetXRef.current = Math.max(20, Math.min(relativeX, 380));
  };


  return (
    <div className="space-y-6">
      
      {/* HEADER PRINCIPAL FINANPLAY */}
      <div className="bg-[#1E293B] dark:bg-slate-900 border border-slate-700/50 rounded-[2rem] p-5 relative overflow-hidden flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-emerald-500 p-2.5 rounded-2xl shadow-lg">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black text-amber-500 tracking-wider">Mundo Educativo</span>
            <h2 className="font-display font-black text-sm text-white leading-tight">FinanPlay: Zona Interactiva</h2>
          </div>
        </div>

        {/* Coins display */}
        <div className="flex items-center gap-1.5 bg-slate-850 px-3.5 py-1.5 rounded-2xl border border-slate-700">
          <Coins className="w-4 h-4 text-amber-500 fill-current" />
          <span className="text-xs font-black text-amber-400">{childCoins} 🪙</span>
        </div>
      </div>

      {/* TABS DE JUEGOS MÓVIL-FIRST */}
      <div className="flex p-1 bg-slate-150 dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 gap-1">
        <button
          onClick={() => {
            setActiveTab('stand');
            setArcadeRunning(false);
          }}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'stand'
              ? 'bg-white dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
          <span>🍋 El Stand</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('presupuesto');
            setArcadeRunning(false);
            setDayRunning(false);
          }}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'presupuesto'
              ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-blue-500" />
          <span>📋 Desafío 50/30/20</span>
        </button>
        
        <button
          onClick={() => {
            setActiveTab('arcade');
            setDayRunning(false);
          }}
          className={`flex-1 py-2.5 px-1 rounded-xl text-[10px] font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'arcade'
              ? 'bg-white dark:bg-slate-850 text-amber-500 dark:text-amber-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>🕹️ Atrapa Ahorro</span>
        </button>
      </div>

      {/* =========================================================================
          CONTENIDO TABS: JUEGO 1: STAND DE LIMONADAS
         ========================================================================= */}
      {activeTab === 'stand' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-[2.5rem] p-5 shadow-xl space-y-4 relative overflow-hidden">
            
            {/* Header del Día */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Simulador de Negocios</span>
                <h3 className="font-display font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span>Día {shopDay} en Cayma</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Limonadas Premium</span>
                </h3>
              </div>
              <button
                onClick={reiniciarStandTotal}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Reiniciar puesto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CAJA DE CONSEJO DE FINI */}
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-2xl p-3 flex gap-2.5 items-start">
              <span className="text-xl shrink-0 animate-bounce">🌱</span>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                {finiAdvice}
              </p>
            </div>

            {/* ESTADÍSTICAS FINANCIERAS DE LA TIENDA */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Caja Negocio</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-1.5">S/. {shopMoney.toFixed(1)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Limones (Insumo)</span>
                <span className="text-xs font-black text-amber-500 block mt-1.5">🍋 {shopLemons} uds</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-850">
                <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Fondo Emergencia</span>
                <span className="text-xs font-black text-blue-500 block mt-1.5">🛡️ S/. {shopEmergencyFund}</span>
              </div>
            </div>

            {/* RENDERIZADO VISUAL DEL PUESTO CON SVG ANIMADO */}
            <div className="relative w-full h-40 bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden flex flex-col justify-end">
              
              {/* Clima de Fondo */}
              {weather === 'calor' && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none">
                  <span className="absolute top-3 left-4 text-3xl animate-pulse">☀️</span>
                </div>
              )}
              {weather === 'tormenta' && (
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none">
                  <span className="absolute top-3 left-4 text-3xl animate-bounce">⛈️</span>
                </div>
              )}

              {/* Progress bar de simulación si el día corre */}
              {dayRunning && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-800">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-100" 
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              )}

              {/* Visualización del Negocio SVG */}
              <div className="absolute inset-0 top-6 flex justify-center items-center pointer-events-none">
                <svg className="w-80 h-32" viewBox="0 0 320 120">
                  {/* Piso */}
                  <rect x="0" y="100" width="320" height="20" fill="#1E293B" />
                  
                  {/* Stand del Negocio */}
                  <rect x="110" y="45" width="100" height="55" fill="#B45309" stroke="#78350F" strokeWidth="2" />
                  {/* Awning (Toldo de rayas) */}
                  <path d="M100,20 L220,20 L210,45 L110,45 Z" fill="#EF4444" stroke="#78350F" strokeWidth="1" />
                  <path d="M120,20 L140,20 L130,45 L110,45 Z" fill="#FFFFFF" />
                  <path d="M160,20 L180,20 L170,45 L150,45 Z" fill="#FFFFFF" />
                  <path d="M200,20 L220,20 L210,45 L190,45 Z" fill="#FFFFFF" />

                  {/* Mostrador */}
                  <rect x="105" y="45" width="110" height="6" fill="#FDE047" />

                  {/* Lemonade jar */}
                  <rect x="180" y="32" width="14" height="13" fill="#FACC15" opacity="0.9" rx="2" />
                  <rect x="184" y="27" width="6" height="5" fill="#475569" />

                  {/* Letrero del Negocio */}
                  <rect x="120" y="60" width="80" height="25" fill="#FEF08A" rx="4" />
                  <text x="160" y="77" fontSize="8" fontWeight="bold" fill="#713F12" textAnchor="middle">LIMONADAS 🍹</text>

                  {/* Comerciante / Jugador */}
                  <text x="160" y="15" fontSize="24" className="animate-bounce">
                    {shopkeeperFace}
                  </text>

                  {/* Renderizar clientes animados en movimiento */}
                  {customers.map(c => (
                    <g key={c.id}>
                      {/* Cliente */}
                      <text x={c.x} y="95" fontSize="22" className="transition-all duration-100 ease-out">
                        {c.emoji}
                      </text>
                      {/* Globo de diálogo */}
                      {c.text && (
                        <g>
                          <rect x={c.x - 25} y="45" width="65" height="18" fill="#FFFFFF" rx="4" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.15))" />
                          <text x={c.x + 7} y="57" fontSize="7.5" fontWeight="black" fill="#1E293B" textAnchor="middle">{c.text}</text>
                        </g>
                      )}
                      {/* Texto flotante de monedas */}
                      {c.floatText && (
                        <text x={c.x + 5} y="32" fontSize="11.5" fontWeight="black" className={`${c.floatColor} fill-current animate-bounce`}>
                          {c.floatText}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Botón de Iniciar Día sobrepuesto si no corre */}
              {!dayRunning && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                  <button
                    onClick={iniciarDiaLimonadas}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Iniciar Día Comercial 🚀</span>
                  </button>
                </div>
              )}
            </div>

            {/* BOTONES GIGANTES DE ACCIÓN INTERACTIVA (Estrategia de Flujo de Caja) */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              
              <button
                onClick={comprarLimones}
                disabled={dayRunning}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-amber-500/10 dark:bg-slate-950 dark:hover:bg-amber-500/20 border border-slate-200 dark:border-slate-850 rounded-2xl transition-all cursor-pointer group active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🍋</span>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 mt-2 block">Comprar Limones</span>
                <span className="text-[8.5px] text-amber-600 font-bold mt-0.5">- S/. 5 (Recibes 5)</span>
              </button>

              <button
                onClick={mejorarPublicidad}
                disabled={dayRunning}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-purple-500/10 dark:bg-slate-950 dark:hover:bg-purple-500/20 border border-slate-200 dark:border-slate-850 rounded-2xl transition-all cursor-pointer group active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📢</span>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 mt-2 block">Invertir Publicidad</span>
                <span className="text-[8.5px] text-purple-600 font-bold mt-0.5">- S/. 10 (Sube x1)</span>
              </button>

              <button
                onClick={meterFondoEmergencia}
                disabled={dayRunning}
                className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-blue-500/10 dark:bg-slate-950 dark:hover:bg-blue-500/20 border border-slate-200 dark:border-slate-850 rounded-2xl transition-all cursor-pointer group active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🛡️</span>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 mt-2 block">Fondo Emergencia</span>
                <span className="text-[8.5px] text-blue-500 font-bold mt-0.5">- S/. 10 (Protege)</span>
              </button>

            </div>

            {/* Publicidad actual indicator */}
            <div className="flex justify-between text-[9px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
              <span>Publicidad actual: x{shopPublicity} (Más clientes)</span>
              <span>Protección activa: S/. {shopEmergencyFund} de Fondo</span>
            </div>

          </div>
        </div>
      )}


      {/* =========================================================================
          CONTENIDO TABS: JUEGO 2: SIMULADOR DE VIDA: DESAFÍO 50/30/20
         ========================================================================= */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-[2.5rem] p-5 shadow-xl space-y-4">
            
            {/* Header del Simulador */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">Simulador de Toma de Decisiones</span>
                <h3 className="font-display font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Desafío del Presupuesto 50/30/20</span>
                </h3>
              </div>
              <button
                onClick={resetBudgetGame}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                title="Reiniciar desafío"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* SI EL JUEGO NO ESTÁ ACTIVO (PANTALLA DE BIENVENIDA) */}
            {!budgetGameActive && !showBudgetDebrief && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-3xl">🏠</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-black text-sm text-slate-800 dark:text-slate-100">
                    Sueldo Mensual Virtual: S/. 1,000
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Tu misión es sobrevivir al mes distribuyendo tus ingresos bajo la regla financiera **50/30/20**:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-w-xs mx-auto text-left">
                  <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-xl">🏠</span>
                    <div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 block">50% Necesidades Básicas (S/. 500)</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Alimentos, estudios, pasajes y necesidades primarias.</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-xl">🎉</span>
                    <div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 block">30% Deseos y Caprichos (S/. 300)</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Videojuegos, dulces, antojos y salidas con amigos.</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <span className="text-xl">🏦</span>
                    <div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 block">20% Ahorro / Inversión Futura (S/. 200)</span>
                      <span className="text-[9px] text-slate-400 font-bold block">Tu alcancía para emergencias e inversión en ti mismo.</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetBudgetGame}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  ¡Iniciar Desafío del Mes! 🚀
                </button>
              </div>
            )}

            {/* JUEGO EN CURSO */}
            {budgetGameActive && (
              <div className="space-y-4">
                
                {/* 1. MEDIDORES EN TIEMPO REAL */}
                <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-150 dark:border-slate-850">
                  <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Estado de tu Presupuesto</span>
                  
                  {/* Fila de medidores */}
                  <div className="space-y-2">
                    {/* Necesidades */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-1">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>🏠</span> Necesidades Básicas
                        </span>
                        <span className={budgetNeeds < 100 ? 'text-rose-500 font-black animate-pulse' : 'text-slate-700 dark:text-slate-200'}>
                          S/. {budgetNeeds} / S/. 500
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (budgetNeeds / 500) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Deseos */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-1">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>🎉</span> Deseos y Gustos
                        </span>
                        <span className={budgetWants < 50 ? 'text-rose-500 font-black animate-pulse' : 'text-slate-700 dark:text-slate-200'}>
                          S/. {budgetWants} / S/. 300
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (budgetWants / 300) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Ahorros */}
                    <div>
                      <div className="flex justify-between text-[9px] font-bold mb-1">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <span>🏦</span> Alcancía Ahorros
                        </span>
                        <span className="text-blue-500 font-black">
                          S/. {budgetSavings} / S/. 200
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${Math.min(100, (budgetSavings / 200) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Felicidad y Deuda */}
                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200 dark:border-slate-800/80 mt-2">
                      <div className="flex items-center justify-between text-[9.5px] font-bold">
                        <span className="text-slate-500 flex items-center gap-1">😊 Felicidad:</span>
                        <span className="text-rose-500 font-black">{budgetHappiness}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] font-bold">
                        <span className="text-slate-500 flex items-center gap-1">💳 Deuda:</span>
                        <span className={`font-black ${budgetDebt > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
                          S/. {budgetDebt}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. CARTA DE SITUACIÓN ACTIVA */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex}
                    initial={{ x: 100, opacity: 0, rotate: 2 }}
                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                    exit={{ x: -100, opacity: 0, rotate: -2 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-150 dark:border-slate-850 space-y-3 relative overflow-hidden shadow-lg"
                  >
                    
                    {/* Decorative tag */}
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] uppercase font-bold text-blue-500 tracking-wider">
                        Situación {currentCardIndex + 1} de {budgetCards.length}
                      </span>
                      <span className="text-[8.5px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                        Mes Virtual
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {budgetCards[currentCardIndex].title}
                      </h4>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-semibold">
                        {budgetCards[currentCardIndex].description}
                      </p>
                    </div>

                    {/* OPCIONES DE ELECCIÓN VERTICAL */}
                    <div className="space-y-2 pt-1">
                      {budgetCards[currentCardIndex].options.map((opt, idx) => {
                        const isSelected = selectedOption === idx;
                        const hasSelectedAny = selectedOption !== null;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectBudgetOption(idx)}
                            disabled={hasSelectedAny}
                            className={`w-full text-left p-3 rounded-2xl border text-[10px] font-bold transition-all relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                              isSelected
                                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                                : hasSelectedAny
                                ? 'bg-slate-100/50 dark:bg-slate-950/50 border-slate-200/50 text-slate-400'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="max-w-[92%]">{opt.text}</span>
                            {isSelected && <span className="text-blue-500 shrink-0">👉</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* RETROALIMENTACIÓN DE FINI */}
                    <AnimatePresence>
                      {selectedOption !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3 flex gap-2.5 items-start mt-2"
                        >
                          <span className="text-xl shrink-0 animate-bounce">
                            {budgetHappiness >= 75 ? '🦊' : budgetNeeds < 200 || budgetDebt > 0 ? '😰' : '🦊'}
                          </span>
                          <div>
                            <span className="text-[8.5px] uppercase font-black text-blue-500 tracking-wider block">
                              Conciencia de Fini
                            </span>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold mt-0.5">
                              {optionFeedback}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* BOTÓN SIGUIENTE */}
                    {selectedOption !== null && (
                      <button
                        onClick={handleNextBudgetCard}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 mt-2 animate-pulse"
                      >
                        <span>
                          {currentCardIndex < budgetCards.length - 1 
                            ? 'Siguiente Situación' 
                            : 'Ver Diagnóstico Final'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                  </motion.div>
                </AnimatePresence>

              </div>
            )}

          </div>
        </div>
      )}


      {/* =========================================================================
          CONTENIDO TABS: JUEGO 2: ARCADE ATRAPA EL AHORRO
         ========================================================================= */}
      {activeTab === 'arcade' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-[2.5rem] p-5 shadow-xl space-y-4">
            
            {/* Header del juego */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">Arcade de Agilidad</span>
                <h3 className="font-display font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Atrapa el Ahorro</span>
                  <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">Récord: {arcadeHighScore} pts</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">Vidas</span>
                <div className="flex gap-0.5 mt-1.5 justify-end">
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < arcadeLives ? 'text-rose-500 fill-current' : 'text-slate-300 dark:text-slate-700'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* MARCADOR EN TIEMPO REAL */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[8.5px] text-slate-400 font-bold block uppercase leading-none">Puntuación</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100 block mt-1">{arcadeScore} pts</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                <span className="text-[8.5px] text-slate-400 font-bold block uppercase leading-none">Combo Interés Compuesto</span>
                <span className={`text-lg font-black block mt-1 transition-all ${comboCount >= 5 ? 'text-amber-500 scale-105 animate-pulse' : 'text-emerald-500'}`}>
                  🔥 {comboCount} {comboCount >= 5 ? ' (2x!)' : ''}
                </span>
              </div>
            </div>

            {/* RENDERIZADO DEL HTML5 CANVAS */}
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-900">
              
              <canvas
                ref={canvasRef}
                onTouchMove={handleTouchMove}
                onMouseMove={handleMouseMove}
                className="w-full h-64 bg-slate-950 block cursor-crosshair"
              />

              {/* Botón de Inicio sobrepuesto si no corre */}
              {!arcadeRunning && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-3xl">🕹️</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">¡Mueve a Fini para Atrapar el Ahorro!</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                      Atrapa monedas 🪙 y sacos 💰 para activar el combo. Evita la comida chatarra 🍔 y al Monstruo de la Inflación 👾. Usa el mouse/toque para deslizar.
                    </p>
                  </div>
                  <button
                    onClick={() => setArcadeRunning(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>¡Comenzar Partida!</span>
                  </button>
                </div>
              )}
            </div>

            {/* BOTONES DE CONTROL TÁCTIL PARA SMARTPHONES */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onTouchStart={() => {
                  targetXRef.current = Math.max(20, targetXRef.current - 40);
                }}
                onClick={() => {
                  targetXRef.current = Math.max(20, targetXRef.current - 40);
                }}
                className="py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-2xl text-center cursor-pointer active:scale-95 transition-transform border border-slate-200 dark:border-slate-800 text-lg select-none"
              >
                ⬅️ Deslizar Izquierda
              </button>
              <button
                onTouchStart={() => {
                  targetXRef.current = Math.min(380, targetXRef.current + 40);
                }}
                onClick={() => {
                  targetXRef.current = Math.min(380, targetXRef.current + 40);
                }}
                className="py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 rounded-2xl text-center cursor-pointer active:scale-95 transition-transform border border-slate-200 dark:border-slate-800 text-lg select-none"
              >
                Deslizar Derecha ➡️
              </button>
            </div>

          </div>
        </div>
      )}


      {/* =========================================================================
          MODALES DE DEBRIEF / REPORTES EDUCATIVOS
         ========================================================================= */}
      
      {/* 1. REPORTE DEL PUESTO DE LIMONADAS */}
      <AnimatePresence>
        {showStandReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-3xl">🍋</span>
                </div>
                
                <div>
                  <span className="text-[9px] uppercase font-black text-emerald-500 tracking-wider">Puesto de Limonadas</span>
                  <h4 className="font-display font-black text-sm text-slate-800 dark:text-slate-100">
                    ¡Balance del Día Finalizado!
                  </h4>
                </div>

                {/* Métricas de Finanzas */}
                <div className="w-full grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-left border border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block leading-none">Vasos Vendidos</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-1 block">{standReportData.ventas} vasos</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block leading-none">Ingresos Brutos</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">S/. {standReportData.ingresos}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800 mt-1.5 flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Premios Obtenidos:</span>
                    <span className="text-xs font-black text-amber-500">+{standReportData.bonusCoins} 🪙</span>
                  </div>
                </div>

                {/* Consejos sencillos explicativos */}
                <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-2xl text-left">
                  <span className="text-xs font-black text-amber-500 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Consejo de Fini:</span>
                  </span>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {standReportData.leccion}
                  </p>
                </div>

                <button
                  onClick={() => setShowStandReport(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-3.5 rounded-2xl cursor-pointer active:scale-98 transition-all shadow-md"
                >
                  Continuar al Día Siguiente
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. REPORTE DEL ARCADE FINANCIERO */}
      <AnimatePresence>
        {showArcadeDebrief && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-3xl">🕹️</span>
                </div>
                
                <div>
                  <span className="text-[9px] uppercase font-black text-amber-500 tracking-wider font-sans">Arcade Financiero</span>
                  <h4 className="font-display font-black text-sm text-slate-800 dark:text-slate-100">
                    ¡Fin de la Partida!
                  </h4>
                </div>

                {/* Métricas */}
                <div className="w-full grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-left border border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block leading-none">Puntuación Total</span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 mt-1 block">{arcadeSummary.puntos} pts</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-slate-400 font-bold uppercase block leading-none">Monedas Canjeadas</span>
                    <span className="text-xs font-black text-amber-500 mt-1 block">+{arcadeSummary.monedasGanadas} 🪙</span>
                  </div>
                </div>

                {/* Consejos sencillos explicativos */}
                <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-2xl text-left">
                  <span className="text-xs font-black text-emerald-500 flex items-center gap-1.5 mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Conciencia del Ahorro:</span>
                  </span>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                    {arcadeSummary.consejo}
                  </p>
                </div>

                <button
                  onClick={() => setShowArcadeDebrief(false)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3.5 rounded-2xl cursor-pointer active:scale-98 transition-all shadow-md"
                >
                  Volver a Jugar
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. REPORTE DEL DESAFÍO DE PRESUPUESTO */}
      <AnimatePresence>
        {showBudgetDebrief && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-3xl">📊</span>
                </div>
                
                <div>
                  <span className="text-[9px] uppercase font-black text-blue-500 tracking-wider font-sans font-black">Simulador 50/30/20</span>
                  <h4 className="font-display font-black text-sm text-slate-800 dark:text-slate-100">
                    ¡Diagnóstico de Salud Financiera!
                  </h4>
                </div>

                {/* Diagnóstico */}
                <div className={`w-full p-4 rounded-2xl text-left border ${getBudgetDiagnostic().bgColor}`}>
                  <span className={`text-xs font-black block ${getBudgetDiagnostic().color}`}>
                    {getBudgetDiagnostic().grade}
                  </span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-semibold">
                    {getBudgetDiagnostic().text}
                  </p>
                </div>

                {/* Gráfico Simple Explicativo de Medidores */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-left">
                  <span className="text-[8.5px] text-slate-400 font-bold uppercase block leading-none mb-1">Tu Balance Final</span>
                  
                  <div className="space-y-1.5">
                    {/* Needs */}
                    <div>
                      <div className="flex justify-between text-[8px] font-bold">
                        <span>Necesidades</span>
                        <span>S/. {budgetNeeds}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(budgetNeeds/500)*100}%` }} />
                      </div>
                    </div>

                    {/* Wants */}
                    <div>
                      <div className="flex justify-between text-[8px] font-bold">
                        <span>Deseos</span>
                        <span>S/. {budgetWants}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${(budgetWants/300)*100}%` }} />
                      </div>
                    </div>

                    {/* Savings */}
                    <div>
                      <div className="flex justify-between text-[8px] font-bold">
                        <span>Ahorro/Futuro</span>
                        <span>S/. {budgetSavings}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${(budgetSavings/200)*100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Extra Stats */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-1.5 flex justify-between items-center text-[9px] font-bold text-slate-500">
                    <span>Felicidad: {budgetHappiness}%</span>
                    <span className={budgetDebt > 0 ? "text-rose-500" : ""}>Deuda: S/. {budgetDebt}</span>
                  </div>
                </div>

                {/* Premios */}
                <div className="w-full flex justify-between items-center bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl border border-amber-500/20 text-xs font-black">
                  <span>Premios canjeados:</span>
                  <span>+{getBudgetDiagnostic().grade.includes('Maestro') ? '30 🪙 y +150 pts' : getBudgetDiagnostic().grade.includes('Equilibrado') ? '20 🪙 y +100 pts' : '10 🪙 y +50 pts'}</span>
                </div>

                <button
                  onClick={() => setShowBudgetDebrief(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black text-xs py-3.5 rounded-2xl cursor-pointer active:scale-98 transition-all shadow-md"
                >
                  Cerrar y Volver
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
