import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { PetReport } from '../types/pet';
import { SHELTERS_APOPA, VETERINARY_CLINICS } from '../data/sheltersAndVets';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import { 
  Navigation, 
  LocateFixed, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Car,
  Clock,
  MapPin,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  Footprints,
  ChevronRight,
  Phone,
  MessageCircle,
  Share2,
  Search
} from 'lucide-react';

export interface RouteDestination {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  isVet?: boolean;
}

interface PetMapProps {
  reports: PetReport[];
  selectedReport?: PetReport | null;
  targetCoords?: { lat: number; lng: number; title: string } | null;
  activeRouteDestination?: RouteDestination | null;
  userGps?: { lat: number; lng: number } | null;
  onClearRoute?: () => void;
  onSelectRouteDestination?: (dest: RouteDestination) => void;
  onSetUserGps?: (coords: { lat: number; lng: number }) => void;
}

export const PetMap: React.FC<PetMapProps> = ({
  reports,
  selectedReport,
  targetCoords,
  activeRouteDestination,
  userGps,
  onClearRoute,
  onSelectRouteDestination,
  onSetUserGps,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userGpsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const vetMarkersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [showShelters, setShowShelters] = useState(true);
  const [showVets, setShowVets] = useState(true);

  // Estados de barra de búsqueda y filtrado en tiempo real
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(0);

  // Filtrado de veterinarias en tiempo real mientras el usuario escribe
  const filteredVets = useMemo(() => {
    if (!searchQuery.trim()) return VETERINARY_CLINICS;
    const q = searchQuery.toLowerCase().trim();
    return VETERINARY_CLINICS.filter((vet) => {
      const matchName = vet.nombre.toLowerCase().includes(q);
      const matchDir = vet.direccion.toLowerCase().includes(q);
      const matchCol = vet.colonia.toLowerCase().includes(q);
      const matchMun = vet.municipio?.toLowerCase().includes(q) || false;
      const matchSrv = vet.servicios.some((s) => s.toLowerCase().includes(q));
      return matchName || matchDir || matchCol || matchMun || matchSrv;
    });
  }, [searchQuery]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Modo de transporte: Auto o Caminando
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');

  // Ubicación actual del usuario (GPS o Preset)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    userGps || { lat: 13.6989, lng: -89.2208 } // San Salvador Centro por defecto
  );
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Estado de la ruta tipo Google Maps
  // Por defecto, si no hay ruta activa, inicializar con la clínica principal 24h (Chivo Pets)
  const defaultVet = VETERINARY_CLINICS[0];
  const [currentRoute, setCurrentRoute] = useState<RouteDestination | null>(
    activeRouteDestination || {
      lat: defaultVet.lat,
      lng: defaultVet.lng,
      title: defaultVet.nombre,
      subtitle: defaultVet.direccion,
      isVet: true,
    }
  );

  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
    isLoading: boolean;
    error: string | null;
    steps?: string[];
  } | null>(null);

  const [showTurnSteps, setShowTurnSteps] = useState(false);

  // Sincronizar props externas con estado local
  useEffect(() => {
    if (userGps) {
      setUserLocation(userGps);
    }
  }, [userGps]);

  useEffect(() => {
    if (activeRouteDestination) {
      setCurrentRoute(activeRouteDestination);
    }
  }, [activeRouteDestination]);

  // Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [13.6989, -89.2208],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap | Busca Huella GPS',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      const userGpsLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      userGpsLayerRef.current = userGpsLayer;
      routeLayerRef.current = routeLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Función para solicitar ubicación GPS del usuario
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsMessage('La geolocalización GPS no está soportada en tu dispositivo.');
      return;
    }

    setIsLocatingUser(true);
    setGpsMessage('Obteniendo tu señal GPS en vivo...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const coords = { lat, lng };
        setUserLocation(coords);
        if (onSetUserGps) onSetUserGps(coords);
        setIsLocatingUser(false);
        setGpsMessage(`Ubicación GPS fijada: ${lat}, ${lng}`);

        updateUserGpsMarker(coords);

        if (mapInstanceRef.current && !currentRoute) {
          mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
        }
      },
      (err) => {
        setIsLocatingUser(false);
        setGpsMessage('No se pudo acceder a tu GPS. Usando San Salvador Centro como punto de partida.');
        const fallback = { lat: 13.6989, lng: -89.2208 };
        setUserLocation(fallback);
        updateUserGpsMarker(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Preset rápido de punto de partida
  const handleSelectStartPreset = (coords: { lat: number; lng: number }, name: string) => {
    setUserLocation(coords);
    if (onSetUserGps) onSetUserGps(coords);
    setGpsMessage(`Punto de partida cambiado a ${name}`);
    updateUserGpsMarker(coords);
  };

  // Renderizar marcador de usuario
  const updateUserGpsMarker = (coords: { lat: number; lng: number }) => {
    if (!userGpsLayerRef.current) return;
    userGpsLayerRef.current.clearLayers();

    const userGpsIcon = L.divIcon({
      className: 'user-gps-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
          <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 20px; height: 20px; border-radius: 50%; background-color: #2563eb; border: 3px solid white; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const userMarker = L.marker([coords.lat, coords.lng], { icon: userGpsIcon }).addTo(userGpsLayerRef.current);
    userMarker.bindPopup('<div style="font-family: \'Nunito\', sans-serif; font-weight: 700; font-size: 12px; color: #1e3a8a; padding: 4px;">📍 Tu punto de partida actual</div>');
  };

  // Actualizar marcador de usuario si cambia
  useEffect(() => {
    if (userLocation) {
      updateUserGpsMarker(userLocation);
    }
  }, [userLocation]);

  // CALCULAR Y TRAZAR RUTA ESTILO GOOGLE MAPS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    if (!currentRoute) {
      setRouteInfo(null);
      return;
    }

    const startPoint = userLocation || { lat: 13.6989, lng: -89.2208 };
    const endPoint = { lat: currentRoute.lat, lng: currentRoute.lng };

    // Estimar distancia aproximada
    const approxDist = calculateDistanceKm(startPoint.lat, startPoint.lng, endPoint.lat, endPoint.lng);
    const speedFactor = travelMode === 'driving' ? 2.2 : 12; // min por km

    setRouteInfo({
      distanceKm: parseFloat(approxDist.toFixed(1)),
      durationMin: Math.max(2, Math.round(approxDist * speedFactor)),
      isLoading: true,
      error: null,
      steps: [
        `Partir desde tu ubicación hacia la vía principal`,
        `Seguir en dirección hacia ${currentRoute.title}`,
        `Continuar por ${currentRoute.subtitle || 'la zona'}`,
        `Llegada a ${currentRoute.title}`,
      ],
    });

    // Marcador de destino Google Maps Style
    const destIcon = L.divIcon({
      className: 'route-endpoint-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(220, 38, 38, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 34px; height: 34px; border-radius: 50%; background: #dc2626; border: 3px solid white; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 17px;">
            ${currentRoute.isVet ? '🏥' : '🏁'}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const destMarker = L.marker([endPoint.lat, endPoint.lng], { icon: destIcon }).addTo(routeLayer);
    destMarker.bindPopup(`
      <div style="font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: bold; color: #1e293b; padding: 4px;">
        Destino: ${currentRoute.title}
      </div>
    `);

    // Intentar obtener la ruta vial real por OSRM
    let isCancelled = false;
    const profile = travelMode === 'driving' ? 'driving' : 'walking';
    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=geojson&steps=true`;

    fetch(osrmUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
          
          const distKm = parseFloat((route.distance / 1000).toFixed(1));
          const durMin = Math.round(route.duration / 60) || 1;

          // Pasos legibles de la ruta
          const rawSteps = route.legs?.[0]?.steps || [];
          const stepInstructions = rawSteps
            .slice(0, 5)
            .map((s: { maneuver?: { type?: string; modifier?: string }; name?: string }) => {
              const action = s.maneuver?.type === 'depart' ? 'Partir hacia' : 'Girar hacia';
              return s.name ? `${action} ${s.name}` : action;
            })
            .filter(Boolean);

          setRouteInfo({
            distanceKm: distKm,
            durationMin: durMin,
            isLoading: false,
            error: null,
            steps: stepInstructions.length > 0 ? stepInstructions : [
              `Tomar la vía principal hacia el destino`,
              `Seguir por ${currentRoute.subtitle || 'el sector'}`,
              `Llegada a ${currentRoute.title}`,
            ],
          });

          // Trazar halo de fondo para efecto Google Maps
          L.polyline(coordinates, {
            color: '#1e3a8a',
            weight: 9,
            opacity: 0.35,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(routeLayer);

          // Trazar línea de ruta azul principal Google Maps
          const mainPolyline = L.polyline(coordinates, {
            color: '#2563eb',
            weight: 5.5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(routeLayer);

          // Ajustar mapa para que encuadre perfectamente la ruta completa
          map.fitBounds(mainPolyline.getBounds(), {
            padding: [60, 60],
            maxZoom: 16,
            animate: true,
          });
        } else {
          throw new Error('No route found');
        }
      })
      .catch(() => {
        if (isCancelled) return;
        // Fallback: Línea geodésica directa suave
        const distKm = parseFloat(approxDist.toFixed(1));
        const durMin = Math.max(3, Math.round(distKm * speedFactor));

        setRouteInfo({
          distanceKm: distKm,
          durationMin: durMin,
          isLoading: false,
          error: null,
          steps: [
            `Tomar ruta directa hacia ${currentRoute.title}`,
            `Aproximadamente ${distKm} km desde tu punto actual`,
            `Llegada a ${currentRoute.title}`,
          ],
        });

        const fallbackCoords: [number, number][] = [
          [startPoint.lat, startPoint.lng],
          [(startPoint.lat + endPoint.lat) / 2 + 0.003, (startPoint.lng + endPoint.lng) / 2],
          [endPoint.lat, endPoint.lng],
        ];

        L.polyline(fallbackCoords, {
          color: '#1e3a8a',
          weight: 8,
          opacity: 0.3,
          lineCap: 'round',
        }).addTo(routeLayer);

        const fallbackLine = L.polyline(fallbackCoords, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.9,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(routeLayer);

        map.fitBounds(fallbackLine.getBounds(), {
          padding: [60, 60],
          maxZoom: 16,
          animate: true,
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [currentRoute, userLocation, travelMode]);

  // Marcadores de Mascotas, Refugios y Veterinarias
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Refugios Oficiales de Protección Animal (Puntos seguros y verificados)
    if (showShelters) {
      SHELTERS_APOPA.forEach((sh) => {
        const shelterIcon = L.divIcon({
          className: 'shelter-marker',
          html: `<div style="width: 32px; height: 32px; border-radius: 12px; background-color: #a855f7; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px;">🏠</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        const marker = L.marker([sh.lat, sh.lng], { icon: shelterIcon });

        const popupDiv = document.createElement('div');
        popupDiv.style.fontFamily = "'Nunito', system-ui, sans-serif";
        popupDiv.style.minWidth = '220px';
        popupDiv.style.padding = '4px';

        popupDiv.innerHTML = `
          <div style="font-weight: 800; font-size: 14px; color: #6b21a8;">${sh.nombre}</div>
          <div style="font-size: 10px; font-weight: 700; color: #a855f7; text-transform: uppercase;">Centro de Refugio Animal</div>
          <div style="font-size: 11px; color: #475569; margin: 4px 0;">${sh.direccion} (${sh.colonia})</div>
          <div style="margin-top: 6px;">
            <button id="route-sh-${sh.id}" style="width: 100%; background: #2563eb; color: white; font-weight: 700; font-size: 11px; padding: 7px 10px; border-radius: 8px; border: none; cursor: pointer;">
              🚗 Trazar camino hacia el refugio
            </button>
          </div>
        `;

        marker.bindPopup(popupDiv);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`route-sh-${sh.id}`);
          if (btn) {
            btn.onclick = () => {
              const dest: RouteDestination = {
                lat: sh.lat,
                lng: sh.lng,
                title: sh.nombre,
                subtitle: sh.direccion,
                isVet: false,
              };
              setCurrentRoute(dest);
              if (onSelectRouteDestination) onSelectRouteDestination(dest);
              marker.closePopup();
            };
          }
        });

        markersLayer.addLayer(marker);
      });
    }

    // 3. Veterinarias Reales de San Salvador y Apopa (Filtrado en tiempo real según búsqueda)
    if (showVets) {
      vetMarkersMapRef.current.clear();
      const vetsToRender = searchQuery.trim() ? filteredVets : VETERINARY_CLINICS;

      vetsToRender.forEach((vet) => {
        const isCurrentDest = currentRoute?.lat === vet.lat && currentRoute?.lng === vet.lng;
        const isApopa = vet.municipio === 'Apopa';

        const vetIcon = L.divIcon({
          className: 'vet-marker',
          html: `<div style="
            width: ${isCurrentDest ? '40px' : '34px'}; 
            height: ${isCurrentDest ? '40px' : '34px'}; 
            border-radius: 12px; 
            background-color: ${isCurrentDest ? '#dc2626' : isApopa ? '#0284c7' : '#0ea5e9'}; 
            border: 2.5px solid #ffffff; 
            box-shadow: ${isCurrentDest ? '0 0 14px rgba(220, 38, 38, 0.8)' : '0 4px 8px rgba(0,0,0,0.25)'}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-size: ${isCurrentDest ? '19px' : '16px'};
            transition: all 0.2s ease;
          ">🏥</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          popupAnchor: [0, -19],
        });

        const marker = L.marker([vet.lat, vet.lng], { icon: vetIcon });

        const popupDiv = document.createElement('div');
        popupDiv.style.fontFamily = "'Nunito', system-ui, sans-serif";
        popupDiv.style.minWidth = '240px';
        popupDiv.style.padding = '4px';

        popupDiv.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
            <div style="font-weight: 800; font-size: 14px; color: #0369a1;">${vet.nombre}</div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px;">
            ${vet.municipio === 'Apopa' ? '<span style="display: inline-block; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: #dcfce7; color: #166534;">📍 Apopa</span>' : ''}
            ${vet.esUrgencias24h ? '<span style="display: inline-block; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: #fee2e2; color: #b91c1c;">🚨 Urgencias 24 Horas Activas</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">📍 ${vet.direccion}</div>
          <div style="font-size: 11px; color: #0284c7; font-weight: 600; margin-bottom: 8px;">⏰ ${vet.horario}</div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <button id="route-vet-${vet.id}" style="width: 100%; background: #2563eb; color: white; font-weight: 700; font-size: 11px; padding: 7px 10px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
              🚗 Trazar camino hacia aquí (Google Maps)
            </button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <a href="tel:+${vet.telefono}" style="display: block; text-align: center; background: #f1f5f9; color: #334155; font-weight: 700; font-size: 11px; padding: 6px; border-radius: 6px; text-decoration: none;">
                📞 Llamar
              </a>
              <a href="https://wa.me/${vet.whatsapp}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #059669; color: white; font-weight: 700; font-size: 11px; padding: 6px; border-radius: 6px; text-decoration: none;">
                💬 WhatsApp
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupDiv);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`route-vet-${vet.id}`);
          if (btn) {
            btn.onclick = () => {
              const dest: RouteDestination = {
                lat: vet.lat,
                lng: vet.lng,
                title: vet.nombre,
                subtitle: vet.direccion,
                isVet: true,
              };
              setCurrentRoute(dest);
              if (onSelectRouteDestination) onSelectRouteDestination(dest);
              marker.closePopup();
            };
          }
        });

        vetMarkersMapRef.current.set(vet.id, marker);
        markersLayer.addLayer(marker);
      });
    }
  }, [showShelters, showVets, currentRoute, searchQuery, filteredVets]);

  // Centrado automático (flyTo/zoom) y enfoque directo con marcador activado
  const handleFocusAndSelectClinic = (vet: typeof VETERINARY_CLINICS[0]) => {
    // 1. Asignar como destino de la ruta interactiva
    const dest: RouteDestination = {
      lat: vet.lat,
      lng: vet.lng,
      title: vet.nombre,
      subtitle: vet.direccion,
      isVet: true,
    };
    setCurrentRoute(dest);
    if (onSelectRouteDestination) onSelectRouteDestination(dest);

    // 2. Asegurarse de que la capa de veterinarias esté visible
    setShowVets(true);

    // 3. Fijar el nombre en el buscador y cerrar el dropdown
    setSearchQuery(vet.nombre);
    setIsSearchOpen(false);

    // 4. Centrado automático con flyTo a nivel de calle con zoom 16
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([vet.lat, vet.lng], 16, {
        animate: true,
        duration: 1.2,
      });

      // 5. Enfocar directamente la ubicación exacta activando su marcador (abrir popup con info)
      setTimeout(() => {
        const marker = vetMarkersMapRef.current.get(vet.id);
        if (marker) {
          marker.openPopup();
        }
      }, 400);
    }
  };

  // Manejador del teclado para seleccionar con Enter o navegar con flechas
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDropdownIndex((prev) =>
        prev < filteredVets.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDropdownIndex((prev) =>
        prev > 0 ? prev - 1 : filteredVets.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredVets.length > 0) {
        const targetVet =
          selectedDropdownIndex >= 0 && selectedDropdownIndex < filteredVets.length
            ? filteredVets[selectedDropdownIndex]
            : filteredVets[0];
        handleFocusAndSelectClinic(targetVet);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  // Selección directa de veterinaria mediante chips
  const handleSelectClinicDestination = (vet: typeof VETERINARY_CLINICS[0]) => {
    handleFocusAndSelectClinic(vet);
  };

  const handleCancelRoute = () => {
    setCurrentRoute(null);
    setRouteInfo(null);
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    if (onClearRoute) onClearRoute();
  };

  const startPointCoords = userLocation || { lat: 13.6989, lng: -89.2208 };
  const googleMapsUrl = currentRoute
    ? `https://www.google.com/maps/dir/?api=1&origin=${startPointCoords.lat},${startPointCoords.lng}&destination=${currentRoute.lat},${currentRoute.lng}&travelmode=${travelMode === 'driving' ? 'driving' : 'walking'}`
    : '';

  // Destacadas para botones rápidos animados
  const quickClinics = VETERINARY_CLINICS.slice(0, 6);

  return (
    <div className="relative w-full h-[720px] min-h-[700px] rounded-3xl overflow-hidden border border-blue-100 shadow-lg bg-[#fffdfa] flex flex-col">
      {/* BARRA SUPERIOR ESTILO GOOGLE MAPS CON MICRO-ANIMACIONES ELÁSTICAS */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-blue-100 flex flex-col gap-2.5 z-10 shadow-2xs">
        
        {/* Fila 1: Título de Navegación y Selector de Modo de Transporte */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
            >
              <Compass className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <span className="font-fredoka text-sm font-bold text-slate-800 block leading-tight">
                Camino hacia la Veterinaria · Google Maps Interactivo
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Selecciona cualquier veterinaria para trazar la ruta en tiempo real
              </span>
            </div>
          </div>

          {/* Selector Auto vs A Pie con animación elástica */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => setTravelMode('driving')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'driving'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>En Auto</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={() => setTravelMode('walking')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'walking'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>A Pie</span>
            </motion.button>
          </div>

          {/* Botones de Control de Capas y GPS */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={handleLocateMe}
              disabled={isLocatingUser}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                userLocation
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Detectar mi ubicación GPS actual"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocatingUser ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Mi GPS</span>
            </motion.button>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold text-slate-700">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowVets(!showVets)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showVets ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Veterinarias</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowShelters(!showShelters)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showShelters ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Refugios Oficiales</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INTERACTIVA DE VETERINARIAS EN TIEMPO REAL */}
        <div ref={searchContainerRef} className="relative z-30">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center">
              <Search className="w-4 h-4 text-blue-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
                setSelectedDropdownIndex(0);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar veterinaria (ej: La Casa del Perro, Apopa, 24 horas...)"
              className="w-full pl-10 pr-24 py-2 bg-slate-50/90 hover:bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200/90 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition-all outline-hidden shadow-2xs"
            />
            
            <div className="absolute right-2.5 flex items-center gap-1">
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  title="Borrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700">
                {filteredVets.length} {filteredVets.length === 1 ? 'opción' : 'opciones'}
              </span>
            </div>
          </div>

          {/* Menú desplegable interactivo con resultados de búsqueda */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 max-h-72 overflow-y-auto z-50 divide-y divide-slate-100"
              >
                {filteredVets.length > 0 ? (
                  filteredVets.map((vet, idx) => {
                    const isHighlighted = idx === selectedDropdownIndex;
                    const isSelected = currentRoute?.lat === vet.lat && currentRoute?.lng === vet.lng;
                    return (
                      <div
                        key={vet.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleFocusAndSelectClinic(vet);
                        }}
                        onMouseEnter={() => setSelectedDropdownIndex(idx)}
                        className={`p-2.5 sm:p-3 cursor-pointer transition-colors flex items-center justify-between gap-2.5 ${
                          isHighlighted ? 'bg-blue-50/80' : isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {vet.nombre}
                            </span>
                            {vet.municipio === 'Apopa' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Apopa
                              </span>
                            )}
                            {vet.esUrgencias24h && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                24 Horas
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{vet.direccion} {vet.colonia ? `· ${vet.colonia}` : ''}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {vet.telefono && (
                            <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-blue-600" />
                              {vet.telefono}
                            </span>
                          )}
                          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs hover:bg-blue-700 transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    <p className="font-semibold text-slate-700">No se encontraron veterinarias para "{searchQuery}"</p>
                    <p className="text-[11px] mt-0.5 text-slate-400">Intenta buscar "La Casa del Perro", "Apopa", o borra el texto para ver todas.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fila 2: Chips Animados para Seleccionar la Veterinaria Destino */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <span>Trazar camino a:</span>
          </span>
          {quickClinics.map((vet) => {
            const isSelected = currentRoute?.lat === vet.lat && currentRoute?.lng === vet.lng;
            return (
              <motion.button
                key={vet.id}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                onClick={() => handleSelectClinicDestination(vet)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                    : 'bg-blue-50/80 text-blue-900 hover:bg-blue-100 border border-blue-200/80'
                }`}
              >
                {vet.esUrgencias24h && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                )}
                <span>{vet.nombre}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Fila 3: Simular punto de partida (útil para pruebas inmediatas sin GPS del dispositivo) */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 overflow-x-auto pb-0.5">
          <span className="font-semibold shrink-0 text-slate-600">Punto de partida:</span>
          {[
            { name: 'Apopa Centro', lat: 13.8062, lng: -89.1795 },
            { name: 'Apopa Popotlán', lat: 13.8185, lng: -89.1760 },
            { name: 'San Salvador Centro', lat: 13.6989, lng: -89.2208 },
            { name: 'Colonia Escalón', lat: 13.7052, lng: -89.2431 },
            { name: 'San Benito', lat: 13.6912, lng: -89.2389 },
            { name: 'Mejicanos', lat: 13.7378, lng: -89.2156 },
            { name: 'Soyapango', lat: 13.7128, lng: -89.1436 },
          ].map((preset) => (
            <motion.button
              key={preset.name}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectStartPreset(preset, preset.name)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium shrink-0 cursor-pointer transition-colors"
            >
              📍 {preset.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* TARJETA FLOTANTE DE RUTA ESTILO GOOGLE MAPS CON INFORMACIÓN EN VIVO */}
        <AnimatePresence>
          {currentRoute && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="absolute bottom-4 left-4 right-4 sm:left-6 sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-blue-200 p-4 shadow-xl z-20 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0"
                  >
                    {travelMode === 'driving' ? <Car className="w-5 h-5" /> : <Footprints className="w-5 h-5" />}
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                      Ruta Trazada en Vivo · Google Maps
                    </span>
                    <h4 className="font-fredoka text-base font-bold text-slate-800 line-clamp-1">
                      {currentRoute.title}
                    </h4>
                    {currentRoute.subtitle && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        📍 {currentRoute.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelRoute}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Cerrar ruta"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Métricas de tiempo y distancia estilo Google Maps */}
              {routeInfo && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-fredoka text-sm">~{routeInfo.durationMin} min</span>
                      <span className="text-slate-500 font-medium">({routeInfo.distanceKm} km {travelMode === 'driving' ? 'en auto' : 'a pie'})</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-lg">
                      Ruta más rápida
                    </span>
                  </div>

                  {/* Toggle para ver pasos detallados */}
                  {routeInfo.steps && routeInfo.steps.length > 0 && (
                    <button
                      onClick={() => setShowTurnSteps(!showTurnSteps)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showTurnSteps ? 'Ocultar pasos del camino' : 'Ver pasos del camino'}</span>
                      <ChevronRight className={`w-3 h-3 transition-transform ${showTurnSteps ? 'rotate-90' : ''}`} />
                    </button>
                  )}

                  {showTurnSteps && routeInfo.steps && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-2.5 bg-[#fdfbf7] rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700 max-h-32 overflow-y-auto"
                    >
                      {routeInfo.steps.map((st, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">↳</span>
                          <span>{st}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Botón para abrir en Google Maps con voz GPS paso a paso */}
              <div className="flex items-center gap-2 pt-1">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[40px] bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Navegar en App Google Maps GPS</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleCancelRoute}
                  className="px-3 min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  Limpiar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensaje de estado GPS flotante discreto */}
        {gpsMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1.5 animate-in fade-in">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{gpsMessage}</span>
            <button onClick={() => setGpsMessage(null)} className="ml-1 text-slate-300 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
