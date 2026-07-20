import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode,
  Award,
  BookOpen,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  Camera,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PiggyBankItem {
  id: string;
  name: string;
  size: 'pequeña' | 'mediana' | 'grande';
  unlocked: boolean;
  emoji: string;
  qrValue: string;
  description: string;
  sourceActivity: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  duration: string;
  rewardSize: 'pequeña' | 'mediana' | 'grande';
  rewardName: string;
  completed: boolean;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

interface ClubBilletonProps {
  childCoins: number;
  setChildCoins: React.Dispatch<React.SetStateAction<number>>;
  childScore: number;
  setChildScore: React.Dispatch<React.SetStateAction<number>>;
  isRegistered: boolean;
  setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
  registrationData: {
    childName: string;
    parentName: string;
    age: string;
    district: string;
  };
  setRegistrationData: React.Dispatch<React.SetStateAction<{
    childName: string;
    parentName: string;
    age: string;
    district: string;
  }>>;
}

const ACTIVITIES_LIST: Activity[] = [
  {
    id: 'act-1',
    title: 'Charla: Mi Primera Monedita 🌱',
    description: 'Aprende qué es el dinero, de dónde viene y por qué mamá y papá trabajan con tanto amor.',
    duration: '10 minutos',
    rewardSize: 'pequeña',
    rewardName: 'Alcancía de Madera "Brote Verde"',
    completed: false,
    questions: [
      {
        question: '¿Qué es el dinero principalmente?',
        options: [
          'Un juguete divertido para coleccionar.',
          'Una herramienta que usamos para comprar cosas que necesitamos o deseamos.',
          'Un papel mágico que crece en los árboles de Cayma.'
        ],
        correctIndex: 1,
        explanation: '¡Exacto! El dinero es una herramienta de intercambio para adquirir bienes y servicios.'
      },
      {
        question: '¿De dónde viene el dinero que tienen los papás?',
        options: [
          'Del cajero automático que lo regala gratis.',
          'De su esfuerzo, dedicación y trabajo diario.',
          'De debajo de la cama al despertar.'
        ],
        correctIndex: 1,
        explanation: '¡Excelente! Los papás trabajan duro y con mucho amor para ganar su sustento.'
      },
      {
        question: '¿Por qué es una buena idea guardar una monedita hoy?',
        options: [
          'Para que Fini esté feliz y podamos cumplir una meta en el futuro.',
          'Para perderla en los bolsillos.',
          'Para comprar dulces de inmediato.'
        ],
        correctIndex: 0,
        explanation: '¡Gran respuesta! Ahorrar nos permite alcanzar metas importantes mañana.'
      }
    ]
  },
  {
    id: 'act-2',
    title: 'Taller: El Detective de los Gastos Hormiga 🐜',
    description: 'Aprende a descubrir esos pequeños gastos invisibles que se comen nuestros ahorros sin darnos cuenta.',
    duration: '15 minutos',
    rewardSize: 'mediana',
    rewardName: 'Alcancía de Cerámica "Fini de Plata"',
    completed: false,
    questions: [
      {
        question: '¿Qué es un "Gasto Hormiga"?',
        options: [
          'Comprar comida para hormigas de jardín.',
          'Un gasto muy grande como comprar un automóvil.',
          'Un gasto pequeño y repetitivo en cosas innecesarias (dulces, juguetes de un sol, etc.).'
        ],
        correctIndex: 2,
        explanation: '¡Correcto! Los gastos hormiga parecen insignificantes pero sumados son un gran monto.'
      },
      {
        question: 'Si evitamos comprar un caramelo todos los días y lo ahorramos, ¿qué pasa?',
        options: [
          'Al final del mes tendremos un buen monto para algo más útil o saludable.',
          'No pasa nada, el caramelo era mejor.',
          'Fini se pone muy triste.'
        ],
        correctIndex: 0,
        explanation: '¡Excelente! Al final de la semana o mes, verás cuántos soles lograste acumular.'
      },
      {
        question: '¿Cómo podemos ganarle a los gastos hormiga?',
        options: [
          'Llevando una botellita de agua y fruta saludable desde casa en vez de comprar afuera.',
          'Pidiéndole más propina a los papás.',
          'Llorando en la tienda.'
        ],
        correctIndex: 0,
        explanation: '¡Así es! Preparar snacks en casa nos ahorra mucho dinero y es más nutritivo.'
      }
    ]
  },
  {
    id: 'act-3',
    title: 'Reto Mayor: El Rey del Ahorro de Cayma 👑',
    description: 'Conviértete en un experto planificador financiero aprendiendo a diferenciar deseos de necesidades de manera perfecta.',
    duration: '20 minutos',
    rewardSize: 'grande',
    rewardName: 'Alcancía Dorada "Escudo Billeton"',
    completed: false,
    questions: [
      {
        question: '¿Cuál de estos objetos es una NECESIDAD vital?',
        options: [
          'Un nuevo videojuego de moda.',
          'Agua pura para hidratarse y comida nutritiva.',
          'Un peluche gigante de dragón.'
        ],
        correctIndex: 1,
        explanation: '¡Impresionante! El agua y los alimentos son indispensables para vivir sanos.'
      },
      {
        question: '¿Qué es un DESEO o Gusto?',
        options: [
          'Algo muy divertido que queremos tener, pero que no es vital para vivir.',
          'Los libros de la escuela.',
          'La consulta con el médico cuando nos enfermamos.'
        ],
        correctIndex: 0,
        explanation: '¡Genial! Los deseos son opcionales y podemos postergarlos para priorizar el ahorro.'
      },
      {
        question: 'Si quieres comprar un juguete caro, ¿cuál es la mejor estrategia?',
        options: [
          'Exigir que lo compren hoy mismo con tarjeta de crédito.',
          'Olvidarse del juguete para siempre.',
          'Hacer un plan de ahorro, guardar una parte de tu propina en la alcancía y esperar con paciencia.'
        ],
        correctIndex: 2,
        explanation: '¡Perfecto! El ahorro programado y la paciencia nos dan la mayor satisfacción.'
      }
    ]
  }
];

export const ClubBilleton: React.FC<ClubBilletonProps> = ({
  childCoins,
  setChildCoins,
  childScore,
  setChildScore,
  isRegistered,
  setIsRegistered,
  registrationData,
  setRegistrationData
}) => {
  // --- Estados de Alcancías ---
  const [piggyBanks, setPiggyBanks] = useState<PiggyBankItem[]>(() => {
    const saved = localStorage.getItem('billeton_piggies');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'pig-small',
        name: 'Alcancía "Brote Verde"',
        size: 'pequeña',
        unlocked: false,
        emoji: '🌱🏺',
        qrValue: 'QR-BILLETON-SMALL-BROTE',
        description: 'Una tierna alcancía pequeña de madera reciclada. ¡Ideal para tus primeras moneditas de S/. 1 y S/. 2!',
        sourceActivity: 'Charla: Mi Primera Monedita'
      },
      {
        id: 'pig-medium',
        name: 'Alcancía "Fini de Plata"',
        size: 'mediana',
        unlocked: false,
        emoji: '🥈🐷',
        qrValue: 'QR-BILLETON-MEDIUM-FINI',
        description: 'Una alcancía mediana de cerámica brillante con las orejitas de Fini. ¡Te premia con un multiplicador de felicidad!',
        sourceActivity: 'Taller: El Detective de los Gastos Hormiga'
      },
      {
        id: 'pig-large',
        name: 'Alcancía "Escudo Billeton"',
        size: 'grande',
        unlocked: false,
        emoji: '👑🏺',
        qrValue: 'QR-BILLETON-LARGE-GOLDEN',
        description: 'La alcancía dorada oficial de Billeton. ¡Sólida, elegante y con espacio para billetes grandes! Hecha a mano.',
        sourceActivity: 'Reto Mayor: El Rey del Ahorro de Cayma'
      }
    ];
  });

  // --- Estados de Actividades Completas ---
  const [completedActs, setCompletedActs] = useState<string[]>(() => {
    const saved = localStorage.getItem('billeton_completed_acts');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Estados del Quiz Modal ---
  const [activeQuiz, setActiveQuiz] = useState<Activity | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // --- Estados del Scanner ---
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('billeton_piggies', JSON.stringify(piggyBanks));
  }, [piggyBanks]);

  useEffect(() => {
    localStorage.setItem('billeton_completed_acts', JSON.stringify(completedActs));
  }, [completedActs]);

  // Manejar encendido de cámara para simulación interactiva
  const startCamera = async () => {
    setScanStatus('scanning');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn("Camera could not be accessed, using simulator backdrop", err);
    }

    // Simular que escanea después de 3 segundos
    setTimeout(() => {
      // Intentar ver si hay algún QR pendiente de desbloquear
      const nextLockedPiggy = piggyBanks.find(p => !p.unlocked && completedActs.includes(p.id.replace('pig-', 'act-')));
      if (nextLockedPiggy) {
        handleUnlockPiggy(nextLockedPiggy.qrValue);
      } else {
        // Buscar cualquiera desbloqueable si ya completó alguna charla pero no tiene el QR escaneado
        const anyCompletable = piggyBanks.find(p => !p.unlocked);
        if (anyCompletable && completedActs.includes(anyCompletable.id.replace('pig-', 'act-'))) {
          handleUnlockPiggy(anyCompletable.qrValue);
        } else {
          // Si no ha completado la charla
          setScanStatus('error');
          setScannedResult('Código QR Billeton detectado, pero debes inscribirte y completar primero la charla correspondiente para poder canjear esta alcancía.');
        }
      }
      stopCamera();
    }, 3000);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // --- Desbloquear Alcancía ---
  const handleUnlockPiggy = (qrVal: string) => {
    const matchedPiggy = piggyBanks.find(p => p.qrValue.toLowerCase() === qrVal.trim().toLowerCase());
    
    if (matchedPiggy) {
      if (matchedPiggy.unlocked) {
        setScanStatus('error');
        setScannedResult(`¡La alcancía "${matchedPiggy.name}" ya está en tu colección virtual!`);
        return;
      }

      // Validar si completó la actividad
      const requiredActId = matchedPiggy.id.replace('pig-', 'act-');
      const hasCompletedAct = completedActs.includes(requiredActId);

      if (!hasCompletedAct) {
        setScanStatus('error');
        setScannedResult(`¡Código de "${matchedPiggy.name}" detectado! Pero primero debes asistir y aprobar las preguntas del taller: "${matchedPiggy.sourceActivity}" para poder ganarla.`);
        return;
      }

      // Desbloquear con éxito
      setPiggyBanks(prev => prev.map(p => p.id === matchedPiggy.id ? { ...p, unlocked: true } : p));
      setChildScore(prev => prev + 50);
      setChildCoins(prev => prev + 15);
      setScanStatus('success');
      setScannedResult(`¡FELICIDADES! Desbloqueaste tu física y virtual: "${matchedPiggy.name}". Se añadieron S/. 15 de bono y +50 puntos de logro.`);
    } else {
      setScanStatus('error');
      setScannedResult('Código QR no reconocido. Asegúrate de escanear un código QR válido impreso en las cartillas de Charlas Billeton.');
    }
  };

  // --- Lógica de Quiz / Trivia de Charlas ---
  const handleOpenQuiz = (act: Activity) => {
    setActiveQuiz(act);
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizAnswered(false);
    setQuizScore(0);
  };

  const handleSelectOption = (idx: number) => {
    if (quizAnswered) return;
    setSelectedOption(idx);
  };

  const handleVerifyAnswer = () => {
    if (selectedOption === null || quizAnswered) return;
    const isCorrect = selectedOption === activeQuiz!.questions[quizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setQuizAnswered(true);
  };

  const handleNextQuestion = () => {
    if (quizIndex < activeQuiz!.questions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuizAnswered(false);
    } else {
      // Fin del Quiz!
      const passed = quizScore >= 2; // Aprobar con 2 de 3
      if (passed) {
        // Marcar actividad como completa
        if (!completedActs.includes(activeQuiz!.id)) {
          setCompletedActs(prev => [...prev, activeQuiz!.id]);
          setChildScore(prev => prev + 30);
          setChildCoins(prev => prev + 10);
        }
      }
      // Cerrar modal de trivia
      setQuizAnswered(true); // Usamos este estado para mostrar pantalla de resultado
    }
  };

  // --- Registro de Inscripción ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registrationData.childName.trim() && registrationData.parentName.trim()) {
      setIsRegistered(true);
      setChildScore(prev => prev + 20); // Bono por unirse
    }
  };

  return (
    <div id="club-billeton-container" className="space-y-6">
      
      {/* BANNER PRINCIPAL CLUB BILLETON */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#2A354B] to-[#3B4E75] rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl border border-slate-700/40">
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-full shadow-lg">
            <QrCode className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">CLUB OFICIAL</span>
            <h2 className="font-display font-extrabold text-xl leading-tight">
              Billeton Ahorro Club 🏆
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 leading-relaxed">
          ¡Inscríbete en las charlas recreativas para obtener alcancías físicas gratis de Billeton! Escanea sus códigos QR para activarlas virtualmente en tu celular y ganar premios.
        </p>

        {isRegistered && (
          <div className="mt-5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-300 block">Socio Ahorrador</span>
                <span className="text-xs font-black text-white">{registrationData.childName}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">Sede</span>
              <span className="text-xs font-bold text-emerald-300">{registrationData.district}, AQPs</span>
            </div>
          </div>
        )}
      </div>

      {/* 1. REGISTRO EN EL PROGRAMA DE CHARLAS SI NO ESTÁ INSCRITO */}
      {!isRegistered ? (
        <section className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Inscripción a Charlas Recreativas 🎒
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Para poder canjear las hermosas alcancías reales provistas por nuestra empresa Billeton, los hijos deben estar inscritos en los talleres recreativos gratis de Cayma.
          </p>

          <form onSubmit={handleRegister} className="space-y-3.5 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">NOMBRE DEL NIÑO/A</label>
              <input
                type="text"
                required
                value={registrationData.childName}
                onChange={e => setRegistrationData({ ...registrationData, childName: e.target.value })}
                placeholder="Ej: Marcelo Enríquez"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">NOMBRE DEL PADRE / TUTOR</label>
                <input
                  type="text"
                  required
                  value={registrationData.parentName}
                  onChange={e => setRegistrationData({ ...registrationData, parentName: e.target.value })}
                  placeholder="Ej: René Marcelo"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">EDAD</label>
                <input
                  type="number"
                  required
                  value={registrationData.age}
                  onChange={e => setRegistrationData({ ...registrationData, age: e.target.value })}
                  placeholder="8"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">DISTRITO DE RESIDENCIA</label>
              <select
                value={registrationData.district}
                onChange={e => setRegistrationData({ ...registrationData, district: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Cayma">Cayma, Arequipa</option>
                <option value="Yanahuara">Yanahuara, Arequipa</option>
                <option value="Selva Alegre">Alto Selva Alegre, Arequipa</option>
                <option value="Cercado">Cercado, Arequipa</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-transform active:scale-99 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Inscribirse y Ganar Bono de S/. 10</span>
            </button>
          </form>
        </section>
      ) : (
        /* 2. AREA DE CHARLAS / ACTIVIDADES Y ESCÁNER */
        <div className="space-y-6">
          
          {/* BOTÓN RÁPIDO PARA IR AL ESCÁNER DE ALCANCÍAS */}
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-5 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">¿Recibiste tu Alcancía Física?</h4>
                <p className="text-[10px] text-slate-400">Escanea su QR para activarla en tu colección virtual.</p>
              </div>
            </div>
            <button
              onClick={() => { setShowScanner(true); startCamera(); }}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-[10px] py-2 px-3 rounded-xl flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Escanear</span>
            </button>
          </div>

          {/* LISTADO DE TALLERES / CHARLAS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                  Charlas y Talleres Disponibles 📚
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {completedActs.length} de {ACTIVITIES_LIST.length} listos
              </span>
            </div>

            <div className="space-y-3">
              {ACTIVITIES_LIST.map(act => {
                const isCompleted = completedActs.includes(act.id);
                
                return (
                  <div
                    key={act.id}
                    className={`border rounded-2xl p-4 transition-all relative ${
                      isCompleted
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-100'
                        : 'bg-white dark:bg-[#1E293B] border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Badge de Recompensa */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      <Gift className="w-2.5 h-2.5" />
                      <span>Alcancía {act.rewardSize}</span>
                    </div>

                    <div className="pr-20 space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Taller Recreativo</span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <Clock className="w-3 h-3" />
                        <span>{act.duration}</span>
                      </div>

                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-transparent" />
                          <span>¡Charla aprobada! QR Listo</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenQuiz(act)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] py-1.5 px-3.5 rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <span>Asistir y Responder</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. MI COLECCIÓN DE ALCANCÍAS (DE PEQUEÑA A GRANDE) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-500" />
                <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                  Colección de Alcancías Obtenidas 🏺
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {piggyBanks.filter(p => p.unlocked).length} Desbloqueadas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {piggyBanks.map(piggy => {
                const isUnlocked = piggy.unlocked;
                const actId = piggy.id.replace('pig-', 'act-');
                const canUnlock = completedActs.includes(actId);

                return (
                  <div
                    key={piggy.id}
                    className={`border rounded-[2rem] p-5 transition-all relative overflow-hidden flex gap-4 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-white to-slate-50 dark:from-[#1E293B] dark:to-slate-800/50 border-slate-200/80 dark:border-slate-700/50 shadow-md'
                        : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    {/* Visual Emoji / Especia */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                      isUnlocked 
                        ? 'bg-amber-100 dark:bg-amber-950/20 border border-amber-200/50' 
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200/20'
                    }`}>
                      {isUnlocked ? piggy.emoji : '🔒'}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`text-xs font-black ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                          {piggy.name}
                        </h4>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          piggy.size === 'grande' 
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' 
                            : piggy.size === 'mediana' 
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800' 
                              : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {piggy.size}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {piggy.description}
                      </p>

                      <div className="pt-2">
                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 py-1 px-2.5 rounded-xl w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>¡Canjeada físicamente y activada! 🥳</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {canUnlock ? (
                              <button
                                onClick={() => { setShowScanner(true); startCamera(); }}
                                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[10px] py-1 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <QrCode className="w-3 h-3" />
                                <span>Escanea QR para Canje</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/10">
                                <Lock className="w-3 h-3" />
                                <span>Bloqueada. Completa: "{piggy.sourceActivity}"</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* --- MODAL 1: ESCÁNER / CÁMARA SIMULADOR DE QR --- */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => { setShowScanner(false); stopCamera(); setScanStatus('idle'); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1.5"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500 animate-pulse" />
                <h3 className="font-display font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Escáner Billeton QR 📷
                </h3>
              </div>

              {/* Viewport del Scanner */}
              <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
                {scanStatus === 'scanning' && (
                  <>
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline />
                    
                    {/* Láser de escaneo animado */}
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10B981] animate-bounce top-1/4" />
                    
                    {/* Caja central */}
                    <div className="border-2 border-emerald-400 w-32 h-32 absolute rounded-xl flex items-center justify-center opacity-60">
                      <div className="w-2.5 h-2.5 bg-emerald-400 absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-emerald-400 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-emerald-400 absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 rounded-full" />
                      <div className="w-2.5 h-2.5 bg-emerald-400 absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full" />
                    </div>

                    <span className="absolute bottom-3 text-[10px] text-white font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm animate-pulse">
                      Apuntando al QR de tu cartilla Billeton...
                    </span>
                  </>
                )}

                {scanStatus === 'success' && (
                  <div className="p-4 flex flex-col items-center justify-center text-emerald-400 space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 fill-emerald-900/10 animate-bounce" />
                    <span className="text-xs font-black">¡CANJE EXITOSO!</span>
                  </div>
                )}

                {scanStatus === 'error' && (
                  <div className="p-4 flex flex-col items-center justify-center text-rose-400 space-y-2">
                    <AlertCircle className="w-12 h-12 text-rose-500 animate-shake" />
                    <span className="text-xs font-black">ERROR DE CANJE</span>
                  </div>
                )}

                {scanStatus === 'idle' && (
                  <button
                    onClick={startCamera}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Iniciar Cámara</span>
                  </button>
                )}
              </div>

              {/* Mensaje de resultado de escaneo */}
              {scannedResult && (
                <p className={`text-xs p-3 rounded-xl border font-semibold leading-relaxed ${
                  scanStatus === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  {scannedResult}
                </p>
              )}

              {/* OPCIÓN DE INGRESO MANUAL O DEMO CON UN CLIC */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ingreso manual o simulación rápida:</span>
                
                {/* Demo Simulación Rápida */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setScanStatus('scanning'); setTimeout(() => handleUnlockPiggy('QR-BILLETON-SMALL-BROTE'), 1000); }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-[9px] font-black hover:bg-emerald-50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-all text-center flex flex-col items-center"
                  >
                    <span>🌱 Pequeña</span>
                    <span className="text-[8px] font-medium text-slate-400 mt-0.5">Simular QR</span>
                  </button>

                  <button
                    onClick={() => { setScanStatus('scanning'); setTimeout(() => handleUnlockPiggy('QR-BILLETON-MEDIUM-FINI'), 1000); }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-[9px] font-black hover:bg-emerald-50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-all text-center flex flex-col items-center"
                  >
                    <span>🥈 Mediana</span>
                    <span className="text-[8px] font-medium text-slate-400 mt-0.5">Simular QR</span>
                  </button>

                  <button
                    onClick={() => { setScanStatus('scanning'); setTimeout(() => handleUnlockPiggy('QR-BILLETON-LARGE-GOLDEN'), 1000); }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-[9px] font-black hover:bg-emerald-50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition-all text-center flex flex-col items-center"
                  >
                    <span>👑 Grande</span>
                    <span className="text-[8px] font-medium text-slate-400 mt-0.5">Simular QR</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="Escribe código de alcancía (ej: QR-...)"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                  <button
                    onClick={() => { handleUnlockPiggy(manualCode); setManualCode(''); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-xl text-xs font-bold"
                  >
                    Activar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: QUIZ / TRIVIA DE CHARLAS --- */}
      <AnimatePresence>
        {activeQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveQuiz(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm"
              >
                ✕
              </button>

              {/* Título de la Charla */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[9px] uppercase font-bold text-emerald-500">Trivia del Taller Didáctico</span>
                <h3 className="font-display font-extrabold text-xs text-slate-800 dark:text-slate-100 leading-tight">
                  {activeQuiz.title}
                </h3>
              </div>

              {/* Pantalla de trivia normal */}
              {(!quizAnswered || quizIndex < activeQuiz.questions.length - 1 || selectedOption === null) ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span>Pregunta {quizIndex + 1} de {activeQuiz.questions.length}</span>
                    <span className="text-emerald-500">Puntaje: {quizScore}</span>
                  </div>

                  {/* Pregunta */}
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-relaxed">
                    {activeQuiz.questions[quizIndex].question}
                  </p>

                  {/* Opciones */}
                  <div className="space-y-2">
                    {activeQuiz.questions[quizIndex].options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      let optionStyle = 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                      
                      if (isSelected) {
                        optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                      }

                      if (quizAnswered) {
                        const isCorrect = idx === activeQuiz.questions[quizIndex].correctIndex;
                        if (isCorrect) {
                          optionStyle = 'bg-emerald-500 text-white border-emerald-500';
                        } else if (isSelected) {
                          optionStyle = 'bg-rose-500 text-white border-rose-500';
                        } else {
                          optionStyle = 'bg-slate-100 dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-slate-800/20';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full border rounded-2xl p-3 text-left text-xs font-semibold leading-relaxed transition-all ${optionStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explicación si ya se respondió */}
                  {quizAnswered && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-[11px] font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {activeQuiz.questions[quizIndex].explanation}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="pt-2">
                    {!quizAnswered ? (
                      <button
                        onClick={handleVerifyAnswer}
                        disabled={selectedOption === null}
                        className={`w-full font-bold text-xs py-2.5 rounded-xl transition-all ${
                          selectedOption === null
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                        }`}
                      >
                        Verificar Respuesta ➔
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs py-2.5 rounded-xl"
                      >
                        {quizIndex === activeQuiz.questions.length - 1 ? 'Finalizar Trivia' : 'Siguiente Pregunta ➔'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Pantalla de Resultados del Quiz */
                <div className="text-center py-4 space-y-4">
                  {quizScore >= 2 ? (
                    <>
                      <div className="text-4xl animate-bounce">🏆✨</div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        ¡Charla Recreativa Aprobada! 🎉
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Respondiste correctamente {quizScore} de 3 preguntas de la charla. Hemos enviado la Alcancía física "{activeQuiz.rewardName}" correspondiente a Cayma.
                      </p>
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl text-[10px] font-bold">
                        🔐 CÓDIGO DE CANJE ASIGNADO: <br />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-wider">
                          {piggyBanks.find(p => p.id.replace('pig-', 'act-') === activeQuiz.id)?.qrValue}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        *Guarda o copia este código para escanearlo o ingresarlo de forma manual para desbloquearla en tu colección.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl">📚🧐</div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        ¡Casi lo logras!
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Lograste {quizScore} de 3 puntos. Necesitas responder al menos 2 correctas para aprobar y ganar la alcancía. ¡No te rindas y repasa con Fini!
                      </p>
                    </>
                  )}

                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md"
                  >
                    Volver al Club Billeton
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
