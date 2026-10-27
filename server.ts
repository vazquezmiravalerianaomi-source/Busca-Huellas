import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(__dirname, 'server_db.json');

// Interface para la base de datos central en el servidor
interface UserAccount {
  id: string;
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
  createdAt: string;
}

interface PetReport {
  id: string;
  codigoReporte: string;
  tipo: 'perdido' | 'encontrado';
  nombre: string;
  especie: string;
  raza: string;
  color: string;
  sexo: string;
  colonia: string;
  municipio?: string;
  referencia?: string;
  lat: number;
  lng: number;
  fecha: string;
  telefonoContacto: string;
  nombreContacto: string;
  fotoUrl: string;
  tieneRecompensa: boolean;
  montoRecompensa?: number;
  detallesCollar?: string;
  notas?: string;
  estado: 'activo' | 'resuelto';
  createdAt: string;
  insigniaId?: string;
  microchipId?: string;
  vacunasAlDia?: boolean;
  esterilizado?: boolean;
  verificado?: boolean;
  denunciasFalso?: number;
  autorId?: string;
  autorEmail?: string;
  autorNombre?: string;
  autorFotoUrl?: string;
}

interface AdoptionPet {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edadAprox: string;
  sexo: string;
  tamano: string;
  esterilizado: boolean;
  vacunado: boolean;
  desparasitado: boolean;
  historia: string;
  personalidad: string[];
  fotoUrl: string;
  clinicaNombre: string;
  clinicaLicencia: string;
  clinicaContacto: string;
  colonia: string;
  municipio?: string;
  urgente: boolean;
  createdAt: string;
}

interface ServerDB {
  users: UserAccount[];
  reports: PetReport[];
  adoptions: AdoptionPet[];
  lastUpdated: string;
}

// Datos iniciales si la base de datos es creada por primera vez
const INITIAL_REPORTS_SEED: PetReport[] = [
  {
    id: 'bh-real-apopa-001',
    codigoReporte: 'BH-APO-5012',
    tipo: 'perdido',
    nombre: 'Rocky',
    especie: 'perro',
    raza: 'Mestizo de Schnauzer',
    color: 'Gris pimienta con patitas claras',
    sexo: 'macho',
    colonia: 'Centro de Apopa',
    municipio: 'Apopa',
    referencia: 'Visto por última vez en las cercanías del Parque Central y Mercado Municipal de Apopa',
    lat: 13.8062,
    lng: -89.1795,
    fecha: '2026-10-24',
    telefonoContacto: '50372558899',
    nombreContacto: 'Familia Morales',
    fotoUrl: '/src/assets/images/french_poodle_apopa_1791413765882.jpg',
    tieneRecompensa: true,
    montoRecompensa: 40,
    detallesCollar: 'Collar azul marino con placa reflectiva',
    notas: 'Es muy asustadizo con los camiones y petardos. Responde cariñosamente por su nombre.',
    estado: 'activo',
    createdAt: '2026-10-24T16:00:00Z',
    insigniaId: 'BH-5012-APO',
    vacunasAlDia: true,
    esterilizado: true,
    verificado: true,
    denunciasFalso: 0,
  },
  {
    id: 'bh-real-apopa-002',
    codigoReporte: 'BH-POP-8120',
    tipo: 'encontrado',
    nombre: 'Gatito Naranja en Resguardo',
    especie: 'gato',
    raza: 'Mestizo Atigrado Naranja',
    color: 'Naranja claro con blanco en el pecho',
    sexo: 'macho',
    colonia: 'Popotlán 1',
    municipio: 'Apopa',
    referencia: 'Encontrado resguardándose de la lluvia cerca de la terminal de buses de Popotlán',
    lat: 13.8185,
    lng: -89.1760,
    fecha: '2026-10-25',
    telefonoContacto: '50371994433',
    nombreContacto: 'Vecinos Unidos Popotlán',
    fotoUrl: '/src/assets/images/tabby_cat_apopa_1791413757252.jpg',
    tieneRecompensa: false,
    detallesCollar: 'Sin collar al momento del rescate',
    notas: 'Está limpio, bien alimentado y sumamente dócil. Lo tenemos a salvo con agua y alimento.',
    estado: 'activo',
    createdAt: '2026-10-25T11:30:00Z',
    vacunasAlDia: true,
    esterilizado: false,
    verificado: true,
    denunciasFalso: 0,
  },
  {
    id: 'bh-real-001',
    codigoReporte: 'BH-ESC-7749',
    tipo: 'perdido',
    nombre: 'Max',
    especie: 'perro',
    raza: 'Golden Retriever Mestizo',
    color: 'Dorado / Miel con pecho claro',
    sexo: 'macho',
    colonia: 'Colonia Escalón',
    municipio: 'San Salvador',
    referencia: 'Visto por última vez cerca del Paseo General Escalón y Calle José Martí',
    lat: 13.7025,
    lng: -89.2430,
    fecha: '2026-10-20',
    telefonoContacto: '50371234567',
    nombreContacto: 'Karla Guardado',
    fotoUrl: '/src/assets/images/golden_retriever_apopa_1791413746869.jpg',
    tieneRecompensa: true,
    montoRecompensa: 50,
    detallesCollar: 'Insignia Busca Huella anaranjada con código QR grabado',
    notas: 'Es muy dócil y amigable con niños. Alérgico al pollo crudo. Responde de inmediato a su silbido.',
    estado: 'activo',
    createdAt: '2026-10-20T14:30:00Z',
    insigniaId: 'BH-7749-ESC',
    microchipId: '985141002341991',
    vacunasAlDia: true,
    esterilizado: true,
    verificado: true,
    denunciasFalso: 0,
  },
  {
    id: 'bh-real-002',
    codigoReporte: 'BH-SBN-3312',
    tipo: 'perdido',
    nombre: 'Michi / Nala',
    especie: 'gato',
    raza: 'Atigrada Común',
    color: 'Gris con rayas oscuras y ojos verdes',
    sexo: 'hembra',
    colonia: 'Colonia San Benito',
    municipio: 'San Salvador',
    referencia: 'Salió del jardín sobre el Boulevard del Hipódromo, cerca de zona gastronómica',
    lat: 13.6930,
    lng: -89.2415,
    fecha: '2026-10-21',
    telefonoContacto: '50378901234',
    nombreContacto: 'Roberto Henríquez',
    fotoUrl: '/src/assets/images/tabby_cat_apopa_1791413757252.jpg',
    tieneRecompensa: false,
    detallesCollar: 'Collar morado suave con pequeña chapita de cascabel silencioso',
    notas: 'Ojos verdes intensos, tímida ante ruidos de motores. Por favor avisar si la ven resguardada.',
    estado: 'activo',
    createdAt: '2026-10-21T09:15:00Z',
    insigniaId: 'BH-3312-SBN',
    vacunasAlDia: true,
    esterilizado: true,
    verificado: true,
    denunciasFalso: 0,
  },
];

function loadDatabase(): ServerDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.reports)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading server DB file, initializing new one:', err);
  }

  const initialDB: ServerDB = {
    users: [],
    reports: INITIAL_REPORTS_SEED,
    adoptions: [],
    lastUpdated: new Date().toISOString(),
  };
  saveDatabase(initialDB);
  return initialDB;
}

function saveDatabase(db: ServerDB): void {
  try {
    db.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server database:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Permitir subida de fotos base64 hasta 25mb
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==========================================
  // RUTAS DE LA API REST CENTRALIZADA (/api/*)
  // ==========================================

  // 1. Healthcheck y estado del servidor
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      server: 'Busca Huella Server',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Obtener todas las cuentas registradas en el servidor
  app.get('/api/accounts', (_req: Request, res: Response) => {
    const db = loadDatabase();
    res.json(db.users);
  });

  // 3. Registro o inicio de sesión de usuario en el servidor
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const {
      nombre,
      email,
      telefono,
      colonia,
      municipio,
      fotoUrl,
      avatarEmoji,
      esVeterinaria,
      licenciaVeterinaria,
      nombreClinica,
    } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos.' });
    }

    const db = loadDatabase();
    const cleanEmail = String(email).trim().toLowerCase();
    const existingIndex = db.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    let user: UserAccount;

    if (existingIndex >= 0) {
      // Actualizar usuario existente
      user = {
        ...db.users[existingIndex],
        nombre: String(nombre).trim(),
        telefono: String(telefono || db.users[existingIndex].telefono).replace(/\D/g, ''),
        colonia: String(colonia || db.users[existingIndex].colonia).trim(),
        municipio: String(municipio || db.users[existingIndex].municipio || 'Apopa').trim(),
        fotoUrl: fotoUrl !== undefined ? fotoUrl : db.users[existingIndex].fotoUrl,
        avatarEmoji: avatarEmoji || db.users[existingIndex].avatarEmoji,
        esVeterinaria: esVeterinaria !== undefined ? esVeterinaria : db.users[existingIndex].esVeterinaria,
        licenciaVeterinaria: licenciaVeterinaria || db.users[existingIndex].licenciaVeterinaria,
        nombreClinica: nombreClinica || db.users[existingIndex].nombreClinica,
      };
      db.users[existingIndex] = user;
    } else {
      // Crear nueva cuenta en el servidor
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        nombre: String(nombre).trim(),
        email: cleanEmail,
        telefono: String(telefono || '').replace(/\D/g, ''),
        colonia: String(colonia || 'Centro de Apopa').trim(),
        municipio: String(municipio || 'Apopa').trim(),
        fotoUrl: fotoUrl || undefined,
        avatarEmoji: avatarEmoji || '🐾',
        esVeterinaria: Boolean(esVeterinaria),
        licenciaVeterinaria: licenciaVeterinaria ? String(licenciaVeterinaria).trim() : undefined,
        nombreClinica: nombreClinica ? String(nombreClinica).trim() : undefined,
        createdAt: new Date().toISOString(),
      };
      db.users.unshift(user);
    }

    saveDatabase(db);
    res.json(user);
  });

  // 4. Actualizar perfil de usuario
  app.put('/api/accounts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    const userIndex = db.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const current = db.users[userIndex];
    const updated: UserAccount = {
      ...current,
      ...req.body,
      id: current.id, // ID inmutable
    };

    db.users[userIndex] = updated;
    saveDatabase(db);
    res.json(updated);
  });

  // 5. OBTENER REPORTES DE MASCOTAS (Compartidos en tiempo real entre todos los usuarios)
  app.get('/api/reports', (req: Request, res: Response) => {
    const db = loadDatabase();
    res.json(db.reports);
  });

  // 6. PUBLICAR MASCOTA (Visible instantáneamente para todas las demás cuentas)
  app.post('/api/reports', (req: Request, res: Response) => {
    const newReport = req.body as PetReport;

    if (!newReport.nombre || !newReport.fotoUrl) {
      return res.status(400).json({ error: 'Nombre y fotografía son requeridos para publicar.' });
    }

    const db = loadDatabase();

    const reportToAdd: PetReport = {
      ...newReport,
      id: newReport.id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: newReport.createdAt || new Date().toISOString(),
      estado: newReport.estado || 'activo',
    };

    // Añadir al inicio para que aparezca de inmediato como más reciente
    db.reports.unshift(reportToAdd);
    saveDatabase(db);

    console.log(`[API] Nuevo reporte publicado: "${reportToAdd.nombre}" por ${reportToAdd.autorNombre || 'Anónimo'}`);
    res.status(201).json(reportToAdd);
  });

  // 7. BORRAR PUBLICACIÓN (Se elimina del servidor para todas las cuentas)
  app.delete('/api/reports/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    const initialCount = db.reports.length;
    db.reports = db.reports.filter((r) => r.id !== id);

    if (db.reports.length === initialCount) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    saveDatabase(db);
    console.log(`[API] Reporte eliminado: ${id}`);
    res.json({ success: true, deletedId: id });
  });

  // 8. OBTENER ADOPCIONES DE VETERINARIAS
  app.get('/api/adoptions', (_req: Request, res: Response) => {
    const db = loadDatabase();
    res.json(db.adoptions);
  });

  // 9. PUBLICAR ADOPCIÓN (Exclusivo Veterinarias con certificación)
  app.post('/api/adoptions', (req: Request, res: Response) => {
    const newAdoption = req.body as AdoptionPet;

    if (!newAdoption.nombre || !newAdoption.clinicaLicencia || !newAdoption.fotoUrl) {
      return res.status(400).json({
        error: 'Nombre de mascota, fotografía y número de colegiado/licencia veterinaria son obligatorios.',
      });
    }

    const db = loadDatabase();
    const adoptionToAdd: AdoptionPet = {
      ...newAdoption,
      id: newAdoption.id || `vet-adopt-${Date.now()}`,
      createdAt: newAdoption.createdAt || new Date().toISOString(),
    };

    db.adoptions.unshift(adoptionToAdd);
    saveDatabase(db);

    console.log(`[API] Nueva adopción registrada por veterinaria: "${adoptionToAdd.clinicaNombre}"`);
    res.status(201).json(adoptionToAdd);
  });

  // 10. ELIMINAR ADOPCIÓN
  app.delete('/api/adoptions/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDatabase();
    db.adoptions = db.adoptions.filter((a) => a.id !== id);
    saveDatabase(db);
    res.json({ success: true, deletedId: id });
  });

  // ==========================================
  // CONFIGURACIÓN DE VITE / FRONTEND EN DEV
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Busca Huella servidor full-stack activo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
