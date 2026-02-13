<script lang="ts">
  import { base } from '$app/paths';

  interface Props {
    currentModule: number;
    totalModules?: number;
  }

  let { currentModule, totalModules = 12 }: Props = $props();
</script>

<div class="flex items-center justify-between mt-8 pt-6 border-t border-go-border">
  {#if currentModule > 1}
    <a href="{base}/modulo/{currentModule - 1}" class="btn-secondary">
      ← Módulo {currentModule - 1}
    </a>
  {:else}
    <a href="{base}/" class="btn-secondary">
      ← Inicio
    </a>
  {/if}

  <span class="text-go-muted text-sm">{currentModule} / {totalModules}</span>

  {#if currentModule < totalModules}
    <a href="{base}/modulo/{currentModule + 1}" class="btn-primary">
      Módulo {currentModule + 1} →
    </a>
  {:else}
    <a href="{base}/resultados" class="btn-primary">
      Ver Resultados →
    </a>
  {/if}
</div>
