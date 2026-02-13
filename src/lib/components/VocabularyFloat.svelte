<script lang="ts">
  import { courseStore } from '$lib/stores/course';
  import { vocabulary } from '$lib/data/vocabulary';

  interface Props {
    moduleId: number;
  }

  let { moduleId }: Props = $props();

  let visible = $state(true);
  let minimized = $state(false);
  let currentIndex = $state(0);

  let moduleTerms = $derived(
    vocabulary.filter(v => v.module === moduleId)
      .filter(v => {
        let dismissed: string[] = [];
        courseStore.subscribe(s => dismissed = s.vocabularyDismissed)();
        return !dismissed.includes(`${v.module}-${v.term}`);
      })
  );

  let currentTerm = $derived(moduleTerms[currentIndex] ?? null);

  function nextTerm() {
    if (currentIndex < moduleTerms.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
  }

  function dismiss() {
    if (currentTerm) {
      courseStore.dismissVocabulary(`${currentTerm.module}-${currentTerm.term}`);
      if (currentIndex >= moduleTerms.length) {
        currentIndex = Math.max(0, moduleTerms.length - 1);
      }
    }
  }
</script>

{#if visible && currentTerm && moduleTerms.length > 0}
  <div class="fixed bottom-4 right-4 z-40 max-w-xs slide-in">
    {#if minimized}
      <button
        class="bg-go-card border border-go-border rounded-full px-4 py-2 text-sm flex items-center gap-2 hover:border-go-accent transition-colors cursor-pointer shadow-lg"
        onclick={() => minimized = false}
      >
        <span>📖</span>
        <span class="text-go-muted">Vocabulario ({moduleTerms.length})</span>
      </button>
    {:else}
      <div class="bg-go-card border border-go-border rounded-xl p-4 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <span class="badge bg-go-accent/20 text-go-accent">{currentTerm.category}</span>
          <div class="flex gap-1">
            <button class="text-go-muted hover:text-go-text text-xs cursor-pointer" onclick={() => minimized = true} title="Minimizar">─</button>
            <button class="text-go-muted hover:text-go-text text-xs cursor-pointer" onclick={() => visible = false} title="Cerrar">✕</button>
          </div>
        </div>
        <h4 class="font-bold text-go-accent mb-1">{currentTerm.term}</h4>
        <p class="text-sm text-go-muted leading-relaxed mb-3">{currentTerm.definition}</p>
        <div class="flex items-center justify-between">
          <button class="text-xs text-go-muted hover:text-go-danger cursor-pointer transition-colors" onclick={dismiss}>
            Ya lo sé
          </button>
          <div class="flex items-center gap-2">
            <span class="text-xs text-go-muted">{currentIndex + 1}/{moduleTerms.length}</span>
            <button class="text-xs text-go-accent hover:text-go-accent-hover cursor-pointer" onclick={nextTerm}>
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
