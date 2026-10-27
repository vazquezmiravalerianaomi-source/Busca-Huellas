import { PetCareGuide } from '../types/pet';

export const PET_CARE_GUIDES: PetCareGuide[] = [
  {
    id: 'g-pa-01',
    categoria: 'primeros_auxilios',
    titulo: 'Atragantamiento y Asfixia: Maniobra de Heimlich para Perros y Gatos',
    resumen: 'Cómo actuar si tu mascota se atraganta con un hueso, juguete o pelota y no puede respirar.',
    pasos: [
      '1. Inspección bucal inmediata: Abre la mandíbula con cuidado y con una linterna mira el fondo de la garganta. Solo si el objeto está visible y suelto, extráelo con pinzas o con los dedos cuidando que no te muerda.',
      '2. Si no puedes sacarlo y es un perro pequeño o gato: Sostén al animal boca abajo por las patas traseras unos segundos dando 3 a 5 palmadas firmes entre los omóplatos.',
      '3. Si es un perro mediano o grande: Levanta sus patas traseras como una carretilla manteniendo las delanteras en el suelo y aplica 5 compresiones hacia adelante.',
      '4. Maniobra de Heimlich completa: Si sigue asfixiándose, abraza al perro desde atrás por la cintura, coloca un puño justo debajo de su última costilla y presiona hacia adentro y hacia arriba de 3 a 5 veces consecutivas.',
      '5. Comprueba si el objeto fue expulsado y traslada inmediatamente a una veterinaria de guardia para revisar vías respiratorias.'
    ],
    consejoClave: 'NUNCA metas los dedos a ciegas en la garganta si no ves el objeto, ya que podrías empujarlo más adentro y bloquear totalmente la tráquea.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-pa-02',
    categoria: 'primeros_auxilios',
    titulo: 'Intoxicación y Envenenamiento Accidental: Qué Hacer y Qué NUNCA Hacer',
    resumen: 'Protocolo de acción ante sospecha de ingestión de veneno de rata, lejía, plantas venenosas o insecticidas.',
    pasos: [
      '1. Identifica los síntomas de alerta: Salivación excesiva (espuma), pupilas anormales, tambaleo al caminar, temblores musculares, vómito con sangre o convulsiones.',
      '2. Identifica la sustancia: Si viste qué ingirió (veneno de rata/warfarina, planta tóxica como lirio, limpiador o chocolate amargo), toma una foto nítida del empaque o guarda una muestra.',
      '3. NUNCA provoques el vómito si consumió lejía, cloro, soda cáustica o hidrocarburos, ya que quemará el esófago al subir.',
      '4. NUNCA le des leche, aceite ni agua con sal común: Dar sal puede provocar un edema cerebral fatal y la leche acelera la absorción de ciertos tóxicos solubles en grasa.',
      '5. Si el tóxico cayó en su pelaje o piel: Lava con abundante agua tibia y jabón neutro para evitar que se lo lama al acicalarse.',
      '6. Llama de inmediato al Hospital Veterinario Chivo Pets (195) o a la clínica 24 horas más cercana e indícales el producto exacto para preparar el antídoto específico.'
    ],
    consejoClave: 'El tiempo es vital: Si la ingestión ocurrió hace menos de 2 horas, el médico veterinario podrá realizar un lavado gástrico seguro y administrar carbón activado médico.',
    tiempoLectura: '5 min',
  },
  {
    id: 'g-pa-03',
    categoria: 'primeros_auxilios',
    titulo: 'Hemorragias Severas y Heridas Sangrantes por Corte o Mordedura',
    resumen: 'Cómo detener un sangrado profuso y evitar el choque hipovolémico antes de llegar al quirófano.',
    pasos: [
      '1. Mantén la calma y asegura a la mascota: Un animal con dolor severo puede intentar morder por reflejo. Coloca un bozal provisional con una gasa o cinta suave si es necesario.',
      '2. Presión directa continua: Coloca una gasa estéril o un paño de tela limpio directamente sobre la herida y presiona con firmeza constante durante 3 a 5 minutos SIN levantar la tela para mirar.',
      '3. Si la gasa se empapa de sangre: NO la retires, coloca otra gasa encima y continúa presionando para no romper el coágulo que se está formando.',
      '4. Vendaje compresivo moderado: Envuelve la zona con una venda elástica o cinta adhesiva manteniendo la presión, sin apretar tanto que impida la circulación distal.',
      '5. Evita torniquetes caseros: Un torniquete improvisado corta todo el flujo sanguíneo y puede causar gangrena o amputación irreversible del miembro.',
      '6. Abriga al animal con una manta durante el traslado a la veterinaria para evitar la hipotermia por pérdida sanguínea.'
    ],
    consejoClave: 'Si un objeto como un vidrio o alambre sigue clavado en la herida, NO lo extraigas tú mismo: inmovilízalo con gasas alrededor y deja que el cirujano veterinario lo retire en quirófano.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-pa-04',
    categoria: 'primeros_auxilios',
    titulo: 'Golpe de Calor en Clima Tropical: Enfriamiento Seguro Paso a Paso',
    resumen: 'Cómo enfriar a una mascota cuya temperatura corporal superó los 40°C por calor extremo o encierro.',
    pasos: [
      '1. Síntomas críticos: Jadeo extremadamente acelerado y ruidoso, lengua o encías de color rojo oscuro o morado, debilidad, tambaleo y vómitos espumosos.',
      '2. Retíralo de inmediato del sol: Llévalo a un área con sombra, piso fresco y buena ventilación de aire o ventilador.',
      '3. Humedece con agua fresca a temperatura ambiente: Moja sus axilas, ingles, cuello y almohadillas de las patas con toallas mojadas o rociador.',
      '4. NUNCA uses agua helada ni cubos de hielo: El frío extremo produce vasoconstricción periférica, atrapa el calor dentro de los órganos vitales y puede desencadenar un paro cardíaco repentino.',
      '5. Ofrece pequeños sorbos de agua fresca a temperatura ambiente, pero NO lo obligues a tragar si está semiinconsciente.',
      '6. Monitorea la respiración y trasládalo con el aire acondicionado del vehículo al hospital veterinario de urgencia.'
    ],
    consejoClave: 'NUNCA dejes a una mascota dentro de un vehículo estacionado en El Salvador, ni siquiera por 5 minutos con las ventanas entreabiertas: la temperatura interior sube a 50°C en cuestión de minutos.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-pa-05',
    categoria: 'primeros_auxilios',
    titulo: 'Reanimación Cardiopulmonar (RCP) Básica para Perros y Gatos',
    resumen: 'Protocolo de soporte vital cuando la mascota no respira y no tiene pulso perceptible.',
    pasos: [
      '1. Verifica inconsciencia y respiración: Observa si el pecho se mueve y acerca tu mejilla a su nariz. Si no responde ni respira, inicia RCP.',
      '2. Verifica pulso femoral: Coloca las yemas de tus dedos en la parte interna del muslo donde se une con el abdomen. Si no sientes latido, prepárate.',
      '3. Posición correcta: Coloca a la mascota acostada sobre su costado derecho en una superficie plana y firme.',
      '4. Compresiones torácicas: Coloca tus manos entrelazadas sobre la parte más ancha del tórax (justo detrás del codo). Comprime a un ritmo de 100 a 120 compresiones por minuto (al ritmo de la canción "Stayin Alive"), hundiendo entre 1/3 y 1/2 del ancho del pecho.',
      '5. Respiración artificial (boca a hocico): Tras cada 30 compresiones, cierra la boca del animal sellando los labios con tus manos, cubre su trufa con tu boca y da 2 insuflaciones suaves hasta ver que el pecho se eleva.',
      '6. Continúa ciclos de 30 compresiones por 2 insuflaciones mientras otra persona conduce de inmediato hacia el hospital de urgencias.'
    ],
    consejoClave: 'En gatos y cachorros pequeños, las compresiones se realizan con una sola mano o abrazando el pecho con los dedos pulgar e índice con suavidad.',
    tiempoLectura: '5 min',
  },
  {
    id: 'g-pa-06',
    categoria: 'primeros_auxilios',
    titulo: 'Atropellamiento, Fracturas y Traumatismos Viales',
    resumen: 'Manejo seguro para inmovilizar y transportar a un animal herido sin agravar lesiones de columna.',
    pasos: [
      '1. Protégete a ti mismo del tráfico antes de intervenir: Enciende luces de emergencia o pide apoyo para desviar vehículos.',
      '2. Cuidado con mordeduras: El animal atropellado está en shock y dolor extremo; puede morder instintivamente incluso a su dueño.',
      '3. Camilla improvisada: No cargues al animal doblándole la espalda. Desliza suavemente una tabla rígida, cartón grueso o una cobija tensada por dos personas debajo de él.',
      '4. No intentes enderezar huesos rotos: Si ves una extremidad torcida o expuesta, déjala en la posición en la que quedó y cúbrela con un paño limpio.',
      '5. Mantén la cabeza y el cuello alineados con el cuerpo para evitar daño en la médula espinal.',
      '6. Conduce con suavidad evitando frenazos bruscos hacia la veterinaria con quirófano traumatológico más cercana.'
    ],
    consejoClave: 'Aunque el animal atropellado logre levantarse y camine, llévalo siempre a revisión: las hemorragias internas o rotura de bazo/vejiga no se ven a simple vista y son mortales tras pocas horas.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-pa-07',
    categoria: 'primeros_auxilios',
    titulo: 'Botiquín Esencial de Primeros Auxilios para Mascotas en el Hogar',
    resumen: 'Los 10 elementos indispensables que todo tutor responsable debe tener listos en casa.',
    pasos: [
      '1. Solución de Clorhexidina al 2% o suero fisiológico al 0.9% para lavar heridas y ojos (NO usar alcohol ni agua oxigenada en heridas abiertas porque dañan el tejido vivo).',
      '2. Gasas estériles y vendas elásticas autoadherentes que no se pegan al pelo.',
      '3. Cinta médica adhesiva hipoalergénica (esparadrapo micropore).',
      '4. Termómetro digital rectal con lubricante a base de agua (temperatura normal en perros y gatos: 38°C a 39.2°C).',
      '5. Jeringas plásticas sin aguja de 5 ml y 20 ml para suministrar líquidos o lavar heridas a presión suave.',
      '6. Pinzas de punta fina para retirar garrapatas completas o espinas.',
      '7. Guantes de látex desechables y tijeras de punta roma.',
      '8. Manta térmica ligera para casos de shock o hipotermia.',
      '9. Tarjeta física plastificada con el teléfono de urgencias 24h anotado visiblemente.'
    ],
    consejoClave: 'Revisa las fechas de caducidad de tu botiquín cada 6 meses y guárdalo en un lugar seco y accesible fuera del alcance de niños y mascotas.',
    tiempoLectura: '3 min',
  },
  {
    id: 'g-pa-08',
    categoria: 'primeros_auxilios',
    titulo: 'Medicamentos Humanos Prohibidos: Fármacos Mortales para Mascotas',
    resumen: 'Por qué NUNCA debes darle analgésicos de tu botiquín humano a tu perro o gato.',
    pasos: [
      '1. Acetaminofén / Paracetamol: MORTAL en gatos incluso en dosis microscópicas (destruye sus glóbulos rojos por metahemoglobinemia) y altamente tóxico en perros provocando necrosis hepática aguda.',
      '2. Ibuprofeno y Naproxeno: Provocan úlceras gástricas perforadas con hemorragia masiva y fallo renal fulminante en perros y gatos en menos de 24 horas.',
      '3. Aspirina (Ácido Acetilsalicílico): Puede causar hemorragias internas graves, acidez severa y colapso circulatorio sin estricta dosificación veterinaria.',
      '4. Medicamentos para la gripe o descongestionantes (Pseudoefedrina): Provocan arritmias cardíacas letales, hipertensión severa y convulsiones.',
      '5. Si tu mascota tiene fiebre o dolor: Mantenlo en reposo, fresco, con agua a mano y consulta al médico veterinario qué analgésico de uso veterinario exclusivo (como Meloxicam o Carprofeno) es seguro según su peso exacto.'
    ],
    consejoClave: 'Una sola pastilla de 500mg de paracetamol puede matar a un gato adulto en pocas horas. NUNCA automediques a tu mascota sin receta veterinaria.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-01',
    categoria: 'busqueda_extravio',
    titulo: 'Protocolo de Emergencia: Primeros 60 Minutos de Extravío',
    resumen: 'Pasos metódicos y probados para actuar rápido en San Salvador cuando una mascota se escapa.',
    pasos: [
      '1. No entres en pánico: El 70% de las mascotas no se alejan más de 500 metros en la primera hora tras el escape.',
      '2. Publica de inmediato en Busca Huella con fotografía nítida, colonia y teléfono activo de WhatsApp.',
      '3. Revisa lugares oscuros y resguardados: bajo vehículos, entradas de pasajes, bodegas y tiendas cercanas.',
      '4. Lleva contigo su comida favorita o juguete que haga sonido, y llama con voz tranquila y dulce sin gritar con desesperación.',
      '5. Alerta a tenderos, vigilantes vecinales, mototaxis y rutas de microbuses de tu colonia.'
    ],
    consejoClave: 'Coloca una prenda tuya con tu olor en la puerta de tu casa junto a un tazón con agua (no comida, para no atraer otros animales).',
    tiempoLectura: '3 min',
  },
  {
    id: 'g-02',
    categoria: 'salud_vacunas',
    titulo: 'Esquema Esencial de Vacunación y Prevención en El Salvador',
    resumen: 'Protección sanitaria indispensable en el clima tropical del país.',
    pasos: [
      '1. Perros cachorros: Vacuna Puppy a las 6 semanas, Múltiple Séxtuple (Parvovirus, Moquillo, Hepatitis, Leptospirosis) a las 8, 12 y 16 semanas.',
      '2. Antirrábica obligatoria: A partir de los 3 meses de edad con refuerzo anual estricto según la ley de bienestar animal.',
      '3. Gatos: Vacuna Triple Felina (Rinotraqueítis, Calicivirus, Panleucopenia) y prueba previa para Leucemia Felina.',
      '4. Desparasitación interna: Cada 3 meses en adultos, mensual en cachorros.',
      '5. Prevención estricta de pulgas y garrapatas: Las garrapatas en San Salvador transmiten Erliquiosis y Anaplasmosis, bacterias sanguíneas graves.'
    ],
    consejoClave: 'Guarda siempre la cartilla de vacunación digitalizada con fotografía en tu teléfono móvil ante emergencias.',
    tiempoLectura: '4 min',
  },
  {
    id: 'g-04',
    categoria: 'adopcion_responsable',
    titulo: 'Checklist de Adopción y Adaptación con la Regla 3-3-3',
    resumen: 'Recomendaciones para una transición armoniosa y cariñosa de una mascota rescatada.',
    pasos: [
      '1. Regla del 3-3-3: 3 días para descomprimirse del shock del refugio, 3 semanas para aprender la rutina del hogar, 3 meses para sentirse totalmente seguro.',
      '2. Prepara su rincón seguro: Cama acolchada, mantita, platos separados de agua y comida, y arenero en caso de gatos.',
      '3. Paseos con correa siempre en los primeros meses: Aunque parezca dócil, un ruido fuerte de cohetes o camiones puede asustarlo.',
      '4. Visita veterinaria de chequeo general dentro de los primeros 5 días de adopción.',
      '5. Colócale su placa digital con código QR de Busca Huella desde el primer día.'
    ],
    consejoClave: 'La paciencia y el refuerzo positivo con caricias y premios logran maravillas en mascotas que sufrieron abandono.',
    tiempoLectura: '3 min',
  }
];
