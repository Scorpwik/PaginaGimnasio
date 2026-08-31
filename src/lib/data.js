export const LIBRARY = [
  { id: 'db-bench', name: 'Press banca con mancuernas', muscleGroup: 'Pecho', emoji: '◒' },
  { id: 'seated-db-ohp', name: 'Press militar con mancuernas, sentado', muscleGroup: 'Hombros', emoji: '◓' },
  { id: 'incline-press', name: 'Press inclinado', muscleGroup: 'Pecho', emoji: '◐' },
  { id: 'lateral-raise', name: 'Elevaciones laterales', muscleGroup: 'Hombros', emoji: '◑' },
  { id: 'assisted-dip', name: 'Fondos en máquina asistida / press francés', muscleGroup: 'Tríceps', emoji: '◒' },
  { id: 'cable-triceps', name: 'Extensión de tríceps en polea', muscleGroup: 'Tríceps', emoji: '◓' },
  { id: 'lat-pulldown', name: 'Jalón al pecho', muscleGroup: 'Espalda', emoji: '◐' },
  { id: 'db-row', name: 'Remo con mancuerna o máquina', muscleGroup: 'Espalda', emoji: '◑' },
  { id: 'cable-row', name: 'Remo en polea baja', muscleGroup: 'Espalda', emoji: '◒' },
  { id: 'face-pull', name: 'Face pull', muscleGroup: 'Hombros', emoji: '◓' },
  { id: 'db-curl', name: 'Curl de bíceps con mancuerna', muscleGroup: 'Bíceps', emoji: '◐' },
  { id: 'hammer-curl', name: 'Curl martillo', muscleGroup: 'Bíceps', emoji: '◑' },
  { id: 'goblet-squat', name: 'Sentadilla goblet / Smith', muscleGroup: 'Piernas', emoji: '◒' },
  { id: 'legpress', name: 'Prensa de piernas', muscleGroup: 'Piernas', emoji: '◓' },
  { id: 'db-rdl', name: 'Peso muerto rumano con mancuernas', muscleGroup: 'Isquios', emoji: '◐' },
  { id: 'leg-extension', name: 'Extensión de cuádriceps', muscleGroup: 'Cuádriceps', emoji: '◑' },
  { id: 'leg-curl', name: 'Curl femoral', muscleGroup: 'Isquios', emoji: '◒' },
  { id: 'calf-raise', name: 'Elevación de talones', muscleGroup: 'Pantorrillas', emoji: '◓' },
  { id: 'incline-db-bench', name: 'Press banca inclinado con mancuernas', muscleGroup: 'Pecho', emoji: '◐' },
  { id: 'machine-row', name: 'Remo en máquina o mancuerna', muscleGroup: 'Espalda', emoji: '◑' },
  { id: 'closed-lat-pulldown', name: 'Jalón al pecho agarre cerrado', muscleGroup: 'Espalda', emoji: '◒' },
  { id: 'bulgarian-squat', name: 'Sentadilla búlgara', muscleGroup: 'Piernas', emoji: '◓' },
  { id: 'high-foot-legpress', name: 'Prensa de piernas (pie alto)', muscleGroup: 'Glúteos', emoji: '◐' },
  { id: 'plank', name: 'Plancha', muscleGroup: 'Core', emoji: '◑' },
  { id: 'leg-raise', name: 'Elevación de piernas', muscleGroup: 'Core', emoji: '◒' },
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
    warmup: '5–10 min · cardio suave + movilidad de hombros y codos',
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
    warmup: '5–10 min · cardio suave + movilidad de espalda y hombros',
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
    name: 'Legs · Piernas',
    dayOfWeek: 3,
    color: '#ffab6b',
    defaultRestSeconds: 120,
    warmup: '5–10 min · cardio suave + movilidad de cadera, rodilla y tobillo',
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
    warmup: '5–10 min · cardio suave + movilidad de hombros y espalda',
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
    id: 'lower-core',
    name: 'Lower + Core · Piernas y abdomen',
    dayOfWeek: 5,
    color: '#ff6b9d',
    defaultRestSeconds: 120,
    warmup: '5–10 min · cardio suave + movilidad de cadera, rodilla y tobillo',
    exercises: [
      exercise('db-rdl', 4, '8–10', 26, 120),
      exercise('bulgarian-squat', 3, '10–12 por pierna', 16, 120),
      exercise('high-foot-legpress', 3, '10–12', 130, 120),
      exercise('leg-extension', 3, '12–15', 35),
      exercise('calf-raise', 4, '15–20', 50),
      exercise('plank', 3, '30–45 seg', 0),
      exercise('leg-raise', 3, '10–15', 0),
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