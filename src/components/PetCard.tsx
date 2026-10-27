import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetReport, OwnerAccount } from '../types/pet';
import { formatDistance } from '../utils/geo';
import { 
  MessageCircle, 
  MapPin, 
  QrCode, 
  Share2, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Navigation,
  Flag,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface PetCardProps {
  report: PetReport;
  distanceKm?: number;
  onFocusOnMap: (report: PetReport) => void;
  onOpenQR: (report: PetReport) => void;
  onOpenProfile: (report: PetReport) => void;
  onRouteToPet?: (report: PetReport) => void;
  onReportFake?: (reportId: string, reason: string) => void;
  onMarkResolved?: (reportId: string) => void;
  onDeleteReport?: (reportId: string) => void;
  currentUser?: OwnerAccount | null;
}

export const PetCard: React.FC<PetCardProps> = ({
  report,
  distanceKm,
  onFocusOnMap,
  onOpenQR,
  onOpenProfile,
  onRouteToPet,
  onReportFake,
  onMarkResolved,
  onDeleteReport,
  currentUser,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagSubmitted, setFlagSubmitted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Formateo del teléfono para El Salvador
  const cleanPhone = report.telefonoContacto.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('503') ? cleanPhone : `503${cleanPhone}`;
  
  const waMessage = report.tipo === 'perdido'
    ? `Hola ${report.nombreContacto}, vi en Busca Huella que buscas a ${report.nombre} en ${report.colonia}. Tengo información sobre su paradero.`
    : `Hola ${report.nombreContacto}, vi en Busca Huella que encontraste una mascota en ${report.colonia}. Creo que podría ser mía o de un vecino.`;

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleShare = async () => {
    const shareText = `Alerta Busca Huella: ${report.tipo === 'perdido' ? 'Mascota Perdida' : 'Mascota Encontrada'} - ${report.nombre} en ${report.colonia}. Contacto: +${waNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Busca Huella - ${report.nombre}`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // Ignorar cancelación
      }
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFlagAsFake = (reason: string) => {
    if (onReportFake) {
      onReportFake(report.id, reason);
    }
    setFlagSubmitted(true);
    setIsFlagging(false);
  };

  const isPerdido = report.tipo === 'perdido';
  const isAuthor = currentUser && (
    report.autorId === currentUser.id ||
    report.nombreContacto.toLowerCase() === currentUser.nombre.toLowerCase()
  );

  return (
    <motion.article 
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-rose-200/90 transition-all overflow-hidden flex flex-col justify-between group"
    >
      <div>
        {/* Fotografía principal con tags limpios no invasivos */}
        <div className="relative aspect-16/11 w-full bg-slate-100 overflow-hidden">
          {!imageError ? (
            <img
              src={report.fotoUrl}
              alt={`${report.nombre} - ${report.raza}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-400">
              <AlertCircle className="w-8 h-8 mb-1 stroke-[1.5]" />
              <span className="text-xs font-semibold text-slate-600">{report.nombre}</span>
            </div>
          )}

          {/* Estado de alerta */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-xs backdrop-blur-md ${
                isPerdido
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isPerdido ? 'Buscada' : 'En Resguardo'}
            </span>

            {report.tieneRecompensa && report.montoRecompensa && (
              <span className="inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 shadow-xs">
                ${report.montoRecompensa} Recompensa
              </span>
            )}
          </div>

          {/* Distancia GPS si está disponible */}
          {distanceKm !== undefined && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs shadow-2xs">
                <Navigation className="w-2.5 h-2.5 text-sky-400" />
                <span>a {formatDistance(distanceKm)} de ti</span>
              </span>
            </div>
          )}
        </div>

        {/* Notificación si fue reportado */}
        {flagSubmitted && (
          <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Reporte enviado a moderación.</span>
          </div>
        )}

        {/* Modal desplegable de denuncia de falso */}
        <AnimatePresence>
          {isFlagging && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-rose-50/95 border-b border-rose-200 text-xs space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span>¿Por qué es sospechoso el reporte?</span>
                <button 
                  onClick={() => setIsFlagging(false)} 
                  className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => handleFlagAsFake('Foto descargada de internet')}
                  className="px-2 py-1 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-800 text-[10px] font-medium text-left cursor-pointer"
                >
                  Foto no original
                </button>
                <button
                  onClick={() => handleFlagAsFake('Teléfono inválido')}
                  className="px-2 py-1 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-800 text-[10px] font-medium text-left cursor-pointer"
                >
                  Teléfono falso
                </button>
                <button
                  onClick={() => handleFlagAsFake('Ya recuperada')}
                  className="px-2 py-1 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-800 text-[10px] font-medium text-left cursor-pointer"
                >
                  Ya fue resuelto
                </button>
                <button
                  onClick={() => handleFlagAsFake('Spam o broma')}
                  className="px-2 py-1 bg-white hover:bg-rose-100 rounded-lg border border-rose-200 text-rose-800 text-[10px] font-medium text-left cursor-pointer"
                >
                  Spam / Broma
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Información del animal con tipografía limpia y ordenada */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-fredoka text-lg font-bold text-slate-800 truncate tracking-tight">
              {report.nombre}
            </h3>
            <span className="text-[11px] font-bold text-rose-600 capitalize shrink-0">
              {report.especie}
            </span>
          </div>

          {/* Metadatos en texto limpio con separadores sutiles (sin píldoras estáticas) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{report.raza}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{report.color}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="capitalize">{report.sexo}</span>
          </div>

          {/* Ubicación y zona */}
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">
              {report.colonia}{report.municipio ? `, ${report.municipio}` : ''}
            </span>
          </div>

          {/* Tutor y código */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div>
              <span>
                Tutor: <strong className="text-slate-700 font-semibold">{report.nombreContacto}</strong>
              </span>
              {report.autorNombre && (
                <span className="block text-[10px] text-slate-400">
                  Cuenta: <span className="font-semibold text-slate-600">{report.autorNombre}</span>
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {report.insigniaId ? `ID: ${report.insigniaId}` : report.codigoReporte}
            </span>
          </div>

          {/* Notas o descripción breve */}
          {report.notas && (
            <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50/80 p-2 rounded-xl border border-slate-100">
              "{report.notas}"
            </p>
          )}
        </div>
      </div>

      {/* Barra de Acciones Ordenada y Equilibrada */}
      <div className="p-4 pt-0 space-y-2">
        {/* Botón Principal WhatsApp */}
        <motion.a
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[42px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>Contactar por WhatsApp (+{waNumber})</span>
        </motion.a>

        {/* Fila secundaria de utilidades: Ver Ficha, Placa QR y Difundir */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onOpenProfile(report)}
            className="flex-1 min-h-[36px] px-3 py-1.5 bg-rose-50/70 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center justify-center gap-1.5 border border-rose-200/80 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Ver Ficha</span>
          </button>

          <button
            onClick={() => onOpenQR(report)}
            className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Crear Placa QR para collar"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Compartir reporte"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {isAuthor && onDeleteReport && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-9 h-9 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Borrar mi publicación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pie de tarjeta con herramientas comunitarias discretas */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => setIsFlagging(!isFlagging)}
            className="hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
            title="Reportar información falsa o sin foto comprobable"
          >
            <Flag className="w-3 h-3" />
            <span>Reportar</span>
          </button>

          {onMarkResolved && (
            <button
              onClick={() => onMarkResolved(report.id)}
              className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
              title="Marcar mascota como resuelta"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>¿Ya en casa?</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmación para borrar publicación */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full border border-rose-200 shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  ¿Borrar publicación?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  ¿Deseas eliminar la alerta de <strong>{report.nombre}</strong>? Esta acción la removerá de Busca Huella.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    if (onDeleteReport) onDeleteReport(report.id);
                  }}
                  className="px-3 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Sí, borrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
