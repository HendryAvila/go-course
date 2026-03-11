# Design — Arquitectura Técnica del Enhancement

## 1. Nuevos Componentes

### CodeChallenge.svelte
```
Props:
  - exercise: Exercise (typed object)
  - onComplete: (exerciseId: string, score: number) => void

State:
  - userCode: string (editable)
  - output: string | null
  - showHint: number (0, 1, 2)
  - showSolution: boolean
  - completed: boolean

Behavior:
  - Renderiza código base en textarea/editor con syntax highlighting
  - Botón "Ejecutar" → POST a https://go.dev/_/compile
  - Panel de output con expected vs actual
  - Hints progresivos (hint 1 gratis, hint 2 penaliza -1 punto)
  - Botón "Ver Solución" (penaliza a 0 puntos)
  - Botón "Completado" → emite onComplete
```

### ReviewCards.svelte
```
Props:
  - moduleId: number (módulo actual)

State:
  - cards: ReviewCard[] (filtradas por algoritmo Leitner)
  - currentCard: number
  - answered: boolean

Behavior:
  - Al montar, consulta reviewStore para obtener cards pendientes
  - Muestra 2-3 cards de módulos anteriores
  - Cada card es una pregunta con opciones
  - Respuesta correcta → sube de caja Leitner
  - Respuesta incorrecta → baja a caja 1
  - Se puede skipear ("Revisar después")
```

### WorkedExample.svelte
```
Props:
  - title: string
  - steps: { code: string, explanation: string }[]
  - playground?: boolean (si incluye playground al final)

Behavior:
  - Renderiza paso a paso: código + explicación
  - Botón "Siguiente paso" para avanzar (faded reveal)
  - Opcional: playground al final para experimentar
  - Sin score — es puramente didáctico
```

## 2. Data Model Extensions

### Exercise Type System
```typescript
// src/lib/data/exercises/types.ts

type ExerciseTier = 'completion' | 'fill-in-blank' | 'debugging' | 'mini-project' | 'open-challenge';

interface Exercise {
  id: string;              // e.g., "m1-ex-001"
  moduleId: number;
  tier: ExerciseTier;
  title: string;
  description: string;
  baseCode: string;        // Código template
  solution: string;        // Código solución
  expectedOutput?: string; // Output esperado (para auto-check visual)
  hints: string[];         // Max 2 hints
  metacognitivePrompt?: string; // Para debugging exercises
  points: number;          // Max score sin penalización
}

interface ReviewCard {
  id: string;              // e.g., "rc-001"
  sourceModuleId: number;  // De qué módulo viene el concepto
  question: string;
  options: { text: string; correct: boolean; explanation: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### CourseState Extension
```typescript
// Extensión de CourseState en courseStore

interface ExerciseProgress {
  completed: boolean;
  attempts: number;
  hintsUsed: number;
  score: number;
  completedAt?: string;
}

interface LeitnerCard {
  cardId: string;
  box: 1 | 2 | 3;          // Caja Leitner
  lastReviewed?: string;     // ISO timestamp
  correctStreak: number;
}

// Nuevos campos en CourseState:
interface CourseState {
  // ... campos existentes ...
  exercises: Record<string, ExerciseProgress>;
  reviewCards: Record<string, LeitnerCard>;
}
```

## 3. Store Changes

### courseStore — Nuevos métodos
```
completeExercise(exerciseId: string, score: number, hintsUsed: number)
  → Persiste ExerciseProgress en exercises[exerciseId]
  → Actualiza totalScore

reviewCard(cardId: string, correct: boolean)
  → Si correct: box = min(box + 1, 3), correctStreak++
  → Si incorrect: box = 1, correctStreak = 0
  → Actualiza lastReviewed

getReviewCardsForModule(moduleId: number): ReviewCard[]
  → Filtra cards donde:
    - sourceModuleId < moduleId
    - box === 1 (siempre)
    - box === 2 && (moduleId - lastReviewedModule) >= 3
    - box === 3 && (moduleId - lastReviewedModule) >= 6
  → Retorna max 3 cards, priorizando box 1
```

## 4. File Structure (New)
```
src/lib/
  data/
    exercises/
      types.ts           // Exercise, ReviewCard interfaces
      module-1.ts        // Ejercicios módulo 1
      module-2.ts        // Ejercicios módulo 2
      ...
      module-12.ts
      review-cards.ts    // Pool completo de review cards
    modules.ts           // Existente (actualizar activities field)
    vocabulary.ts        // Existente (ampliar)
  components/
    CodeChallenge.svelte  // NUEVO
    ReviewCards.svelte    // NUEVO
    WorkedExample.svelte  // NUEVO
    Quiz.svelte          // MODIFICAR (retry mode, review mode)
    // ... existentes
  stores/
    course.ts            // MODIFICAR (exercises, reviewCards)
```

## 5. Quiz Enhancement Design

### Retry Mode
```
Después del score final:
  - Si score < 100%: mostrar botón "Reintentar preguntas incorrectas"
  - Al reintentar: solo preguntas donde answers[i] === false
  - Score final = max(original, retry) — no penaliza por reintentar
```

### Review Mode
```
Después de completar (o retry):
  - Botón "Revisar todas las respuestas"
  - Muestra TODAS las preguntas con:
    - Respuesta del estudiante (highlight verde/rojo)
    - Respuesta correcta
    - Explicación expandida
    - Link a fuente
```

## 6. Contenido Go Actualizado — Distribución por Módulo

| Módulo | Go 1.21+ Feature | Cómo se integra |
|--------|-------------------|-----------------|
| 1 | Timeline actualizado a Go 1.24 | Hitos: 2023 slog, 2024 range-int, 2025 generic aliases |
| 3 | `range over integers` (1.22) | Sección de for loops — nueva forma idiomática |
| 3 | Loop variable fix (1.22) | Sección de closures en loops — "antes vs ahora" |
| 4 | `min/max` builtins (1.21) | Ejemplo en funciones — "Go ya incluye min/max" |
| 5 | `slices` package (1.21) | Reemplazar ejemplos manuales con slices.Sort, slices.Contains |
| 5 | `maps` package (1.21) | maps.Keys, maps.Values, maps.Copy |
| 5 | `clear` builtin (1.21) | Limpiar slices y maps |
| 9 | `log/slog` (1.21) | Sección nueva: structured logging |
| 11 | Context patterns | WithTimeout, WithDeadline, cascading |
| 12 | Generics basics | Type parameters, constraints, patrones comunes |
| 12 | `iter` package (1.23) | Range over funcs, Seq/Seq2 |

## 7. Estructura Tipo de un Módulo (Template)

```svelte
<!-- /modulo/N/+page.svelte -->

1. Header (icon, title, subtitle, objectives)
2. ReviewCards (si N > 1) — spaced repetition
3. Secciones teóricas con WorkedExample intercalados
4. CodeChallenge(s) — exercises tier 1-3
5. Quiz — con preguntas de código
6. Mini-Project (módulos 7+) — tier 4
7. SourcesSection
8. ModuleNav
9. VocabularyFloat
10. BadgeNotification
```

## 8. ADR: No Auto-Grading

**Decisión**: El sistema NO auto-evalúa output de código.
**Contexto**: Sin backend, no hay forma segura de comparar output del playground con expected output.
**Consecuencia**: El estudiante se auto-evalúa visualmente (output esperado vs output real) y marca "Completado". Esto es pedagógicamente válido — la metacognición de evaluar tu propio trabajo es un skill valioso.
**Alternativa descartada**: Comparar strings en el frontend — frágil (whitespace, line endings, Go Playground API format changes).
