<script lang="ts">
  interface QuizOption {
    text: string;
    correct: boolean;
    explanation: string;
  }

  interface QuizQuestion {
    question: string;
    options: QuizOption[];
    source?: string;
    sourceUrl?: string;
  }

  interface Props {
    questions: QuizQuestion[];
    onComplete?: (score: number, total: number) => void;
  }

  let { questions, onComplete }: Props = $props();

  let currentIndex = $state(0);
  let selectedOption = $state<number | null>(null);
  let answered = $state(false);
  let score = $state(0);
  let finished = $state(false);
  let answers = $state<boolean[]>([]);

  function selectOption(idx: number) {
    if (answered) return;
    selectedOption = idx;
    answered = true;
    const isCorrect = questions[currentIndex].options[idx].correct;
    if (isCorrect) score++;
    answers = [...answers, isCorrect];
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      answered = false;
    } else {
      finished = true;
      onComplete?.(score, questions.length);
    }
  }

  function getOptionClass(idx: number): string {
    if (!answered) return 'border-go-border hover:border-go-accent/50';
    const opt = questions[currentIndex].options[idx];
    if (opt.correct) return 'border-go-success bg-go-success/10';
    if (idx === selectedOption && !opt.correct) return 'border-go-danger bg-go-danger/10';
    return 'border-go-border opacity-50';
  }
</script>

{#if !finished}
  <div class="card fade-in">
    <div class="flex items-center justify-between mb-4">
      <span class="text-go-muted text-sm">Pregunta {currentIndex + 1} de {questions.length}</span>
      <span class="badge bg-go-accent/20 text-go-accent">{score} correctas</span>
    </div>

    <div class="w-full bg-go-darker rounded-full h-1.5 mb-6">
      <div
        class="bg-go-accent h-1.5 rounded-full transition-all duration-500"
        style="width: {((currentIndex) / questions.length) * 100}%"
      ></div>
    </div>

    <h3 class="text-lg font-bold mb-4">{questions[currentIndex].question}</h3>

    <div class="space-y-3">
      {#each questions[currentIndex].options as opt, idx}
        <button
          class="w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer {getOptionClass(idx)}"
          onclick={() => selectOption(idx)}
          disabled={answered}
        >
          <div class="flex items-start gap-3">
            <span class="font-mono text-go-muted text-sm mt-0.5">{String.fromCharCode(65 + idx)}.</span>
            <span>{opt.text}</span>
          </div>
          {#if answered && (idx === selectedOption || opt.correct)}
            <p class="mt-2 text-sm text-go-muted pl-6">{opt.explanation}</p>
          {/if}
        </button>
      {/each}
    </div>

    {#if answered}
      <div class="mt-4 flex items-center justify-between">
        {#if questions[currentIndex].source}
          <a
            href={questions[currentIndex].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-go-muted hover:text-go-accent transition-colors"
          >
            Fuente: {questions[currentIndex].source}
          </a>
        {:else}
          <span></span>
        {/if}
        <button class="btn-primary" onclick={nextQuestion}>
          {currentIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultado'}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="card fade-in text-center">
    <div class="text-5xl mb-4">{score === questions.length ? '🎉' : score >= questions.length * 0.7 ? '👏' : '💪'}</div>
    <h3 class="text-2xl font-bold mb-2">
      {score} de {questions.length} correctas
    </h3>
    <p class="text-go-muted mb-4">
      {score === questions.length
        ? '¡Perfecto! Dominas este tema.'
        : score >= questions.length * 0.7
          ? '¡Muy bien! Buen dominio del tema.'
          : 'Sigue practicando, vas por buen camino.'}
    </p>
    <div class="w-full bg-go-darker rounded-full h-3 mb-4">
      <div
        class="h-3 rounded-full transition-all duration-1000 {score >= questions.length * 0.7 ? 'bg-go-success' : 'bg-go-warning'}"
        style="width: {(score / questions.length) * 100}%"
      ></div>
    </div>
    <div class="flex gap-2 justify-center flex-wrap">
      {#each answers as correct, idx}
        <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm {correct ? 'bg-go-success/20 text-go-success' : 'bg-go-danger/20 text-go-danger'}">
          {idx + 1}
        </span>
      {/each}
    </div>
  </div>
{/if}
