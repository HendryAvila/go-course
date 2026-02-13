<script lang="ts">
  import { courseStore, allBadges, totalModules } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';

  let showResetConfirm = $state(false);
  let showConfetti = $state(false);

  let completedCount = $derived(Object.values($courseStore.modules).filter(m => m.completed).length);
  let allCompleted = $derived(completedCount === totalModules);
  let totalMaxScore = $derived(Object.values($courseStore.modules).reduce((acc, m) => acc + m.maxScore, 0));

  const competencies = [
    { name: 'Fundamentos del Lenguaje', modules: [1, 2, 3, 4], icon: '🧱' },
    { name: 'Estructuras de Datos y Tipos', modules: [5, 6, 7], icon: '📦' },
    { name: 'Manejo de Errores y Organización', modules: [8, 9], icon: '🛡️' },
    { name: 'Concurrencia', modules: [10, 11], icon: '⚡' },
    { name: 'APIs y Testing', modules: [12], icon: '🌐' },
  ];

  const resources = [
    { name: 'The Go Programming Language (Libro)', url: 'https://www.gopl.io/', description: 'El libro definitivo de Go por Donovan & Kernighan' },
    { name: 'Go by Example', url: 'https://gobyexample.com/', description: 'Referencia práctica con ejemplos concisos' },
    { name: 'Effective Go', url: 'https://go.dev/doc/effective_go', description: 'Guía oficial de estilo y mejores prácticas' },
    { name: 'Go Blog', url: 'https://go.dev/blog/', description: 'Posts oficiales sobre features y patterns' },
    { name: 'Go Wiki: Common Mistakes', url: 'https://go.dev/wiki/CommonMistakes', description: 'Errores comunes y cómo evitarlos' },
    { name: 'Awesome Go', url: 'https://github.com/avelino/awesome-go', description: 'Lista curada de paquetes y recursos de Go' },
  ];

  function getCompetencyScore(moduleIds: number[]): number {
    let total = 0;
    let max = 0;
    for (const id of moduleIds) {
      const mod = $courseStore.modules[id];
      if (mod) {
        total += mod.score;
        max += mod.maxScore;
      }
    }
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }

  function resetCourse() {
    courseStore.reset();
    showResetConfirm = false;
  }

  $effect(() => {
    if (allCompleted && browser && !showConfetti) {
      showConfetti = true;
      import('js-confetti').then(({ default: JSConfetti }) => {
        const confetti = new JSConfetti();
        confetti.addConfetti({ emojis: ['🐹', '⚡', '🏆', '🎉'] });
      });
    }
  });
</script>

<svelte:head>
  <title>Resultados — Go Mastery</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <div class="text-center mb-8 fade-in">
    <span class="text-5xl">{allCompleted ? '🏆' : '📊'}</span>
    <h1 class="text-3xl font-black mt-2">
      {allCompleted ? '¡Felicidades, Go Master!' : 'Tu Progreso'}
    </h1>
    <p class="text-go-muted mt-1">
      {completedCount} de {totalModules} módulos completados
    </p>
  </div>

  <!-- Overall stats -->
  <div class="grid sm:grid-cols-3 gap-4 mb-8">
    <div class="card text-center">
      <p class="text-3xl font-black text-go-accent">{completedCount}/{totalModules}</p>
      <p class="text-sm text-go-muted">Módulos</p>
    </div>
    <div class="card text-center">
      <p class="text-3xl font-black text-go-accent">{$courseStore.totalScore}</p>
      <p class="text-sm text-go-muted">Puntos Totales</p>
    </div>
    <div class="card text-center">
      <p class="text-3xl font-black text-go-accent">{$courseStore.badges.length}/{allBadges.length}</p>
      <p class="text-sm text-go-muted">Badges</p>
    </div>
  </div>

  <!-- Per-module breakdown -->
  <div class="card mb-8 fade-in">
    <h2 class="font-bold text-lg mb-4">Desglose por Módulo</h2>
    <div class="space-y-3">
      {#each modules as mod}
        {@const progress = $courseStore.modules[mod.id]}
        <div class="flex items-center gap-3">
          <span class="text-xl w-8">{mod.icon}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium">{mod.title}</span>
              {#if progress?.completed}
                <span class="text-xs text-go-success">{progress.score}/{progress.maxScore}</span>
              {:else}
                <span class="text-xs text-go-muted">Pendiente</span>
              {/if}
            </div>
            <div class="w-full bg-go-darker rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-500 {progress?.completed ? 'bg-go-success' : 'bg-go-border'}"
                style="width: {progress?.completed && progress.maxScore > 0 ? (progress.score / progress.maxScore) * 100 : progress?.completed ? 100 : 0}%"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Competencies -->
  <div class="card mb-8 fade-in">
    <h2 class="font-bold text-lg mb-4">Competencias</h2>
    <div class="space-y-4">
      {#each competencies as comp}
        {@const score = getCompetencyScore(comp.modules)}
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm flex items-center gap-2">
              <span>{comp.icon}</span>
              {comp.name}
            </span>
            <span class="text-sm font-mono {score >= 70 ? 'text-go-success' : score > 0 ? 'text-go-warning' : 'text-go-muted'}">{score}%</span>
          </div>
          <div class="w-full bg-go-darker rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-700 {score >= 70 ? 'bg-go-success' : score > 0 ? 'bg-go-warning' : 'bg-go-border'}"
              style="width: {score}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Badge gallery -->
  <div class="card mb-8 fade-in">
    <h2 class="font-bold text-lg mb-4">Galería de Badges</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {#each allBadges as badge}
        {@const unlocked = $courseStore.badges.find(b => b.id === badge.id)}
        <div class="text-center p-3 rounded-lg {unlocked ? 'bg-go-accent/10 border border-go-accent/30' : 'bg-go-darker border border-go-border opacity-30'}">
          <span class="text-3xl block mb-1 {unlocked ? '' : 'grayscale'}">{badge.icon}</span>
          <p class="text-xs font-semibold {unlocked ? 'text-go-accent' : 'text-go-muted'}">{badge.name}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Certificate -->
  {#if allCompleted && $courseStore.userName}
    <div class="card mb-8 fade-in text-center border-go-accent glow-accent">
      <span class="text-5xl block mb-3">📜</span>
      <h2 class="text-2xl font-black mb-1">Certificado de Finalización</h2>
      <p class="text-go-muted mb-4">Se certifica que</p>
      <p class="text-3xl font-black text-go-accent mb-4">{$courseStore.userName}</p>
      <p class="text-go-muted mb-2">Ha completado satisfactoriamente el curso</p>
      <p class="text-xl font-bold mb-4">Go Mastery — De Cero a Concurrencia Avanzada</p>
      <div class="flex items-center justify-center gap-6 text-sm text-go-muted mb-4">
        <span>{totalModules} módulos completados</span>
        <span>{$courseStore.totalScore} puntos</span>
        <span>{$courseStore.badges.length} badges</span>
      </div>
      <p class="text-xs text-go-muted">
        Completado el {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  {:else if allCompleted}
    <div class="card mb-8 text-center">
      <p class="text-go-muted">Ingresa tu nombre en la página de inicio para generar tu certificado.</p>
      <a href="{base}/" class="btn-primary mt-3 inline-flex">Ir al Inicio</a>
    </div>
  {/if}

  <!-- Further learning -->
  <div class="card mb-8 fade-in">
    <h2 class="font-bold text-lg mb-4">📚 Seguir Aprendiendo</h2>
    <div class="grid sm:grid-cols-2 gap-3">
      {#each resources as res}
        <a
          href={res.url}
          target="_blank"
          rel="noopener noreferrer"
          class="p-3 rounded-lg border border-go-border hover:border-go-accent/50 transition-colors"
        >
          <h4 class="font-semibold text-sm hover:text-go-accent transition-colors">{res.name}</h4>
          <p class="text-xs text-go-muted mt-1">{res.description}</p>
        </a>
      {/each}
    </div>
  </div>

  <!-- Reset -->
  <div class="text-center">
    {#if !showResetConfirm}
      <button class="btn-danger" onclick={() => showResetConfirm = true}>
        🔄 Reiniciar Curso
      </button>
    {:else}
      <div class="card inline-block">
        <p class="text-sm mb-3">¿Seguro? Se borrará todo tu progreso.</p>
        <div class="flex gap-2 justify-center">
          <button class="btn-danger text-xs" onclick={resetCourse}>Sí, reiniciar</button>
          <button class="btn-secondary text-xs" onclick={() => showResetConfirm = false}>Cancelar</button>
        </div>
      </div>
    {/if}
  </div>
</div>
