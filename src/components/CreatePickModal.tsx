'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  X, 
  Loader2, 
  TrendingUp, 
  Target, 
  DollarSign, 
  MessageSquare,
  Sparkles,
  Trophy,
  Activity,
  Zap,
  ArrowUpRight,
  Camera,
  Upload,
  Rocket,
  ShieldCheck
} from 'lucide-react';

interface CreatePickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const POPULAR_LEAGUES = [
  'Liga MX',
  'Premier League',
  'LaLiga',
  'Champions League',
  'Serie A',
  'MLS'
];

// 🧠 FUNCIÓN DE CONVERSIÓN DE MOMIOS (+ / - / Decimal)
function parseOddsInput(input: string): { decimal: number; isDreamer: boolean } {
  const clean = input.trim();
  if (!clean) return { decimal: 0, isDreamer: false };

  let dec = 0;

  if (clean.startsWith('+')) {
    const val = parseFloat(clean.replace('+', '')) || 0;
    dec = (val / 100) + 1;
  } else if (clean.startsWith('-')) {
    const val = Math.abs(parseFloat(clean.replace('-', '')) || 0);
    dec = val > 0 ? (100 / val) + 1 : 0;
  } else {
    const val = parseFloat(clean.replace(',', '.')) || 0;
    if (val > 20) {
      // Se asume momio americano positivo sin signo (+250)
      dec = (val / 100) + 1;
    } else {
      // Cuota Decimal normal (ej. 1.85)
      dec = val;
    }
  }

  const finalDecimal = parseFloat(dec.toFixed(2));
  const isDreamer = finalDecimal >= 10.0; // Cuota @10.00 o más (+900+)

  return { decimal: finalDecimal, isDreamer };
}

export default function CreatePickModal({ isOpen, onClose, onSuccess }: CreatePickModalProps) {
  const [loading, setLoading] = useState(false);
  const [league, setLeague] = useState('Liga MX');
  const [customLeague, setCustomLeague] = useState('');
  const [matchTitle, setMatchTitle] = useState('');
  const [selection, setSelection] = useState('');
  const [oddsInput, setOddsInput] = useState('');
  const [stake, setStake] = useState('100');
  const [comment, setComment] = useState('');

  // Estados para imagen/captura de pantalla
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Procesamiento de Momios en tiempo real
  const { decimal: parsedOdds, isDreamer } = parseOddsInput(oddsInput);
  const parsedStake = parseFloat(stake) || 0;

  // Cálculos de Ganancias
  const potentialReturnVal = parsedStake * parsedOdds;
  const netProfitVal = Math.max(0, potentialReturnVal - parsedStake);

  const potentialReturn = parsedOdds > 0 && parsedStake > 0 ? potentialReturnVal.toFixed(2) : '0.00';
  const netProfit = parsedOdds > 0 && parsedStake > 0 ? netProfitVal.toFixed(2) : '0.00';

  const resetForm = () => {
    setMatchTitle('');
    setSelection('');
    setOddsInput('');
    setStake('100');
    setComment('');
    setLeague('Liga MX');
    setCustomLeague('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedOdds <= 1) {
      alert('Ingresa un momio o cuota válida mayor a 1.00 (ej. +150 o 1.85)');
      return;
    }

    if (parsedStake <= 0) {
      alert('Ingresa un monto de apuesta válido.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Debes iniciar sesión para publicar un pronóstico.');
        setLoading(false);
        return;
      }

      const selectedLeague = league === 'Otra' ? customLeague.trim() : league;

      // SUBIR IMAGEN A SUPABASE STORAGE (SI EXISTE)
      let imageUrl: string | null = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`;
          const filePath = `ticket-screenshots/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('ticket-screenshots')
            .upload(filePath, imageFile);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('ticket-screenshots')
              .getPublicUrl(filePath);
            imageUrl = publicUrlData.publicUrl;
          } else {
            imageUrl = imagePreview;
          }
        } catch {
          imageUrl = imagePreview;
        }
      }

      // INSERTAR TICKET EN SUPABASE
      const { error } = await supabase.from('tickets').insert([
        {
          user_id: user.id,
          league: selectedLeague || 'Liga General',
          match_title: matchTitle.trim() || 'Ticket de Apuesta',
          selection: selection.trim() || (isDreamer ? '🚀 Parlay Soñador' : 'Ver Pronóstico'),
          odds: parsedOdds,
          stake: parsedStake,
          potential_payout: parseFloat(potentialReturn),
          comment: comment.trim() || null,
          image_url: imageUrl,
          status: 'PENDING',
          is_dreamer: isDreamer
        }
      ]);

      if (error) throw error;

      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert('Error al publicar el pick: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      {/* Contenedor Principal */}
      <div className="bg-[#0F141C] border border-emerald-500/20 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Luz ambiental sutil */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Publicar Pronóstico</h2>
              <p className="text-[11px] text-gray-400 font-medium">Comparte tu visión o boleto real con la comunidad</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl bg-gray-800/40 hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BANNER DE TRANSPARENCIA */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed relative z-10">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-300 block mb-0.5">Política de Juego Limpio</span>
            La cuota y selección ingresadas deben coincidir exactamente con las de tu boleto. Picks alterados serán anulados por la administración.
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs relative z-10">
          
          {/* Ligas Selector */}
          <div className="space-y-2">
            <label className="text-gray-300 font-extrabold flex items-center gap-1.5 text-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Torneo / Liga
            </label>
            
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_LEAGUES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLeague(item)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                    league === item
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'bg-[#161C26] text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLeague('Otra')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                  league === 'Otra'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#161C26] text-gray-400 border-gray-800 hover:border-gray-700'
                }`}
              >
                + Otra
              </button>
            </div>

            {league === 'Otra' && (
              <input
                type="text"
                placeholder="Nombre de la liga..."
                value={customLeague}
                onChange={(e) => setCustomLeague(e.target.value)}
                required
                className="w-full mt-2 bg-[#161C26] border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            )}
          </div>

          {/* Encuentro y Selección */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Partido / Evento
              </label>
              <input
                type="text"
                value={matchTitle}
                onChange={(e) => setMatchTitle(e.target.value)}
                placeholder="Ej. Santos vs América"
                required
                className="w-full bg-[#161C26] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-semibold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Tu Selección
              </label>
              <input
                type="text"
                value={selection}
                onChange={(e) => setSelection(e.target.value)}
                placeholder="Ej. Ambos Anotan"
                required
                className="w-full bg-[#161C26] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-semibold text-xs"
              />
            </div>
          </div>

          {/* Cuota / Momio & Stake */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Momio / Cuota
                </span>
                {isDreamer && (
                  <span className="text-[9px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                    <Rocket className="w-2.5 h-2.5" /> SOÑADOR
                  </span>
                )}
              </label>
              <input
                type="text"
                value={oddsInput}
                onChange={(e) => setOddsInput(e.target.value)}
                placeholder="Ej. +250 o 1.85"
                required
                className="w-full bg-[#161C26] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Stake / Monto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono font-black">$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  placeholder="100"
                  required
                  className="w-full bg-[#161C26] border border-gray-800 rounded-xl p-2.5 pl-7 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta de Ganancia Estimada */}
          <div className="bg-gradient-to-r from-[#141B26] via-[#18202E] to-[#141B26] border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between shadow-inner">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono font-extrabold text-gray-400 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Ganancia Estimada {parsedOdds > 0 && `(@${parsedOdds.toFixed(2)})`}
              </span>
              <div className="text-emerald-400 font-mono font-black text-sm sm:text-base tracking-tight">
                +${netProfit} <span className="text-[10px] text-emerald-500 font-semibold">MXN</span>
              </div>
            </div>

            <div className="text-right border-l border-gray-800 pl-4">
              <span className="text-[10px] text-gray-400 block font-medium">Retorno Total</span>
              <span className="text-xs font-mono font-bold text-gray-200">
                ${potentialReturn} MXN
              </span>
            </div>
          </div>

          {/* Carga Opcional de Captura / Ticket */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-400" /> Adjuntar Captura del Boleto (Opcional)
            </label>
            <div className="border border-dashed border-gray-800 hover:border-emerald-500/50 rounded-2xl p-2.5 bg-[#161C26] text-center cursor-pointer transition relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {imagePreview ? (
                <div className="relative inline-block w-full">
                  <img src={imagePreview} alt="Preview" className="max-h-32 rounded-xl border border-gray-800 mx-auto object-contain" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition z-20 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 py-1 text-gray-400">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-gray-300">Sube aquí la imagen legible de tu apuesta</span>
                </div>
              )}
            </div>
          </div>

          {/* Justificación */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-bold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Análisis / Comentario (Opcional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Por qué te gusta este pronóstico?"
              className="w-full bg-[#161C26] border border-gray-800 rounded-xl p-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none font-medium text-xs"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/3 bg-[#161C26] hover:bg-gray-800 text-gray-400 border border-gray-800 font-bold py-3 rounded-xl transition text-xs cursor-pointer active:scale-95"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>Publicar Pick</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}