/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PetReport, ReportType, OwnerAccount } from './types/pet';
import { INITIAL_PETS } from './data/initialPets';
import { Navbar, ActiveTab } from './components/Navbar';
import { PetCard } from './components/PetCard';
import { PetMap, RouteDestination } from './components/PetMap';
import { ReportModal } from './components/ReportModal';
import { QRGeneratorModal } from './components/QRGeneratorModal';
import { PetProfileModal } from './components/PetProfileModal';
import { SheltersDirectory } from './components/SheltersDirectory';
import { AdoptionsSection } from './components/AdoptionsSection';
import { VeterinaryDirectory } from './components/VeterinaryDirectory';
import { GuidesSection } from './components/GuidesSection';
import { TechDocsModal } from './components/TechDocsModal';
import { OwnerAccountModal } from './components/OwnerAccountModal';
import { InitialLoginModal } from './components/InitialLoginModal';
import { calculateDistanceKm, formatDistance } from './utils/geo';
import { 
  getCurrentOwner, 
  setCurrentOwner, 
  getStoredAccounts, 
  saveAccounts,
  registerOrLoginOwner,
  updateOwnerProfile,
  getStoredReports, 
  saveStoredReports, 
  deleteReportById 
} from './utils/ownerDatabase';
import {
  apiFetchReports,
  apiCreateReport,
  apiDeleteReport,
  apiFetchAccounts,
  apiRegisterOrLogin,
  apiUpdateAccount,
} from './services/api';
import { 
  Bell,
  Search, 
  MapPin, 
  Filter, 
  Plus, 
  QrCode, 
  Database, 
  Heart, 
  AlertTriangle,
  Compass,
  Layers,
  Sparkles,
  PhoneCall,
  Home,
  Stethoscope,
  BookOpen,
  ShieldCheck,
  LocateFixed,
  Camera,
  Navigation,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  Car,
  X
} from 'lucide-react';

const STORAGE_KEY = 'busca_huella_real_reports_v2';

export default function App() {
  // Lista de reportes reales persistidos en la base de datos local
  const [reports, setReports] = useState<PetReport[]>(() => getStoredReports());

  // Base de datos de dueños y cuenta activa
  const [currentUser, setCurrentUser] = useState<OwnerAccount | null>(() => getCurrentOwner());
  const [allAccounts, setAllAccounts] = useState<OwnerAccount[]>(() => getStoredAccounts());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isInitialLoginOpen, setIsInitialLoginOpen] = useState<boolean>(() => !getCurrentOwner());
  const [filterOnlyMyZone, setFilterOnlyMyZone] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<ActiveTab>('catalogo');
  const [filterType, setFilterType] = useState<'todos' | 'perdido' | 'encontrado'>('todos');
  const [filterEspecie, setFilterEspecie] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Ordenamiento y Filtrado por Proximidad Geográfica GPS
  const [sortBy, setSortBy] = useState<'recientes' | 'cercania' | 'recompensa'>('recientes');
  const [filterRadiusKm, setFilterRadiusKm] = useState<string>('todas');
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showGpsPanel, setShowGpsPanel] = useState<boolean>(false);

  // Destino activo para trazado de ruta en el mapa (como Google Maps)
  const [activeRouteDestination, setActiveRouteDestination] = useState<RouteDestination | null>(null);

  // Modales
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedPetForProfile, setSelectedPetForProfile] = useState<PetReport | null>(null);
  const [selectedPetForQR, setSelectedPetForQR] = useState<PetReport | null>(null);
  const [focusedReportForMap, setFocusedReportForMap] = useState<PetReport | null>(null);
  const [targetMapCoords, setTargetMapCoords] = useState<{ lat: number; lng: number; title: string } | null>(null);

  // Guardar en almacenamiento local cada vez que cambian los reportes
  useEffect(() => {
    saveStoredReports(reports);
  }, [reports]);

  // Sincronización en tiempo real con el servidor para que publicaciones de todas las cuentas aparezcan al instante
  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const [serverReports, serverAccounts] = await Promise.all([
          apiFetchReports(),
          apiFetchAccounts(),
        ]);

        if (!isMounted) return;

        if (Array.isArray(serverReports) && serverReports.length > 0) {
          setReports((prev) => {
            const reportMap = new Map<string, PetReport>();
            // Primero incorporar los reportes del servidor
            serverReports.forEach((rep) => reportMap.set(rep.id, rep));
            // Conservar reportes locales que no estén todavía en el servidor
            prev.forEach((rep) => {
              if (!reportMap.has(rep.id)) {
                reportMap.set(rep.id, rep);
              }
            });
            const merged = Array.from(reportMap.values());
            saveStoredReports(merged);
            return merged;
          });
        }

        if (Array.isArray(serverAccounts) && serverAccounts.length > 0) {
          setAllAccounts((prev) => {
            const accMap = new Map<string, OwnerAccount>();
            serverAccounts.forEach((acc) => accMap.set(acc.id, acc));
            prev.forEach((acc) => {
              if (!accMap.has(acc.id)) {
                accMap.set(acc.id, acc);
              }
            });
            const mergedAccs = Array.from(accMap.values());
            saveAccounts(mergedAccs);
            return mergedAccs;
          });
        }
      } catch (err) {
        console.warn('Sync server error:', err);
      }
    };

    // Sincronizar inmediatamente al iniciar
    syncWithServer();

    // Sincronización continua cada 3 segundos
    const interval = setInterval(syncWithServer, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Función para solicitar la geolocalización actual del usuario
  const requestUserGps = (onSuccess?: (coords: { lat: number; lng: number }) => void) => {
    if (!navigator.geolocation) {
      setGpsError('Tu dispositivo o navegador no soporta geolocalización GPS.');
      return;
    }

    setIsLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(6)),
          lng: parseFloat(pos.coords.longitude.toFixed(6)),
        };
        setUserGps(coords);
        setIsLocatingGps(false);
        setGpsError(null);
        if (onSuccess) {
          onSuccess(coords);
        }
      },
      (err) => {
        setIsLocatingGps(false);
        let errorMsg = 'No se pudo acceder a tu ubicación GPS. Verifica que los permisos de ubicación estén activados.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Permiso de ubicación denegado. Para ordenar por cercanía, por favor activa los permisos de ubicación en tu navegador.';
        }
        setGpsError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Cuando el usuario elige ordenar por cercanía, solicitar GPS si aún no está disponible
  const handleSelectSort = (option: 'recientes' | 'cercania' | 'recompensa') => {
    setSortBy(option);
    if (option === 'cercania' && !userGps) {
      requestUserGps();
    }
  };

  const handleReportFake = (reportId: string, _reason: string) => {
    // Retirar de inmediato la publicación reportada como falsa
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleMarkResolved = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, estado: 'resuelto' as const } : r))
    );
  };

  const handleSetPresetGps = (coords: { lat: number; lng: number }) => {
    setUserGps(coords);
    setSortBy('cercania');
    setGpsError(null);
  };

  const handleDeleteReport = async (reportId: string) => {
    const updated = deleteReportById(reportId);
    setReports(updated);
    if (selectedPetForProfile?.id === reportId) {
      setIsProfileModalOpen(false);
      setSelectedPetForProfile(null);
    }
    setToastMessage('🗑️ Publicación eliminada correctamente.');
    setTimeout(() => setToastMessage(null), 3500);

    try {
      await apiDeleteReport(reportId);
    } catch (err) {
      console.warn('Error deleting report on server:', err);
    }
  };

  const handleSelectAccount = (account: OwnerAccount) => {
    setCurrentOwner(account);
    setCurrentUser(account);
    setIsInitialLoginOpen(false);
    setToastMessage(`Sesión cambiada a: ${account.nombre}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterAccount = async (data: {
    nombre: string;
    email: string;
    telefono: string;
    colonia: string;
    municipio?: string;
    fotoUrl?: string;
    avatarEmoji?: string;
  }) => {
    const newAcc = registerOrLoginOwner({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      colonia: data.colonia,
      municipio: data.municipio || 'Apopa',
      fotoUrl: data.fotoUrl,
      avatarEmoji: data.avatarEmoji,
    });
    setAllAccounts(getStoredAccounts());
    setCurrentUser(newAcc);
    setIsInitialLoginOpen(false);
    setToastMessage(`✓ ¡Cuenta creada! Bienvenido, ${newAcc.nombre}`);
    setTimeout(() => setToastMessage(null), 3000);

    try {
      await apiRegisterOrLogin(newAcc);
    } catch (err) {
      console.warn('Error syncing account to server:', err);
    }
  };

  const handleLoginSuccess = async (user: OwnerAccount) => {
    const saved = registerOrLoginOwner(user);
    setCurrentUser(saved);
    setAllAccounts(getStoredAccounts());
    setIsInitialLoginOpen(false);
    setToastMessage(`✓ ¡Bienvenido a Busca Huella, ${saved.nombre.split(' ')[0]}!`);
    setTimeout(() => setToastMessage(null), 3000);

    try {
      await apiRegisterOrLogin(saved);
    } catch (err) {
      console.warn('Error syncing login to server:', err);
    }
  };

  const handleLogout = () => {
    setCurrentOwner(null);
    setCurrentUser(null);
    setIsInitialLoginOpen(true);
    setToastMessage('Sesión cerrada.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateProfile = async (updates: Partial<OwnerAccount>) => {
    if (!currentUser) return;
    const updated = updateOwnerProfile(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
      setAllAccounts(getStoredAccounts());
      setToastMessage('✓ Perfil actualizado correctamente.');
      setTimeout(() => setToastMessage(null), 2500);

      try {
        await apiUpdateAccount(currentUser.id, updates);
      } catch (err) {
        console.warn('Error updating account on server:', err);
      }
    }
  };

  const handleAddReport = async (newReport: PetReport) => {
    // 1. Guardar de inmediato en estado local y almacenamiento
    const updated = [newReport, ...reports.filter((r) => r.id !== newReport.id)];
    setReports(updated);
    saveStoredReports(updated);
    setSelectedPetForProfile(newReport);
    setIsProfileModalOpen(true);
    setToastMessage(`✓ Alerta de ${newReport.nombre} publicada y visible para todas las cuentas.`);
    setTimeout(() => setToastMessage(null), 3500);

    // 2. Persistir en la base de datos central en el servidor
    try {
      const serverReport = await apiCreateReport(newReport);
      setReports((prev) => {
        const remaining = prev.filter((r) => r.id !== newReport.id && r.id !== serverReport.id);
        const merged = [serverReport, ...remaining];
        saveStoredReports(merged);
        return merged;
      });
    } catch (err) {
      console.warn('Alerta guardada localmente (error servidor):', err);
    }
  };

  const handleFocusOnMap = (report: PetReport) => {
    setFocusedReportForMap(report);
    setTargetMapCoords({ lat: report.lat, lng: report.lng, title: report.nombre });
    setCurrentTab('mapa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusCoordsOnMap = (lat: number, lng: number, title: string) => {
    setFocusedReportForMap(null);
    setTargetMapCoords({ lat, lng, title });
    setCurrentTab('mapa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trazar ruta hacia veterinaria o mascota seleccionada (Google Maps)
  const handleRouteToClinic = (lat: number, lng: number, title: string, subtitle?: string) => {
    setActiveRouteDestination({
      lat,
      lng,
      title,
      subtitle,
      isVet: true,
    });
    setCurrentTab('mapa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteToPet = (report: PetReport) => {
    setActiveRouteDestination({
      lat: report.lat,
      lng: report.lng,
      title: report.nombre,
      subtitle: report.colonia,
      isVet: false,
    });
    setCurrentTab('mapa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQRForPet = (report: PetReport) => {
    setSelectedPetForQR(report);
    setIsQRModalOpen(true);
  };

  const handleOpenProfileForPet = (report: PetReport) => {
    setSelectedPetForProfile(report);
    setIsProfileModalOpen(true);
  };

  // Filtrado y Ordenamiento de reportes por Proximidad Geográfica y criterios
  const processedReports = useMemo(() => {
    // 1. Filtrar
    const filtered = reports.filter((rep) => {
      if (filterType !== 'todos' && rep.tipo !== filterType) return false;
      if (filterEspecie !== 'todos' && rep.especie !== filterEspecie) return false;

      // FILTRADO OPCIONAL POR ZONA/MUNICIPIO (Desactivado por defecto para mostrar las alertas de todas las cuentas)
      if (filterOnlyMyZone && currentUser?.municipio) {
        const userMuni = currentUser.municipio.trim().toLowerCase();
        const repMuni = (rep.municipio || '').trim().toLowerCase();
        const repCol = rep.colonia.toLowerCase();

        const matchMuni = repMuni ? repMuni === userMuni : false;
        const matchCol = repCol.includes(userMuni) || (currentUser.colonia && repCol.includes(currentUser.colonia.toLowerCase()));
        const isMyOwn = currentUser.id ? (rep.autorId === currentUser.id || (rep.autorEmail && rep.autorEmail === currentUser.email)) : false;
        
        if (!matchMuni && !matchCol && !isMyOwn) {
          return false;
        }
      }

      // Filtro de radio de distancia GPS
      if (userGps && filterRadiusKm !== 'todas') {
        const radiusNum = parseFloat(filterRadiusKm);
        const dist = calculateDistanceKm(userGps.lat, userGps.lng, rep.lat, rep.lng);
        if (dist > radiusNum) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rep.nombre.toLowerCase().includes(q);
        const matchRaza = rep.raza.toLowerCase().includes(q);
        const matchColonia = rep.colonia.toLowerCase().includes(q);
        const matchColor = rep.color.toLowerCase().includes(q);
        const matchDueña = rep.nombreContacto.toLowerCase().includes(q);
        const matchInsignia = rep.insigniaId?.toLowerCase().includes(q);
        return matchName || matchRaza || matchColonia || matchColor || matchDueña || matchInsignia;
      }

      return true;
    });

    // 2. Ordenar
    return filtered.sort((a, b) => {
      if (sortBy === 'cercania' && userGps) {
        const distA = calculateDistanceKm(userGps.lat, userGps.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userGps.lat, userGps.lng, b.lat, b.lng);
        return distA - distB; // Orden ascendente: más cercanos primero
      }

      if (sortBy === 'recompensa') {
        const rewA = a.tieneRecompensa && a.montoRecompensa ? a.montoRecompensa : 0;
        const rewB = b.tieneRecompensa && b.montoRecompensa ? b.montoRecompensa : 0;
        return rewB - rewA;
      }

      // Por defecto: Más recientes primero
      const dateA = new Date(a.createdAt || a.fecha).getTime();
      const dateB = new Date(b.createdAt || b.fecha).getTime();
      return dateB - dateA;
    });
  }, [reports, filterType, filterEspecie, filterRadiusKm, searchQuery, sortBy, userGps, filterOnlyMyZone, currentUser]);

  const totalPerdidos = reports.filter((r) => r.tipo === 'perdido').length;
  const totalEncontrados = reports.filter((r) => r.tipo === 'encontrado').length;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 pb-12 font-['Nunito',sans-serif]">
      {/* Barra de Navegación "Busca Huella" */}
      <Navbar
        currentTab={currentTab}
        currentUser={currentUser}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onSelectTab={(tab) => {
          if (tab === 'docs') {
            setIsDocsModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Notificación Toast Flotante */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 pointer-events-none"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER PRINCIPAL EDITORIAL Y ORDENADO */}
      <section className="bg-gradient-to-b from-stone-100/80 via-white to-[#fdfbf7] border-b border-stone-200/70 py-7 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 tracking-wide uppercase">
              <span>Red Solidaria · San Salvador & Apopa</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-stone-500 font-medium normal-case tracking-normal">
                {reports.length} reportes activos
              </span>
            </div>
            <h1 className="font-fredoka text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-800">
              Busca Huella
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium leading-relaxed">
              Plataforma comunitaria para reunir mascotas extraviadas con fotografía obligatoria, trazado vial hacia veterinarias y placas inteligentes QR.
            </p>
          </div>

          {/* Tarjeta de estado de ubicación del usuario en el Hero */}
          {currentUser && (
            <div className="p-3 bg-white/90 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shrink-0 border border-rose-100">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xs">
                <span className="text-[11px] text-slate-400 block font-medium">Tu ubicación activa</span>
                <span className="font-bold text-slate-800 block">
                  {currentUser.colonia}, {currentUser.municipio}
                </span>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                Cambiar
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contenido Principal según Pestaña */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 1. SECCIÓN: ALERTAS Y CATÁLOGO CON ORDENAMIENTO */}
        {currentTab === 'catalogo' && (
          <section className="space-y-5">
            {/* BARRA DE COMANDO UNIFICADA Y ORDENADA */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-3.5 sm:p-4 space-y-3">
              
              {/* Fila 1: Búsqueda, Segmented Control y CTA Principal */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Buscador amplio */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, raza, colonia, color o tutor..."
                    className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filtro por Estado: Todas | Buscadas | En Resguardo */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0 text-xs font-bold">
                  <button
                    onClick={() => setFilterType('todos')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      filterType === 'todos'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas ({reports.length})
                  </button>
                  <button
                    onClick={() => setFilterType('perdido')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      filterType === 'perdido'
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Buscadas ({totalPerdidos})
                  </button>
                  <button
                    onClick={() => setFilterType('encontrado')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      filterType === 'encontrado'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    En Resguardo ({totalEncontrados})
                  </button>
                </div>

                {/* Filtro de Especie */}
                <div className="shrink-0">
                  <select
                    id="especie-filter-input"
                    value={filterEspecie}
                    onChange={(e) => setFilterEspecie(e.target.value)}
                    className="w-full lg:w-auto px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="todos">Todas las especies</option>
                    <option value="perro">Caninos (Perros)</option>
                    <option value="gato">Felinos (Gatos)</option>
                    <option value="ave">Aves</option>
                    <option value="otro">Otros animales</option>
                  </select>
                </div>

                {/* Botón de Publicar Mascota */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2.5 bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Publicar Mascota</span>
                </motion.button>
              </div>

              {/* Fila 2: Sub-barra de ordenamiento, ámbito de zona y botón de opciones GPS */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Zona activa y toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Zona:</span>
                    <strong className="text-slate-800 font-bold">{currentUser?.municipio || 'Apopa'}</strong>
                  </span>
                  <button
                    onClick={() => setFilterOnlyMyZone(!filterOnlyMyZone)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filterOnlyMyZone
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-2xs'
                    }`}
                  >
                    <span>
                      {filterOnlyMyZone
                        ? `✓ Filtrado: Solo mi zona (${currentUser?.municipio || 'Apopa'})`
                        : '🌐 Viendo alertas de todas las cuentas y zonas'}
                    </span>
                  </button>
                </div>

                {/* Ordenamiento y Drawer de GPS */}
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  <span className="text-slate-500 font-medium">Ordenar:</span>
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
                    <button
                      onClick={() => handleSelectSort('recientes')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        sortBy === 'recientes'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Recientes
                    </button>
                    <button
                      onClick={() => handleSelectSort('cercania')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                        sortBy === 'cercania'
                          ? 'bg-white text-rose-600 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Cercanía</span>
                    </button>
                    <button
                      onClick={() => handleSelectSort('recompensa')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        sortBy === 'recompensa'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Recompensa
                    </button>
                  </div>

                  {/* Toggle para opciones avanzadas de GPS */}
                  <button
                    onClick={() => setShowGpsPanel(!showGpsPanel)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      showGpsPanel || userGps
                        ? 'bg-slate-100 border-slate-300 text-slate-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Configurar radio y ubicación GPS"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                    <span>Opciones GPS</span>
                  </button>
                </div>
              </div>

              {/* Panel Desplegable de Ajustes GPS Ordenado */}
              <AnimatePresence>
                {showGpsPanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 border-t border-slate-100 space-y-3 overflow-hidden text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                      <div className="flex items-center gap-2 flex-wrap">
                        {userGps ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>GPS Activo</span>
                            <span className="text-emerald-600 font-mono text-[10px]">
                              ({userGps.lat.toFixed(3)}, {userGps.lng.toFixed(3)})
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => requestUserGps()}
                            disabled={isLocatingGps}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LocateFixed className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin' : ''}`} />
                            <span>{isLocatingGps ? 'Detectando GPS...' : 'Detectar mi GPS'}</span>
                          </button>
                        )}

                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-slate-500 font-medium">Radio:</span>
                          <select
                            value={filterRadiusKm}
                            onChange={(e) => setFilterRadiusKm(e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold cursor-pointer"
                          >
                            <option value="todas">Todas las distancias</option>
                            <option value="2">Menos de 2 km</option>
                            <option value="5">Menos de 5 km</option>
                            <option value="10">Menos de 10 km</option>
                            <option value="25">Menos de 25 km</option>
                          </select>
                        </div>
                      </div>

                      {/* Botones de simulación rápida discretos */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-600">Simular zona:</span>
                        <button
                          onClick={() => handleSetPresetGps({ lat: 13.8062, lng: -89.1795 })}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 text-slate-700 font-semibold cursor-pointer"
                        >
                          Apopa
                        </button>
                        <button
                          onClick={() => handleSetPresetGps({ lat: 13.7025, lng: -89.2430 })}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 text-slate-700 font-semibold cursor-pointer"
                        >
                          Escalón
                        </button>
                        <button
                          onClick={() => handleSetPresetGps({ lat: 13.6930, lng: -89.2415 })}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-rose-300 text-slate-700 font-semibold cursor-pointer"
                        >
                          San Benito
                        </button>
                      </div>
                    </div>

                    {gpsError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{gpsError}</span>
                        </div>
                        <button
                          onClick={() => setGpsError(null)}
                          className="text-rose-500 hover:text-rose-800 font-bold ml-2 text-xs"
                        >
                          Cerrar
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Listado de Tarjetas Ordenadas por Cercanía o Estado Vacío */}
            {processedReports.length > 0 ? (
              <div className="space-y-4">
                {/* Resumen del orden actual */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>
                    Mostrando <strong>{processedReports.length}</strong> {processedReports.length === 1 ? 'mascota' : 'mascotas'}
                    {sortBy === 'cercania' && userGps && ' ordenadas por menor distancia a tu ubicación'}
                    {sortBy === 'recientes' && ' ordenadas por fecha más reciente'}
                    {filterRadiusKm !== 'todas' && userGps && ` (a menos de ${filterRadiusKm} km)`}
                  </span>

                  {sortBy === 'cercania' && !userGps && (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Activa tu GPS para ordenar por cercanía exacta
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {processedReports.map((report) => {
                    const distKm = userGps
                      ? calculateDistanceKm(userGps.lat, userGps.lng, report.lat, report.lng)
                      : undefined;

                    return (
                      <PetCard
                        key={report.id}
                        report={report}
                        distanceKm={distKm}
                        onFocusOnMap={handleFocusOnMap}
                        onOpenQR={handleOpenQRForPet}
                        onOpenProfile={handleOpenProfileForPet}
                        onRouteToPet={handleRouteToPet}
                        onReportFake={handleReportFake}
                        onMarkResolved={handleMarkResolved}
                        onDeleteReport={handleDeleteReport}
                        currentUser={currentUser}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-rose-200 shadow-xs max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto text-3xl">
                  🐾
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-fredoka text-xl font-bold text-slate-800">
                    {filterRadiusKm !== 'todas'
                      ? `No hay mascotas reportadas a menos de ${filterRadiusKm} km`
                      : 'No hay publicaciones activas con estos filtros'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                    {filterRadiusKm !== 'todas'
                      ? 'Prueba ampliando el radio de distancia GPS o restableciendo los filtros.'
                      : 'En Busca Huella solo se muestran reportes reales subidos por la comunidad con fotografía obligatoria y ubicación GPS verificada.'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {filterRadiusKm !== 'todas' && (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setFilterRadiusKm('todas')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ver todas las distancias
                    </motion.button>
                  )}

                  {filterOnlyMyZone && (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setFilterOnlyMyZone(false)}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      🌐 Ver alertas de todas las cuentas y zonas
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Publicar Mascota (Foto Obligatoria)</span>
                  </motion.button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 2. SECCIÓN: MAPA INTERACTIVO ESTILO GOOGLE MAPS CON TRAZADO DE RUTA */}
        {currentTab === 'mapa' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-1">
                  <Car className="w-3.5 h-3.5" />
                  <span>Navegación Interactiva Vial estilo Google Maps</span>
                </div>
                <h2 className="font-fredoka text-2xl font-bold text-slate-800 tracking-tight">
                  Mapa con Rutas a Veterinarias de San Salvador
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona cualquier veterinaria o mascota para ver el camino vial trazado y calcular el tiempo estimado
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCurrentTab('catalogo')}
                className="text-xs font-bold text-slate-700 bg-white px-3.5 py-2 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                Volver a Mascotas
              </motion.button>
            </div>

            <PetMap
              reports={processedReports}
              selectedReport={focusedReportForMap}
              targetCoords={targetMapCoords}
              activeRouteDestination={activeRouteDestination}
              userGps={userGps}
              onClearRoute={() => setActiveRouteDestination(null)}
              onSelectRouteDestination={(dest) => setActiveRouteDestination(dest)}
              onSetUserGps={handleSetPresetGps}
            />
          </section>
        )}

        {/* 3. SECCIÓN: INSIGNIAS DIGITALES QR */}
        {currentTab === 'qr' && (
          <section className="space-y-4">
            <div className="p-6 bg-linear-to-r from-rose-50 via-amber-50/50 to-purple-50/60 rounded-3xl border border-rose-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-white px-3 py-1 rounded-full border border-rose-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>Insignia QR Inteligente Busca Huella</span>
                </div>
                <h2 className="font-fredoka text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  Placa Digital para Collar con Enlace a la Dueña
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Genera una insignia con código QR para colgar en el collar de tu mascota. Al escanearla con cualquier smartphone, muestra su perfil y tiene botones para llamarte o enviarte un WhatsApp directo de inmediato.
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setSelectedPetForQR(null);
                      setIsQRModalOpen(true);
                    }}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-xs transition-colors cursor-pointer"
                  >
                    Crear Placa para Collar
                  </motion.button>
                </div>
              </div>

              <div className="p-5 bg-white rounded-3xl border border-rose-100 flex flex-col items-center text-center max-w-xs shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-rose-100/70 flex items-center justify-center text-rose-600 mb-2 text-2xl font-bold">
                  🐾
                </div>
                <span className="text-xs font-bold text-slate-800">100% Gratuito y Funcional</span>
                <span className="text-[11px] text-slate-500 mt-1">
                  Enlaza directo a tu número celular de El Salvador sin intermediarios.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 4. SECCIÓN: REFUGIOS Y RESCATE ANIMAL */}
        {currentTab === 'refugios' && (
          <SheltersDirectory onFocusMap={handleFocusCoordsOnMap} />
        )}

        {/* 5. SECCIÓN: APARTADO DE ADOPCIÓN (EXCLUSIVO VETERINARIAS) */}
        {currentTab === 'adopciones' && (
          <AdoptionsSection currentUser={currentUser} />
        )}

        {/* 6. SECCIÓN: VETERINARIAS & URGENCIAS CON TRAZADO DE RUTA GOOGLE MAPS */}
        {currentTab === 'veterinarias' && (
          <VeterinaryDirectory 
            userGps={userGps}
            onFocusMap={handleFocusCoordsOnMap}
            onRouteToClinic={handleRouteToClinic}
          />
        )}

        {/* 7. SECCIÓN: GUÍAS DE CUIDADO Y SALUD */}
        {currentTab === 'guias' && (
          <GuidesSection />
        )}
      </main>

      {/* MODALES */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddReport}
        currentUser={currentUser}
      />

      <QRGeneratorModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        initialPet={selectedPetForQR}
      />

      {/* Ficha Técnica y Perfil del Tutor Redirigido por Insignia QR con Distancia GPS */}
      <PetProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        pet={selectedPetForProfile}
        distanceKm={
          selectedPetForProfile && userGps
            ? calculateDistanceKm(userGps.lat, userGps.lng, selectedPetForProfile.lat, selectedPetForProfile.lng)
            : undefined
        }
        onFocusMap={handleFocusOnMap}
        onDeleteReport={handleDeleteReport}
        currentUser={currentUser}
      />

      {/* Modal de Base de Datos y Cuenta de Dueño */}
      <OwnerAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        allAccounts={allAccounts}
        allReports={reports}
        onSelectAccount={handleSelectAccount}
        onRegisterAccount={handleRegisterAccount}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onDeleteReport={handleDeleteReport}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Modal de Inicio de Sesión Obligatorio Inicial */}
      <InitialLoginModal
        isOpen={isInitialLoginOpen}
        onLoginSuccess={handleLoginSuccess}
        existingAccounts={allAccounts}
      />

      <TechDocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
