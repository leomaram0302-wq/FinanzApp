import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Award,
  PlusCircle,
  Calendar,
  ChevronRight,
  Filter,
  DollarSign,
  Briefcase,
  Layers
} from 'lucide-react';
import { Transaction } from '../types';

interface FinanceDashboardProps {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  balance: number;
  savings: number;
  goal: number;
  setGoal: (newGoal: number) => void;
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  transactions,
  addTransaction,
  balance,
  savings,
  goal,
  setGoal,
  selectedDay,
  setSelectedDay
}) => {
  // Estados para el formulario de registro
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [type, setType] = useState<'ingreso' | 'gasto'>('gasto');
  const [category, setCategory] = useState<Transaction['category']>('Otros');
  const [dateDay, setDateDay] = useState('16'); // Predeterminado día 16 de Julio 2026
  
  // Estado para editar la meta
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal.toString());

  // --- Lógica del Calendario de Julio 2026 ---
  const calendarCells = useMemo(() => {
    const totalDays = 31;
    const startOffset = 2; // Julio 2026 empieza el Miércoles (Lunes=0, Martes=1, Miércoles=2)
    const cells: { day: number | null; hasExpense: boolean; hasIncome: boolean }[] = [];

    // Celdas vacías iniciales
    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, hasExpense: false, hasIncome: false });
    }

    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `2026-07-${d.toString().padStart(2, '0')}`;
      const dayTxs = transactions.filter(t => t.date === dateStr);
      const hasExpense = dayTxs.some(t => t.type === 'gasto');
      const hasIncome = dayTxs.some(t => t.type === 'ingreso');
      cells.push({ day: d, hasExpense, hasIncome });
    }

    return cells;
  }, [transactions]);

  const selectedDayTransactions = useMemo(() => {
    if (selectedDay === null) return [];
    const dateStr = `2026-07-${selectedDay.toString().padStart(2, '0')}`;
    return transactions.filter(t => t.date === dateStr);
  }, [transactions, selectedDay]);

  // --- Diagnóstico de Meta Inteligente ---
  const progressPercent = useMemo(() => {
    if (goal <= 0) return 0;
    return Math.min(100, (savings / goal) * 100);
  }, [savings, goal]);

  const goalDiagnostic = useMemo(() => {
    if (progressPercent >= 50) {
      return {
        status: '¡Excelente Camino! 🌱',
        style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        desc: 'Fini está muy feliz. Estás cubriendo tu meta de forma responsable.'
      };
    } else if (progressPercent >= 20) {
      return {
        status: 'Estable ⚖️',
        style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        desc: 'Vas bien, pero Fini tiene un poquito de hambre. ¡Agrega algunos soles hoy!'
      };
    } else {
      return {
        status: 'Zona de Alerta 🚨',
        style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        desc: 'Tus ahorros son bajos. Protege tus metas reduciendo gastos hormiga.'
      };
    }
  }, [progressPercent]);

  // --- Gráfico SVG Dinámico: Gastos por Categoría ---
  const categoryStats = useMemo<Record<Transaction['category'], number>>(() => {
    const stats: Record<Transaction['category'], number> = {
      Gaming: 0,
      Alimentos: 0,
      Transporte: 0,
      Estudios: 0,
      Otros: 0
    };

    transactions
      .filter(t => t.type === 'gasto')
      .forEach(t => {
        if (stats[t.category] !== undefined) {
          stats[t.category] += t.amount;
        }
      });

    return stats;
  }, [transactions]);

  const maxCategoryAmount = useMemo(() => {
    const vals = Object.values(categoryStats) as number[];
    const max = Math.max(...vals);
    return max > 0 ? max : 100; // Evitar división por cero
  }, [categoryStats]);

  // --- Envío del Formulario de Registro ---
  const handleSubmitTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amt);
    if (!desc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    const formattedDay = dateDay.padStart(2, '0');
    addTransaction({
      type,
      description: desc.trim(),
      amount: amountNum,
      date: `2026-07-${formattedDay}`,
      category
    });

    // Resetear formulario
    setDesc('');
    setAmt('');
  };

  const handleUpdateGoal = () => {
    const newGoal = parseFloat(goalInput);
    if (!isNaN(newGoal) && newGoal >= 0) {
      setGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  return (
    <div id="finance-dashboard-view" className="space-y-6">
      
      {/* TARJETA DE RESUMEN FINANZAPP STYLE */}
      <section className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/10 dark:from-slate-800 dark:via-slate-900 dark:to-emerald-950/10 border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
        {/* Glow de fondo plateado/verde */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tu Cuenta Principal</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Banco de Crédito BCP</span>
            </div>
          </div>
          <span className="text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/10">
            ● Activa
          </span>
        </div>

        {/* Balance Numérico */}
        <div className="mt-5 space-y-4">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block mb-1">SALDO DISPONIBLE</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-display">S/.</span>
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 font-display tracking-tight">
                {balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">AHORRO ACUMULADO</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                  S/. {savings.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">META DE AHORRO</span>
                <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                  S/. {goal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTROL Y DIAGNÓSTICO DE METAS INTELIGENTES */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Progreso de Meta Financiera
            </h3>
          </div>
          
          {isEditingGoal ? (
            <div className="flex gap-1.5">
              <input
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="w-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 text-xs font-bold"
              />
              <button onClick={handleUpdateGoal} className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">
                Ok
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setGoalInput(goal.toString()); setIsEditingGoal(true); }}
              className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              Cambiar Meta
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-400">Progreso:</span>
            <span className="text-emerald-500">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800/80">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Diagnóstico */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-medium ${goalDiagnostic.style}`}>
          <div className="font-extrabold mb-1">{goalDiagnostic.status}</div>
          <div>{goalDiagnostic.desc}</div>
        </div>
      </section>

      {/* FORMULARIO SIMPLE DE REGISTRO */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-500" />
          <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
            Registrar Movimiento ✍️
          </h3>
        </div>

        <form onSubmit={handleSubmitTx} className="space-y-4">
          <div className="grid grid-cols-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setType('gasto')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'gasto'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 inline mr-1" />
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'ingreso'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
              Ingreso
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">DÍA DE JULIO 2026</label>
              <select
                value={dateDay}
                onChange={e => setDateDay(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    Julio {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">CATEGORÍA</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Transaction['category'])}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Gaming">🎮 Gaming</option>
                <option value="Alimentos">🍔 Alimentos</option>
                <option value="Transporte">🚌 Transporte</option>
                <option value="Estudios">📚 Estudios</option>
                <option value="Otros">📦 Otros</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">DESCRIPCIÓN</label>
              <input
                type="text"
                required
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Ej: Pasajes en combi, almuerzo Cayma, etc."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">MONTO EN SOLES (S/.)</label>
              <input
                type="number"
                step="0.1"
                required
                value={amt}
                onChange={e => setAmt(e.target.value)}
                placeholder="S/. 0.00"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs p-3 rounded-xl shadow-md transition-all active:scale-99 cursor-pointer"
          >
            Registrar en FinanzApp 🚀
          </button>
        </form>
      </section>

      {/* GRÁFICO ESTADÍSTICO SVG DINÁMICO */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">📊</span>
            <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Tus Gastos por Categoría
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Julio 2026</span>
        </div>

        {/* SVG Bar Chart */}
        <div className="pt-2">
          <svg className="w-full h-44" viewBox="0 0 400 160">
            {/* Grid Lines */}
            <line x1="70" y1="20" x2="380" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" opacity="0.4" />
            <line x1="70" y1="70" x2="380" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" opacity="0.4" />
            <line x1="70" y1="120" x2="380" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" opacity="0.4" />

            {/* Bars */}
            {(['Gaming', 'Alimentos', 'Transporte', 'Estudios', 'Otros'] as Transaction['category'][]).map((cat, index) => {
              const total = categoryStats[cat];
              const barHeight = 14;
              const yPos = 15 + index * 26;
              const maxBarWidth = 220;
              const barWidth = Math.max(10, (total / maxCategoryAmount) * maxBarWidth);
              const color = 
                cat === 'Gaming' ? '#6366F1' : 
                cat === 'Alimentos' ? '#10B981' : 
                cat === 'Transporte' ? '#3B82F6' : 
                cat === 'Estudios' ? '#F59E0B' : '#8B5CF6';

              return (
                <g key={cat} className="group cursor-pointer">
                  {/* Category Labels */}
                  <text
                    x="10"
                    y={yPos + 11}
                    className="fill-slate-500 dark:fill-slate-400 font-bold text-[10px]"
                    fontFamily="sans-serif"
                  >
                    {cat}
                  </text>

                  {/* Background Track */}
                  <rect
                    x="70"
                    y={yPos}
                    width={maxBarWidth}
                    height={barHeight}
                    rx="4"
                    className="fill-slate-50 dark:fill-slate-800/50"
                  />

                  {/* Filled Bar */}
                  <rect
                    x="70"
                    y={yPos}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={color}
                  />

                  {/* Total Tag */}
                  <text
                    x={70 + barWidth + 8}
                    y={yPos + 11}
                    className="fill-slate-700 dark:fill-slate-200 font-extrabold text-[10px]"
                    fontFamily="sans-serif"
                  >
                    S/. {total.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* CALENDARIO INTERACTIVO */}
      <section className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
              Calendario de Julio 2026 📆
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            Cayma, Arequipa
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Toca cualquier día con puntos de actividad para revisar el historial rápido de ese día.
        </p>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span>Sáb</span>
          <span>Dom</span>
        </div>

        {/* Celdas del Calendario */}
        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            const isSelected = selectedDay === cell.day;
            const isToday = cell.day === 16; // 16 de Julio 2026

            return (
              <div
                key={idx}
                onClick={() => cell.day && setSelectedDay(isSelected ? null : cell.day)}
                className={`h-10 flex flex-col justify-between items-center p-1.5 rounded-lg text-xs font-bold transition-all ${
                  cell.day ? 'cursor-pointer select-none' : 'opacity-0 pointer-events-none'
                } ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isToday
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{cell.day}</span>
                {/* Indicadores de actividad */}
                <div className="flex gap-1">
                  {cell.hasIncome && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  )}
                  {cell.hasExpense && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalle del Día Seleccionado */}
        {selectedDay && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Movimientos del {selectedDay} de Julio 2026:
              </span>
              <button onClick={() => setSelectedDay(null)} className="text-[10px] text-slate-400 font-bold hover:underline">
                Cerrar
              </button>
            </div>

            {selectedDayTransactions.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-2">
                No hay movimientos registrados para este día.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayTransactions.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">
                        {t.category === 'Gaming' ? '🎮' : t.category === 'Alimentos' ? '🍔' : t.category === 'Transporte' ? '🚌' : t.category === 'Estudios' ? '📚' : '📦'}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{t.description}</span>
                    </div>
                    <span className={`font-bold ${t.type === 'ingreso' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === 'ingreso' ? '+' : '-'} S/. {t.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
