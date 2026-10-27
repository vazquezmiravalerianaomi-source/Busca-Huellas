import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OwnerAccount, PetReport } from '../types/pet';
import { 
  X, 
  User, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Camera, 
  Upload, 
  LogOut,
  ChevronRight,
  Stethoscope,
  Sparkles
} from 'lucide-react';

interface OwnerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: OwnerAccount | null;
  allAccounts: OwnerAccount[];
  allReports: PetReport[];
  onSelectAccount: (account: OwnerAccount) => void;
  onRegisterAccount: (data: {
    nombre: string;
    email: string;
    telefono: string;
    colonia: string;
    municipio?: string;
    fotoUrl?: string;
    avatarEmoji?: string;
  }) => void;
  onUpdateProfile: (updates: Partial<OwnerAccount>) => void;
  onLogout: () => void;
  onDeleteReport: (reportId: string) => void;
  onOpenReportModal: () => void;
}

export const OwnerAccountModal: React.FC<OwnerAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allAccounts,
  allReports,
  onSelectAccount,
  onRegisterAccount,
  onUpdateProfile,
  onLogout,
  onDeleteReport,
  onOpenReportModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'perfil' | 'cambiar' | 'nueva'>('perfil');
  const [reportToDelete, setReportToDelete] = useState<PetReport | null>(null);

  // Formulario de edición rápida de perfil
  const [editMode, setEditMode] = useState(false);
  const [editNombre, setEditNombre] = useState(currentUser?.nombre || '');
  const [editTelefono, setEditTelefono] = useState(currentUser?.telefono || '');
  const [editColonia, setEditColonia] = useState(currentUser?.colonia || '');
  const [editMunicipio, setEditMunicipio] = useState(currentUser?.municipio || 'Apopa');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formulario de nuevo dueño
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevaColonia, setNuevaColonia] = useState('');
  const [nuevoMunicipio, setNuevoMunicipio] = useState('Apopa');
  const [nuevoFotoUrl, setNuevoFotoUrl] = useState('');
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Filtrar las publicaciones que pertenecen a este dueño específico
  const misPublicaciones = allReports.filter(
    (r) => r.autorId === currentUser.id || r.nombreContacto.toLowerCase() === currentUser.nombre.toLowerCase()
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({ fotoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNuevoFotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre.trim()) return;

    onUpdateProfile({
      nombre: editNombre.trim(),
      telefono: editTelefono.replace(/\D/g, ''),
      colonia: editColonia.trim(),
      municipio: editMunicipio,
    });
    setEditMode(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nuevoNombre.trim() || !nuevoEmail.trim()) {
      setFormError('Por favor completa tu nombre y correo.');
      return;
    }

    const cleanTel = nuevoTelefono.replace(/\D/g, '');
    if (cleanTel.length < 8) {
      setFormError('Ingresa un teléfono o WhatsApp salvadoreño válido (8 dígitos).');
      return;
    }

    if (!nuevaColonia.trim()) {
      setFormError('Indica tu colonia o zona de residencia en Apopa / San Salvador.');
      return;
    }

    onRegisterAccount({
      nombre: nuevoNombre.trim(),
      email: nuevoEmail.trim(),
      telefono: cleanTel,
      colonia: nuevaColonia.trim(),
      municipio: nuevoMunicipio,
      fotoUrl: nuevoFotoUrl || undefined,
    });

    setSuccessMsg('¡Cuenta creada exitosamente!');
    setNuevoNombre('');
    setNuevoEmail('');
    setNuevoTelefono('');
    setNuevaColonia('');
    setNuevoFotoUrl('');
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveSubTab('perfil');
    }, 1500);
  };

  const handleConfirmDelete = () => {
    if (reportToDelete) {
      onDeleteReport(reportToDelete.id);
      setReportToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fffdfa] rounded-3xl max-w-2xl w-full border border-rose-100 shadow-2xl overflow-hidden my-4 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del modal de cuenta */}
        <div className="px-6 py-4 bg-linear-to-r from-rose-50/80 via-pink-50/60 to-amber-50/60 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-white shadow-2xs flex items-center justify-center text-rose-500 font-bold text-base border border-rose-200/60">
              👤
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Mi Perfil y Gestión de Cuenta
              </h2>
              <p className="text-xs text-slate-500">
                Configura tu foto, zona de residencia y administra tus publicaciones
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

        {/* Pestañas internas de navegación */}
        <div className="px-6 pt-3 border-b border-rose-100/70 bg-white flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('perfil')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'perfil'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Mi Perfil & Mis Publicaciones ({misPublicaciones.length})
            </button>
            <button
              onClick={() => setActiveSubTab('cambiar')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'cambiar'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Cambiar Cuenta ({allAccounts.length})
            </button>
            <button
              onClick={() => setActiveSubTab('nueva')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeSubTab === 'nueva'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              + Nueva Cuenta
            </button>
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="pb-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            title="Cerrar sesión actual"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Contenido de pestañas */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* VISTA 1: MI PERFIL Y MIS PUBLICACIONES */}
          {activeSubTab === 'perfil' && (
            <div className="space-y-6">
              {/* Tarjeta del Dueño Activo con Foto de Perfil */}
              <div className="p-4 bg-linear-to-br from-white via-rose-50/30 to-amber-50/40 rounded-2xl border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* FOTO DE PERFIL CON BOTÓN DE SUBIDA */}
                  <div className="relative group shrink-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    {currentUser.fotoUrl ? (
                      <img
                        src={currentUser.fotoUrl}
                        alt={currentUser.nombre}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-300 shadow-xs"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-rose-400 to-pink-500 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                        {currentUser.avatarEmoji || '🐾'}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Cambiar foto de perfil"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-800">
                        {currentUser.nombre}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Sesión Activa
                      </span>
                      {currentUser.esVeterinaria && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-blue-600" />
                          Veterinaria Autorizada
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {currentUser.email}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        +503 {currentUser.telefono}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-bold mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{currentUser.colonia}, {currentUser.municipio || 'Apopa'} (Tu Zona)</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditNombre(currentUser.nombre);
                      setEditTelefono(currentUser.telefono);
                      setEditColonia(currentUser.colonia);
                      setEditMunicipio(currentUser.municipio || 'Apopa');
                      setEditMode(!editMode);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {editMode ? 'Cancelar Edición' : 'Editar Datos'}
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReportModal();
                    }}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publicar Mascota</span>
                  </button>
                </div>
              </div>

              {/* FORMULARIO DE EDICIÓN EN LÍNEA */}
              {editMode && (
                <form onSubmit={handleSaveProfile} className="p-4 bg-white rounded-2xl border border-rose-200 space-y-3 text-xs shadow-xs">
                  <h4 className="font-bold text-slate-800">Actualizar información de perfil:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Nombre</label>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">WhatsApp (+503)</label>
                      <input
                        type="tel"
                        value={editTelefono}
                        onChange={(e) => setEditTelefono(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Municipio</label>
                      <select
                        value={editMunicipio}
                        onChange={(e) => setEditMunicipio(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Apopa">Apopa</option>
                        <option value="San Salvador">San Salvador</option>
                        <option value="Mejicanos">Mejicanos</option>
                        <option value="Soyapango">Soyapango</option>
                        <option value="Santa Tecla">Santa Tecla</option>
                        <option value="Nejapa">Nejapa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Colonia o Sector</label>
                      <input
                        type="text"
                        value={editColonia}
                        onChange={(e) => setEditColonia(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-2xs"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}

              {/* SECCIÓN: MIS PUBLICACIONES (Con botón de borrar) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-500" />
                      <span>Mis Publicaciones Activas ({misPublicaciones.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Gestiona o elimina las alertas registradas con tu cuenta
                    </p>
                  </div>
                </div>

                {misPublicaciones.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                    <p className="text-xs text-slate-500">
                      No tienes mascotas reportadas actualmente bajo la cuenta de <strong>{currentUser.nombre}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenReportModal();
                      }}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publicar Alerta con Foto y GPS</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-rose-100 bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden">
                    {misPublicaciones.map((pet) => (
                      <div key={pet.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 hover:bg-rose-50/30 transition-colors">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img
                            src={pet.fotoUrl}
                            alt={pet.nombre}
                            className="w-12 h-12 rounded-xl object-cover border border-rose-100 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">{pet.nombre}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pet.tipo === 'perdido' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {pet.tipo === 'perdido' ? 'Buscada' : 'En Resguardo'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {pet.raza} · {pet.color} · {pet.colonia}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Publicado el {pet.fecha} · Código: {pet.codigoReporte}
                            </span>
                          </div>
                        </div>

                        {/* Botón de borrar publicación */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => setReportToDelete(pet)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Eliminar permanentemente esta publicación"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Borrar publicación</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA 2: CAMBIAR DE CUENTA */}
          {activeSubTab === 'cambiar' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Selecciona una cuenta existente para publicar o gestionar mascotas bajo la identidad de ese dueño:
              </div>

              <div className="space-y-2.5">
                {allAccounts.map((account) => {
                  const isCurrent = account.id === currentUser.id;
                  const count = allReports.filter(
                    (r) => r.autorId === account.id || r.nombreContacto.toLowerCase() === account.nombre.toLowerCase()
                  ).length;

                  return (
                    <motion.div
                      key={account.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelectAccount(account);
                        setActiveSubTab('perfil');
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {account.fotoUrl ? (
                          <img
                            src={account.fotoUrl}
                            alt={account.nombre}
                            className="w-11 h-11 rounded-xl object-cover border border-rose-200"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                            {account.avatarEmoji || '🐾'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{account.nombre}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                                Actual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {account.email} · +503 {account.telefono} · {account.colonia}, {account.municipio}
                          </p>
                          <span className="text-[11px] font-semibold text-rose-600">
                            {count} {count === 1 ? 'mascota reportada' : 'mascotas reportadas'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className={`w-5 h-5 ${isCurrent ? 'text-rose-500' : 'text-slate-400'}`} />
                    </motion.div>
                  );
                })}
              </div>

              <div className="pt-3 text-center">
                <button
                  onClick={() => setActiveSubTab('nueva')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                >
                  ¿No encuentras tu cuenta? Registra una cuenta nueva aquí
                </button>
              </div>
            </div>
          )}

          {/* VISTA 3: REGISTRAR NUEVA CUENTA CON SUBIDA DE FOTO */}
          {activeSubTab === 'nueva' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                Crea tu propia cuenta de dueño con tu foto de perfil y tu zona específica de residencia para filtrar alertas de tu sector.
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Subir foto para la nueva cuenta */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <input
                  ref={newFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNewAvatarUpload}
                  className="hidden"
                />
                {nuevoFotoUrl ? (
                  <img
                    src={nuevoFotoUrl}
                    alt="Nueva foto"
                    className="w-14 h-14 rounded-xl object-cover border border-rose-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => newFileInputRef.current?.click()}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {nuevoFotoUrl ? 'Cambiar foto' : 'Subir foto de perfil'}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">Opcional. Formatos JPG o PNG.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombre completo del dueño *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Nombre"
                    className="w-full px-3.5 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={nuevoEmail}
                    onChange={(e) => setNuevoEmail(e.target.value)}
                    placeholder="usuario@correo.com"
                    className="w-full px-3.5 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    WhatsApp / Celular salvadoreño *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">+503</span>
                    <input
                      type="tel"
                      required
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      placeholder="7XXX-XXXX"
                      className="w-full pl-14 pr-3 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Municipio *
                  </label>
                  <select
                    value={nuevoMunicipio}
                    onChange={(e) => setNuevoMunicipio(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer font-bold"
                  >
                    <option value="Apopa">Apopa</option>
                    <option value="San Salvador">San Salvador</option>
                    <option value="Mejicanos">Mejicanos</option>
                    <option value="Soyapango">Soyapango</option>
                    <option value="Santa Tecla">Santa Tecla</option>
                    <option value="Nejapa">Nejapa</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Colonia o Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaColonia}
                    onChange={(e) => setNuevaColonia(e.target.value)}
                    placeholder="Ej. Centro de Apopa, Popotlán, El Rosal"
                    className="w-full px-3.5 py-2 bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('perfil')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Crear mi Cuenta</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* DIÁLOGO MODAL DE CONFIRMACIÓN PARA BORRAR PUBLICACIÓN */}
        <AnimatePresence>
          {reportToDelete && (
            <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-md w-full border border-rose-200 shadow-2xl p-6 space-y-4 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
                  <Trash2 className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    ¿Borrar esta publicación permanentemente?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Estás a punto de eliminar la alerta de <strong>{reportToDelete.nombre}</strong> ({reportToDelete.colonia}). Esta acción la removerá de la base de datos de Busca Huella.
                  </p>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-[11px] text-rose-700 flex items-center gap-2 text-left">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Esta acción es irreversible y eliminará el reporte y su ficha técnica.</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportToDelete(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    No, Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Sí, Borrar Alerta
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
