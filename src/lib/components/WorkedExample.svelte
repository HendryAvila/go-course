<script lang="ts">
  import type { WorkedExampleStep } from '$lib/data/exercises/types';
  import GoPlayground from './GoPlayground.svelte';

  interface Props {
    title: string;
    description?: string;
    steps: WorkedExampleStep[];
    playground?: boolean;
    playgroundCode?: string;
  }

  let { title, description = '', steps, playground = false, playgroundCode = '' }: Props = $props();

  let revealedSteps = $state(1);
  let allRevealed = $derived(revealedSteps >= steps.length);

  function revealNext() {
    if (revealedSteps < steps.length) {
      revealedSteps++;
    }
  }

  function revealAll() {
    revealedSteps = steps.length;
  }
</script>

<div class="card fade-in">
  <div class="flex items-center gap-3 mb-4">
    <span class="text-2xl">📝</span>
    <div>
      <h3 class="font-bold text-lg">{title}</h3>
      {#if description}
        <p class="text-sm text-go-muted">{description}</p>
      {/if}
    </div>
  </div>

  <div class="space-y-4">
    {#each steps.slice(0, revealedSteps) as step, idx}
      <div class="fade-in">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-6 h-6 rounded-full bg-go-accent/20 text-go-accent text-xs flex items-center justify-center font-bold">
            {idx + 1}
          </span>
          <span class="text-sm text-go-muted">Paso {idx + 1} de {steps.length}</span>
        </div>

        <div class="bg-go-darker rounded-lg p-4 font-mono text-sm overflow-x-auto mb-2">
          <pre class="whitespace-pre-wrap"><code>{step.code}</code></pre>
        </div>

        <div class="bg-go-accent/5 border-l-4 border-go-accent rounded-r-lg p-3">
          <p class="text-sm text-go-muted leading-relaxed">{step.explanation}</p>
        </div>
      </div>
    {/each}
  </div>

  {#if !allRevealed}
    <div class="mt-4 flex items-center gap-3">
      <button class="btn-primary text-xs" onclick={revealNext}>
        Siguiente paso →
      </button>
      <button class="text-xs text-go-muted hover:text-go-accent cursor-pointer" onclick={revealAll}>
        Ver todos los pasos
      </button>
      <span class="text-xs text-go-muted ml-auto">
        {revealedSteps}/{steps.length} pasos
      </span>
    </div>
  {:else}
    <div class="mt-4 text-center">
      <span class="badge bg-go-success/20 text-go-success">Ejemplo completo</span>
    </div>
  {/if}

  {#if allRevealed && playground && playgroundCode}
    <div class="mt-6 border-t border-go-border pt-4">
      <p class="text-sm text-go-muted mb-3">Experimenta con el código completo:</p>
      <GoPlayground
        code={playgroundCode}
        title="Experimenta"
        description="Modifica el ejemplo y observa qué cambia."
      />
    </div>
  {/if}
</div>
