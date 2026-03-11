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
    /** Optional: 'code' questions show monospace styling */
    type?: 'knowledge' | 'code';
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
  let answers = $state<(number | null)[]>([]);
  let correctness = $state<boolean[]>([]);

  // Retry mode
  let retryMode = $state(false);
  let retryIndices = $state<number[]>([]);
  let retryCurrentIdx = $state(0);
  let retryScore = $state(0);
  let retryFinished = $state(false);
  let retryAnswers = $state<(number | null)[]>([]);
  let retryCorrectness = $state<boolean[]>([]);

  // Review mode
  let reviewMode = $state(false);

  let activeQuestion = $derived(
    retryMode
      ? questions[retryIndices[retryCurrentIdx]]
      : questions[currentIndex]
  );

  let activeProgress = $derived(
    retryMode
      ? `${retryCurrentIdx + 1} de ${retryIndices.length}`
      : `${currentIndex + 1} de ${questions.length}`
  );

  let activeProgressPercent = $derived(
    retryMode
      ? (retryCurrentIdx / retryIndices.length) * 100
      : (currentIndex / questions.length) * 100
  );

  function selectOption(idx: number) {
    if (answered) return;
    selectedOption = idx;
    answered = true;

    const isCorrect = activeQuestion.options[idx].correct;

    if (retryMode) {
      if (isCorrect) retryScore++;
      retryAnswers = [...retryAnswers, idx];
      retryCorrectness = [...retryCorrectness, isCorrect];
    } else {
      if (isCorrect) score++;
      answers = [...answers, idx];
      correctness = [...correctness, isCorrect];
    }
  }

  function nextQuestion() {
    if (retryMode) {
      if (retryCurrentIdx < retryIndices.length - 1) {
        retryCurrentIdx++;
        selectedOption = null;
        answered = false;
      } else {
        retryFinished = true;
        // Final score = max(original, original + retry improvements)
        const bestScore = Math.max(score, score + retryScore - retryIndices.length + retryCorrectness.filter(Boolean).length);
        onComplete?.(bestScore, questions.length);
      }
    } else {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        selectedOption = null;
        answered = false;
      } else {
        finished = true;
        onComplete?.(score, questions.length);
      }
    }
  }

  function startRetry() {
    // Only retry incorrect questions
    retryIndices = correctness
      .map((c, i) => ({ correct: c, index: i }))
      .filter(({ correct }) => !correct)
      .map(({ index }) => index);

    if (retryIndices.length === 0) return;

    retryMode = true;
    retryCurrentIdx = 0;
    retryScore = 0;
    retryFinished = false;
    retryAnswers = [];
    retryCorrectness = [];
    selectedOption = null;
    answered = false;
  }

  function toggleReview() {
    reviewMode = !reviewMode;
  }

  function getOptionClass(idx: number): string {
    if (!answered) return 'border-go-border hover:border-go-accent/50';
    const opt = activeQuestion.options[idx];
    if (opt.correct) return 'border-go-success bg-go-success/10';
    if (idx === selectedOption && !opt.correct) return 'border-go-danger bg-go-danger/10';
    return 'border-go-border opacity-50';
  }

  function getReviewOptionClass(qIdx: number, oIdx: number): string {
    const q = questions[qIdx];
    const userAnswer = answers[qIdx];
    const opt = q.options[oIdx];
    if (opt.correct) return 'border-go-success bg-go-success/10';
    if (oIdx === userAnswer && !opt.correct) return 'border-go-danger bg-go-danger/10';
    return 'border-go-border opacity-30';
  }

  let incorrectCount = $derived(correctness.filter(c => !c).length);
  let finalScore = $derived(
    retryFinished
      ? Math.max(score, score + retryCorrectness.filter(Boolean).length - retryIndices.length + retryScore)
      : score
  );
</script>

{#if reviewMode}
  <!-- Review Mode: show ALL questions with answers -->
  <div class="card fade-in">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-bold text-lg">Revisión Completa</h3>
      <button class="btn-secondary text-xs" onclick={toggleReview}>
        ← Volver
      </button>
    </div>

    <div class="space-y-6">
      {#each questions as q, qIdx}
        <div class="border-b border-go-border pb-4 last:border-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs {correctness[qIdx] ? 'bg-go-success/20 text-go-success' : 'bg-go-danger/20 text-go-danger'}">
              {qIdx + 1}
            </span>
            <h4 class="font-semibold text-sm {q.type === 'code' ? 'font-mono' : ''}">{q.question}</h4>
          </div>
          <div class="space-y-2 ml-8">
            {#each q.options as opt, oIdx}
              <div class="p-2 rounded-lg border text-sm {getReviewOptionClass(qIdx, oIdx)}">
                <div class="flex items-start gap-2">
                  <span class="font-mono text-go-muted text-xs mt-0.5">{String.fromCharCode(65 + oIdx)}.</span>
                  <div>
                    <span class={q.type === 'code' ? 'font-mono' : ''}>{opt.text}</span>
                    {#if opt.correct || oIdx === answers[qIdx]}
                      <p class="text-xs text-go-muted mt-1">{opt.explanation}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
            {#if q.source}
              <a
                href={q.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-go-muted hover:text-go-accent transition-colors"
              >
                Fuente: {q.source}
              </a>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

{:else if (!finished && !retryMode) || (retryMode && !retryFinished)}
  <!-- Active Quiz -->
  <div class="card fade-in">
    <div class="flex items-center justify-between mb-4">
      <span class="text-go-muted text-sm">
        {retryMode ? '🔄 Reintento — ' : ''}Pregunta {activeProgress}
      </span>
      <span class="badge bg-go-accent/20 text-go-accent">
        {retryMode ? retryScore : score} correctas
      </span>
    </div>

    <div class="w-full bg-go-darker rounded-full h-1.5 mb-6">
      <div
        class="bg-go-accent h-1.5 rounded-full transition-all duration-500"
        style="width: {activeProgressPercent}%"
      ></div>
    </div>

    <h3 class="text-lg font-bold mb-4 {activeQuestion.type === 'code' ? 'font-mono text-base' : ''}">
      {activeQuestion.question}
    </h3>

    <div class="space-y-3">
      {#each activeQuestion.options as opt, idx}
        <button
          class="w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer {getOptionClass(idx)}"
          onclick={() => selectOption(idx)}
          disabled={answered}
        >
          <div class="flex items-start gap-3">
            <span class="font-mono text-go-muted text-sm mt-0.5">{String.fromCharCode(65 + idx)}.</span>
            <span class={activeQuestion.type === 'code' ? 'font-mono text-sm' : ''}>{opt.text}</span>
          </div>
          {#if answered && (idx === selectedOption || opt.correct)}
            <p class="mt-2 text-sm text-go-muted pl-6">{opt.explanation}</p>
          {/if}
        </button>
      {/each}
    </div>

    {#if answered}
      <div class="mt-4 flex items-center justify-between">
        {#if activeQuestion.source}
          <a
            href={activeQuestion.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-go-muted hover:text-go-accent transition-colors"
          >
            Fuente: {activeQuestion.source}
          </a>
        {:else}
          <span></span>
        {/if}
        <button class="btn-primary" onclick={nextQuestion}>
          {retryMode
            ? (retryCurrentIdx < retryIndices.length - 1 ? 'Siguiente' : 'Ver Resultado')
            : (currentIndex < questions.length - 1 ? 'Siguiente' : 'Ver Resultado')}
        </button>
      </div>
    {/if}
  </div>

{:else}
  <!-- Results -->
  <div class="card fade-in text-center">
    <div class="text-5xl mb-4">
      {finalScore === questions.length ? '🎉' : finalScore >= questions.length * 0.7 ? '👏' : '💪'}
    </div>
    <h3 class="text-2xl font-bold mb-2">
      {finalScore} de {questions.length} correctas
    </h3>
    <p class="text-go-muted mb-4">
      {finalScore === questions.length
        ? '¡Perfecto! Dominas este tema.'
        : finalScore >= questions.length * 0.7
          ? '¡Muy bien! Buen dominio del tema.'
          : 'Sigue practicando, vas por buen camino.'}
    </p>
    <div class="w-full bg-go-darker rounded-full h-3 mb-4">
      <div
        class="h-3 rounded-full transition-all duration-1000 {finalScore >= questions.length * 0.7 ? 'bg-go-success' : 'bg-go-warning'}"
        style="width: {(finalScore / questions.length) * 100}%"
      ></div>
    </div>
    <div class="flex gap-2 justify-center flex-wrap mb-4">
      {#each correctness as correct, idx}
        <span class="w-8 h-8 rounded-full flex items-center justify-center text-sm {correct ? 'bg-go-success/20 text-go-success' : 'bg-go-danger/20 text-go-danger'}">
          {idx + 1}
        </span>
      {/each}
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 justify-center flex-wrap">
      {#if incorrectCount > 0 && !retryFinished}
        <button class="btn-primary text-sm" onclick={startRetry}>
          🔄 Reintentar incorrectas ({incorrectCount})
        </button>
      {/if}
      <button class="btn-secondary text-sm" onclick={toggleReview}>
        📋 Revisar respuestas
      </button>
    </div>
  </div>
{/if}
