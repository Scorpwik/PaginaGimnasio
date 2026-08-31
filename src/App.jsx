import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDown, ArrowUp, Award, BarChart3, Bell, CalendarDays, Camera, Check,
  ChevronRight, CircleHelp, Clock3, Dumbbell, Download, Edit3, Flame, Glasses,
  History, Home, ImagePlus, LineChart, LogIn, MoreHorizontal, Moon, MoveUpRight,
  Pause, Pencil, Play, Plus, RotateCcw, Save, Settings2, SlidersHorizontal,
  Sparkles, Target, TimerReset, Trash2, TrendingUp, Trophy, User, X, Zap,
} from 'lucide-react'
import { isFirebaseConfigured, auth } from './firebase/config'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { loadUserCollection, saveUserDocument, uploadUserPhoto } from './firebase/sync'
import { INITIAL_LOGS, INITIAL_ROUTINES, LIBRARY, formatDate, formatDay, getBest, getVolume, readStore, today, weekDay, writeStore } from './lib/data'
import imageCompression from 'browser-image-compression'

const TABS = [
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'routines', label: 'Rutinas', icon: Dumbbell },
  { id: 'metrics', label: 'Métricas', icon: LineChart },
  { id: 'photos', label: 'Fotos', icon: Camera },
  { id: 'profile', label: 'Perfil', icon: User },
]
const ACCENTS = ['#7c6cff', '#5fd4c8', '#ffab6b', '#ff6b9d', '#55a8ff']

function useStoredState(key, initial) {
  const [value, setValue] = useState(() => readStore(key, initial))
  useEffect(() => writeStore(key, value), [key, value])
  return [value, setValue]
}

function GlassCard({ children, className = '', onClick }) {
  return <div className={`glass-card ${className}`} onClick={onClick}>{children}</div>
}

function Button({ children, className = '', variant = 'primary', ...props }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>
}

function IconButton({ label, children, className = '', ...props }) {
  return <button aria-label={label} title={label} className={`icon-button ${className}`} {...props}>{children}</button>
}

function EmptyState({ icon: Icon = Sparkles, title, description, action }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={25} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(onClose, 3200)
    return () => clearTimeout(timer)
  }, [toast, onClose])
  if (!toast) return null
  return <div className={`toast toast-${toast.type || 'success'}`}><Check size={16} />{toast.message}</div>
}

function BottomNav({ active, onChange }) {
  return <nav className="bottom-nav" aria-label="Navegación principal">
    {TABS.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => onChange(id)}>
      <Icon size={21} strokeWidth={active === id ? 2.5 : 1.8} /><span>{label}</span>{active === id && <i />}
    </button>)}
  </nav>
}

function TopBar({ eyebrow, title, action }) {
  return <header className="topbar"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{action}</header>
}

function Stat({ label, value, suffix, icon: Icon, tone = 'purple' }) {
  return <div className={`stat stat-${tone}`}><div className="stat-icon"><Icon size={17} /></div><div><strong>{value}<small>{suffix}</small></strong><span>{label}</span></div></div>
}

function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true">
    <div className="modal-header"><div><div className="eyebrow">GYM TRACKER</div><h2>{title}</h2></div><IconButton label="Cerrar" onClick={onClose}><X size={19} /></IconButton></div>{children}
  </div></div>
}

function RestTimer({ seconds, onStop, onAdd }) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => setRemaining(seconds), [seconds])
  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate([180, 100, 180])
      return undefined
    }
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => clearInterval(timer)
  }, [remaining])
  return <div className="timer-pill">
    <div className={`timer-ring ${remaining === 0 ? 'timer-done' : ''}`}><Clock3 size={17} /><strong>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</strong></div>
    <div className="timer-copy"><b>{remaining === 0 ? 'Descanso terminado' : 'Descanso'}</b><span>{remaining === 0 ? '¡Lista para la siguiente serie!' : 'Respira. Mantén el ritmo.'}</span></div>
    <button onClick={onAdd}>+30s</button><IconButton label="Detener timer" onClick={onStop}><X size={15} /></IconButton>
  </div>
}

function Today({ routines, logs, onSaveLog, restSeconds, setRestSeconds, notify, onGoRoutines }) {
  const dayRoutine = routines.find((routine) => routine.dayOfWeek === weekDay()) || routines[0]
  const [selectedRoutineId, setSelectedRoutineId] = useState(dayRoutine?.id)
  const routine = routines.find((item) => item.id === selectedRoutineId) || dayRoutine
  const existing = logs.find((log) => log.date === today() && log.routineId === routine?.id)
  const makeDraft = (source = existing) => routine?.exercises.map((exercise) => ({
    ...exercise,
    sets: source?.exercises.find((item) => item.exerciseId === exercise.exerciseId)?.sets || Array.from({ length: exercise.targetSets }, (_, index) => ({
      setNumber: index + 1, weight: exercise.targetWeight, repsAchieved: '', repsAttempted: exercise.targetReps, status: 'pendiente',
    })),
  }))
  const [draft, setDraft] = useState(() => makeDraft())
  const [activeTimer, setActiveTimer] = useState(null)
  const [openExercise, setOpenExercise] = useState(null)
  useEffect(() => setDraft(makeDraft()), [selectedRoutineId, routine?.id])
  const completedSets = draft?.reduce((total, exercise) => total + exercise.sets.filter((set) => set.status === 'logrado' || set.status === 'parcial').length, 0) || 0
  const totalSets = draft?.reduce((total, exercise) => total + exercise.sets.length, 0) || 0
  const personalBests = useMemo(() => Object.fromEntries((routine?.exercises || []).map((exercise) => [exercise.exerciseId, getBest(logs, exercise.exerciseId)])), [logs, routine])

  const updateSet = (exerciseId, index, values) => setDraft((items) => items.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
    ...exercise, sets: exercise.sets.map((set, setIndex) => setIndex === index ? { ...set, ...values } : set),
  }))
  const toggleSet = (exercise, index) => {
    const set = exercise.sets[index]
    const isDone = set.status === 'logrado' || set.status === 'parcial'
    updateSet(exercise.exerciseId, index, { status: isDone ? 'pendiente' : 'logrado', repsAchieved: set.repsAchieved || set.repsAttempted })
    if (!isDone) {
      setActiveTimer(restSeconds)
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }
  const addSet = (exerciseId) => setDraft((items) => items.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
    ...exercise, sets: [...exercise.sets, { setNumber: exercise.sets.length + 1, weight: exercise.targetWeight, repsAchieved: '', repsAttempted: exercise.targetReps, status: 'pendiente' }],
  }))
  const finish = () => {
    if (!routine) return
    onSaveLog({ id: existing?.id || `log-${Date.now()}`, routineId: routine.id, date: today(), dayLabel: routine.name.split('·')[0].trim(), completed: true, exercises: draft.map(({ exerciseId, name, sets }) => ({ exerciseId, name, sets: sets.filter((set) => set.status !== 'pendiente') })) })
    notify('Sesión guardada. Buen trabajo.')
  }
  if (!routine) return <EmptyState icon={Dumbbell} title="Tu primera rutina te espera" description="Crea una rutina para que Gym Tracker prepare automáticamente tu entrenamiento de hoy." action={<Button onClick={onGoRoutines}><Plus size={16} /> Crear rutina</Button>} />
  return <div className="page">
    <TopBar eyebrow={new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()} title="Entrenar hoy" action={<div className="avatar">JL</div>} />
    <GlassCard className="hero-card">
      <div className="hero-glow" /><div className="hero-content"><div className="eyebrow accent-eyebrow"><span className="pulse-dot" /> SESIÓN ACTIVA</div><h2>{routine.name}</h2><p>{completedSets} de {totalSets} series completadas · {Math.round((completedSets / Math.max(totalSets, 1)) * 100)}% del entrenamiento</p><div className="progress-track"><span style={{ width: `${(completedSets / Math.max(totalSets, 1)) * 100}%` }} /></div></div>
      <div className="hero-badge"><Flame size={16} /><b>{Math.max(0, 12 - logs.length)}<small> días</small></b><span>racha actual</span></div>
    </GlassCard>
    <div className="section-heading"><div><span className="eyebrow">PLAN DE HOY</span><h2>Tu entrenamiento</h2></div><select value={selectedRoutineId} onChange={(event) => setSelectedRoutineId(event.target.value)} aria-label="Elegir rutina">{routines.map((item) => <option value={item.id} key={item.id}>{item.name.split('·')[0].trim()}</option>)}</select></div>
    <div className="workout-list">{routine.exercises.map((exercise, exerciseIndex) => {
      const best = personalBests[exercise.exerciseId] || { weight: 0, reps: 0 }
      const previous = logs.filter((log) => log.exercises.some((item) => item.exerciseId === exercise.exerciseId)).sort((a, b) => b.date.localeCompare(a.date))[0]?.exercises.find((item) => item.exerciseId === exercise.exerciseId)
      const isOpen = openExercise === exercise.exerciseId || openExercise === null
      return <GlassCard className={`exercise-card ${isOpen ? 'exercise-open' : ''}`} key={exercise.exerciseId}>
        <button className="exercise-summary" onClick={() => setOpenExercise(isOpen && openExercise !== null ? null : exercise.exerciseId)}><span className="exercise-number">{String(exerciseIndex + 1).padStart(2, '0')}</span><span className="exercise-title"><b>{exercise.name}</b><small>{exercise.targetSets} series · {exercise.targetReps} reps · objetivo {exercise.targetWeight} kg</small></span><span className="exercise-status">{draft[exerciseIndex]?.sets.filter((set) => set.status !== 'pendiente').length || 0}/{draft[exerciseIndex]?.sets.length || 0}</span><ChevronRight size={17} className={isOpen ? 'rotate-90' : ''} /></button>
        {isOpen && <div className="exercise-body"><div className="reference-row"><span><TrendingUp size={14} /> Última vez {previous?.sets?.[0] ? `${previous.sets[0].weight} kg × ${previous.sets[0].repsAchieved}` : 'sin registro'}</span><span className="pr-label"><Trophy size={13} /> PR {best.weight || exercise.targetWeight} kg</span></div><div className="sets-header"><span>Serie</span><span>Kg</span><span>Reps</span><span>Estado</span></div>{draft[exerciseIndex]?.sets.map((set, index) => <div className={`set-row ${set.status !== 'pendiente' ? `set-${set.status}` : ''}`} key={`${exercise.exerciseId}-${index}`}><b>{index + 1}</b><input type="number" inputMode="decimal" value={set.weight} onChange={(event) => updateSet(exercise.exerciseId, index, { weight: event.target.value })} aria-label={`Peso serie ${index + 1}`} /><input type="number" inputMode="numeric" placeholder={String(exercise.targetReps)} value={set.repsAchieved} onChange={(event) => updateSet(exercise.exerciseId, index, { repsAchieved: event.target.value })} aria-label={`Repeticiones serie ${index + 1}`} /><button className="set-check" onClick={() => toggleSet(exercise, index)} aria-label={`Marcar serie ${index + 1}`}>{set.status === 'logrado' ? <Check size={17} /> : set.status === 'parcial' ? <span>½</span> : <span />}</button></div>)}<button className="add-set" onClick={() => addSet(exercise.exerciseId)}><Plus size={14} /> Añadir serie</button></div>}
      </GlassCard>
    })}</div>
    <div className="sticky-action"><Button className="finish-button" onClick={finish}><Check size={18} /> Finalizar entrenamiento</Button></div>
    {activeTimer !== null && <RestTimer seconds={activeTimer} onAdd={() => setActiveTimer((value) => value + 30)} onStop={() => setActiveTimer(null)} />}
  </div>
}

function RoutineEditor({ routine, onSave, onClose, user }) {
  const [form, setForm] = useState(routine || { name: '', dayOfWeek: 1, color: ACCENTS[0], exercises: [] })
  const [query, setQuery] = useState('')
  const filtered = LIBRARY.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && !form.exercises.some((exercise) => exercise.exerciseId === item.id))
  const addExercise = (item) => setForm((value) => ({ ...value, exercises: [...value.exercises, { exerciseId: item.id, name: item.name, targetSets: 3, targetReps: 10, targetWeight: 0, order: value.exercises.length }] }))
  const updateExercise = (id, key, value) => setForm((current) => ({ ...current, exercises: current.exercises.map((exercise) => exercise.exerciseId === id ? { ...exercise, [key]: value } : exercise) }))
  const moveExercise = (index, direction) => setForm((current) => { const next = [...current.exercises]; const swap = index + direction; if (swap < 0 || swap >= next.length) return current; [next[index], next[swap]] = [next[swap], next[index]]; return { ...current, exercises: next.map((item, itemIndex) => ({ ...item, order: itemIndex })) } })
  const createCustom = () => {
    if (!query.trim()) return
    const custom = { id: `custom-${Date.now()}`, name: query.trim(), muscleGroup: 'Personalizado', isCustom: true, createdBy: user?.uid }
    addExercise(custom)
    if (user) saveUserDocument('exerciseLibrary', user.uid, custom).catch(() => {})
    setQuery('')
  }
  return <Modal title={routine ? 'Editar rutina' : 'Nueva rutina'} onClose={onClose} wide>
    <div className="form-grid"><label>Nombre de rutina<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Full body · fuerza" /></label><label>Día asignado<select value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: Number(event.target.value) })}>{[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{formatDay(day)}</option>)}</select></label></div>
    <div className="editor-label"><span>Ejercicios <small>{form.exercises.length} añadidos</small></span><div className="color-picker">{ACCENTS.map((color) => <button key={color} className={form.color === color ? 'selected' : ''} style={{ background: color }} onClick={() => setForm({ ...form, color })} aria-label="Elegir color" />)}</div></div>
    <div className="editor-exercises">{form.exercises.length === 0 ? <p className="muted center">Añade ejercicios desde la librería para comenzar.</p> : form.exercises.map((exercise, index) => <div className="editor-exercise" key={exercise.exerciseId}><div className="editor-exercise-name"><span>{String(index + 1).padStart(2, '0')}</span><b>{exercise.name}</b></div><div className="editor-fields"><label>Series<input type="number" min="1" value={exercise.targetSets} onChange={(event) => updateExercise(exercise.exerciseId, 'targetSets', Number(event.target.value))} /></label><label>Reps<input type="number" min="1" value={exercise.targetReps} onChange={(event) => updateExercise(exercise.exerciseId, 'targetReps', Number(event.target.value))} /></label><label>Kg<input type="number" min="0" value={exercise.targetWeight} onChange={(event) => updateExercise(exercise.exerciseId, 'targetWeight', Number(event.target.value))} /></label></div><div className="editor-row-actions"><IconButton label="Subir ejercicio" onClick={() => moveExercise(index, -1)}><ArrowUp size={14} /></IconButton><IconButton label="Bajar ejercicio" onClick={() => moveExercise(index, 1)}><ArrowDown size={14} /></IconButton><IconButton label="Quitar ejercicio" onClick={() => setForm({ ...form, exercises: form.exercises.filter((item) => item.exerciseId !== exercise.exerciseId) })}><Trash2 size={14} /></IconButton></div></div>)}</div>
    <div className="library-box"><div className="search-field"><SlidersHorizontal size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar o crear ejercicio..." /></div>{query && filtered.slice(0, 4).map((item) => <button className="library-result" key={item.id} onClick={() => { addExercise(item); setQuery('') }}><span className="mini-icon">{item.emoji}</span><span><b>{item.name}</b><small>{item.muscleGroup}</small></span><Plus size={16} /></button>)}{query && !filtered.length && <button className="library-result" onClick={createCustom}><span className="mini-icon"><Sparkles size={14} /></span><span><b>Crear “{query}”</b><small>Ejercicio personalizado</small></span><Plus size={16} /></button>}</div>
    <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={() => form.name.trim() && onSave({ ...form, id: form.id || `routine-${Date.now()}` })}><Save size={16} /> Guardar rutina</Button></div>
  </Modal>
}

function Routines({ routines, setRoutines, notify, user }) {
  const [editor, setEditor] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const remove = (id) => { setRoutines((items) => items.filter((item) => item.id !== id)); setConfirmDelete(null); notify('Rutina eliminada') }
  return <div className="page"><TopBar eyebrow="PLANIFICACIÓN" title="Rutinas" action={<Button className="small-button" onClick={() => setEditor({})}><Plus size={16} /> Nueva</Button>} /><div className="routine-intro"><div><span className="eyebrow accent-eyebrow">TU SEMANA</span><p>Diseña sesiones que puedas repetir y mejorar.</p></div><div className="week-dots">{[1, 2, 3, 4, 5, 6, 7].map((day) => <span className={routines.some((routine) => routine.dayOfWeek === day) ? 'filled' : ''} key={day}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][day - 1]}</span>)}</div></div>{routines.length === 0 ? <EmptyState icon={Dumbbell} title="Aún no hay rutinas" description="Crea tu primera rutina y añade ejercicios de la librería." action={<Button onClick={() => setEditor({})}><Plus size={16} /> Crear rutina</Button>} /> : <div className="routine-grid">{routines.map((routine) => <GlassCard className="routine-card" key={routine.id}><div className="routine-card-top"><span className="routine-color" style={{ background: routine.color }} /><span className="day-tag">{formatDay(routine.dayOfWeek)}</span><button className="more-button" onClick={() => setEditor(routine)}><MoreHorizontal size={18} /></button></div><h2>{routine.name}</h2><p>{routine.exercises.length} ejercicios · {routine.exercises.reduce((sum, item) => sum + Number(item.targetSets), 0)} series objetivo</p><div className="routine-exercises">{routine.exercises.slice(0, 3).map((exercise) => <div key={exercise.exerciseId}><span>{exercise.name}</span><small>{exercise.targetSets} × {exercise.targetReps}</small></div>)}</div><div className="routine-card-footer"><button onClick={() => setEditor(routine)}><Pencil size={14} /> Editar</button><button className="danger-text" onClick={() => setConfirmDelete(routine)}><Trash2 size={14} /> Eliminar</button></div></GlassCard>)}</div>}{editor !== null && <RoutineEditor routine={editor.id ? editor : null} user={user} onClose={() => setEditor(null)} onSave={(next) => { setRoutines((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [...items, next]); setEditor(null); notify('Rutina guardada') }} />}{confirmDelete && <Modal title="Eliminar rutina" onClose={() => setConfirmDelete(null)}><p className="modal-copy">¿Seguro que quieres eliminar <b>{confirmDelete.name}</b>? Los registros históricos se conservarán.</p><div className="modal-actions"><Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button><Button variant="danger" onClick={() => remove(confirmDelete.id)}><Trash2 size={16} /> Eliminar</Button></div></Modal>}</div>
}

function MiniChart({ points = [20, 35, 30, 48, 44, 63, 70], color = '#7c6cff', fill = true }) {
  const width = 520; const height = 150
  const max = Math.max(...points, 1); const min = Math.min(...points, 0); const range = max - min || 1
  const coords = points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * width},${height - ((point - min) / range) * (height - 24) - 8}`).join(' ')
  return <svg className="mini-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Gráfica de progresión"><defs><linearGradient id={`chart-fill-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>{[25, 75, 125].map((y) => <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,.07)" strokeDasharray="4 5" />)}{fill && <polygon points={`0,${height} ${coords} ${width},${height}`} fill={`url(#chart-fill-${color.replace('#', '')})`} />}{<polyline points={coords} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}{points.map((point, index) => <circle key={index} cx={(index / Math.max(points.length - 1, 1)) * width} cy={height - ((point - min) / range) * (height - 24) - 8} r="4" fill="#11141d" stroke={color} strokeWidth="2" />)}</svg>
}

function Metrics({ logs, routines, notify, user }) {
  const [exerciseId, setExerciseId] = useState(routines[0]?.exercises[0]?.exerciseId || 'bench')
  const [bodyMetrics, setBodyMetrics] = useStoredState('bodyMetrics', [{ date: today(), weight: 78.4, bodyFatEstimate: 16 }])
  const [metricModal, setMetricModal] = useState(false)
  const exerciseOptions = [...new Map(routines.flatMap((routine) => routine.exercises).map((exercise) => [exercise.exerciseId, exercise])).values()]
  const selected = exerciseOptions.find((item) => item.exerciseId === exerciseId) || exerciseOptions[0]
  const history = logs.flatMap((log) => log.exercises.filter((exercise) => exercise.exerciseId === exerciseId).flatMap((exercise) => exercise.sets.map((set) => ({ date: log.date, weight: Number(set.weight) || 0, reps: Number(set.repsAchieved) || 0 })))).sort((a, b) => a.date.localeCompare(b.date))
  const chart = history.length > 1 ? history.map((item) => item.weight) : [42, 48, 45, 58, 62, 66, 72]
  const weeklyLogs = logs.filter((log) => log.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const addMetric = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const metric = { id: `metric-${Date.now()}`, date: form.get('date'), weight: Number(form.get('weight')), bodyFatEstimate: Number(form.get('fat')) || undefined, notes: form.get('notes') }
    setBodyMetrics((items) => [...items, metric].sort((a, b) => a.date.localeCompare(b.date)))
    if (user) saveUserDocument('bodyMetrics', user.uid, metric).catch(() => notify('Métrica guardada localmente; no se pudo sincronizar', 'error'))
    setMetricModal(false)
    notify('Métrica corporal añadida')
  }
  useEffect(() => {
    if (!user) return
    loadUserCollection('bodyMetrics', user.uid).then((remote) => remote.length && setBodyMetrics(remote)).catch(() => {})
  }, [user])
  return <div className="page"><TopBar eyebrow="DATOS Y PROGRESIÓN" title="Métricas" action={<IconButton label="Añadir peso" onClick={() => setMetricModal(true)}><Plus size={19} /></IconButton>} /><div className="stats-grid"><Stat label="Volumen semanal" value={`${(getVolume(weeklyLogs) / 1000).toFixed(1)}`} suffix="k kg" icon={BarChart3} tone="purple" /><Stat label="Entrenos esta semana" value={weeklyLogs.length} suffix="/ 4" icon={CalendarDays} tone="teal" /><Stat label="Mejor racha" value="12" suffix=" días" icon={Flame} tone="orange" /></div><GlassCard className="chart-card"><div className="card-heading"><div><span className="eyebrow">PROGRESIÓN</span><h2>Peso en {selected?.name || 'ejercicio'}</h2></div><select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>{exerciseOptions.map((item) => <option key={item.exerciseId} value={item.exerciseId}>{item.name}</option>)}</select></div><div className="chart-value"><b>{history.at(-1)?.weight || selected?.targetWeight || 0}<small> kg</small></b><span className="positive"><MoveUpRight size={14} /> +8.5% vs. inicio</span></div><MiniChart points={chart} /><div className="chart-labels"><span>Hace 6 sem</span><span>Hace 3 sem</span><span>Hoy</span></div></GlassCard><div className="metrics-columns"><GlassCard><div className="card-heading"><div><span className="eyebrow">CUERPO</span><h2>Peso corporal</h2></div><button className="text-button" onClick={() => setMetricModal(true)}>Añadir</button></div><div className="body-current"><b>{bodyMetrics.at(-1)?.weight || '—'}<small> kg</small></b><span className="positive">−0.6 kg este mes</span></div><MiniChart points={bodyMetrics.length > 1 ? bodyMetrics.map((item) => item.weight) : [80, 79.8, 79.5, 79.1, 78.9, 78.4]} color="#5fd4c8" /></GlassCard><GlassCard><div className="card-heading"><div><span className="eyebrow">HISTORIAL</span><h2>Últimas sesiones</h2></div><History size={17} className="muted-icon" /></div><div className="history-list">{logs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).map((log) => <div className="history-item" key={log.id}><span className="history-date">{formatDate(log.date)}</span><span><b>{log.dayLabel}</b><small>{log.exercises.length} ejercicios · {Math.round(getVolume([log]))} kg</small></span><Check size={15} /></div>)}</div></GlassCard></div>{metricModal && <Modal title="Registrar métrica" onClose={() => setMetricModal(false)}><form onSubmit={addMetric}><div className="form-grid"><label>Fecha<input type="date" name="date" defaultValue={today()} required /></label><label>Peso (kg)<input type="number" name="weight" step=".1" placeholder="78.4" required /></label><label>Grasa estimada (%)<input type="number" name="fat" step=".1" placeholder="Opcional" /></label></div><label>Notas<textarea name="notes" placeholder="¿Cómo te sientes esta semana?" /></label><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setMetricModal(false)}>Cancelar</Button><Button type="submit"><Save size={16} /> Guardar</Button></div></form></Modal>}</div>
}

function Photos({ notify, user }) {
  const [photos, setPhotos] = useStoredState('progressPhotos', [])
  const [tag, setTag] = useState('frente')
  const [compare, setCompare] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!user) return
    loadUserCollection('progressPhotos', user.uid).then((remote) => remote.length && setPhotos(remote)).catch(() => {})
  }, [user])
  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true })
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(compressed) })
      const photo = { id: `photo-${Date.now()}`, date: today(), imageUrl: dataUrl, tag, size: compressed.size }
      if (user) {
        const remoteUrl = await uploadUserPhoto(user.uid, compressed, photo.id)
        if (remoteUrl) photo.imageUrl = remoteUrl
        await saveUserDocument('progressPhotos', user.uid, photo)
      }
      setPhotos((items) => [photo, ...items])
      notify('Foto guardada y optimizada')
    } catch { notify('No se pudo procesar la imagen', 'error') } finally { setLoading(false); event.target.value = '' }
  }
  const toggleCompare = (id) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id])
  const compared = compare.map((id) => photos.find((photo) => photo.id === id)).filter(Boolean)
  return <div className="page"><TopBar eyebrow="REGISTRO VISUAL" title="Fotos de progreso" action={<label className="button button-primary small-button">{loading ? <RotateCcw className="spin" size={16} /> : <ImagePlus size={16} />} {loading ? 'Procesando' : 'Añadir foto'}<input type="file" accept="image/*" capture="environment" onChange={upload} hidden /></label>} /><GlassCard className="photo-intro"><div className="photo-intro-icon"><Camera size={22} /></div><div><b>Tu progreso, sin filtros</b><p>Las fotos se comprimen en tu dispositivo antes de guardarse.</p></div><Sparkles size={18} className="accent-icon" /></GlassCard><div className="photo-toolbar"><div className="segmented">{['frente', 'perfil', 'espalda', 'otro'].map((item) => <button className={tag === item ? 'selected' : ''} onClick={() => setTag(item)} key={item}>{item}</button>)}</div>{photos.length > 1 && <span className="compare-hint">{compare.length === 2 ? '2 seleccionadas' : 'Selecciona 2 para comparar'}</span>}</div>{photos.length === 0 ? <EmptyState icon={Camera} title="Tu galería está vacía" description="Añade una foto de frente, perfil o espalda para empezar a ver tu evolución." action={<label className="button button-secondary"><Camera size={16} /> Abrir cámara<input type="file" accept="image/*" capture="environment" onChange={upload} hidden /></label>} /> : <div className="photo-grid">{photos.slice().sort((a, b) => b.date.localeCompare(a.date)).map((photo) => <button className={`photo-item ${compare.includes(photo.id) ? 'photo-selected' : ''}`} key={photo.id} onClick={() => toggleCompare(photo.id)}><img src={photo.imageUrl} alt={`Progreso ${photo.tag} del ${formatDate(photo.date)}`} /><div className="photo-meta"><span>{formatDate(photo.date)}</span><small>{photo.tag}</small></div>{compare.includes(photo.id) && <span className="photo-check"><Check size={14} /></span>}</button>)}</div>}{compared.length === 2 && <Modal title="Comparar progreso" onClose={() => setCompare([])} wide><div className="comparison"><div><img src={compared[0].imageUrl} alt="Antes" /><span>{formatDate(compared[0].date)} · {compared[0].tag}</span></div><div><img src={compared[1].imageUrl} alt="Después" /><span>{formatDate(compared[1].date)} · {compared[1].tag}</span></div></div></Modal>}</div>
}

function Profile({ restSeconds, setRestSeconds, notify, logs, routines, setRoutines, setLogs }) {
  const [showLogin, setShowLogin] = useState(false)
  const [accent, setAccent] = useStoredState('accent', ACCENTS[0])
  useEffect(() => document.documentElement.style.setProperty('--accent', accent), [accent])
  const exportData = () => { const blob = new Blob([JSON.stringify({ routines, logs, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gym-tracker-backup.json'; link.click(); URL.revokeObjectURL(url); notify('Copia de seguridad descargada') }
  const clearData = () => { if (window.confirm('Esto borrará tus rutinas, registros y fotos locales. ¿Continuar?')) { setRoutines([]); setLogs([]); localStorage.removeItem('gym-tracker:progressPhotos'); notify('Datos locales eliminados') } }
  return <div className="page"><TopBar eyebrow="TU CUENTA" title="Perfil" action={<div className="avatar large">JL</div>} /><GlassCard className="profile-card"><div className="profile-avatar">JL</div><div><h2>Joshua</h2><p>{isFirebaseConfigured ? 'Cuenta sincronizada con Firebase' : 'Modo demo · datos guardados en este dispositivo'}</p></div><IconButton label="Editar perfil"><Edit3 size={17} /></IconButton></GlassCard>{!isFirebaseConfigured && <div className="firebase-note"><div className="note-icon"><Sparkles size={16} /></div><div><b>Conecta Firebase cuando estés listo</b><p>Añade tus variables VITE_FIREBASE_* para activar autenticación, Firestore y Storage.</p></div><button onClick={() => setShowLogin(true)}><LogIn size={15} /> Iniciar sesión</button></div>}<div className="settings-group"><div className="settings-heading"><span className="eyebrow">PREFERENCIAS</span><h2>Configuración</h2></div><div className="settings-row"><span className="setting-symbol"><TimerReset size={17} /></span><span><b>Descanso entre series</b><small>Se inicia al marcar una serie</small></span><select value={restSeconds} onChange={(event) => { setRestSeconds(Number(event.target.value)); notify('Timer actualizado') }}><option value="60">1:00</option><option value="90">1:30</option><option value="120">2:00</option><option value="180">3:00</option></select></div><div className="settings-row"><span className="setting-symbol"><Sparkles size={17} /></span><span><b>Color de acento</b><small>Personaliza tu espacio</small></span><div className="color-picker settings-colors">{ACCENTS.map((color) => <button key={color} className={accent === color ? 'selected' : ''} style={{ background: color }} onClick={() => setAccent(color)} aria-label="Cambiar color" />)}</div></div><div className="settings-row"><span className="setting-symbol"><Moon size={17} /></span><span><b>Modo oscuro</b><small>Optimizado para el gimnasio</small></span><span className="toggle on"><i /></span></div></div><div className="settings-group"><div className="settings-heading"><span className="eyebrow">DATOS</span><h2>Tu información</h2></div><button className="action-row" onClick={exportData}><span className="setting-symbol"><Download size={17} /></span><span><b>Exportar mis datos</b><small>Descarga rutinas y entrenamientos en JSON</small></span><ChevronRight size={17} /></button><button className="action-row danger-row" onClick={clearData}><span className="setting-symbol"><Trash2 size={17} /></span><span><b>Borrar datos locales</b><small>Esta acción no se puede deshacer</small></span><ChevronRight size={17} /></button></div><div className="app-version"><Dumbbell size={15} /> Gym Tracker <span>·</span> v1.0.0</div>{showLogin && <LoginModal onClose={() => setShowLogin(false)} notify={notify} />}</div>
}

function LoginModal({ onClose, notify }) {
  const [mode, setMode] = useState('login')
  const submit = async (event) => {
    event.preventDefault()
    if (!isFirebaseConfigured || !auth) { notify('Añade la configuración de Firebase para iniciar sesión', 'error'); return }
    const form = new FormData(event.currentTarget)
    try {
      if (mode === 'login') await signInWithEmailAndPassword(auth, form.get('email'), form.get('password'))
      else await createUserWithEmailAndPassword(auth, form.get('email'), form.get('password'))
      notify(mode === 'login' ? 'Sesión iniciada' : 'Cuenta creada')
      onClose()
    } catch (error) {
      notify(error.code === 'auth/invalid-credential' ? 'Email o contraseña incorrectos' : 'No se pudo iniciar sesión. Revisa tus datos.', 'error')
    }
  }
  return <Modal title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} onClose={onClose}><form onSubmit={submit}><label>Email<input type="email" required placeholder="tu@email.com" /></label><label>Contraseña<input type="password" required minLength="6" placeholder="••••••••" /></label><Button type="submit" className="full-button"><LogIn size={16} /> Continuar</Button></form><button className="switch-auth" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Ya tengo una cuenta'}</button></Modal>
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [routines, setRoutines] = useStoredState('routines', INITIAL_ROUTINES)
  const [logs, setLogs] = useStoredState('workoutLogs', INITIAL_LOGS)
  const [restSeconds, setRestSeconds] = useStoredState('restSeconds', 90)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [remoteReady, setRemoteReady] = useState(false)
  const notify = (message, type = 'success') => setToast({ message, type })
  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (!currentUser) { setRemoteReady(true); return }
      try {
        const [remoteRoutines, remoteLogs, remotePhotos, remoteMetrics] = await Promise.all([
          loadUserCollection('routines', currentUser.uid),
          loadUserCollection('workoutLogs', currentUser.uid),
          loadUserCollection('progressPhotos', currentUser.uid),
          loadUserCollection('bodyMetrics', currentUser.uid),
        ])
        if (remoteRoutines.length) setRoutines(remoteRoutines)
        if (remoteLogs.length) setLogs(remoteLogs)
        if (remotePhotos.length) writeStore('progressPhotos', remotePhotos)
        if (remoteMetrics.length) writeStore('bodyMetrics', remoteMetrics)
      } catch {
        notify('No se pudo cargar tu nube; seguimos con los datos locales', 'error')
      } finally { setRemoteReady(true) }
    })
  }, [])
  const updateRoutines = (updater) => setRoutines((items) => {
    const next = typeof updater === 'function' ? updater(items) : updater
    if (user && remoteReady) next.forEach((item) => saveUserDocument('routines', user.uid, item).catch(() => {}))
    return next
  })
  const saveLog = (log) => {
    setLogs((items) => [...items.filter((item) => item.id !== log.id), log])
    if (user && remoteReady) saveUserDocument('workoutLogs', user.uid, log).catch(() => notify('Guardado local; no se pudo sincronizar', 'error'))
  }
  const content = activeTab === 'today' ? <Today routines={routines} logs={logs} onSaveLog={saveLog} restSeconds={restSeconds} setRestSeconds={setRestSeconds} notify={notify} onGoRoutines={() => setActiveTab('routines')} /> : activeTab === 'routines' ? <Routines routines={routines} setRoutines={updateRoutines} notify={notify} user={user} /> : activeTab === 'metrics' ? <Metrics logs={logs} routines={routines} notify={notify} user={user} /> : activeTab === 'photos' ? <Photos notify={notify} user={user} /> : <Profile restSeconds={restSeconds} setRestSeconds={setRestSeconds} notify={notify} logs={logs} routines={routines} setRoutines={updateRoutines} setLogs={setLogs} />
  return <div className="app-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><main>{content}</main><BottomNav active={activeTab} onChange={setActiveTab} /><Toast toast={toast} onClose={() => setToast(null)} /></div>
}