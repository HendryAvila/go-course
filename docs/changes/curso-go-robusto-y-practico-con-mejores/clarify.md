# Clarity Gate — Resolución de Ambigüedades

## AMB-001: ¿Cuántos módulos tendrá el curso final?

**Ambigüedad**: FR-ENH-014 pide un módulo de Generics, pero actualmente hay 12 módulos. ¿Se agrega módulo 13 o se reorganizan los existentes?

**Resolución (EARS Pattern: WHEN)**: CUANDO el curso se reestructure, los 12 módulos existentes se MANTIENEN y se REORGANIZAN para incluir Generics dentro del módulo 11 (antes "Concurrencia Avanzada") que se divide en:
- Módulo 11: Concurrencia Avanzada (patterns, sync, context) — comprimido
- Sección de Generics integrada en Módulo 12 como "APIs REST, Testing y Go Moderno"

**Razón**: Agregar un módulo 13 rompe la UI grid (3x4) y el badge system. Es más limpio integrar Generics en módulos existentes. Go 1.22+ features se distribuyen orgánicamente en los módulos relevantes (range over int en módulo 3, slices pkg en módulo 5, etc.).

---

## AMB-002: ¿Qué tan complejo es el algoritmo de Spaced Repetition?

**Ambigüedad**: FR-ENH-008 pide FSRS "simplificado" pero no define qué tan simple.

**Resolución (EARS Pattern: SHALL)**: El sistema USARÁ un algoritmo Leitner de 3 cajas (no FSRS completo):
- **Caja 1** (nueva/incorrecta): se revisa cada módulo
- **Caja 2** (1 acierto): se revisa cada 3 módulos
- **Caja 3** (2 aciertos): se revisa cada 6 módulos
- Respuesta incorrecta → vuelve a Caja 1

**Razón**: FSRS completo requiere cálculos de intervalos complejos y es overkill para 12 módulos con ~5 preguntas de review cada uno. Leitner es simple, probado, y funciona en localStorage sin complejidad adicional.

---

## AMB-003: ¿Cómo funciona el CodeChallenge sin backend?

**Ambigüedad**: FR-ENH-006/007 dicen "usar Go Playground API" pero no especifican la UX ni el mecanismo de validación.

**Resolución (EARS Pattern: WHEN/SHALL)**:
- CUANDO el estudiante presione "Ejecutar", el sistema ENVIARÁ el código al endpoint `https://go.dev/_/compile` (mismo que usa play.golang.org)
- El sistema MOSTRARÁ el output del programa en un panel de resultados
- La validación es VISUAL — el estudiante compara su output con el output esperado mostrado en las instrucciones
- NO hay auto-grading de output (requeriría backend). El estudiante se auto-evalúa y marca "Completado"

**Razón**: El Go Playground API es público y gratuito. Auto-grading de output sería ideal pero requiere un backend para comparar strings de forma segura. La auto-evaluación es pedagógicamente válida (metacognición).

---

## AMB-004: ¿Los módulos 2-12 se implementan desde cero o se reestructuran?

**Ambigüedad**: El context-check dice "solo existe /modulo/1/+page.svelte" pero no está claro si los módulos 2-12 tienen contenido.

**Resolución**: Verificar en el filesystem. Si no existen, se crean desde cero siguiendo la nueva estructura pedagógica. Si existen con contenido, se reestructuran para incorporar la nueva metodología.

**Decisión**: Todos los módulos (incluido el 1) se implementarán siguiendo la nueva estructura:
1. Intro + Objetivos
2. Worked Examples (2-3 por módulo)
3. Práctica Guiada (exercises tier 1-2)
4. Práctica Avanzada (exercises tier 3-4 según módulo)
5. Quiz (con preguntas de código)
6. Review Cards (para módulos N > 1)
7. Sources + ModuleNav

---

## AMB-005: ¿Qué pasa con el campo `type` de ModuleInfo?

**Ambigüedad**: Actualmente `type: "Teoría + Quiz + Playground"` es un string libre. Con los nuevos tipos de ejercicios, ¿cómo se refleja?

**Resolución**: El campo `type` se reemplaza por un array `activities: string[]` que lista los tipos de actividades del módulo:
```typescript
activities: ['theory', 'worked-example', 'completion', 'debugging', 'quiz', 'playground', 'mini-project']
```
La UI renderiza badges por cada actividad. Esto es más preciso y extensible.

---

## AMB-006: ¿La data de ejercicios va en modules.ts o en archivos separados?

**Ambigüedad**: NFR-ENH-003 dice "data-driven" pero no define la estructura de archivos.

**Resolución**: Archivos separados por módulo en `src/lib/data/exercises/`:
```
src/lib/data/exercises/
  module-1.ts   // Ejercicios del módulo 1
  module-2.ts   // Ejercicios del módulo 2
  ...
  module-12.ts
  review-cards.ts  // Pool de review cards para spaced repetition
```

**Razón**: Separar ejercicios de metadata de módulos mantiene `modules.ts` limpio y permite que los ejercicios sean editados independientemente. Cada archivo exporta un array tipado de ejercicios.

---

## Clarity Score: 85/100

Todas las ambigüedades técnicas y de alcance están resueltas. Las únicas incertidumbres menores son:
- El contenido específico de cada módulo (se define en la fase de implementación)
- Rate limiting del Go Playground API (monitorear en producción)
