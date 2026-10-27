import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PET_CARE_GUIDES } from '../data/guides';
import { PetCareGuide } from '../types/pet';
import { 
  BookOpen, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  Lightbulb, 
  Search,
  HeartPulse,
  Flame,
  Bandage,
  Pill,
  Syringe,
  PhoneCall
} from 'lucide-react';

export const GuidesSection: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return PET_CARE_GUIDES.filter((g) => {
      if (selectedCat !== 'todos' && g.categoria !== selectedCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.titulo.toLowerCase().includes(q);
        const matchResumen = g.resumen.toLowerCase().includes(q);
        const matchPasos = g.pasos.some((p) => p.toLowerCase().includes(q));
        const matchConsejo = g.consejoClave.toLowerCase().includes(q);
        return matchTitle || matchResumen || matchPasos || matchConsejo;
      }
      return true;
    });
  }, [selectedCat, searchQuery]);

  const firstAidGuidesCount = PET_CARE_GUIDES.filter((g) => g.categoria === 'primeros_auxilios').length;

  return (
    <div className="space-y-6">
      {/* Cabecera de la sección pastel y tierna */}
      <div className="p-6 bg-linear-to-r from-amber-50/80 via-rose-50/60 to-purple-50/60 rounded-3xl border border-amber-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-rose-700 text-xs font-bold border border-rose-200 mb-2 shadow-2xs">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Manual Médico de Primeros Auxilios & Bienestar Animal</span>
          </div>
          <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Guías Técnicas y Primeros Auxilios Básicos
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Protocolos veterinarios paso a paso para salvar la vida de tu mascota ante asfixia, intoxicación, hemorragias o golpes de calor mientras te trasladas al hospital de urgencias.
          </p>
        </div>

        {/* Resumen de guías activas */}
        <div className="p-4 bg-white/90 rounded-2xl border border-amber-100 shadow-2xs flex flex-col items-center text-center shrink-0 min-w-[170px]">
          <span className="font-fredoka text-3xl font-bold text-rose-600 font-mono tabular-nums">
            {firstAidGuidesCount}
          </span>
          <span className="text-xs font-bold text-slate-700 mt-0.5">Protocolos de Auxilio</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            100% Verificados para El Salvador
          </span>
        </div>
      </div>

      {/* Banner de Urgencias y Primeros Auxilios Rápidos */}
      <div className="p-4 bg-linear-to-r from-rose-500 via-rose-600 to-pink-600 text-white rounded-3xl shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <h3 className="font-fredoka font-bold text-sm sm:text-base">
              ¿Tu mascota está en una emergencia crítica en este momento?
            </h3>
          </div>
          <a
            href="tel:195"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-rose-700 text-xs font-bold shadow-xs hover:bg-rose-50 transition-colors w-fit shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Llamar al Call Center Chivo Pets (195)</span>
          </a>
        </div>
        <p className="text-[11px] sm:text-xs text-rose-100">
          Aplica los primeros auxilios de contención que encontrarás a continuación y traslada de inmediato al paciente sin perder tiempo.
        </p>
      </div>

      {/* Controles de búsqueda y filtros con animaciones táctiles */}
      <div className="bg-white p-4 rounded-3xl border border-amber-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por síntoma (asfixia, veneno, sangre, calor, rcp, medicamentos)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#fdfbf7] border border-amber-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
            />
          </div>

          {/* Filtros de Categoría */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-50/60 rounded-2xl border border-amber-100/80">
            {[
              { id: 'todos', label: 'Todas las Guías' },
              { id: 'primeros_auxilios', label: '🚑 Primeros Auxilios' },
              { id: 'busqueda_extravio', label: '🔍 Extravío' },
              { id: 'salud_vacunas', label: '💉 Vacunación' },
              { id: 'adopcion_responsable', label: '🐶 Adopción' },
            ].map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Guías Técnicas y Primeros Auxilios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((guide) => {
          const isFirstAid = guide.categoria === 'primeros_auxilios';

          return (
            <article
              key={guide.id}
              className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                isFirstAid
                  ? 'border-rose-100 hover:border-rose-300'
                  : 'border-slate-200/80 hover:border-amber-200'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className={`font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full ${
                    isFirstAid ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {guide.categoria === 'primeros_auxilios' ? '🚑 Primeros Auxilios' : guide.categoria.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {guide.tiempoLectura}
                  </span>
                </div>

                <h3 className="font-fredoka text-lg font-bold text-slate-800 leading-snug">
                  {guide.titulo}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {guide.resumen}
                </p>

                {/* Pasos de acción detallados */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Protocolo de actuación paso a paso:
                  </span>
                  <div className="space-y-2">
                    {guide.pasos.map((paso, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-[#fdfbf7] p-2.5 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{paso}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consejo Clave Destacado */}
                <div className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${
                  isFirstAid
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}>
                  <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${isFirstAid ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div>
                    <strong className="block text-[11px] uppercase tracking-wide font-extrabold">
                      Regla de Oro:
                    </strong>
                    <span className="leading-relaxed">{guide.consejoClave}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-amber-200">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No se encontraron guías con ese término</h3>
          <p className="text-xs text-slate-500 mt-1">Prueba buscando palabras como "veneno", "calor", "asfixia", "sangre" o "botiquín".</p>
          <button
            onClick={() => {
              setSelectedCat('todos');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
          >
            Ver todos los protocolos
          </button>
        </div>
      )}
    </div>
  );
};
