import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { PetReport, ReportType, PetSpecies, PetGender, OwnerAccount } from '../types/pet';
import { 
  X, 
  Upload, 
  Camera, 
  Check, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Navigation, 
  LocateFixed, 
  CheckCircle2,
  RotateCcw,
  UserCheck
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: PetReport) => void;
  currentUser?: OwnerAccount | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}) => {
  const [tipo, setTipo] = useState<ReportType>('perdido');
  const [nombre, setNombre] = useState('');
  const [especie, setEspecie] = useState<PetSpecies>('perro');
  const [raza, setRaza] = useState('');
  const [color, setColor] = useState('');
  const [sexo, setSexo] = useState<PetGender>('macho');
  const [zonaUbicacion, setZonaUbicacion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [telefono, setTelefono] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  
  // FOTO OBLIGATORIA
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // GPS & Coordenadas
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [tieneRecompensa, setTieneRecompensa] = useState(false);
  const [montoRecompensa, setMontoRecompensa] = useState('20');
  const [detallesCollar, setDetallesCollar] = useState('');
  const [notas, setNotas] = useState('');
  const [vacunasAlDia, setVacunasAlDia] = useState(true);
  const [esterilizado, setEsterilizado] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const miniMarkerRef = useRef<L.Marker | null>(null);

  // FUNCIÓN CRÍTICA: Limpiar completamente el formulario para que nunca quede información de la mascota anterior
  const resetForm = useCallback(() => {
    setTipo('perdido');
    setNombre('');
    setEspecie('perro');
    setRaza('');
    setColor('');
    setSexo('macho');
    setZonaUbicacion(currentUser ? currentUser.colonia : '');
    setReferencia('');
    setFecha(new Date().toISOString().split('T')[0]);
    setTelefono(currentUser ? currentUser.telefono : '');
    setNombreContacto(currentUser ? currentUser.nombre : '');
    setFotoUrl('');
    setFotoPreview(null);
    setGpsCoords(null);
    setGpsLoading(false);
    setGpsSuccess(false);
    setGpsError(null);
    setTieneRecompensa(false);
    setMontoRecompensa('20');
    setDetallesCollar('');
    setNotas('');
    setVacunasAlDia(true);
    setEsterilizado(true);
    setError(null);
  }, [currentUser]);

  // Al abrir el modal, reiniciar siempre el formulario a un estado limpio
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Inicializar o centrar el minimapa integrado en el modal
  useEffect(() => {
    if (!isOpen) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (miniMapContainerRef.current && !miniMapInstanceRef.current) {
        const defaultLat = gpsCoords ? gpsCoords.lat : 13.8062; // Apopa Centro
        const defaultLng = gpsCoords ? gpsCoords.lng : -89.1795;

        const map = L.map(miniMapContainerRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 14,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        const markerIcon = L.divIcon({
          className: 'mini-gps-pin',
          html: `<div style="width: 24px; height: 24px; border-radius: 50%; background: #f43f5e; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">📍</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([defaultLat, defaultLng], { icon: markerIcon, draggable: true }).addTo(map);
        miniMarkerRef.current = marker;

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setGpsCoords({ lat: parseFloat(pos.lat.toFixed(6)), lng: parseFloat(pos.lng.toFixed(6)) });
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = parseFloat(e.latlng.lat.toFixed(6));
          const lng = parseFloat(e.latlng.lng.toFixed(6));
          setGpsCoords({ lat, lng });
          marker.setLatLng([lat, lng]);
        });

        miniMapInstanceRef.current = map;
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Si cambia la posición GPS, actualizar el minimapa
  useEffect(() => {
    if (gpsCoords && miniMapInstanceRef.current && miniMarkerRef.current) {
      miniMapInstanceRef.current.setView([gpsCoords.lat, gpsCoords.lng], 16);
      miniMarkerRef.current.setLatLng([gpsCoords.lat, gpsCoords.lng]);
    }
  }, [gpsCoords]);

  if (!isOpen) return null;

  // Manejo de archivo de imagen REAL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('El archivo seleccionado debe ser una imagen válida (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFotoPreview(result);
        setFotoUrl(result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Activar GPS del dispositivo del usuario
  const handleRequestGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador o dispositivo no soporta geolocalización GPS.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setGpsCoords({ lat, lng });
        setGpsSuccess(true);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setGpsError('No se pudo obtener la ubicación GPS. Puedes arrastrar el marcador en el mapa.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // REQUISITO ESTRICTO: FOTO OBLIGATORIA
    if (!fotoUrl || !fotoPreview) {
      setError('⚠️ Es OBLIGATORIO subir una fotografía real de la mascota para poder publicar el reporte.');
      return;
    }

    if (!raza.trim() || !color.trim()) {
      setError('Por favor describe la raza o características físicas y el color de la mascota.');
      return;
    }

    if (!zonaUbicacion.trim()) {
      setError('Por favor indica la colonia, barrio o zona donde se perdió o fue encontrada.');
      return;
    }

    const cleanTel = telefono.replace(/\D/g, '');
    if (cleanTel.length < 8) {
      setError('Por favor ingresa un número de teléfono válido (mínimo 8 dígitos).');
      return;
    }

    if (!nombreContacto.trim()) {
      setError('Por favor ingresa el nombre de la persona o dueña de contacto.');
      return;
    }

    // Coordenadas fijas o GPS (Por defecto Centro de Apopa)
    const finalLat = gpsCoords ? gpsCoords.lat : 13.8062;
    const finalLng = gpsCoords ? gpsCoords.lng : -89.1795;

    const finalPhone = cleanTel.startsWith('503') ? cleanTel : `503${cleanTel}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000);

    const newReport: PetReport = {
      id: `rep-${Date.now()}`,
      codigoReporte: `BH-${randomCode}`,
      insigniaId: `BH-${randomCode}`,
      tipo,
      nombre: nombre.trim() || (tipo === 'perdido' ? 'Mascota Buscada' : 'Mascota Encontrada'),
      especie,
      raza: raza.trim(),
      color: color.trim(),
      sexo,
      colonia: zonaUbicacion.trim(),
      referencia: referencia.trim() || undefined,
      lat: finalLat,
      lng: finalLng,
      fecha,
      telefonoContacto: finalPhone,
      nombreContacto: nombreContacto.trim(),
      fotoUrl,
      tieneRecompensa: tipo === 'perdido' ? tieneRecompensa : false,
      montoRecompensa: tieneRecompensa && montoRecompensa ? Number(montoRecompensa) : undefined,
      detallesCollar: detallesCollar.trim() || undefined,
      notas: notas.trim() || undefined,
      vacunasAlDia,
      esterilizado,
      verificado: true,
      denunciasFalso: 0,
      estado: 'activo',
      createdAt: new Date().toISOString(),
      // Vincular a la cuenta activa del dueño
      autorId: currentUser?.id,
      autorEmail: currentUser?.email,
      autorNombre: currentUser?.nombre,
      autorFotoUrl: currentUser?.fotoUrl,
      municipio: currentUser?.municipio || 'Apopa',
    };

    onSubmit(newReport);
    // Limpiar de inmediato el formulario para futuras publicaciones
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fffdfa] rounded-3xl max-w-2xl w-full border border-rose-100 shadow-2xl overflow-hidden my-4 relative">
        {/* Cabecera pastel limpia */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-linear-to-r from-rose-50/80 via-pink-50/50 to-amber-50/60">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-rose-500 font-bold text-sm">
              🐾
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Registrar Nueva Mascota
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Formulario limpio y nuevo por cada mascota publicada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón para reiniciar/limpiar formulario manualmente */}
            <button
              type="button"
              onClick={resetForm}
              title="Limpiar todos los campos del formulario"
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 bg-white/80 hover:bg-rose-50 border border-slate-200/80 rounded-xl transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar campos</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Indicador de cuenta activa */}
        {currentUser && (
          <div className="px-6 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-medium">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Publicando con tu cuenta: <strong>{currentUser.nombre}</strong> ({currentUser.colonia})</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">ID: {currentUser.id.slice(0, 10)}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 font-medium animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tipo de Alerta: Solo Mascota Buscada o Mascota Encontrada */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Estado de la Mascota *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-rose-50/60 rounded-2xl border border-rose-100">
              <button
                type="button"
                onClick={() => setTipo('perdido')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tipo === 'perdido'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🐾 Mascota Buscada (Perdida)
              </button>
              <button
                type="button"
                onClick={() => setTipo('encontrado')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tipo === 'encontrado'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💚 Mascota Encontrada (En Resguardo)
              </button>
            </div>
          </div>

          {/* SECCIÓN 1: FOTO OBLIGATORIA */}
          <div className="p-4 bg-rose-50/40 rounded-2xl border-2 border-dashed border-rose-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                <span>Foto Real de la Mascota (OBLIGATORIA) *</span>
              </label>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                Requerido
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Para garantizar la autenticidad y ayudar realmente en la búsqueda, solo se permiten publicaciones con una fotografía real tomada desde tu cámara o galería.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="flex-1 w-full min-h-[50px] flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer text-slate-700 hover:text-rose-600 font-semibold text-xs transition-colors shadow-2xs">
                <Upload className="w-4 h-4 text-rose-500" />
                <span>{fotoPreview ? 'Cambiar fotografía seleccionada' : 'Subir foto desde cámara o archivo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>

              {fotoPreview && (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xs shrink-0">
                  <img
                    src={fotoPreview}
                    alt="Vista previa obligatoria"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>

            {fotoPreview && (
              <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Fotografía cargada con éxito</span>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: GPS Y MAPA INTEGRADO */}
          <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <LocateFixed className="w-4 h-4 text-sky-600" />
                  <span>Ubicación GPS & Mapa Integrado</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Detecta tu GPS actual o arrastra el marcador en el mapa para marcar el punto exacto
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestGPS}
                disabled={gpsLoading}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Detectando GPS...' : 'Obtener mi GPS'}</span>
              </button>
            </div>

            {gpsSuccess && gpsCoords && (
              <div className="text-[11px] text-sky-800 font-mono bg-white/80 p-2 rounded-xl border border-sky-200 flex items-center justify-between">
                <span>Coordenadas fijadas: {gpsCoords.lat}, {gpsCoords.lng}</span>
                <span className="text-emerald-600 font-bold">✓ GPS Activo</span>
              </div>
            )}

            {gpsError && (
              <div className="text-[11px] text-rose-600">
                {gpsError}
              </div>
            )}

            {/* Minimapa interactivo integrado en el formulario */}
            <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
              <div ref={miniMapContainerRef} className="w-full h-full" />
              <div className="absolute bottom-1 right-2 z-1000 bg-white/90 text-[10px] px-2 py-0.5 rounded text-slate-600">
                Toca o arrastra el pin en el mapa
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DATOS DE LA MASCOTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Mascota {tipo === 'encontrado' && '(o sin nombre)'}
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={tipo === 'perdido' ? 'Ej. Toby, Canelo, Mía' : 'Ej. Resguardado / Sin nombre'}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especie
              </label>
              <select
                value={especie}
                onChange={(e) => setEspecie(e.target.value as PetSpecies)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="ave">Ave</option>
                <option value="otro">Otro animal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raza o Rasgos Principales *
              </label>
              <input
                type="text"
                required
                value={raza}
                onChange={(e) => setRaza(e.target.value)}
                placeholder="Ej. Mestizo, Pitbull, French, Siamés..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color y señas físicas *
              </label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Café miel, pecho blanco, manchas negras"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sexo
              </label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as PetGender)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
                <option value="desconocido">No estoy seguro(a)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha del Suceso
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* UBICACIÓN TEXTUAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-rose-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colonia, Barrio o Sector *
              </label>
              <input
                type="text"
                required
                value={zonaUbicacion}
                onChange={(e) => setZonaUbicacion(e.target.value)}
                placeholder="Ej. Colonia El Rosal, Centro de Apopa, Popotlán, Valle Verde..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Punto de Referencia
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej. Cerca del parque central, pasaje 4, frente a la farmacia"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* DATOS DE CONTACTO DE LA DUEÑA */}
          <div className="p-4 bg-linear-to-br from-white via-rose-50/40 to-amber-50/40 rounded-2xl border border-rose-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              👤 Datos de Contacto de la Dueña o Resguardante
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={nombreContacto}
                  onChange={(e) => setNombreContacto(e.target.value)}
                  placeholder="Nombre"
                  className="w-full px-3 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  WhatsApp / Celular de contacto directo *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                    +503
                  </span>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="7XXX-XXXX"
                    className="w-full pl-14 pr-3 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recompensa */}
          {tipo === 'perdido' && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tieneRecompensa}
                  onChange={(e) => setTieneRecompensa(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800">
                  ¿Ofreces gratificación o recompensa económica?
                </span>
              </label>

              {tieneRecompensa && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Monto estimado ($USD):</span>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-500">$</span>
                    <input
                      type="number"
                      value={montoRecompensa}
                      onChange={(e) => setMontoRecompensa(e.target.value)}
                      min="5"
                      step="5"
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-rose-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Indicaciones de salud, collar o señas particulares
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Responde a su nombre, es miedoso, collar de cuero, cicatriz en patita..."
              className="w-full px-3.5 py-2 text-xs bg-white border border-rose-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-2xl transition-colors cursor-pointer shadow-xs"
            >
              Publicar Alerta con Foto y GPS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
