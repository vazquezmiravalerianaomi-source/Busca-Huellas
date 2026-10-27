import React, { useState } from 'react';
import { Database, FolderTree, Code, Copy, Check, Server, Terminal, ExternalLink } from 'lucide-react';

interface TechDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechDocsModal: React.FC<TechDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'folders' | 'backend'>('sql');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const sqlContent = `-- BASE DE DATOS MYSQL: busca_huella_apopa
CREATE DATABASE IF NOT EXISTS \`busca_huella_apopa\`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`busca_huella_apopa\`;

-- 1. Tabla de Reportes con Insignia QR y Perfil del Tutor
CREATE TABLE IF NOT EXISTS \`reportes_mascotas\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`codigo_reporte\` VARCHAR(25) NOT NULL UNIQUE,
  \`insignia_id\` VARCHAR(30) NULL UNIQUE,
  \`tipo_reporte\` ENUM('perdido', 'encontrado') NOT NULL,
  \`nombre_mascota\` VARCHAR(100) NOT NULL,
  \`especie\` ENUM('perro', 'gato', 'ave', 'otro') NOT NULL,
  \`raza_o_caracteristicas\` VARCHAR(150) NOT NULL,
  \`sexo\` ENUM('macho', 'hembra', 'desconocido') NOT NULL,
  \`color_principal\` VARCHAR(80) NOT NULL,
  \`colonia_nombre\` VARCHAR(100) NOT NULL,
  \`latitud\` DECIMAL(10, 7) NOT NULL,
  \`longitud\` DECIMAL(10, 7) NOT NULL,
  \`fecha_evento\` DATE NOT NULL,
  \`telefono_contacto\` VARCHAR(20) NOT NULL COMMENT 'Formato 503XXXXXXXX',
  \`nombre_contacto\` VARCHAR(100) NOT NULL COMMENT 'Dueña o tutor responsable',
  \`tiene_recompensa\` TINYINT(1) NOT NULL DEFAULT 0,
  \`monto_recompensa\` DECIMAL(10, 2) NULL,
  \`foto_url\` VARCHAR(500) NOT NULL,
  \`vacunas_al_dia\` TINYINT(1) NOT NULL DEFAULT 1,
  \`esterilizado\` TINYINT(1) NOT NULL DEFAULT 1,
  \`estado\` ENUM('activo', 'resuelto', 'cancelado') NOT NULL DEFAULT 'activo',
  \`notas_adicionales\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de Centros de Refugio Animal
CREATE TABLE IF NOT EXISTS \`refugios_apopa\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`tipo\` ENUM('refugio', 'hogar_temporal', 'asociacion') NOT NULL,
  \`direccion\` VARCHAR(255) NOT NULL,
  \`colonia_nombre\` VARCHAR(100) NOT NULL,
  \`telefono\` VARCHAR(20) NOT NULL,
  \`whatsapp\` VARCHAR(20) NOT NULL,
  \`horario\` VARCHAR(100) NOT NULL,
  \`necesidades_donacion\` TEXT NULL,
  \`latitud\` DECIMAL(10, 7) NOT NULL,
  \`longitud\` DECIMAL(10, 7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de Mascotas en Adopción
CREATE TABLE IF NOT EXISTS \`adopciones_mascotas\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(100) NOT NULL,
  \`especie\` ENUM('perro', 'gato') NOT NULL,
  \`raza\` VARCHAR(100) NOT NULL,
  \`edad_aprox\` VARCHAR(50) NOT NULL,
  \`esterilizado\` TINYINT(1) NOT NULL DEFAULT 1,
  \`vacunado\` TINYINT(1) NOT NULL DEFAULT 1,
  \`historia\` TEXT NOT NULL,
  \`refugio_nombre\` VARCHAR(150) NOT NULL,
  \`contacto_whatsapp\` VARCHAR(20) NOT NULL,
  \`estado_adopcion\` ENUM('disponible', 'adoptado') DEFAULT 'disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla de Clínicas Veterinarias & Urgencias 24h
CREATE TABLE IF NOT EXISTS \`clinicas_veterinarias\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`nombre\` VARCHAR(150) NOT NULL,
  \`direccion\` VARCHAR(255) NOT NULL,
  \`telefono\` VARCHAR(20) NOT NULL,
  \`whatsapp\` VARCHAR(20) NOT NULL,
  \`es_urgencias_24h\` TINYINT(1) NOT NULL DEFAULT 0,
  \`servicios_json\` JSON NOT NULL,
  \`horario\` VARCHAR(100) NOT NULL,
  \`latitud\` DECIMAL(10, 7) NOT NULL,
  \`longitud\` DECIMAL(10, 7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const folderStructure = `busca-huella-apopa/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Barra superior tierna y limpia con logo Busca Huella
│   │   ├── PetCard.tsx              # Tarjetas con insignia, botón de WhatsApp y perfil de dueña
│   │   ├── PetProfileModal.tsx      # Ficha técnica completa de la mascota & perfil de la dueña
│   │   ├── PetMap.tsx               # Mapa Leaflet multicapa: Mascotas, Refugios y Veterinarias
│   │   ├── SheltersDirectory.tsx    # Directorio de Refugios y Centros de Rescate en Apopa
│   │   ├── AdoptionsSection.tsx     # Apartado de adopción responsable con perritos y gatitos
│   │   ├── VeterinaryDirectory.tsx  # Directorio de clínicas veterinarias y urgencias 24/7
│   │   ├── GuidesSection.tsx        # Recomendaciones de salud, vacunas y primeros auxilios
│   │   ├── ReportModal.tsx          # Formulario de registro (Perdido / Encontrado)
│   │   └── QRGeneratorModal.tsx     # Generador de insignia/placa digital para collar
│   ├── data/
│   │   ├── colonias.ts              # Coordenadas de Popotlán, Madre Tierra, Chintuc, etc.
│   │   ├── sheltersAndVets.ts       # Refugios y clínicas veterinarias georreferenciadas
│   │   ├── adoptions.ts             # Catálogo de mascotas esperando hogar
│   │   ├── guides.ts                # Protocolos técnicos de búsqueda y primeros auxilios
│   │   └── initialPets.ts           # Casos iniciales con insignias de identificación
│   ├── types/
│   │   └── pet.ts                   # Modelos TypeScript del ecosistema Busca Huella
│   ├── App.tsx                      # Orquestador con paleta pastel tierna y barra táctil móvil
│   └── index.css                    # Tailwind CSS v4 y estilos de mapa
├── database.sql                     # Script DDL MySQL completo
├── server.ts                        # API Express con endpoints REST para MySQL
└── index.html                       # Entrypoint con metaetiquetas y Leaflet`;

  const backendCode = `// server.js (Node.js con Express y MySQL2)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'busca_huella_apopa',
});

// GET /api/reportes - Mascotas activas
app.get('/api/reportes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM reportes_mascotas WHERE estado = "activo" ORDER BY id DESC');
  res.json(rows);
});

// GET /api/insignia/:id - Ficha técnica y contacto de la dueña vía escaneo QR
app.get('/api/insignia/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM reportes_mascotas WHERE insignia_id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Insignia no encontrada' });
  res.json(rows[0]);
});

// GET /api/refugios - Centros de refugio y rescate en Apopa
app.get('/api/refugios', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM refugios_apopa');
  res.json(rows);
});

// GET /api/veterinarias - Clínicas y urgencias 24h
app.get('/api/veterinarias', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM clinicas_veterinarias');
  res.json(rows);
});

app.listen(3001, () => console.log('Busca Huella API escuchando en puerto 3001'));`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fffdfa] rounded-3xl max-w-3xl w-full border border-rose-100 shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Arquitectura Técnica & MySQL · Busca Huella
              </h2>
              <p className="text-xs text-slate-500">
                Estructura de archivos, base de datos relacional y servicios backend
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-rose-200 rounded-xl cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <div className="flex border-b border-rose-100 bg-rose-50/30 p-2 gap-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-rose-500" />
            <span>1. MySQL (database.sql)</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'folders'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-sky-500" />
            <span>2. Carpetas del Proyecto</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'backend'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-500" />
            <span>3. Backend API</span>
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'sql' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-600">
                  Tablas relacionales: reportes con insignia, refugios, adopciones y veterinarias 24h:
                </p>
                <button
                  onClick={() => copyToClipboard(sqlContent, 'sql')}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copied === 'sql' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-300 text-xs font-mono rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
                {sqlContent}
              </pre>
            </div>
          )}

          {activeTab === 'folders' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-600">
                  Organización modular del frontend, datos georreferenciados y componentes:
                </p>
                <button
                  onClick={() => copyToClipboard(folderStructure, 'folders')}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copied === 'folders' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Estructura</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-amber-200 text-xs font-mono rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
                {folderStructure}
              </pre>
            </div>
          )}

          {activeTab === 'backend' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-600">
                  Controladores Node.js / Express con endpoints para lectura de insignias y refugios:
                </p>
                <button
                  onClick={() => copyToClipboard(backendCode, 'backend')}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copied === 'backend' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Backend</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-cyan-300 text-xs font-mono rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
                {backendCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
