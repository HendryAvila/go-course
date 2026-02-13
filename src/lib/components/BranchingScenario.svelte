<script lang="ts">
  interface ScenarioChoice {
    text: string;
    nextId: string;
    points: number;
    feedback?: string;
  }

  interface ScenarioOutcome {
    title: string;
    description: string;
    score: number;
    maxScore: number;
    grade: 'excellent' | 'good' | 'needs-work' | 'critical';
    lessons: string[];
  }

  interface ScenarioNode {
    id: string;
    narrative: string;
    choices?: ScenarioChoice[];
    outcome?: ScenarioOutcome;
  }

  interface Props {
    nodes: Record<string, ScenarioNode>;
    startId: string;
    title: string;
    onComplete?: (score: number, maxScore: number) => void;
  }

  let { nodes, startId, title, onComplete }: Props = $props();

  let currentId = $state(startId);
  let totalPoints = $state(0);
  let history = $state<string[]>([startId]);
  let selectedChoice = $state<number | null>(null);
  let showFeedback = $state(false);
  let currentFeedback = $state('');

  let currentNode = $derived(nodes[currentId]);
  let isTerminal = $derived(!!currentNode?.outcome);

  function selectChoice(idx: number) {
    if (showFeedback) return;
    const choice = currentNode.choices![idx];
    selectedChoice = idx;
    totalPoints += choice.points;

    if (choice.feedback) {
      currentFeedback = choice.feedback;
      showFeedback = true;
    } else {
      navigate(choice.nextId);
    }
  }

  function navigate(nextId: string) {
    currentId = nextId;
    history = [...history, nextId];
    selectedChoice = null;
    showFeedback = false;
    currentFeedback = '';

    if (nodes[nextId]?.outcome) {
      onComplete?.(nodes[nextId].outcome!.score + totalPoints, nodes[nextId].outcome!.maxScore);
    }
  }

  function continueAfterFeedback() {
    const choice = currentNode.choices![selectedChoice!];
    navigate(choice.nextId);
  }

  const gradeColors: Record<string, string> = {
    excellent: 'text-go-success border-go-success',
    good: 'text-go-accent border-go-accent',
    'needs-work': 'text-go-warning border-go-warning',
    critical: 'text-go-danger border-go-danger',
  };

  const gradeLabels: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bien',
    'needs-work': 'Necesita Mejorar',
    critical: 'Crítico',
  };
</script>

<div class="card fade-in">
  <div class="flex items-center gap-3 mb-4">
    <span class="text-2xl">🎯</span>
    <div>
      <h3 class="font-bold text-lg">{title}</h3>
      <span class="text-go-muted text-sm">Paso {history.length} — Tus decisiones importan</span>
    </div>
  </div>

  {#if !isTerminal}
    <div class="bg-go-darker rounded-lg p-4 mb-4 border-l-4 border-go-accent">
      <p class="leading-relaxed">{currentNode.narrative}</p>
    </div>

    {#if showFeedback}
      <div class="bg-go-accent/10 border border-go-accent/30 rounded-lg p-4 mb-4 slide-in">
        <p class="text-sm">{currentFeedback}</p>
        <button class="btn-primary mt-3 text-xs" onclick={continueAfterFeedback}>
          Continuar
        </button>
      </div>
    {:else if currentNode.choices}
      <div class="space-y-3">
        {#each currentNode.choices as choice, idx}
          <button
            class="w-full text-left p-4 rounded-lg border border-go-border hover:border-go-accent/50 transition-all duration-200 cursor-pointer"
            onclick={() => selectChoice(idx)}
          >
            <div class="flex items-start gap-3">
              <span class="font-mono text-go-accent text-sm mt-0.5">{idx + 1}.</span>
              <span>{choice.text}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  {:else if currentNode.outcome}
    <div class="text-center">
      <div class="text-5xl mb-4">
        {currentNode.outcome.grade === 'excellent' ? '🏆' : currentNode.outcome.grade === 'good' ? '👏' : currentNode.outcome.grade === 'needs-work' ? '📚' : '⚠️'}
      </div>
      <h4 class="text-xl font-bold mb-2 {gradeColors[currentNode.outcome.grade]}">
        {currentNode.outcome.title}
      </h4>
      <p class="badge mb-4 {gradeColors[currentNode.outcome.grade]} border">
        {gradeLabels[currentNode.outcome.grade]}
      </p>
      <p class="text-go-muted mb-6">{currentNode.outcome.description}</p>

      <div class="text-left">
        <h5 class="font-semibold mb-2">Lecciones aprendidas:</h5>
        <ul class="space-y-2">
          {#each currentNode.outcome.lessons as lesson}
            <li class="flex items-start gap-2 text-sm text-go-muted">
              <span class="text-go-accent mt-0.5">▸</span>
              <span>{lesson}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div>
