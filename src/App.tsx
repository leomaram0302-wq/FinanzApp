import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  MapPin,
  Coins,
  Gamepad2,
  History,
  Wallet,
  Sparkles,
  Heart,
  QrCode,
  X,
  Smartphone,
  Download,
  Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from './types';
import { Logo } from './components/Logo';
import { FiniPet } from './components/FiniPet';
import { FinanPlay } from './components/FinanPlay';
import { FinanceDashboard } from './components/FinanceDashboard';
import { HistoryList } from './components/HistoryList';
import { ClubBilleton } from './components/ClubBilleton';

export default function App() {
  // --- Estados Persistidos ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanzapp_transactions');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'tx-1', type: 'ingreso', description: 'Propina Semanal de Papás', amount: 300, date: '2026-07-10', category: 'Otros' },
      { id: 'tx-2', type: 'gasto', description: 'Skins para Videojuego', amount: 45, date: '2026-07-12', category: 'Gaming' },
      { id: 'tx-3', type: 'gasto', description: 'Hamburguesas en Cayma', amount: 28, date: '2026-07-14', category: 'Alimentos' },
      { id: 'tx-4', type: 'ingreso', description: 'Premio Misión de Ahorro', amount: 50, date: '2026-07-15', category: 'Estudios' }
    ];
  });

  const [goal, setGoal] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_goal');
    return saved ? parseFloat(saved) : 500;
  });

  const [savings, setSavings] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_savings');
    return saved ? parseFloat(saved) : 150;
  });

  const [childCoins, setChildCoins] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_childCoins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [childScore, setChildScore] = useState<number>(() => {
    const saved = localStorage.getItem('finanzapp_childScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [petStats, setPetStats] = useState(() => {
    const saved = localStorage.getItem('finanzapp_petStats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          level: parsed.level ?? 1,
          exp: parsed.exp ?? 20,
          happiness: parsed.happiness ?? 85,
          nutrition: parsed.nutrition ?? 80,
          iq: parsed.iq ?? 50,
          emergencyFund: parsed.emergencyFund ?? 40
        };
      } catch (e) {
        // use default
      }
    }
    return { level: 1, exp: 20, happiness: 85, nutrition: 80, iq: 50, emergencyFund: 40 };
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finanzapp_isDarkMode');
    return saved ? saved === 'true' : false;
  });

  // --- Estados Nuevos para Club Billeton ---
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    const saved = localStorage.getItem('billeton_is_registered');
    return saved === 'true';
  });

  const [registrationData, setRegistrationData] = useState(() => {
    const saved = localStorage.getItem('billeton_reg_data');
    if (saved) return JSON.parse(saved);
    return { childName: '', parentName: '', age: '', district: 'Cayma' };
  });

  // --- Estados de UI No Persistidos ---
  const [activeTab, setActiveTab] = useState<'finanzas' | 'historial' | 'mascota' | 'ninos' | 'club'>('finanzas');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [lastTxType, setLastTxType] = useState<'ingreso' | 'gasto' | null>(null);

  // --- Estados de PWA (Instalación) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showHowToInstallModal, setShowHowToInstallModal] = useState<boolean>(false);

  // --- Efecto para capturar el prompt de instalación PWA ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar si ya está instalada o se ejecuta como Standalone
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowHowToInstallModal(true);
    }
  };

  // --- Efectos de Persistencia (Sincronización con LocalStorage) ---
  useEffect(() => {
    localStorage.setItem('finanzapp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finanzapp_goal', goal.toString());
  }, [goal]);

  useEffect(() => {
    localStorage.setItem('finanzapp_savings', savings.toString());
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('finanzapp_childCoins', childCoins.toString());
  }, [childCoins]);

  useEffect(() => {
    localStorage.setItem('finanzapp_childScore', childScore.toString());
  }, [childScore]);

  useEffect(() => {
    localStorage.setItem('finanzapp_petStats', JSON.stringify(petStats));
  }, [petStats]);

  useEffect(() => {
    localStorage.setItem('finanzapp_isDarkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('billeton_is_registered', isRegistered.toString());
  }, [isRegistered]);

  useEffect(() => {
    localStorage.setItem('billeton_reg_data', JSON.stringify(registrationData));
  }, [registrationData]);

  // --- Derivar Balance disponible ---
  const balance = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0);
    // Base de S/. 500 para evitar saldos negativos al iniciar con S/. 150 de ahorros
    const calculated = 500 + incomes - expenses - savings;
    return Math.max(0, calculated);
  }, [transactions, savings]);

  // --- Acciones de Transacción ---
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now()
    };
    setTransactions(prev => [newTx, ...prev]);
    setLastTxType(tx.type);

    // Ajustar felicidad del pet según la transacción
    setPetStats(prev => {
      const isExpense = tx.type === 'gasto';
      return {
        ...prev,
        happiness: isExpense 
          ? Math.max(10, prev.happiness - 15) // Los gastos bajan felicidad de Fini si son hormiga
          : Math.min(100, prev.happiness + 10) // Los ingresos lo alegran
      };
    });
  };

  const deleteTransaction = (id: string) => {
    const txToDelete = transactions.find(t => t.id === id);
    if (txToDelete) {
      // Si borramos un ingreso, baja felicidad, si borramos un gasto, sube felicidad
      setPetStats(prev => ({
        ...prev,
        happiness: txToDelete.type === 'gasto' 
          ? Math.min(100, prev.happiness + 10) 
          : Math.max(10, prev.happiness - 10)
      }));
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Alimentar a Fini (Ahorro directo) ---
  const handleFeedFini = (amount: number) => {
    if (balance >= amount) {
      setSavings(prev => prev + amount);
    }
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} transition-colors duration-300 flex items-center justify-center py-0 sm:py-8`}>
      
      {/* Contenedor Estilo Smartphone / Mobile-First */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:h-[850px] flex flex-col justify-between bg-[#F8FAFC] dark:bg-[#0F172A] shadow-2xl sm:shadow-[0_25px_60px_rgba(0,0,0,0.35)] relative sm:border-[10px] border-slate-200 dark:border-slate-800 sm:rounded-[3rem] overflow-hidden">
        
        {/* ENCABEZADO Y BRANDING PREMIUM */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-9 h-9 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wide text-xs text-slate-800 dark:text-slate-100 font-sans">
                FINANZAPP 
              </span>
              <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Tu crecimiento financiero
              </span>
            </div>
          </div>

          {/* Localización y Dark Mode */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide">
              <MapPin className="w-2.5 h-2.5" />
              <span>Cayma</span>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Cambiar tema"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL SCROLLABLE */}
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-20 scrollbar-none">
          <AnimatePresence mode="wait">
            {activeTab === 'finanzas' && (
              <motion.div
                key="finanzas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <FinanceDashboard
                  transactions={transactions}
                  addTransaction={addTransaction}
                  balance={balance}
                  savings={savings}
                  goal={goal}
                  setGoal={setGoal}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                />
              </motion.div>
            )}

            {activeTab === 'historial' && (
              <motion.div
                key="historial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <HistoryList
                  transactions={transactions}
                  deleteTransaction={deleteTransaction}
                />
              </motion.div>
            )}

            {activeTab === 'mascota' && (
              <motion.div
                key="mascota"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <FiniPet
                  balance={balance}
                  savings={savings}
                  setSavings={setSavings}
                  setChildCoins={setChildCoins}
                  goal={goal}
                  onFeed={handleFeedFini}
                  petStats={petStats}
                  setPetStats={setPetStats}
                  lastTxType={lastTxType}
                  transactions={transactions}
                />
              </motion.div>
            )}

            {activeTab === 'ninos' && (
              <motion.div
                key="ninos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <FinanPlay
                  childCoins={childCoins}
                  setChildCoins={setChildCoins}
                  childScore={childScore}
                  setChildScore={setChildScore}
                  petStats={petStats}
                  setPetStats={setPetStats}
                />
              </motion.div>
            )}

            {activeTab === 'club' && (
              <motion.div
                key="club"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <ClubBilleton
                  childCoins={childCoins}
                  setChildCoins={setChildCoins}
                  childScore={childScore}
                  setChildScore={setChildScore}
                  isRegistered={isRegistered}
                  setIsRegistered={setIsRegistered}
                  registrationData={registrationData}
                  setRegistrationData={setRegistrationData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* NAVEGACIÓN INFERIOR FIJA */}
        <nav className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-1.5 py-2 flex justify-around items-center z-40 rounded-t-2xl shadow-[0_-8px_25px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'finanzas' 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Wallet className="w-4.5 h-4.5" />
            <span className={`text-[8.5px] ${activeTab === 'finanzas' ? 'font-extrabold' : 'font-medium'}`}>
              Finanzas
            </span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'historial' 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <History className="w-4.5 h-4.5" />
            <span className={`text-[8.5px] ${activeTab === 'historial' ? 'font-extrabold' : 'font-medium'}`}>
              Historial
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mascota')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'mascota' 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <Sparkles className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <span className={`text-[8.5px] ${activeTab === 'mascota' ? 'font-extrabold' : 'font-medium'}`}>
              Fini 🦊
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ninos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'ninos' 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Gamepad2 className="w-4.5 h-4.5" />
            <span className={`text-[8.5px] ${activeTab === 'ninos' ? 'font-extrabold' : 'font-medium'}`}>
              FinanPlay
            </span>
          </button>

          <button
            onClick={() => setActiveTab('club')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 transition-all cursor-pointer active:scale-95 ${
              activeTab === 'club' 
                ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <QrCode className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className={`text-[8.5px] ${activeTab === 'club' ? 'font-extrabold' : 'font-medium'}`}>
              Club 🏆
            </span>
          </button>
        </nav>

        {/* BOTÓN FLOTANTE DESTACADO PWA */}
        {!isInstalled && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallClick}
            className="absolute bottom-20 right-4 z-40 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.35)] cursor-pointer border border-emerald-400/20 active:scale-95"
            style={{ y: [0, -6, 0] }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }
            }}
          >
            <span className="text-sm">📲</span>
            <span>Instalar App</span>
          </motion.button>
        )}

      </div>

      {/* MODAL INSTRUCCIONES DE INSTALACIÓN PWA */}
      <AnimatePresence>
        {showHowToInstallModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-5 relative"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowHowToInstallModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2 animate-pulse">
                  🐷
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Instalar FinanzApp
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  Lleva tu control financiero, juegos y a Fini la mascota virtual directamente en tu pantalla de inicio como una aplicación nativa.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Opción iOS */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-lg">🍎</span>
                    <span className="text-[10.5px] font-black uppercase tracking-wider">Para iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed font-semibold">
                    <li>Toca el botón <strong className="text-emerald-500 dark:text-emerald-400">Compartir 📤</strong> abajo en tu navegador Safari.</li>
                    <li>Busca y selecciona <strong className="text-emerald-500 dark:text-emerald-400">"Agregar al inicio" ➕</strong>.</li>
                    <li>¡Listo! Abre FinanzApp desde tu pantalla de inicio.</li>
                  </ol>
                </div>

                {/* Opción Android / Chrome */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-lg">🤖</span>
                    <span className="text-[10.5px] font-black uppercase tracking-wider">Para Android / Chrome / PC</span>
                  </div>
                  <ol className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed font-semibold">
                    <li>Toca el botón <strong className="text-emerald-500 dark:text-emerald-400">"Instalar"</strong> en el navegador, o busca los tres puntos del menú (<strong className="text-emerald-500 dark:text-emerald-400">⋮</strong>) arriba a la derecha.</li>
                    <li>Selecciona <strong className="text-emerald-500 dark:text-emerald-400">"Instalar aplicación"</strong> o <strong className="text-emerald-500 dark:text-emerald-400">"Agregar a la pantalla principal"</strong>.</li>
                    <li>¡Listo! Disfruta de la app en pantalla completa y offline.</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowHowToInstallModal(false);
                    if (deferredPrompt) handleInstallClick();
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Entendido</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
