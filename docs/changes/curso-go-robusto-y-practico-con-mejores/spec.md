# Spec — Go Course Enhancement

## Fuentes de Evidencia
- Retrieval Practice: meta-análisis de 250+ estudios (Frontiers 2025)
- Cognitive Load Theory: Sweller — 3-7 elementos en memoria de trabajo
- Worked Examples Effect: ACM Transactions on Computing Education
- Spaced Repetition: FSRS algorithm, Codecademy SRS research
- Go releases: go.dev/blog/go1.21 → go1.24

---

## Requisitos Funcionales

### Contenido y Estructura Modular

**FR-ENH-001**: Cada módulo DEBE seguir la estructura pedagógica: Teoría (30-40%) → Práctica Guiada (30-40%) → Práctica Independiente (20-30%).
- Evidencia: Scaffolding in Programming (PMC 2022), CLT de Sweller

**FR-ENH-002**: Cada módulo DEBE comenzar con Worked Examples (ejemplos resueltos completos) antes de pedir al estudiante que resuelva ejercicios propios.
- Evidencia: Worked Examples Effect — ACM review de 50+ estudios; faded examples (completo → parcial → independiente)

**FR-ENH-003**: Los módulos DEBEN incluir al menos 3 tipos de ejercicios progresivos:
- **Tier 1 — Completion Problems**: código 70% dado, estudiante completa 30%
- **Tier 2 — Fill-in-the-Blank**: blanks estratégicos en tipos, llamadas, condicionales
- **Tier 3 — Debugging Exercises**: código con 2-3 bugs deliberados + prompt metacognitivo ("¿Qué tipo de error es?")
- Evidencia: Error-driven learning (PMC 2025), interleaving research

**FR-ENH-004**: Los módulos 7-12 DEBEN incluir al menos un Mini-Proyecto integrador (Tier 4) que combine conceptos de módulos anteriores.
- Evidencia: PBL retiene 45% más de material (Frontiers 2025); solo efectivo después de fundamentos

**FR-ENH-005**: El módulo 12 DEBE ser un Capstone Project que integre: structs, interfaces, errores, concurrencia, logging y testing.

### Componente CodeChallenge (Nuevo)

**FR-ENH-006**: El sistema DEBE proveer un componente `CodeChallenge.svelte` que presente ejercicios de código con:
- Código base pre-cargado (template)
- Instrucciones claras del objetivo
- Hints progresivos (1er hint gratis, 2do penaliza score)
- Solución revelaable al final
- Indicador de tier (Completion / Fill-in / Debug / Project)

**FR-ENH-007**: El componente CodeChallenge DEBE usar el Go Playground API (go.dev) para ejecutar código y mostrar output.

### Spaced Repetition

**FR-ENH-008**: Al inicio de cada módulo N (donde N > 1), el sistema DEBE presentar 2-3 "Review Cards" con preguntas de conceptos de módulos anteriores.
- Selección basada en algoritmo FSRS simplificado (localStorage)
- Evidencia: Spaced repetition mejora retención 200%+ vs práctica masificada

**FR-ENH-009**: El sistema DEBE trackear por pregunta: última vez respondida, número de intentos, y dificultad percibida, para alimentar el algoritmo de repetición.

### Quiz Enhancement

**FR-ENH-010**: El componente Quiz DEBE soportar modo "Retry" — al terminar, el estudiante puede reintentar SOLO las preguntas que respondió incorrectamente.
- Evidencia: Retrieval practice + immediate feedback (Springer 2025)

**FR-ENH-011**: Los quizzes DEBEN incluir preguntas de CÓDIGO (no solo trivia). Al menos 50% de las preguntas deben evaluar comprensión de código (output prediction, bug detection, code completion).

**FR-ENH-012**: El Quiz DEBE mostrar un "Review Mode" al final con todas las preguntas, respuestas del estudiante, y explicaciones expandidas.

### Contenido Go Actualizado

**FR-ENH-013**: Los módulos DEBEN cubrir Go 1.22+ como versión mínima:
- Módulo 3 (Control de Flujo): `range over integers` (Go 1.22), loop variable semantics fix
- Módulo 5 (Colecciones): `slices` package, `maps` package, `clear` builtin (Go 1.21)
- Módulo 4 (Funciones): `min/max` builtins (Go 1.21)
- Módulo 9 (Paquetes/Tooling): `log/slog` structured logging (Go 1.21)
- Módulo 10-11 (Concurrencia): `context` patterns actualizados
- Nuevo contenido: Generics (1.18+), iter package (1.23), range over funcs

**FR-ENH-014**: Se DEBE agregar un módulo o sección dedicada a Generics que cubra:
- Type parameters, constraints, `cmp.Ordered`
- Patrones: funciones genéricas, structs genéricos, Map/Filter/Reduce
- Cuándo usar vs no usar generics (Rob Pike's guidance)

**FR-ENH-015**: El timeline de hitos de Go en el Módulo 1 DEBE actualizarse hasta Go 1.24 (Feb 2025).

### Progresión y Gamificación

**FR-ENH-016**: El courseStore DEBE trackear ejercicios individuales completados (no solo score de quiz por módulo).
- Nuevo campo: `exercises: Record<string, ExerciseProgress>` con exerciseId, tipo, intentos, hints usados, completado

**FR-ENH-017**: Se DEBEN agregar badges nuevos para ejercicios:
- "Debug Master" — completar 10 debugging exercises
- "Code Challenger" — completar todos los CodeChallenges de un módulo
- "Streak" — completar 3 módulos consecutivos sin errores en quiz

### Feedback Pedagógico

**FR-ENH-018**: Todo ejercicio DEBE proveer feedback inmediato con:
- Indicación correcta/incorrecta
- Explicación del POR QUÉ (no solo "correcto/incorrecto")
- Referencia a la fuente oficial de Go donde aplique

**FR-ENH-019**: Los debugging exercises DEBEN incluir un prompt metacognitivo obligatorio: "¿Qué tipo de error fue? (compilación / lógica / runtime)" antes de revelar la solución.

---

## Requisitos No Funcionales

**NFR-ENH-001**: Los review cards y datos de spaced repetition DEBEN persistir en localStorage junto con el CourseState existente.

**NFR-ENH-002**: El nuevo componente CodeChallenge NO DEBE requerir backend propio — usa Go Playground API o embed de play.golang.org.

**NFR-ENH-003**: La estructura de ejercicios DEBE ser data-driven (archivos de datos por módulo) para facilitar agregar/modificar ejercicios sin tocar componentes.

**NFR-ENH-004**: El curso DEBE seguir siendo una SPA estática desplegable en GitHub Pages.

---

## Priorización por Impacto Pedagógico

| Req | Descripción | Esfuerzo | Impacto | Prioridad |
|-----|-------------|----------|---------|-----------|
| FR-ENH-002 | Worked Examples en cada módulo | Bajo | Alto | P0 |
| FR-ENH-008 | Spaced Repetition review cards | Medio | Alto | P0 |
| FR-ENH-003 | Ejercicios progresivos (3 tiers) | Medio | Alto | P0 |
| FR-ENH-010 | Quiz retry mode | Bajo | Alto | P1 |
| FR-ENH-011 | Preguntas de código en quizzes | Bajo | Alto | P1 |
| FR-ENH-013 | Contenido Go 1.22+ | Medio | Alto | P1 |
| FR-ENH-006 | Componente CodeChallenge | Alto | Alto | P1 |
| FR-ENH-019 | Prompts metacognitivos | Muy Bajo | Medio | P2 |
| FR-ENH-014 | Módulo Generics | Medio | Medio | P2 |
| FR-ENH-016 | Tracking ejercicios individuales | Medio | Medio | P2 |
| FR-ENH-017 | Badges nuevos | Bajo | Bajo | P3 |
