# Tasks — Plan de Ejecución por Waves

## Wave 0: Infraestructura (sin dependencias)

**TASK-001**: Crear type system de ejercicios
- Archivo: `src/lib/data/exercises/types.ts`
- Interfaces: Exercise, ExerciseTier, ReviewCard, ExerciseProgress, LeitnerCard
- Traza: FR-ENH-003, FR-ENH-006, FR-ENH-008
- Estimación: 30min

**TASK-002**: Extender CourseState con ejercicios y review cards
- Archivo: `src/lib/stores/course.ts`
- Agregar: `exercises: Record<string, ExerciseProgress>`, `reviewCards: Record<string, LeitnerCard>`
- Nuevos métodos: `completeExercise()`, `reviewCard()`, `getReviewCardsForModule()`
- Migración: CourseState existente se auto-extiende con campos nuevos (defaults vacíos)
- Traza: FR-ENH-016, NFR-ENH-001
- Estimación: 1h

**TASK-003**: Actualizar ModuleInfo con field `activities`
- Archivo: `src/lib/data/modules.ts`
- Reemplazar `type: string` por `activities: string[]`
- Actualizar los 12 módulos con las actividades correspondientes
- Actualizar timeline de Go hasta 1.24
- Traza: AMB-005, FR-ENH-015
- Estimación: 30min

---

## Wave 1: Componentes Nuevos (depende de Wave 0)

**TASK-004**: Crear componente WorkedExample.svelte
- Props: title, steps[], playground?
- Renderizado paso a paso con faded reveal
- Sin score — puramente didáctico
- Traza: FR-ENH-002
- Estimación: 1.5h

**TASK-005**: Crear componente CodeChallenge.svelte
- Props: exercise (Exercise type), onComplete callback
- Integración con Go Playground API (`https://go.dev/_/compile`)
- Hints progresivos, solución revelaable, panel de output
- Indicador de tier visual
- Traza: FR-ENH-006, FR-ENH-007, FR-ENH-018
- Estimación: 3h

**TASK-006**: Crear componente ReviewCards.svelte
- Props: moduleId
- Algoritmo Leitner de 3 cajas
- Muestra 2-3 cards, respuesta + feedback
- Integración con courseStore.reviewCard()
- Traza: FR-ENH-008, FR-ENH-009, AMB-002
- Estimación: 2h

**TASK-007**: Mejorar Quiz.svelte con Retry + Review mode
- Retry mode: reintentar solo preguntas incorrectas
- Review mode: ver todas las preguntas con explicaciones
- Score = max(original, retry)
- Traza: FR-ENH-010, FR-ENH-012
- Estimación: 1.5h

---

## Wave 2: Data de Ejercicios (depende de Wave 0, paralelo con Wave 1)

**TASK-008**: Crear review cards pool
- Archivo: `src/lib/data/exercises/review-cards.ts`
- 3-5 cards por módulo (36-60 cards total)
- Cubrir conceptos clave de cada módulo
- Traza: FR-ENH-008

**TASK-009**: Crear ejercicios módulos 1-4 (Fundamentos)
- Archivos: `module-1.ts`, `module-2.ts`, `module-3.ts`, `module-4.ts`
- Per módulo: 2 Tier 1 (completion), 1 Tier 2 (fill-in), 1 Tier 3 (debugging)
- Incluir Go 1.22+ features donde corresponda
- Traza: FR-ENH-003, FR-ENH-013

**TASK-010**: Crear ejercicios módulos 5-8 (Intermedio)
- Archivos: `module-5.ts`, `module-6.ts`, `module-7.ts`, `module-8.ts`
- Per módulo: 1 Tier 1, 1 Tier 2, 2 Tier 3, 1 Tier 4 (mini-project para 7-8)
- Traza: FR-ENH-003, FR-ENH-004

**TASK-011**: Crear ejercicios módulos 9-12 (Avanzado)
- Archivos: `module-9.ts`, `module-10.ts`, `module-11.ts`, `module-12.ts`
- Per módulo: 1 Tier 2, 2 Tier 3, 1 Tier 4 (mini-project)
- Módulo 12: Capstone project spec
- Incluir slog, context, generics, iter
- Traza: FR-ENH-004, FR-ENH-005, FR-ENH-014

---

## Wave 3: Contenido de Módulos (depende de Wave 1 + Wave 2)

**TASK-012**: Reescribir Módulo 1 con nueva estructura pedagógica
- Mantener contenido existente, agregar:
  - WorkedExample del "Hola Mundo" paso a paso
  - 4 CodeChallenges (tiers 1-3)
  - Quiz actualizado con preguntas de código
  - Timeline actualizado a Go 1.24
- Template para los demás módulos
- Traza: FR-ENH-001, FR-ENH-002, FR-ENH-011

**TASK-013**: Implementar Módulos 2-4 (Variables, Control, Funciones)
- Seguir template de TASK-012
- Módulo 3: incluir `range over integers` (Go 1.22)
- Módulo 4: incluir `min/max` builtins (Go 1.21)
- ReviewCards al inicio (módulo 2+)

**TASK-014**: Implementar Módulos 5-8 (Colecciones → Errores)
- Módulo 5: `slices` pkg, `maps` pkg, `clear` builtin
- Módulo 6: Structs con embedding
- Módulo 7: Interfaces implícitas + type assertions
- Módulo 8: Error wrapping, errors.Is/As, custom errors
- Mini-projects en módulos 7-8

**TASK-015**: Implementar Módulos 9-12 (Tooling → REST/Testing)
- Módulo 9: `log/slog`, go modules, tooling
- Módulo 10: Goroutines, channels, select
- Módulo 11: Concurrencia avanzada + context
- Módulo 12: REST APIs + Testing + Generics + Capstone
- Mini-projects en cada módulo

---

## Wave 4: Badges y Pulido (depende de Wave 3)

**TASK-016**: Agregar badges nuevos al sistema
- Actualizar `allBadges` en courseStore
- Nuevos: "Debug Master", "Code Challenger", "Streak"
- Lógica de unlock en los módulos correspondientes
- Traza: FR-ENH-017

**TASK-017**: Actualizar página de Resultados
- Agregar métricas de ejercicios completados
- Mostrar progreso de review cards (spaced repetition)
- Actualizar competencies con nuevos módulos

**TASK-018**: Prompts metacognitivos en debugging exercises
- Agregar modal/prompt antes de revelar solución
- "¿Qué tipo de error es? (compilación / lógica / runtime)"
- Traza: FR-ENH-019

---

## Resumen de Waves

| Wave | Tasks | Paralelismo | Estimación |
|------|-------|-------------|------------|
| 0 | TASK-001, 002, 003 | Todas paralelas | 1.5h |
| 1 | TASK-004, 005, 006, 007 | Todas paralelas | 3h |
| 2 | TASK-008, 009, 010, 011 | Todas paralelas con Wave 1 | 6h |
| 3 | TASK-012, 013, 014, 015 | Secuencial (012 primero como template) | 12h |
| 4 | TASK-016, 017, 018 | Todas paralelas | 2h |

**Total estimado**: ~24.5h de desarrollo
