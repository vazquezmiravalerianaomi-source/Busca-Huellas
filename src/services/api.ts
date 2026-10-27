import { PetReport, OwnerAccount, AdoptionPet } from '../types/pet';
import { INITIAL_PETS } from '../data/initialPets';

const API_BASE = '/api';

/**
 * Obtener todos los reportes de mascotas sincronizados desde el servidor
 */
export async function apiFetchReports(): Promise<PetReport[]> {
  try {
    const res = await fetch(`${API_BASE}/reports`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[API] Servidor no respondió, usando datos locales:', err);
  }
  return INITIAL_PETS;
}

/**
 * Publicar un nuevo reporte en el servidor (visible para todos los demás usuarios)
 */
export async function apiCreateReport(report: PetReport): Promise<PetReport> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al guardar el reporte en el servidor');
  }

  return await res.json();
}

/**
 * Eliminar un reporte del servidor (se retira para todas las cuentas)
 */
export async function apiDeleteReport(reportId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('[API] Error al eliminar reporte:', err);
    return false;
  }
}

/**
 * Obtener todas las cuentas registradas en el servidor
 */
export async function apiFetchAccounts(): Promise<OwnerAccount[]> {
  try {
    const res = await fetch(`${API_BASE}/accounts`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[API] Error al obtener cuentas del servidor:', err);
  }
  return [];
}

/**
 * Registrar o iniciar sesión en el servidor
 */
export async function apiRegisterOrLogin(data: {
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
}): Promise<OwnerAccount> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al registrar la cuenta en el servidor');
  }

  return await res.json();
}

/**
 * Actualizar datos de perfil en el servidor
 */
export async function apiUpdateAccount(
  userId: string,
  updates: Partial<OwnerAccount>
): Promise<OwnerAccount> {
  const res = await fetch(`${API_BASE}/accounts/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al actualizar el perfil en el servidor');
  }

  return await res.json();
}

/**
 * Obtener casos de adopción veterinaria desde el servidor
 */
export async function apiFetchAdoptions(): Promise<AdoptionPet[]> {
  try {
    const res = await fetch(`${API_BASE}/adoptions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[API] Error al obtener adopciones del servidor:', err);
  }
  return [];
}

/**
 * Publicar una adopción veterinaria certificada en el servidor
 */
export async function apiCreateAdoption(adoption: AdoptionPet): Promise<AdoptionPet> {
  const res = await fetch(`${API_BASE}/adoptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adoption),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al guardar la adopción en el servidor');
  }

  return await res.json();
}

/**
 * Eliminar una adopción veterinaria del servidor
 */
export async function apiDeleteAdoption(adoptionId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/adoptions/${encodeURIComponent(adoptionId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('[API] Error al eliminar adopción:', err);
    return false;
  }
}
