import { OwnerAccount, PetReport } from '../types/pet';
import { INITIAL_PETS } from '../data/initialPets';

const ACCOUNTS_STORAGE_KEY = 'busca_huella_real_user_accounts_v2';
const CURRENT_USER_KEY = 'busca_huella_active_session_v2';
const REPORTS_STORAGE_KEY = 'busca_huella_real_reports_v3';

/**
 * Obtener todas las cuentas creadas en el dispositivo
 */
export function getStoredAccounts(): OwnerAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading accounts from storage:', err);
  }
  return [];
}

/**
 * Guardar cuentas en la base de datos local
 */
export function saveAccounts(accounts: OwnerAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving accounts:', err);
  }
}

/**
 * Obtener la sesión activa del usuario. Devuelve null si no ha iniciado sesión.
 */
export function getCurrentOwner(): OwnerAccount | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.nombre) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading active session:', err);
  }
  return null;
}

/**
 * Establecer o cerrar la sesión activa del usuario
 */
export function setCurrentOwner(account: OwnerAccount | null): void {
  try {
    if (account) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (err) {
    console.error('Error setting current owner:', err);
  }
}

/**
 * Iniciar sesión o registrar nueva cuenta de usuario
 */
export function registerOrLoginOwner(data: {
  nombre: string;
  email: string;
  telefono: string;
  colonia: string;
  municipio: string;
  fotoUrl?: string;
  avatarEmoji?: string;
  esVeterinaria?: boolean;
  licenciaVeterinaria?: string;
  nombreClinica?: string;
}): OwnerAccount {
  const accounts = getStoredAccounts();
  const cleanPhone = data.telefono.replace(/\D/g, '');
  const cleanEmail = data.email.trim().toLowerCase();

  // Buscar si ya existe una cuenta con este correo
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (existing) {
    const updatedUser: OwnerAccount = {
      ...existing,
      nombre: data.nombre.trim(),
      telefono: cleanPhone || existing.telefono,
      colonia: data.colonia.trim(),
      municipio: data.municipio.trim() || 'Apopa',
      fotoUrl: data.fotoUrl !== undefined ? data.fotoUrl : existing.fotoUrl,
      avatarEmoji: data.avatarEmoji || existing.avatarEmoji,
      esVeterinaria: data.esVeterinaria ?? existing.esVeterinaria,
      licenciaVeterinaria: data.licenciaVeterinaria ?? existing.licenciaVeterinaria,
      nombreClinica: data.nombreClinica ?? existing.nombreClinica,
    };

    const updatedList = accounts.map((a) => (a.id === existing.id ? updatedUser : a));
    saveAccounts(updatedList);
    setCurrentOwner(updatedUser);
    return updatedUser;
  }

  // Si no existe, crear nueva cuenta
  const newAccount: OwnerAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    nombre: data.nombre.trim(),
    email: cleanEmail,
    telefono: cleanPhone,
    colonia: data.colonia.trim(),
    municipio: data.municipio.trim() || 'Apopa',
    fotoUrl: data.fotoUrl,
    avatarEmoji: data.avatarEmoji || '🐾',
    esVeterinaria: data.esVeterinaria || false,
    licenciaVeterinaria: data.licenciaVeterinaria,
    nombreClinica: data.nombreClinica,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newAccount, ...accounts];
  saveAccounts(updatedList);
  setCurrentOwner(newAccount);
  return newAccount;
}

/**
 * Actualizar datos de perfil (incluyendo foto de perfil)
 */
export function updateOwnerProfile(
  userId: string,
  updates: Partial<OwnerAccount>
): OwnerAccount | null {
  const accounts = getStoredAccounts();
  const current = accounts.find((a) => a.id === userId);
  if (!current) return null;

  const updated: OwnerAccount = {
    ...current,
    ...updates,
  };

  const updatedList = accounts.map((a) => (a.id === userId ? updated : a));
  saveAccounts(updatedList);

  const active = getCurrentOwner();
  if (active && active.id === userId) {
    setCurrentOwner(updated);
  }

  return updated;
}

/**
 * Cargar todos los reportes de la base de datos
 */
export function getStoredReports(): PetReport[] {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      const parsed: PetReport[] = JSON.parse(stored);
      const valid = parsed.filter((r) => r.fotoUrl && (r.denunciasFalso || 0) < 1);
      if (valid.length > 0) return valid;
    }
  } catch (err) {
    console.warn('Error reading reports:', err);
  }
  return INITIAL_PETS;
}

/**
 * Guardar reportes en la base de datos
 */
export function saveStoredReports(reports: PetReport[]): void {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error('Error saving reports:', err);
  }
}

/**
 * Eliminar permanentemente una publicación por ID
 */
export function deleteReportById(reportId: string): PetReport[] {
  const current = getStoredReports();
  const updated = current.filter((r) => r.id !== reportId);
  saveStoredReports(updated);
  return updated;
}
