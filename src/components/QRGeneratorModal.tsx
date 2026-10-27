import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { PetReport } from '../types/pet';
import { ZONAS_SAN_SALVADOR } from '../data/colonias';
import { 
  X, 
  Download, 
  Printer, 
  QrCode as QrIcon, 
  Check, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  RefreshCw, 
  Share2, 
  Palette,
  Phone,
  ScanLine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPet?: PetReport | null;
}

type BadgeTheme = 'rose' | 'sky' | 'emerald' | 'lavender';

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialPet,
}) => {
  const [nombreMascota, setNombreMascota] = useState('');
  const [nombreDueña, setNombreDueña] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');
  const [colonia, setColonia] = useState(ZONAS_SAN_SALVADOR[0].nombre);
  const [notasMedicas, setNotasMedicas] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<BadgeTheme>('rose');
  
  // Estado que indica si la persona ya completó y generó la insignia
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  
  // Estado para la animación de creación del código QR
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [animationCount, setAnimationCount] = useState<number>(0);
  const badgeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPet) {
      setNombreMascota(initialPet.nombre);
      setNombreDueña(initialPet.nombreContacto);
      const clean = initialPet.telefonoContacto.replace(/\D/g, '');
      setTelefonoEmergencia(clean.startsWith('503') ? clean.slice(3) : clean);
      setColonia(initialPet.colonia);
      setNotasMedicas(initialPet.notas || 'Esterilizado(a) y dócil. Si me encuentras por favor escribe a mi familia.');
      setHasGenerated(true);
    } else {
      // Iniciar formulario vacío y esperar que el usuario ingrese toda la información antes de generar
      setNombreMascota('');
      setNombreDueña('');
      setTelefonoEmergencia('');
      setColonia(ZONAS_SAN_SALVADOR[0].nombre);
      setNotasMedicas('');
      setQrDataUrl('');
      setHasGenerated(false);
    }
  }, [initialPet, isOpen]);

  // Validación de que la persona completó toda la información requerida
  const cleanPhoneDigits = telefonoEmergencia.replace(/\D/g, '');
  const hasValidPhone = cleanPhoneDigits.length >= 8;
  const isFormComplete = Boolean(
    nombreMascota.trim().length > 0 && 
    nombreDueña.trim().length > 0 && 
    hasValidPhone
  );

  // Disparar animación de generación del código QR
  const triggerGenerateAnimation = () => {
    if (!isFormComplete) return;

    setIsGenerating(true);
    setGenerationStep(1);

    const fullPhone = cleanPhoneDigits.startsWith('503') ? cleanPhoneDigits : `503${cleanPhoneDigits}`;
    const rescueText = `¡Hola ${nombreDueña}! Escaneé la insignia Busca Huella de tu mascota ${nombreMascota} en ${colonia}. La acabo de encontrar y está bien.`;
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(rescueText)}`;

    // Paso 2: Generar matriz QR
    setTimeout(() => {
      setGenerationStep(2);
      QRCode.toDataURL(waUrl, {
        width: 340,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => {
          setQrDataUrl(url);
          setHasGenerated(true);
          // Paso 3: Completado con revelación
          setTimeout(() => {
            setGenerationStep(3);
            setTimeout(() => {
              setIsGenerating(false);
              setAnimationCount((prev) => prev + 1);
            }, 650);
          }, 350);
        })
        .catch((err) => {
          console.error('Error generando QR', err);
          setIsGenerating(false);
        });
    }, 450);
  };

  // Si ya estaba generada y cambia algún dato estando completo, regenerar
  useEffect(() => {
    if (hasGenerated && isFormComplete && !isGenerating) {
      const fullPhone = cleanPhoneDigits.startsWith('503') ? cleanPhoneDigits : `503${cleanPhoneDigits}`;
      const rescueText = `¡Hola ${nombreDueña}! Escaneé la insignia Busca Huella de tu mascota ${nombreMascota} en ${colonia}.`;
      const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(rescueText)}`;
      QRCode.toDataURL(waUrl, {
        width: 340,
        margin: 1,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      }).then((url) => setQrDataUrl(url));
    }
  }, [nombreMascota, nombreDueña, telefonoEmergencia, colonia, notasMedicas]);

  if (!isOpen) return null;

  const fullPhone = cleanPhoneDigits.startsWith('503') ? cleanPhoneDigits : `503${cleanPhoneDigits}`;

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `insignia-qr-${nombreMascota.toLowerCase().replace(/\s+/g, '-')}-buscahuella.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const rescueText = `¡Hola ${nombreDueña}! Escaneé la insignia Busca Huella de tu mascota ${nombreMascota} en San Salvador.`;
    const link = `https://wa.me/503${cleanPhoneDigits}?text=${encodeURIComponent(rescueText)}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Paletas de temas pasteles tiernos
  const themeStyles = {
    rose: {
      bg: 'bg-linear-to-b from-rose-50 via-pink-50 to-amber-50',
      border: 'border-rose-200',
      tagBg: 'text-rose-600 bg-rose-100/60',
      ringColor: 'border-rose-300 bg-rose-400',
      highlight: 'text-rose-600',
      accentBtn: 'bg-rose-500 hover:bg-rose-600 text-white',
    },
    sky: {
      bg: 'bg-linear-to-b from-sky-50 via-blue-50 to-teal-50',
      border: 'border-sky-200',
      tagBg: 'text-sky-700 bg-sky-100/60',
      ringColor: 'border-sky-300 bg-sky-400',
      highlight: 'text-sky-700',
      accentBtn: 'bg-sky-600 hover:bg-sky-700 text-white',
    },
    emerald: {
      bg: 'bg-linear-to-b from-emerald-50 via-teal-50 to-amber-50',
      border: 'border-emerald-200',
      tagBg: 'text-emerald-700 bg-emerald-100/60',
      ringColor: 'border-emerald-300 bg-emerald-400',
      highlight: 'text-emerald-700',
      accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    lavender: {
      bg: 'bg-linear-to-b from-purple-50 via-pink-50 to-slate-50',
      border: 'border-purple-200',
      tagBg: 'text-purple-700 bg-purple-100/60',
      ringColor: 'border-purple-300 bg-purple-400',
      highlight: 'text-purple-700',
      accentBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  };

  const currentTheme = themeStyles[badgeTheme];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div 
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-[#fffdfa] rounded-3xl max-w-3xl w-full border border-rose-100 shadow-2xl overflow-hidden my-4 relative"
      >
        {/* Cabecera */}
        <div className="px-6 py-4 bg-linear-to-r from-rose-50/90 via-pink-50/70 to-amber-50/80 border-b border-rose-100/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white shadow-2xs border border-rose-200/70 flex items-center justify-center text-rose-500 font-bold text-base">
              🐾
            </div>
            <div>
              <h2 className="font-fredoka text-lg font-bold text-slate-800 tracking-tight leading-tight">
                Generador de Insignia Digital QR
              </h2>
              <p className="text-xs text-slate-500">
                Placa para collar con enlace directo a tu WhatsApp
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Dos columnas: Formulario a la izquierda y Vista Previa de la Placa a la derecha */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[82vh] overflow-y-auto">
          {/* Formulario de Datos */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de tu Mascota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nombreMascota}
                onChange={(e) => setNombreMascota(e.target.value)}
                placeholder="Ej. Caramelo, Rocky, Luna..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Dueña / Contacto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nombreDueña}
                onChange={(e) => setNombreDueña(e.target.value)}
                placeholder="Nombre"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp / Teléfono de Emergencia (El Salvador) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">+503</span>
                <input
                  type="tel"
                  value={telefonoEmergencia}
                  onChange={(e) => setTelefonoEmergencia(e.target.value)}
                  placeholder="7XXX-XXXX (8 dígitos)"
                  className="w-full pl-14 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colonia / Municipio de Residencia (San Salvador)
              </label>
              <select
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer shadow-2xs"
              >
                {ZONAS_SAN_SALVADOR.map((col) => (
                  <option key={col.id} value={col.nombre}>
                    {col.nombre} ({col.municipio})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instrucciones / Cuidados de Salud (Opcional)
              </label>
              <textarea
                rows={2}
                value={notasMedicas}
                onChange={(e) => setNotasMedicas(e.target.value)}
                placeholder="Ej. Esterilizado, toma medicamento, muy dócil..."
                className="w-full px-3 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none shadow-2xs"
              />
            </div>

            {/* Selector de color pastel de la placa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>Estilo Pastel de la Placa:</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { id: 'rose', label: 'Rosa', color: 'bg-rose-200 border-rose-400 text-rose-800' },
                    { id: 'sky', label: 'Celeste', color: 'bg-sky-200 border-sky-400 text-sky-800' },
                    { id: 'emerald', label: 'Menta', color: 'bg-emerald-200 border-emerald-400 text-emerald-800' },
                    { id: 'lavender', label: 'Lavanda', color: 'bg-purple-200 border-purple-400 text-purple-800' },
                  ] as const
                ).map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    type="button"
                    onClick={() => {
                      setBadgeTheme(theme.id);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      badgeTheme === theme.id
                        ? `${theme.color} ring-2 ring-offset-1 ring-slate-400 shadow-xs`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{theme.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* BOTÓN PRINCIPAL: Generar la insignia tras completar los datos */}
            <div className="pt-2">
              <motion.button
                type="button"
                whileHover={isFormComplete ? { scale: 1.02 } : {}}
                whileTap={isFormComplete ? { scale: 0.94 } : {}}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={triggerGenerateAnimation}
                disabled={!isFormComplete || isGenerating}
                className={`w-full py-3 px-4 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all ${
                  isFormComplete
                    ? 'bg-linear-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Animando Creación de QR...</span>
                  </>
                ) : hasGenerated ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Actualizar Insignia QR</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar y Crear Placa QR</span>
                  </>
                )}
              </motion.button>

              {!isFormComplete && (
                <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/70 mt-2 text-center font-medium">
                  Por favor ingresa el nombre de tu mascota, tu nombre y tu teléfono (8 dígitos) para habilitar la creación de la placa.
                </p>
              )}
            </div>

            {/* Acciones de Descarga e Impresión (visibles únicamente una vez generada la placa) */}
            {hasGenerated && qrDataUrl && (
              <div className="pt-2 flex flex-col gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={handleDownloadQR}
                  className={`w-full min-h-[42px] px-4 py-2 ${currentTheme.accentBtn} text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all`}
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Descargar Código QR (PNG)</span>
                </motion.button>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={handlePrint}
                    className="min-h-[40px] px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Placa</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onClick={handleCopyLink}
                    className="min-h-[40px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <span>Copiar Enlace</span>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Vista Previa de la Placa Tierna Pastel */}
          <div className="flex flex-col items-center justify-center">
            {hasGenerated && qrDataUrl ? (
              <motion.div
                key={`${badgeTheme}-${animationCount}`}
                ref={badgeCardRef}
                initial={{ scale: 0.92, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className={`w-full max-w-[290px] p-5 rounded-3xl ${currentTheme.bg} text-slate-800 shadow-xl border-2 ${currentTheme.border} flex flex-col items-center text-center relative overflow-hidden`}
              >
                {/* Aro para collar de la placa */}
                <div className="w-5 h-5 rounded-full border-2 border-rose-300 bg-white absolute top-2 left-1/2 -translate-x-1/2 flex items-center justify-center shadow-2xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentTheme.ringColor}`}></div>
                </div>

                <div className={`mt-4 text-[10px] tracking-widest uppercase font-mono ${currentTheme.highlight} font-extrabold flex items-center gap-1`}>
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>BUSCA HUELLA · PLACA DIGITAL</span>
                </div>

                <h3 className="font-fredoka text-2xl font-bold mt-0.5 tracking-tight text-slate-800">
                  {nombreMascota}
                </h3>

                <div className="text-[11px] text-slate-600 font-medium">
                  Dueña: <strong>{nombreDueña}</strong> ({colonia})
                </div>

                {/* CONTENEDOR DEL QR CON ANIMACIÓN DE ESCANEO LÁSER Y REVELACIÓN */}
                <div className="relative my-3 p-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden min-h-[160px] min-w-[160px]">
                  
                  {/* Visualizador QR */}
                  <motion.div
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: isGenerating ? 0.9 : 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="relative"
                  >
                    <img
                      src={qrDataUrl}
                      alt={`Insignia QR de ${nombreMascota}`}
                      className="w-36 h-36 rounded-lg block"
                    />

                    {/* Logo/Icono de Huellita en el Centro del QR para toque tierno */}
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-md border-2 border-rose-300 flex items-center justify-center text-xs">
                      🐾
                    </div>
                  </motion.div>

                  {/* OVERLAY DE ANIMACIÓN DE CREACIÓN LÁSER */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 z-10"
                      >
                        {/* Haz de luz láser de escaneo animado */}
                        <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-laser-scan" />

                        {/* Radar circular pulsante */}
                        <motion.div
                          animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0.9, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-14 h-14 rounded-full border-2 border-rose-400 bg-rose-100/40 flex items-center justify-center mb-2"
                        >
                          <ScanLine className="w-6 h-6 text-rose-600 animate-pulse" />
                        </motion.div>

                        {/* Texto de progreso dinámico animado */}
                        <motion.span 
                          key={generationStep}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[11px] font-bold text-rose-700 text-center"
                        >
                          {generationStep === 1 && '⚡ Codificando datos...'}
                          {generationStep === 2 && '✨ Generando matriz QR...'}
                          {generationStep === 3 && '🎉 ¡Insignia lista!'}
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Efecto de chispas al terminar */}
                  {!isGenerating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                      <Sparkles className="w-16 h-16 text-amber-400" />
                    </motion.div>
                  )}
                </div>

                {/* Teléfono formateado */}
                <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-rose-500" />
                  <span>WhatsApp:</span>
                  <span className="font-mono tabular-nums text-slate-800">+{fullPhone}</span>
                </div>

                {notasMedicas && (
                  <p className="text-[10px] text-slate-500 mt-2 px-1 leading-tight line-clamp-2 italic">
                    "{notasMedicas}"
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-rose-200/80 w-full text-[9px] text-rose-700 font-bold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Escanea con cualquier cámara para avisar a la dueña</span>
                </div>
              </motion.div>
            ) : (
              /* ESTADO DE ESPERA: Cuando aún no se ha ingresado toda la información */
              <div className="w-full max-w-[290px] p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 mb-3">
                  <QrIcon className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="font-fredoka text-base font-bold text-slate-700 mb-1">
                  Insignia en Espera
                </h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Ingresa los datos requeridos a la izquierda y pulsa <strong>"Generar y Crear Placa QR"</strong> para crear la insignia digital.
                </p>

                {/* Checklist de requisitos completados en vivo */}
                <div className="w-full bg-white p-3 rounded-2xl border border-slate-200/70 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    {nombreMascota.trim() ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={nombreMascota.trim() ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      Nombre de la mascota
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {nombreDueña.trim() ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={nombreDueña.trim() ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      Nombre de la dueña o tutor
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasValidPhone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span className={hasValidPhone ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                      Teléfono WhatsApp (8 dígitos)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {hasGenerated && (
              <div className="mt-3 text-center print:hidden space-y-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Placa digital generada con éxito</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Plastifica esta insignia y colócala en el collar para una recuperación inmediata.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
