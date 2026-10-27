import { AdoptionPet } from '../types/pet';

const ADOPTIONS_STORAGE_KEY = 'busca_huella_vet_official_adoptions_v1';

// Sin ejemplos falsos de adopción: sólo casos gestionados y certificados por veterinarias
export const ADOPTION_PETS: AdoptionPet[] = [];

/**
 * Obtener casos de adopción publicados exclusivamente por clínicas veterinarias autorizadas
 */
export function getStoredAdoptions(): AdoptionPet[] {
  try {
    const raw = localStorage.getItem(ADOPTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading vet adoptions from storage:', err);
  }
  return [];
}

/**
 * Guardar casos de adopción en almacenamiento local
 */
export function saveStoredAdoptions(adoptions: AdoptionPet[]): void {
  try {
    localStorage.setItem(ADOPTIONS_STORAGE_KEY, JSON.stringify(adoptions));
  } catch (err) {
    console.error('Error saving vet adoptions:', err);
  }
}

/**
 * Registrar un nuevo caso de adopción exclusivo de veterinaria certificada
 */
export function publishVetAdoption(newAdoption: AdoptionPet): AdoptionPet[] {
  const current = getStoredAdoptions();
  const updated = [newAdoption, ...current];
  saveStoredAdoptions(updated);
  return updated;
}

/**
 * Eliminar un caso de adopción por ID
 */
export function deleteVetAdoption(adoptionId: string): AdoptionPet[] {
  const current = getStoredAdoptions();
  const updated = current.filter((a) => a.id !== adoptionId);
  saveStoredAdoptions(updated);
  return updated;
}
