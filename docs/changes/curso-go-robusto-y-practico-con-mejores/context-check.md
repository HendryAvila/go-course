# Context Check — Go Course Enhancement

## Código Relevado

### Componentes existentes
- **Quiz.svelte** — Multiple choice con feedback por opción y score acumulado. Sin retry, sin modo review post-quiz. Feedback solo muestra explanation de opción elegida y la correcta.
- **GoPlayground** — Playground externo (presumably play.golang.org). Sin ejercicios estructurados, sin validación de output.
- **BranchingScenario.svelte** — Árbol de decisiones (no leído aún en detalle).
- **DragDrop.svelte** — Ejercicio drag-and-drop (no leído en detalle).
- **Timer.svelte** — Countdown para timed challenges.
- **VocabularyFloat** — Glosario flotante por módulo.
- **BadgeNotification** — Toast de badge desbloqueado.
- **ProgressBar, ModuleNav, SourcesSection** — UI/nav helpers.

### Estado del contenido (Módulo 1 como referencia)
- Contenido teórico: sólido pero lineal. Solo texto + code blocks con syntax highlighting manual via `{@html}`.
- Quiz: 5 preguntas de historia/filosofía. Sin preguntas de código real.
- Playground: un solo ejemplo "Hola Mundo" sin guía de ejercicios.
- Sin ejercicios prácticos progresivos, sin mini-proyectos, sin challenges.

### State management (courseStore)
- Svelte writable store con persist a localStorage en cada mutación.
- `completeModule(id, score, maxScore)` — se llama una vez al terminar el quiz.
- `unlockBadge` — idempotente.
- Sin tracking de intentos, ni tiempo por módulo, ni ejercicios individuales.

### Arquitectura de rutas
- Solo existe `/modulo/1/+page.svelte`. Los módulos 2–12 presumiblemente no están implementados aún.
- Hay un único template de módulo por ruta estática.

## Gaps Identificados

### Pedagógicos
1. **Sin retrieval practice diferida** — Quiz solo al final de cada módulo, sin repaso de módulos anteriores.
2. **Sin ejercicios de código con validación** — Playground libre sin estructura ni feedback.
3. **Sin progresión de dificultad** — No hay ejercicios básico/intermedio/avanzado.
4. **Sin proyectos integradores** — Los módulos son silos sin conexión práctica entre sí.
5. **Sin error-driven learning** — No se enseña deliberadamente a leer errores del compilador.
6. **Quizzes solo trivia** — Preguntas sobre historia/sintaxis, no sobre comprensión conceptual profunda.

### Contenido Go
7. **Versión desactualizada** — El hito más reciente en el módulo 1 es "2022 - Go 1.18 introduce Generics". No menciona Go 1.21–1.24.
8. **Sin generics en módulos** — Generics introducidos en 1.18 no tienen módulo dedicado.
9. **Sin slog** — log/slog (Go 1.21) no está cubierto.
10. **Sin range over integers** (Go 1.22) ni range over funcs (Go 1.23).
11. **Sin slices/maps packages** (Go 1.21 stdlib).

### UX / Interactividad
12. **Sin modo retry** en Quiz — Si fallas no puedes reintentar preguntas incorrectas.
13. **Sin modo review** — Después de completar un módulo no puedes revisar las respuestas.
14. **Playground sin guía** — Ejercicios del playground son abiertos sin objetivos claros.

## Archivos Clave a Modificar
- `src/lib/data/modules.ts` — Metadata de módulos (agregar módulo 13 de Generics y actualizar versiones)
- `src/lib/data/vocabulary.ts` — Ampliar glosario
- `src/lib/stores/course.ts` — Posiblemente añadir tracking de ejercicios individuales
- `src/lib/components/Quiz.svelte` — Agregar retry, review mode, preguntas de código
- `src/lib/components/GoPlayground.svelte` — Agregar ejercicios estructurados con objetivos
- `src/routes/modulo/[1-12]/+page.svelte` — Actualizar contenido de todos los módulos
- Nuevo componente: `CodeChallenge.svelte` para ejercicios con validación de output

## Riesgos
- **Alcance masivo**: 12 módulos × contenido nuevo = trabajo muy grande. Priorizar por impacto.
- **Sin test de módulos 2-12**: No están implementados aún, lo que es una oportunidad para hacerlos correctamente desde el principio.
- **Playground externo**: Sin backend propio, la validación de ejercicios de código es limitada (solo podemos verificar que el código "se ejecuta", no que produce el output correcto automáticamente).
