import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { PetReport } from '../types/pet';
import { formatDistance } from '../utils/geo';
import { 
  X, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Heart, 
  QrCode, 
  Share2, 
  Download, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Sparkles,
  Syringe,
  FileText,
  Navigation,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { OwnerAccount } from '../types/pet';

interface PetProfileModalProps {
  pet: PetReport | null;
  distanceKm?: number;
  isOpen: boolean;
  onClose: () => void;
  onFocusMap?: (pet: PetReport) => void;
  onDeleteReport?: (reportId: string) => void;
  currentUser?: OwnerAccount | null;
}

export const PetProfileModal: React.FC<PetProfileModalProps> = ({
  pet,
  distanceKm,
  isOpen,
  onClose,
  onFocusMap,
  onDeleteReport,
  currentUser,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!pet) return;

    const cleanPhone = pet.telefonoContacto.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('503') ? cleanPhone : `503${cleanPhone}`;
    const badgeText = `¡Hola ${pet.nombreContacto}! Escaneé la insignia Busca Huella de tu mascota ${pet.nombre} (${pet.colonia}). La tengo conmigo o la acabo de ver.`;
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(badgeText)}`;

    QRCode.toDataURL(waUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [pet]);

  if (!isOpen || !pet) return null;

  const cleanPhone = pet.telefonoContacto.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('503') ? cleanPhone : `503${cleanPhone}`;
  const callUrl = `tel:+${fullPhone}`;
  const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(
    `Hola ${pet.nombreContacto}, me comunico a través del perfil oficial de Busca Huella referente a ${pet.nombre}.`
  )}`;

  const handleShare = () => {
    const text = `Perfil de Mascota en Busca Huella: ${pet.nombre} (${pet.colonia}). Dueña: ${pet.nombreContacto}. WhatsApp: +${fullPhone}`;
    if (navigator.share) {
      navigator.share({ title: `Busca Huella - ${pet.nombre}`, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `insignia-qr-${pet.nombre.toLowerCase()}-buscahuella.png`;
    a.click();
  };

  const isPerdido = pet.tipo === 'perdido';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fffdfa] rounded-3xl max-w-2xl w-full border border-rose-100 shadow-2xl overflow-hidden my-4 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabecera tierna y técnica */}
        <div className="px-6 py-4 bg-linear-to-r from-rose-50/80 via-amber-50/60 to-emerald-50/70 border-b border-rose-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-rose-500 font-bold text-sm">
              🐾
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">
                  Ficha Técnica & Insignia Busca Huella
                </h2>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/80 text-slate-600 border border-slate-200/80">
                  {pet.insigniaId || pet.codigoReporte}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Perfil de identificación con enlace directo al tutor responsable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido en dos columnas adaptativas */}
        <div className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Banner Principal de la Mascota */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-white p-4 rounded-2xl border border-rose-100/70 shadow-xs">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-rose-50 shrink-0 border-2 border-rose-100 shadow-xs relative">
              <img
                src={pet.fotoUrl}
                alt={pet.nombre}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute bottom-1.5 left-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isPerdido ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isPerdido ? 'Extraviado' : 'En Resguardo'}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {pet.nombre}
                </h3>
                <span className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
                  {pet.especie} · {pet.sexo}
                </span>
              </div>

              {/* Atributos técnicos limpios */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 my-2">
                <span className="font-medium text-slate-800">{pet.raza}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{pet.color}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{pet.colonia}</span>
                {distanceKm !== undefined && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-sky-700 font-bold inline-flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-sky-500 inline" />
                      A {formatDistance(distanceKm)} de tu GPS
                    </span>
                  </>
                )}
              </div>

              {/* Badges de salud preventiva */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Vacunas al día
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-medium border border-sky-100">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  Esterilizado/a
                </span>
                {pet.microchipId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium border border-purple-100">
                    Chip: {pet.microchipId.slice(-6)}
                  </span>
                )}
              </div>

              {pet.tieneRecompensa && pet.montoRecompensa && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100/80 text-amber-900 font-bold text-xs border border-amber-200">
                  <span>Recompensa confirmada:</span>
                  <span className="font-mono text-sm">${pet.montoRecompensa} USD</span>
                </div>
              )}
            </div>
          </div>

          {/* PERFIL DEL TUTOR / DUEÑA */}
          <div className="bg-linear-to-br from-white via-rose-50/30 to-amber-50/30 p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  👤
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Perfil del Tutor / Dueña
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Contacto directo autorizado en caso de rescate o avistamiento
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Verificado Busca Huella
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/90 rounded-xl border border-rose-100">
                <span className="text-slate-400 block text-[11px]">Nombre de la Dueña:</span>
                <span className="font-bold text-slate-800 text-sm">{pet.nombreContacto}</span>
              </div>

              <div className="p-3 bg-white/90 rounded-xl border border-rose-100">
                <span className="text-slate-400 block text-[11px]">Zona de Residencia:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  {pet.colonia}
                </span>
              </div>
            </div>

            {/* BOTONES DIRECTOS AL CONTACTO DE LA DUEÑA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Escribir al WhatsApp (+{fullPhone})</span>
              </a>

              <a
                href={callUrl}
                className="min-h-[46px] px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar a la Dueña Ahora</span>
              </a>
            </div>
          </div>

          {/* Insignia QR para Collar y Lectura Rápida */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="p-2.5 bg-[#fdfbf7] rounded-2xl border border-rose-100 shadow-xs shrink-0 flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Insignia QR de ${pet.nombre}`}
                  className="w-36 h-36 rounded-lg block"
                />
              ) : (
                <div className="w-36 h-36 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Generando QR...
                </div>
              )}
              <span className="text-[10px] font-mono font-semibold text-slate-500 mt-1">
                {pet.insigniaId || 'INSIGNIA-QR'}
              </span>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-800">
                <QrCode className="w-4 h-4 text-rose-500" />
                <span>Insignia Digital para Colgar en Collar</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Este código QR redirige directamente a la pantalla de contacto y llamada hacia <strong>{pet.nombreContacto}</strong>. Puede ser escaneado con cualquier cámara de teléfono sin necesidad de descargar apps.
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <button
                  onClick={handleDownloadQR}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Descargar Placa (PNG)</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? '¡Enlace Copiado!' : 'Compartir Perfil'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cuidados Especiales y Notas Médicas */}
          {pet.notas && (
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs space-y-1">
              <span className="font-bold text-amber-900 block flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Instrucciones Técnicas de Salud y Comportamiento:
              </span>
              <p className="text-amber-800 leading-relaxed italic">
                "{pet.notas}"
              </p>
            </div>
          )}

          {/* Botón de Borrar Publicación (Solicitado por el usuario) */}
          {onDeleteReport && (
            <div className="pt-2 border-t border-rose-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                ¿Esta mascota ya regresó a casa o deseas retirar la alerta?
              </span>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Borrar publicación</span>
              </button>
            </div>
          )}

          {/* Modal de confirmación dentro de perfil */}
          {confirmDelete && (
            <div className="p-4 bg-rose-50/95 border-2 border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>¿Confirmas que deseas eliminar permanentemente esta publicación de Busca Huella?</span>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteReport) {
                      onDeleteReport(pet.id);
                    }
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-2xs cursor-pointer"
                >
                  Sí, eliminar alerta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
