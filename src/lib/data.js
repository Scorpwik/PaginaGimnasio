export const LIBRARY = [
  { id: 'bench', name: 'Press de banca', muscleGroup: 'Pecho', emoji: '◒' },
  { id: 'squat', name: 'Sentadilla con barra', muscleGroup: 'Piernas', emoji: '◓' },
  { id: 'deadlift', name: 'Peso muerto', muscleGroup: 'Espalda', emoji: '◐' },
  { id: 'row', name: 'Remo con barra', muscleGroup: 'Espalda', emoji: '◑' },
  { id: 'ohp', name: 'Press militar', muscleGroup: 'Hombros', emoji: '◒' },
  { id: 'pullup', name: 'Dominadas', muscleGroup: 'Espalda', emoji: '◓' },
  { id: 'legpress', name: 'Prensa de piernas', muscleGroup: 'Piernas', emoji: '◐' },
  { id: 'curl', name: 'Curl de bíceps', muscleGroup: 'Bíceps', emoji: '◑' },
  { id: 'triceps', name: 'Extensión de tríceps', muscleGroup: 'Tríceps', emoji: '◒' },
]

const ago = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

export const INITIAL_ROUTINES = [
  {
    id: 'push',
    name: 'Push · Pecho y hombros',
    dayOfWeek: 1,
    color: '#7c6cff',
    exercises: [
      { exerciseId: 'bench', name: 'Press de banca', targetSets: 4, targetReps: 8, targetWeight: 80, order: 0 },
      { exerciseId: 'ohp', name: 'Press militar', targetSets: 3, targetReps: 10, targetWeight: 32, order: 1 },
      { exerciseId: 'triceps', name: 'Extensión de tríceps', targetSets: 3, targetReps: 12, targetWeight: 28, order: 2 },
    ],
  },
  {
    id: 'pull',
    name: 'Pull · Espalda y bíceps',
    dayOfWeek: 3,
    color: '#5fd4c8',
    exercises: [
      { exerciseId: 'deadlift', name: 'Peso muerto', targetSets: 3, targetReps: 5, targetWeight: 120, order: 0 },
      { exerciseId: 'row', name: 'Remo con barra', targetSets: 4, targetReps: 8, targetWeight: 65, order: 1 },
      { exerciseId: 'curl', name: 'Curl de bíceps', targetSets: 3, targetReps: 12, targetWeight: 14, order: 2 },
    ],
  },
  {
    id: 'legs',
    name: 'Legs · Piernas',
    dayOfWeek: 5,
    color: '#ffab6b',
    exercises: [
      { exerciseId: 'squat', name: 'Sentadilla con barra', targetSets: 4, targetReps: 8, targetWeight: 100, order: 0 },
      { exerciseId: 'legpress', name: 'Prensa de piernas', targetSets: 3, targetReps: 12, targetWeight: 160, order: 1 },
    ],
  },
]

export const INITIAL_LOGS = [
  {
    id: 'log-1',
    routineId: 'push',
    date: ago(2),
    dayLabel: 'Push',
    completed: true,
    exercises: [
      { exerciseId: 'bench', name: 'Press de banca', sets: [{ weight: 77.5, repsAchieved: 8, repsAttempted: 8, status: 'logrado' }, { weight: 80, repsAchieved: 7, repsAttempted: 8, status: 'parcial' }] },
      { exerciseId: 'ohp', name: 'Press militar', sets: [{ weight: 30, repsAchieved: 10, repsAttempted: 10, status: 'logrado' }] },
    ],
  },
  {
    id: 'log-2',
    routineId: 'pull',
    date: ago(4),
    dayLabel: 'Pull',
    completed: true,
    exercises: [
      { exerciseId: 'deadlift', name: 'Peso muerto', sets: [{ weight: 115, repsAchieved: 5, repsAttempted: 5, status: 'logrado' }] },
      { exerciseId: 'row', name: 'Remo con barra', sets: [{ weight: 62.5, repsAchieved: 8, repsAttempted: 8, status: 'logrado' }] },
    ],
  },
  {
    id: 'log-3',
    routineId: 'legs',
    date: ago(6),
    dayLabel: 'Legs',
    completed: true,
    exercises: [
      { exerciseId: 'squat', name: 'Sentadilla con barra', sets: [{ weight: 95, repsAchieved: 8, repsAttempted: 8, status: 'logrado' }] },
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