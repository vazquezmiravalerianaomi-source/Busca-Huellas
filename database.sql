-- ==============================================================================
-- BUSCA HUELLA APOPA - BASE DE DATOS MYSQL
-- Sistema Técnico Comunitario: Rastreo, Insignias QR, Refugios, Adopción y Veterinarias
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `busca_huella_apopa`
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `busca_huella_apopa`;

-- 1. Catálogo de colonias y sectores de Apopa con geolocalización
CREATE TABLE IF NOT EXISTS `colonias_apopa` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `sector` VARCHAR(80) NOT NULL DEFAULT 'Urbano',
  `latitud` DECIMAL(10, 7) NOT NULL,
  `longitud` DECIMAL(10, 7) NOT NULL,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Reportes de Mascotas Perdidas y Encontradas con Insignia QR
CREATE TABLE IF NOT EXISTS `reportes_mascotas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `codigo_reporte` VARCHAR(25) NOT NULL UNIQUE,
  `insignia_id` VARCHAR(30) NULL UNIQUE COMMENT 'Identificador de la placa/insignia QR',
  `microchip_id` VARCHAR(30) NULL,
  `tipo_reporte` ENUM('perdido', 'encontrado') NOT NULL,
  `nombre_mascota` VARCHAR(100) DEFAULT 'Sin nombre / Desconocido',
  `especie` ENUM('perro', 'gato', 'ave', 'otro') NOT NULL DEFAULT 'perro',
  `raza_o_caracteristicas` VARCHAR(150) NOT NULL,
  `sexo` ENUM('macho', 'hembra', 'desconocido') NOT NULL DEFAULT 'desconocido',
  `color_principal` VARCHAR(80) NOT NULL,
  `colonia_id` INT UNSIGNED NULL,
  `colonia_nombre` VARCHAR(100) NOT NULL,
  `direccion_referencia` VARCHAR(255) DEFAULT NULL,
  `latitud` DECIMAL(10, 7) NOT NULL,
  `longitud` DECIMAL(10, 7) NOT NULL,
  `fecha_evento` DATE NOT NULL,
  `telefono_contacto` VARCHAR(20) NOT NULL COMMENT 'Formato El Salvador 503XXXXXXXX',
  `nombre_contacto` VARCHAR(100) NOT NULL COMMENT 'Nombre de la dueña o persona de resguardo',
  `tiene_recompensa` TINYINT(1) NOT NULL DEFAULT 0,
  `monto_recompensa` DECIMAL(10, 2) DEFAULT NULL,
  `foto_url` VARCHAR(500) NOT NULL,
  `vacunas_al_dia` TINYINT(1) NOT NULL DEFAULT 1,
  `esterilizado` TINYINT(1) NOT NULL DEFAULT 1,
  `collar_o_accesorios` VARCHAR(150) DEFAULT NULL,
  `estado` ENUM('activo', 'resuelto', 'cancelado') NOT NULL DEFAULT 'activo',
  `notas_adicionales` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tipo_estado` (`tipo_reporte`, `estado`),
  INDEX `idx_insignia` (`insignia_id`),
  CONSTRAINT `fk_reportes_colonia` FOREIGN KEY (`colonia_id`) REFERENCES `colonias_apopa` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Refugios y Centros de Rescate Animal en Apopa
CREATE TABLE IF NOT EXISTS `refugios_apopa` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `tipo` ENUM('refugio', 'hogar_temporal', 'asociacion') NOT NULL DEFAULT 'refugio',
  `descripcion` TEXT NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `colonia_nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `horario` VARCHAR(100) NOT NULL,
  `capacidad_info` VARCHAR(80) NOT NULL,
  `necesidades_donacion` TEXT NULL,
  `latitud` DECIMAL(10, 7) NOT NULL,
  `longitud` DECIMAL(10, 7) NOT NULL,
  `verificado` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Mascotas en Adopción Responsable
CREATE TABLE IF NOT EXISTS `adopciones_mascotas` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `especie` ENUM('perro', 'gato', 'otro') NOT NULL DEFAULT 'perro',
  `raza` VARCHAR(100) NOT NULL,
  `edad_aprox` VARCHAR(50) NOT NULL,
  `sexo` ENUM('macho', 'hembra') NOT NULL,
  `tamano` ENUM('pequeño', 'mediano', 'grande') NOT NULL,
  `esterilizado` TINYINT(1) NOT NULL DEFAULT 1,
  `vacunado` TINYINT(1) NOT NULL DEFAULT 1,
  `desparasitado` TINYINT(1) NOT NULL DEFAULT 1,
  `historia` TEXT NOT NULL,
  `personalidad_tags` VARCHAR(255) NOT NULL,
  `foto_url` VARCHAR(500) NOT NULL,
  `refugio_id` INT UNSIGNED NULL,
  `refugio_nombre` VARCHAR(150) NOT NULL,
  `contacto_whatsapp` VARCHAR(20) NOT NULL,
  `colonia_ubicacion` VARCHAR(100) NOT NULL,
  `estado_adopcion` ENUM('disponible', 'en_proceso', 'adoptado') NOT NULL DEFAULT 'disponible',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_adopcion_refugio` FOREIGN KEY (`refugio_id`) REFERENCES `refugios_apopa` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Clínicas Veterinarias & Urgencias 24 Horas
CREATE TABLE IF NOT EXISTS `clinicas_veterinarias` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) NOT NULL,
  `colonia_nombre` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NOT NULL,
  `whatsapp` VARCHAR(20) NOT NULL,
  `es_urgencias_24h` TINYINT(1) NOT NULL DEFAULT 0,
  `servicios_json` JSON NOT NULL,
  `horario` VARCHAR(100) NOT NULL,
  `latitud` DECIMAL(10, 7) NOT NULL,
  `longitud` DECIMAL(10, 7) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
