export interface ZonaSanSalvador {
  id: string;
  nombre: string;
  municipio: string;
  lat: number;
  lng: number;
}

// Zonas y sectores clave en todo el Departamento de San Salvador y área metropolitana
export const ZONAS_SAN_SALVADOR: ZonaSanSalvador[] = [
  { id: 'escalon', nombre: 'Colonia Escalón', municipio: 'San Salvador', lat: 13.7025, lng: -89.2430 },
  { id: 'san-benito', nombre: 'Colonia San Benito', municipio: 'San Salvador', lat: 13.6930, lng: -89.2415 },
  { id: 'miramonte', nombre: 'Colonia Miramonte / Los Héroes', municipio: 'San Salvador Centro', lat: 13.7125, lng: -89.2150 },
  { id: 'flor-blanca', nombre: 'Colonia Flor Blanca / Metrocentro', municipio: 'San Salvador', lat: 13.6998, lng: -89.2195 },
  { id: 'san-mateo', nombre: 'Colonia San Mateo / Autopista Sur', municipio: 'San Salvador', lat: 13.6880, lng: -89.2290 },
  { id: 'mejicanos-centro', nombre: 'Mejicanos Centro', municipio: 'Mejicanos', lat: 13.7380, lng: -89.2140 },
  { id: 'mejicanos-mariona', nombre: 'Mejicanos (Calle a Mariona)', municipio: 'Mejicanos', lat: 13.7510, lng: -89.2180 },
  { id: 'soyapango-centro', nombre: 'Soyapango Centro', municipio: 'Soyapango', lat: 13.7120, lng: -89.1410 },
  { id: 'soyapango-prados', nombre: 'Prados de Venecia / Sierra Morena', municipio: 'Soyapango', lat: 13.7040, lng: -89.1290 },
  { id: 'ilopango', nombre: 'San Bartolo / Ilopango', municipio: 'Ilopango', lat: 13.7010, lng: -89.1090 },
  { id: 'san-marcos', nombre: 'San Marcos Centro', municipio: 'San Marcos', lat: 13.6620, lng: -89.1830 },
  { id: 'antiguo-cuscatlan', nombre: 'Antiguo Cuscatlán / Santa Elena', municipio: 'Antiguo Cuscatlán', lat: 13.6765, lng: -89.2512 },
  { id: 'santa-tecla', nombre: 'Santa Tecla / El Cafetalón', municipio: 'Santa Tecla', lat: 13.6730, lng: -89.2840 },
  { id: 'ciudad-delgado', nombre: 'Ciudad Delgado Centro', municipio: 'Ciudad Delgado', lat: 13.7250, lng: -89.1880 },
  { id: 'cuscatancingo', nombre: 'Cuscatancingo Centro', municipio: 'Cuscatancingo', lat: 13.7420, lng: -89.1840 },
  { id: 'apopa-centro', nombre: 'Apopa Centro / Parque Central', municipio: 'Apopa', lat: 13.8073, lng: -89.1795 },
  { id: 'apopa-popotlan', nombre: 'Popotlán / Valle del Sol', municipio: 'Apopa', lat: 13.8205, lng: -89.1764 },
  { id: 'apopa-chintuc', nombre: 'Chintuc / San Leonardo', municipio: 'Apopa', lat: 13.7998, lng: -89.1832 },
];

// Compatibilidad con imports existentes
export const COLONIAS_APOPA = ZONAS_SAN_SALVADOR.map(z => ({
  id: z.id,
  nombre: z.nombre,
  sector: z.municipio,
  lat: z.lat,
  lng: z.lng,
}));

// Centro geográfico representativo de San Salvador
export const SAN_SALVADOR_CENTER = {
  lat: 13.6989,
  lng: -89.2208,
  zoom: 13,
};

export const APOPA_CENTER = SAN_SALVADOR_CENTER;
