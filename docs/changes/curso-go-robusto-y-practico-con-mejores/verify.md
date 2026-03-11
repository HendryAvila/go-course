# Verify — Validación de Consistencia

## 1. Trazabilidad Requisitos → Tasks

| Requisito | Task(s) | Cubierto |
|-----------|---------|----------|
| FR-ENH-001 (estructura pedagógica) | TASK-012→015 | ✅ |
| FR-ENH-002 (worked examples) | TASK-004, TASK-012→015 | ✅ |
| FR-ENH-003 (ejercicios progresivos) | TASK-005, TASK-009→011 | ✅ |
| FR-ENH-004 (mini-proyectos) | TASK-010, TASK-011, TASK-014→015 | ✅ |
| FR-ENH-005 (capstone) | TASK-011, TASK-015 | ✅ |
| FR-ENH-006 (CodeChallenge) | TASK-005 | ✅ |
| FR-ENH-007 (Go Playground API) | TASK-005 | ✅ |
| FR-ENH-008 (spaced repetition) | TASK-006, TASK-008 | ✅ |
| FR-ENH-009 (tracking review) | TASK-002, TASK-006 | ✅ |
| FR-ENH-010 (quiz retry) | TASK-007 | ✅ |
| FR-ENH-011 (preguntas código) | TASK-012→015 | ✅ |
| FR-ENH-012 (quiz review mode) | TASK-007 | ✅ |
| FR-ENH-013 (Go 1.22+) | TASK-003, TASK-009→011, TASK-013→015 | ✅ |
| FR-ENH-014 (generics) | TASK-011, TASK-015 | ✅ |
| FR-ENH-015 (timeline Go 1.24) | TASK-003, TASK-012 | ✅ |
| FR-ENH-016 (tracking ejercicios) | TASK-001, TASK-002 | ✅ |
| FR-ENH-017 (badges nuevos) | TASK-016 | ✅ |
| FR-ENH-018 (feedback inmediato) | TASK-005, TASK-007 | ✅ |
| FR-ENH-019 (prompts metacog) | TASK-018 | ✅ |

**Cobertura: 19/19 = 100%**

## 2. Ambigüedades Resueltas → Design

| Ambigüedad | Resolución | Reflejada en Design |
|------------|-----------|---------------------|
| AMB-001 (12 o 13 módulos) | Mantener 12, integrar Generics en módulo 12 | ✅ Tabla de distribución Go features |
| AMB-002 (FSRS vs Leitner) | Leitner 3 cajas | ✅ ReviewCards.svelte spec |
| AMB-003 (CodeChallenge sin backend) | Go Playground API + auto-eval visual | ✅ CodeChallenge.svelte + ADR |
| AMB-004 (módulos desde cero) | Todos siguen nueva estructura | ✅ Template en sección 7 |
| AMB-005 (field activities) | Array de activities reemplaza type string | ✅ TASK-003 |
| AMB-006 (estructura archivos) | Carpeta exercises/ con archivo por módulo | ✅ File Structure sección 4 |

**Cobertura: 6/6 = 100%**

## 3. Business Rules Compliance

| Regla existente | Impacto del change | Status |
|-----------------|-------------------|--------|
| BRC-001 (acceso secuencial) | Sin cambio — los módulos siguen desbloqueándose en orden | ✅ Compatible |
| BRC-002 (badge idempotente) | Badges nuevos usan mismo mecanismo | ✅ Compatible |
| BRC-003 (currentModule avanza) | Sin cambio — mismo comportamiento | ✅ Compatible |
| BRC-004 (localStorage corrupto) | Extension de CourseState necesita defaults para nuevos campos | ⚠️ Atención en TASK-002 |
| BRC-005 (reset) | Reset debe limpiar exercises y reviewCards también | ⚠️ Atención en TASK-002 |

**Acciones requeridas en TASK-002**:
- `getInitialState()` debe incluir `exercises: {}` y `reviewCards: {}` como defaults
- `reset()` debe limpiar ambos campos nuevos
- Si un usuario existente carga un CourseState sin estos campos, deben autocompletarse con defaults vacíos (backward compatibility)

## 4. NFR Compliance

| NFR | Verificación |
|-----|-------------|
| NFR-ENH-001 (localStorage) | ✅ Extensión del mismo STORAGE_KEY existente |
| NFR-ENH-002 (sin backend propio) | ✅ Solo usa Go Playground API público |
| NFR-ENH-003 (data-driven) | ✅ Archivos separados por módulo en exercises/ |
| NFR-ENH-004 (SPA estática GitHub Pages) | ✅ Sin cambios en adapter-static ni deploy |

## 5. Riesgos Identificados

| Riesgo | Mitigación | Probabilidad |
|--------|-----------|--------------|
| Go Playground API rate limiting | Cache responses en sessionStorage por código hash | Media |
| localStorage size limit (~5MB) | ReviewCards + Exercises son ~50KB total — OK | Baja |
| Módulos 2-12 toman más de estimado | Wave 3 prioriza módulos 1-5 primero como MVP | Alta |
| Backward compat de CourseState | Auto-defaults en getInitialState + try/catch | Baja |

## 6. Veredicto

**APROBADO** — El pipeline es consistente. Todos los requisitos tienen tasks, todas las ambigüedades están resueltas, y el design es compatible con la arquitectura existente. 

**Recomendación de ejecución**: Empezar por Wave 0 + Wave 1 en paralelo, luego Wave 2 (ejercicios data) mientras se testea Wave 1. Wave 3 es el bulk del trabajo — priorizar módulos 1-5 como MVP entregable.
