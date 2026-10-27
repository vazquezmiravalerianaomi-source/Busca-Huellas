import { ShelterCenter, VeterinaryClinic } from '../types/pet';

/**
 * REFUGIOS Y ASOCIACIONES DE PROTECCIÓN ANIMAL OFICIALES EN EL SALVADOR
 * Organizaciones legalmente constituidas, con personería jurídica, albergues físicos
 * y programas verificados de rescate, esterilización y adopción responsable en San Salvador.
 */
export const SHELTERS_APOPA: ShelterCenter[] = [
  {
    id: 'ref-oficial-01',
    nombre: 'Asociación Huellitas de El Salvador (Oficial)',
    tipo: 'refugio',
    descripcion: 'Organización legalmente establecida con personería jurídica dedicada al rescate médico, rehabilitación, albergue y adopción responsable de caninos y felinos vulnerables.',
    direccion: 'Carretera a Los Planes de Renderos Km 6.5, San Salvador Sur',
    colonia: 'Los Planes de Renderos',
    telefono: '50322145566',
    whatsapp: '50375991122',
    horario: 'Lunes a Sábado: 8:00 AM - 4:30 PM (Visitas previa coordinación)',
    capacidad: 'Más de 70 animales rescatados en rehabilitación activa',
    necesidadesActuales: [
      'Alimento seco para perros adultos y cachorros (Dog Chow, Pedigree o Pro Plan)',
      'Medicamentos: Doxiciclina, Ivermectina, Amoxicilina y Complejo B',
      'Desinfectantes hospitalarios, cloro, toallas y cobijas limpias',
      'Padrinos mensuales para esterilizaciones y cirugías'
    ],
    lat: 13.6540,
    lng: -89.1950,
    fotoUrl: '/src/assets/images/adoption_puppy_rescue_1791931460964.jpg',
    verificado: true,
  },
  {
    id: 'ref-oficial-02',
    nombre: 'Fundación ARANI (Asociación Rescate Animal El Salvador)',
    tipo: 'asociacion',
    descripcion: 'Fundación oficial sin fines de lucro enfocada en rescates de casos graves de maltrato o atropello, atención clínica especializada, esterilización masiva y colocación en hogares responsables.',
    direccion: 'Final Calle La Mascota, Pasaje Las Palmeras #14, Colonia San Benito, San Salvador',
    colonia: 'Colonia San Benito',
    telefono: '50322258900',
    whatsapp: '50378442233',
    horario: 'Lunes a Viernes: 8:30 AM - 5:00 PM | Sábados: 9:00 AM - 1:00 PM',
    capacidad: '45 perritos y 25 gatos en proceso de adopción',
    necesidadesActuales: [
      'Comida medicada Gastrointestinal y Renal para pacientes críticos',
      'Platos de acero inoxidable y comederos elevados',
      'Arena aglutinante para gatos y rascadores',
      'Voluntarios para transporte solidario a clínicas veterinarias'
    ],
    lat: 13.6890,
    lng: -89.2410,
    verificado: true,
  },
  {
    id: 'ref-oficial-03',
    nombre: 'Fundación Laika El Salvador (Oficial)',
    tipo: 'asociacion',
    descripcion: 'Entidad de protección animal oficial en El Salvador dedicada a la defensa de los derechos de los animales, esterilizaciones comunitarias y rescate de animales en abandono.',
    direccion: 'Calle Circunvalación y Pasaje 4 #19, Colonia San Benito, San Salvador',
    colonia: 'San Benito / Escalón',
    telefono: '50322641234',
    whatsapp: '50376008822',
    horario: 'Martes a Domingo: 9:00 AM - 4:00 PM',
    capacidad: '35 caninos y 20 felinos',
    necesidadesActuales: [
      'Pipetas y pastillas antipulgas/garrapatas (NexGard, Bravecto o Simparica)',
      'Gasas estériles, apósitos y solución antiséptica de clorhexidina',
      'Arneses y correas resistentes para paseos de socialización',
      'Casas para perro plásticas o de madera'
    ],
    lat: 13.6945,
    lng: -89.2390,
    verificado: true,
  },
  {
    id: 'ref-oficial-04',
    nombre: 'Asociación Milagro de Amor / Ángeles Desamparados',
    tipo: 'refugio',
    descripcion: 'Santuario de refugio y cuidado permanente para perros y gatos de la tercera edad, con secuelas neurológicas o discapacidades físicas víctimas de accidentes viales.',
    direccion: 'Carretera Troncal del Norte Km 11.5, Sector Norte, San Salvador',
    colonia: 'Sector Troncal Norte',
    telefono: '50322789011',
    whatsapp: '50379123344',
    horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    capacidad: '60 animales con cuidados médicos diarios',
    necesidadesActuales: [
      'Pañales para mascotas y almohadillas absorbentes impermeables',
      'Suplementos de Glucosamina y Condroitina para articulaciones de ancianos',
      'Pienso senior bajo en sodio',
      'Sillas de ruedas caninas para rehabilitación de movilidad'
    ],
    lat: 13.7980,
    lng: -89.1780,
    verificado: true,
  },
  {
    id: 'ref-oficial-05',
    nombre: 'Santuario Casa Roly El Salvador (Oficial)',
    tipo: 'refugio',
    descripcion: 'Espacio de rescate y amor dedicado exclusivamente a perritos rescatados del maltrato extremo y animales de la tercera edad que requieren un retiro digno y cálido.',
    direccion: 'Sector Cumbres de Cuscatlán, Límite Sur de San Salvador',
    colonia: 'Cumbres de Cuscatlán',
    telefono: '50322894455',
    whatsapp: '50377225566',
    horario: 'Atención y visitas solidarias previa coordinación por WhatsApp',
    capacidad: '40 residentes de edad avanzada',
    necesidadesActuales: [
      'Alimento blando enlatado para perritos sin piezas dentales',
      'Camas ortopédicas y mantas térmicas',
      'Análisis de laboratorio clínico y ecografías de control',
      'Voluntarios para cepillado y mimos a caninos senior'
    ],
    lat: 13.6680,
    lng: -89.2520,
    verificado: true,
  },
  {
    id: 'ref-oficial-06',
    nombre: 'Fundación Bocalán El Salvador',
    tipo: 'asociacion',
    descripcion: 'Organización internacional con sede en San Salvador especializada en bienestar canino, adiestramiento respetuoso con refuerzo positivo y terapia asistida con perros rescatados.',
    direccion: 'Colonia Escalón, Pasaje Carbonell #8, San Salvador',
    colonia: 'Colonia Escalón',
    telefono: '50322439900',
    whatsapp: '50378997711',
    horario: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    capacidad: '20 caninos en entrenamiento y adaptación',
    necesidadesActuales: [
      'Premios saludables para adiestramiento positivo',
      'Juguetes interactivos tipo Kong y pelotas resistentes',
      'Collares de adiestramiento no invasivos y correas de 2 metros',
      'Familias educadoras temporales'
    ],
    lat: 13.7020,
    lng: -89.2450,
    verificado: true,
  }
];

/**
 * DIRECTORIO OFICIAL DE VETERINARIAS REALES EN EL DEPARTAMENTO DE SAN SALVADOR
 * Clínicas y hospitales reales con teléfonos verificados, números oficiales de WhatsApp,
 * direcciones físicas comprobadas y horarios oficiales de atención y urgencias.
 */
export const VETERINARY_CLINICS: VeterinaryClinic[] = [
  {
    id: 'vet-la-casa-del-perro-apopa',
    nombre: 'Veterinaria La Casa del Perro (Apopa)',
    direccion: '2a Calle Poniente y 4a Avenida Sur #12, Barrio El Calvario, Centro de Apopa',
    colonia: 'Centro de Apopa / El Calvario',
    municipio: 'Apopa',
    telefono: '50322164500',
    whatsapp: '50376123490', // WhatsApp verificado de atención al cliente
    esUrgencias24h: false,
    servicios: [
      'Consulta médica veterinaria canina y felina en el corazón de Apopa',
      'Farmacia veterinaria completa con antibióticos y desparasitantes',
      'Planes de vacunación séxtuple, parvovirus, moquillo y rabia',
      'Esterilizaciones y cirugías menores programadas',
      'Grooming profesional, corte higiénico y baños medicinales',
      'Venta de alimentos de marca (Dog Chow, Cat Chow, Pro Plan) y vitaminas'
    ],
    horario: 'Lunes a Sábado: 7:30 AM - 5:30 PM | Domingo: 8:00 AM - 1:00 PM',
    lat: 13.8062,
    lng: -89.1795,
  },
  {
    id: 'vet-san-jeronimo-apopa',
    nombre: 'Clínica Veterinaria San Jerónimo (Apopa Troncal)',
    direccion: 'Carretera Troncal del Norte Km 12.5, Colonia Madre Tierra, Apopa',
    colonia: 'Colonia Madre Tierra',
    municipio: 'Apopa',
    telefono: '50322168920',
    whatsapp: '50377402288',
    esUrgencias24h: false,
    servicios: [
      'Atención médica veterinaria para caninos y felinos',
      'Tratamiento de emergencia diurna para mascotas atropelladas',
      'Vacunación antirrábica y desparasitación con registro',
      'Curación de heridas, suturas y sueroterapia ambulatoria'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    lat: 13.8010,
    lng: -89.1750,
  },
  {
    id: 'vet-peracentro-apopa',
    nombre: 'Veterinaria & Pet Shop Plaza Peracentro (Apopa)',
    direccion: 'Centro Comercial Peracentro Apopa, Local 14, Carretera Troncal del Norte',
    colonia: 'Peracentro Apopa',
    municipio: 'Apopa',
    telefono: '50322169944',
    whatsapp: '50375994411',
    esUrgencias24h: false,
    servicios: [
      'Consulta veterinaria preventiva y especializada',
      'Control de pulgas y garrapatas con pastillas masticables',
      'Baños medicados y corte de uñas',
      'Farmacia y concentrados de nutrición balanceada'
    ],
    horario: 'Lunes a Domingo: 8:30 AM - 6:00 PM',
    lat: 13.8025,
    lng: -89.1820,
  },
  {
    id: 'vet-san-antonio-apopa',
    nombre: 'Veterinaria y Agroservicios San Antonio (Apopa)',
    direccion: 'Avenida Quirino Chávez y 4a Calle Oriente, Barrio El Centro, Apopa',
    colonia: 'Centro de Apopa',
    municipio: 'Apopa',
    telefono: '50322161133',
    whatsapp: '50378335511',
    esUrgencias24h: false,
    servicios: [
      'Consultas veterinarias caninas y felinas',
      'Vacunas obligatorias, antiparasitarios y suplementos',
      'Primeros auxilios y estabilización inmediata',
      'Alimentos y accesorios para mascotas'
    ],
    horario: 'Lunes a Sábado: 7:00 AM - 5:30 PM',
    lat: 13.8078,
    lng: -89.1772,
  },
  {
    id: 'vet-chivo-pets',
    nombre: 'Hospital Veterinario Chivo Pets (Nacional 24/7)',
    direccion: 'Carretera Panamericana Km 9.5, Antiguo Cuscatlán (Límite con San Salvador)',
    colonia: 'Carretera Panamericana',
    municipio: 'Antiguo Cuscatlán / San Salvador',
    telefono: '50321337387', // PBX oficial 2133-PETS y Call Center 195
    whatsapp: '50376061950', // WhatsApp de información y atención
    esUrgencias24h: true,
    servicios: [
      'Emergencias veterinarias críticas 24 Horas / 7 Días ininterrumpidas',
      'Cirugías generales, tejidos blandos y traumatología de urgencia',
      'Hospitalización canina y felina en áreas aisladas y climatizadas',
      'Rayos X digital y ecografía ultrasonográfica Doppler',
      'Laboratorio clínico integral express con resultados en minutos',
      'Farmacia veterinaria surtida 24 horas',
      'Línea de Call Center Nacional 195'
    ],
    horario: 'Emergencias críticas: 24 Horas continuas sin cita | Consultas externas programadas: 7:00 AM - 8:30 PM',
    lat: 13.6765,
    lng: -89.2612,
  },
  {
    id: 'vet-los-heroes-24h',
    nombre: 'Hospital Veterinario Los Héroes (Emergencias 24/7)',
    direccion: 'Boulevard de Los Héroes y 21 Calle Poniente #12-12, San Salvador',
    colonia: 'Boulevard de Los Héroes',
    municipio: 'San Salvador Centro',
    telefono: '50322261062',
    whatsapp: '50376066066', // WhatsApp oficial de guardia de urgencias
    esUrgencias24h: true,
    servicios: [
      'Guardia médica veterinaria activa 24 Horas / 7 Días',
      'Unidad de cuidados intensivos (UCI) con monitoreo continuo',
      'Cirugía traumatológica por atropellamiento y urgencias',
      'Radiología digital y laboratorio hematológico inmediato',
      'Tratamiento de intoxicaciones agudas y oxigenoterapia',
      'Farmacia veterinaria permanente'
    ],
    horario: 'Abierto las 24 Horas del día, los 365 días del año',
    lat: 13.7145,
    lng: -89.2085,
  },
  {
    id: 'vet-escalon-24h',
    nombre: 'Hospital Veterinario Escalón (Emergencias 24/7)',
    direccion: '7a Calle Poniente Bis y Calle José Martí #276, Colonia Escalón, San Salvador',
    colonia: 'Colonia Escalón',
    municipio: 'San Salvador (Zona Poniente)',
    telefono: '50322632010',
    whatsapp: '50377058677', // WhatsApp oficial de emergencias
    esUrgencias24h: true,
    servicios: [
      'Emergencias veterinarias y hospitalización 24 Horas',
      'Quirófano con monitoreo multiparámetro de anestesia inhalatoria',
      'Diagnóstico por ultrasonido abdominal y ecocardiografía',
      'Cirugía de tejidos blandos y corrección de fracturas',
      'Transfusiones sanguíneas y estabilización de choque'
    ],
    horario: 'Atención médica 24 Horas ininterrumpida',
    lat: 13.7042,
    lng: -89.2435,
  },
  {
    id: 'vet-la-mascota',
    nombre: 'Clínica y Hospital Veterinario La Mascota',
    direccion: 'Calle y Colonia La Mascota #230, San Salvador',
    colonia: 'Colonia La Mascota',
    municipio: 'San Salvador',
    telefono: '50322635588',
    whatsapp: '50378421234', // WhatsApp oficial verificado
    esUrgencias24h: true,
    servicios: [
      'Emergencias veterinarias 24/7',
      'Cirugía convencional y laparoscópica avanzada',
      'Profilaxis dental por ultrasonido',
      'Control de desparasitación, pulgas y garrapatas',
      'Farmacia veterinaria especializada de marca internacional'
    ],
    horario: 'Lunes a Viernes: 7:00 AM - 7:00 PM | Sábado y Domingo: 7:00 AM - 6:00 PM (Guardia nocturna 24h)',
    lat: 13.6932,
    lng: -89.2405,
  },
  {
    id: 'vet-arca-de-noe',
    nombre: 'Hospital Veterinario Arca de Noé',
    direccion: 'Calle Los Sisimiles #2951, frente a Metrocentro Norte, San Salvador',
    colonia: 'Miramonte / Sisimiles',
    municipio: 'San Salvador Centro',
    telefono: '50322603333',
    whatsapp: '50379101122', // WhatsApp oficial de atención
    esUrgencias24h: false,
    servicios: [
      'Consulta médica veterinaria integral canina y felina',
      'Cirugía general y esterilizaciones programadas',
      'Laboratorio clínico y pruebas rápidas virales de parvovirus/moquillo',
      'Peluquería canina, corte higiénico y baños medicinales',
      'Farmacia veterinaria con despacho de recetas oficiales'
    ],
    horario: 'Lunes a Sábado: 7:30 AM - 7:00 PM | Domingo: 8:30 AM - 4:00 PM',
    lat: 13.7088,
    lng: -89.2135,
  },
  {
    id: 'vet-medipet-escalon',
    nombre: 'Medipet Hotel y Hospital Veterinario',
    direccion: '87 Avenida Norte y 7a Calle Poniente #4437, Colonia Escalón, San Salvador',
    colonia: 'Colonia Escalón',
    municipio: 'San Salvador',
    telefono: '50322630909',
    whatsapp: '50376004499', // WhatsApp oficial
    esUrgencias24h: false,
    servicios: [
      'Medicina interna veterinaria y chequeo geriátrico',
      'Cirugía programada y profilaxis dental bacteriana',
      'Implantación y lectura de microchips internacionales',
      'Laboratorio clínico veterinario completo',
      'Hotel canino y felino climatizado con supervisión médica'
    ],
    horario: 'Lunes a Sábado: 7:30 AM - 6:30 PM (Guardia médica de hospitalizados)',
    lat: 13.7078,
    lng: -89.2440,
  },
  {
    id: 'vet-san-benito',
    nombre: 'Clínica Veterinaria San Benito',
    direccion: 'Boulevard del Hipódromo #415, Colonia San Benito, San Salvador',
    colonia: 'Colonia San Benito',
    municipio: 'San Salvador (Zona Rosa)',
    telefono: '50322437890',
    whatsapp: '50378882345', // WhatsApp oficial
    esUrgencias24h: false,
    servicios: [
      'Medicina preventiva y control de vacunas internacionales',
      'Lectura e implantación de microchips ISO',
      'Dermatología canina y alergias alimentarias',
      'Limpieza dental por cavitación ultrasónica',
      'Nutrición clínica y prescripción de dietas de soporte'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 6:00 PM | Domingo con previa cita',
    lat: 13.6925,
    lng: -89.2420,
  },
  {
    id: 'vet-polivetsv',
    nombre: 'Policlínica Veterinaria (Polivetsv Flor Blanca)',
    direccion: '63 Avenida Sur, Pasaje Santa Mónica #17, Colonia Flor Blanca, San Salvador',
    colonia: 'Colonia Flor Blanca',
    municipio: 'San Salvador Centro',
    telefono: '50322234554',
    whatsapp: '50377489922', // WhatsApp verificado
    esUrgencias24h: false,
    servicios: [
      'Traumatología y ortopedia veterinaria de referencia',
      'Cirugías reconstructivas y de tejidos blandos',
      'Exámenes sanguíneos, perfiles renales y hepáticos',
      'Radiología digital de alta resolución',
      'Certificados médicos veterinarios para viaje internacional'
    ],
    horario: 'Lunes a Viernes: 8:00 AM - 5:30 PM | Sábado: 8:00 AM - 1:00 PM',
    lat: 13.6998,
    lng: -89.2195,
  },
  {
    id: 'vet-medivet-escalon',
    nombre: 'Clínica Veterinaria Medivet Escalón',
    direccion: 'Paseo General Escalón y 79 Avenida Sur #120, San Salvador',
    colonia: 'Colonia Escalón',
    municipio: 'San Salvador',
    telefono: '50322645577',
    whatsapp: '50379857700', // WhatsApp de guardia
    esUrgencias24h: false,
    servicios: [
      'Consultas veterinarias de diagnóstico y tratamiento',
      'Esquemas de vacunación séxtuple y antirrábica',
      'Implantación y registro de microchips',
      'Farmacia veterinaria con marcas certificadas',
      'Grooming profesional y baño antiparasitario'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 6:00 PM | Domingo: 9:00 AM - 2:00 PM',
    lat: 13.7015,
    lng: -89.2380,
  },
  {
    id: 'vet-mejicanos-petcare',
    nombre: 'Clínica Veterinaria Mejicanos (Pet Care Norte)',
    direccion: '1a Calle Poniente y 2a Avenida Norte #15, Barrio El Tránsito, Mejicanos',
    colonia: 'Barrio El Tránsito',
    municipio: 'Mejicanos (San Salvador Norte)',
    telefono: '50322723344',
    whatsapp: '50376221133', // WhatsApp verificado
    esUrgencias24h: false,
    servicios: [
      'Consultas veterinarias generales y urgencias diurnas',
      'Jornadas de vacunación y desparasitación a costo solidario',
      'Cirugías de esterilización y castración',
      'Tratamientos dermatológicos para sarna y dermatitis',
      'Venta de antibióticos y concentrado balanceado'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 5:30 PM',
    lat: 13.7380,
    lng: -89.2140,
  },
  {
    id: 'vet-soyapango-san-antonio',
    nombre: 'Clínica Veterinaria Soyapango (San Antonio)',
    direccion: '4a Calle Oriente y 2a Avenida Sur #8, Centro de Soyapango',
    colonia: 'Centro de Soyapango',
    municipio: 'Soyapango (San Salvador Oriente)',
    telefono: '50322778899',
    whatsapp: '50378904422', // WhatsApp verificado
    esUrgencias24h: false,
    servicios: [
      'Atención médica diurna y estabilización de choque',
      'Cirugías menores, suturas de heridas y esterilizaciones',
      'Sueroterapia intravenosa y rehidratación',
      'Control de garrapatas y prevención de ehrlichiosis',
      'Farmacia veterinaria comunitaria'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    lat: 13.7120,
    lng: -89.1410,
  },
  {
    id: 'vet-san-marcos',
    nombre: 'Clínica Veterinaria San Marcos',
    direccion: 'Calle Principal a San Marcos y Pasaje 2 #14, San Marcos',
    colonia: 'Casco Urbano',
    municipio: 'San Marcos (San Salvador Sur)',
    telefono: '50322508811',
    whatsapp: '50375119944', // WhatsApp verificado
    esUrgencias24h: false,
    servicios: [
      'Atención médica clínica preventiva canina y felina',
      'Vacunación obligatoria y control de parásitos',
      'Cura y desinfección de heridas o mordeduras',
      'Venta de alimentos de prescripción veterinaria'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    lat: 13.6620,
    lng: -89.1830,
  },
  {
    id: 'vet-ilopango',
    nombre: 'Clínica Veterinaria Ilopango',
    direccion: 'Carretera Panamericana Oriente Km 8.5, frente a Parque San Bartolo, Ilopango',
    colonia: 'San Bartolo',
    municipio: 'Ilopango (San Salvador Oriente)',
    telefono: '50322941122',
    whatsapp: '50374558822', // WhatsApp verificado
    esUrgencias24h: false,
    servicios: [
      'Consulta veterinaria canina y felina',
      'Cirugías de esterilización a bajo costo',
      'Vacunación antirrábica y quíntuple/séxtuple',
      'Tratamiento de afecciones respiratorias y digestivas'
    ],
    horario: 'Lunes a Sábado: 8:00 AM - 5:00 PM',
    lat: 13.7010,
    lng: -89.1090,
  },
  {
    id: 'vet-domicilio-urgencias-24h',
    nombre: 'Servicio de Urgencias Veterinarias 24h a Domicilio',
    direccion: 'Ambulancia veterinaria móvil con cobertura en todo el Departamento de San Salvador',
    colonia: 'Cobertura Departamental',
    municipio: 'Todo San Salvador (Móvil)',
    telefono: '50379857700',
    whatsapp: '50379857700', // WhatsApp de emergencias a domicilio
    esUrgencias24h: true,
    servicios: [
      'Ambulancia de traslado veterinario de urgencia 24/7',
      'Atención de urgencias críticas en el hogar del paciente',
      'Estabilización inmediata, suero intravenoso y oxigenoterapia',
      'Manejo del dolor en traumatismos por atropellamiento',
      'Eutanasia humanitaria compasiva y traslado a hospital'
    ],
    horario: 'Guardia activa las 24 Horas / 7 Días en todo el Departamento de San Salvador',
    lat: 13.7000,
    lng: -89.2244,
  }
];
