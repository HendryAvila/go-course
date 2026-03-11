<script lang="ts">
  import type { ReviewCard } from '$lib/data/exercises/types';
  import { courseStore } from '$lib/stores/course';

  interface Props {
    moduleId: number;
    cards: ReviewCard[];
  }

  let { moduleId, cards }: Props = $props();

  let currentIndex = $state(0);
  let selectedOption = $state<number | null>(null);
  let answered = $state(false);
  let dismissed = $state(false);
  let correctCount = $state(0);

  // Filter cards using Leitner algorithm
  let pendingCards = $derived.by(() => {
    let state: Record<string, { box: number; lastReviewedAtModule?: number }> = {};
    courseStore.subscribe(s => state = s.reviewCards)();

    return cards.filter(card => {
      if (card.sourceModuleId >= moduleId) return false;

      const cardState = state[card.id];
      if (!cardState) return true; // Never reviewed — always show

      const modulesSinceReview = moduleId - (cardState.lastReviewedAtModule ?? 0);

      switch (cardState.box) {
        case 1: return true; // Review every module
        case 2: return modulesSinceReview >= 3;
        case 3: return modulesSinceReview >= 6;
        default: return true;
      }
    }).slice(0, 3); // Max 3 review cards per module
  });

  let currentCard = $derived(pendingCards[currentIndex] ?? null);
  let finished = $derived(currentIndex >= pendingCards.length);

  function selectOption(idx: number) {
    if (answered) return;
    selectedOption = idx;
    answered = true;

    const isCorrect = currentCard!.options[idx].correct;
    if (isCorrect) correctCount++;

    courseStore.reviewCard(currentCard!.id, isCorrect, moduleId);
  }

  function nextCard() {
    currentIndex++;
    selectedOption = null;
    answered = false;
  }

  function dismiss() {
    dismissed = true;
  }

  function getOptionClass(idx: number): string {
    if (!answered) return 'border-go-border hover:border-go-accent/50';
    const opt = currentCard!.options[idx];
    if (opt.correct) return 'border-go-success bg-go-success/10';
    if (idx === selectedOption && !opt.correct) return 'border-go-danger bg-go-danger/10';
    return 'border-go-border opacity-50';
  }
</script>

{#if pendingCards.length > 0 && !dismissed}
  <div class="card fade-in mb-6 border-l-4 border-purple-500">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">🔄</span>
        <div>
          <h3 class="font-bold text-sm">Repaso Espaciado</h3>
          <p class="text-xs text-go-muted">Refuerza conceptos de módulos anteriores</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-go-muted">
          {#if !finished}
            {currentIndex + 1}/{pendingCards.length}
          {:else}
            {correctCount}/{pendingCards.length}
          {/if}
        </span>
        {#if !finished}
          <button class="text-xs text-go-muted hover:text-go-text cursor-pointer" onclick={dismiss}>
            Saltar
          </button>
        {/if}
      </div>
    </div>

    {#if !finished && currentCard}
      <!-- Progress bar -->
      <div class="w-full bg-go-darker rounded-full h-1 mb-4">
        <div
          class="bg-purple-500 h-1 rounded-full transition-all duration-500"
          style="width: {(currentIndex / pendingCards.length) * 100}%"
        ></div>
      </div>

      <p class="text-sm text-go-muted mb-1">
        Módulo {currentCard.sourceModuleId} — <span class="text-go-accent">{currentCard.concept}</span>
      </p>
      <h4 class="font-bold mb-3">{currentCard.question}</h4>

      <div class="space-y-2">
        {#each currentCard.options as opt, idx}
          <button
            class="w-full text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer text-sm {getOptionClass(idx)}"
            onclick={() => selectOption(idx)}
            disabled={answered}
          >
            <div class="flex items-start gap-2">
              <span class="font-mono text-go-muted text-xs mt-0.5">{String.fromCharCode(65 + idx)}.</span>
              <span>{opt.text}</span>
            </div>
            {#if answered && (idx === selectedOption || opt.correct)}
              <p class="mt-1 text-xs text-go-muted pl-5">{opt.explanation}</p>
            {/if}
          </button>
        {/each}
      </div>

      {#if answered}
        <div class="mt-3 text-right">
          <button class="btn-primary text-xs" onclick={nextCard}>
            {currentIndex < pendingCards.length - 1 ? 'Siguiente →' : 'Continuar al módulo'}
          </button>
        </div>
      {/if}
    {:else}
      <!-- Summary -->
      <div class="text-center py-4 fade-in">
        <div class="text-3xl mb-2">
          {correctCount === pendingCards.length ? '🎯' : correctCount > 0 ? '👍' : '💪'}
        </div>
        <p class="font-bold">
          {correctCount}/{pendingCards.length} correctas en el repaso
        </p>
        <p class="text-sm text-go-muted mt-1">
          {correctCount === pendingCards.length
            ? 'Excelente memoria. Los conceptos anteriores están firmes.'
            : 'Los conceptos incorrectos aparecerán con más frecuencia para reforzarlos.'}
        </p>
      </div>
    {/if}
  </div>
{/if}
