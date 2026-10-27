import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OwnerAccount } from '../types/pet';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  X, 
  Stethoscope,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface InitialLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: OwnerAccount) => void;
  existingAccounts: OwnerAccount[];
}

const PRESET_AVATARS = ['🐾', '🐕', '🐈', '🦜', '🐰', '🦁', '⭐', '❤️'];

export const InitialLoginModal: React.FC<InitialLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  existingAccounts,
}) => {
  const [mode, setMode] = useState<'register' | 'select'>(
    existingAccounts.length > 0 ? 'select' : 'register'
  );

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [municipio, setMunicipio] = useState('Apopa');
  const [colonia, setColonia] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [avatarEmoji, setAvatarEmoji] = useState('🐾');
  const [isVetClinic, setIsVetClinic] = useState(false);
  const [licenciaVet, setLicenciaVet] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUrl(reader.result);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const cleanTel = telefono.replace(/\D/g, '');
    if (cleanTel.length < 8) {
      setError('Ingresa un número telefónico o WhatsApp de El Salvador válido (8 dígitos).');
      return;
    }

    if (!colonia.trim()) {
      setError('Por favor escribe tu colonia o sector de residencia.');
      return;
    }

    if (isVetClinic && !licenciaVet.trim()) {
      setError('Por favor ingresa tu número de colegiado o registro veterinario (JVPMV).');
      return;
    }

    const newUser: OwnerAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: cleanTel,
      colonia: colonia.trim(),
      municipio: municipio.trim(),
      fotoUrl: fotoUrl || undefined,
      avatarEmoji,
      esVeterinaria: isVetClinic,
      licenciaVeterinaria: isVetClinic ? licenciaVet.trim() : undefined,
      nombreClinica: isVetClinic ? nombre.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    onLoginSuccess(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="bg-[#fffdfa] rounded-3xl max-w-xl w-full border border-rose-200 shadow-2xl overflow-hidden my-4"
      >
        {/* Cabecera con bienvenida */}
        <div className="px-6 py-5 bg-linear-to-r from-rose-100/90 via-pink-50/70 to-amber-50/70 border-b border-rose-100 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white text-rose-500 shadow-sm flex items-center justify-center text-2xl mx-auto mb-2 border border-rose-200/80">
            🐾
          </div>
          <h2 className="font-fredoka text-2xl font-bold text-slate-800 tracking-tight">
            Bienvenido a Busca Huella
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto font-medium">
            Inicia sesión o crea tu perfil para publicar alertas, gestionar tus mascotas y conectar con la comunidad de tu zona.
          </p>
        </div>

        {/* Selector de modo si ya hay cuentas previas en este dispositivo */}
        {existingAccounts.length > 0 && (
          <div className="px-6 pt-3 flex border-b border-rose-100 bg-white">
            <button
              type="button"
              onClick={() => setMode('select')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'select'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Cuentas en este dispositivo ({existingAccounts.length})
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'register'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              + Nueva Cuenta / Registrarse
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* VISTA 1: SELECCIONAR CUENTA GUARDADA PREVIAMENTE */}
          {mode === 'select' && existingAccounts.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Selecciona tu perfil para ingresar directamente:
              </p>

              <div className="space-y-2.5">
                {existingAccounts.map((acc) => (
                  <motion.div
                    key={acc.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onLoginSuccess(acc)}
                    className="p-3.5 bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      {acc.fotoUrl ? (
                        <img
                          src={acc.fotoUrl}
                          alt={acc.nombre}
                          className="w-12 h-12 rounded-xl object-cover border border-rose-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
                          {acc.avatarEmoji || '🐾'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors">
                            {acc.nombre}
                          </span>
                          {acc.esVeterinaria && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Veterinaria
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {acc.colonia}, {acc.municipio} · +503 {acc.telefono}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Entrar
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  ¿Quieres crear una cuenta con otros datos o ubicación? Haz clic aquí
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: FORMULARIO DE INICIO DE SESIÓN / REGISTRO */}
          {mode === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* SECCIÓN DE FOTO DE PERFIL / AVATAR */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt="Foto de perfil"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-rose-300 text-rose-500 flex items-center justify-center text-3xl shadow-xs">
                      {avatarEmoji}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs hover:bg-rose-600 transition-colors cursor-pointer"
                    title="Subir foto de perfil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Foto de Perfil del Tutor o Clínica
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sube una fotografía desde tu teléfono/computadora o elige tu avatar favorito.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{fotoUrl ? 'Cambiar foto' : 'Subir foto'}</span>
                    </button>

                    {fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                      >
                        Quitar foto
                      </button>
                    )}
                  </div>

                  {/* Avatares rápidos si no sube foto */}
                  {!fotoUrl && (
                    <div className="flex items-center gap-1 pt-1 justify-center sm:justify-start">
                      <span className="text-[10px] text-slate-400 font-medium">O elige un emoji:</span>
                      {PRESET_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setAvatarEmoji(emoji)}
                          className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                            avatarEmoji === emoji ? 'bg-rose-200 scale-110' : 'hover:bg-rose-100'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CAMPOS DE DATOS PERSONALES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Nombre"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@correo.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp / Celular Salvadoreño *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">+503</span>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="7XXX-XXXX"
                      className="w-full pl-14 pr-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Municipio *
                  </label>
                  <select
                    value={municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Apopa">Apopa</option>
                    <option value="San Salvador">San Salvador</option>
                    <option value="Mejicanos">Mejicanos</option>
                    <option value="Soyapango">Soyapango</option>
                    <option value="Santa Tecla">Santa Tecla</option>
                    <option value="Nejapa">Nejapa</option>
                    <option value="Ilopango">Ilopango</option>
                    <option value="Delgado">Ciudad Delgado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Colonia o Sector donde resides *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={colonia}
                      onChange={(e) => setColonia(e.target.value)}
                      placeholder="Ej. Centro de Apopa, Popotlán, Chintuc, Madre Tierra, Escalón..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* AVISO IMPORTANTE DE UBICACIÓN Y FILTRADO POR ZONA */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Privacidad y Relevancia Local:</strong> Al ingresar, solo verás las publicaciones y alertas de mascotas perdidas y encontradas pertenecientes a tu zona ({municipio}). Las demás opciones de la app (rutas a veterinarias, mapa interactivo, placas QR y guías) estarán habilitadas para cualquier lugar de El Salvador.
                </p>
              </div>

              {/* OPCIÓN: CUENTA DE VETERINARIA / ESPECIALISTA */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={isVetClinic}
                    onChange={(e) => setIsVetClinic(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-400"
                  />
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Soy Médico Veterinario o Clínica Veterinaria Colegiada</span>
                  </div>
                </label>
                <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                  Permite publicar mascotas en adopción responsable con sello médico y certificación sanitaria oficial de El Salvador.
                </p>

                {isVetClinic && (
                  <div className="pl-6 pt-1">
                    <label className="block font-bold text-blue-900 mb-1">
                      Número de Colegiado / Registro Sanitario (JVPMV) *
                    </label>
                    <input
                      type="text"
                      required={isVetClinic}
                      value={licenciaVet}
                      onChange={(e) => setLicenciaVet(e.target.value)}
                      placeholder="Ej. JVPMV # 1482 / Registro Sanitario MAG"
                      className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* BOTÓN DE ENTRADA */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="w-full min-h-[46px] py-2.5 px-6 rounded-2xl bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Ingresar a Busca Huella</span>
                </motion.button>
              </div>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};
