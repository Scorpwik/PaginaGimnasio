export const LIBRARY = [
  { id: 'db-bench', name: 'Press banca con mancuernas', muscleGroup: 'Pectoral mayor (principal), tríceps y deltoides anterior', technique: 'Acostado, escápulas retraídas y pegadas al banco, baja las mancuernas controlado hasta la altura del pecho (codos ~45° del torso), empuja sin bloquear codos.', emoji: '◒', defaultSets: 4, defaultReps: '8–10', defaultWeight: 24, defaultRestSeconds: 90 },
  { id: 'seated-db-ohp', name: 'Press militar con mancuernas, sentado', muscleGroup: 'Deltoides (principal), tríceps', technique: 'Espalda apoyada, core firme, empuja mancuernas hacia arriba sin arquear excesivamente la zona lumbar, controla la bajada.', emoji: '◓', defaultSets: 3, defaultReps: '8–10', defaultWeight: 16, defaultRestSeconds: 90 },
  { id: 'incline-press', name: 'Press inclinado', muscleGroup: 'Pectoral superior (clavicular), deltoides anterior', technique: 'Banco a 30-45°, mismo patrón que el press banca pero con trayectoria ligeramente hacia arriba.', emoji: '◐', defaultSets: 3, defaultReps: '10–12', defaultWeight: 20, defaultRestSeconds: 90 },
  { id: 'lateral-raise', name: 'Elevaciones laterales', muscleGroup: 'Deltoides medio (ancho de hombro)', technique: 'Mancuernas a los lados, sube con codos ligeramente flexionados hasta la altura del hombro, sin impulso, baja controlado.', emoji: '◑', defaultSets: 3, defaultReps: '12–15', defaultWeight: 8, defaultRestSeconds: 60 },
  { id: 'assisted-dip', name: 'Fondos en máquina asistida / press francés', muscleGroup: 'Tríceps (principal), pecho bajo en fondos', technique: 'Fondos: torso inclinado adelante, baja a 90° de codo, empuja sin bloquear. Press francés: acostado, baja hacia la frente controlando el codo fijo.', emoji: '◒', defaultSets: 3, defaultReps: '10–12', defaultWeight: 25, defaultRestSeconds: 90 },
  { id: 'cable-triceps', name: 'Extensión de tríceps en polea', muscleGroup: 'Tríceps', technique: 'Codos pegados al torso y fijos, extiende antebrazo hacia abajo sin mover hombro, controla la vuelta.', emoji: '◓', defaultSets: 3, defaultReps: '12–15', defaultWeight: 25, defaultRestSeconds: 60 },
  { id: 'lat-pulldown', name: 'Jalón al pecho', muscleGroup: 'Dorsal ancho (principal), bíceps', technique: 'Agarre un poco más ancho que hombros, lleva la barra hacia la parte alta del pecho llevando codos abajo y atrás sin balancear torso.', emoji: '◐', defaultSets: 4, defaultReps: '8–10', defaultWeight: 55, defaultRestSeconds: 90 },
  { id: 'db-row', name: 'Remo con mancuerna o máquina', muscleGroup: 'Dorsal, trapecio medio, romboides', technique: 'Espalda recta, lleva el peso hacia el abdomen/cadera, aprieta el omóplato al final del movimiento.', emoji: '◑', defaultSets: 3, defaultReps: '10–12', defaultWeight: 24, defaultRestSeconds: 90 },
  { id: 'cable-row', name: 'Remo en polea baja', muscleGroup: 'Dorsal, trapecio medio, romboides', technique: 'Sentado, espalda recta, tira hacia el abdomen sin usar impulso del torso hacia atrás.', emoji: '◒', defaultSets: 3, defaultReps: '10–12', defaultWeight: 50, defaultRestSeconds: 90 },
  { id: 'face-pull', name: 'Face pull', muscleGroup: 'Deltoides posterior, manguito rotador, trapecio', technique: 'Cuerda a la altura de la cara, tira separando las manos hacia los lados de la cabeza, codos altos.', emoji: '◓', defaultSets: 3, defaultReps: '12–15', defaultWeight: 20, defaultRestSeconds: 60 },
  { id: 'db-curl', name: 'Curl de bíceps con mancuerna', muscleGroup: 'Bíceps braquial', technique: 'Codos pegados al torso y fijos, sube controlando sin balancear cuerpo, baja lento.', emoji: '◐', defaultSets: 3, defaultReps: '10–12', defaultWeight: 12, defaultRestSeconds: 60 },
  { id: 'hammer-curl', name: 'Curl martillo', muscleGroup: 'Bíceps y braquial (grosor de brazo)', technique: 'Mismo patrón que el curl normal pero con agarre neutro (palmas mirándose entre sí).', emoji: '◑', defaultSets: 3, defaultReps: '12–15', defaultWeight: 12, defaultRestSeconds: 60 },
  { id: 'goblet-squat', name: 'Sentadilla goblet / Smith', muscleGroup: 'Cuádriceps (principal), glúteo, core', technique: 'Pies al ancho de hombros, baja cadera atrás y abajo con pecho erguido, rodillas siguen dirección de los pies, muslo paralelo al piso.', emoji: '◒', defaultSets: 4, defaultReps: '8–10', defaultWeight: 24, defaultRestSeconds: 120 },
  { id: 'legpress', name: 'Prensa de piernas', muscleGroup: 'Cuádriceps, glúteo', technique: 'Pies al ancho de hombros en plataforma, baja controlado sin despegar zona lumbar del respaldo, no bloquees rodillas.', emoji: '◓', defaultSets: 3, defaultReps: '10–12', defaultWeight: 120, defaultRestSeconds: 120 },
  { id: 'db-rdl', name: 'Peso muerto rumano con mancuernas', muscleGroup: 'Isquiotibiales y glúteo (principal), zona lumbar', technique: 'Rodillas con leve flexión, baja mancuernas pegadas a las piernas manteniendo espalda recta (bisagra de cadera).', emoji: '◐', defaultSets: 3, defaultReps: '10–12', defaultWeight: 24, defaultRestSeconds: 120 },
  { id: 'leg-extension', name: 'Extensión de cuádriceps', muscleGroup: 'Cuádriceps (aislado)', technique: 'Sentado, extiende la pierna controlado sin impulso, pausa breve arriba, baja lento.', emoji: '◑', defaultSets: 3, defaultReps: '12–15', defaultWeight: 35, defaultRestSeconds: 60 },
  { id: 'leg-curl', name: 'Curl femoral', muscleGroup: 'Isquiotibiales (aislado)', technique: 'Acostado o sentado, flexiona la rodilla llevando el talón hacia el glúteo, controla la vuelta.', emoji: '◒', defaultSets: 3, defaultReps: '12–15', defaultWeight: 35, defaultRestSeconds: 60 },
  { id: 'calf-raise', name: 'Elevación de talones', muscleGroup: 'Gemelos (pantorrilla)', technique: 'Sube en punta de pies lo más alto posible, pausa arriba, baja controlado hasta sentir el estiramiento.', emoji: '◓', defaultSets: 4, defaultReps: '15–20', defaultWeight: 50, defaultRestSeconds: 60 },
  { id: 'incline-db-bench', name: 'Press banca inclinado con mancuernas', muscleGroup: 'Pectoral superior, deltoides anterior, tríceps', technique: 'Banco a 30-45°, escápulas retraídas, baja controlado hasta el pecho y empuja sin bloquear codos.', emoji: '◐', defaultSets: 3, defaultReps: '10–12', defaultWeight: 20, defaultRestSeconds: 90 },
  { id: 'machine-row', name: 'Remo en máquina o mancuerna', muscleGroup: 'Dorsal, trapecio medio, romboides', technique: 'Espalda recta, tira hacia el abdomen/cadera apretando omóplatos.', emoji: '◑', defaultSets: 3, defaultReps: '10–12', defaultWeight: 50, defaultRestSeconds: 90 },
  { id: 'closed-lat-pulldown', name: 'Jalón al pecho agarre cerrado', muscleGroup: 'Dorsal (énfasis parte baja), bíceps', technique: 'Manos juntas o agarre estrecho, lleva la barra hacia la parte alta del pecho.', emoji: '◒', defaultSets: 3, defaultReps: '10–12', defaultWeight: 50, defaultRestSeconds: 90 },
  { id: 'bulgarian-squat', name: 'Sentadilla búlgara', muscleGroup: 'Cuádriceps y glúteo (unilateral)', technique: 'Pie de atrás apoya en banco, baja verticalmente con la pierna delantera a 90°, torso erguido.', emoji: '◓', defaultSets: 3, defaultReps: '10–12 por pierna', defaultWeight: 16, defaultRestSeconds: 120 },
  { id: 'high-foot-legpress', name: 'Prensa de piernas (pie alto)', muscleGroup: 'Glúteo e isquiotibiales', technique: 'Pies arriba en plataforma para mayor énfasis en glúteo/isquios, bajada controlada.', emoji: '◐', defaultSets: 3, defaultReps: '10–12', defaultWeight: 130, defaultRestSeconds: 120 },
  { id: 'plank', name: 'Plancha frontal', muscleGroup: 'Core completo (estabilizador)', technique: 'Apoyado en antebrazos y puntas de pie, cuerpo en línea recta, aprieta glúteo y abdomen sin dejar caer cadera.', emoji: '◑', defaultSets: 3, defaultReps: '30–45 seg', defaultWeight: 0, defaultRestSeconds: 60 },
  { id: 'leg-raise', name: 'Elevación de piernas', muscleGroup: 'Abdominales inferiores', technique: 'Acostado boca arriba, sube piernas rectas hasta 90°, baja controlado sin despegar zona lumbar del piso.', emoji: '◒', defaultSets: 3, defaultReps: '10–15', defaultWeight: 0, defaultRestSeconds: 60 },
  { id: 'bicycle-crunch', name: 'Crunch bicicleta', muscleGroup: 'Oblicuos y recto abdominal', technique: 'Acostado, lleva el codo hacia la rodilla contraria alternando, sin tirar del cuello.', emoji: '◐', defaultSets: 3, defaultReps: '12–15', defaultWeight: 0, defaultRestSeconds: 60 },
  { id: 'side-plank', name: 'Plancha lateral', muscleGroup: 'Oblicuos', technique: 'Apoyado en antebrazo y borde del pie, cuerpo en línea recta de cabeza a pies, cadera firme.', emoji: '◑', defaultSets: 3, defaultReps: '30 seg por lado', defaultWeight: 0, defaultRestSeconds: 60 },
  { id: 'normal-crunch', name: 'Crunch normal', muscleGroup: 'Recto abdominal (superior)', technique: 'Rodillas flexionadas, sube solo los omóplatos del piso contrayendo el abdomen, sin tirar del cuello.', emoji: '◓', defaultSets: 3, defaultReps: '15–20', defaultWeight: 0, defaultRestSeconds: 60 },
  { id: 'mountain-climbers', name: 'Mountain climbers', muscleGroup: 'Core completo + cardio', technique: 'Posición de plancha alta, lleva rodillas alternadamente al pecho a ritmo rápido, cadera estable.', emoji: '◒', defaultSets: 3, defaultReps: '30 seg', defaultWeight: 0, defaultRestSeconds: 60 },
]

const ago = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const exercise = (exerciseId, targetSets, targetReps, targetWeight = 0, restSeconds = 90) => ({
  exerciseId,
  name: LIBRARY.find((item) => item.id === exerciseId)?.name || exerciseId,
  targetSets,
  targetReps,
  targetWeight,
  restSeconds,
})

export const INITIAL_ROUTINES = [
  {
    id: 'push',
    name: 'Push · Pecho, hombro y tríceps',
    dayOfWeek: 1,
    color: '#7c6cff',
    defaultRestSeconds: 90,
    warmup: 'Específico: band pull-aparts (2x15) + push-ups lentos con peso corporal (10-15)',
    exercises: [
      exercise('db-bench', 4, '8–10', 24),
      exercise('seated-db-ohp', 3, '8–10', 16),
      exercise('incline-press', 3, '10–12', 20),
      exercise('lateral-raise', 3, '12–15', 8),
      exercise('assisted-dip', 3, '10–12', 25),
      exercise('cable-triceps', 3, '12–15', 25),
    ].map((item, order) => ({ ...item, order })),
  },
  {
    id: 'pull',
    name: 'Pull · Espalda y bíceps',
    dayOfWeek: 2,
    color: '#5fd4c8',
    defaultRestSeconds: 90,
    warmup: 'Específico: band pull-aparts (2x15) + dead hangs 20-30s + retracciones escapulares (2x12)',
    exercises: [
      exercise('lat-pulldown', 4, '8–10', 55),
      exercise('db-row', 3, '10–12', 24),
      exercise('cable-row', 3, '10–12', 50),
      exercise('face-pull', 3, '12–15', 20),
      exercise('db-curl', 3, '10–12', 12),
      exercise('hammer-curl', 3, '12–15', 12),
    ].map((item, order) => ({ ...item, order })),
  },
  {
    id: 'legs',
    name: 'Piernas · Miércoles',
    dayOfWeek: 3,
    color: '#ffab6b',
    defaultRestSeconds: 120,
    warmup: 'Específico: sentadilla peso corporal (2x10) + puente de glúteo (2x12) + leg swings (10 c/lado)',
    exercises: [
      exercise('goblet-squat', 4, '8–10', 24, 120),
      exercise('legpress', 3, '10–12', 120, 120),
      exercise('db-rdl', 3, '10–12', 24, 120),
      exercise('leg-extension', 3, '12–15', 35),
      exercise('leg-curl', 3, '12–15', 35),
      exercise('calf-raise', 4, '15–20', 50),
    ].map((item, order) => ({ ...item, order })),
  },
  {
    id: 'upper',
    name: 'Upper · Torso completo',
    dayOfWeek: 4,
    color: '#55a8ff',
    defaultRestSeconds: 90,
    warmup: 'Específico: band pull-aparts + rotaciones de hombro + push-ups lentos',
    exercises: [
      exercise('incline-db-bench', 3, '10–12', 20),
      exercise('machine-row', 3, '10–12', 50),
      exercise('seated-db-ohp', 3, '10–12', 14),
      exercise('closed-lat-pulldown', 3, '10–12', 50),
      exercise('lateral-raise', 3, '12–15', 8),
      exercise('db-curl', 3, '12–15', 10),
      exercise('cable-triceps', 3, '12–15', 22),
    ].map((item, order) => ({ ...item, order })),
  },
  {
    id: 'lower',
    name: 'Lower · Viernes',
    dayOfWeek: 5,
    color: '#ff6b9d',
    defaultRestSeconds: 120,
    warmup: 'Específico: sentadilla peso corporal + puente de glúteo + leg swings',
    exercises: [
      exercise('db-rdl', 4, '8–10', 26, 120),
      exercise('bulgarian-squat', 3, '10–12 por pierna', 16, 120),
      exercise('high-foot-legpress', 3, '10–12', 130, 120),
      exercise('leg-extension', 3, '12–15', 35),
      exercise('calf-raise', 4, '15–20', 50),
    ].map((item, order) => ({ ...item, order })),
  },
  {
    id: 'core-home',
    name: 'Core · Abdomen en casa',
    dayOfWeek: 6,
    color: '#7c6cff',
    defaultRestSeconds: 60,
    warmup: 'Gato-camello (10 rep) + rotación de cadera (10 por lado)',
    exercises: [
      exercise('leg-raise', 3, '10–15', 0),
      exercise('bicycle-crunch', 3, '12–15', 0),
      exercise('side-plank', 3, '30 seg por lado', 0),
      exercise('normal-crunch', 3, '15–20', 0),
      exercise('mountain-climbers', 3, '30 seg', 0),
      exercise('plank', 3, '30–45 seg', 0),
    ].map((item, order) => ({ ...item, order })),
  },
]

export const INITIAL_LOGS = [
  {
    id: 'log-1',
    routineId: 'push',
    date: ago(2),
    dayLabel: 'Push',
    durationMinutes: 58,
    completed: true,
    exercises: [
      { exerciseId: 'db-bench', name: 'Press banca con mancuernas', sets: [{ weight: 22, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }, { weight: 24, repsAchieved: 8, repsAttempted: 10, status: 'parcial' }] },
      { exerciseId: 'seated-db-ohp', name: 'Press militar con mancuernas, sentado', sets: [{ weight: 14, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }] },
    ],
  },
  {
    id: 'log-2',
    routineId: 'pull',
    date: ago(4),
    dayLabel: 'Pull',
    durationMinutes: 62,
    completed: true,
    exercises: [
      { exerciseId: 'lat-pulldown', name: 'Jalón al pecho', sets: [{ weight: 52.5, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }] },
      { exerciseId: 'db-row', name: 'Remo con mancuerna o máquina', sets: [{ weight: 22, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }] },
    ],
  },
  {
    id: 'log-3',
    routineId: 'legs',
    date: ago(6),
    dayLabel: 'Legs',
    durationMinutes: 68,
    completed: true,
    exercises: [
      { exerciseId: 'goblet-squat', name: 'Sentadilla goblet / Smith', sets: [{ weight: 22, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }] },
    ],
  },
]

export const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(`gym-tracker:${key}`)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export const writeStore = (key, value) => {
  try {
    localStorage.setItem(`gym-tracker:${key}`, JSON.stringify(value))
  } catch {
    // La app sigue usable aunque el navegador bloquee el almacenamiento.
  }
}

export const formatDay = (day) => ['Libre', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][day] || 'Libre'
export const repsBase = (reps) => Number(String(reps).match(/\d+/)?.[0] || 0)
export const formatDate = (date) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
export const today = () => new Date().toISOString().slice(0, 10)
export const weekDay = () => {
  const day = new Date().getDay()
  return day === 0 ? 7 : day
}

export const KG_TO_LB = 2.20462
export const displayWeight = (value, unit = 'kg') => {
  const converted = Number(value || 0) * (unit === 'lb' ? KG_TO_LB : 1)
  return Number.isInteger(converted) ? String(converted) : converted.toFixed(1)
}
export const parseWeight = (value, unit = 'kg') => {
  const parsed = Number(value) || 0
  return unit === 'lb' ? parsed / KG_TO_LB : parsed
}

export function getVolume(logs) {
  return logs.reduce((total, log) => total + log.exercises.reduce((exerciseTotal, exercise) => exerciseTotal + exercise.sets.reduce((setTotal, set) => setTotal + Number(set.weight || 0) * Number(set.repsAchieved || 0), 0), 0), 0)
}

export function getBest(logs, exerciseId) {
  const sets = logs.flatMap((log) => log.exercises.filter((exercise) => exercise.exerciseId === exerciseId).flatMap((exercise) => exercise.sets))
  return {
    weight: Math.max(0, ...sets.map((set) => Number(set.weight) || 0)),
    reps: Math.max(0, ...sets.map((set) => Number(set.repsAchieved) || 0)),
  }
}

export function getStreak(logs) {
  const dates = new Set(logs.filter((log) => log.completed !== false).map((log) => log.date))
  if (!dates.size) return 0
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}