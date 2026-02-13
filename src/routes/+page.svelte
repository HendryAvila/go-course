<script lang="ts">
  import { base } from '$app/paths';
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';

  let userName = $state('');
  let showNameInput = $state(false);

  function saveName() {
    if (userName.trim()) {
      courseStore.setUserName(userName.trim());
      showNameInput = false;
    }
  }

  function isUnlocked(moduleId: number): boolean {
    let current = 1;
    courseStore.subscribe(s => current = s.currentModule)();
    return moduleId <= current;
  }

  function isCompleted(moduleId: number): boolean {
    let mods: Record<number, { completed: boolean }> = {};
    courseStore.subscribe(s => mods = s.modules)();
    return !!mods[moduleId]?.completed;
  }
</script>

<svelte:head>
  <title>Go Mastery — Curso Interactivo de Go</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-8">
  <!-- Hero -->
  <div class="text-center mb-12 fade-in">
    <span class="text-7xl block mb-4">🐹</span>
    <h1 class="text-4xl sm:text-5xl font-black mb-3">
      Go <span class="text-go-accent">Mastery</span>
    </h1>
    <p class="text-go-muted text-lg max-w-2xl mx-auto">
      De cero a concurrencia avanzada. Aprende Go de forma interactiva con
      playground en vivo, quizzes, escenarios de decisión y más.
    </p>
    <div class="flex items-center justify-center gap-4 mt-4 text-sm text-go-muted">
      <span>📚 12 módulos</span>
      <span>⏱️ ~5 horas</span>
      <span>🎮 100% interactivo</span>
    </div>
  </div>

  <!-- User name -->
  {#if !$courseStore.userName}
    {#if !showNameInput}
      <div class="text-center mb-8 fade-in">
        <button class="btn-secondary" onclick={() => showNameInput = true}>
          Ingresa tu nombre para el certificado
        </button>
      </div>
    {:else}
      <div class="max-w-md mx-auto mb-8 card fade-in">
        <label class="text-sm text-go-muted mb-2 block">Tu nombre (para el certificado)</label>
        <div class="flex gap-2">
          <input
            type="text"
            bind:value={userName}
            class="flex-1 bg-go-darker border border-go-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-go-accent"
            placeholder="Ej: María García"
            onkeydown={(e) => e.key === 'Enter' && saveName()}
          />
          <button class="btn-primary text-xs" onclick={saveName}>Guardar</button>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-center mb-8">
      <p class="text-go-muted text-sm">Bienvenido/a, <span class="text-go-accent font-semibold">{$courseStore.userName}</span></p>
    </div>
  {/if}

  <!-- Module grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each modules as mod}
      {@const unlocked = isUnlocked(mod.id)}
      {@const completed = isCompleted(mod.id)}
      {#if unlocked}
        <a
          href="{base}/modulo/{mod.id}"
          class="card-interactive group relative {completed ? 'border-go-success/30' : ''}"
        >
          {#if completed}
            <span class="absolute top-3 right-3 text-go-success text-lg">✓</span>
          {/if}
          <div class="flex items-start gap-3">
            <span class="text-3xl">{mod.icon}</span>
            <div class="flex-1">
              <p class="text-xs text-go-muted mb-1">Módulo {mod.id}</p>
              <h3 class="font-bold group-hover:text-go-accent transition-colors">{mod.title}</h3>
              <p class="text-sm text-go-muted mt-1">{mod.subtitle}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-go-muted">
                <span>⏱️ {mod.duration}</span>
                <span class="badge bg-go-accent/10 text-go-accent">{mod.type.split('+')[0].trim()}</span>
              </div>
            </div>
          </div>
        </a>
      {:else}
        <div class="card opacity-40 cursor-not-allowed relative">
          <span class="absolute top-3 right-3 text-go-muted">🔒</span>
          <div class="flex items-start gap-3">
            <span class="text-3xl grayscale">{mod.icon}</span>
            <div>
              <p class="text-xs text-go-muted mb-1">Módulo {mod.id}</p>
              <h3 class="font-bold">{mod.title}</h3>
              <p class="text-sm text-go-muted mt-1">{mod.subtitle}</p>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Badges preview -->
  <div class="mt-12 card fade-in">
    <h2 class="font-bold text-lg mb-4 flex items-center gap-2">
      <span>🏅</span> Badges ({$courseStore.badges.length} / {allBadges.length})
    </h2>
    <div class="flex flex-wrap gap-3">
      {#each allBadges as badge}
        {@const unlocked = $courseStore.badges.find(b => b.id === badge.id)}
        <div
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm {unlocked ? 'bg-go-accent/10 border border-go-accent/30' : 'bg-go-darker border border-go-border opacity-40'}"
          title={badge.description}
        >
          <span class={unlocked ? '' : 'grayscale'}>{badge.icon}</span>
          <span class={unlocked ? 'text-go-accent' : 'text-go-muted'}>{badge.name}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Results link -->
  <div class="mt-8 text-center">
    <a href="{base}/resultados" class="btn-secondary">
      📊 Ver Resultados y Certificado
    </a>
  </div>
</div>
