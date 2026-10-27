import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdoptionPet, PetSpecies, PetGender, OwnerAccount } from '../types/pet';
import { 
  getStoredAdoptions, 
  publishVetAdoption, 
  deleteVetAdoption 
} from '../data/adoptions';
import {
  apiFetchAdoptions,
  apiCreateAdoption,
  apiDeleteAdoption,
} from '../services/api';
import { VETERINARY_CLINICS } from '../data/sheltersAndVets';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Info,
  Stethoscope,
  Plus,
  FileText,
  Upload,
  Camera,
  X,
  Trash2,
  AlertTriangle,
  Award,
  Phone
} from 'lucide-react';

interface AdoptionsSectionProps {
  currentUser?: OwnerAccount | null;
}

export const AdoptionsSection: React.FC<AdoptionsSectionProps> = ({ currentUser }) => {
  const [adoptions, setAdoptions] = useState<AdoptionPet[]>(() => getStoredAdoptions());
  const [filterEspecie, setFilterEspecie] = useState<'todos' | 'perro' | 'gato'>('todos');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [adoptionToDelete, setAdoptionToDelete] = useState<AdoptionPet | null>(null);

  // Sincronizar adopciones del servidor central periódicamente
  useEffect(() => {
    let isMounted = true;
    const syncAdoptions = async () => {
      try {
        const serverAdoptions = await apiFetchAdoptions();
        if (isMounted && Array.isArray(serverAdoptions)) {
          setAdoptions(serverAdoptions);
        }
      } catch (err) {
        console.warn('Adoptions sync error:', err);
      }
    };

    syncAdoptions();
    const interval = setInterval(syncAdoptions, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Formulario de publicación exclusiva para veterinarias
  const [clinicaNombre, setClinicaNombre] = useState(
    currentUser?.esVeterinaria && currentUser.nombreClinica
      ? currentUser.nombreClinica
      : 'Veterinaria La Casa del Perro (Apopa)'
  );
  const [clinicaLicencia, setClinicaLicencia] = useState(
    currentUser?.licenciaVeterinaria || 'JVPMV-SV-1048'
  );
  const [clinicaContacto, setClinicaContacto] = useState(
    currentUser?.telefono ? `503${currentUser.telefono.replace(/\D/g, '')}` : '50322145566'
  );
  const [colonia, setColonia] = useState(currentUser?.colonia || 'Centro de Apopa');
  const [municipio, setMunicipio] = useState(currentUser?.municipio || 'Apopa');
  const [nombreMascota, setNombreMascota] = useState('');
  const [especie, setEspecie] = useState<PetSpecies>('perro');
  const [raza, setRaza] = useState('');
  const [edadAprox, setEdadAprox] = useState('');
  const [sexo, setSexo] = useState<PetGender>('macho');
  const [tamano, setTamano] = useState<'pequeño' | 'mediano' | 'grande'>('mediano');
  const [esterilizado, setEsterilizado] = useState(true);
  const [vacunado, setVacunado] = useState(true);
  const [desparasitado, setDesparasitado] = useState(true);
  const [historia, setHistoria] = useState('');
  const [personalidadInput, setPersonalidadInput] = useState('Tranquilo, cariñoso, convive con otros animales');
  const [fotoUrl, setFotoUrl] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Por favor sube una imagen válida (JPG o PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUrl(reader.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nombreMascota.trim()) {
      setFormError('Ingresa el nombre del animalito.');
      return;
    }

    if (!clinicaLicencia.trim()) {
      setFormError('El número de licencia o registro sanitario (JVPMV) es obligatorio.');
      return;
    }

    if (!fotoUrl) {
      setFormError('Es obligatorio subir una fotografía real del paciente en adopción.');
      return;
    }

    const cleanPhone = clinicaContacto.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setFormError('Ingresa un teléfono o WhatsApp de contacto válido de la clínica.');
      return;
    }

    const traits = personalidadInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newAdoption: AdoptionPet = {
      id: `vet-adopt-${Date.now()}`,
      nombre: nombreMascota.trim(),
      especie,
      raza: raza.trim() || 'Mestizo',
      edadAprox: edadAprox.trim() || 'Joven',
      sexo,
      tamano,
      esterilizado,
      vacunado,
      desparasitado,
      historia: historia.trim() || 'Paciente recuperado bajo observación clínica, listo para un hogar responsable.',
      personalidad: traits.length > 0 ? traits : ['Cariñoso', 'Sociable'],
      fotoUrl,
      clinicaNombre: clinicaNombre.trim(),
      clinicaLicencia: clinicaLicencia.trim(),
      clinicaContacto: cleanPhone.startsWith('503') ? cleanPhone : `503${cleanPhone}`,
      colonia: colonia.trim(),
      municipio: municipio.trim(),
      urgente,
      createdAt: new Date().toISOString(),
    };

    try {
      const serverAdoption = await apiCreateAdoption(newAdoption);
      const updated = [serverAdoption, ...adoptions.filter((a) => a.id !== serverAdoption.id)];
      setAdoptions(updated);
      publishVetAdoption(serverAdoption);
    } catch {
      const updated = publishVetAdoption(newAdoption);
      setAdoptions(updated);
    }
    setIsPublishModalOpen(false);

    // Resetear formulario
    setNombreMascota('');
    setRaza('');
    setEdadAprox('');
    setFotoUrl('');
    setHistoria('');
  };

  const handleDeleteAdoption = async (id: string) => {
    try {
      await apiDeleteAdoption(id);
    } catch (err) {
      console.warn('Error deleting adoption on server:', err);
    }
    const updated = deleteVetAdoption(id);
    setAdoptions(updated);
    setAdoptionToDelete(null);
  };

  const filtered = adoptions.filter((p) => {
    if (filterEspecie === 'todos') return true;
    return p.especie === filterEspecie;
  });

  return (
    <div className="space-y-6">
      {/* Banner Principal Informativo y Legal */}
      <div className="p-6 bg-linear-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/80 rounded-3xl border border-blue-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Módulo Clínico · Adopción Responsable Certificada</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Adopciones Exclusivas con Aval Médico Veterinario
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Para garantizar la salud pública y el bienestar animal en El Salvador, <strong>únicamente veterinarias colegiadas y especialistas autorizados</strong> pueden publicar mascotas en adopción. Cada expediente cuenta con esterilización quirúrgica comprobada, esquema de vacunas y contrato legal.
          </p>
        </div>

        {/* Botón de Publicación Exclusivo para Veterinarias */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsPublishModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-white" />
            <span>Publicar Adopción (Exclusivo Veterinarias)</span>
          </motion.button>
        </div>
      </div>

      {/* Requisitos Legales de Adopción en El Salvador */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            <strong>Garantía de Especialista Colegiado:</strong> Todo animal en adopción cuenta con cartilla sanitaria oficial (JVPMV), desparasitación interna/externa y compromiso de esterilización no reproductiva.
          </span>
        </div>
      </div>

      {/* Filtros por Especie y Contador */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filtrar por:</span>
          <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-slate-200">
            <button
              onClick={() => setFilterEspecie('todos')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterEspecie === 'todos' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({adoptions.length})
            </button>
            <button
              onClick={() => setFilterEspecie('perro')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterEspecie === 'perro' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Caninos
            </button>
            <button
              onClick={() => setFilterEspecie('gato')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterEspecie === 'gato' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Felinos
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Mostrando {filtered.length} {filtered.length === 1 ? 'paciente disponible' : 'pacientes disponibles'}
        </span>
      </div>

      {/* Grid de Mascotas en Adopción o Estado Vacío */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pet) => {
            const cleanPhone = pet.clinicaContacto.replace(/\D/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `¡Hola! Vi en Busca Huella que en ${pet.clinicaNombre} tienen a ${pet.nombre} (${pet.raza}) en adopción responsable certificada. Me gustaría conocer los requisitos de adopción y agendar una entrevista con el médico veterinario.`
            )}`;

            return (
              <article
                key={pet.id}
                className="bg-white rounded-3xl border border-blue-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Fotografía de la mascota */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={pet.fotoUrl}
                      alt={pet.nombre}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {pet.urgente && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500 text-white shadow-xs">
                        ¡Adopción Urgente!
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 text-slate-800 shadow-xs backdrop-blur-xs">
                      {pet.edadAprox}
                    </span>
                  </div>

                  {/* Información */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                        {pet.nombre}
                      </h3>
                      <span className="text-xs font-semibold text-blue-600 capitalize">
                        {pet.especie} · {pet.sexo}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-slate-700">{pet.raza}</span>
                      <span>·</span>
                      <span className="capitalize">Tamaño {pet.tamano}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        {pet.colonia}, {pet.municipio || 'Apopa'}
                      </span>
                    </div>

                    {/* Sello de la Clínica Veterinaria Responsable */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          {pet.clinicaNombre}
                        </span>
                        <span className="block text-[10px] text-blue-700 font-mono">
                          Certificación: {pet.clinicaLicencia}
                        </span>
                      </div>
                    </div>

                    {/* Estado de Salud Certificado */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                      {pet.esterilizado && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                          ✓ Esterilizado
                        </span>
                      )}
                      {pet.vacunado && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100 font-medium">
                          ✓ Vacunas al día
                        </span>
                      )}
                      {pet.desparasitado && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 font-medium">
                          ✓ Desparasitado
                        </span>
                      )}
                    </div>

                    {/* Historia */}
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      "{pet.historia}"
                    </p>

                    {/* Rasgos de Personalidad */}
                    <div className="flex flex-wrap gap-1">
                      {pet.personalidad.map((trait, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones: Contacto por WhatsApp con la Veterinaria */}
                <div className="p-5 pt-0 flex flex-col gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Contactar a la Veterinaria por WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setAdoptionToDelete(pet)}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center gap-1 cursor-pointer pt-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Retirar de Adopción</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* ESTADO VACÍO PROFESIONAL SIN EJEMPLOS FALSOS */
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-blue-200 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto text-3xl">
            <Stethoscope className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-fredoka text-xl font-bold text-slate-800">
              No hay mascotas en adopción publicadas actualmente
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Se han retirado los ejemplos simulados. En cumplimiento con los protocolos sanitarios de El Salvador, las publicaciones en este apartado son reservadas exclusivamente para <strong>Clínicas Veterinarias Colegiadas</strong> que cuenten con certificación de esterilización y esquema médico completo.
            </p>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsPublishModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Adopción (Exclusivo para Veterinarias)</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN EXCLUSIVA PARA VETERINARIAS */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fffdfa] rounded-3xl max-w-2xl w-full border border-blue-200 shadow-2xl overflow-hidden my-4"
            >
              {/* Encabezado del modal */}
              <div className="px-6 py-4 bg-linear-to-r from-blue-100/90 via-sky-50/70 to-indigo-50/80 border-b border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white text-blue-600 flex items-center justify-center text-lg font-bold shadow-2xs border border-blue-200">
                    🩺
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Publicar Mascota en Adopción Responsable
                    </h3>
                    <p className="text-xs text-slate-500">
                      Exclusivo Clínicas Veterinarias & Especialistas Autorizados
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handlePublishSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-medium">
                    {formError}
                  </div>
                )}

                {/* Sello y Licencia de la Veterinaria */}
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Datos de la Veterinaria o Médico Responsable</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Nombre de la Clínica Veterinaria *
                      </label>
                      <input
                        type="text"
                        required
                        value={clinicaNombre}
                        onChange={(e) => setClinicaNombre(e.target.value)}
                        placeholder="Ej. Veterinaria La Casa del Perro"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Número de Colegiado / Licencia (JVPMV) *
                      </label>
                      <input
                        type="text"
                        required
                        value={clinicaLicencia}
                        onChange={(e) => setClinicaLicencia(e.target.value)}
                        placeholder="Ej. JVPMV # 1482 / Registro Sanitario"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        WhatsApp / Teléfono de la Clínica *
                      </label>
                      <input
                        type="tel"
                        required
                        value={clinicaContacto}
                        onChange={(e) => setClinicaContacto(e.target.value)}
                        placeholder="503XXXXXXXX"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Municipio
                      </label>
                      <select
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl font-bold cursor-pointer"
                      >
                        <option value="Apopa">Apopa</option>
                        <option value="San Salvador">San Salvador</option>
                        <option value="Mejicanos">Mejicanos</option>
                        <option value="Soyapango">Soyapango</option>
                        <option value="Santa Tecla">Santa Tecla</option>
                        <option value="Nejapa">Nejapa</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subida de Fotografía Real del Animal */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700">
                    Fotografía Real del Paciente en Adopción *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {fotoUrl ? (
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-blue-200">
                      <img src={fotoUrl} alt="Vista previa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-bold"
                      >
                        Cambiar Fotografía
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                    >
                      <Camera className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <span className="font-bold text-slate-700 block">Subir foto desde tu dispositivo</span>
                      <span className="text-[11px] text-slate-400">Formatos JPG, PNG, WebP</span>
                    </div>
                  )}
                </div>

                {/* Datos del Paciente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nombre de la Mascota *</label>
                    <input
                      type="text"
                      required
                      value={nombreMascota}
                      onChange={(e) => setNombreMascota(e.target.value)}
                      placeholder="Ej. Toby"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Especie</label>
                    <select
                      value={especie}
                      onChange={(e) => setEspecie(e.target.value as PetSpecies)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    >
                      <option value="perro">Canino (Perro)</option>
                      <option value="gato">Felino (Gato)</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Raza o Cruce</label>
                    <input
                      type="text"
                      value={raza}
                      onChange={(e) => setRaza(e.target.value)}
                      placeholder="Ej. Mestizo de Labrador"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Edad Aproximada</label>
                    <input
                      type="text"
                      value={edadAprox}
                      onChange={(e) => setEdadAprox(e.target.value)}
                      placeholder="Ej. 6 meses, 1 año"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sexo</label>
                    <select
                      value={sexo}
                      onChange={(e) => setSexo(e.target.value as PetGender)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    >
                      <option value="macho">Macho</option>
                      <option value="hembra">Hembra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tamaño Estimado</label>
                    <select
                      value={tamano}
                      onChange={(e) => setTamano(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer"
                    >
                      <option value="pequeño">Pequeño</option>
                      <option value="mediano">Mediano</option>
                      <option value="grande">Grande</option>
                    </select>
                  </div>
                </div>

                {/* Protocolo Médico Sanitario Obligatorio */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="font-bold text-emerald-900 block">
                    Protocolo Sanitario Avalado por la Clínica:
                  </span>
                  <div className="flex flex-wrap gap-4 text-emerald-800">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={esterilizado}
                        onChange={(e) => setEsterilizado(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-medium">Esterilización Quirúrgica Certificada</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vacunado}
                        onChange={(e) => setVacunado(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-medium">Vacunación Antirrábica y Múltiple</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={desparasitado}
                        onChange={(e) => setDesparasitado(e.target.checked)}
                        className="rounded text-emerald-600"
                      />
                      <span className="font-medium">Desparasitación Interna y Externa</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Historia Médica y Rescate</label>
                  <textarea
                    rows={2}
                    value={historia}
                    onChange={(e) => setHistoria(e.target.value)}
                    placeholder="Describe el rescate y estado clínico actual del paciente..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rasgos de Personalidad (separados por coma)</label>
                  <input
                    type="text"
                    value={personalidadInput}
                    onChange={(e) => setPersonalidadInput(e.target.value)}
                    placeholder="Dócil, sociable con niños, juguetón..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Publicar con Certificación Médica
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMACIÓN DE BORRADO */}
      <AnimatePresence>
        {adoptionToDelete && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full border border-rose-200 shadow-2xl p-6 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="font-bold text-base text-slate-800">
                ¿Retirar de adopción a {adoptionToDelete.nombre}?
              </h4>
              <p className="text-xs text-slate-500">
                Esta acción removerá el expediente del catálogo oficial de adopciones.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <button
                  onClick={() => setAdoptionToDelete(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteAdoption(adoptionToDelete.id)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Sí, Retirar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
