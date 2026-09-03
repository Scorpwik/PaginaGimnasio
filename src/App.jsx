import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDown, ArrowUp, Award, BarChart3, Bell, CalendarDays, Camera, Check,
  ChevronRight, CircleHelp, Clock3, Dumbbell, Download, Edit3, Flame, Glasses,
  History, Home, ImagePlus, LineChart, LogIn, MoreHorizontal, Moon, MoveUpRight,
  Pause, Pencil, Play, Plus, RotateCcw, Save, Settings2, SlidersHorizontal,
  Sparkles, Target, TimerReset, Trash2, TrendingUp, Trophy, User, X, Zap,
} from 'lucide-react'
import { isFirebaseConfigured, auth } from './firebase/config'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth'
import { deleteUserDocument, loadUserCollection, saveUserDocument } from './firebase/sync'
import { INITIAL_LOGS, INITIAL_ROUTINES, LIBRARY, displayWeight, formatDate, formatDay, getBest, getStreak, getVolume, parseWeight, readStore, repsBase, today, weekDay, writeStore } from './lib/data'
import imageCompression from 'browser-image-compression'

const TABS = [
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'routines', label: 'Rutinas', icon: Dumbbell },
  { id: 'metrics', label: 'Métricas', icon: LineChart },
  { id: 'photos', label: 'Fotos', icon: Camera },
  { id: 'profile', label: 'Perfil', icon: User },
]
const ACCENTS = ['#7c6cff', '#5fd4c8', '#ffab6b', '#ff6b9d', '#55a8ff']
const restValue = (value, fallback = 90) => value === undefined || value === null ? fallback : value
const editRestValue = (value) => value === '' ? '' : Math.max(0, Number(value) || 0)

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
  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.id === active))
  return <nav className="bottom-nav" aria-label="Navegación principal" style={{ '--active-index': activeIndex }}>
    <span className="nav-indicator" aria-hidden="true" />
    {TABS.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => onChange(id)}>
      <Icon size={21} strokeWidth={active === id ? 2.5 : 1.8} /><span>{label}</span>
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
  return <div className="rest-timer-capsule">
    <div className={`timer-ring ${remaining === 0 ? 'timer-done' : ''}`}><Clock3 size={17} /><strong>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</strong></div>
    <div className="timer-copy"><b>{remaining === 0 ? 'Descanso terminado' : 'Descanso'}</b><span>{remaining === 0 ? '¡Lista para la siguiente serie!' : 'Respira. Mantén el ritmo.'}</span></div>
    <button onClick={onAdd}>+30s</button><IconButton label="Detener timer" onClick={onStop}><X size={15} /></IconButton>
  </div>
}

function ExerciseGuide({ exerciseId, name }) {
  const info = LIBRARY.find((item) => item.id === exerciseId)
  const muscle = info?.muscleGroup || 'Zona objetivo'
  return <><button type="button" className="guide-button" onClick={(event) => { event.stopPropagation(); const target = document.getElementById(`guide-${exerciseId}`); target?.showModal?.() }}><CircleHelp size={13} /> Guía</button><dialog id={`guide-${exerciseId}`} className="guide-dialog"><div className="guide-dialog-content"><div className="modal-header"><div><div className="eyebrow">GUÍA VISUAL</div><h2>{name}</h2></div><button type="button" className="icon-button" onClick={() => document.getElementById(`guide-${exerciseId}`)?.close()} aria-label="Cerrar guía"><X size={17} /></button></div><div className="guide-figure guide-figure-large" aria-hidden="true"><svg viewBox="0 0 76 64"><circle cx="38" cy="11" r="6" /><path d="M38 18v19M38 23l-14 9M38 23l14 9M38 37l-11 18M38 37l12 18" /><path d="M19 26h38" className="guide-equipment" /><path d="M18 22v8M58 22v8" className="guide-equipment" /></svg></div><p className="guide-dialog-copy">Enfoca: <b>{muscle}</b> · movimiento controlado y rango cómodo.</p><a className="guide-search" href={`https://www.google.com/search?q=${encodeURIComponent(`${name} técnica ejercicio`)}`} target="_blank" rel="noreferrer"><MoveUpRight size={14} /> Buscar técnica detallada</a></div></dialog></>
}

function Today({ routines, logs, onSaveLog, restSeconds, notify, onGoRoutines, unit = 'kg' }) {
  const dayRoutine = routines.find((routine) => routine.dayOfWeek === weekDay()) || routines[0]
  const [selectedRoutineId, setSelectedRoutineId] = useState(dayRoutine?.id)
  const routine = routines.find((item) => item.id === selectedRoutineId) || dayRoutine
  const existing = logs.find((log) => log.date === today() && log.routineId === routine?.id)
  const makeDraft = (source = existing) => routine?.exercises.map((exercise) => ({
    ...exercise,
    sets: source?.exercises.find((item) => item.exerciseId === exercise.exerciseId)?.sets.map((set, index) => ({ ...set, setNumber: set.setNumber || index + 1, setType: set.setType || 'normal' })) || Array.from({ length: exercise.targetSets }, (_, index) => ({
      setNumber: index + 1, weight: exercise.targetWeight, repsAchieved: '', repsAttempted: repsBase(exercise.targetReps), status: 'pendiente', setType: 'normal',
    })),
  }))
  const [draft, setDraft] = useState(() => makeDraft())
  const [durationMinutes, setDurationMinutes] = useState(existing?.durationMinutes || 60)
  const [activeTimer, setActiveTimer] = useState(null)
  const [timerExerciseId, setTimerExerciseId] = useState(null)
  const [timerKey, setTimerKey] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [openSetMenu, setOpenSetMenu] = useState(null)
  useEffect(() => setDraft(makeDraft()), [selectedRoutineId, routine?.id, routine?.exercises])
  useEffect(() => setDurationMinutes(existing?.durationMinutes || 60), [existing?.id, selectedRoutineId])
  useEffect(() => {
    if (!isTraining || !startedAt) return undefined
    const timer = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [isTraining, startedAt])
  const completedSets = draft?.reduce((total, exercise) => total + exercise.sets.filter((set) => set.status === 'logrado' || set.status === 'parcial').length, 0) || 0
  const totalSets = draft?.reduce((total, exercise) => total + exercise.sets.length, 0) || 0
  const personalBests = useMemo(() => Object.fromEntries((routine?.exercises || []).map((exercise) => [exercise.exerciseId, getBest(logs, exercise.exerciseId)])), [logs, routine])

  const updateSet = (exerciseId, index, values) => setDraft((items) => items.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
    ...exercise, sets: exercise.sets.map((set, setIndex) => setIndex === index ? { ...set, ...values } : set),
  }))
  const toggleSet = (exercise, index) => {
    const set = exercise?.sets?.[index]
    if (!set) return
    const isDone = set.status === 'logrado' || set.status === 'parcial'
    updateSet(exercise.exerciseId, index, { status: isDone ? 'pendiente' : 'logrado', repsAchieved: set.repsAchieved || set.repsAttempted })
    if (!isDone) {
      setActiveTimer(exercise.restSeconds || restSeconds || 90)
      setTimerExerciseId(exercise.exerciseId)
      setTimerKey((value) => value + 1)
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }
  const removeSet = (exerciseId, index) => setDraft((items) => items.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
    ...exercise, sets: exercise.sets.filter((_, setIndex) => setIndex !== index).map((set, setIndex) => ({ ...set, setNumber: setIndex + 1 })),
  }))
  const setType = (exerciseId, index, value) => {
    updateSet(exerciseId, index, { setType: value })
    setOpenSetMenu(null)
  }
  const toggleTraining = () => {
    if (isTraining) {
      setElapsedSeconds(startedAt ? Math.floor((Date.now() - startedAt) / 1000) : elapsedSeconds)
      setStartedAt(null)
      setIsTraining(false)
      return
    }
    setStartedAt(Date.now() - elapsedSeconds * 1000)
    setIsTraining(true)
  }
  const addSet = (exerciseId) => setDraft((items) => items.map((exercise) => exercise.exerciseId !== exerciseId ? exercise : {
    ...exercise, sets: [...exercise.sets, { setNumber: exercise.sets.length + 1, weight: exercise.targetWeight, repsAchieved: '', repsAttempted: repsBase(exercise.targetReps), status: 'pendiente', setType: 'normal' }],
  }))
  const updateExerciseRest = (exerciseId, value) => setDraft((items) => items.map((exercise) => exercise.exerciseId === exerciseId ? { ...exercise, restSeconds: editRestValue(value) } : exercise))
  const finish = () => {
    if (!routine) return
    const trackedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
    onSaveLog({ id: existing?.id || `log-${Date.now()}`, routineId: routine.id, date: today(), dayLabel: routine.name.split('·')[0].trim(), durationMinutes: trackedMinutes, completed: true, exercises: draft.map(({ exerciseId, name, sets }) => ({ exerciseId, name, sets: sets.filter((set) => set.status !== 'pendiente') })) })
    setIsTraining(false)
    notify('Sesión guardada. Buen trabajo.')
  }
  const sessionTime = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`
  if (!routine) return <EmptyState icon={Dumbbell} title="Tu primera rutina te espera" description="Crea una rutina para que Gym Tracker prepare automáticamente tu entrenamiento de hoy." action={<Button onClick={onGoRoutines}><Plus size={16} /> Crear rutina</Button>} />
  return <div className="page">
    <TopBar eyebrow={new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase()} title="Entrenar hoy" action={<div className="avatar">JL</div>} />
      <GlassCard className="hero-card">
      <div className="hero-glow" /><div className="hero-content"><div className="eyebrow accent-eyebrow"><span className="pulse-dot" /> SESIÓN ACTIVA</div><h2>{routine.name}</h2><p>{completedSets} de {totalSets} series completadas · {Math.round((completedSets / Math.max(totalSets, 1)) * 100)}% del entrenamiento</p><div className="progress-track"><span style={{ width: `${(completedSets / Math.max(totalSets, 1)) * 100}%` }} /></div></div>
      <div className="hero-badge"><Flame size={16} /><b>{getStreak(logs)}<small> días</small></b><span>racha actual</span></div>
    </GlassCard>
    <div className="section-heading"><div><span className="eyebrow">PLAN DE HOY</span><h2>Tu entrenamiento</h2></div><div className="today-controls"><span className={`session-timer ${isTraining ? 'running' : ''}`}><Clock3 size={14} />{sessionTime}</span><Button className="start-button" variant={isTraining ? 'ghost' : 'secondary'} onClick={toggleTraining}>{isTraining ? <Pause size={14} /> : <Play size={14} />}{isTraining ? 'Pausar' : 'Iniciar'}</Button><IconButton label="Reiniciar entrenamiento" onClick={() => { setStartedAt(null); setElapsedSeconds(0); setIsTraining(false) }}><RotateCcw size={14} /></IconButton><span className="unit-badge">{unit.toUpperCase()}</span><select value={selectedRoutineId} onChange={(event) => setSelectedRoutineId(event.target.value)} aria-label="Elegir rutina">{routines.map((item) => <option value={item.id} key={item.id}>{item.name.split('·')[0].trim()}</option>)}</select></div></div>
    <GlassCard className="warmup-card"><div className="warmup-icon"><Zap size={18} /></div><div><span className="eyebrow">ANTES DE EMPEZAR</span><b>Calentamiento · 5–10 min</b><p>{routine.warmup || 'Cardio suave + movilidad articular de la zona a trabajar.'}</p></div><span className="warmup-tag">Todos los días</span></GlassCard>
    <div className="workout-list">{routine.exercises.map((exercise, exerciseIndex) => {
      const best = personalBests[exercise.exerciseId] || { weight: 0, reps: 0 }
      const previous = logs.filter((log) => log.exercises.some((item) => item.exerciseId === exercise.exerciseId)).sort((a, b) => b.date.localeCompare(a.date))[0]?.exercises.find((item) => item.exerciseId === exercise.exerciseId)
      const currentExercise = draft[exerciseIndex] || exercise
       const isOpen = true
      return <GlassCard className={`exercise-card ${isOpen ? 'exercise-open' : ''}`} key={exercise.exerciseId}>
        <div className="exercise-summary"><div className="exercise-toggle"><span className="exercise-number">{String(exerciseIndex + 1).padStart(2, '0')}</span><span className="exercise-title"><b>{exercise.name}</b><small>{exercise.targetSets} series · {exercise.targetReps} reps · objetivo {exercise.targetWeight ? `${displayWeight(exercise.targetWeight, unit)} ${unit}` : 'peso corporal'} · descanso {currentExercise.restSeconds || 90}s</small></span><span className="exercise-status">{currentExercise?.sets.filter((set) => set.status !== 'pendiente').length || 0}/{currentExercise?.sets.length || 0}</span></div><ExerciseGuide exerciseId={exercise.exerciseId} name={exercise.name} /></div>
         <div className="collapse-shell"><div className="exercise-body"><div className="reference-row"><span><TrendingUp size={14} /> Última vez {previous?.sets?.[0] ? `${displayWeight(previous.sets[0].weight, unit)} ${unit} × ${previous.sets[0].repsAchieved}` : 'sin registro'}</span><span className="pr-label"><Trophy size={13} /> PR {best.weight ? `${displayWeight(best.weight, unit)} ${unit}` : '—'}</span><label className="rest-edit"><Clock3 size={13} /> Descanso<input type="number" min="0" step="5" value={restValue(currentExercise.restSeconds, restSeconds || 90)} onChange={(event) => updateExerciseRest(exercise.exerciseId, event.target.value)} /><small>s</small></label></div>{activeTimer !== null && timerExerciseId === exercise.exerciseId && <RestTimer key={timerKey} seconds={activeTimer} onAdd={() => setActiveTimer((value) => value + 30)} onStop={() => { setActiveTimer(null); setTimerExerciseId(null) }} />}<div className="sets-header"><span>Serie</span><span>{unit.toUpperCase()}</span><span>Reps</span><span>Estado</span></div>{currentExercise?.sets.map((set, index) => <div className="set-row-wrap" key={`${exercise.exerciseId}-${index}`}><div className={`set-row ${set.status !== 'pendiente' ? `set-${set.status}` : ''}`}><button type="button" className={`set-number ${set.setType || 'normal'}`} aria-expanded={openSetMenu === `${exercise.exerciseId}-${index}`} onClick={() => setOpenSetMenu(openSetMenu === `${exercise.exerciseId}-${index}` ? null : `${exercise.exerciseId}-${index}`)}>{index + 1}</button><input type="number" inputMode="decimal" value={displayWeight(set.weight, unit)} onChange={(event) => updateSet(exercise.exerciseId, index, { weight: parseWeight(event.target.value, unit) })} aria-label={`Peso serie ${index + 1}`} /><input type="number" inputMode="numeric" placeholder={String(exercise.targetReps)} value={set.repsAchieved} onChange={(event) => updateSet(exercise.exerciseId, index, { repsAchieved: event.target.value })} aria-label={`Repeticiones serie ${index + 1}`} /><button type="button" className="set-check" onClick={() => toggleSet(currentExercise, index)} aria-label={`Marcar serie ${index + 1}`}>{set.status === 'logrado' ? <Check size={17} /> : set.status === 'parcial' ? <span>½</span> : <span />}</button></div>{openSetMenu === `${exercise.exerciseId}-${index}` && <div className="set-menu-shell is-open"><div className="set-menu"><span>Tipo de serie</span><button type="button" className={set.setType === 'warm' ? 'active' : ''} onClick={() => setType(exercise.exerciseId, index, 'warm')}>Warm set</button><button type="button" className={(!set.setType || set.setType === 'normal') ? 'active' : ''} onClick={() => setType(exercise.exerciseId, index, 'normal')}>Normal set</button><button type="button" className={set.setType === 'failure' ? 'active' : ''} onClick={() => setType(exercise.exerciseId, index, 'failure')}>Failure set</button><button type="button" className="remove-set-button" onClick={() => { removeSet(exercise.exerciseId, index); setOpenSetMenu(null) }}><Trash2 size={13} /> Quitar serie</button></div></div>}</div>)}<button type="button" className="add-set" onClick={() => addSet(exercise.exerciseId)}><Plus size={14} /> Añadir serie</button></div></div>
      </GlassCard>
    })}</div>
    <div className="sticky-action"><Button className="finish-button" onClick={finish}><Check size={18} /> Finalizar entrenamiento</Button></div>
  </div>
}

function RoutineEditor({ routine, onSave, onClose, user, unit = 'kg', library = LIBRARY, onLibraryChange }) {
  const [form, setForm] = useState(routine || { name: '', dayOfWeek: 1, color: ACCENTS[0], exercises: [] })
  const [query, setQuery] = useState('')
  const filtered = library.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()) && !form.exercises.some((exercise) => exercise.exerciseId === item.id))
  const addExercise = (item) => setForm((value) => ({ ...value, exercises: [...value.exercises, { exerciseId: item.id, name: item.name, targetSets: item.defaultSets || 3, targetReps: item.defaultReps || 10, targetWeight: item.defaultWeight || 0, restSeconds: item.defaultRestSeconds ?? 90, order: value.exercises.length }] }))
  const updateExercise = (id, key, value) => setForm((current) => ({ ...current, exercises: current.exercises.map((exercise) => exercise.exerciseId === id ? { ...exercise, [key]: value } : exercise) }))
  const moveExercise = (index, direction) => setForm((current) => { const next = [...current.exercises]; const swap = index + direction; if (swap < 0 || swap >= next.length) return current; [next[index], next[swap]] = [next[swap], next[index]]; return { ...current, exercises: next.map((item, itemIndex) => ({ ...item, order: itemIndex })) } })
  const createCustom = () => {
    if (!query.trim()) return
    const custom = { id: `custom-${Date.now()}`, name: query.trim(), muscleGroup: 'Personalizado', isCustom: true, createdBy: user?.uid }
    addExercise(custom)
    onLibraryChange?.((items) => [...items, custom])
    if (user) saveUserDocument('exerciseLibrary', user.uid, custom).catch(() => {})
    setQuery('')
  }
  return <Modal title={routine ? 'Editar rutina' : 'Nueva rutina'} onClose={onClose} wide>
    <div className="form-grid"><label>Nombre de rutina<input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. Full body · fuerza" /></label><label>Día asignado<select value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: Number(event.target.value) })}>{[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{formatDay(day)}</option>)}</select></label></div>
    <div className="editor-label"><span>Ejercicios <small>{form.exercises.length} añadidos</small></span><div className="color-picker">{ACCENTS.map((color) => <button key={color} className={form.color === color ? 'selected' : ''} style={{ background: color }} onClick={() => setForm({ ...form, color })} aria-label="Elegir color" />)}</div></div>
      <div className="editor-exercises">{form.exercises.length === 0 ? <p className="muted center">Añade ejercicios desde la librería para comenzar.</p> : form.exercises.map((exercise, index) => <div className="editor-exercise" key={exercise.exerciseId}><div className="editor-exercise-name"><span>{String(index + 1).padStart(2, '0')}</span><b>{exercise.name}</b></div><div className="editor-fields"><label>Series<input type="number" min="1" value={exercise.targetSets} onChange={(event) => updateExercise(exercise.exerciseId, 'targetSets', Number(event.target.value))} /></label><label>Reps<input type="text" value={exercise.targetReps} onChange={(event) => updateExercise(exercise.exerciseId, 'targetReps', event.target.value)} /></label><label>{unit.toUpperCase()}<input type="number" min="0" value={displayWeight(exercise.targetWeight, unit)} onChange={(event) => updateExercise(exercise.exerciseId, 'targetWeight', parseWeight(event.target.value, unit))} /></label><label>Descanso (s)<input type="number" min="0" step="5" value={restValue(exercise.restSeconds)} onChange={(event) => updateExercise(exercise.exerciseId, 'restSeconds', editRestValue(event.target.value))} /></label></div><div className="editor-row-actions"><IconButton label="Subir ejercicio" onClick={() => moveExercise(index, -1)}><ArrowUp size={14} /></IconButton><IconButton label="Bajar ejercicio" onClick={() => moveExercise(index, 1)}><ArrowDown size={14} /></IconButton><IconButton label="Quitar ejercicio" onClick={() => setForm({ ...form, exercises: form.exercises.filter((item) => item.exerciseId !== exercise.exerciseId) })}><Trash2 size={14} /></IconButton></div></div>)}</div>
    <div className="library-box"><div className="search-field"><SlidersHorizontal size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar o crear ejercicio..." /></div>{query && filtered.slice(0, 4).map((item) => <button className="library-result" key={item.id} onClick={() => { addExercise(item); setQuery('') }}><span className="mini-icon">{item.emoji}</span><span><b>{item.name}</b><small>{item.muscleGroup}</small></span><Plus size={16} /></button>)}{query && !filtered.length && <button className="library-result" onClick={createCustom}><span className="mini-icon"><Sparkles size={14} /></span><span><b>Crear “{query}”</b><small>Ejercicio personalizado</small></span><Plus size={16} /></button>}</div>
    <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={() => form.name.trim() && onSave({ ...form, id: form.id || `routine-${Date.now()}` })}><Save size={16} /> Guardar rutina</Button></div>
  </Modal>
}

function Routines({ routines, setRoutines, notify, user, unit = 'kg', library = LIBRARY, onLibraryChange }) {
  const [editor, setEditor] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [previewId, setPreviewId] = useState(null)
  const remove = (id) => { setRoutines((items) => items.filter((item) => item.id !== id)); setConfirmDelete(null); notify('Rutina eliminada') }
  return <div className="page"><TopBar eyebrow="PLANIFICACIÓN" title="Rutinas" action={<Button className="small-button" onClick={() => setEditor({})}><Plus size={16} /> Nueva</Button>} /><div className="routine-intro"><div><span className="eyebrow accent-eyebrow">TU SEMANA</span><p>Diseña sesiones que puedas repetir y mejorar.</p></div><div className="week-dots">{[1, 2, 3, 4, 5, 6, 7].map((day) => <span className={routines.some((routine) => routine.dayOfWeek === day) ? 'filled' : ''} key={day}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][day - 1]}</span>)}</div></div>{routines.length === 0 ? <EmptyState icon={Dumbbell} title="Aún no hay rutinas" description="Crea tu primera rutina y añade ejercicios de la librería." action={<Button onClick={() => setEditor({})}><Plus size={16} /> Crear rutina</Button>} /> : <div className="routine-grid">{routines.map((routine) => { const isPreview = previewId === routine.id; return <GlassCard className={`routine-card ${isPreview ? 'routine-preview' : ''}`} key={routine.id} onClick={() => setPreviewId(isPreview ? null : routine.id)}><div className="routine-card-top"><span className="routine-color" style={{ background: routine.color }} /><span className="day-tag">{formatDay(routine.dayOfWeek)}</span><button className="more-button" onClick={(event) => { event.stopPropagation(); setEditor(routine) }}><MoreHorizontal size={18} /></button></div><h2>{routine.name}</h2><p>{routine.exercises.length} ejercicios · {routine.exercises.reduce((sum, item) => sum + Number(item.targetSets), 0)} series objetivo</p><div className="routine-exercises">{routine.exercises.slice(0, isPreview ? routine.exercises.length : 3).map((exercise) => <div key={exercise.exerciseId}><span>{exercise.name}</span><small>{exercise.targetSets} × {exercise.targetReps} · {exercise.restSeconds || 90}s</small></div>)}</div><div className="routine-card-footer"><button onClick={(event) => { event.stopPropagation(); setEditor(routine) }}><Pencil size={14} /> Editar</button><button className="danger-text" onClick={(event) => { event.stopPropagation(); setConfirmDelete(routine) }}><Trash2 size={14} /> Eliminar</button></div></GlassCard> })}</div>}{editor !== null && <RoutineEditor routine={editor.id ? editor : null} user={user} unit={unit} library={library} onLibraryChange={onLibraryChange} onClose={() => setEditor(null)} onSave={(next) => { setRoutines((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [...items, next]); setEditor(null); notify('Rutina guardada') }} />}{confirmDelete && <Modal title="Eliminar rutina" onClose={() => setConfirmDelete(null)}><p className="modal-copy">¿Seguro que quieres eliminar <b>{confirmDelete.name}</b>? Los registros históricos se conservarán.</p><div className="modal-actions"><Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button><Button variant="danger" onClick={() => remove(confirmDelete.id)}><Trash2 size={16} /> Eliminar</Button></div></Modal>}</div>
}

function MiniChart({ points = [20, 35, 30, 48, 44, 63, 70], color = '#7c6cff', fill = true }) {
  const width = 520; const height = 150
  const max = Math.max(...points, 1); const min = Math.min(...points, 0); const range = max - min || 1
  const coords = points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * width},${height - ((point - min) / range) * (height - 24) - 8}`).join(' ')
  return <svg className="mini-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Gráfica de progresión"><defs><linearGradient id={`chart-fill-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>{[25, 75, 125].map((y) => <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,.07)" strokeDasharray="4 5" />)}{fill && <polygon points={`0,${height} ${coords} ${width},${height}`} fill={`url(#chart-fill-${color.replace('#', '')})`} />}{<polyline points={coords} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}{points.map((point, index) => <circle key={index} cx={(index / Math.max(points.length - 1, 1)) * width} cy={height - ((point - min) / range) * (height - 24) - 8} r="4" fill="#11141d" stroke={color} strokeWidth="2" />)}</svg>
}

function BodyMetricChart({ metrics, unit = 'kg', onEdit, onDelete }) {
  const records = metrics.slice().sort((a, b) => a.date.localeCompare(b.date))
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, records.length - 1))
  const [historyOpen, setHistoryOpen] = useState(false)
  const width = 520
  const height = 170
  const values = records.map((item) => Number(displayWeight(item.weight, unit)) || 0)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const coords = values.map((value, index) => ({
    x: (index / Math.max(values.length - 1, 1)) * width,
    y: height - ((value - min) / range) * (height - 32) - 16,
    value,
    record: records[index],
  }))
  const selected = coords[selectedIndex]
  const selectByClientX = (event) => {
    if (!coords.length) return
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
    setSelectedIndex(Math.round(ratio * (coords.length - 1)))
  }
  if (!records.length) return <div className="body-chart-empty"><LineChart size={24} /><h3>Sin registros</h3><p>Añade tu peso para activar el historial.</p></div>
  const points = coords.map((point) => `${point.x},${point.y}`).join(' ')
  return <div className="body-chart-scene" onPointerMove={selectByClientX} onPointerDown={selectByClientX}>
    <svg className="body-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {[32, 86, 140].map((y) => <line key={y} x1="0" x2={width} y1={y} y2={y} stroke="rgba(255,255,255,.07)" strokeDasharray="4 5" />)}
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="rgba(95,212,200,.12)" />
      <polyline points={points} fill="none" stroke="#5fd4c8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((point, index) => <circle key={point.record.id || point.record.date} cx={point.x} cy={point.y} r={index === selectedIndex ? 6 : 4} fill="#11141d" stroke={index === selectedIndex ? '#fff' : '#5fd4c8'} strokeWidth="2.4" />)}
    </svg>
     {selected && <div className="metric-tooltip" style={{ left: `${(selected.x / width) * 100}%`, top: Math.max(4, selected.y - 6) }}><strong>{formatDate(selected.record.date)}</strong><span>{selected.value} {unit}</span></div>}
     <button type="button" className="history-button body-history-toggle" onClick={() => setHistoryOpen((value) => !value)}>{historyOpen ? 'Ocultar historial' : `Ver historial (${records.length})`}<ChevronRight size={14} className={historyOpen ? 'rotate-90' : ''} /></button>
     {historyOpen && <div className="body-history-list">{records.slice().reverse().map((item, index) => {
      const realIndex = records.length - 1 - index
      return <div key={item.id || item.date} className={`body-history-row ${selectedIndex === realIndex ? 'selected' : ''}`}><button type="button" onClick={() => setSelectedIndex(realIndex)}><span>{formatDate(item.date)}</span><strong>{displayWeight(item.weight, unit)} {unit}</strong><small>{item.bodyFatEstimate ? `${item.bodyFatEstimate}% grasa` : item.notes || 'Registro'}</small></button><span className="history-actions"><button type="button" onClick={() => onEdit(item)} aria-label="Editar peso"><Pencil size={14} /></button><button type="button" onClick={() => onDelete(item)} aria-label="Eliminar peso"><Trash2 size={14} /></button></span></div>
     })}</div>}
  </div>
}

function calendarKey(year, month, day) {
  return new Date(year, month, day, 12).toISOString().slice(0, 10)
}

function WorkoutCalendar({ logs, selectedDate, onSelect }) {
  const [cursor, setCursor] = useState(() => new Date())
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const days = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const logDates = new Set(logs.map((log) => log.date))
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(cursor)
  return <GlassCard className="calendar-card"><div className="calendar-heading"><div><span className="eyebrow">CALENDARIO</span><h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2></div><div className="calendar-actions"><IconButton label="Mes anterior" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronRight className="calendar-prev" size={15} /></IconButton><button className="today-link" onClick={() => { const current = new Date(); setCursor(current); onSelect(today()) }}>Hoy</button><IconButton label="Mes siguiente" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={15} /></IconButton></div></div><div className="calendar-weekdays">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: firstDay }).map((_, index) => <span className="calendar-empty" key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => { const day = index + 1; const date = calendarKey(year, month, day); const hasWorkout = logDates.has(date); return <button key={date} onClick={() => onSelect(date)} className={`calendar-day ${hasWorkout ? 'has-workout' : ''} ${date === today() ? 'is-today' : ''} ${date === selectedDate ? 'is-selected' : ''}`}><span>{day}</span>{hasWorkout && <i />}</button> })}</div><div className="calendar-legend"><span><i className="legend-dot workout-dot" /> Entrenamiento</span><span><i className="legend-dot today-dot" /> Hoy</span></div></GlassCard>
}

function WorkoutDetails({ log, unit = 'kg' }) {
  return <div className="workout-details"><div className="workout-detail-meta"><span><CalendarDays size={13} /> {formatDate(log.date)}</span><span><Clock3 size={13} /> {log.durationMinutes || 60} min</span><span><BarChart3 size={13} /> {Math.round(getVolume([log]))} kg</span></div>{log.exercises.map((exercise) => <div className="detail-exercise" key={exercise.exerciseId}><div className="detail-exercise-heading"><b>{exercise.name}</b><span>{exercise.sets.length} series</span></div><div className="detail-set-list">{exercise.sets.map((set, index) => <div className="detail-set" key={`${exercise.exerciseId}-${index}`}><b>{index + 1}</b><span className={`set-type-dot ${set.setType || 'normal'}`} /><span>{displayWeight(set.weight, unit)} {unit}</span><span>× {set.repsAchieved || '—'}</span><small>{set.status === 'parcial' ? 'Parcial' : set.status === 'fallido' ? 'Fallida' : 'Lograda'}</small></div>)}</div></div>)}</div>
}

function WorkoutEditor({ log, routines, onClose, onSave, onDelete, unit = 'kg' }) {
  const routineExercises = [...routines.flatMap((routine) => routine.exercises), ...log.exercises]
  const availableExercises = [...new Map(routineExercises.map((exercise) => [exercise.exerciseId, exercise])).values()]
  const [form, setForm] = useState(() => ({ ...log, durationMinutes: log.durationMinutes || 60, exercises: log.exercises.map((item) => ({ ...item, sets: item.sets.map((set, index) => ({ ...set, setNumber: set.setNumber || index + 1, setType: set.setType || 'normal' })) })) }))
  const [openSetMenu, setOpenSetMenu] = useState(null)
  const updateExercise = (index, values) => setForm((current) => ({ ...current, exercises: current.exercises.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item) }))
  const updateSet = (exerciseIndex, setIndex, values) => setForm((current) => ({ ...current, exercises: current.exercises.map((item, itemIndex) => itemIndex !== exerciseIndex ? item : { ...item, sets: item.sets.map((set, index) => index === setIndex ? { ...set, ...values } : set) }) }))
  const removeSet = (exerciseIndex, setIndex) => setForm((current) => ({ ...current, exercises: current.exercises.map((item, itemIndex) => itemIndex !== exerciseIndex ? item : { ...item, sets: item.sets.filter((_, index) => index !== setIndex).map((set, index) => ({ ...set, setNumber: index + 1 })) }) }))
  const addExercise = () => { const next = availableExercises.find((item) => !form.exercises.some((selected) => selected.exerciseId === item.exerciseId)); if (next) setForm((current) => ({ ...current, exercises: [...current.exercises, { exerciseId: next.exerciseId, name: next.name, sets: [{ setNumber: 1, weight: next.targetWeight || 0, repsAchieved: repsBase(next.targetReps), repsAttempted: repsBase(next.targetReps), status: 'logrado', setType: 'normal' }] }] })) }
  const save = (event) => { event.preventDefault(); onSave({ ...form, durationMinutes: Number(form.durationMinutes) || 1 }) }
  return <Modal title="Editar entrenamiento" onClose={onClose} wide><form onSubmit={save}><div className="form-grid"><label>Fecha<input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label><label>Tiempo de entrenamiento (min)<input type="number" min="1" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} required /></label></div><div className="editor-label"><span>Ejercicios y cargas <small>{form.exercises.length} registrados</small></span><button type="button" className="text-button" onClick={addExercise}><Plus size={14} /> Añadir ejercicio</button></div><div className="workout-edit-list">{form.exercises.map((item, exerciseIndex) => <div className="workout-edit-exercise" key={`${item.exerciseId}-${exerciseIndex}`}><div className="workout-edit-title"><select value={item.exerciseId} onChange={(event) => { const next = availableExercises.find((exercise) => exercise.exerciseId === event.target.value); updateExercise(exerciseIndex, { exerciseId: next?.exerciseId || item.exerciseId, name: next?.name || item.name }) }}>{availableExercises.map((exercise) => <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>)}</select><button type="button" className="delete-inline" onClick={() => setForm((current) => ({ ...current, exercises: current.exercises.filter((_, index) => index !== exerciseIndex) }))}><Trash2 size={14} /></button></div><div className="edit-sets-header"><span>Serie</span><span>{unit.toUpperCase()}</span><span>Reps</span><span>Estado</span><span /></div>{item.sets.map((set, setIndex) => <div className="edit-set-row-wrap" key={`${item.exerciseId}-${setIndex}`}><div className="edit-set-row"><button type="button" className={`set-number ${set.setType || 'normal'}`} onClick={() => setOpenSetMenu(openSetMenu === `${exerciseIndex}-${setIndex}` ? null : `${exerciseIndex}-${setIndex}`)}>{setIndex + 1}</button><input type="number" step=".5" value={displayWeight(set.weight, unit)} onChange={(event) => updateSet(exerciseIndex, setIndex, { weight: parseWeight(event.target.value, unit) })} aria-label="Peso" /><input type="number" value={set.repsAchieved} onChange={(event) => updateSet(exerciseIndex, setIndex, { repsAchieved: event.target.value })} aria-label="Repeticiones" /><select value={set.status || 'logrado'} onChange={(event) => updateSet(exerciseIndex, setIndex, { status: event.target.value })} aria-label="Estado"><option value="logrado">Logrado</option><option value="parcial">Parcial</option><option value="fallido">Fallido</option></select><button type="button" className="delete-set" onClick={() => removeSet(exerciseIndex, setIndex)} aria-label="Eliminar serie"><X size={13} /></button></div>{openSetMenu === `${exerciseIndex}-${setIndex}` && <div className="set-menu editor-set-menu"><span>Tipo de serie</span>{['warm', 'normal', 'failure'].map((type) => <button type="button" className={set.setType === type ? 'active' : ''} onClick={() => { updateSet(exerciseIndex, setIndex, { setType: type }); setOpenSetMenu(null) }} key={type}>{type === 'warm' ? 'Warm set' : type === 'failure' ? 'Failure set' : 'Normal set'}</button>)}</div>}</div>)}</div>)}</div><div className="modal-actions"><Button type="button" variant="danger" onClick={() => window.confirm('¿Eliminar este entrenamiento?') && onDelete(log.id)}><Trash2 size={15} /> Eliminar</Button><span className="action-spacer" /><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit"><Save size={16} /> Guardar cambios</Button></div></form></Modal>
}

function WorkoutDetailModal({ log, unit, onClose, onEdit }) {
  return <Modal title={`${log.dayLabel || 'Entrenamiento'} · ${formatDate(log.date)}`} onClose={onClose} wide><WorkoutDetails log={log} unit={unit} /><div className="modal-actions"><Button variant="ghost" onClick={onClose}>Cerrar</Button><Button onClick={onEdit}><Pencil size={15} /> Editar sesión</Button></div></Modal>
}

function MetricsEnhanced({ logs, routines, notify, user, onUpdateLog, onDeleteLog, unit = 'kg' }) {
  const exerciseOptions = [...new Map([...routines.flatMap((routine) => routine.exercises), ...logs.flatMap((log) => log.exercises)].map((exercise) => [exercise.exerciseId, exercise])).values()]
  const [exerciseId, setExerciseId] = useState(exerciseOptions[0]?.exerciseId)
  const [bodyMetrics, setBodyMetrics] = useStoredState('bodyMetrics', [{ date: today(), weight: 78.4, bodyFatEstimate: 16 }])
  const [metricModal, setMetricModal] = useState(false)
  const [editingMetric, setEditingMetric] = useState(null)
  const [selectedDate, setSelectedDate] = useState(today())
  const [editingLog, setEditingLog] = useState(null)
  const [viewingLog, setViewingLog] = useState(null)
  const [progressOpen, setProgressOpen] = useState(false)
  const [expandedLogIds, setExpandedLogIds] = useState(new Set())
  const selected = exerciseOptions.find((item) => item.exerciseId === exerciseId) || exerciseOptions[0]
  const history = logs.flatMap((log) => log.exercises.filter((exercise) => exercise.exerciseId === selected?.exerciseId).flatMap((exercise) => exercise.sets.map((set) => ({ date: log.date, weight: Number(set.weight) || 0, reps: Number(set.repsAchieved) || 0, log })))).sort((a, b) => a.date.localeCompare(b.date))
  const exerciseHistory = history.slice().reverse()
  const chart = history.length > 1 ? history.map((item) => Number(displayWeight(item.weight, unit))) : [42, 48, 45, 58, 62, 66, 72]
  const weeklyLogs = logs.filter((log) => log.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const selectedLogs = logs.filter((log) => log.date === selectedDate)
  const sortedLogs = logs.slice().sort((a, b) => b.date.localeCompare(a.date))
  const selectCalendarDay = (date) => { setSelectedDate(date); const first = logs.find((log) => log.date === date); setExpandedLogIds(first ? new Set([first.id]) : new Set()) }
  const toggleLog = (id) => setExpandedLogIds((items) => { const next = new Set(items); if (next.has(id)) next.delete(id); else next.add(id); return next })
  const openMetricModal = (metric = null) => { setEditingMetric(metric); setMetricModal(true) }
  const addMetric = (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const metric = { id: editingMetric?.id || `metric-${Date.now()}`, date: form.get('date'), weight: parseWeight(form.get('weight'), unit), bodyFatEstimate: Number(form.get('fat')) || undefined, notes: form.get('notes') }; setBodyMetrics((items) => [...items.filter((item) => item.id !== metric.id), metric].sort((a, b) => a.date.localeCompare(b.date))); if (user) saveUserDocument('bodyMetrics', user.uid, metric).catch(() => notify('Métrica guardada localmente; no se pudo sincronizar', 'error')); setMetricModal(false); setEditingMetric(null); notify(editingMetric ? 'Métrica corporal actualizada' : 'Métrica corporal añadida') }
  const deleteMetric = (metric) => { if (!window.confirm(`¿Eliminar el registro del ${formatDate(metric.date)}?`)) return; setBodyMetrics((items) => items.filter((item) => item.id !== metric.id)); if (user) deleteUserDocument('bodyMetrics', user.uid, metric.id).catch(() => notify('Eliminado localmente; no se pudo sincronizar', 'error')); notify('Registro de peso eliminado') }
  useEffect(() => { if (!user) return; loadUserCollection('bodyMetrics', user.uid).then((remote) => remote.length && setBodyMetrics(remote)).catch(() => {}) }, [user])
  return <div className="page"><TopBar eyebrow="DATOS Y PROGRESIÓN" title="Métricas" action={<IconButton label="Añadir peso" onClick={() => openMetricModal()}><Plus size={19} /></IconButton>} /><div className="stats-grid"><Stat label="Volumen semanal" value={`${(getVolume(weeklyLogs) / 1000).toFixed(1)}`} suffix={`k ${unit}`} icon={BarChart3} tone="purple" /><Stat label="Entrenos esta semana" value={weeklyLogs.length} suffix="/ 4" icon={CalendarDays} tone="teal" /><Stat label="Racha actual" value={getStreak(logs)} suffix=" días" icon={Flame} tone="orange" /></div><GlassCard className={`progress-card ${progressOpen ? 'is-open' : ''}`}><button className="progress-toggle" onClick={() => setProgressOpen((value) => !value)}><span><span className="eyebrow">PROGRESIÓN</span><strong>Progresión por ejercicio</strong><small>{progressOpen ? 'Ocultar selector e historial' : 'Abrir selector e historial por fecha'}</small></span><ChevronRight className={progressOpen ? 'rotate-90' : ''} size={19} /></button>{progressOpen && <div className="progress-expanded"><div className="exercise-picker">{exerciseOptions.map((item) => { const best = getBest(logs, item.exerciseId); const last = logs.filter((log) => log.exercises.some((exercise) => exercise.exerciseId === item.exerciseId)).sort((a, b) => b.date.localeCompare(a.date))[0]; return <button type="button" key={item.exerciseId} className={`exercise-picker-card ${selected?.exerciseId === item.exerciseId ? 'selected' : ''}`} onClick={() => setExerciseId(item.exerciseId)}><span className="picker-glyph">{item.name.charAt(0)}</span><span className="picker-info"><b>{item.name}</b><small>{LIBRARY.find((libraryItem) => libraryItem.id === item.exerciseId)?.muscleGroup || 'Entrenamiento'}</small></span><span className="picker-value"><strong>{best.weight ? displayWeight(best.weight, unit) : item.targetWeight ? displayWeight(item.targetWeight, unit) : '—'}</strong><small>{unit} {last ? `· ${formatDate(last.date)}` : ''}</small></span></button> })}</div><div className="progress-detail-grid"><GlassCard className="chart-card"><div className="card-heading"><div><span className="eyebrow">CARGA REGISTRADA</span><h2>{selected?.name || 'Sin ejercicios'}</h2></div><span className="chart-period">Todas las sesiones</span></div><div className="chart-value"><b>{history.at(-1)?.weight ? displayWeight(history.at(-1).weight, unit) : selected?.targetWeight ? displayWeight(selected.targetWeight, unit) : 0}<small> {unit}</small></b><span className="positive"><MoveUpRight size={14} /> Progresión</span></div><MiniChart points={chart} /><div className="chart-labels"><span>{history[0] ? formatDate(history[0].date) : 'Inicio'}</span><span>Mejor marca</span><span>Último registro</span></div></GlassCard><GlassCard className="exercise-history-card"><div className="card-heading"><div><span className="eyebrow">HISTORIAL DEL EJERCICIO</span><h2>Cuándo lo hiciste</h2></div><History size={17} className="muted-icon" /></div>{exerciseHistory.length === 0 ? <p className="muted">Todavía no hay registros para este ejercicio.</p> : <div className="exercise-history-list">{exerciseHistory.map((item, index) => <button type="button" className="exercise-history-item" key={`${item.log.id}-${index}`} onClick={() => setViewingLog(item.log)}><span className="history-date">{formatDate(item.date)}</span><span><b>{displayWeight(item.weight, unit)} {unit} × {item.reps || '—'} reps</b><small>Ver entrenamiento completo</small></span><ChevronRight size={15} /></button>)}</div>}</GlassCard></div></div>}</GlassCard><WorkoutCalendar logs={logs} selectedDate={selectedDate} onSelect={selectCalendarDay} /><GlassCard className="calendar-detail"><div className="card-heading"><div><span className="eyebrow">SESIONES DEL DÍA</span><h2>{formatDate(selectedDate)}</h2></div><span className="session-count">{selectedLogs.length} {selectedLogs.length === 1 ? 'sesión' : 'sesiones'}</span></div>{selectedLogs.length === 0 ? <p className="muted">Selecciona un día con entrenamiento para abrir la sesión completa.</p> : <div className="session-list">{selectedLogs.map((log) => <div className="session-block" key={log.id}><button type="button" className="session-row" onClick={() => toggleLog(log.id)}><span className="session-icon"><Dumbbell size={15} /></span><span className="session-copy"><b>{log.dayLabel || 'Entrenamiento'}</b><small>{log.exercises.length} ejercicios · {displayWeight(getVolume([log]), unit)} {unit} · {log.durationMinutes || 60} min</small></span><ChevronRight size={16} className={expandedLogIds.has(log.id) ? 'rotate-90' : ''} /></button>{expandedLogIds.has(log.id) && <div className="session-expanded"><WorkoutDetails log={log} unit={unit} /><div className="session-actions"><button className="edit-session" onClick={() => setEditingLog(log)}><Pencil size={14} /> Editar sesión</button><button className="delete-session" onClick={() => window.confirm('¿Eliminar este entrenamiento?') && onDeleteLog(log.id)}><Trash2 size={14} /> Eliminar</button></div></div>}</div>)}</div>}</GlassCard><div className="metrics-columns"><GlassCard><div className="card-heading"><div><span className="eyebrow">CUERPO</span><h2>Peso corporal</h2></div><button className="text-button" onClick={() => openMetricModal()}>Añadir progreso</button></div><div className="body-current"><b>{bodyMetrics.at(-1)?.weight ? displayWeight(bodyMetrics.at(-1).weight, unit) : '—'}<small> {unit}</small></b><span className="positive">Historial actualizado</span></div><BodyMetricChart metrics={bodyMetrics} unit={unit} onEdit={openMetricModal} onDelete={deleteMetric} /></GlassCard><GlassCard><div className="card-heading"><div><span className="eyebrow">TODAS LAS SESIONES</span><h2>Historial</h2></div><History size={17} className="muted-icon" /></div><div className="history-list">{sortedLogs.map((log) => <div className="history-item history-editable" key={log.id}><span className="history-date">{formatDate(log.date)}</span><span><b>{log.dayLabel}</b><small>{log.exercises.length} ejercicios · {log.durationMinutes || 60} min</small></span><span className="history-actions"><button onClick={() => setEditingLog(log)} aria-label="Editar entrenamiento"><Pencil size={14} /></button><button onClick={() => window.confirm('¿Eliminar este entrenamiento?') && onDeleteLog(log.id)} aria-label="Eliminar entrenamiento"><Trash2 size={14} /></button></span></div>)}</div></GlassCard></div>{viewingLog && <WorkoutDetailModal log={viewingLog} unit={unit} onClose={() => setViewingLog(null)} onEdit={() => { setViewingLog(null); setEditingLog(viewingLog) }} />}{editingLog && <WorkoutEditor log={editingLog} routines={routines} unit={unit} onClose={() => setEditingLog(null)} onSave={(next) => { onUpdateLog(next); setEditingLog(null); notify('Entrenamiento actualizado') }} onDelete={(id) => { onDeleteLog(id); setEditingLog(null); notify('Entrenamiento eliminado') }} />}{metricModal && <Modal title={editingMetric ? 'Editar progreso de peso' : 'Registrar progreso de peso'} onClose={() => { setMetricModal(false); setEditingMetric(null) }}><form key={editingMetric?.id || 'new-metric'} onSubmit={addMetric}><div className="form-grid"><label>Fecha<input type="date" name="date" defaultValue={editingMetric?.date || today()} required /></label><label>Peso ({unit})<input type="number" name="weight" step=".1" defaultValue={editingMetric ? displayWeight(editingMetric.weight, unit) : ''} placeholder={unit === 'kg' ? '78.4' : '172.8'} required /></label><label>Grasa estimada (%)<input type="number" name="fat" step=".1" defaultValue={editingMetric?.bodyFatEstimate || ''} placeholder="Opcional" /></label></div><label>Notas<textarea name="notes" defaultValue={editingMetric?.notes || ''} placeholder="¿Cómo te sientes esta semana?" /></label><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => { setMetricModal(false); setEditingMetric(null) }}>Cancelar</Button><Button type="submit"><Save size={16} /> {editingMetric ? 'Actualizar' : 'Guardar'}</Button></div></form></Modal>}</div>
}

function Metrics({ logs, routines, notify, user, onUpdateLog, onDeleteLog, unit = 'kg' }) {
  const exerciseOptions = [...new Map([...routines.flatMap((routine) => routine.exercises), ...logs.flatMap((log) => log.exercises)].map((exercise) => [exercise.exerciseId, exercise])).values()]
  const [exerciseId, setExerciseId] = useState(exerciseOptions[0]?.exerciseId)
  const [bodyMetrics, setBodyMetrics] = useStoredState('bodyMetrics', [{ date: today(), weight: 78.4, bodyFatEstimate: 16 }])
  const [metricModal, setMetricModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())
  const [editingLog, setEditingLog] = useState(null)
  const selected = exerciseOptions.find((item) => item.exerciseId === exerciseId) || exerciseOptions[0]
  const history = logs.flatMap((log) => log.exercises.filter((exercise) => exercise.exerciseId === selected?.exerciseId).flatMap((exercise) => exercise.sets.map((set) => ({ date: log.date, weight: Number(set.weight) || 0, reps: Number(set.repsAchieved) || 0 })))).sort((a, b) => a.date.localeCompare(b.date))
  const chart = history.length > 1 ? history.map((item) => item.weight) : [42, 48, 45, 58, 62, 66, 72]
  const weeklyLogs = logs.filter((log) => log.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
  const selectedLogs = logs.filter((log) => log.date === selectedDate)
  const sortedLogs = logs.slice().sort((a, b) => b.date.localeCompare(a.date))
  const addMetric = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fatVal = form.get('fat')
    const fatNum = fatVal ? Number(fatVal) : null
    const notesVal = form.get('notes') || ''
    const metric = { id: `metric-${Date.now()}`, date: form.get('date'), weight: Number(form.get('weight')), bodyFatEstimate: fatNum, notes: notesVal }
    setBodyMetrics((items) => [...items, metric].sort((a, b) => a.date.localeCompare(b.date)))
    if (user) saveUserDocument('bodyMetrics', user.uid, metric).catch((err) => { console.error('[Firestore addMetric Error]', err); notify('Métrica guardada localmente; no se pudo sincronizar', 'error') })
    setMetricModal(false)
    notify('Métrica corporal añadida')
  }
  useEffect(() => { if (!user) return; loadUserCollection('bodyMetrics', user.uid).then((remote) => remote.length && setBodyMetrics(remote)).catch(() => {}) }, [user])
  return <div className="page"><TopBar eyebrow="DATOS Y PROGRESIÓN" title="Métricas" action={<IconButton label="Añadir peso" onClick={() => setMetricModal(true)}><Plus size={19} /></IconButton>} /><div className="stats-grid"><Stat label="Volumen semanal" value={`${(getVolume(weeklyLogs) / 1000).toFixed(1)}`} suffix="k kg" icon={BarChart3} tone="purple" /><Stat label="Entrenos esta semana" value={weeklyLogs.length} suffix="/ 4" icon={CalendarDays} tone="teal" /><Stat label="Racha actual" value={getStreak(logs)} suffix=" días" icon={Flame} tone="orange" /></div><GlassCard className="progress-card"><div className="card-heading"><div><span className="eyebrow">PROGRESIÓN</span><h2>Elige un ejercicio</h2><p className="card-subtitle">Toca una tarjeta para ver cómo avanzas.</p></div><TrendingUp className="muted-icon" size={18} /></div><div className="exercise-picker">{exerciseOptions.map((item) => { const best = getBest(logs, item.exerciseId); const last = logs.filter((log) => log.exercises.some((exercise) => exercise.exerciseId === item.exerciseId)).sort((a, b) => b.date.localeCompare(a.date))[0]; return <button key={item.exerciseId} className={`exercise-picker-card ${selected?.exerciseId === item.exerciseId ? 'selected' : ''}`} onClick={() => setExerciseId(item.exerciseId)}><span className="picker-glyph">{item.name.charAt(0)}</span><span className="picker-info"><b>{item.name}</b><small>{LIBRARY.find((libraryItem) => libraryItem.id === item.exerciseId)?.muscleGroup || 'Entrenamiento'}</small></span><span className="picker-value"><strong>{best.weight || item.targetWeight || '—'}</strong><small>kg {last ? `· ${formatDate(last.date)}` : ''}</small></span></button> })}</div></GlassCard><GlassCard className="chart-card"><div className="card-heading"><div><span className="eyebrow">CARGA REGISTRADA</span><h2>{selected?.name || 'Sin ejercicios'}</h2></div><span className="chart-period">Todas las sesiones</span></div><div className="chart-value"><b>{history.at(-1)?.weight || selected?.targetWeight || 0}<small> kg</small></b><span className="positive"><MoveUpRight size={14} /> Progresión</span></div><MiniChart points={chart} /><div className="chart-labels"><span>{history[0] ? formatDate(history[0].date) : 'Inicio'}</span><span>Mejor marca</span><span>Hoy</span></div></GlassCard><WorkoutCalendar logs={logs} selectedDate={selectedDate} onSelect={setSelectedDate} /><GlassCard className="calendar-detail"><div className="card-heading"><div><span className="eyebrow">SESIONES DEL DÍA</span><h2>{formatDate(selectedDate)}</h2></div><span className="session-count">{selectedLogs.length} {selectedLogs.length === 1 ? 'sesión' : 'sesiones'}</span></div>{selectedLogs.length === 0 ? <p className="muted">Selecciona un día con entrenamiento para ver sus detalles.</p> : <div className="session-list">{selectedLogs.map((log) => <div className="session-row" key={log.id}><span className="session-icon"><Dumbbell size={15} /></span><span className="session-copy"><b>{log.dayLabel || 'Entrenamiento'}</b><small>{log.exercises.length} ejercicios · {Math.round(getVolume([log]))} kg · {log.durationMinutes || 60} min</small></span><button className="edit-session" onClick={() => setEditingLog(log)}><Pencil size={14} /> Editar</button></div>)}</div>}</GlassCard><div className="metrics-columns"><GlassCard><div className="card-heading"><div><span className="eyebrow">CUERPO</span><h2>Peso corporal</h2></div><button className="text-button" onClick={() => setMetricModal(true)}>Añadir</button></div><div className="body-current"><b>{bodyMetrics.at(-1)?.weight || '—'}<small> kg</small></b><span className="positive">Historial actualizado</span></div><MiniChart points={bodyMetrics.length > 1 ? bodyMetrics.map((item) => item.weight) : [80, 79.8, 79.5, 79.1, 78.9, 78.4]} color="#5fd4c8" /></GlassCard><GlassCard><div className="card-heading"><div><span className="eyebrow">TODAS LAS SESIONES</span><h2>Historial</h2></div><History size={17} className="muted-icon" /></div><div className="history-list">{sortedLogs.map((log) => <div className="history-item history-editable" key={log.id}><span className="history-date">{formatDate(log.date)}</span><span><b>{log.dayLabel}</b><small>{log.exercises.length} ejercicios · {log.durationMinutes || 60} min</small></span><span className="history-actions"><button onClick={() => setEditingLog(log)} aria-label="Editar entrenamiento"><Pencil size={14} /></button><button onClick={() => window.confirm('¿Eliminar este entrenamiento?') && onDeleteLog(log.id)} aria-label="Eliminar entrenamiento"><Trash2 size={14} /></button></span></div>)}</div></GlassCard></div>{editingLog && <WorkoutEditor log={editingLog} routines={routines} onClose={() => setEditingLog(null)} onSave={(next) => { onUpdateLog(next); setEditingLog(null); notify('Entrenamiento actualizado') }} onDelete={(id) => { onDeleteLog(id); setEditingLog(null); notify('Entrenamiento eliminado') }} />}{metricModal && <Modal title="Registrar métrica" onClose={() => setMetricModal(false)}><form onSubmit={addMetric}><div className="form-grid"><label>Fecha<input type="date" name="date" defaultValue={today()} required /></label><label>Peso (kg)<input type="number" name="weight" step=".1" placeholder="78.4" required /></label><label>Grasa estimada (%)<input type="number" name="fat" step=".1" placeholder="Opcional" /></label></div><label>Notas<textarea name="notes" placeholder="¿Cómo te sientes esta semana?" /></label><div className="modal-actions"><Button type="button" variant="ghost" onClick={() => setMetricModal(false)}>Cancelar</Button><Button type="submit"><Save size={16} /> Guardar</Button></div></form></Modal>}</div>
}

const MEASUREMENT_FIELDS = [
  ['shoulders', 'Hombros'], ['chest', 'Pecho'], ['arms', 'Brazos'], ['forearms', 'Antebrazos'],
  ['hips', 'Cadera'], ['thighs', 'Piernas'], ['calves', 'Pantorrillas'],
]

function PhotosEnhanced({ notify, user }) {
  const [photos, setPhotos] = useStoredState('progressPhotos', [])
  const [measurements, setMeasurements] = useStoredState('bodyMeasurements', [])
  const [tag, setTag] = useState('frente')
  const [compare, setCompare] = useState([])
  const [loading, setLoading] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const [progressDate, setProgressDate] = useState(today())
  const latestMeasurement = measurements.slice().sort((a, b) => b.date.localeCompare(a.date))[0]
  useEffect(() => {
    if (!user) return
    Promise.all([loadUserCollection('progressPhotos', user.uid), loadUserCollection('bodyMeasurements', user.uid)]).then(([remotePhotos, remoteMeasurements]) => {
      if (remotePhotos.length) setPhotos(remotePhotos)
      if (remoteMeasurements.length) setMeasurements(remoteMeasurements)
    }).catch(() => {})
  }, [user])
  const upload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    setLoading(true)
    try {
      const newPhotos = []
      for (const [index, file] of files.entries()) {
        const compressed = await imageCompression(file, { maxSizeMB: 0.45, maxWidthOrHeight: 1200, useWebWorker: true })
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(compressed) })
        newPhotos.push({ id: `photo-${Date.now()}-${index}`, date: progressDate, imageUrl: dataUrl, tag, size: compressed.size })
      }
      if (user) await Promise.all(newPhotos.map((photo) => saveUserDocument('progressPhotos', user.uid, photo)))
      setPhotos((items) => [...newPhotos.reverse(), ...items])
      notify(newPhotos.length === 1 ? 'Foto guardada y optimizada' : `${newPhotos.length} fotos guardadas y optimizadas`)
    } catch { notify('No se pudo procesar la imagen', 'error') } finally { setLoading(false); event.target.value = '' }
  }
  const saveMeasurements = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const measurement = { id: `measurement-${progressDate}`, date: progressDate, ...Object.fromEntries(MEASUREMENT_FIELDS.map(([key]) => [key, Number(form.get(key)) || null])) }
    setMeasurements((items) => [...items.filter((item) => item.date !== measurement.date), measurement].sort((a, b) => a.date.localeCompare(b.date)))
    if (user) saveUserDocument('bodyMeasurements', user.uid, measurement).catch(() => notify('Medidas guardadas localmente; no se pudieron sincronizar', 'error'))
    notify('Medidas corporales guardadas')
  }
  const toggleCompare = (id) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id])
  const compared = compare.map((id) => photos.find((photo) => photo.id === id)).filter(Boolean)
  return <div className="page"><TopBar eyebrow="REGISTRO VISUAL" title="Fotos de progreso" action={<Button className="small-button" onClick={() => { setProgressDate(today()); setProgressOpen(true) }}><Plus size={16} /> Agregar nuevo progreso</Button>} /><GlassCard className="photo-intro"><div className="photo-intro-icon"><Camera size={22} /></div><div><b>Tu progreso, sin filtros</b><p>Guarda fotos y medidas juntas para comparar tu evolución por fecha.</p></div><Sparkles size={18} className="accent-icon" /></GlassCard>{photos.length === 0 ? <EmptyState icon={Camera} title="Tu galería está vacía" description="Cuando estés listo, agrega un nuevo progreso para subir fotos y registrar tus medidas." action={<Button variant="secondary" onClick={() => setProgressOpen(true)}><Plus size={16} /> Agregar nuevo progreso</Button>} /> : <><div className="photo-toolbar"><div><span className="eyebrow">GALERÍA</span><p className="photo-toolbar-copy">Selecciona dos fotos para compararlas.</p></div>{photos.length > 1 && <span className="compare-hint">{compare.length === 2 ? '2 seleccionadas' : 'Selecciona 2 para comparar'}</span>}</div><div className="photo-grid">{photos.slice().sort((a, b) => b.date.localeCompare(a.date)).map((photo) => <button className={`photo-item ${compare.includes(photo.id) ? 'photo-selected' : ''}`} key={photo.id} onClick={() => toggleCompare(photo.id)}><img src={photo.imageUrl} alt={`Progreso ${photo.tag} del ${formatDate(photo.date)}`} /><div className="photo-meta"><span>{formatDate(photo.date)}</span><small>{photo.tag}</small></div>{compare.includes(photo.id) && <span className="photo-check"><Check size={14} /></span>}</button>)}</div></>}{progressOpen && <Modal title="Agregar nuevo progreso" onClose={() => setProgressOpen(false)} wide><div className="progress-modal-intro"><div className="photo-intro-icon"><Sparkles size={18} /></div><p>Elige una fecha, sube una o varias fotos y registra tus medidas en el mismo progreso.</p></div><label>Fecha del progreso<input type="date" value={progressDate} onChange={(event) => setProgressDate(event.target.value)} required /></label><div className="progress-upload-box"><div><span className="eyebrow">FOTOS</span><h3>Sube tus fotos</h3><p>Puedes seleccionar varias. Todas quedarán guardadas con la fecha elegida.</p></div><div className="segmented">{['frente', 'perfil', 'espalda', 'otro'].map((item) => <button type="button" className={tag === item ? 'selected' : ''} onClick={() => setTag(item)} key={item}>{item}</button>)}</div><label className={`button button-secondary progress-upload-button ${loading ? 'is-loading' : ''}`}>{loading ? <RotateCcw className="spin" size={16} /> : <ImagePlus size={16} />} {loading ? 'Procesando fotos...' : 'Elegir fotos'}<input type="file" accept="image/*" capture="environment" multiple onChange={upload} hidden /></label></div><form className="measurements-form progress-measurements-form" onSubmit={saveMeasurements}><div className="editor-label"><span><span className="eyebrow">MEDIDAS CORPORALES</span><strong>Registra tu progreso</strong></span><Activity className="muted-icon" size={18} /></div><div className="measurements-grid">{MEASUREMENT_FIELDS.map(([key, label]) => <label key={key}>{label} (cm)<input type="number" name={key} step=".1" min="0" placeholder={latestMeasurement?.[key] || '—'} defaultValue={latestMeasurement?.[key] || ''} /></label>)}</div><div className="modal-actions"><Button type="submit"><Save size={15} /> Guardar medidas</Button><Button type="button" variant="ghost" onClick={() => setProgressOpen(false)}>Listo</Button></div></form></Modal>}{compared.length === 2 && <Modal title="Comparar progreso" onClose={() => setCompare([])} wide><div className="comparison"><div><img src={compared[0].imageUrl} alt="Antes" /><span>{formatDate(compared[0].date)} · {compared[0].tag}</span></div><div><img src={compared[1].imageUrl} alt="Después" /><span>{formatDate(compared[1].date)} · {compared[1].tag}</span></div></div></Modal>}</div>
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
      const compressed = await imageCompression(file, { maxSizeMB: 0.45, maxWidthOrHeight: 1200, useWebWorker: true })
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(compressed) })
      const photo = { id: `photo-${Date.now()}`, date: today(), imageUrl: dataUrl, tag, size: compressed.size }
      if (user) await saveUserDocument('progressPhotos', user.uid, photo)
      setPhotos((items) => [photo, ...items])
      notify('Foto guardada y optimizada')
    } catch { notify('No se pudo procesar la imagen', 'error') } finally { setLoading(false); event.target.value = '' }
  }
  const toggleCompare = (id) => setCompare((items) => items.includes(id) ? items.filter((item) => item !== id) : items.length < 2 ? [...items, id] : [items[1], id])
  const compared = compare.map((id) => photos.find((photo) => photo.id === id)).filter(Boolean)
  return <div className="page"><TopBar eyebrow="REGISTRO VISUAL" title="Fotos de progreso" action={<label className="button button-primary small-button">{loading ? <RotateCcw className="spin" size={16} /> : <ImagePlus size={16} />} {loading ? 'Procesando' : 'Añadir foto'}<input type="file" accept="image/*" capture="environment" onChange={upload} hidden /></label>} /><GlassCard className="photo-intro"><div className="photo-intro-icon"><Camera size={22} /></div><div><b>Tu progreso, sin filtros</b><p>Las fotos se comprimen en tu dispositivo antes de guardarse.</p></div><Sparkles size={18} className="accent-icon" /></GlassCard><div className="photo-toolbar"><div className="segmented">{['frente', 'perfil', 'espalda', 'otro'].map((item) => <button className={tag === item ? 'selected' : ''} onClick={() => setTag(item)} key={item}>{item}</button>)}</div>{photos.length > 1 && <span className="compare-hint">{compare.length === 2 ? '2 seleccionadas' : 'Selecciona 2 para comparar'}</span>}</div>{photos.length === 0 ? <EmptyState icon={Camera} title="Tu galería está vacía" description="Añade una foto de frente, perfil o espalda para empezar a ver tu evolución." action={<label className="button button-secondary"><Camera size={16} /> Abrir cámara<input type="file" accept="image/*" capture="environment" onChange={upload} hidden /></label>} /> : <div className="photo-grid">{photos.slice().sort((a, b) => b.date.localeCompare(a.date)).map((photo) => <button className={`photo-item ${compare.includes(photo.id) ? 'photo-selected' : ''}`} key={photo.id} onClick={() => toggleCompare(photo.id)}><img src={photo.imageUrl} alt={`Progreso ${photo.tag} del ${formatDate(photo.date)}`} /><div className="photo-meta"><span>{formatDate(photo.date)}</span><small>{photo.tag}</small></div>{compare.includes(photo.id) && <span className="photo-check"><Check size={14} /></span>}</button>)}</div>}{compared.length === 2 && <Modal title="Comparar progreso" onClose={() => setCompare([])} wide><div className="comparison"><div><img src={compared[0].imageUrl} alt="Antes" /><span>{formatDate(compared[0].date)} · {compared[0].tag}</span></div><div><img src={compared[1].imageUrl} alt="Después" /><span>{formatDate(compared[1].date)} · {compared[1].tag}</span></div></div></Modal>}</div>
}

function ExerciseManager({ library, setLibrary, routines, setRoutines, notify, unit = 'kg', onClose }) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(library[0]?.id || null)
  const [draft, setDraft] = useState(() => library[0] || { name: '', muscleGroup: 'Personalizado', emoji: '✦', defaultSets: 3, defaultReps: '10', defaultWeight: 0, defaultRestSeconds: 90 })
  const selected = library.find((item) => item.id === selectedId)
  const results = library.filter((item) => `${item.name} ${item.muscleGroup}`.toLowerCase().includes(query.toLowerCase()))
  const selectExercise = (item) => { setSelectedId(item.id); setDraft({ ...item }) }
  const newExercise = () => { setSelectedId(null); setDraft({ name: '', muscleGroup: 'Personalizado', emoji: '✦', defaultSets: 3, defaultReps: '10', defaultWeight: 0, defaultRestSeconds: 90, isCustom: true }) }
  const saveExercise = (event) => {
    event.preventDefault()
    if (!draft.name.trim()) return
    const next = { ...draft, name: draft.name.trim(), id: selectedId || `custom-${Date.now()}`, defaultSets: Math.max(1, Number(draft.defaultSets) || 3), defaultWeight: Math.max(0, Number(draft.defaultWeight) || 0), defaultRestSeconds: editRestValue(draft.defaultRestSeconds) || 0 }
    setLibrary((items) => selectedId ? items.map((item) => item.id === selectedId ? next : item) : [...items, next])
    setRoutines((items) => items.map((routine) => ({ ...routine, exercises: routine.exercises.map((exercise) => exercise.exerciseId !== next.id ? exercise : { ...exercise, name: next.name, targetSets: next.defaultSets, targetReps: next.defaultReps, targetWeight: next.defaultWeight, restSeconds: next.defaultRestSeconds }) })))
    setSelectedId(next.id)
    setDraft(next)
    notify(selectedId ? 'Ejercicio actualizado en toda la biblioteca' : 'Ejercicio añadido a la biblioteca')
  }
  const removeExercise = () => {
    if (!selected || !window.confirm(`¿Eliminar "${selected.name}" de la biblioteca y de las rutinas?`)) return
    setLibrary((items) => items.filter((item) => item.id !== selected.id))
    setRoutines((items) => items.map((routine) => ({ ...routine, exercises: routine.exercises.filter((exercise) => exercise.exerciseId !== selected.id).map((exercise, index) => ({ ...exercise, order: index })) })))
    const next = library.find((item) => item.id !== selected.id)
    if (next) selectExercise(next)
    else newExercise()
    notify('Ejercicio eliminado')
  }
  return <Modal title="Biblioteca global de ejercicios" onClose={onClose} wide><p className="modal-copy">Busca cualquier ejercicio para editar sus datos, eliminarlo o crear uno nuevo. Los cambios se aplican a todas las rutinas que lo usan.</p><div className="global-editor-layout"><aside className="exercise-library-panel"><div className="search-field"><SlidersHorizontal size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ejercicio..." /></div><Button className="new-exercise-button" variant="secondary" onClick={newExercise}><Plus size={15} /> Nuevo ejercicio</Button><div className="global-library-list">{results.map((item) => <button type="button" className={`global-library-item ${selectedId === item.id ? 'selected' : ''}`} key={item.id} onClick={() => selectExercise(item)}><span className="mini-icon">{item.emoji || '✦'}</span><span><b>{item.name}</b><small>{item.muscleGroup}</small></span><ChevronRight size={14} /></button>)}{!results.length && <p className="muted center">No hay coincidencias.</p>}</div></aside><form className="global-exercise-form" onSubmit={saveExercise}><div className="editor-label"><span><span className="eyebrow">{selected ? 'EDITAR EJERCICIO' : 'NUEVO EJERCICIO'}</span><strong>{selected ? 'Detalles globales' : 'Añade un ejercicio'}</strong></span><Dumbbell className="muted-icon" size={18} /></div><label>Nombre<input autoFocus={!selected} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Ej. Press de pecho en máquina" required /></label><div className="form-grid"><label>Grupo muscular<input value={draft.muscleGroup} onChange={(event) => setDraft({ ...draft, muscleGroup: event.target.value })} placeholder="Pecho" /></label><label>Icono<input value={draft.emoji || ''} maxLength="2" onChange={(event) => setDraft({ ...draft, emoji: event.target.value })} placeholder="✦" /></label><label>Series predeterminadas<input type="number" min="1" value={draft.defaultSets} onChange={(event) => setDraft({ ...draft, defaultSets: event.target.value })} /></label><label>Repeticiones<input value={draft.defaultReps} onChange={(event) => setDraft({ ...draft, defaultReps: event.target.value })} placeholder="10–12" /></label><label>{unit.toUpperCase()} predeterminado<input type="number" min="0" step=".5" value={displayWeight(draft.defaultWeight, unit)} onChange={(event) => setDraft({ ...draft, defaultWeight: parseWeight(event.target.value, unit) })} /></label><label>Descanso (segundos)<input type="number" min="0" step="5" value={restValue(draft.defaultRestSeconds)} onChange={(event) => setDraft({ ...draft, defaultRestSeconds: editRestValue(event.target.value) })} /></label></div><div className="modal-actions"><Button type="submit"><Save size={16} /> {selected ? 'Guardar cambios' : 'Añadir ejercicio'}</Button>{selected && <Button type="button" variant="danger" onClick={removeExercise}><Trash2 size={15} /> Eliminar</Button>}</div></form></div><div className="modal-actions"><Button type="button" variant="ghost" onClick={onClose}>Cerrar</Button></div></Modal>
}

function Profile({ restSeconds, setRestSeconds, notify, logs, routines, setRoutines, setLogs, library, setLibrary, firebaseAuthError = false }) {
  const [showLogin, setShowLogin] = useState(false)
  const [showExerciseManager, setShowExerciseManager] = useState(false)
  const [accent, setAccent] = useStoredState('accent', ACCENTS[0])
  useEffect(() => document.documentElement.style.setProperty('--accent', accent), [accent])
  const exportData = () => { const blob = new Blob([JSON.stringify({ routines, logs, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'gym-tracker-backup.json'; link.click(); URL.revokeObjectURL(url); notify('Copia de seguridad descargada') }
  const clearData = () => { if (window.confirm('Esto borrará tus rutinas, registros y fotos locales. ¿Continuar?')) { setRoutines([]); setLogs([]); localStorage.removeItem('gym-tracker:progressPhotos'); notify('Datos locales eliminados') } }
  return <div className="page"><TopBar eyebrow="TU CUENTA" title="Perfil" action={<div className="avatar large">JL</div>} /><GlassCard className="profile-card"><div className="profile-avatar">JL</div><div><h2>Joshua</h2><p>{isFirebaseConfigured && !firebaseAuthError ? 'Cuenta sincronizada con Firebase' : 'Modo demo · datos guardados en este dispositivo'}</p></div><IconButton label="Editar perfil"><Edit3 size={17} /></IconButton></GlassCard>{(!isFirebaseConfigured || firebaseAuthError) && <div className="firebase-note"><div className="note-icon"><Sparkles size={16} /></div><div><b>{firebaseAuthError ? 'Firebase está configurado, pero falta iniciar sesión' : 'Conecta Firebase cuando estés listo'}</b><p>{firebaseAuthError ? 'Activa Anonymous en Authentication o inicia sesión con tu cuenta para sincronizar tus datos.' : 'Añade tus variables VITE_FIREBASE_* para activar autenticación y Firestore.'}</p></div><button onClick={() => setShowLogin(true)}><LogIn size={15} /> Iniciar sesión</button></div>}<div className="settings-group"><div className="settings-heading"><span className="eyebrow">PREFERENCIAS</span><h2>Configuración</h2></div><button className="action-row" onClick={() => setShowExerciseManager(true)}><span className="setting-symbol"><Dumbbell size={17} /></span><span><b>Editor global de ejercicios</b><small>Busca, edita, elimina o añade ejercicios para todas tus rutinas</small></span><ChevronRight size={17} /></button><div className="settings-row"><span className="setting-symbol"><Clock3 size={17} /></span><span><b>Descanso predeterminado</b><small>Se usa cuando una rutina no tiene un descanso propio</small></span><label className="inline-setting-input"><input type="number" min="0" step="5" value={restSeconds} onChange={(event) => setRestSeconds(editRestValue(event.target.value))} /><small>s</small></label></div><div className="settings-row"><span className="setting-symbol"><Sparkles size={17} /></span><span><b>Color de acento</b><small>Personaliza tu espacio</small></span><div className="color-picker settings-colors">{ACCENTS.map((color) => <button key={color} className={accent === color ? 'selected' : ''} style={{ background: color }} onClick={() => setAccent(color)} aria-label="Cambiar color" />)}</div></div><div className="settings-row"><span className="setting-symbol"><Moon size={17} /></span><span><b>Modo oscuro</b><small>Optimizado para el gimnasio</small></span><span className="toggle on"><i /></span></div></div><div className="settings-group"><div className="settings-heading"><span className="eyebrow">DATOS</span><h2>Tu información</h2></div><button className="action-row" onClick={exportData}><span className="setting-symbol"><Download size={17} /></span><span><b>Exportar mis datos</b><small>Descarga rutinas y entrenamientos en JSON</small></span><ChevronRight size={17} /></button><button className="action-row danger-row" onClick={clearData}><span className="setting-symbol"><Trash2 size={17} /></span><span><b>Borrar datos locales</b><small>Esta acción no se puede deshacer</small></span><ChevronRight size={17} /></button></div><div className="app-version"><Dumbbell size={15} /> Gym Tracker <span>·</span> v1.0.0</div>{showExerciseManager && <ExerciseManager library={library} setLibrary={setLibrary} routines={routines} setRoutines={setRoutines} notify={notify} onClose={() => setShowExerciseManager(false)} />}{showLogin && <LoginModal onClose={() => setShowLogin(false)} notify={notify} />}</div>
}

function LoginModal({ onClose, notify }) {
  const [mode, setMode] = useState('login')
  const submit = async (event) => {
    event.preventDefault()
    console.log('[Firebase Auth Debug] Intentando iniciar sesión / crear cuenta...')
    console.log('[Firebase Auth Debug] isFirebaseConfigured:', isFirebaseConfigured)
    console.log('[Firebase Auth Debug] auth objeto:', auth)
    console.log('[Firebase Auth Debug] apiKey presente:', Boolean(import.meta.env.VITE_FIREBASE_API_KEY))

    if (!isFirebaseConfigured || !auth) {
      console.error('[Firebase Auth Error] Firebase no está completamente configurado. Falta el apiKey (VITE_FIREBASE_API_KEY).')
      notify('Añade la configuración de Firebase para iniciar sesión', 'error')
      return
    }

    const form = new FormData(event.currentTarget)
    const email = form.get('email')
    const password = form.get('password')

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        console.log('[Firebase Auth Exito] Sesión iniciada correctamente para:', email)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        console.log('[Firebase Auth Exito] Cuenta creada correctamente para:', email)
      }
      notify(mode === 'login' ? 'Sesión iniciada' : 'Cuenta creada')
      onClose()
    } catch (error) {
      console.error('[Firebase Auth Error Details]:', error.code, error.message, error)
      notify(error.code === 'auth/invalid-credential' ? 'Email o contraseña incorrectos' : `Error al iniciar sesión: ${error.message || error.code}`, 'error')
    }
  }
  return <Modal title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'} onClose={onClose}><form onSubmit={submit}><label>Email<input type="email" name="email" required placeholder="tu@email.com" /></label><label>Contraseña<input type="password" name="password" required minLength="6" placeholder="••••••••" /></label><Button type="submit" className="full-button"><LogIn size={16} /> Continuar</Button></form><button className="switch-auth" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Ya tengo una cuenta'}</button></Modal>
}

export default function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [routines, setRoutines] = useStoredState('routines', INITIAL_ROUTINES)
  const [logs, setLogs] = useStoredState('workoutLogs', INITIAL_LOGS)
  const [exerciseLibrary, setExerciseLibrary] = useStoredState('exerciseLibrary', LIBRARY)
  const [restSeconds, setRestSeconds] = useStoredState('restSeconds', 90)
  const [toast, setToast] = useState(null)
  const [user, setUser] = useState(null)
  const [remoteReady, setRemoteReady] = useState(false)
  const [firebaseAuthError, setFirebaseAuthError] = useState(false)
  useEffect(() => {
    if (readStore('routine-plan-v2', false)) return
    const seededIds = new Set(INITIAL_ROUTINES.map((item) => item.id))
    const next = routines.map((routine) => seededIds.has(routine.id) ? INITIAL_ROUTINES.find((item) => item.id === routine.id) : routine)
    INITIAL_ROUTINES.forEach((routine) => { if (!next.some((item) => item.id === routine.id)) next.push(routine) })
    setRoutines(next)
    writeStore('routine-plan-v2', true)
  }, [])
  const notify = (message, type = 'success') => setToast({ message, type })
  useEffect(() => {
    if (!auth) return undefined
    return onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        signInAnonymously(auth).catch(() => {
          setFirebaseAuthError(true)
          setRemoteReady(true)
          notify('No se pudo conectar a Firebase; seguimos en este dispositivo', 'error')
        })
        return
      }
      setUser(currentUser)
      setFirebaseAuthError(false)
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
  const updateLog = (next) => {
    setLogs((items) => items.map((item) => item.id === next.id ? next : item))
    if (user && remoteReady) saveUserDocument('workoutLogs', user.uid, next).catch(() => notify('Cambio local; no se pudo sincronizar', 'error'))
  }
  const removeLog = (id) => {
    setLogs((items) => items.filter((item) => item.id !== id))
    if (user && remoteReady) deleteUserDocument('workoutLogs', user.uid, id).catch(() => notify('Eliminado localmente; no se pudo sincronizar', 'error'))
  }
  const content = activeTab === 'today' ? <Today routines={routines} logs={logs} onSaveLog={saveLog} restSeconds={restSeconds} setRestSeconds={setRestSeconds} notify={notify} onGoRoutines={() => setActiveTab('routines')} /> : activeTab === 'routines' ? <Routines routines={routines} setRoutines={updateRoutines} notify={notify} user={user} library={exerciseLibrary} onLibraryChange={setExerciseLibrary} /> : activeTab === 'metrics' ? <MetricsEnhanced logs={logs} routines={routines} notify={notify} user={user} onUpdateLog={updateLog} onDeleteLog={removeLog} /> : activeTab === 'photos' ? <PhotosEnhanced notify={notify} user={user} /> : <Profile restSeconds={restSeconds} setRestSeconds={setRestSeconds} notify={notify} logs={logs} routines={routines} setRoutines={updateRoutines} setLogs={setLogs} library={exerciseLibrary} setLibrary={setExerciseLibrary} firebaseAuthError={firebaseAuthError} />
  return <div className="app-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><main>{content}</main><BottomNav active={activeTab} onChange={setActiveTab} /><Toast toast={toast} onClose={() => setToast(null)} /></div>
}

