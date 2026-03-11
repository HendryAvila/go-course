<script lang="ts">
  import type { Exercise } from '$lib/data/exercises/types';
  import { compileGo } from '$lib/go-compile';

  interface Props {
    exercise: Exercise;
    onComplete?: (exerciseId: string, score: number, hintsUsed: number) => void;
  }

  let { exercise, onComplete }: Props = $props();

  let editorCode = $state(exercise.baseCode);
  let output = $state('');
  let running = $state(false);
  let error = $state(false);
  let useIframe = $state(false);
  let copied = $state(false);
  let hintsRevealed = $state(0);
  let showSolution = $state(false);
  let completed = $state(false);
  let metacognitiveAnswer = $state('');
  let showMetacognitivePrompt = $state(false);

  const tierLabels: Record<string, string> = {
    completion: 'Completar Código',
    'fill-in-blank': 'Completar Blanks',
    debugging: 'Encontrar Bugs',
    'mini-project': 'Mini Proyecto',
    'open-challenge': 'Desafío Abierto',
  };

  const tierColors: Record<string, string> = {
    completion: 'bg-go-accent/20 text-go-accent',
    'fill-in-blank': 'bg-blue-500/20 text-blue-400',
    debugging: 'bg-go-danger/20 text-go-danger',
    'mini-project': 'bg-purple-500/20 text-purple-400',
    'open-challenge': 'bg-go-warning/20 text-go-warning',
  };

  const difficultyLabels: Record<string, string> = {
    beginner: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  function computeScore(): number {
    if (showSolution) return 0;
    return Math.max(0, exercise.points - hintsRevealed);
  }

  function revealHint() {
    if (hintsRevealed < exercise.hints.length) {
      hintsRevealed++;
    }
  }

  function revealSolution() {
    if (exercise.tier === 'debugging' && exercise.metacognitivePrompt && !showMetacognitivePrompt) {
      showMetacognitivePrompt = true;
      return;
    }
    showSolution = true;
    editorCode = exercise.solution;
  }

  function submitMetacognitive() {
    showMetacognitivePrompt = false;
    showSolution = true;
    editorCode = exercise.solution;
  }

  function markComplete() {
    completed = true;
    const score = computeScore();
    onComplete?.(exercise.id, score, hintsRevealed);
  }

  function resetChallenge() {
    editorCode = exercise.baseCode;
    output = '';
    error = false;
    useIframe = false;
    hintsRevealed = 0;
    showSolution = false;
    completed = false;
    showMetacognitivePrompt = false;
    metacognitiveAnswer = '';
  }

  async function runCode() {
    running = true;
    output = '';
    error = false;

    const result = await compileGo(editorCode);

    if (result.corsBlocked) {
      useIframe = true;
      await copyCode();
    } else {
      output = result.output;
      error = result.error;
    }

    running = false;
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(editorCode);
      copied = true;
      setTimeout(() => copied = false, 3000);
    } catch {
      // clipboard API not available
    }
  }
</script>

<div class="card fade-in border-l-4 {exercise.tier === 'debugging' ? 'border-go-danger' : 'border-go-accent'}">
  <!-- Header -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="badge {tierColors[exercise.tier] ?? 'bg-go-accent/20 text-go-accent'} text-xs">
        {tierLabels[exercise.tier] ?? exercise.tier}
      </span>
      <span class="badge bg-go-darker text-go-muted text-xs">
        {difficultyLabels[exercise.difficulty]}
      </span>
      {#if !showSolution}
        <span class="text-xs text-go-muted">
          {computeScore()}/{exercise.points} pts
        </span>
      {/if}
    </div>
    {#if completed}
      <span class="badge bg-go-success/20 text-go-success text-xs">Completado</span>
    {/if}
  </div>

  <h4 class="font-bold mb-2">{exercise.title}</h4>
  <p class="text-sm text-go-muted mb-4 leading-relaxed">{exercise.description}</p>

  <!-- Expected output -->
  {#if exercise.expectedOutput && !completed}
    <div class="bg-go-darker rounded-lg p-3 mb-4 border border-go-border">
      <p class="text-xs text-go-muted mb-1">Output esperado:</p>
      <pre class="font-mono text-sm text-go-success whitespace-pre-wrap">{exercise.expectedOutput}</pre>
    </div>
  {/if}

  <!-- Code editor -->
  <textarea
    bind:value={editorCode}
    class="w-full bg-go-darker border border-go-border rounded-lg p-3 font-mono text-sm text-go-text resize-y min-h-[180px] focus:outline-none focus:border-go-accent transition-colors"
    spellcheck="false"
    disabled={completed}
  ></textarea>

  <!-- Action buttons -->
  <div class="flex items-center gap-3 mt-3 flex-wrap">
    <button
      class="btn-primary text-xs"
      onclick={useIframe ? copyCode : runCode}
      disabled={running || completed}
    >
      {#if running}
        ⏳ Ejecutando...
      {:else if useIframe}
        {copied ? '✓ Copiado!' : '📋 Copiar código'}
      {:else}
        ▶ Ejecutar
      {/if}
    </button>

    {#if !completed}
      {#if hintsRevealed < exercise.hints.length}
        <button
          class="text-xs text-go-muted hover:text-go-accent cursor-pointer"
          onclick={revealHint}
        >
          💡 Hint {hintsRevealed + 1}/{exercise.hints.length}
          {hintsRevealed >= 1 ? '(-1 pt)' : '(gratis)'}
        </button>
      {/if}

      {#if !showSolution}
        <button
          class="text-xs text-go-muted hover:text-go-warning cursor-pointer"
          onclick={revealSolution}
        >
          👁 Ver solución (0 pts)
        </button>
      {/if}

      <button
        class="btn-secondary text-xs ml-auto"
        onclick={markComplete}
      >
        ✓ Marcar completado
      </button>
    {:else}
      <button class="text-xs text-go-muted hover:text-go-text cursor-pointer ml-auto" onclick={resetChallenge}>
        🔄 Reintentar
      </button>
    {/if}
  </div>

  <!-- Hints -->
  {#if hintsRevealed > 0}
    <div class="mt-3 space-y-2">
      {#each exercise.hints.slice(0, hintsRevealed) as hint, idx}
        <div class="bg-go-accent/5 border border-go-accent/20 rounded-lg p-3 fade-in">
          <p class="text-xs text-go-accent font-semibold mb-1">Hint {idx + 1}</p>
          <p class="text-sm text-go-muted">{hint}</p>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Metacognitive prompt (debugging exercises) -->
  {#if showMetacognitivePrompt && exercise.metacognitivePrompt}
    <div class="mt-3 bg-go-warning/10 border border-go-warning/30 rounded-lg p-4 fade-in">
      <p class="text-sm font-semibold text-go-warning mb-2">{exercise.metacognitivePrompt}</p>
      <div class="flex gap-2">
        <select
          bind:value={metacognitiveAnswer}
          class="flex-1 bg-go-darker border border-go-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-go-accent"
        >
          <option value="">Selecciona el tipo de error...</option>
          <option value="compilation">Error de compilación (syntax)</option>
          <option value="logic">Error de lógica (resultado incorrecto)</option>
          <option value="runtime">Error de runtime (panic, deadlock)</option>
        </select>
        <button
          class="btn-primary text-xs"
          onclick={submitMetacognitive}
          disabled={!metacognitiveAnswer}
        >
          Continuar
        </button>
      </div>
    </div>
  {/if}

  <!-- Solution -->
  {#if showSolution}
    <div class="mt-3 bg-go-success/5 border border-go-success/30 rounded-lg p-4 fade-in">
      <p class="text-xs text-go-success font-semibold mb-2">Solución:</p>
      <pre class="font-mono text-sm whitespace-pre-wrap overflow-x-auto">{exercise.solution}</pre>
    </div>
  {/if}

  <!-- Output -->
  {#if output}
    <div class="mt-3 rounded-lg p-3 font-mono text-sm {error ? 'bg-go-danger/10 border border-go-danger/30 text-go-danger' : 'bg-go-darker border border-go-border text-go-success'}">
      <p class="text-xs text-go-muted mb-1">{error ? 'Error:' : 'Output:'}</p>
      <pre class="whitespace-pre-wrap">{output}</pre>
    </div>
  {/if}

  <!-- Embedded Go Playground (CORS fallback) -->
  {#if useIframe}
    <div class="mt-3 bg-go-accent/10 border border-go-accent/30 rounded-lg p-3 text-sm fade-in">
      <p class="text-go-accent font-semibold text-xs mb-1">Pega tu código en el playground y dale Run</p>
      <p class="text-go-muted text-xs">El código se copió al clipboard. Si lo modificaste, usa "Copiar código" antes de pegar.</p>
    </div>
    <div class="mt-3 rounded-lg overflow-hidden border border-go-border">
      <iframe
        src="https://go.dev/play/"
        title="Go Playground"
        class="w-full border-0"
        style="height: 350px;"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        loading="lazy"
      ></iframe>
    </div>
  {/if}
</div>
