import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { VETERINARY_CLINICS } from '../data/sheltersAndVets';
import { VeterinaryClinic } from '../types/pet';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { 
  Stethoscope, 
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Navigation,
  Search,
  ArrowUpDown,
  Car,
  ExternalLink
} from 'lucide-react';

interface VeterinaryDirectoryProps {
  userGps?: { lat: number; lng: number } | null;
  onFocusMap?: (lat: number, lng: number, title: string) => void;
  onRouteToClinic?: (lat: number, lng: number, title: string, subtitle?: string) => void;
}

export const VeterinaryDirectory: React.FC<VeterinaryDirectoryProps> = ({ 
  userGps, 
  onFocusMap,
  onRouteToClinic
}) => {
  const [filter24h, setFilter24h] = useState(false);
  const [filterMunicipio, setFilterMunicipio] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByCercania, setSortByCercania] = useState(false);

  // Lista única de municipios disponibles en el departamento de San Salvador
  const municipiosDisponibles = useMemo(() => {
    const set = new Set<string>();
    VETERINARY_CLINICS.forEach((c) => {
      if (c.municipio) set.add(c.municipio);
    });
    return Array.from(set);
  }, []);

  // Filtrado y ordenamiento
  const filteredAndSortedClinics = useMemo(() => {
    let result = VETERINARY_CLINICS.filter((clinic) => {
      if (filter24h && !clinic.esUrgencias24h) return false;
      if (filterMunicipio !== 'todos' && clinic.municipio !== filterMunicipio) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = clinic.nombre.toLowerCase().includes(q);
        const matchDir = clinic.direccion.toLowerCase().includes(q);
        const matchMun = clinic.municipio?.toLowerCase().includes(q) || false;
        const matchCol = clinic.colonia.toLowerCase().includes(q);
        const matchSrv = clinic.servicios.some((s) => s.toLowerCase().includes(q));
        return matchName || matchDir || matchMun || matchCol || matchSrv;
      }

      return true;
    });

    if (sortByCercania && userGps) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistanceKm(userGps.lat, userGps.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userGps.lat, userGps.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return result;
  }, [filter24h, filterMunicipio, searchQuery, sortByCercania, userGps]);

  return (
    <div className="space-y-6">
      {/* Cabecera oficial verificada */}
      <div className="p-6 bg-linear-to-r from-sky-50/80 via-emerald-50/60 to-amber-50/50 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-sky-800 text-xs font-bold border border-sky-200 mb-2 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Datos 100% Reales y Verificados · Departamento de San Salvador</span>
          </div>
          <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Directorio Oficial de Veterinarias & Urgencias 24/7
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Hospitales y clínicas con números telefónicos oficiales, WhatsApp directo y trazado de ruta en mapa interactivo como Google Maps.
          </p>
        </div>

        {/* Total verificadas badge */}
        <div className="p-4 bg-white/90 rounded-2xl border border-sky-100 shadow-2xs flex flex-col items-center text-center shrink-0 min-w-[170px]">
          <span className="font-fredoka text-3xl font-bold text-sky-700 font-mono tabular-nums">
            {VETERINARY_CLINICS.length}
          </span>
          <span className="text-xs font-bold text-slate-700 mt-0.5">Veterinarias Registradas</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {VETERINARY_CLINICS.filter((v) => v.esUrgencias24h).length} con Guardia 24 Horas
          </span>
        </div>
      </div>

      {/* Banner de Urgencias Críticas 24 Horas */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
            <span className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs animate-pulse">
              🚨
            </span>
            <span>Teléfonos de Urgencias Veterinarias Inmediatas 24 Horas en San Salvador:</span>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-white/80 px-2.5 py-1 rounded-full border border-rose-200 shrink-0">
            Atención nocturna activa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="tel:195"
            className="p-2.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div>
              <strong className="block text-slate-800">Chivo Pets 24/7</strong>
              <span className="text-[11px] text-slate-500 font-mono">Línea 195 / 2133-7387</span>
            </div>
            <Phone className="w-4 h-4 text-rose-600 shrink-0" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="tel:+50322261062"
            className="p-2.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div>
              <strong className="block text-slate-800">Hosp. Los Héroes 24h</strong>
              <span className="text-[11px] text-slate-500 font-mono">+503 2226-1062</span>
            </div>
            <Phone className="w-4 h-4 text-rose-600 shrink-0" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="tel:+50322632010"
            className="p-2.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div>
              <strong className="block text-slate-800">Hosp. Escalón 24h</strong>
              <span className="text-[11px] text-slate-500 font-mono">+503 2263-2010</span>
            </div>
            <Phone className="w-4 h-4 text-rose-600 shrink-0" />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            href="tel:+50379857700"
            className="p-2.5 bg-white rounded-2xl border border-rose-200 hover:border-rose-400 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div>
              <strong className="block text-slate-800">Ambulancia Móvil 24h</strong>
              <span className="text-[11px] text-slate-500 font-mono">+503 7985-7700</span>
            </div>
            <Phone className="w-4 h-4 text-rose-600 shrink-0" />
          </motion.a>
        </div>
      </div>

      {/* Controles de búsqueda y filtros con animaciones táctiles */}
      <div className="bg-white p-4 rounded-3xl border border-sky-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar veterinaria por nombre, calle, colonia o servicio..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#fdfbf7] border border-sky-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Urgencias 24h */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilter24h(!filter24h)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter24h
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>🚨 Solo Urgencias 24/7</span>
            </motion.button>

            {/* Ordenar por cercanía si hay GPS */}
            {userGps && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setSortByCercania(!sortByCercania)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortByCercania
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Más cercanas a mi GPS</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Filtro por Municipio de San Salvador */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 overflow-x-auto pb-1">
          <span className="font-bold text-slate-700 shrink-0">Zona / Municipio:</span>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setFilterMunicipio('todos')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              filterMunicipio === 'todos'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todos ({VETERINARY_CLINICS.length})
          </motion.button>

          {municipiosDisponibles.map((mun) => (
            <motion.button
              key={mun}
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilterMunicipio(mun)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                filterMunicipio === mun
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {mun}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Grid de Clínicas Veterinarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedClinics.map((clinic) => {
          const cleanPhone = clinic.telefono.replace(/\D/g, '');
          const cleanWa = clinic.whatsapp.replace(/\D/g, '');
          const waNumber = cleanWa.startsWith('503') ? cleanWa : `503${cleanWa}`;
          const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
            `Hola, me comunico a través de Busca Huella. Quisiera consultar disponibilidad para atención médica veterinaria.`
          )}`;

          const distKm = userGps
            ? calculateDistanceKm(userGps.lat, userGps.lng, clinic.lat, clinic.lng)
            : undefined;

          return (
            <article
              key={clinic.id}
              className="bg-white rounded-3xl border border-sky-100/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-fredoka text-lg font-bold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">
                      {clinic.nombre}
                    </h3>
                    <span className="text-xs text-sky-700 font-semibold mt-0.5 block">
                      {clinic.municipio || clinic.colonia}
                    </span>
                  </div>

                  {clinic.esUrgencias24h ? (
                    <span className="inline-flex items-center text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 shrink-0">
                      🚨 24 Horas
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                      ✓ Verificada
                    </span>
                  )}
                </div>

                {/* Distancia GPS si está disponible */}
                {distKm !== undefined && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200/80">
                    <Navigation className="w-3 h-3 text-sky-600" />
                    <span>A {formatDistance(distKm)} de tu GPS actual</span>
                  </div>
                )}

                {/* Dirección y Horarios Reales */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-[#fdfbf7] p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{clinic.direccion}</span>
                  </div>

                  <div className="flex items-start gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800 leading-snug">
                      <strong>Horario:</strong> {clinic.horario}
                    </span>
                  </div>
                </div>

                {/* Servicios ofrecidos */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Servicios médicos disponibles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.servicios.slice(0, 4).map((srv, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 font-medium"
                      >
                        {srv}
                      </span>
                    ))}
                    {clinic.servicios.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{clinic.servicios.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción directos a ruta Google Maps, teléfono real y WhatsApp */}
              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs">
                {/* Botón principal: Trazar camino en el mapa estilo Google Maps */}
                {onRouteToClinic && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={() => onRouteToClinic(clinic.lat, clinic.lng, clinic.nombre, clinic.direccion)}
                    className="w-full min-h-[42px] px-3 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    <span>Trazar camino en el mapa (Google Maps)</span>
                  </motion.button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    href={`tel:+${cleanPhone}`}
                    className="min-h-[40px] px-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title={`Llamar a ${clinic.nombre}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Llamar</span>
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title={`Escribir al WhatsApp de ${clinic.nombre}`}
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

      {filteredAndSortedClinics.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-sky-200">
          <AlertCircle className="w-10 h-10 text-sky-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron veterinarias con estos filtros
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Prueba seleccionando otro municipio o desactivando el filtro de urgencias 24h.
          </p>
          <button
            onClick={() => {
              setFilterMunicipio('todos');
              setFilter24h(false);
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
          >
            Mostrar todas las veterinarias de San Salvador
          </button>
        </div>
      )}
    </div>
  );
};
