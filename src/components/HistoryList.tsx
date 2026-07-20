import React, { useState, useMemo } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { Transaction } from '../types';

interface HistoryListProps {
  transactions: Transaction[];
  deleteTransaction: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  transactions,
  deleteTransaction
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<'Todas' | Transaction['category']>('Todas');

  // --- Filtrado Inteligente ---
  const filteredTxs = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'Todas' ? true : t.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [transactions, search, selectedCat]);

  return (
    <div id="history-list-view" className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-extrabold text-slate-800 dark:text-slate-100 text-sm">
          Historial de Movimientos 📅
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          {filteredTxs.length} transacciones
        </span>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar descripción o categoría..."
          className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800/80 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {/* FILTRO HORIZONTAL POR CATEGORÍAS */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['Todas', 'Gaming', 'Alimentos', 'Transporte', 'Estudios', 'Otros'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                : 'bg-white dark:bg-[#1E293B] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat === 'Todas' ? '🌐 Todas' : cat === 'Gaming' ? '🎮 Gaming' : cat === 'Alimentos' ? '🍔 Alimentos' : cat === 'Transporte' ? '🚌 Transporte' : cat === 'Estudios' ? '📚 Estudios' : '📦 Otros'}
          </button>
        ))}
      </div>

      {/* LISTADO DE TRANSACCIONES */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredTxs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] p-6">
            <span className="text-3xl">🔍</span>
            <p className="text-xs text-slate-400 mt-2 italic font-medium">
              No se encontraron movimientos registrados con esos filtros.
            </p>
          </div>
        ) : (
          filteredTxs.map(t => {
            const isGasto = t.type === 'gasto';
            const catEmoji = t.category === 'Gaming' ? '🎮' : t.category === 'Alimentos' ? '🍔' : t.category === 'Transporte' ? '🚌' : t.category === 'Estudios' ? '📚' : '📦';
            
            return (
              <div
                key={t.id}
                className="bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                    isGasto ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {isGasto ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block group-hover:text-emerald-500 transition-colors">
                      {t.description}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5 uppercase tracking-wide">
                        {catEmoji} {t.category}
                      </span>
                      <span className="text-[9px] text-slate-400">•</span>
                      <span className="text-[9px] text-slate-400 font-bold">{t.date.split('-').slice(1).reverse().join('/')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black font-mono ${
                    isGasto ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {isGasto ? '-' : '+'} S/. {t.amount.toFixed(2)}
                  </span>

                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded-lg transition-all active:scale-90 cursor-pointer"
                    title="Eliminar movimiento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
