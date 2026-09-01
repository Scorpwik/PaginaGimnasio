from pathlib import Path

path = Path(r"C:\Users\Administrador\Documents\PaginaGimnasio\PaginaGimnasio\src\App.jsx")
text = path.read_text(encoding="utf-8")

replacements = {
    "MÃ©tricas": "Métricas",
    "NavegaciÃ³n principal": "Navegación principal",
    "Â¡Lista para la siguiente serie!": "¡Lista para la siguiente serie!",
    "Respira. MantÃ©n el ritmo.": "Respira. Mantén el ritmo.",
    "GuÃ­a": "Guía",
    "GUÃA VISUAL": "GUÍA VISUAL",
    "Â· movimiento controlado y rango cÃ³modo.": "· movimiento controlado y rango cómodo.",
    "tÃ©cnica ejercicio": "técnica ejercicio",
    "SesiÃ³n guardada. Buen trabajo.": "Sesión guardada. Buen trabajo.",
    "SESIÃ“N ACTIVA": "SESIÓN ACTIVA",
    "aÃ±adidos": "añadidos",
    "AÃ±ade ejercicios desde la librerÃ­a para comenzar.": "Añade ejercicios desde la librería para comenzar.",
    "DiseÃ±a sesiones que puedas repetir y mejorar.": "Diseña sesiones que puedas repetir y mejorar.",
    "GrÃ¡fica de progresiÃ³n": "Gráfica de progresión",
    "AÃ±adir ejercicio": "Añadir ejercicio",
    "AÃ±ade tu primer peso para ver la evoluciÃ³n en un grÃ¡fico.": "Añade tu primer peso para ver la evolución en un gráfico.",
    "AÃ±ade una foto de frente, perfil o espalda para empezar a ver tu evoluciÃ³n.": "Añade una foto de frente, perfil o espalda para empezar a ver tu evolución.",
    "AÃ±ade la configuraciÃ³n de Firebase para iniciar sesiÃ³n": "Añade la configuración de Firebase para iniciar sesión",
    "Email o contraseÃ±a incorrectos": "Email o contraseña incorrectos",
    "No se pudo iniciar sesiÃ³n. Revisa tus datos.": "No se pudo iniciar sesión. Revisa tus datos.",
    "AÃ±ade": "Añade",
    "Â¿No tienes cuenta? Crear una": "¿No tienes cuenta? Crear una",
    "Ya tengo una cuenta": "Ya tengo una cuenta",
    "AÃ±adir peso": "Añadir peso",
    "MÃ©trica corporal aÃ±adida": "Métrica corporal añadida",
    "MÃ©trica guardada localmente; no se pudo sincronizar": "Métrica guardada localmente; no se pudo sincronizar",
    "AÃºn no hay rutinas": "Aún no hay rutinas",
    "aÃ±ade ejercicios de la librerÃ­a": "añade ejercicios de la librería",
    "Crea una rutina para que Gym Tracker prepare automÃ¡ticamente tu entrenamiento de hoy.": "Crea una rutina para que Gym Tracker prepare automáticamente tu entrenamiento de hoy.",
    "DÃ­a asignado": "Día asignado",
    "AÃ±ade tus medidas": "Añade tus medidas",
    "Ãšltimo registro": "Último registro",
    "Editar sesiÃ³n": "Editar sesión",
    "MÃ©trica": "Métrica",
    "Racha actual": "Racha actual",
    "dÃ­as": "días",
    "AÃ±adir foto": "Añadir foto",
    "Ejercicios <small>{form.exercises.length} aÃ±adidos": "Ejercicios <small>{form.exercises.length} añadidos",
    "AÃ±ade la configuraciÃ³n": "Añade la configuración",
    "SesiÃ³n iniciada": "Sesión iniciada",
    "AÃ±ade tu primer peso para ver la evoluciÃ³n en un grÃ¡fico.": "Añade tu primer peso para ver la evolución en un gráfico.",
    "AÃ±ade contra": "Añade contra",
}

for old, new in replacements.items():
    text = text.replace(old, new)

char_map = {
    "Ã¡": "á",
    "Ã©": "é",
    "Ã³": "ó",
    "Ã±": "ñ",
    "Ã¼": "ü",
    "Ãº": "ú",
    "Ã": "Í",
    "Ã‰": "É",
    "Ã“": "Ó",
    "Ã": "Á",
    "Ãš": "Ú",
    "Ã‘": "Ñ",
    "Â¡": "¡",
    "Â·": "·",
    "â€“": "–",
    "â€”": "—",
    "â€œ": "“",
    "â€": "”",
    "â€˜": "‘",
    "â€™": "’",
    "Ã" : "Á",
}

for old, new in char_map.items():
    text = text.replace(old, new)

# cleanup any remaining common mojibake fragments
text = text.replace("Ã", "")

path.write_text(text, encoding="utf-8")
print("fix_mojibake.py: updated App.jsx")
