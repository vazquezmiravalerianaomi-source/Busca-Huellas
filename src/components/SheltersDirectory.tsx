import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SHELTERS_APOPA } from '../data/sheltersAndVets';
import { ShelterCenter } from '../types/pet';
import { 
  Home, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Clock, 
  Heart, 
  CheckCircle2, 
  Package, 
  Users, 
  Navigation,
  ShieldCheck 
} from 'lucide-react';

interface SheltersDirectoryProps {
  onFocusMap?: (lat: number, lng: number, title: string) => void;
}

export const SheltersDirectory: React.FC<SheltersDirectoryProps> = ({ onFocusMap }) => {
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  const filteredShelters = SHELTERS_APOPA.filter((s) => {
    if (filterTipo === 'todos') return true;
    return s.tipo === filterTipo;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado pastel con entidades oficiales */}
      <div className="p-6 bg-linear-to-r from-rose-50/80 via-purple-50/60 to-amber-50/60 rounded-3xl border border-rose-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-purple-700 text-xs font-bold border border-purple-200 mb-2 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Refugios y Fundaciones Oficialmente Registradas · El Salvador</span>
          </div>
          <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Directorio de Refugios Oficiales y Santuarios de Rescate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Asociaciones y fundaciones sin fines de lucro con personería jurídica y albergues verificados. Puedes coordinar adopciones, voluntariado o entrega de donaciones de alimento y medicinas.
          </p>
        </div>

        {/* Filtros de Tipo */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/95 rounded-2xl border border-rose-100 shrink-0 shadow-2xs">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilterTipo('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTipo === 'todos' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({SHELTERS_APOPA.length})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilterTipo('refugio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTipo === 'refugio' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refugios
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilterTipo('asociacion')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTipo === 'asociacion' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fundaciones
          </motion.button>
        </div>
      </div>

      {/* Grid de Refugios Oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelters.map((shelter) => {
          const cleanPhone = shelter.telefono.replace(/\D/g, '');
          const cleanWa = shelter.whatsapp.replace(/\D/g, '');
          const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
            `Hola ${shelter.nombre}, me comunico a través de Busca Huella para coordinar apoyo/donaciones o consultar sobre rescate.`
          )}`;

          return (
            <article
              key={shelter.id}
              className="bg-white rounded-3xl border border-purple-100/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0 text-xl font-bold">
                      🏠
                    </div>
                    <div>
                      <h3 className="font-fredoka text-base font-bold text-slate-800 leading-snug">
                        {shelter.nombre}
                      </h3>
                      <span className="text-[11px] text-purple-600 font-bold capitalize">
                        {shelter.tipo === 'asociacion' ? 'Fundación Oficial' : 'Refugio Registrado'}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Oficial
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {shelter.descripcion}
                </p>

                {/* Datos de contacto y ubicación */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-purple-50 bg-[#fdfbf7] p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{shelter.direccion} (<strong>{shelter.colonia}</strong>)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{shelter.horario}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Capacidad: <strong className="text-slate-800">{shelter.capacidad}</strong></span>
                  </div>
                </div>

                {/* Necesidades Actuales / Donaciones */}
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                  <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    Necesidades prioritarias para donaciones:
                  </span>
                  <ul className="space-y-1 text-xs text-amber-950">
                    {shelter.necesidadesActuales.map((nec, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{nec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botones de Contacto Oficial por WhatsApp y Teléfono */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2">
                {onFocusMap && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFocusMap(shelter.lat, shelter.lng, shelter.nombre)}
                    className="w-full min-h-[38px] px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
                  >
                    <Navigation className="w-3.5 h-3.5 text-purple-600" />
                    <span>Ver ubicación en Mapa</span>
                  </motion.button>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    href={`tel:+${cleanPhone}`}
                    className="min-h-[38px] px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Llamar</span>
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[38px] px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                    <span>WhatsApp</span>
                  </motion.a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
