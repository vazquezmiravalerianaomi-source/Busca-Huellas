export type ReportType = 'perdido' | 'encontrado';
export type PetSpecies = 'perro' | 'gato' | 'ave' | 'otro';
export type PetGender = 'macho' | 'hembra' | 'desconocido';
export type ReportStatus = 'activo' | 'resuelto';

export interface ColoniaApopa {
  id: string;
  nombre: string;
  sector: string;
  lat: number;
  lng: number;
}

export interface PetReport {
  id: string;
  codigoReporte: string;
  tipo: ReportType;
  nombre: string;
  especie: PetSpecies;
  raza: string;
  color: string;
  sexo: PetGender;
  colonia: string;
  referencia?: string;
  lat: number;
  lng: number;
  fecha: string;
  telefonoContacto: string; // formato 503XXXXXXXX
  nombreContacto: string;
  fotoUrl: string;
  tieneRecompensa: boolean;
  montoRecompensa?: number;
  detallesCollar?: string;
  notas?: string;
  estado: ReportStatus;
  createdAt: string;
  // Perfil técnico del tutor y placa
  insigniaId?: string;
  microchipId?: string;
  vacunasAlDia?: boolean;
  esterilizado?: boolean;
  verificado?: boolean; // Foto real comprobada, no publicación falsa
  denunciasFalso?: number; // Contador de denuncias de publicación falsa o spam
  // Propiedad de la cuenta del dueño
  autorId?: string;
  autorEmail?: string;
  autorNombre?: string;
  autorFotoUrl?: string;
  municipio?: string;
}

export interface OwnerAccount {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  colonia: string;
  municipio: string;
  avatarEmoji?: string;
  fotoUrl?: string; // Foto de perfil subida por la persona
  esVeterinaria?: boolean;
  licenciaVeterinaria?: string;
  nombreClinica?: string;
  createdAt: string;
}

export interface AdoptionPet {
  id: string;
  nombre: string;
  especie: PetSpecies;
  raza: string;
  edadAprox: string;
  sexo: PetGender;
  tamano: 'pequeño' | 'mediano' | 'grande';
  esterilizado: boolean;
  vacunado: boolean;
  desparasitado: boolean;
  historia: string;
  personalidad: string[];
  fotoUrl: string;
  // Solo publicado por Clínicas Veterinarias autorizadas y certificadas legalmente
  clinicaNombre: string;
  clinicaLicencia: string; // Número de Colegiado JVPMV o Registro Sanitario
  clinicaContacto: string; // WhatsApp / Teléfono verificado
  colonia: string;
  municipio?: string;
  urgente: boolean;
  refugioNombre?: string;
  refugioContacto?: string;
  createdAt?: string;
}

export interface ShelterCenter {
  id: string;
  nombre: string;
  tipo: 'refugio' | 'hogar_temporal' | 'asociacion';
  descripcion: string;
  direccion: string;
  colonia: string;
  telefono: string;
  whatsapp: string;
  horario: string;
  capacidad: string;
  necesidadesActuales: string[];
  lat: number;
  lng: number;
  fotoUrl?: string;
  verificado: boolean;
}

export interface VeterinaryClinic {
  id: string;
  nombre: string;
  direccion: string;
  colonia: string;
  municipio?: string;
  telefono: string;
  whatsapp: string;
  esUrgencias24h: boolean;
  servicios: string[];
  horario: string;
  lat: number;
  lng: number;
  sitioWeb?: string;
}

export interface PetCareGuide {
  id: string;
  categoria: 'primeros_auxilios' | 'busqueda_extravio' | 'salud_vacunas' | 'adopcion_responsable';
  titulo: string;
  resumen: string;
  pasos: string[];
  consejoClave: string;
  tiempoLectura: string;
}

export interface DigitalBadgeProfile {
  insigniaId: string;
  nombreMascota: string;
  especie: PetSpecies;
  raza: string;
  color: string;
  edad: string;
  sexo: PetGender;
  esterilizado: boolean;
  condicionMedica: string;
  vacunas: string;
  nombreTutor: string;
  telefonoPrincipal: string;
  telefonoSecundario?: string;
  colonia: string;
  direccionAprox: string;
  mensajeRescate: string;
  fotoUrl: string;
}
